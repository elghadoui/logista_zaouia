using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Data;
namespace Vitasouss;

// Read-only analytical queries are isolated from the existing operational services.
public sealed class AnalyticsService(Connections connections,PermissionService permissions,ILogger<AnalyticsService> logger)
{
    public async Task<AnalyticsSource[]> Read(int id,string module,AnalyticsQuery q,ClaimsPrincipal user,bool export=false,CancellationToken ct=default)
    {
        if(module is not ("receptions" or "caisserie"))throw new RuleException("Tableau de bord inconnu.",404);
        await permissions.Demand(user,module);
        if(q.Page<1 || q.Page>400 || (q.Search?.Length??0)>120)throw new RuleException("Recherche ou page hors limites (400 pages maximum ; affinez la période).");
        if(q.Movement is not (null or "" or "E" or "S"))throw new RuleException("Mouvement inconnu.");
        _=AnalyticsPeriod.Resolve(q,new(new(2000,1,1),new(2000,12,31),"Validation"),AnalyticsPeriod.Today());
        _=Order([],q);
        var primary=await connections.Resolve(id,user);
        if(primary.Station is not ("ZAOUIA" or "DIAF"))throw new RuleException("Station non prise en charge.",409);
        var contexts=new List<ContextInfo>{primary};
        // Resolve ALL authorizations before reading any source; never downgrade a 403 to a partial total.
        if(q.OtherContext is int other){var c=await connections.Resolve(other,user);if(c.Station==primary.Station || c.Station is not ("ZAOUIA" or "DIAF"))throw new RuleException("La consolidation requiert l'autre station.",409);contexts.Add(c);}
        var previous=new List<ContextInfo>();
        if(q.PreviousContext is int pc){var c=await connections.Resolve(pc,user);if(c.Station!=primary.Station||!c.ReadOnly)throw new RuleException("Archive de la même station requise.",409);previous.Add(c);}
        if(q.PreviousOtherContext is int po){var c=await connections.Resolve(po,user);if(contexts.Count!=2||previous.Count!=1||c.Station!=contexts[1].Station||!c.ReadOnly)throw new RuleException("Archive de la deuxième station requise.",409);previous.Add(c);}
        if(previous.Count>0&&contexts.Count==2&&previous.Count!=2)throw new RuleException("La comparaison consolidée requiert les deux archives autorisées.",409);
        var result=new List<AnalyticsSource>();
        foreach(var c in contexts)result.Add(await Source(c,module,q,null,null,export,ct));
        var available=result.Where(s=>s.Available).ToArray();
        if(available.Length==2&&available[0].Campaign!=available[1].Campaign)throw new RuleException("Campagnes incompatibles : début, fin ou libellé différents.",409);
        // For comparison, offsets from campaign start preserve the same elapsed days. Weekly charts remain ISO in each source.
        for(var i=0;i<previous.Count;i++)
        {
            if(!result[i].Available){result.Add(new(){ContextId=previous[i].Id,Station=previous[i].Station,Warnings=["Comparaison indisponible : campagne courante inaccessible."]});continue;}
            result.Add(await Source(previous[i],module,q,result[i].Campaign,result[i].Period,export,ct));
        }
        if(previous.Count==2&&result.Skip(2).All(s=>s.Available)&&result[2].Campaign!=result[3].Campaign)throw new RuleException("Les archives des deux stations portent sur des campagnes différentes.",409);
        return result.ToArray();
    }
    public static IOrderedEnumerable<AnalyticsDetail> Order(IEnumerable<AnalyticsDetail> rows,AnalyticsQuery q)
    {
        Func<AnalyticsDetail,IComparable?> key=q.Sort switch {"date"=>r=>r.Date,"number"=>r=>r.Number,"net"=>r=>r.NetKg,"producer"=>r=>r.Producer,"variety"=>r=>r.Variety,"quantity"=>r=>r.Quantity,_=>throw new RuleException("Tri inconnu.")};
        var comparer=Comparer<IComparable?>.Create((a,b)=>a is string x&&b is string y?StringComparer.Ordinal.Compare(x,y):a is null?(b is null?0:-1):a.CompareTo(b));
        var sorted=q.Asc?rows.OrderBy(key,comparer):rows.OrderByDescending(key,comparer);
        return sorted.ThenBy(r=>r.Station,StringComparer.Ordinal).ThenBy(r=>r.ContextId).ThenBy(r=>r.Number);
    }
    public static object Response(AnalyticsSource[] sources,AnalyticsQuery q)
    {
        var n=q.OtherContext.HasValue?2:1;
        var current=sources.Take(n).ToArray();var prior=sources.Skip(n).ToArray();
        var complete=current.All(s=>s.Available&&s.Metrics.MissingNet==0&&s.Metrics.MissingDate==0);
        var kg=current.Where(s=>s.Available).Sum(s=>s.Metrics.SelectedKg??0);
        var old=prior.Where(s=>s.Available).Sum(s=>s.Metrics.SelectedKg??0);
        return new {sources=sources.Select(s=>new{s.ContextId,s.Station,s.Available,s.Campaign,s.Period,s.Metrics,s.Total,s.Daily,s.Weekly,s.Varieties,s.Producers,s.Movements,s.CrateFlows,s.Options,s.Estimates,s.Warnings}),complete,observedKg=kg,totalKg=complete?(decimal?)kg:null,
            evolution=complete&&prior.Length==n&&prior.All(s=>s.Available&&s.Metrics.MissingNet==0&&s.Metrics.MissingDate==0)&&old!=0?(decimal?)((kg-old)/old*100):null,
            rows=Order(current.Where(s=>s.Available).SelectMany(s=>s.Rows),q).Skip((q.Page-1)*25).Take(25),page=q.Page,pageSize=25,total=current.Where(s=>s.Available).Sum(s=>s.Total),
            estimateConsolidationAvailable=n==1,
            warnings=n==2?new[]{"Producteurs et variétés comptés par identité station/contexte/code. Aucun rapprochement automatique des personnes ou des parcelles entre stations. Estimation consolidée indisponible sans identité interstation fiable."}:Array.Empty<string>()};
    }
    public async Task<CrateProducerSituationPage> ProducerSituation(int id,AnalyticsQuery q,ClaimsPrincipal user,CancellationToken ct=default,bool export=false)
    {
        if(q.Page<1||q.Page>400||(q.Search?.Length??0)>120)throw new RuleException("Recherche ou page hors limites (400 pages maximum ; affinez la période).");
        var requestedSort=q.Sort=="date"?"exits":q.Sort;
        if(requestedSort is not ("producer" or "entries" or "exits" or "balance" or "palletEntries" or "palletExits" or "palletBalance"))throw new RuleException("Tri de situation inconnu.");
        // The balance always requires both E and S; the movement filter is deliberately excluded.
        var readQuery=new AnalyticsQuery{OtherContext=q.OtherContext,Period=q.Period,From=q.From,To=q.To,Category=q.Category,Product=q.Product,Variety=q.Variety,Producer=q.Producer,Orchard=q.Orchard,CrateType=q.CrateType,Search=null,Sort="date",Asc=false,Page=1};
        var sources=await Read(id,"caisserie",readQuery,user,ct:ct);
        var n=q.OtherContext.HasValue?2:1;
        var current=sources.Take(n).ToArray();
        var complete=current.Length==n&&current.All(s=>s.Available);
        if(export&&!complete)throw new RuleException("Export refusé : une source est indisponible et la situation serait incomplète.",409);
        var all=current.Where(s=>s.Available).SelectMany(s=>(s.CrateFlows??[]).Where(f=>f.Scope=="producer").Select(f=>new CrateProducerSituation(s.ContextId,s.Station,f.ProducerId,f.ProducerLabel is {Length:>0}?f.ProducerLabel:"Producteur inconnu",f.CrateType,f.Crate,f.Entries,f.Exits,f.ProducerMovementBalance,f.EntriesPallets,f.ExitsPallets,f.PalletMovementBalance,f.Invalid,f.InvalidPallets,f.Incoherent)));
        IEnumerable<CrateProducerSituation> filtered=all;
        if(!string.IsNullOrWhiteSpace(q.Search))
        {
            var text=q.Search.Trim();
            filtered=filtered.Where(r=>r.Producer.Contains(text,StringComparison.CurrentCultureIgnoreCase)||(r.ProducerId?.ToString(System.Globalization.CultureInfo.InvariantCulture).Contains(text,StringComparison.OrdinalIgnoreCase)??false));
        }
        if(filtered.Count()>20000)throw new RuleException("Plus de 20 000 lignes de situation : réduisez la période ou les filtres.",413);
        var rows=filtered.ToArray();
        var ordered=requestedSort switch {
            "entries"=>q.Asc?rows.OrderBy(x=>x.Entries):rows.OrderByDescending(x=>x.Entries),
            "exits"=>q.Asc?rows.OrderBy(x=>x.Exits):rows.OrderByDescending(x=>x.Exits),
            "balance"=>q.Asc?rows.OrderBy(x=>x.CrateBalance):rows.OrderByDescending(x=>x.CrateBalance),
            "palletEntries"=>q.Asc?rows.OrderBy(x=>x.EntriesPallets):rows.OrderByDescending(x=>x.EntriesPallets),
            "palletExits"=>q.Asc?rows.OrderBy(x=>x.ExitsPallets):rows.OrderByDescending(x=>x.ExitsPallets),
            "palletBalance"=>q.Asc?rows.OrderBy(x=>x.PalletBalance):rows.OrderByDescending(x=>x.PalletBalance),
            _=>q.Asc?rows.OrderBy(x=>x.Producer,StringComparer.CurrentCultureIgnoreCase):rows.OrderByDescending(x=>x.Producer,StringComparer.CurrentCultureIgnoreCase)
        };
        ordered=ordered.ThenBy(x=>x.Station,StringComparer.Ordinal).ThenBy(x=>x.ContextId).ThenBy(x=>x.CrateType).ThenBy(x=>x.ProducerId);
        var totals=rows.GroupBy(x=>(x.ContextId,x.Station,x.CrateType,x.Crate)).Select(g=>new CrateProducerTotal(g.Key.ContextId,g.Key.Station,g.Key.CrateType,g.Key.Crate,g.Sum(x=>x.Entries),g.Sum(x=>x.Exits),g.Any(x=>x.CrateBalance is null)?null:g.Sum(x=>x.CrateBalance!.Value),g.Sum(x=>x.EntriesPallets),g.Sum(x=>x.ExitsPallets),g.Any(x=>x.PalletBalance is null)?null:g.Sum(x=>x.PalletBalance!.Value),g.Sum(x=>x.Invalid),g.Sum(x=>x.InvalidPallets),g.Sum(x=>x.Incoherent))).OrderBy(x=>x.Station,StringComparer.Ordinal).ThenBy(x=>x.CrateType).ToArray();
        var warnings=current.SelectMany(s=>s.Warnings).Distinct(StringComparer.Ordinal).ToArray();
        return new(export?ordered.ToArray():ordered.Skip((q.Page-1)*25).Take(25).ToArray(),totals,export?1:q.Page,export?rows.Length:25,rows.Length,complete,warnings);
    }
    private async Task<AnalyticsSource> Source(ContextInfo c,string module,AnalyticsQuery q,AnalyticsCampaign? alignCampaign,AnalyticsPeriod? alignPeriod,bool export,CancellationToken ct)
    {
        var s=new AnalyticsSource{ContextId=c.Id,Station=c.Station};
        using var budget=CancellationTokenSource.CreateLinkedTokenSource(ct);
        budget.CancelAfter(TimeSpan.FromSeconds(30));
        var queryToken=budget.Token;
        try
        {
            if(c.LocalRefsta is null)throw new RuleException("Code local de station non configuré : aucun cumul implicite de toutes les stations.",409);
            await using var db=await connections.Business(c);
            await db.ExecuteAsync(new CommandDefinition("SET TRANSACTION READ ONLY",cancellationToken:queryToken));
            await using var tx=await db.BeginTransactionAsync(IsolationLevel.RepeatableRead,queryToken);
            var queryIndex=0;
            async Task<T[]> Query<T>(string sql,object? args=null){queryIndex++;try{return (await db.QueryAsync<T>(new CommandDefinition(sql,args,tx,commandTimeout:20,cancellationToken:queryToken))).ToArray();}catch(MySqlException ex){logger.LogWarning("Analytics query {Query} failed with code {Code}",queryIndex,ex.Number);throw;}}
            async Task<long> Count(string sql,object? args=null)=>await db.ExecuteScalarAsync<long>(new CommandDefinition(sql,args,tx,commandTimeout:20,cancellationToken:queryToken));
            var names=await Query<string>("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE'");
            var required=new[]{"entreprise","reception","caisserie","variete","verger","adherent","culture","grpvar","typecaisse"};
            if(required.Any(n=>!names.Contains(n)))throw new RuleException("Tables analytiques manquantes dans cet exercice.",409);
            // Verify uniqueness of dimensions before joining, including historical schemas without formal keys.
            foreach(var pair in new[]{("verger","refver"),("adherent","refadh"),("variete","codvar"),("culture","codcul"),("grpvar","codgrv"),("typecaisse","typcai"),(module=="receptions"?"reception":"caisserie",module=="receptions"?"numrec":"numcai")})
                if(await Count($"SELECT COUNT(*) FROM (SELECT `{pair.Item2}` FROM `{pair.Item1}` GROUP BY `{pair.Item2}` HAVING COUNT(*)>1 OR `{pair.Item2}` IS NULL) a")>0)throw new RuleException("Identifiants ambigus : agrégation suspendue pour éviter les doublons.",409);
            var campaigns=await Query<(string? Start,string? End,string? Label)>("SELECT DATE_FORMAT(dtDebut,'%Y-%m-%d') Start,DATE_FORMAT(dtFin,'%Y-%m-%d') End,camp Label FROM entreprise WHERE lier='1'");
            if(campaigns.Length!=1 || !DateTime.TryParseExact(campaigns[0].Start,"yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture,System.Globalization.DateTimeStyles.None,out var campaignStart)||!DateTime.TryParseExact(campaigns[0].End,"yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture,System.Globalization.DateTimeStyles.None,out var campaignEnd)||campaignStart.Year<1900||campaignEnd<campaignStart)throw new RuleException("Dates de campagne absentes ou ambiguës dans entreprise.",409);
            s.Campaign=new(campaignStart,campaignEnd,campaigns[0].Label??"");
            var today=AnalyticsPeriod.Today();
            var currentPeriod=AnalyticsPeriod.Resolve(q,s.Campaign,today);
            if(alignCampaign is null&&q.PreviousContext.HasValue&&currentPeriod.To>today)currentPeriod=currentPeriod with{To=today};
            if(alignCampaign is not null&&alignPeriod is not null)
            {
                // Campaign-to-date ends today even when the full campaign preset is selected.
                var bounded=alignPeriod with {To=alignPeriod.To<today?alignPeriod.To:today};
                currentPeriod=AnalyticsPeriod.Align(bounded,alignCampaign,s.Campaign);
                s.Warnings.Add("Archive alignée par jours écoulés depuis le début de campagne, jusqu'à la date courante au maximum. Semaines ISO regroupées dans chaque campagne ; leur numéro n'est pas une clé d'alignement.");
            }
            s.Period=currentPeriod;
            var receipt=module=="receptions";var table=receipt?"reception":"caisserie";var date=receipt?"dterec":"dtecai";var number=receipt?"numrec":"numcai";
            var producer=receipt?"o.refadh":"e.refadh";
            var joins=$" FROM `{table}` e LEFT JOIN verger o ON o.refver=e.refver LEFT JOIN adherent a ON a.refadh={producer} LEFT JOIN variete v ON v.codvar=e.codvar LEFT JOIN culture k ON k.codcul=v.codcul LEFT JOIN grpvar g ON g.codgrv=v.codgrv LEFT JOIN typecaisse t ON t.typcai=e.typcai ";
            var p=new DynamicParameters(new{station=c.LocalRefsta,from=currentPeriod.From,to=currentPeriod.To.AddDays(1),start=s.Campaign.Start,end=s.Campaign.End.AddDays(1),today,tomorrow=today.AddDays(1),yesterday=today.AddDays(-1),seven=today.AddDays(-6),month=new DateTime(today.Year,today.Month,1),previousFrom=currentPeriod.From.AddDays(-(currentPeriod.To-currentPeriod.From).Days-1),previousTo=currentPeriod.From});
            var filters=new List<string>{"e.refsta=@station"};
            void Filter(string column,string name,int? value){if(value.HasValue){filters.Add(column+"=@"+name);p.Add(name,value);}}
            Filter("k.codcul","category",q.Category);Filter("g.codgrv","product",q.Product);Filter("v.codvar","variety",q.Variety);Filter(producer,"producer",q.Producer);Filter("e.refver","orchard",q.Orchard);Filter("e.typcai","crateType",q.CrateType);
            if(!receipt&&!string.IsNullOrEmpty(q.Movement)){filters.Add("e.typmvt=@movement");p.Add("movement",q.Movement);}
            if(!string.IsNullOrWhiteSpace(q.Search)){filters.Add($"(a.nomadh LIKE @search OR o.nomver LIKE @search OR v.nomvar LIKE @search OR CAST(e.`{number}` AS CHAR) LIKE @search)");p.Add("search","%"+q.Search+"%");}
            var basis=" WHERE "+string.Join(" AND ",filters);
            var campaign=$" AND e.`{date}`>=@start AND e.`{date}`<@end";
            var selected=$" AND e.`{date}`>=@from AND e.`{date}`<@to";
            var within=joins+basis+campaign+selected;
            var num=receipt?"e.netrec":"NULL";
            if(receipt)
            {
                // Header only: never join reception_d or palbrut in financial/net totals.
                var inSelected=$"e.{date}>=@from AND e.{date}<@to";
                string Sum(string pred)=>$"SUM(CASE WHEN {inSelected} AND {pred} THEN e.netrec ELSE 0 END)";
                s.Metrics=(await Query<AnalyticsMetrics>($"SELECT {Sum("1=1")} SelectedKg,{Sum("e.dterec>=@today AND e.dterec<@tomorrow")} TodayKg,{Sum("e.dterec>=@yesterday AND e.dterec<@today")} YesterdayKg,{Sum("e.dterec>=@seven AND e.dterec<@tomorrow")} SevenKg,{Sum("e.dterec>=@month AND e.dterec<@tomorrow")} MonthKg,SUM(e.netrec) CampaignKg,SUM(CASE WHEN e.dterec>=@previousFrom AND e.dterec<@previousTo THEN e.netrec ELSE 0 END) PreviousKg,SUM(CASE WHEN {inSelected} THEN 1 ELSE 0 END) Lots,COUNT(DISTINCT CASE WHEN {inSelected} THEN {producer} END) Producers,COUNT(DISTINCT CASE WHEN {inSelected} THEN e.codvar END) Varieties,SUM(CASE WHEN {inSelected} AND e.netrec IS NULL THEN 1 ELSE 0 END) MissingNet"+joins+basis+campaign,p))[0];
                s.Metrics.MissingDate=await Count("SELECT COUNT(*)"+joins+basis+" AND (e.dterec IS NULL OR e.dterec=0)",p);
                s.Metrics.CampaignKg=await db.ExecuteScalarAsync<decimal?>(new CommandDefinition($"SELECT SUM(e.netrec)"+within,p,tx,cancellationToken:queryToken));
                // Campaign indicator follows the selected date interval, as do every other widget.
                if(s.Metrics.MissingNet>0||s.Metrics.MissingDate>0)s.Warnings.Add("Poids net ou date manquant : totaux observés incomplets, aucune valeur manquante remplacée par zéro dans les détails.");
                s.Warnings.Add("Producteur et verger : rattachement déclaré reception.refver, cohérent avec les rapports historiques ; refverreel n'est pas substitué silencieusement.");
            }
            else
            {
                s.Metrics.MissingDate=await Count("SELECT COUNT(*)"+joins+basis+" AND (e.dtecai IS NULL OR e.dtecai=0)",p);
                s.Warnings.Add("E = entrée station ; S = sortie station. E−S est la variation physique sur la période filtrée, par type ; ce n'est pas un stock absolu. Sans ouverture physique et audit d'exhaustivité : stock physique indisponible. Sans propriété/nature prêt-retour validée et soldes initiaux individuels : dettes producteurs, circulation et caisses personnelles indisponibles.");
                s.Movements=await Query<AnalyticsBucket>("SELECT CONCAT(COALESCE(CAST(e.typcai AS CHAR),'?'),':',COALESCE(e.typmvt,'?')) `Key`,CONCAT(COALESCE(t.nomcai,'Type inconnu'),' · ',COALESCE(e.typmvt,'?')) Label,COUNT(*) Count,SUM(e.nbrcai) Quantity"+within+" GROUP BY e.typcai,t.nomcai,e.typmvt",p);
                var flowSelect = "e.typcai CrateType,COALESCE(t.nomcai,'Type inconnu') Crate,SUM(CASE WHEN e.typmvt='E' AND e.nbrcai>=0 THEN e.nbrcai ELSE 0 END) Entries,SUM(CASE WHEN e.typmvt='S' AND e.nbrcai>=0 THEN e.nbrcai ELSE 0 END) Exits,SUM(CASE WHEN e.typmvt='E' AND e.nbrpal>=0 THEN e.nbrpal ELSE 0 END) EntriesPallets,SUM(CASE WHEN e.typmvt='S' AND e.nbrpal>=0 THEN e.nbrpal ELSE 0 END) ExitsPallets,SUM(CASE WHEN e.nbrcai IS NULL OR e.nbrcai<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') OR e.typcai IS NULL OR t.typcai IS NULL THEN 1 ELSE 0 END) Invalid,SUM(CASE WHEN e.nbrpal IS NULL OR e.nbrpal<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') THEN 1 ELSE 0 END) InvalidPallets,SUM(CASE WHEN e.refadh IS NULL OR a.refadh IS NULL OR (e.refver IS NOT NULL AND e.refver<>0 AND (o.refver IS NULL OR o.refadh IS NULL OR o.refadh<>e.refadh)) THEN 1 ELSE 0 END) Incoherent";
                var typeFlows = await Query<AnalyticsCrateFlow>("SELECT " + flowSelect + ",COALESCE(t.nomcai,'Type inconnu') Label" + within + " GROUP BY e.typcai,t.nomcai",p);
                var producerFlows = await Query<AnalyticsCrateFlow>("SELECT 'producer' Scope,e.refadh ProducerId,COALESCE(a.nomadh,'Producteur inconnu') ProducerLabel," + flowSelect + within + " GROUP BY e.refadh,a.nomadh,e.typcai,t.nomcai",p);
                var orchardFlows = await Query<AnalyticsCrateFlow>("SELECT 'orchard' Scope,e.refadh ProducerId,e.refver OrchardId,COALESCE(o.nomver,'Verger inconnu') OrchardLabel," + flowSelect + within + " GROUP BY e.refadh,e.refver,o.nomver,e.typcai,t.nomcai",p);
                s.CrateFlows = typeFlows.Concat(producerFlows).Concat(orchardFlows).ToArray();
                if(typeFlows.Any(f=>f.Invalid>0))s.Warnings.Add("Quantité, sens ou type de caisse invalide : variation indisponible pour les groupes concernés.");
                if(typeFlows.Any(f=>f.Incoherent>0))s.Warnings.Add("Rattachement adhérent/verger incohérent ou manquant : aucune dette individuelle ni attribution certifiée par verger.");
            }
            s.Total=await Count("SELECT COUNT(*)"+within,p);
            if(export&&s.Total>20000)throw new RuleException("Export supérieur à 20 000 lignes par source : réduisez les filtres.",413);
            string FlowColumns()=>receipt?"NULL Entries,NULL Exits,NULL EntriesPallets,NULL ExitsPallets,0 InvalidFlowQuantities,0 InvalidPalletQuantities":string.Join(",",new[]{
                q.CrateType.HasValue?"CASE WHEN SUM(CASE WHEN e.nbrcai IS NULL OR e.nbrcai<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') OR e.typcai IS NULL OR t.typcai IS NULL THEN 1 ELSE 0 END)>0 THEN NULL ELSE SUM(CASE WHEN e.typmvt='E' THEN e.nbrcai ELSE 0 END) END Entries":"NULL Entries",
                q.CrateType.HasValue?"CASE WHEN SUM(CASE WHEN e.nbrcai IS NULL OR e.nbrcai<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') OR e.typcai IS NULL OR t.typcai IS NULL THEN 1 ELSE 0 END)>0 THEN NULL ELSE SUM(CASE WHEN e.typmvt='S' THEN e.nbrcai ELSE 0 END) END Exits":"NULL Exits",
                "CASE WHEN SUM(CASE WHEN e.nbrpal IS NULL OR e.nbrpal<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') THEN 1 ELSE 0 END)>0 THEN NULL ELSE SUM(CASE WHEN e.typmvt='E' THEN e.nbrpal ELSE 0 END) END EntriesPallets",
                "CASE WHEN SUM(CASE WHEN e.nbrpal IS NULL OR e.nbrpal<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') THEN 1 ELSE 0 END)>0 THEN NULL ELSE SUM(CASE WHEN e.typmvt='S' THEN e.nbrpal ELSE 0 END) END ExitsPallets",
                "SUM(CASE WHEN e.nbrcai IS NULL OR e.nbrcai<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') OR e.typcai IS NULL OR t.typcai IS NULL THEN 1 ELSE 0 END) InvalidFlowQuantities",
                "SUM(CASE WHEN e.nbrpal IS NULL OR e.nbrpal<0 OR e.typmvt IS NULL OR e.typmvt NOT IN ('E','S') THEN 1 ELSE 0 END) InvalidPalletQuantities"});
            s.Daily=await Query<AnalyticsBucket>($"SELECT DATE_FORMAT(e.{date},'%Y-%m-%d') `Key`,DATE_FORMAT(e.{date},'%Y-%m-%d') Label,SUM({num}) Kg,COUNT(*) Count,{(receipt?"NULL":"SUM(e.nbrcai)")} Quantity,{FlowColumns()}"+within+$" GROUP BY e.{date} ORDER BY e.{date}",p);
            s.Weekly=await Query<AnalyticsBucket>($"SELECT CAST(MIN(YEARWEEK(e.{date},3)) AS CHAR) `Key`,CONCAT('S',DATE_FORMAT(MIN(e.{date}),'%v'),' · ',DATE_FORMAT(MIN(e.{date}),'%x')) Label,SUM({num}) Kg,COUNT(*) Count,{(receipt?"NULL":"SUM(e.nbrcai)")} Quantity,{FlowColumns()}"+within+$" GROUP BY YEARWEEK(e.{date},3) ORDER BY `Key`",p);
            s.Varieties=await Query<AnalyticsBucket>($"SELECT COALESCE(CAST(e.codvar AS CHAR),'?') `Key`,COALESCE(v.nomvar,'Variété inconnue') Label,SUM({num}) Kg,COUNT(*) Count,{(receipt?"NULL":"SUM(e.nbrcai)")} Quantity"+within+" GROUP BY e.codvar,v.nomvar ORDER BY Kg DESC,`Key`",p);
            s.Producers=await Query<AnalyticsBucket>($"SELECT COALESCE(CAST({producer} AS CHAR),'?') `Key`,COALESCE(a.nomadh,'Producteur inconnu') Label,SUM({num}) Kg,COUNT(*) Count,{(receipt?"NULL":"SUM(e.nbrcai)")} Quantity"+within+$" GROUP BY {producer},a.nomadh ORDER BY Kg DESC,`Key`",p);
            foreach(var b in s.Daily.Concat(s.Weekly).Concat(s.Varieties).Concat(s.Producers).Concat(s.Movements))b.Station=c.Station;
            var sort=q.Sort switch{"date"=>$"e.{date}","number"=>$"e.{number}","net"=>receipt?"e.netrec":"e.nbrcai","quantity"=>"e.nbrcai","producer"=>"CONVERT(COALESCE(a.nomadh,'Producteur inconnu') USING utf8mb4) COLLATE utf8mb4_bin","variety"=>"CONVERT(COALESCE(v.nomvar,'Variété inconnue') USING utf8mb4) COLLATE utf8mb4_bin",_=>throw new RuleException("Tri inconnu.")};
            p.Add("take",export?20000:q.Page*25);
            s.Rows=await Query<AnalyticsDetail>($"SELECT e.{number} Number,DATE_FORMAT(e.{date},'%Y-%m-%d') Date,{producer} ProducerId,COALESCE(a.nomadh,'Producteur inconnu') Producer,e.refver OrchardId,COALESCE(o.nomver,'Verger inconnu') Orchard,COALESCE(k.nomcul,'Catégorie inconnue') Category,COALESCE(g.nomgrv,'Groupe inconnu') Product,COALESCE(v.nomvar,'Variété inconnue') Variety,{num} NetKg,e.nbrcai Quantity,CONCAT(COALESCE(t.nomcai,'Type inconnu'),' [',COALESCE(CAST(e.typcai AS CHAR),'?'),']') Crate,{(receipt?"NULL":"e.typmvt")} Movement"+within+$" ORDER BY {sort} {(q.Asc?"ASC":"DESC")},e.{number} LIMIT @take",p);
            foreach(var r in s.Rows){r.Station=c.Station;r.ContextId=c.Id;}
            var dims=new[]{("categories","k.codcul","k.nomcul"),("products","g.codgrv","g.nomgrv"),("varieties","v.codvar","v.nomvar"),("producers",producer,"a.nomadh"),("orchards","e.refver","o.nomver"),("crates","e.typcai","t.nomcai")};
            foreach(var (key,code,label) in dims)s.Options[key]=(await Query<object>($"SELECT DISTINCT {code} value,COALESCE(CONVERT({label} USING utf8mb4),CONCAT('Référence ',{code})) COLLATE utf8mb4_unicode_ci label"+joins+" WHERE e.refsta=@station AND "+code+" IS NOT NULL ORDER BY label LIMIT 3001",p));
            if(s.Options.Values.Any(v=>v.Length>3000))s.Warnings.Add("Plus de 3 000 choix dans un filtre : utilisez la recherche des détails pour les références supplémentaires.");
            if(receipt&&names.Contains("parcelle"))
            {
                var parcelColumns=await Query<string>("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='parcelle'");
                if(new[]{"nbrarb","estimation","refver","refpar","numcul","codvar"}.All(parcelColumns.Contains))
                {
                    var ep=new DynamicParameters(p);var ef=new List<string>{"o.refsta=@station"};
                    foreach(var (field,value,name) in new[]{("k.codcul",q.Category,"category"),("g.codgrv",q.Product,"product"),("v.codvar",q.Variety,"variety"),("o.refadh",q.Producer,"producer"),("p.refver",q.Orchard,"orchard")})if(value.HasValue)ef.Add(field+"=@"+name);
                    if(!string.IsNullOrWhiteSpace(q.Search))ef.Add("(a.nomadh LIKE @search OR o.nomver LIKE @search OR v.nomvar LIKE @search)");
                    var ej=" FROM parcelle p LEFT JOIN verger o ON o.refver=p.refver LEFT JOIN adherent a ON a.refadh=o.refadh LEFT JOIN variete v ON v.codvar=p.codvar LEFT JOIN culture k ON k.codcul=v.codcul LEFT JOIN grpvar g ON g.codgrv=v.codgrv LEFT JOIN (SELECT refver,refpar,numcul,COUNT(*) n FROM parcelle GROUP BY refver,refpar,numcul) z ON z.refver=p.refver AND z.refpar=p.refpar AND z.numcul=p.numcul WHERE "+string.Join(" AND ",ef);
                    var good="p.nbrarb>0 AND p.estimation>0 AND z.n=1";
                    s.Estimates=new {summary=(await Query<object>($"SELECT COUNT(*) parcels,SUM(CASE WHEN {good} THEN 1 ELSE 0 END) usable,SUM(CASE WHEN {good} THEN p.nbrarb*p.estimation END) estimatedKg,SUM(CASE WHEN z.n>1 THEN 1 ELSE 0 END) ambiguous"+ej,ep))[0],
                        incomplete=await Query<object>($"SELECT p.idparcelle,p.refver,p.refpar,p.numcul,p.nbrarb,p.estimation,COALESCE(o.nomver,'Verger inconnu') orchard,CASE WHEN z.n>1 THEN 'Identité ambiguë' ELSE 'Arbres ou kg/arbre manquants' END reason"+ej+$" AND COALESCE(({good}),0)=0 ORDER BY p.refver,p.refpar,p.numcul LIMIT 100",ep),
                        campaignLinked=false,realizationRate=(decimal?)null,gapKg=(decimal?)null};
                    s.Warnings.Add("Estimation indicative du référentiel actuel : aucune colonne ne rattache cette estimation à une campagne. Non assimilable à une prévision de livraison. Identités ambiguës exclues ; zéro ou NULL = renseignement absent. Aucun taux de réalisation ni écart campagne calculé. Liste des parcelles incomplètes limitée à 100.");
                }
            }
            await tx.CommitAsync(queryToken);s.Available=true;return s;
        }
        catch(MySqlException ex){logger.LogWarning("Analytics context {Id}: MySQL error {Number}",c.Id,ex.Number);s.Warnings.Add("Source inaccessible ou schéma incompatible : total incomplet. Vérifiez le contexte avec l'administrateur.");return s;}
        catch(OperationCanceledException) when(!ct.IsCancellationRequested){s.Warnings.Add("Délai de lecture dépassé (30 secondes par source) : total incomplet.");return s;}
        catch(RuleException ex) when(ex.Status!=403&&ex.Status!=413){s.Warnings.Add(ex.Message);return s;}
    }
}



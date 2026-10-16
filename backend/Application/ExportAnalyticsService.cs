using System.Data;
using System.Globalization;
using System.Security.Claims;
using Dapper;
using MySqlConnector;
namespace Vitasouss;

// Isolated read-only dashboard. No historical view, arbitrary SQL, mutation, or inferred shipment status.
public sealed class ExportAnalyticsService(Connections connections,PermissionService permissions,ILogger<ExportAnalyticsService> logger)
{
    public const string Definition="Export officiel : dossiers codmaj=2 (expédiés et clôturés), poids commercial bdq.pdscom en kg. Client : destination.vildes. dtedep est la date enregistrée dans Logista, sans preuve de départ physique. Les graphiques représentent exclusivement les dossiers expédiés du périmètre filtré.";
    public async Task<ExportDashboardResult> Read(int id,ExportQuery q,ClaimsPrincipal user,bool export=false,CancellationToken ct=default)
    {
        q.Validate();await permissions.Demand(user,"export");
        var main=await connections.Resolve(id,user);
        if(main.Station is not ("ZAOUIA" or "DIAF"))throw new RuleException("Station Export non prise en charge.",409);
        var contexts=new List<ContextInfo>{main};var archives=new List<ContextInfo>();
        if(q.OtherContext is int other){var c=await connections.Resolve(other,user);if(c.Station==main.Station||c.Station is not ("ZAOUIA" or "DIAF"))throw new RuleException("La consolidation Export requiert l'autre station.",409);contexts.Add(c);}
        if(q.PreviousContext is int prev){var c=await connections.Resolve(prev,user);if(!c.ReadOnly||c.Station!=main.Station)throw new RuleException("Archive Export de la même station requise.",409);archives.Add(c);}
        if(q.PreviousOtherContext is int prevOther){var c=await connections.Resolve(prevOther,user);if(contexts.Count!=2||archives.Count!=1||!c.ReadOnly||c.Station!=contexts[1].Station)throw new RuleException("Archive Export secondaire incompatible.",409);archives.Add(c);}
        if(archives.Count>0&&contexts.Count!=archives.Count)throw new RuleException("La comparaison consolidée nécessite les deux archives.",409);
        var sources=new List<ExportSource>();
        foreach(var c in contexts)sources.Add(await Source(c,q,null,ct));
        if(sources.Count==2&&sources.All(s=>s.Available)&&sources[0].Campaign!=sources[1].Campaign)throw new RuleException("Campagnes Export incompatibles.",409);
        for(var i=0;i<archives.Count;i++)sources.Add(sources[i].Available?await Source(archives[i],q,sources[i],ct):new(){ContextId=archives[i].Id,Station=archives[i].Station,Archive=true,Warnings=["Comparaison indisponible : source courante inaccessible."]});
        if(archives.Count==2&&sources.Skip(2).All(s=>s.Available)&&sources[2].Campaign!=sources[3].Campaign)throw new RuleException("Campagnes archivées incompatibles.",409);
        var current=sources.Take(contexts.Count).ToArray();var complete=current.All(s=>s.Available);
        if(export&&!complete)throw new RuleException("Export Excel refusé : une source est indisponible.",409);
        var rows=current.Where(s=>s.Available).SelectMany(s=>s.Rows).ToArray();
        if(rows.Length>20000)throw new RuleException("Plus de 20 000 lignes Export : réduisez les filtres.",413);
        var ordered=Order(rows,q).ToArray();var metrics=Metrics(rows);var shipped=rows.Where(r=>r.Status==2).ToArray();
        return new(sources.ToArray(),complete,true,complete?Sum(shipped.Select(r=>r.CommercialKg)):null,Definition,metrics,complete?metrics:null,export?ordered:ordered.Skip((q.Page-1)*25).Take(25).ToArray(),export?1:q.Page,export?ordered.Length:25,rows.Length,
            Group(shipped,r=>r.Date??"",r=>r.Date??"Date inconnue"),Group(shipped,r=>Week(r.Date),r=>Week(r.Date)),Group(shipped,r=>r.VarietyId?.ToString()??"?",r=>r.Variety),Group(shipped,r=>r.DestinationId?.ToString()??"?",r=>r.Destination),Group(shipped,r=>r.PackagingId,r=>r.Packaging),current.SelectMany(s=>s.Calibres).ToArray(),sources.SelectMany(s=>s.Warnings).Distinct().ToArray());
    }
    public static decimal? Sum(IEnumerable<decimal?> values){var v=values.ToArray();return v.Any(x=>x is null)?null:v.Sum(x=>x!.Value);}
    public static ExportMetrics Metrics(ExportRow[] rows)=>new(Sum(rows.Select(r=>r.NetKg)),Sum(rows.Select(r=>r.CommercialKg)),Sum(rows.Select(r=>r.WeighedKg)),Sum(rows.Select(r=>r.Pallets)),Sum(rows.Select(r=>r.Packages)),rows.Select(r=>(r.ContextId,r.Shipment)).Distinct().Count(),rows.Where(r=>r.DestinationId.HasValue).Select(r=>(r.ContextId,r.DestinationId)).Distinct().Count());
    public static ExportStatusCounts StatusCounts(ExportRow[] rows)=>new(rows.Where(r=>r.Status==0).Select(r=>(r.ContextId,r.Shipment)).Distinct().Count(),rows.Where(r=>r.Status==1).Select(r=>(r.ContextId,r.Shipment)).Distinct().Count(),rows.Where(r=>r.Status==2).Select(r=>(r.ContextId,r.Shipment)).Distinct().Count(),rows.Where(r=>r.Status is not (0 or 1 or 2)).Select(r=>(r.ContextId,r.Shipment)).Distinct().Count());
    public static string Week(string? date)=>DateTime.TryParseExact(date,"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var d)?$"{ISOWeek.GetYear(d)}-S{ISOWeek.GetWeekOfYear(d):00}":"Date inconnue";
    public static ExportGroup[] Group(ExportRow[] rows,Func<ExportRow,string> key,Func<ExportRow,string> label)=>rows.GroupBy(r=>(r.Station,Key:key(r))).Select(g=>new ExportGroup(g.Key.Key,label(g.First()),g.Key.Station,Sum(g.Select(r=>r.CommercialKg)),Sum(g.Select(r=>r.Pallets)),Sum(g.Select(r=>r.Packages)),g.Select(r=>(r.ContextId,r.Shipment)).Distinct().Count())).OrderBy(r=>r.Key,StringComparer.Ordinal).ToArray();
    private static IOrderedEnumerable<ExportRow> Order(ExportRow[] rows,ExportQuery q)
    {
        Func<ExportRow,IComparable?> key=q.Sort switch{"shipment"=>r=>r.Shipment,"net"=>r=>r.CommercialKg,"pallets"=>r=>r.Pallets,"packages"=>r=>r.Packages,"destination"=>r=>r.Destination,"variety"=>r=>r.Variety,_=>r=>r.Date};
        return (q.Asc?rows.OrderBy(key):rows.OrderByDescending(key)).ThenBy(r=>r.ContextId).ThenBy(r=>r.Shipment).ThenBy(r=>r.Dock);
    }
    private async Task<ExportSource> Source(ContextInfo c,ExportQuery q,ExportSource? align,CancellationToken ct)
    {
        var source=new ExportSource{ContextId=c.Id,Station=c.Station,Archive=align is not null};
        using var budget=CancellationTokenSource.CreateLinkedTokenSource(ct);budget.CancelAfter(TimeSpan.FromSeconds(30));
        try {
            if(c.LocalRefsta is null)throw new RuleException("Station locale absente : cumul Export interdit.",409);
            await using var db=await connections.Business(c);
            await db.ExecuteAsync(new CommandDefinition("SET TRANSACTION READ ONLY",cancellationToken:budget.Token));
            await using var tx=await db.BeginTransactionAsync(IsolationLevel.RepeatableRead,budget.Token);
            async Task<T[]> Read<T>(string sql,object? args=null)=>(await db.QueryAsync<T>(new CommandDefinition(sql,args,tx,commandTimeout:20,cancellationToken:budget.Token))).ToArray();
            var columns=(await Read<(string TableName,string ColumnName)>("SELECT TABLE_NAME TableName,COLUMN_NAME ColumnName FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE()")).GroupBy(x=>x.TableName).ToDictionary(g=>g.Key,g=>g.Select(x=>x.ColumnName).ToHashSet());
            var required=new Dictionary<string,string[]>{["entreprise"]=["dtDebut","dtFin","camp","lier"],["bdq"]=["numbdq","refsta","numdos","codtyp","codvar","nbrpal","nbrcol","pdsnet","pdscom","pdspse"],["dossier"]=["numdos","dtedep","dtdepsta","codmaj","coddes","refexp","client"],["destination"]=["coddes","vildes","codpay"],["pays"]=["codpay","nompay"],["partenaire"]=["ref","nom"],["variete"]=["codvar","nomvar","codgrv"],["grpvar"]=["codgrv","nomgrv"],["tpalette"]=["codtyp","nomemb"]};
            if(required.Any(p=>!columns.TryGetValue(p.Key,out var cols)||p.Value.Any(v=>!cols.Contains(v))))throw new RuleException("Schéma Export incomplet : source non disponible dans cet exercice.",409);
            foreach(var (table,key) in new[]{("dossier","numdos"),("bdq","numbdq"),("destination","coddes"),("pays","codpay"),("partenaire","ref"),("variete","codvar"),("grpvar","codgrv"),("tpalette","codtyp")})
                if((await Read<long>($"SELECT COUNT(*) FROM (SELECT `{key}` FROM `{table}` GROUP BY `{key}` HAVING COUNT(*)>1 OR `{key}` IS NULL) a"))[0]>0)throw new RuleException("Jointure Export ambiguë : identifiants non uniques, aucun total calculé.",409);
            var campaign=await Read<(DateTime Start,DateTime End,string Label)>("SELECT dtDebut Start,dtFin End,camp Label FROM entreprise WHERE lier='1'");
            if(campaign.Length!=1||campaign[0].Start.Year<1900||campaign[0].End<campaign[0].Start)throw new RuleException("Campagne Export absente ou ambiguë.",409);
            source.Campaign=new(campaign[0].Start,campaign[0].End,campaign[0].Label);
            var period=AnalyticsPeriod.Resolve(q.PeriodQuery(),source.Campaign,AnalyticsPeriod.Today());
            if(q.PreviousContext.HasValue&&period.To>AnalyticsPeriod.Today())period=period with{To=AnalyticsPeriod.Today()};
            if(align is not null)period=AnalyticsPeriod.Align(align.Period!,align.Campaign!,source.Campaign);
            // Limit periods to each real campaign. No cross-campaign query or future archive observation.
            period=new(period.From<source.Campaign.Start?source.Campaign.Start:period.From,period.To>source.Campaign.End?source.Campaign.End:period.To);source.Period=period;
            var p=new DynamicParameters(new{station=c.LocalRefsta,from=period.From,to=period.To.AddDays(1)});
            var where=new List<string>{"b.refsta=@station","d.dtedep>=@from","d.dtedep<@to"};
            void Filter(string col,string name,object? val){if(val is null||val is string s&&s.Length==0)return;where.Add(col+"=@"+name);p.Add(name,val);}
            Filter("d.coddes","destination",q.Destination);Filter("b.codvar","variety",q.Variety);Filter("b.codtyp","packaging",q.Packaging);Filter("d.numdos","shipment",q.Shipment);
            if(!string.IsNullOrWhiteSpace(q.Search)){where.Add("(CAST(d.numdos AS CHAR) LIKE @search OR des.vildes LIKE @search OR v.nomvar LIKE @search OR t.nomemb LIKE @search)");p.Add("search","%"+q.Search.Trim()+"%");}
            string Optional(string column,string alias)=>columns["dossier"].Contains(column)?$"d.`{column}` {alias}":$"NULL {alias}";
            string Partner(string column,string alias)=>columns["dossier"].Contains(column)?$"(SELECT p.nom FROM partenaire p WHERE p.ref=d.`{column}`) {alias}":$"NULL {alias}";
            var logistics=string.Join(",",Partner("reftrp","Carrier"),Partner("refte","Forwarder"),Optional("numrem","Trailer"),Optional("numtra","TransportReference"));
            var sql="SELECT "+logistics+", d.numdos Shipment,b.numbdq Dock,DATE_FORMAT(d.dtedep,'%Y-%m-%d') Date,DATE_FORMAT(d.dtdepsta,'%Y-%m-%d') StationDeparture,d.codmaj Status,d.coddes DestinationId,COALESCE(des.vildes,'Client inconnu') Destination,COALESCE(y.nompay,'Pays inconnu') Country,COALESCE(e.nom,'Exportateur inconnu') Exporter,d.client ClientText,CAST(b.codvar AS UNSIGNED) VarietyId,COALESCE(v.nomvar,'Variété inconnue') Variety,COALESCE(g.nomgrv,'Produit inconnu') Product,b.codtyp PackagingId,COALESCE(t.nomemb,b.codtyp,'Emballage inconnu') Packaging,CASE WHEN b.nbrpal>=0 THEN b.nbrpal END Pallets,CASE WHEN b.nbrcol>=0 THEN b.nbrcol END Packages,CASE WHEN b.pdsnet>=0 THEN b.pdsnet END NetKg,CASE WHEN b.pdscom>=0 THEN b.pdscom END CommercialKg,CASE WHEN b.pdspse>=0 THEN b.pdspse END WeighedKg FROM bdq b JOIN dossier d ON d.numdos=b.numdos LEFT JOIN destination des ON des.coddes=d.coddes LEFT JOIN pays y ON y.codpay=des.codpay LEFT JOIN partenaire e ON e.ref=d.refexp LEFT JOIN variete v ON b.codvar REGEXP '^[0-9]+$' AND v.codvar=CAST(b.codvar AS UNSIGNED) LEFT JOIN grpvar g ON g.codgrv=v.codgrv LEFT JOIN tpalette t ON t.codtyp=b.codtyp WHERE "+string.Join(" AND ",where)+" ORDER BY d.numdos,b.numbdq LIMIT 20001";
            var rows=await Read<ExportRow>(sql,p);if(rows.Length>20000)throw new RuleException("Limite Export dépassée : réduisez les filtres.",413);
            foreach(var row in rows){row.ContextId=c.Id;row.Station=c.Station;}
            var anomalies=(await Read<long>("SELECT COUNT(*) FROM bdq b LEFT JOIN dossier d ON d.numdos=b.numdos WHERE b.refsta=@station AND (d.numdos IS NULL OR d.dtedep IS NULL OR d.dtedep=0)",new{station=c.LocalRefsta}))[0];
            if(anomalies>0)source.Warnings.Add($"{anomalies} bon(s) de quai sans dossier/date : hors périmètre daté, aucun total exhaustif garanti.");
            var haveCalibre=columns.TryGetValue("palette_d",out var pd)&&new[]{"numbdq","numpal","calibr","nbrcol","pdscom"}.All(pd.Contains);
            if(haveCalibre&&rows.Length>0){
                var detail=await Read<ExportCalibre>("SELECT numbdq Dock,calibr Calibre,CASE WHEN SUM(numpal IS NULL OR numpal<=0)=0 THEN COUNT(DISTINCT numpal) END Pallets,CASE WHEN SUM(nbrcol IS NULL OR nbrcol<0)=0 THEN SUM(nbrcol) END Packages,CASE WHEN SUM(pdscom IS NULL OR pdscom<0)=0 THEN SUM(pdscom) END CommercialKg FROM palette_d WHERE numbdq IN @ids GROUP BY numbdq,calibr LIMIT 100001",new{ids=rows.Select(r=>r.Dock).ToArray()});
                source.AvailableCalibres=detail.Where(x=>x.Calibre.HasValue).Select(x=>x.Calibre!.Value).Distinct().Order().ToArray();
                if(detail.Length>100000)throw new RuleException("Trop de détails calibre : réduisez la période.",413);
                source.Calibres=detail.GroupBy(r=>r.Calibre).Select(g=>new ExportGroup(g.Key?.ToString()??"?",g.Key?.ToString()??"Calibre inconnu",c.Station,null,null,Sum(g.Select(x=>x.Packages)),0)).ToArray();
                if(q.Calibre.HasValue){var picked=detail.Where(x=>x.Calibre==q.Calibre).ToDictionary(x=>x.Dock);rows=rows.Where(r=>picked.ContainsKey(r.Dock)).ToArray();foreach(var row in rows){var x=picked[row.Dock];row.Calibre=q.Calibre;row.Pallets=x.Pallets;row.Packages=x.Packages;row.CommercialKg=null;row.NetKg=null;row.WeighedKg=null;}source.Calibres=source.Calibres.Where(x=>x.Key==q.Calibre.ToString()).ToArray();source.Warnings.Add("Filtre calibre : colis et palettes distinctes du détail; poids officiel/net/pesé du bon de quai non ventilés, donc indisponibles. Aucun prorata.");}
            }else if(q.Calibre.HasValue&&!haveCalibre)throw new RuleException("Détail calibre indisponible dans cet exercice.",409);
            source.ScopeRows=rows;
            rows=rows.Where(r=>q.Status is null || (q.Status==-1?r.Status is not (0 or 1 or 2):r.Status==q.Status)).ToArray();
            source.Rows=rows;source.Available=true;
            // Calibre breakdown must obey the same confirmed status scope as every export chart.
            if(haveCalibre&&rows.Length>0){var quantities=await Read<ExportCalibre>("SELECT numbdq Dock,calibr Calibre,CASE WHEN SUM(nbrcol IS NULL OR nbrcol<0)=0 THEN SUM(nbrcol) END Packages FROM palette_d WHERE numbdq IN @ids GROUP BY numbdq,calibr",new{ids=rows.Where(r=>r.Status==2).Select(r=>r.Dock).DefaultIfEmpty(-1).ToArray()});source.Calibres=quantities.Where(r=>!q.Calibre.HasValue||r.Calibre==q.Calibre).GroupBy(r=>r.Calibre).Select(g=>new ExportGroup(g.Key?.ToString()??"?",g.Key?.ToString()??"Calibre inconnu",c.Station,null,null,Sum(g.Select(x=>x.Packages)),0)).ToArray();}else source.Calibres=[];
            source.Warnings.Add(Definition);source.Warnings.Add("Poids brut officiel non disponible. dossier.client reste un texte historique secondaire; Client provient de destination.vildes. Les compteurs de statuts couvrent tous les statuts avec les autres filtres appliqués; KPI et graphiques exportés excluent toujours les statuts 0, 1 et inconnus.");
            if(rows.Any(r=>r.CommercialKg is null||r.Packages is null||r.Pallets is null))source.Warnings.Add("Une quantité NULL ou négative rend son indicateur indisponible; aucune valeur manquante remplacée par zéro.");
            await tx.RollbackAsync(budget.Token);return source;
        }catch(RuleException ex) when(ex.Status!=413){if(align is not null&&ex.Message.Contains("campagne précédente"))throw;source.Warnings.Add(ex.Message);}
        catch(MySqlException ex){logger.LogWarning("Export context {ContextId}: MySQL {Code}",c.Id,ex.Number);source.Warnings.Add("Source Export indisponible ou accès SQL insuffisant.");}
        catch(OperationCanceledException) when(!ct.IsCancellationRequested){source.Warnings.Add("Délai Export dépassé.");}
        return source;
    }
    public static byte[] Excel(ExportDashboardResult result,ExportQuery q)
    {
        if(!result.Complete)throw new RuleException("Export Excel incomplet interdit.",409);
        var data=new List<object?[]>{new object?[]{"Station","Contexte","Dossier","Bon de quai","Date Logista dtedep","Code statut","Client","Pays","Exportateur","Produit","Variété","Emballage","Calibre","Palettes déclarées","Colis","Net secondaire kg","Commercial officiel kg (codmaj=2)","Poids pesé secondaire kg","Statut","Transporteur","Transitaire","Conteneur/remorque","Navire/référence transport","Commercial tous statuts kg"}};
        data.AddRange(result.Rows.Select(r=>new object?[]{r.Station,r.ContextId,r.Shipment,r.Dock,DateTime.TryParse(r.Date,out var date)?date:r.Date,r.Status,r.Destination,r.Country,r.Exporter,r.Product,r.Variety,r.Packaging,r.Calibre,r.Pallets,r.Packages,r.NetKg,r.Status==2?r.CommercialKg:null,r.WeighedKg,r.StatusLabel,r.Carrier,r.Forwarder,r.Trailer,r.TransportReference,r.CommercialKg}));
        var context=new List<object?[]>{new object?[]{"Définition",Definition},new object?[]{"Limite","Seul codmaj=2 est exporté. Date Logista enregistrée, pas départ physique vérifié. Aucun poids brut ni facturation."},new object?[]{"Filtres Export",System.Text.Json.JsonSerializer.Serialize(q)}};
        context.Add(new object?[]{"TOTAL OFFICIEL FILTRÉ kg",result.Official!.CommercialKg,"Palettes expédiées",result.Official!.Pallets,"Colis expédiés",result.Official!.Packages,"Dossiers expédiés",result.Official!.Shipments});
        context.Add(new object?[]{"TOTAL SÉLECTION tous statuts filtrés kg",result.Total?.CommercialKg,"Dossiers en cours (hors filtre statut)",result.StatusCounts.InProgress,"Chargés",result.StatusCounts.Loaded,"Inconnus",result.StatusCounts.Unknown});
        context.AddRange(result.Sources.Select(s=>new object?[]{"Source",s.ContextId,s.Station,s.Campaign?.Label,s.Period?.From,s.Period?.To}));context.AddRange(result.Warnings.Select(w=>new object?[]{"Limite",w}));
        return AnalyticsExcel.Create([],q.PeriodQuery(),"export-officiel",data,context,"1.6.0");
    }
}

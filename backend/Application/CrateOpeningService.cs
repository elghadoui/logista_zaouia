using Dapper;
using System.Globalization;
using System.Security.Claims;

namespace Vitasouss;

public sealed record CrateInitialDue(int ProducerId, int? OrchardId, long Quantity);
public sealed record CrateOpeningRequest(int CrateType, string OpeningDate, long OwnedTotal,
    long? PhysicalQuantity, CrateInitialDue[] Dues, string Note, bool Confirmed, int ExpectedRevision);

// These inventory declarations never certify the nature or completeness of historical flows.
public sealed class CrateOpeningService(Connections connections)
{
    private static void Admin(ClaimsPrincipal user)
    {
        if (!user.IsInRole("Admin")) throw new RuleException("Inventaires réservés à l'administrateur.",403);
    }
    public async Task<object> List(int contextId, ClaimsPrincipal user)
    {
        Admin(user);
        var context = await connections.Resolve(contextId,user);
        await using var db = await connections.Admin();
        if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('app_crate_openings','app_crate_opening_dues')")!=2)
            return new { installed=false, rows=Array.Empty<object>(), dues=Array.Empty<object>(), types=Array.Empty<object>() };
        await using var business = await connections.Business(context);
        var types=await business.QueryAsync("SELECT typcai value,COALESCE(MAX(nomcai),'Sans libellé') label FROM typecaisse GROUP BY typcai HAVING COUNT(*)=1 AND typcai IS NOT NULL ORDER BY label");
        var producers=await business.QueryAsync("SELECT refadh value,COALESCE(MAX(nomadh),'Sans libellé') label FROM adherent GROUP BY refadh HAVING COUNT(*)=1 AND refadh IS NOT NULL ORDER BY label LIMIT 3001");
        var orchards=await business.QueryAsync("SELECT refver value,COALESCE(MAX(nomver),'Sans libellé') label,MAX(refadh) producer FROM verger GROUP BY refver HAVING COUNT(*)=1 AND refver IS NOT NULL ORDER BY label LIMIT 3001");
        var starts=(await business.QueryAsync<string>("SELECT DATE_FORMAT(dtDebut,'%Y-%m-%d') FROM entreprise WHERE lier='1'")).ToArray();
        if(starts.Length!=1)throw new RuleException("Campagne absente ou ambiguë.",409);
        var campaignStart=starts[0];
        var revisions=await db.QueryAsync("SELECT crate_type,MAX(revision) revision FROM app_crate_openings WHERE context_id=@contextId AND campaign_start=@campaignStart GROUP BY crate_type",new{contextId,campaignStart});
        var rows=await db.QueryAsync("SELECT o.id,o.crate_type,o.revision,DATE_FORMAT(o.campaign_start,'%Y-%m-%d') campaign_start,DATE_FORMAT(o.opening_date,'%Y-%m-%d') opening_date,o.campaign_label,o.owned_total,o.physical_quantity,o.note,o.created_at,u.display_name created_by FROM app_crate_openings o JOIN app_users u ON u.id=o.created_by WHERE o.context_id=@contextId ORDER BY o.id DESC LIMIT 200",new{contextId});
        var dues=await db.QueryAsync("SELECT d.* FROM app_crate_opening_dues d JOIN (SELECT id FROM app_crate_openings WHERE context_id=@contextId ORDER BY id DESC LIMIT 200) o ON o.id=d.opening_id",new{contextId});
        return new { installed=true, rows, dues, types, campaignStart, revisions, producers, orchards };
    }
    public static DateTime Validate(CrateOpeningRequest r)
    {
        if(!r.Confirmed || r.CrateType<=0 || r.ExpectedRevision<0 || !DateTime.TryParseExact(r.OpeningDate,"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var date)
            || date>AnalyticsPeriod.Today() || r.OwnedTotal<0 || r.OwnedTotal>1_000_000_000_000L || r.PhysicalQuantity<0 || r.PhysicalQuantity>r.OwnedTotal
            || string.IsNullOrWhiteSpace(r.Note) || r.Note.Length>500 || r.Dues is null || r.Dues.Length>200
            || r.Dues.Any(d=>d is null || d.ProducerId<=0 || d.OrchardId is <=0 || d.Quantity<0 || d.Quantity>r.OwnedTotal)
            || r.Dues.Select(d=>(d.ProducerId,d.OrchardId)).Distinct().Count()!=r.Dues.Length)
            throw new RuleException("Inventaire invalide : confirmation, date, quantités positives, références uniques et justification requises.");
        var sum=r.Dues.Sum(d=>(decimal)d.Quantity);
        if(sum+(r.PhysicalQuantity??0)>r.OwnedTotal)
            throw new RuleException("Le physique et les quantités initiales dues renseignées dépassent la propriété totale.");
        return date;
    }
    public async Task<object> Save(int contextId, CrateOpeningRequest r, ClaimsPrincipal user)
    {
        Admin(user);
        var date=Validate(r);
        var context=await connections.Resolve(contextId,user,true);
        if(context.LocalRefsta is null)throw new RuleException("refsta local requis.",409);
        await using var db=await connections.Admin();
        if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('app_crate_openings','app_crate_opening_dues')")!=2)
            throw new RuleException("Appliquez d'abord la migration administrative 014.",409);
        await using var business=await connections.Business(context);
        // Business data are read in a read-only transaction; inventory writes are administration-only.
        await business.ExecuteAsync("SET TRANSACTION READ ONLY");
        await using var read=await business.BeginTransactionAsync();
        var campaigns=(await business.QueryAsync<(string Start,string End,string Label)>("SELECT DATE_FORMAT(dtDebut,'%Y-%m-%d') Start,DATE_FORMAT(dtFin,'%Y-%m-%d') End,camp Label FROM entreprise WHERE lier='1'",transaction:read)).ToArray();
        if(campaigns.Length!=1 || !DateTime.TryParseExact(campaigns[0].Start,"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var start)
            || !DateTime.TryParseExact(campaigns[0].End,"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var end)
            || date<start || date>end || campaigns[0].Label?.Length>100)
            throw new RuleException("Date hors campagne ou campagne ambiguë.",409);
        if(await business.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM typecaisse WHERE typcai=@CrateType",r,read)!=1)
            throw new RuleException("Type de caisse absent ou ambigu.",409);
        foreach(var due in r.Dues)
        {
            if(await business.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM adherent WHERE refadh=@ProducerId",due,read)!=1)
                throw new RuleException("Producteur absent ou ambigu.",409);
            if(due.OrchardId.HasValue && await business.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM verger WHERE refver=@OrchardId AND refadh=@ProducerId",due,read)!=1)
                throw new RuleException("Verger absent, ambigu ou appartenant à un autre producteur.",409);
        }
        await read.CommitAsync();
        await using var tx=await db.BeginTransactionAsync();
        var unchanged=await db.ExecuteScalarAsync<int>("SELECT c.id FROM app_contexts c JOIN app_stations s ON s.id=c.station_id WHERE c.id=@contextId AND c.enabled=1 AND c.read_only=0 AND c.local_refsta=@refsta AND c.database_name=@DatabaseName AND s.server_id=@ServerId FOR UPDATE",new{contextId,refsta=context.LocalRefsta,context.DatabaseName,context.ServerId},tx);
        if(unchanged!=contextId)throw new RuleException("Configuration du contexte modifiée entre-temps. Rechargez avant d'enregistrer.",409);
        var previous=await db.ExecuteScalarAsync<int>("SELECT COALESCE(MAX(revision),0) FROM app_crate_openings WHERE context_id=@contextId AND crate_type=@CrateType AND campaign_start=@start",new{contextId,r.CrateType,start},tx);
        if(previous!=r.ExpectedRevision)throw new RuleException("Inventaire modifié entre-temps. Rechargez avant de créer une nouvelle révision.",409);
        await db.ExecuteAsync("INSERT INTO app_crate_openings(context_id,local_refsta,crate_type,revision,opening_date,campaign_start,campaign_end,campaign_label,owned_total,physical_quantity,note,created_by,created_at) VALUES(@contextId,@refsta,@CrateType,@revision,@date,@start,@end,@label,@OwnedTotal,@PhysicalQuantity,@Note,@uid,UTC_TIMESTAMP(6))",new{contextId,refsta=context.LocalRefsta,r.CrateType,revision=previous+1,date,start,end,label=campaigns[0].Label??"",r.OwnedTotal,r.PhysicalQuantity,r.Note,uid=user.FindFirstValue(ClaimTypes.NameIdentifier)},tx);
        var id=await db.ExecuteScalarAsync<long>("SELECT LAST_INSERT_ID()",transaction:tx);
        foreach(var due in r.Dues)await db.ExecuteAsync("INSERT INTO app_crate_opening_dues(opening_id,producer_id,orchard_id,quantity) VALUES(@id,@ProducerId,@orchard,@Quantity)",new{id,due.ProducerId,orchard=due.OrchardId??0,due.Quantity},tx);
        await tx.CommitAsync();
        return new { id, message="Inventaire déclaré et historisé. Les soldes courants restent non certifiés tant que l'audit des mouvements n'est pas validé." };
    }
}

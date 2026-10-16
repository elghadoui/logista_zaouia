using System.Globalization;
using System.Text.Json.Serialization;
namespace Vitasouss;

public sealed class ExportQuery
{
    public int? OtherContext { get; set; }
    public int? PreviousContext { get; set; }
    public int? PreviousOtherContext { get; set; }
    public string Period { get; set; }="campaign";
    public string? From { get; set; }
    public string? To { get; set; }
    public int? Destination { get; set; }
    public int? Variety { get; set; }
    public int? Calibre { get; set; }
    public int? Status { get; set; }
    public int? Shipment { get; set; }
    public string? Packaging { get; set; }
    public string? Search { get; set; }
    public string Sort { get; set; }="date";
    public bool Asc { get; set; }
    public int Page { get; set; }=1;
    public AnalyticsQuery PeriodQuery()=>new(){Period=Period,From=From,To=To};
    public static ExportQuery Parse(IQueryCollection query)
    {
        string[] allowed=["otherContext","previousContext","previousOtherContext","period","from","to","destination","variety","calibre","packaging","search","sort","asc","page","status","shipment"];
        if(query.Any(p=>!allowed.Contains(p.Key,StringComparer.Ordinal)||p.Value.Count!=1))throw new RuleException("Paramètre Export inconnu ou répété.");
        string? T(string k)=>query.TryGetValue(k,out var v)?v.ToString():null;
        int? N(string k)=>string.IsNullOrEmpty(T(k))?null:int.TryParse(T(k),NumberStyles.Integer,CultureInfo.InvariantCulture,out var n)?n:throw new RuleException("Paramètre Export invalide : "+k);
        if(T("asc") is string asc&&!bool.TryParse(asc,out _))throw new RuleException("Tri Export invalide.");
        var q=new ExportQuery{OtherContext=N("otherContext"),PreviousContext=N("previousContext"),PreviousOtherContext=N("previousOtherContext"),Period=T("period")??"campaign",From=T("from"),To=T("to"),Destination=N("destination"),Variety=N("variety"),Calibre=N("calibre"),Status=N("status"),Shipment=N("shipment"),Packaging=T("packaging"),Search=T("search"),Sort=T("sort")??"date",Asc=T("asc") is string flag&&bool.Parse(flag),Page=N("page")??1};
        q.Validate();return q;
    }
    public void Validate()
    {
        if(Page<1||Page>800||(Search?.Length??0)>120||(Packaging?.Length??0)>50)throw new RuleException("Filtres Export hors limites.");
        if(Sort is not ("date" or "shipment" or "net" or "pallets" or "packages" or "destination" or "variety"))throw new RuleException("Tri Export inconnu.");
        _=AnalyticsPeriod.Resolve(PeriodQuery(),new(new(2000,1,1),new(2000,12,31),"Validation"),AnalyticsPeriod.Today());
    }
}
public sealed class ExportRow
{
    public int ContextId { get; set; }
    public string Station { get; set; }="";
    public int Shipment { get; set; }
    public int Dock { get; set; }
    public string? Date { get; set; }
    public string? StationDeparture { get; set; }
    public int? Status { get; set; }
    public int? DestinationId { get; set; }
    public string Destination { get; set; }="";
    public string Country { get; set; }="";
    public string Exporter { get; set; }="";
    public string StatusLabel=>Status switch{0=>"En cours",1=>"Chargé",2=>"Expédié et clôturé",_=>"Statut inconnu"};
    public string Client=>Destination;
    public string? Carrier { get; set; }
    public string? Forwarder { get; set; }
    public string? Trailer { get; set; }
    public string? TransportReference { get; set; }
    public string? ClientText { get; set; }
    public int? VarietyId { get; set; }
    public string Variety { get; set; }="";
    public string Product { get; set; }="";
    public string PackagingId { get; set; }="";
    public string Packaging { get; set; }="";
    public int? Calibre { get; set; }
    public decimal? Pallets { get; set; }
    public decimal? Packages { get; set; }
    public decimal? NetKg { get; set; }
    public decimal? CommercialKg { get; set; }
    public decimal? WeighedKg { get; set; }
}
public sealed class ExportCalibre
{
    public int Dock { get; set; }
    public int? Calibre { get; set; }
    public decimal? Packages { get; set; }
    public decimal? CommercialKg { get; set; }
    public decimal? Pallets { get; set; }
}
public sealed record ExportMetrics(decimal? NetKg,decimal? CommercialKg,decimal? WeighedKg,decimal? Pallets,decimal? Packages,int Shipments,int Destinations);
public sealed record ExportGroup(string Key,string Label,string Station,decimal? NetKg,decimal? Pallets,decimal? Packages,int Shipments);
public sealed class ExportSource
{
    public int ContextId { get; set; }
    public string Station { get; set; }="";
    public bool Available { get; set; }
    public bool Archive { get; set; }
    public AnalyticsCampaign? Campaign { get; set; }
    public AnalyticsPeriod? Period { get; set; }
    [JsonIgnore] public ExportRow[] Rows { get; set; }=[];
    [JsonIgnore] public ExportRow[] ScopeRows { get; set; }=[];
    public ExportMetrics Metrics=>ExportAnalyticsService.Metrics(Rows.Where(r=>r.Status==2).ToArray());
    public ExportMetrics SelectedMetrics=>ExportAnalyticsService.Metrics(Rows);
    public ExportStatusCounts StatusCounts=>ExportAnalyticsService.StatusCounts(ScopeRows);
    public ExportGroup[] Daily=>ExportAnalyticsService.Group(Rows.Where(r=>r.Status==2).ToArray(),r=>r.Date??"",r=>r.Date??"Date inconnue");
    public int[] AvailableCalibres { get; set; }=[];
    public Dictionary<string,object[]> Options=>new(){
        ["calibres"]=AvailableCalibres.Select(c=>(object)new{value=c.ToString(CultureInfo.InvariantCulture),label=c.ToString(CultureInfo.InvariantCulture)}).ToArray(),
        ["destinations"]=Rows.Select(r=>(Key:r.DestinationId?.ToString()??"",Label:r.Destination)).Where(r=>r.Key!="").Distinct().Select(r=>(object)new{value=r.Key,label=r.Label}).ToArray(),
        ["varieties"]=Rows.Select(r=>(Key:r.VarietyId?.ToString()??"",Label:r.Variety)).Where(r=>r.Key!="").Distinct().Select(r=>(object)new{value=r.Key,label=r.Label}).ToArray(),
        ["packaging"]=Rows.Select(r=>(Key:r.PackagingId,Label:r.Packaging)).Where(r=>!string.IsNullOrEmpty(r.Key)).Distinct().Select(r=>(object)new{value=r.Key,label=r.Label}).ToArray()
    };
    public ExportGroup[] Calibres { get; set; }=[];
    public List<string> Warnings { get; set; }=[];
}
public sealed record ExportDashboardResult(ExportSource[] Sources,bool Complete,bool ConfirmationAvailable,decimal? ConfirmedNetKg,string Definition,ExportMetrics Observed,ExportMetrics? Total,ExportRow[] Rows,int Page,int PageSize,int Count,ExportGroup[] Daily,ExportGroup[] Weekly,ExportGroup[] Varieties,ExportGroup[] Destinations,ExportGroup[] Packaging,ExportGroup[] Calibres,string[] Warnings)
{
    public ExportMetrics? Official=>!Complete?null:ExportAnalyticsService.Metrics(Sources.Where(s=>!s.Archive&&s.Available).SelectMany(s=>s.Rows).Where(r=>r.Status==2).ToArray());
    public ExportStatusCounts StatusCounts=>ExportAnalyticsService.StatusCounts(Sources.Where(s=>!s.Archive&&s.Available).SelectMany(s=>s.ScopeRows).ToArray());
    public ExportGroup[] Countries=>ExportAnalyticsService.Group(Sources.Where(s=>!s.Archive&&s.Available).SelectMany(s=>s.Rows).Where(r=>r.Status==2).ToArray(),r=>r.Country,r=>r.Country);
}
public sealed record ExportStatusCounts(int InProgress,int Loaded,int Shipped,int Unknown);

using System.Globalization;
namespace Vitasouss;

public sealed class AnalyticsQuery
{
    public static AnalyticsQuery Parse(IQueryCollection values)
    {
        var allowed=new HashSet<string>(["otherContext","previousContext","previousOtherContext","period","from","to","category","product","variety","producer","orchard","crateType","movement","search","sort","asc","page"],StringComparer.OrdinalIgnoreCase);
        if(values.Any(v=>!allowed.Contains(v.Key)||v.Value.Count!=1))throw new RuleException("Paramètre inconnu ou répété.");
        string? Text(string name)=>values.TryGetValue(name,out var v)?v.ToString():null;
        int? Number(string name)=>Text(name) is not {Length:>0} text?null:int.TryParse(text,NumberStyles.Integer,CultureInfo.InvariantCulture,out var n)?n:throw new RuleException("Paramètre numérique invalide : "+name);
        var asc=Text("asc");if(asc is not null&&!bool.TryParse(asc,out _))throw new RuleException("Ordre de tri invalide.");
        return new(){OtherContext=Number("otherContext"),PreviousContext=Number("previousContext"),PreviousOtherContext=Number("previousOtherContext"),Period=Text("period")??"campaign",From=Text("from"),To=Text("to"),Category=Number("category"),Product=Number("product"),Variety=Number("variety"),Producer=Number("producer"),Orchard=Number("orchard"),CrateType=Number("crateType"),Movement=Text("movement"),Search=Text("search"),Sort=Text("sort")??"date",Asc=asc is not null&&bool.Parse(asc),Page=Number("page")??1};
    }
    public int? OtherContext { get; set; }
    public int? PreviousContext { get; set; }
    public int? PreviousOtherContext { get; set; }
    public string Period { get; set; } = "campaign";
    public string? From { get; set; }
    public string? To { get; set; }
    public int? Category { get; set; }
    public int? Product { get; set; }
    public int? Variety { get; set; }
    public int? Producer { get; set; }
    public int? Orchard { get; set; }
    public int? CrateType { get; set; }
    public string? Movement { get; set; }
    public string? Search { get; set; }
    public string Sort { get; set; } = "date";
    public bool Asc { get; set; }
    public int Page { get; set; } = 1;
}
public sealed record AnalyticsCampaign(DateTime Start, DateTime End, string Label);
public sealed record AnalyticsPeriod(DateTime From, DateTime To)
{
    public static DateTime Today() => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,TimeZoneInfo.FindSystemTimeZoneById("Africa/Casablanca")).Date;
    public static AnalyticsPeriod Resolve(AnalyticsQuery q, AnalyticsCampaign c, DateTime today)
    {
        DateTime Parse(string? v) => DateTime.TryParseExact(v,"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var d)?d:throw new RuleException("Période personnalisée : deux dates valides sont requises.");
        AnalyticsPeriod p=q.Period switch {
            "today"=>new(today,today), "yesterday"=>new(today.AddDays(-1),today.AddDays(-1)),
            "seven"=>new(today.AddDays(-6),today), "month"=>new(new(today.Year,today.Month,1),today),
            "week"=>new(today.AddDays(-((7+(int)today.DayOfWeek-1)%7)),today),
            "campaign"=>new(c.Start,c.End),"custom"=>new AnalyticsPeriod(Parse(q.From),Parse(q.To)),
            _=>throw new RuleException("Période inconnue.")};
        if(p.From>p.To || (p.To-p.From).TotalDays>1095)throw new RuleException("Période invalide ou supérieure à trois ans.");
        return p;
    }
    public static AnalyticsPeriod Align(AnalyticsPeriod current,AnalyticsCampaign campaign,AnalyticsCampaign previous)
    {
        if(previous.Start>=campaign.Start || previous.End>=campaign.Start || previous.Start.Year!=campaign.Start.Year-1)
            throw new RuleException("Sélectionnez une campagne précédente compatible et sans chevauchement.",409);
        return new(previous.Start.AddDays((current.From-campaign.Start).Days),previous.Start.AddDays((current.To-campaign.Start).Days));
    }
}
public sealed class AnalyticsDetail
{
    public string Station { get; set; }="";
    public int ContextId { get; set; }
    public long Number { get; set; }
    public string? Date { get; set; }
    public int? ProducerId { get; set; }
    public string Producer { get; set; }="";
    public int? OrchardId { get; set; }
    public string Orchard { get; set; }="";
    public string Category { get; set; }="";
    public string Product { get; set; }="";
    public string Variety { get; set; }="";
    public decimal? NetKg { get; set; }
    public long? Quantity { get; set; }
    public string Crate { get; set; }="";
    public string? Movement { get; set; }
}
public sealed class AnalyticsBucket
{
    public string Station { get; set; }="";
    public string Key { get; set; }="";
    public string Label { get; set; }="";
    public decimal? Kg { get; set; }
    public long Count { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? Entries { get; set; }
    public decimal? Exits { get; set; }
    public decimal? EntriesPallets { get; set; }
    public decimal? ExitsPallets { get; set; }
    public long InvalidFlowQuantities { get; set; }
    public long InvalidPalletQuantities { get; set; }
}
public sealed class AnalyticsMetrics
{
    public decimal? SelectedKg { get; set; }
    public decimal? TodayKg { get; set; }
    public decimal? YesterdayKg { get; set; }
    public decimal? SevenKg { get; set; }
    public decimal? MonthKg { get; set; }
    public decimal? CampaignKg { get; set; }
    public decimal? PreviousKg { get; set; }
    public long Lots { get; set; }
    public long Producers { get; set; }
    public long Varieties { get; set; }
    public long MissingNet { get; set; }
    public long MissingDate { get; set; }
}
public sealed class AnalyticsSource
{
    public int ContextId { get; set; }
    public string Station { get; set; }="";
    public bool Available { get; set; }
    public AnalyticsCampaign? Campaign { get; set; }
    public AnalyticsPeriod? Period { get; set; }
    public AnalyticsMetrics Metrics { get; set; }=new();
    public long Total { get; set; }
    public AnalyticsDetail[] Rows { get; set; }=[];
    public AnalyticsBucket[] Daily { get; set; }=[];
    public AnalyticsBucket[] Weekly { get; set; }=[];
    public AnalyticsBucket[] Varieties { get; set; }=[];
    public AnalyticsBucket[] Producers { get; set; }=[];
    public AnalyticsBucket[] Movements { get; set; }=[];
    public AnalyticsCrateFlow[] CrateFlows { get; set; }=[];
    public Dictionary<string,object[]> Options { get; set; }=new();
    public object? Estimates { get; set; }
    public List<string> Warnings { get; set; }=[];
}

public sealed class AnalyticsCrateFlow
{
    public string Scope { get; set; } = "type";
    public int? ProducerId { get; set; }
    public int? OrchardId { get; set; }
    public int? CrateType { get; set; }
    public string Label { get; set; } = "";
    public string ProducerLabel { get; set; } = "";
    public string OrchardLabel { get; set; } = "";
    public string Crate { get; set; } = "";
    public decimal Entries { get; set; }
    public decimal Exits { get; set; }
    public decimal EntriesPallets { get; set; }
    public decimal ExitsPallets { get; set; }
    public long Invalid { get; set; }
    public long InvalidPallets { get; set; }
    public long Incoherent { get; set; }
    public decimal? PhysicalVariation => Invalid == 0 ? Entries - Exits : null;
    public decimal? ProducerMovementBalance => Invalid == 0 && Incoherent == 0 ? Exits - Entries : null;
    public decimal? PalletMovementBalance => InvalidPallets == 0 && Incoherent == 0 ? ExitsPallets - EntriesPallets : null;
    // Ownership/nature and initial debts are not evidenced by historical E/S alone.
    public decimal? ProducerDebt => null;
}

public sealed record CrateProducerSituation(int ContextId,string Station,int? ProducerId,string Producer,int? CrateType,string Crate,decimal Entries,decimal Exits,decimal? CrateBalance,decimal EntriesPallets,decimal ExitsPallets,decimal? PalletBalance,long Invalid,long InvalidPallets,long Incoherent);
public sealed record CrateProducerTotal(int ContextId,string Station,int? CrateType,string Crate,decimal Entries,decimal Exits,decimal? CrateBalance,decimal EntriesPallets,decimal ExitsPallets,decimal? PalletBalance,long Invalid,long InvalidPallets,long Incoherent);
public sealed record CrateProducerSituationPage(CrateProducerSituation[] Rows,CrateProducerTotal[] Totals,int Page,int PageSize,int Total,bool Complete,string[] Warnings);


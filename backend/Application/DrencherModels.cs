namespace Vitasouss;

public record DrSchemaColumn(string Table,string Name,string Type,string Nullable,string Extra);

public record DrProduct(int Id, string Reference, string Nom, string Unite, bool Actif, string? MatiereActive=null,bool AfficherF04=true) {
 public DrProduct():this(0,"","","",false,null,true){}
}
public record DrDose(int ProduitId, decimal Dose);
public record DrProgramRequest(int Id, int Version, string Nom, bool Actif, DrDose[] Produits);
public record DrProgram(int Id, int Version, string Nom, bool Actif, DrDose[] Produits);
public record DrAllocation(int LotId, decimal Quantite);
public record DrUsage(int ProduitId, decimal Dose, decimal? Machine, decimal? Reel, DrAllocation[] Lots);
public record DrCycleRequest(int Version, string Date, string Debut, string Fin, int ProgrammeId,
 int ProgrammeVersion, decimal EauInitiale, decimal EauConsommee, int[] Palettes, DrUsage[] Produits,
 string Observations, string Motif);
public record DrPalette(int Numpal, int Numrec, int? Codvar, string? Variete, int? Refver,
 string? Verger, int? Refadh, string? Adherent, decimal? Poids, int? CycleTraite) {
 public DrPalette():this(0,0,null,null,null,null,null,null,null,null){}
}
public record DrUsageSnapshot(int ProduitId, string Reference, string Nom, string Unite,
 decimal Dose, decimal? DoseProgramme, decimal Initial, decimal Final, decimal? Machine,
 decimal? Reel, decimal? EcartTheorique, decimal? EcartMachine, bool HorsProgramme, bool DoseModifiee,
 DrLotSnapshot[] Lots,string? MatiereActive=null,bool AfficherF04=true);
public record DrLotSnapshot(int LotId, string Lot, DateTime? Peremption, decimal Quantite);
public record DrSnapshot(string Date, string Debut, string Fin, int ProgrammeId, int ProgrammeVersion,
 string ProgrammeNom, decimal EauInitiale, decimal EauConsommee, string UnitePoids,
 DrPalette[] Palettes, DrUsageSnapshot[] Produits, string Observations);
public record DrTransition(int Version, string Motif);
public record DrStockRequest(int ProduitId, string Lot, string? Peremption, decimal Quantite, string Bon, string Date);
public static class DrMath
{
 public static decimal Amount(decimal water, decimal dose) => decimal.Round(water*dose/1000m,6,MidpointRounding.AwayFromZero);
 public static void Quantity(decimal value, string label) {
  if(value<0 || value>999999999m || decimal.Round(value,6)!=value) throw new RuleException(label+" : quantité positive, au maximum 6 décimales.");
 }
 public static DateTime Date(string value) => DateTime.TryParseExact(value,"yyyy-MM-dd",System.Globalization.CultureInfo.InvariantCulture,System.Globalization.DateTimeStyles.None,out var date) ? date : throw new RuleException("Date invalide (AAAA-MM-JJ).");
 public static string Text(string? value,int max,string label,bool required=true) {
  value=(value??"").Trim(); if(value.Length>max || required && value.Length==0) throw new RuleException(label+" : valeur obligatoire ou trop longue.");return value;
 }
 public static void Time(string start,string end) {
  if(!TimeOnly.TryParseExact(start,"HH:mm",out var a)||!TimeOnly.TryParseExact(end,"HH:mm",out var b)||b<a) throw new RuleException("Heures invalides : fin après début le même jour.");
 }
}

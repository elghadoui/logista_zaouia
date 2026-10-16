using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.Rendering;
using PdfSharp.Fonts;

namespace Vitasouss;

// IIS uses the Windows Arial font. No Office, browser, external process or network access is needed.
public static class BaselineStockPdf {
 static readonly object Gate=new();
 public static byte[] Render(DrReport report) {
  lock(Gate) {
   if(OperatingSystem.IsWindows())GlobalFontSettings.UseWindowsFontsUnderWindows=true;
   var d=new Document();d.Info.Title=report.Title;d.Info.Author="VITASOUSS / ZAOUIA";d.Info.Subject=report.Reference+" / "+report.Id;
   var normal=d.Styles[StyleNames.Normal]!;normal.Font.Name="Arial";normal.Font.Size=9;normal.ParagraphFormat.SpaceAfter=Unit.FromMillimeter(1);
   var s=d.AddSection();s.PageSetup.PageFormat=PageFormat.A4;s.PageSetup.Orientation=Orientation.Landscape;
   s.PageSetup.LeftMargin=s.PageSetup.RightMargin=Unit.FromCentimeter(1.2);s.PageSetup.TopMargin=Unit.FromCentimeter(report.CycleHeader is null?3.1:3.8);s.PageSetup.BottomMargin=Unit.FromCentimeter(1.6);s.PageSetup.HeaderDistance=Unit.FromCentimeter(0.6);s.PageSetup.FooterDistance=Unit.FromCentimeter(0.6);
   var h=s.Headers.Primary.AddParagraph("ZAOUIA / VITASOUSS — DRENCHER");h.Format.Font.Size=10;h.Format.Font.Bold=true;h.Format.Font.Color=Color.FromRgb(23,77,59);
   h=s.Headers.Primary.AddParagraph(report.Title+" — "+report.Reference);h.Format.Font.Size=13;h.Format.Font.Bold=true;
   h=s.Headers.Primary.AddParagraph(report.Mode.ToUpperInvariant()+" — "+report.Context);h.Format.Font.Size=8;
   if(report.CycleHeader is not null){h=s.Headers.Primary.AddParagraph(report.CycleHeader);h.Format.Font.Size=8;h.Format.Font.Bold=true;}
   string warning=(report.Mode=="Recette"?"RECETTE — DONNÉES DE TEST — ":"")+report.Warning;
   if(warning.Length>0){h=s.Headers.Primary.AddParagraph(warning);h.Format.Font.Bold=true;h.Format.Font.Color=Colors.DarkRed;h.Format.Font.Size=9;}
   var footer=s.Footers.Primary.AddParagraph($"Document {report.Id} — Édition {report.IssuedUtc:yyyy-MM-dd HH:mm:ss} UTC — Page ");footer.Format.Font.Size=7;footer.AddPageField();footer.AddText(" / ");footer.AddNumPagesField();
   foreach(var note in report.Notes){var p=s.AddParagraph(note);p.Format.Font.Size=9;}
   foreach(var source in report.Tables){
    if(source.Title.StartsWith("Annexe"))s.AddPageBreak();
    var title=s.AddParagraph(source.Title);title.Format.Font.Bold=true;title.Format.SpaceBefore=Unit.FromMillimeter(3);title.Format.KeepWithNext=true;
    var t=s.AddTable();t.Rows.LeftIndent=Unit.Zero;t.Borders.Width=0.4;t.Borders.Color=Color.FromRgb(190,202,196);t.TopPadding=t.BottomPadding=Unit.FromMillimeter(1.1);t.Format.Font.Size=source.Columns.Length>7?8:9;
    foreach(var column in source.Columns)t.AddColumn(Unit.FromCentimeter(27.3/source.Columns.Length));
    var header=t.AddRow();header.HeadingFormat=true;header.Shading.Color=Color.FromRgb(23,77,59);header.Format.Font.Color=Colors.White;header.Format.Font.Bold=true;
    for(int i=0;i<source.Columns.Length;i++)header.Cells[i].AddParagraph(source.Columns[i]);
    if(source.Rows.Count==0){var empty=t.AddRow();empty.Cells[0].MergeRight=source.Columns.Length-1;empty.Cells[0].AddParagraph("Aucune donnée pour les filtres sélectionnés.");}
    foreach(var values in source.Rows){
     // Bound each physical row while preserving every character of unusually long historical labels.
     var chunks=values.Select(v=>Chunks(v??"",240)).ToArray();int count=chunks.Max(c=>c.Length);
     for(int part=0;part<count;part++) {var row=t.AddRow();row.VerticalAlignment=VerticalAlignment.Center;
      for(int i=0;i<source.Columns.Length;i++)row.Cells[i].AddParagraph(part<chunks[i].Length?chunks[i][part]:"");
     }
    }
   }
   var renderer=new PdfDocumentRenderer{Document=d};renderer.RenderDocument();using var stream=new MemoryStream();renderer.PdfDocument.Save(stream,false);return stream.ToArray();
  }
 }
 static string[] Chunks(string value,int max) {
  if(value.Length==0)return [""];var result=new List<string>();
  for(int i=0;i<value.Length;i+=max)result.Add(value.Substring(i,Math.Min(max,value.Length-i)));
  return result.ToArray();
 }
}

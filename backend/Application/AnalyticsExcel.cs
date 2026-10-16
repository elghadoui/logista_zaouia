using System.IO.Compression;
using System.Xml;
using System.Globalization;
namespace Vitasouss;
public static class AnalyticsExcel
{
    public static byte[] CreateCrateSituation(CrateProducerSituationPage page,AnalyticsQuery q)
    {
        var rows=new List<object?[]>{new object?[]{"Station","Contexte","Référence producteur","Producteur","Type caisse","Entrées caisses","Sorties caisses","Solde mouvements caisses (S−E)","Entrées palettes","Sorties palettes","Solde mouvements palettes (S−E)","Contrôle"}};
        rows.AddRange(page.Rows.Select(r=>new object?[]{r.Station,r.ContextId,r.ProducerId,r.Producer,r.Crate+" ["+(r.CrateType?.ToString()??"?")+']',r.Invalid>0?null:r.Entries,r.Invalid>0?null:r.Exits,r.CrateBalance,r.InvalidPallets>0?null:r.EntriesPallets,r.InvalidPallets>0?null:r.ExitsPallets,r.PalletBalance,r.Invalid>0||r.InvalidPallets>0||r.Incoherent>0?"À vérifier":"Flux observé"}));
        rows.AddRange(page.Totals.Select(r=>new object?[]{r.Station,r.ContextId,null,"TOTAL",r.Crate+" ["+(r.CrateType?.ToString()??"?")+']',r.Invalid>0?null:r.Entries,r.Invalid>0?null:r.Exits,r.CrateBalance,r.InvalidPallets>0?null:r.EntriesPallets,r.InvalidPallets>0?null:r.ExitsPallets,r.PalletBalance,r.Invalid>0||r.InvalidPallets>0||r.Incoherent>0?"À vérifier":"Total par type"}));
        return Create([],q,"caisserie-situation",rows);
    }
    // Minimal Open XML workbook: typed numeric cells and inline strings, never formula cells.
    public static byte[] Create(AnalyticsSource[] sources,AnalyticsQuery q,string module,IEnumerable<object?[]>? customData=null,IEnumerable<object?[]>? extraContext=null,string version="1.5.1")
    {
        var current=sources.Take(q.OtherContext.HasValue?2:1).ToArray();
        if(current.Any(s=>!s.Available))throw new RuleException("Export refusé : une source est indisponible.",409);
        if(current.Sum(s=>s.Total)>20000)throw new RuleException("Export limité à 20 000 lignes : réduisez les filtres.",413);
        using var stream=new MemoryStream();
        using(var zip=new ZipArchive(stream,ZipArchiveMode.Create,true))
        {
            void Part(string name,string content){
                if(name=="[Content_Types].xml")content=content.Replace("</Types>","<Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/></Types>");
                if(name=="xl/_rels/workbook.xml.rels")content=content.Replace("</Relationships>","<Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/></Relationships>");
                using var writer=new StreamWriter(zip.CreateEntry(name).Open());writer.Write(content);
            }
            Part("xl/styles.xml","<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><numFmts count=\"1\"><numFmt numFmtId=\"164\" formatCode=\"yyyy-mm-dd\"/></numFmts><fonts count=\"2\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font><font><b/><sz val=\"11\"/><name val=\"Calibri\"/></font></fonts><fills count=\"2\"><fill><patternFill patternType=\"none\"/></fill><fill><patternFill patternType=\"gray125\"/></fill></fills><borders count=\"1\"><border/></borders><cellStyleXfs count=\"1\"><xf/></cellStyleXfs><cellXfs count=\"3\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/><xf numFmtId=\"164\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyNumberFormat=\"1\"/><xf numFmtId=\"0\" fontId=\"1\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyFont=\"1\"/></cellXfs><cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles></styleSheet>");
            Part("[Content_Types].xml","<?xml version=\"1.0\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/><Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/><Override PartName=\"/xl/worksheets/sheet2.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/></Types>");
            Part("_rels/.rels","<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/></Relationships>");
            Part("xl/workbook.xml","<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"><sheets><sheet name=\"Données\" sheetId=\"1\" r:id=\"rId1\"/><sheet name=\"Contexte\" sheetId=\"2\" r:id=\"rId2\"/></sheets></workbook>");
            Part("xl/_rels/workbook.xml.rels","<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/><Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet2.xml\"/></Relationships>");
            void Sheet(string path,IEnumerable<object?[]> rows)
            {
                var materialized=rows.ToArray();
                using var x=XmlWriter.Create(zip.CreateEntry(path).Open(),new XmlWriterSettings{Encoding=new System.Text.UTF8Encoding(false),CloseOutput=true});
                const string ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
                x.WriteStartElement("worksheet",ns);
                x.WriteStartElement("sheetViews",ns);x.WriteStartElement("sheetView",ns);x.WriteAttributeString("workbookViewId","0");x.WriteStartElement("pane",ns);x.WriteAttributeString("ySplit","1");x.WriteAttributeString("topLeftCell","A2");x.WriteAttributeString("state","frozen");x.WriteEndElement();x.WriteEndElement();x.WriteEndElement();
                x.WriteStartElement("cols",ns);x.WriteStartElement("col",ns);x.WriteAttributeString("min","1");x.WriteAttributeString("max","16");x.WriteAttributeString("width","23");x.WriteAttributeString("customWidth","1");x.WriteEndElement();x.WriteEndElement();
                x.WriteStartElement("sheetData",ns);var rowNumber=0;
                foreach(var row in materialized){rowNumber++;x.WriteStartElement("row",ns);foreach(var value in row){x.WriteStartElement("c",ns);
                    if(value is DateTime date){x.WriteAttributeString("s","1");x.WriteElementString("v",ns,date.ToOADate().ToString(CultureInfo.InvariantCulture));}
                    else if(value is byte or short or int or long or decimal or double){x.WriteElementString("v",ns,Convert.ToString(value,CultureInfo.InvariantCulture));}
                    else{if(rowNumber==1)x.WriteAttributeString("s","2");x.WriteAttributeString("t","inlineStr");x.WriteStartElement("is",ns);x.WriteStartElement("t",ns);var text=Convert.ToString(value,CultureInfo.InvariantCulture)??"";x.WriteString(new string(text.Where(XmlConvert.IsXmlChar).ToArray()));x.WriteEndElement();x.WriteEndElement();}x.WriteEndElement();}x.WriteEndElement();}
                x.WriteEndElement();if(path.EndsWith("sheet1.xml")){x.WriteStartElement("autoFilter",ns);x.WriteAttributeString("ref",$"A1:{ColumnName(materialized.Length==0?1:materialized.Max(r=>r.Length))}{rowNumber}");x.WriteEndElement();}x.WriteEndElement();
            }
            static string ColumnName(int n){var name="";while(n>0){n--;name=(char)('A'+n%26)+name;n/=26;}return name;}
            var data=customData?.ToList()??new List<object?[]>{new object?[]{"Station","Contexte","Réception / mouvement","Date","Adhérent","Producteur","Verger référence","Verger","Catégorie (culture)","Produit (groupe)","Variété","Poids net kg","Tonnes","Type caisse","Mouvement","Quantité caisses"}};
            if(customData is null)data.AddRange(AnalyticsService.Order(current.SelectMany(s=>s.Rows),q).Select(r=>new object?[]{r.Station,r.ContextId,r.Number,DateTime.TryParseExact(r.Date,"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var d)?(object)d:r.Date,r.ProducerId,r.Producer,r.OrchardId,r.Orchard,r.Category,r.Product,r.Variety,r.NetKg,r.NetKg/1000,r.Crate,r.Movement,r.Quantity}));
            Sheet("xl/worksheets/sheet1.xml",data);
            var context=new List<object?[]>{new object?[]{"VITASOUSS "+version,module,"Export lecture seule",DateTime.UtcNow.ToString("O")},new object?[]{"Filtres",System.Text.Json.JsonSerializer.Serialize(q)},new object?[]{"Source","Campagne","Début","Fin","Période sélectionnée"}};
            if(extraContext is not null)context.AddRange(extraContext);
            foreach(var s in current){context.Add([s.Station,s.Campaign?.Label,s.Campaign?.Start.ToString("yyyy-MM-dd"),s.Campaign?.End.ToString("yyyy-MM-dd"),$"{s.Period?.From:yyyy-MM-dd} / {s.Period?.To:yyyy-MM-dd}"]);context.AddRange(s.Warnings.Select(w=>new object?[]{"Limite",w}));}
            Sheet("xl/worksheets/sheet2.xml",context);
        }
        return stream.ToArray();
    }
}

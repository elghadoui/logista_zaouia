using PdfSharp.Drawing;
using PdfSharp.Pdf;
using System.Globalization;

namespace Vitasouss;

// Dedicated station form. Generic stock-report rendering remains unchanged.
public static class DrencherF04Pdf {
 const double Left=13,Width=816,BodyY=110,BodyHeight=210;
 static readonly double[] Columns=[73,55,99,63,55,75,102,55,110,55,74];
 static readonly XFont Body=new("Times New Roman",8);
 static readonly XFont Small=new("Times New Roman",7.5);
 static readonly XFont Bold=new("Times New Roman",8,XFontStyleEx.Bold);
 record Fruit(DrPalette[] Palettes) {
  public DrPalette First=>Palettes[0];
 }
 record Extra(string Label,string Text);
 record FormPage(Fruit[] Fruits,DrUsageSnapshot[] Products,bool RepeatFruit,bool RepeatProducts);
 public static byte[] Render(DrReport report,DrF04Data data) {
  var s=data.Snapshot with{Produits=data.Snapshot.Produits.Where(p=>p.AfficherF04).ToArray()};
  var fruits=s.Palettes.GroupBy(p=>new{p.Numrec,p.Codvar,p.Variete,p.Refadh,p.Adherent,p.Refver,p.Verger}).OrderBy(g=>g.Key.Numrec).Select(g=>new Fruit(g.OrderBy(p=>p.Numpal).ToArray())).ToArray();
  var forms=new List<FormPage>();
  var fruitChunks=fruits.Chunk(6).ToArray();if(fruitChunks.Length==0)fruitChunks=[[]];
  var productChunks=s.Produits.Chunk(4).ToArray();if(productChunks.Length==0)productChunks=[[]];
  // Products apply to the entire cycle, not just the fruit lots visible on one page.
  int count=Math.Max(fruitChunks.Length,productChunks.Length);
  for(int i=0;i<count;i++)forms.Add(new(fruitChunks[Math.Min(i,fruitChunks.Length-1)],productChunks[Math.Min(i,productChunks.Length-1)],i>=fruitChunks.Length,i>=productChunks.Length));
  var extras=new List<Extra>();var doc=new PdfDocument();doc.Info.Title="F04 MPS-01 V06 — Suivi du traitement au niveau du Drencher";doc.Info.Author="ZAOUIA / VITASOUSS";doc.Info.Subject=report.Id;
  for(int i=0;i<forms.Count;i++) {var page=Page(doc);using var g=XGraphics.FromPdfPage(page);DrawForm(g,report,data with{Snapshot=s},forms[i],i,forms.Count,extras);}
  var annexes=AnnexLines(extras.Distinct().ToArray()).Chunk(43).ToArray();
  foreach(var lines in annexes){var page=Page(doc);using var g=XGraphics.FromPdfPage(page);Header(g);Text(g,(report.Mode=="Recette"?"RECETTE — DONNÉES DE TEST. ":"")+report.Warning+(data.QuantityMode=="reel"?"":" — "+QuantityLabel(data.QuantityMode)),Left,52,Width,10,Small,false,true);Text(g,"Annexe de traçabilité — compléments ne tenant pas dans le formulaire",Left,65,Width,18,Bold);Text(g,$"Cycle n° {data.CycleId} / révision {data.Revision} — Traitement {s.Date}, {s.Debut} à {s.Fin}",Left,83,Width,10,Small,false);double y=104;foreach(var line in lines){g.DrawString(line,Body,XBrushes.Black,new XPoint(Left+2,y));y+=10.5;}Footer(g,report,data);}
  for(int i=0;i<doc.Pages.Count;i++){using var g=XGraphics.FromPdfPage(doc.Pages[i],XGraphicsPdfPageOptions.Append);Text(g,$"Page {i+1} sur {doc.Pages.Count}",Left+Width-76,12,76,13,Body);}
  using var stream=new MemoryStream();doc.Save(stream,false);return stream.ToArray();
 }
 static PdfPage Page(PdfDocument d){var p=d.AddPage();p.Width=XUnit.FromPoint(841.89);p.Height=XUnit.FromPoint(595.28);return p;}
 static void Header(XGraphics g){
  Box(g,Left,12,128,37);Box(g,Left+128,12,Width-204,25);Box(g,Left+128,37,Width-204,12);Box(g,Left+Width-76,12,76,13);Box(g,Left+Width-76,25,76,24);
  var logo=Path.Combine(AppContext.BaseDirectory,"pdf-assets","f04-zaouia.png");
  if(File.Exists(logo)){using var img=XImage.FromFile(logo);g.DrawImage(img,Left+7,15,114,31);}else Text(g,"ZAOUIA",Left,12,128,37,new XFont("Times New Roman",15,XFontStyleEx.Bold));
  Text(g,"Suivi du Traitement au Niveau de Drencher",Left+128,12,Width-204,25,new XFont("Times New Roman",13,XFontStyleEx.Bold));
  Text(g,"Liste de distribution : Agent réception, Opérateur Drencher",Left+128,37,Width-204,12,Body);
  Text(g,"F04 MPS-01 V06",Left+Width-76,25,76,24,Bold);
 }
 static void DrawForm(XGraphics g,DrReport r,DrF04Data d,FormPage p,int pageIndex,int formCount,List<Extra> extras){
  var s=d.Snapshot;Header(g);
  var flag=(r.Mode=="Recette"?"RECETTE — DONNÉES DE TEST. ":"")+r.Warning+(d.QuantityMode=="reel"?"":" — "+QuantityLabel(d.QuantityMode));
  Text(g,string.IsNullOrWhiteSpace(flag)?$"Statut : {d.Status}":flag,Left,52,Width,10,Small,center:false,red:flag.Length>0);
  var info=$"Cycle n° {d.CycleId} / révision {d.Revision} — Programme : {s.ProgrammeNom}, version {s.ProgrammeVersion}.";
  CellText(g,info,Left,62,Width,15,Body,extras,"Programme du cycle",false);
  double x=Left;var offsets=new double[12];offsets[0]=Left;for(int i=0;i<Columns.Length;i++)offsets[i+1]=offsets[i]+Columns[i];
  string[] first=["Date","Heure","Variété","Producteur","N° lot"];
  for(int i=0;i<5;i++){Box(g,x,80,Columns[i],30,true);Text(g,first[i],x,80,Columns[i],30,Bold);x+=Columns[i];}
  double productWidth=Columns.Skip(5).Take(5).Sum();Box(g,x,80,productWidth,13,true);Text(g,"Produit utilisé",x,80,productWidth,13,Bold);
  string[] second=["Nom commercial","M.A","Dosage",QuantityLabel(d.QuantityMode),"N° de lot"];
  for(int i=5;i<10;i++){Box(g,offsets[i],93,Columns[i],17,true);Text(g,second[i-5],offsets[i],93,Columns[i],17,Bold);}
  Box(g,offsets[10],80,Columns[10],13,true);Text(g,"Tonnage",offsets[10],80,Columns[10],13,Bold);Box(g,offsets[10],93,Columns[10],17,true);Text(g,"Traité (T)",offsets[10],93,Columns[10],17,Bold);
  Box(g,Left,BodyY,Columns[0],BodyHeight);Text(g,s.Date,Left,BodyY,Columns[0],BodyHeight,Body);
  Box(g,offsets[1],BodyY,Columns[1],BodyHeight);Text(g,s.Debut+"\nà "+s.Fin,offsets[1],BodyY,Columns[1],BodyHeight,Body);
  int fruitRows=p.Fruits.Length<=1?1:p.Fruits.Length<=3?3:6;
  double fruitRow=BodyHeight/fruitRows;
  for(int row=0;row<fruitRows;row++) {
   double y=BodyY+row*fruitRow;
   foreach(int col in new[]{2,3,4,10})Box(g,offsets[col],y,Columns[col],fruitRow);
   if(row>=p.Fruits.Length)continue;var f=p.Fruits[row];var a=f.First;
   CellText(g,Label(a.Variete,a.Codvar),offsets[2],y,Columns[2],fruitRow,Body,extras,$"Variété réception {a.Numrec}");
   CellText(g,Label(a.Adherent,a.Refadh)+"\nVerger : "+Label(a.Verger,a.Refver),offsets[3],y,Columns[3],fruitRow,Small,extras,$"Producteur et verger réception {a.Numrec}",true,$"Adh. {a.Refadh?.ToString()??"NR"}\nVerger {a.Refver?.ToString()??"NR"}\nVoir annexe");
   string palettes=Compress(f.Palettes.Select(a=>a.Numpal));
   CellText(g,$"Réception {a.Numrec}\n{f.Palettes.Length} palettes\n{palettes}",offsets[4],y,Columns[4],fruitRow,Small,extras,$"Réception {a.Numrec} — palettes");
   CellText(g,N(Weight(f.Palettes,s.UnitePoids)/1000)+(f.Palettes.Any(a=>a.Poids is null)?"\npartiel":""),offsets[10],y,Columns[10],fruitRow,Body,extras,$"Tonnage réception {a.Numrec}");
  }
  int productCount=Math.Max(1,p.Products.Length);double productRow=BodyHeight/productCount;
  for(int row=0;row<productCount;row++){
   double y=BodyY+row*productRow;for(int col=5;col<10;col++)Box(g,offsets[col],y,Columns[col],productRow);
   if(p.Products.Length==0)continue;var u=p.Products[row];
   CellText(g,u.Nom+"\nRéf. "+u.Reference,offsets[5],y,Columns[5],productRow,Bold,extras,"Nom du produit "+u.Reference);
   CellText(g,string.IsNullOrWhiteSpace(u.MatiereActive)?"Non renseignée /\nnon vérifiée":u.MatiereActive,offsets[6],y,Columns[6],productRow,Body,extras,"Matière active "+u.Reference);
   CellText(g,N(u.Dose)+" "+u.Unite+"\n/ 1 000 L d'eau",offsets[7],y,Columns[7],productRow,Body,extras,"Dose "+u.Reference);
   Text(g,N(Quantity(u,d.QuantityMode))+" "+u.Unite+"\n("+(d.QuantityMode=="reel"?"réel physique":d.QuantityMode=="theorique"?"théorique finale":"machine")+")",offsets[8],y,Columns[8],productRow,Body);
   var lots=u.Lots.Length==0?"Non renseigné":string.Join("\n",u.Lots.Select(l=>l.Lot+" : "+N(l.Quantite)+" "+u.Unite+"\nPér. "+(l.Peremption?.ToString("yyyy-MM-dd")??"non renseignée")+(l.Peremption.HasValue&&l.Peremption.Value.Date<DrMath.Date(s.Date)?"\nLOT PÉRIMÉ":"")));
   CellText(g,lots,offsets[9],y,Columns[9],productRow,Small,extras,"Lots fabricants "+u.Reference);
  }
  double totalY=320;double labelWidth=128;
  Row(g,"Total tonnage traité (T) :",N(Weight(p.Fruits.SelectMany(f=>f.Palettes).ToArray(),s.UnitePoids)/1000)+(p.RepeatFruit?" — LOTS REPRIS, NE PAS ADDITIONNER":"")+"  |  Cycle : "+N(Weight(s.Palettes,s.UnitePoids)/1000)+" t / "+N(Weight(s.Palettes,s.UnitePoids))+" kg"+(s.Palettes.Any(p=>p.Poids is null)?" — TOTAL PARTIEL, poids manquants":""),totalY,14,labelWidth,extras);
  Row(g,"Nombre de palettes traitées :",p.Fruits.Sum(f=>f.Palettes.Length)+" sur cette page"+(p.RepeatFruit?" (reprise)":"")+"  |  Cycle : "+s.Palettes.Length,totalY+14,14,labelWidth,extras);
  Row(g,"Quantité de la bouillie (L) :","Initiale : "+N(s.EauInitiale)+" L  |  Total consommé : "+N(s.EauConsommee)+" L",totalY+28,16,labelWidth,extras);
  double colWidth=(Width-labelWidth)/productCount;string[] labels=["Nom commercial du produit :","Quantité calculée initiale :","Quantité calculée finale :","Consommation machine :",d.QuantityMode=="reel"?"Quantité produit consommée :":QuantityLabel(d.QuantityMode)+" :","Écarts / remarques :"];
  double[] heights=[22,16,16,16,16,24];double ry=totalY+44;
  for(int row=0;row<labels.Length;row++) {
   Box(g,Left,ry,labelWidth,heights[row]);Text(g,labels[row],Left+2,ry,labelWidth-4,heights[row],Small,false);
   for(int pi=0;pi<productCount;pi++){double px=Left+labelWidth+pi*colWidth;Box(g,px,ry,colWidth,heights[row]);if(p.Products.Length==0)continue;var u=p.Products[pi];
    string value=row switch{0=>u.Nom+" / "+u.Unite,1=>N(u.Initial)+" "+u.Unite,2=>N(u.Final)+" "+u.Unite,3=>N(u.Machine)+" "+u.Unite,4=>N(Quantity(u,d.QuantityMode))+" "+u.Unite,_=>"Réel - finale : "+N(u.EcartTheorique)+" "+u.Unite+" ; réel - machine : "+N(u.EcartMachine)+" "+u.Unite+(u.HorsProgramme?". Hors programme.":"")+(u.DoseModifiee?". Dose modifiée (prévue : "+N(u.DoseProgramme)+" "+u.Unite+").":"")};
    CellText(g,value,px,ry,colWidth,heights[row],row==0?Bold:Small,extras,labels[row]+" "+u.Reference);
   }
   ry+=heights[row];
  }
  Row(g,"Décision :","C / NC : non renseignée — aucune conformité automatique",ry,14,labelWidth,extras);
  Text(g,"C : Conforme",Left+128,ry+15,100,12,Bold);
  Text(g,"NC : Non conforme",Left+265,ry+15,130,12,Bold);
  Text(g,"Si une NC détectée, informer immédiatement le responsable qualité",Left+405,ry+15,Width-405,12,Bold);
  var notes="Observations : "+(string.IsNullOrWhiteSpace(s.Observations)?"Aucune renseignée":s.Observations)+(!string.IsNullOrWhiteSpace(d.Motif)?" | Motif qualité : "+d.Motif:"");
  CellText(g,notes,Left,ry+28,Width,20,Small,extras,"Observations et motif qualité",false);
  Text(g,"Visa opérateur : "+d.Operator+"\nSignature : ____________________",Left,ry+49,Width/2,25,Body,false);
  Text(g,"Visa Responsable qualité : "+(d.Validator??"Non renseigné")+"\n"+(d.ValidationDate??"Validation non attestée")+" — Signature : ____________________",Left+Width/2,ry+49,Width/2,25,Body,false);
  if(formCount>1)Text(g,$"Fiche {pageIndex+1}/{formCount} : quantités produits pour le cycle complet"+(p.RepeatProducts?" (reprises, ne pas additionner)":"")+".",Left,552,Width,10,Small,false);
  Footer(g,r,d);
 }
 static void Footer(XGraphics g,DrReport r,DrF04Data d){
  Text(g,$"Document {r.Id} — Édition {r.IssuedUtc:yyyy-MM-dd HH:mm:ss} UTC — {r.Context}",Left,566,Width,13,new XFont("Times New Roman",6.8),false);
  Text(g,$"Révision : {d.Action} par {d.RevisionAuthor}, {d.RevisionDate}. Présentation à valider par le responsable qualité.",Left,579,Width,10,new XFont("Times New Roman",6.8),false);
 }
 static void Row(XGraphics g,string label,string value,double y,double height,double labelWidth,List<Extra> extras){Box(g,Left,y,labelWidth,height);Box(g,Left+labelWidth,y,Width-labelWidth,height);Text(g,label,Left+2,y,labelWidth-4,height,Small,false);CellText(g,value,Left+labelWidth,y,Width-labelWidth,height,Body,extras,label,false);}
 static void Box(XGraphics g,double x,double y,double w,double h,bool shade=false){if(shade)g.DrawRectangle(new XSolidBrush(XColor.FromArgb(242,242,242)),x,y,w,h);g.DrawRectangle(new XPen(XColors.Black,0.6),x,y,w,h);}
 static string N(decimal? value)=>value?.ToString("0.######",CultureInfo.GetCultureInfo("fr-FR"))??"Non renseigné";
 static decimal? Quantity(DrUsageSnapshot p,string mode)=>mode switch{"theorique"=>p.Final,"machine"=>p.Machine,_=>p.Reel};
 static string QuantityLabel(string mode)=>mode switch{"theorique"=>"Quantité théorique finale","machine"=>"Quantité machine",_=>"Quantité réelle"};
 static decimal? Weight(DrPalette[] palettes,string unit)=>palettes.Any(p=>p.Poids.HasValue)&&unit is "kg" or "t"?palettes.Sum(p=>p.Poids??0)*(unit=="t"?1000:1):null;
 static string Label(string? name,int? reference)=>(string.IsNullOrWhiteSpace(name)?"Non renseigné":name)+(reference.HasValue?" ("+reference+")":"");
 public static string Compress(IEnumerable<int> numbers){var ns=numbers.Distinct().Order().ToArray();var parts=new List<string>();for(int i=0;i<ns.Length;i++){int start=ns[i],end=start;while(i+1<ns.Length&&ns[i+1]==end+1)end=ns[++i];parts.Add(end==start?start.ToString():end==start+1?start+", "+end:start+" à "+end);}return string.Join(", ",parts);}
 static void CellText(XGraphics g,string value,double x,double y,double w,double h,XFont font,List<Extra> extras,string label,bool center=true,string? fallback=null){
  if(Wrap(g,value,font,w-6).Length*font.Size*1.14>h-4){extras.Add(new(label,value));value=fallback??"Voir annexe";}
  Text(g,value,x,y,w,h,font,center);
 }
 static void Text(XGraphics g,string text,double x,double y,double w,double h,XFont font,bool center=true,bool red=false){
  var lines=Wrap(g,text,font,w-6);double lineHeight=font.Size*1.14;double top=y+Math.Max(2,(h-lines.Length*lineHeight)/2);
  foreach(var line in lines){double tx=center?x+(w-g.MeasureString(line,font).Width)/2:x+3;g.DrawString(line,font,red?XBrushes.DarkRed:XBrushes.Black,new XPoint(tx,top+font.Size));top+=lineHeight;}
 }
 static string[] Wrap(XGraphics g,string text,XFont font,double width){
  var lines=new List<string>();foreach(var paragraph in text.Split('\n')){string line="";foreach(var word in paragraph.Split(' ',StringSplitOptions.RemoveEmptyEntries)){if(g.MeasureString(line.Length==0?word:line+" "+word,font).Width<=width){line=line.Length==0?word:line+" "+word;continue;}if(line.Length>0){lines.Add(line);line="";}string part="";foreach(char c in word){if(part.Length>0&&g.MeasureString(part+c,font).Width>width){lines.Add(part);part="";}part+=c;}line=part;}lines.Add(line);}return lines.ToArray();
 }
 static IEnumerable<string> AnnexLines(Extra[] extras){
  // Same wrapping and fonts as the form, with a bounded physical page of continuation lines.
  using var measureDoc=new PdfDocument();var page=Page(measureDoc);using var g=XGraphics.FromPdfPage(page);
  foreach(var e in extras){foreach(var line in Wrap(g,e.Label+" : "+e.Text,Body,Width-8))yield return line;yield return "";}
 }
}

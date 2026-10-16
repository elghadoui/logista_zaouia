$ErrorActionPreference='Stop'
$out='C:\logista_zaouia\docs\f04-v131-apercus'
$excel=New-Object -ComObject Excel.Application
$excel.Visible=$false
$excel.DisplayAlerts=$false
$excel.AskToUpdateLinks=$false
$excel.AutomationSecurity=3
try {
 foreach($item in @(
  @{path='C:\Users\abdellah\Desktop\DeskTops\drensher\F04 MPS-01 Suivi du traitement au niveau du drencher V05 (2).xlsx';sheet='NADORCOTTE';area='$A$3:$M$32';name='excel-nadorcotte-v06'},
  @{path='C:\Users\abdellah\Desktop\DeskTops\drensher\F04 MPS-01 Suivi du traitement au niveau du drencher V05 (2).xlsx';sheet='CLEM+ORANGE';area='$A$4:$M$32';name='excel-clem-orange-v05'},
  @{path="C:\Users\abdellah\Desktop\l'état Clémentine Oranges 2026 2026.xlsx";sheet='Feuil1';area='$B$2:$L$23';name='excel-fiche-remplie'}
 )) {
  $before=(Get-FileHash -LiteralPath $item.path).Hash
  $book=$excel.Workbooks.Open($item.path,0,$true)
  try {
   $sheet=$book.Worksheets.Item($item.sheet)
   # These settings affect only the read-only in-memory view, never the original file.
   $sheet.PageSetup.PrintArea=$item.area
   $sheet.PageSetup.Orientation=2
   $sheet.PageSetup.PaperSize=9
   $sheet.PageSetup.Zoom=$false
   $sheet.PageSetup.FitToPagesWide=1
   $sheet.PageSetup.FitToPagesTall=1
   $sheet.ExportAsFixedFormat(0,(Join-Path $out ($item.name+'.pdf')),0,$true,$false)
  }finally{$book.Close($false)}
  if((Get-FileHash -LiteralPath $item.path).Hash -ne $before){throw 'Original modifié'}
 }
}finally{$excel.Quit();[void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($excel)}

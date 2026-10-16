$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$picture=New-Object Drawing.Bitmap 1440,980
$g=[Drawing.Graphics]::FromImage($picture)
$g.SmoothingMode='AntiAlias'
$g.TextRenderingHint='AntiAliasGridFit'
$ink=[Drawing.ColorTranslator]::FromHtml('#233c34')
$muted=[Drawing.ColorTranslator]::FromHtml('#73867d')
$green=[Drawing.ColorTranslator]::FromHtml('#174c3c')
function Box($x,$y,$w,$h,$color){$brush=New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($color));$g.FillRectangle($brush,$x,$y,$w,$h);$brush.Dispose()}
function Label($text,$x,$y,$size=13,$color=$ink,$bold=$false){$style=if($bold){[Drawing.FontStyle]::Bold}else{[Drawing.FontStyle]::Regular};$font=[Drawing.Font]::new('Segoe UI',[single]$size,$style,[Drawing.GraphicsUnit]::Pixel);$brush=New-Object Drawing.SolidBrush $color;$g.DrawString($text,$font,$brush,$x,$y);$font.Dispose();$brush.Dispose()}
function Sidebar($x,$y,$w,$h,$compact=$false,$mobile=$false){
 Box $x $y $w $h '#ffffff'
 Box ($x+20) ($y+24) 36 36 '#174c3c';Label 'V' ($x+29) ($y+30) 22 ([Drawing.Color]::White) $true
 if(-not $compact){Label 'VITASOUSS' ($x+68) ($y+25) 19 $ink $true;Label 'CULTIVER LA CONFIANCE' ($x+68) ($y+50) 8 $muted;if($mobile){Label '×' ($x+$w-28) ($y+23) 23}}
 $rows=@('Tableau de bord','Référentiels agricoles','Adhérents','Vergers','Parcelles','Explorer la hiérarchie','Cultures & variétés','Commerce & Export','Conditionnement','Qualité','Opérations','Drencher · Intégration future','Assistant IA','Administration')
 $icons=@('▦','♧','','','','','','◎','◇','✓','⇄','♨','✧','⚙')
 $yy=$y+106
 for($i=0;$i -lt $rows.Count;$i++){
  if($compact -and $i -ge 2 -and $i -le 6){continue}
  $sub=$i -ge 2 -and $i -le 6
  $rh=if($sub){29}else{36}
  if($i -eq 1 -or (-not $compact -and $i -eq 3)){Box ($x+12) ($yy-2) ($w-24) ($rh-3) '#e5f2e9'}
  if($compact){Label $icons[$i] ($x+26) ($yy+5) 22 $green}
  elseif($sub){Label $rows[$i] ($x+58) ($yy+5) 13 $(if($i -eq 3){$green}else{$ink}) ($i -eq 3)}
  else{Label $icons[$i] ($x+23) ($yy+5) 20 $green;Label $rows[$i] ($x+57) ($yy+9) $(if($i -eq 11){11}else{13}) $ink ($i -eq 1);if($i -in 1,7,8,9,10,13){Label $(if($i -eq 1){'⌄'}else{'›'}) ($x+$w-28) ($yy+8) 16 $muted}}
  $yy+=$rh
 }
 Box ($x+14) ($y+$h-65) ($w-28) 1 '#e1e9e4';Box ($x+22) ($y+$h-47) 30 30 '#e5f2e9';Label 'AD' ($x+27) ($y+$h-40) 12 $green $true
 if(-not $compact){Label 'Administrateur' ($x+64) ($y+$h-48) 12 $ink;Label 'ZAOUIA · Exercice courant' ($x+64) ($y+$h-30) 10 $muted}
}
Box 0 0 1440 980 '#f0f3f1';Box 0 0 1440 135 '#ffffff'
Label 'V1.4.1 · PROPOSITION À VALIDER' 32 24 11 $muted $true
Label 'Une navigation plus claire, au rythme de vos métiers.' 32 49 27 $ink $true
Label 'Identité VITASOUSS · Inspiration EduAdmin · Routes et droits conservés' 32 89 14 $muted
Label '01 · Développé' 32 164 18 $ink $true;Label 'Rubriques métier · page active' 32 191 12 $muted
Label '02 · Compact' 660 164 18 $ink $true;Label 'Icônes · infobulles' 660 191 12 $muted
Label '03 · Mobile' 990 164 18 $ink $true;Label 'Tiroir · fermeture · contenu conservé' 990 191 12 $muted
Box 32 220 590 690 '#ffffff';Sidebar 32 220 278 690
Box 310 220 312 690 '#f6f8f6';Box 332 246 265 38 '#ffffff';Label 'ZAOUIA     /     Exercice courant' 349 258 12 $muted
Label 'Vergers' 338 324 27 $ink $true;Label 'Un référentiel partagé.' 338 365 13 $muted;Label 'Des identifiants préservés.' 338 385 13 $muted
Box 332 439 266 130 '#ffffff';Label 'Rechercher un verger…' 347 459 12 $muted;Box 348 501 217 6 '#e1e9e4';Box 348 525 154 6 '#e1e9e4'
Box 332 590 266 205 '#ffffff';for($i=0;$i -lt 6;$i++){Box 348 (613+26*$i) 217 6 '#e1e9e4'}
Box 660 220 296 690 '#f6f8f6';Sidebar 660 220 76 690 $true
Label 'Vergers' 761 324 24 $ink $true;Box 756 439 176 120 '#ffffff';Label 'Référentiels' 750 377 12 $green;Label 'agricoles' 750 394 12 $green
Box 990 220 418 690 '#d3dfd7';Label 'Vergers' 1260 340 22 $muted $true;Sidebar 990 220 270 690 $false $true
Label 'Maquettes originales — non opérationnelles. Le thème sombre est proposé dans la maquette HTML.' 32 932 12 $muted
Label 'Le Drencher existant reste inchangé. La refonte sera implémentée après validation ; les corrections métier avancent indépendamment.' 32 952 12 $muted
$target=Join-Path (Split-Path $PSScriptRoot -Parent) 'docs\sidebar-v141-proposition.png'
$picture.Save($target,[Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$picture.Dispose()
Write-Output $target

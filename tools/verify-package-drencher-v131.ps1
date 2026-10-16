$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$zipPath=Join-Path $root 'VITASOUSS-DRENCHER-V1.3.1-IIS.zip'
$sandbox=Join-Path $root ('.test-data\update-drencher-v131-'+[guid]::NewGuid().ToString('N'))
if(-not [IO.Path]::GetFullPath($sandbox).StartsWith([IO.Path]::GetFullPath((Join-Path $root '.test-data'))+[IO.Path]::DirectorySeparatorChar)){throw 'Dossier de contrôle invalide'}
$site=Join-Path $sandbox 'site';$unpacked=Join-Path $sandbox 'unpacked'
New-Item -ItemType Directory -Path $site,$unpacked | Out-Null
$markers=@('appsettings.Local.json','appsettings.json','web.config','keys\existing.xml','secrets\mysql.protected','secrets\openai.protected','wwwroot\index.html','wwwroot\assets\existing.js','existing-local-file.txt')
$before=@{}
foreach($relative in $markers){$file=Join-Path $site $relative;New-Item -ItemType Directory -Force -Path (Split-Path $file) | Out-Null;[IO.File]::WriteAllText($file,'SYNTHETIC-PRESERVATION-'+[guid]::NewGuid().ToString('N'));$before[$relative]=(Get-FileHash -LiteralPath $file).Hash}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::OpenRead($zipPath)
try {
 $entries=@($zip.Entries | Where-Object {$_.Name})
 foreach($entry in $entries){
  $name=$entry.FullName.Replace('\','/')
  if($name -match '(?i)(^|/)(appsettings[^/]*\.json|web\.config|keys|secrets|logs)(/|$)' -or $entry.Name -match '(?i)\.(protected|pem|pfx|jsonl|sql|xlsx)$' -or $name.StartsWith('update/wwwroot/')){throw ('Fichier non autorisé : '+$name)}
  if($name -match '\.\.'){throw 'Chemin archive invalide'}
  if($entry.Name -match '\.(json|js|md|txt|html|css)$'){$r=[IO.StreamReader]::new($entry.Open());try{$content=$r.ReadToEnd()}finally{$r.Dispose()};if($content -match 'sk-(proj-)?[A-Za-z0-9_-]{24,}' -or $content.Contains('LocalApplicationOnly-2026') -or $content.Contains('LocalTestingOnly-2026')){throw ('Secret dans le paquet : '+$name)}}
 }
}finally{$zip.Dispose()}
Expand-Archive -LiteralPath $zipPath -DestinationPath $unpacked
Copy-Item -Path (Join-Path $unpacked 'update\*') -Destination $site -Recurse -Force
foreach($relative in $markers){if((Get-FileHash -LiteralPath (Join-Path $site $relative)).Hash -ne $before[$relative]){throw ('Fichier existant modifié : '+$relative)}}
$manifest=Get-Content -LiteralPath (Join-Path $unpacked 'docs\update-manifest.json') -Raw | ConvertFrom-Json
foreach($file in $manifest){if((Get-FileHash -LiteralPath (Join-Path $site $file.path)).Hash -ne $file.sha256){throw ('Manifest incorrect : '+$file.path)}}
$summary=Get-Content -LiteralPath (Join-Path $unpacked 'docs\tests-drencher-v131-summary.json') -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath (Join-Path $site 'Vitasouss.Api.dll')).Hash -ne $summary.assemblySha256){throw 'DLL non conforme aux tests'}
if((Get-FileHash -LiteralPath (Join-Path $site 'pdf-assets\f04-zaouia.png')).Hash -ne (Get-FileHash -LiteralPath (Join-Path $root 'backend\pdf-assets\f04-zaouia.png')).Hash){throw 'Logo F04 non conforme'}
foreach($property in $summary.approvedExamples.PSObject.Properties){if((Get-FileHash -LiteralPath (Join-Path (Join-Path $unpacked 'docs\modeles-valides') $property.Name)).Hash -ne $property.Value){throw 'PDF approuvé non conforme'}}
foreach($name in @('PdfSharp.dll','MigraDoc.DocumentObjectModel.dll','MigraDoc.Rendering.dll')){if(-not (Test-Path -LiteralPath (Join-Path $site $name))){throw ('Dépendance absente : '+$name)}}
$proof=[ordered]@{date=[DateTime]::UtcNow.ToString('o');archive='VITASOUSS-DRENCHER-V1.3.1-IIS.zip';sha256=(Get-FileHash -LiteralPath $zipPath).Hash;entries=$entries.Count;updateFiles=$manifest.Count;passed=$true;preserved=$markers;manifestVerified=$true;assemblyVerified=$true;approvedPdfsVerified=$true;logoVerified=$true;secretsExcluded=$true;frontendNotReplaced=$true;sqlIncluded=$false;productionDeploy=$false;testDirectory=$sandbox}
$proof | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $root 'docs\package-verification-drencher-v131.json') -Encoding utf8
$proof | ConvertTo-Json -Depth 5

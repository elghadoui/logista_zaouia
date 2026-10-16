$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$archive=Join-Path $projectRoot 'VITASOUSS-DRENCHER-V1.3-IIS.zip'
$sandbox=Join-Path $projectRoot ('.test-data\update-drencher-v13-'+[guid]::NewGuid().ToString('N'))
if(-not [IO.Path]::GetFullPath($sandbox).StartsWith([IO.Path]::GetFullPath((Join-Path $projectRoot '.test-data'))+[IO.Path]::DirectorySeparatorChar)){throw 'Chemin de test invalide'}
New-Item -ItemType Directory -Path (Join-Path $sandbox 'site'),(Join-Path $sandbox 'unpacked') | Out-Null
$site=Join-Path $sandbox 'site';$unpacked=Join-Path $sandbox 'unpacked'
$markers=@('appsettings.Local.json','appsettings.json','web.config','keys\existing.xml','secrets\mysql.protected','secrets\openai.protected')
foreach($relative in $markers){$file=Join-Path $site $relative;New-Item -ItemType Directory -Force -Path (Split-Path $file) | Out-Null;[IO.File]::WriteAllText($file,'SYNTHETIC-PRESERVATION-'+[guid]::NewGuid().ToString('N'))}
$before=@{};foreach($relative in $markers){$before[$relative]=(Get-FileHash -LiteralPath (Join-Path $site $relative)).Hash}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::OpenRead($archive)
try {
 $entries=@($zip.Entries | Where-Object {$_.Name})
 foreach($entry in $entries){
  if($entry.FullName -match '(?i)(^|/)(appsettings[^/]*\.json|web\.config|keys|secrets|logs)(/|$)' -or $entry.Name -match '(?i)\.(protected|pem|pfx|jsonl)$'){throw ('Fichier protégé présent : '+$entry.FullName)}
  if($entry.FullName -match '\.\.'){throw 'Entrée archive invalide'}
  if($entry.Name -match '\.(json|js|md|txt|html|css)$'){$reader=[IO.StreamReader]::new($entry.Open());try{$text=$reader.ReadToEnd()}finally{$reader.Dispose()};if($text -match 'sk-(proj-)?[A-Za-z0-9_-]{24,}' -or $text.Contains('LocalApplicationOnly-2026') -or $text.Contains('LocalTestingOnly-2026')){throw ('Secret ou mot de passe de test dans le paquet : '+$entry.FullName)}}
 }
}finally{$zip.Dispose()}
Expand-Archive -LiteralPath $archive -DestinationPath $unpacked
Copy-Item -Path (Join-Path $unpacked 'update\*') -Destination $site -Recurse -Force
foreach($relative in $markers){if($before[$relative] -ne (Get-FileHash -LiteralPath (Join-Path $site $relative)).Hash){throw ('Configuration écrasée : '+$relative)}}
$manifest=Get-Content -LiteralPath (Join-Path $unpacked 'docs\update-manifest.json') -Raw | ConvertFrom-Json
foreach($item in $manifest){if((Get-FileHash -LiteralPath (Join-Path $site $item.path)).Hash -ne $item.sha256){throw ('Empreinte update invalide : '+$item.path)}}
$summary=Get-Content -LiteralPath (Join-Path $unpacked 'docs\tests-drencher-v13-summary.json') -Raw | ConvertFrom-Json
if((Get-FileHash -LiteralPath (Join-Path $site 'Vitasouss.Api.dll')).Hash -ne $summary.assemblySha256){throw 'DLL non conforme aux tests'}
foreach($name in @('PdfSharp.dll','MigraDoc.DocumentObjectModel.dll','MigraDoc.Rendering.dll')){if(-not (Test-Path -LiteralPath (Join-Path $site $name))){throw ('Dépendance PDF absente : '+$name)}}
$hash=(Get-FileHash -LiteralPath $archive).Hash
$proof=[ordered]@{date=[DateTime]::UtcNow.ToString('o');archive='VITASOUSS-DRENCHER-V1.3-IIS.zip';sha256=$hash;entries=$entries.Count;updateFiles=$manifest.Count;passed=$true;preserved=$markers;secretsExcluded=$true;manifestVerified=$true;assemblyVerified=$true;pdfDependenciesVerified=$true;productionDeploy=$false;testDirectory=$sandbox}
$proof | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $projectRoot 'docs\package-verification-drencher-v13.json') -Encoding utf8
$proof | ConvertTo-Json -Depth 5

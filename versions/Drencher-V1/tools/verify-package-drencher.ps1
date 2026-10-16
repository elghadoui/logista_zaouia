$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$archive=Join-Path $projectRoot 'VITASOUSS-V1.4.1-DRENCHER-V1-IIS.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip=[IO.Compression.ZipFile]::OpenRead($archive)
try{
 $entries=@($zip.Entries | Where-Object {$_.Name})
 $forbidden=@($entries | Where-Object {$_.Name -like 'appsettings*.json' -or $_.Name -eq 'web.config' -or $_.FullName -match '(^|/)(keys|secrets|logs|assistant-audit)/|\.(protected|jsonl|pem|pfx)$'})
 if($forbidden.Count){throw 'Configuration ou secret interdit dans le paquet'}
 if(-not($entries.FullName -contains 'update/Vitasouss.Api.dll')){throw 'Assemblage API absent'}
 foreach($entry in $entries | Where-Object {$_.FullName -match '\.(json|md|html|js|css|sql)$'}){
  $reader=[IO.StreamReader]::new($entry.Open());try{$contents=$reader.ReadToEnd()}finally{$reader.Dispose()}
  if($contents -match 'sk-(proj-)?[A-Za-z0-9_-]{20,}' -or $contents -match 'LocalApplicationOnly-2026|LocalTestingOnly-2026|UNREACHABLE-TEST-ONLY'){throw 'Valeur de secret/test interdite dans un fichier livre'}
 }
 $count=$entries.Count
}finally{$zip.Dispose()}
$simulation=Join-Path $projectRoot ('.test-data\update-drencher-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $simulation | Out-Null
$app=Join-Path $simulation 'app'
$extract=Join-Path $simulation 'package'
New-Item -ItemType Directory -Path $app,(Join-Path $app 'keys'),(Join-Path $app 'secrets') | Out-Null
$markers=@{'appsettings.Local.json'='FAKE LOCAL MARKER';'web.config'='FAKE IIS MARKER';'keys\fixture.xml'='FAKE KEY MARKER';'secrets\openai.protected'='FAKE OPENAI MARKER';'secrets\mysql.protected'='FAKE MYSQL MARKER'}
$hashes=@{}
foreach($relative in $markers.Keys){$target=Join-Path $app $relative;[IO.File]::WriteAllText($target,$markers[$relative]);$hashes[$relative]=(Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash}
Expand-Archive -LiteralPath $archive -DestinationPath $extract
$update=Join-Path $extract 'update'
foreach($file in Get-ChildItem -LiteralPath $update -File -Recurse){$relative=[IO.Path]::GetRelativePath($update,$file.FullName);$target=Join-Path $app $relative;New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null;Copy-Item -LiteralPath $file.FullName -Destination $target -Force}
foreach($relative in $markers.Keys){if((Get-FileHash -LiteralPath (Join-Path $app $relative) -Algorithm SHA256).Hash -ne $hashes[$relative]){throw 'Marqueur de configuration/secret modifie'}}
if((Get-FileHash -LiteralPath (Join-Path $app 'Vitasouss.Api.dll') -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath (Join-Path $projectRoot 'publish\Vitasouss.Api.dll') -Algorithm SHA256).Hash){throw 'Assemblage simule different'}
$index=Get-Content -LiteralPath (Join-Path $app 'wwwroot\index.html') -Raw
foreach($asset in [regex]::Matches($index,'(?:src|href)="(/assets/[^" ]+)"')){if(-not(Test-Path -LiteralPath (Join-Path $app ('wwwroot'+$asset.Groups[1].Value.Replace('/','\'))))){throw 'Asset index absent'}}
$report=[ordered]@{date=[DateTime]::UtcNow.ToString('o');version='1.4.1 + Drencher V1 MVP';archive=$archive;sha256=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash;entries=$count;configurationsExcluded=$true;secretsExcluded=$true;fakeMarkersPreserved=$true;assemblyMatches=$true;indexedAssetsPresent=$true;simulation=$simulation;productionDeploy=$false}
$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $projectRoot 'docs\package-verification-drencher.json') -Encoding utf8
$report | ConvertTo-Json -Depth 5

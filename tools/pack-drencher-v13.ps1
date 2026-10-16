$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$published=Join-Path $projectRoot 'publish'
$frontendDist=Join-Path $projectRoot 'frontend\dist'
$currentWebFiles=@(Get-ChildItem -LiteralPath $frontendDist -File -Recurse | ForEach-Object {'wwwroot\'+[IO.Path]::GetRelativePath($frontendDist,$_.FullName)})
$release=Join-Path $projectRoot 'release\VITASOUSS-DRENCHER-V1.3'
if(Test-Path -LiteralPath $release){throw 'Paquet existant : vérifier avant remplacement'}
$summary=Get-Content -LiteralPath (Join-Path $projectRoot 'docs\tests-drencher-v13-summary.json') -Raw | ConvertFrom-Json
if($summary.failed -ne 0 -or $summary.passed -lt 1){throw 'Rapport de tests requis'}
if((Get-FileHash -LiteralPath (Join-Path $published 'Vitasouss.Api.dll') -Algorithm SHA256).Hash -ne $summary.assemblySha256){throw 'Assemblage différent du rapport'}
New-Item -ItemType Directory -Path (Join-Path $release 'update'),(Join-Path $release 'docs\exemples-recette') | Out-Null
foreach($file in Get-ChildItem -LiteralPath $published -File -Recurse){
 $relative=[IO.Path]::GetRelativePath($published,$file.FullName)
 if($file.Name -like 'appsettings*.json' -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl','.pem','.pfx' -or $relative -match '(^|[\\/])(keys|logs|secrets|assistant-audit)([\\/]|$)'){continue}
 if($relative.StartsWith('wwwroot\') -and $relative -notin $currentWebFiles){continue}
 $target=Join-Path (Join-Path $release 'update') $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target
}
foreach($name in @('DRENCHER-V1.3-MISE-A-JOUR.md','DRENCHER-V1.3-RECETTE-QUALITE.md','DRENCHER-V1.3-DOCUMENTS.md','DRENCHER-V1.3-TESTS.md')){Copy-Item -LiteralPath (Join-Path (Join-Path $projectRoot 'docs') $name) -Destination (Join-Path $release 'docs')}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs') -Filter 'tests-drencher-v13-*.json'){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $release 'docs')}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'output\pdf') -Filter 'drencher-v13-*.pdf'){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $release 'docs\exemples-recette')}
$manifest=@(Get-ChildItem -LiteralPath (Join-Path $release 'update') -File -Recurse | ForEach-Object {[ordered]@{path=[IO.Path]::GetRelativePath((Join-Path $release 'update'),$_.FullName);sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash}})
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $release 'docs\update-manifest.json') -Encoding utf8
$archive=Join-Path $projectRoot 'VITASOUSS-DRENCHER-V1.3-IIS.zip'
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $archive
$hash=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
"$hash  VITASOUSS-DRENCHER-V1.3-IIS.zip" | Set-Content -LiteralPath ($archive+'.sha256') -Encoding ascii
Write-Output $archive
Write-Output ('SHA256 '+$hash)

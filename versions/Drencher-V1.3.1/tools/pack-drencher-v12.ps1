$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$published=Join-Path $projectRoot 'publish'
$frontendDist=Join-Path $projectRoot 'frontend\dist'
$currentWebFiles=@(Get-ChildItem -LiteralPath $frontendDist -File -Recurse | ForEach-Object {'wwwroot\'+[IO.Path]::GetRelativePath($frontendDist,$_.FullName)})
$release=Join-Path $projectRoot 'release\VITASOUSS-DRENCHER-V1.2'
if(Test-Path -LiteralPath $release){throw 'Paquet existant : vérifier avant remplacement'}
$summary=Get-Content -LiteralPath (Join-Path $projectRoot 'docs\tests-drencher-v12-summary.json') -Raw | ConvertFrom-Json
if($summary.failed -ne 0 -or $summary.passed -lt 1){throw 'Rapport de tests requis'}
if((Get-FileHash -LiteralPath (Join-Path $published 'Vitasouss.Api.dll') -Algorithm SHA256).Hash -ne $summary.assemblySha256){throw 'Assemblage différent du rapport'}
New-Item -ItemType Directory -Path (Join-Path $release 'update'),(Join-Path $release 'docs'),(Join-Path $release 'sql'),(Join-Path $release 'tools') | Out-Null
foreach($file in Get-ChildItem -LiteralPath $published -File -Recurse){
 $relative=[IO.Path]::GetRelativePath($published,$file.FullName)
 if($file.Name -like 'appsettings*.json' -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl','.pem','.pfx' -or $relative -match '(^|[\\/])(keys|logs|secrets|assistant-audit)([\\/]|$)'){continue}
 if($relative.StartsWith('wwwroot\') -and $relative -notin $currentWebFiles){continue}
 $target=Join-Path (Join-Path $release 'update') $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target
}
foreach($name in @('DRENCHER-V1.2-MISE-A-JOUR.md','DRENCHER-V1.2-RECETTE-OPERATEUR.md','DRENCHER-V1.2-CORRECTIONS.md','DRENCHER-V1.2-TESTS.md','tests-drencher-v12-summary.json','tests-drencher-v12-api.json','tests-drencher-v12-legacy.json','tests-drencher-v12-recette.json','tests-drencher-v12-frontend.json','tests-drencher-v12-regression.json','tests-drencher-v12-navigation.json','tests-drencher-v12-assistant.json','tests-drencher-v12-assistant-http.json')){Copy-Item -LiteralPath (Join-Path (Join-Path $projectRoot 'docs') $name) -Destination (Join-Path $release 'docs')}
foreach($name in @('004_drencher_business.sql','006_drencher_recette_admin.sql','007_drencher_recette_identite.sql','008_drencher_recette_structure.sql','010_drencher_reservations.sql')){Copy-Item -LiteralPath (Join-Path (Join-Path $projectRoot 'sql') $name) -Destination (Join-Path $release 'sql')}
Copy-Item -LiteralPath (Join-Path $projectRoot 'tools\New-DrencherRecette.ps1') -Destination (Join-Path $release 'tools')
$manifest=@(Get-ChildItem -LiteralPath (Join-Path $release 'update') -File -Recurse | ForEach-Object {[ordered]@{path=[IO.Path]::GetRelativePath((Join-Path $release 'update'),$_.FullName);sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash}})
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $release 'docs\update-manifest.json') -Encoding utf8
$archive=Join-Path $projectRoot 'VITASOUSS-DRENCHER-V1.2-IIS.zip'
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $archive
$hash=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
"$hash  VITASOUSS-DRENCHER-V1.2-IIS.zip" | Set-Content -LiteralPath ($archive+'.sha256') -Encoding ascii
Write-Output $archive
Write-Output ('SHA256 '+$hash)

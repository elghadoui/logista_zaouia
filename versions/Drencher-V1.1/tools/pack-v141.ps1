$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$published=Join-Path $projectRoot 'publish'
$frontendDist=Join-Path $projectRoot 'frontend\dist'
$currentWebFiles=@(Get-ChildItem -LiteralPath $frontendDist -File -Recurse | ForEach-Object {'wwwroot\'+[IO.Path]::GetRelativePath($frontendDist,$_.FullName)})
$release=Join-Path $projectRoot 'release\VITASOUSS-V1.4.1'
if(Test-Path -LiteralPath $release){throw 'Paquet existant : ne pas remplacer sans verifier.'}
if(-not(Test-Path -LiteralPath (Join-Path $published 'Vitasouss.Api.dll'))){throw 'Publication requise'}
$summary=Get-Content -LiteralPath (Join-Path $projectRoot 'docs\tests-summary-v141.json') -Raw | ConvertFrom-Json
if($summary.failed -ne 0 -or $summary.passed -lt 1){throw 'Rapports de tests non valides'}
if((Get-FileHash -LiteralPath (Join-Path $published 'Vitasouss.Api.dll') -Algorithm SHA256).Hash -ne $summary.assemblySha256){throw 'Assemblage different du rapport'}
New-Item -ItemType Directory -Path (Join-Path $release 'update'),(Join-Path $release 'docs'),(Join-Path $release 'sql') | Out-Null
foreach($file in Get-ChildItem -LiteralPath $published -File -Recurse){
 $relative=[IO.Path]::GetRelativePath($published,$file.FullName)
 if($file.Name -like 'appsettings*.json' -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl' -or $relative -match '(^|[\\/])(keys|logs|secrets|assistant-audit)([\\/]|$)'){continue}
 if($relative.StartsWith('wwwroot\') -and $relative -notin $currentWebFiles){continue}
 $target=Join-Path (Join-Path $release 'update') $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target
}
$documents=@('AUDIT-V1.4.1.md','SIDEBAR-V1.4.1-PROPOSITION.md','sidebar-v141-proposition.png','sidebar-v141-maquette.html','schema-audit-v141.json','REGLES-METIER-V1.4.1.md','SYNCHRONISATION-V1.4.1.md','CORRECTIONS-V1.4.1.md','VERIFICATION-V1.4.1.md','POINTS-A-VALIDER-V1.4.1.md','MISE-A-JOUR-V1.4.1.md','RAPPORT-TESTS-V1.4.1.md','modified-files-v141.json','tests-summary-v141.json','api-verification-v141.json','frontend-verification-v141.json','boards-verification-v141.json','assistant-verification-v141.json','assistant-http-verification-v141.json','core-verification-v141.json','presentation-verification-v141.json','operations-core-verification-v141.json','receipt-protection-verification-v141.json','comparison-core-verification-v141.json','payload-verification-v141.json')
foreach($name in $documents){Copy-Item -LiteralPath (Join-Path (Join-Path $projectRoot 'docs') $name) -Destination (Join-Path $release 'docs')}
Copy-Item -LiteralPath (Join-Path $projectRoot 'sql\003_permissions_v141.sql') -Destination (Join-Path $release 'sql')
$archive=Join-Path $projectRoot 'VITASOUSS-V1.4.1-IIS.zip'
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $archive
Write-Output $archive
Write-Output ('SHA256 '+(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash)

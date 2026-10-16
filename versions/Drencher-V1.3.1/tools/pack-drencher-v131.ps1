$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$published=Join-Path $root 'publish-v131'
$release=Join-Path $root 'release\VITASOUSS-DRENCHER-V1.3.1'
if(Test-Path -LiteralPath $release){throw 'Livraison existante : vérifier avant remplacement'}
$summary=Get-Content -LiteralPath (Join-Path $root 'docs\tests-drencher-v131-summary.json') -Raw | ConvertFrom-Json
if($summary.failed -ne 0 -or $summary.passed -ne 58 -or -not $summary.validatedLayoutPreserved){throw 'Tests finaux et validation requis'}
if((Get-FileHash -LiteralPath (Join-Path $published 'Vitasouss.Api.dll')).Hash -ne $summary.assemblySha256){throw 'DLL différente de la version testée'}
New-Item -ItemType Directory -Path (Join-Path $release 'update'),(Join-Path $release 'docs\modeles-valides') | Out-Null
foreach($file in Get-ChildItem -LiteralPath $published -File -Recurse){
 $relative=[IO.Path]::GetRelativePath($published,$file.FullName)
 if($relative -match '^wwwroot[\\/]' -or $file.Name -like 'appsettings*.json' -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl','.pem','.pfx' -or $relative -match '(^|[\\/])(keys|logs|secrets|assistant-audit)([\\/]|$)'){continue}
 $target=Join-Path (Join-Path $release 'update') $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target
}
foreach($name in @('DRENCHER-V1.3.1-MISE-A-JOUR.md','DRENCHER-V1.3.1-TESTS.md','F04-V1.3.1-VALIDATION-VISUELLE.md')){Copy-Item -LiteralPath (Join-Path (Join-Path $root 'docs') $name) -Destination (Join-Path $release 'docs')}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $root 'docs') -Filter 'tests-drencher-v131-*.json'){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $release 'docs')}
foreach($property in $summary.approvedExamples.PSObject.Properties){
 $file=Join-Path (Join-Path $root 'docs\f04-v131-apercus') $property.Name
 if((Get-FileHash -LiteralPath $file).Hash -ne $property.Value){throw ('Modèle validé modifié : '+$property.Name)}
 Copy-Item -LiteralPath $file -Destination (Join-Path $release 'docs\modeles-valides')
}
Copy-Item -LiteralPath (Join-Path $root 'docs\f04-v131-apercus\COMPARATIF-EXCEL-F04-V131.png') -Destination (Join-Path $release 'docs\modeles-valides')
$manifest=@(Get-ChildItem -LiteralPath (Join-Path $release 'update') -File -Recurse | ForEach-Object {[ordered]@{path=[IO.Path]::GetRelativePath((Join-Path $release 'update'),$_.FullName);sha256=(Get-FileHash -LiteralPath $_.FullName).Hash}})
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $release 'docs\update-manifest.json') -Encoding utf8
$zip=Join-Path $root 'VITASOUSS-DRENCHER-V1.3.1-IIS.zip'
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $zip
$hash=(Get-FileHash -LiteralPath $zip).Hash
"$hash  VITASOUSS-DRENCHER-V1.3.1-IIS.zip" | Set-Content -LiteralPath ($zip+'.sha256') -Encoding ascii
Write-Output $zip
Write-Output ('SHA256 '+$hash)

param([switch]$Refresh)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$published=Join-Path $projectRoot 'publish-v1321-ready'
$release=Join-Path $projectRoot 'release\VITASOUSS-DRENCHER-V1.3.2.1'
if((Test-Path -LiteralPath $release) -and -not $Refresh){throw 'Paquet existant : utiliser -Refresh pour actualiser le paquet généré'}
$reportNames=@('tests-drencher-v1321-api.json','tests-drencher-v1321-own-draft.json','tests-drencher-v1321-final-api.json','tests-drencher-v1321-permissions.json','tests-drencher-v1321-ui.json','tests-drencher-v1321-conservation.json')
$results=@();foreach($name in $reportNames){
 $r=Get-Content -LiteralPath (Join-Path $projectRoot ('docs\'+$name)) -Raw|ConvertFrom-Json
 if($r.failed -gt 0 -or ($r.PSObject.Properties.Name -contains 'success' -and -not $r.success)){throw ('Tests non validés : '+$name)}
 foreach($t in $r.results){if(-not $t.passed){throw ('Test échoué : '+$t.name)};$results+=[ordered]@{suite=$name;name=$t.name;passed=$true}}
}
$policy=Get-Content -LiteralPath (Join-Path $projectRoot 'docs\tests-drencher-v1321-permissions.json') -Raw|ConvertFrom-Json
$hash=(Get-FileHash -LiteralPath (Join-Path $published 'Vitasouss.Api.dll') -Algorithm SHA256).Hash
if($hash -ne $policy.assemblySha256){throw 'DLL publiée différente de la DLL testée'}
$summary=[ordered]@{date=[DateTime]::UtcNow.ToString('o');version='1.4.1';drencherVersion='1.3.2.1';passed=$results.Count;failed=0;apiMySqlValidated=$true;productionAccess=$false;productionDeploy=$false;assemblySha256=$hash;results=$results}
$summary|ConvertTo-Json -Depth 7|Set-Content -LiteralPath (Join-Path $projectRoot 'docs\tests-drencher-v1321-summary.json') -Encoding utf8
New-Item -ItemType Directory -Path (Join-Path $release 'update\wwwroot\assets'),(Join-Path $release 'docs'),(Join-Path $release 'sql') -Force|Out-Null
# Correctif minimal : aucun remplacement de dépendances, logos ou moteurs/templates F04.
foreach($name in @('Vitasouss.Api.dll','Vitasouss.Api.pdb','Vitasouss.Api.deps.json','Vitasouss.Api.runtimeconfig.json')){Copy-Item -LiteralPath (Join-Path $published $name) -Destination (Join-Path $release 'update')}
Copy-Item -LiteralPath (Join-Path $projectRoot 'frontend\dist\index.html') -Destination (Join-Path $release 'update\wwwroot')
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'frontend\dist\assets') -File){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $release 'update\wwwroot\assets')}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs') -File|Where-Object {$_.Name -like 'DRENCHER-V1.3.2.1-*.md' -or $_.Name -like 'tests-drencher-v1321-*.json'}){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $release 'docs')}
Copy-Item -LiteralPath (Join-Path $projectRoot 'sql\012_drencher_permissions_v1321.sql') -Destination (Join-Path $release 'sql')
$manifest=@(Get-ChildItem -LiteralPath (Join-Path $release 'update') -File -Recurse|ForEach-Object {[ordered]@{path=[IO.Path]::GetRelativePath((Join-Path $release 'update'),$_.FullName);sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash}})
$manifest|ConvertTo-Json -Depth 4|Set-Content -LiteralPath (Join-Path $release 'docs\update-manifest.json') -Encoding utf8
[IO.File]::WriteAllText((Join-Path $release 'LIRE-AVANT-INSTALLATION.txt'),"Correctif V1.3.2.1 depuis V1.3.2 uniquement. Lire docs/DRENCHER-V1.3.2.1-MISE-A-JOUR.md. Configurations, secrets, clés et web.config exclus. Aucun script sur logista, aucun reset de réservations. SQL012 facultatif, administration seulement. Admin doit attribuer explicitement les droits Hicham/Mbark/Samira puis les utilisateurs doivent se reconnecter. Aucun déploiement automatique.")
$archive=Join-Path $projectRoot 'VITASOUSS-DRENCHER-V1.3.2.1-IIS.zip'
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $archive -Force
"$((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash)  $([IO.Path]::GetFileName($archive))"|Set-Content -LiteralPath ($archive+'.sha256') -Encoding ascii
Write-Output $archive
Write-Output ($results.Count.ToString()+' vérifications réussies')


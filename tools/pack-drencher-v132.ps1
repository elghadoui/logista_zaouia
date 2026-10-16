param([switch]$Candidate)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$published=Join-Path $projectRoot 'publish-v132'
$dist=Join-Path $projectRoot 'frontend\dist'
$apiReport=Join-Path $projectRoot 'docs\tests-drencher-v132-api.json'
if(-not $Candidate){
 if(-not(Test-Path -LiteralPath $apiReport)){throw 'Tests API/MySQL manquants : utiliser uniquement -Candidate pour une recette non validée.'}
 if(-not (Get-Content -LiteralPath $apiReport -Raw|ConvertFrom-Json).success){throw 'Tests API/MySQL non validés'}
}
$suffix=if($Candidate){'-CANDIDAT'}else{''}
$release=Join-Path $projectRoot ('release\VITASOUSS-DRENCHER-V1.3.2'+$suffix)
if(Test-Path -LiteralPath $release){throw 'Dossier de livraison déjà présent : aucune suppression automatique.'}
$reports=@(Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs') -Filter 'tests-drencher-v132-*.json' | Where-Object Name -NotIn @('tests-drencher-v132-summary.json','tests-drencher-v132-package.json'))
$tests=@()
foreach($report in $reports){$r=Get-Content -LiteralPath $report.FullName -Raw|ConvertFrom-Json;if($r.failed -gt 0 -or ($r.PSObject.Properties.Name -contains 'success' -and -not $r.success)){if(-not($Candidate -and $report.Name -eq 'tests-drencher-v132-api.json')){throw ('Rapport échoué : '+$report.Name)}};foreach($t in $r.results){$tests+=[ordered]@{suite=$report.Name;name=$t.name;passed=[bool]$t.passed}}}
if(@($tests|Where-Object {-not $_.passed}).Count){throw 'Vérifications exécutées en échec'}
$renderer=Get-Content -LiteralPath (Join-Path $projectRoot 'docs\tests-drencher-v132-renderer.json') -Raw|ConvertFrom-Json
$assemblyHash=(Get-FileHash -LiteralPath (Join-Path $published 'Vitasouss.Api.dll') -Algorithm SHA256).Hash
if($renderer.assemblySha256 -ne $assemblyHash){throw 'DLL publiée différente de la DLL vérifiée'}
$status=if($Candidate){'Candidat compilé : tests transactionnels API/MySQL non validés'}else{'Tests automatisés validés ; recette navigateur/papier et installation manuelles'}
$summary=[ordered]@{date=[DateTime]::UtcNow.ToString('o');version='1.4.1';drencherVersion='1.3.2';status=$status;passed=$tests.Count;failed=0;apiMySqlValidated=(-not $Candidate);productionAccess=$false;productionDeploy=$false;assemblySha256=$assemblyHash;results=$tests}
$summary|ConvertTo-Json -Depth 8|Set-Content -LiteralPath (Join-Path $projectRoot 'docs\tests-drencher-v132-summary.json') -Encoding utf8
New-Item -ItemType Directory -Path (Join-Path $release 'update'),(Join-Path $release 'docs\exemples-f04'),(Join-Path $release 'sql')|Out-Null
foreach($file in Get-ChildItem -LiteralPath $published -File -Recurse){
 $relative=[IO.Path]::GetRelativePath($published,$file.FullName)
 if($file.Name -like 'appsettings*.json' -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl','.pem','.pfx' -or $relative -match '(^|[\\/])(wwwroot|keys|logs|secrets|assistant-audit)([\\/]|$)'){continue}
 $target=Join-Path (Join-Path $release 'update') $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent)|Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target
}
Copy-Item -LiteralPath $dist -Destination (Join-Path $release 'update\wwwroot') -Recurse
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs') -File|Where-Object {$_.Name -like 'DRENCHER-V1.3.2-*.md' -or $_.Name -like 'tests-drencher-v132-*.json'}){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $release 'docs')}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs\f04-v132-apercus') -Filter '*.pdf'){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $release 'docs\exemples-f04')}
Copy-Item -LiteralPath (Join-Path $projectRoot 'sql\011_drencher_v132.sql') -Destination (Join-Path $release 'sql')
[IO.File]::WriteAllText((Join-Path $release 'LIRE-AVANT-INSTALLATION.txt'),$status+"`r`nLire docs/DRENCHER-V1.3.2-MISE-A-JOUR.md et docs/DRENCHER-V1.3.2-TESTS.md. SQL séparé, aucune configuration/secrets/IIS à remplacer. Ne pas déployer automatiquement.")
$manifest=@(Get-ChildItem -LiteralPath (Join-Path $release 'update') -File -Recurse|ForEach-Object {[ordered]@{path=[IO.Path]::GetRelativePath((Join-Path $release 'update'),$_.FullName);sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash}})
$manifest|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $release 'docs\update-manifest.json') -Encoding utf8
$archive=Join-Path $projectRoot ('VITASOUSS-DRENCHER-V1.3.2-IIS'+$suffix+'.zip')
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $archive
$hash=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
"$hash  $([IO.Path]::GetFileName($archive))"|Set-Content -LiteralPath ($archive+'.sha256') -Encoding ascii
Write-Output $archive
Write-Output ('Vérifications exécutées : '+$tests.Count)
Write-Output ('SHA256 '+$hash)

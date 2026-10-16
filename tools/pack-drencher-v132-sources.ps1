$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$sourceRoot=Join-Path $projectRoot 'release\VITASOUSS-DRENCHER-V1.3.2-SOURCES'
if(Test-Path -LiteralPath $sourceRoot){throw 'Sources déjà préparées : aucune suppression automatique.'}
New-Item -ItemType Directory -Path $sourceRoot|Out-Null
foreach($folder in @('backend','frontend\src','frontend\public','sql','tests','versions\Drencher-V1.3.1\backend','versions\Drencher-V1.3.1\frontend\src')){
 foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot $folder) -File -Recurse){
  $relative=[IO.Path]::GetRelativePath($projectRoot,$file.FullName)
  if($relative -match '(^|[\\/])(bin|obj|keys|secrets|logs|wwwroot|node_modules|assistant-audit)([\\/]|$)' -or ($file.Name -like 'appsettings*.json' -and $file.Name -ne 'appsettings.json') -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl','.pem','.pfx'){continue}
  $target=Join-Path $sourceRoot $relative
  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent)|Out-Null
  Copy-Item -LiteralPath $file.FullName -Destination $target
 }
}
foreach($name in @('package.json','package-lock.json','tsconfig.json','vite.config.ts','index.html','.prettierrc.json')){Copy-Item -LiteralPath (Join-Path $projectRoot ('frontend\'+$name)) -Destination (Join-Path $sourceRoot 'frontend')}
New-Item -ItemType Directory -Path (Join-Path $sourceRoot 'tools'),(Join-Path $sourceRoot 'docs\f04-v132-apercus'),(Join-Path $sourceRoot 'docs\f04-v131-apercus')|Out-Null
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'tools') -File|Where-Object {$_.Name -ne 'edit-v132.py' -and ($_.Name -match '(v132|V132)' -or $_.Name -in @('New-DrencherRecette.ps1','build-frontend-low-memory.mjs','build.ps1'))}){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $sourceRoot 'tools')}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs') -File|Where-Object {$_.Name -like 'DRENCHER-V1.3.2-*.md' -or $_.Name -like 'tests-drencher-v132-*.json'}){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $sourceRoot 'docs')}
foreach($file in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'docs\f04-v132-apercus') -Filter '*.pdf'){Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $sourceRoot 'docs\f04-v132-apercus')}
foreach($name in @('SIMPLE','COMPLEXE')){Copy-Item -LiteralPath (Join-Path $projectRoot ('docs\f04-v131-apercus\F04-V06-V1.3.1-'+$name+'.pdf')) -Destination (Join-Path $sourceRoot 'docs\f04-v131-apercus')}
[IO.File]::WriteAllText((Join-Path $sourceRoot 'LIRE-SOURCES.txt'),"Sources VITASOUSS V1.4.1 + Drencher V1.3.2. Candidat : tests API/MySQL en attente d'autorisation de démarrage des services locaux. Configurations privées, identifiants, clés et dépendances compilées exclus. Installer .NET 10 et Node, puis npm ci dans frontend et dotnet build backend. Lire docs/DRENCHER-V1.3.2-TESTS.md. La configuration locale protégée existante doit être réutilisée en environnement autorisé ; aucune clé à fournir dans le code ou le chat. Aucun déploiement automatique.")
$archive=Join-Path $projectRoot 'VITASOUSS-DRENCHER-V1.3.2-SOURCES.zip'
Compress-Archive -Path (Join-Path $sourceRoot '*') -DestinationPath $archive
"$((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash)  $([IO.Path]::GetFileName($archive))"|Set-Content -LiteralPath ($archive+'.sha256') -Encoding ascii
Write-Output $archive

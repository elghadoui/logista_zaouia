param([string]$Version='1.1')
$ErrorActionPreference='Stop'
if($Version -notmatch '^\d+\.\d+$'){throw 'Version invalide'}
$projectRoot=Split-Path $PSScriptRoot -Parent
$publishedPath=Join-Path $projectRoot 'publish'
if(-not (Test-Path -LiteralPath (Join-Path $publishedPath 'Vitasouss.Api.dll'))){throw 'Compiler avant de créer le paquet'}
if(Test-Path -LiteralPath (Join-Path $publishedPath 'appsettings.Local.json')){throw 'Configuration locale interdite dans la publication'}
if(Test-Path -LiteralPath (Join-Path $publishedPath 'keys')){throw 'Clés locales interdites dans la publication'}
$releasePath=Join-Path $projectRoot "release\VITASOUSS-V$Version"
New-Item -ItemType Directory -Force (Join-Path $releasePath 'app'),(Join-Path $releasePath 'sql'),(Join-Path $releasePath 'docs') | Out-Null
Copy-Item -Path (Join-Path $publishedPath '*') -Destination (Join-Path $releasePath 'app') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'sql\001_admin.sql') -Destination (Join-Path $releasePath 'sql') -Force
Copy-Item -Path (Join-Path $projectRoot 'docs\*.md'),(Join-Path $projectRoot 'docs\api-verification*.json'),(Join-Path $projectRoot 'docs\modified-files-v11.json') -Destination (Join-Path $releasePath 'docs') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'README.md'),(Join-Path $projectRoot 'CHANGELOG.md') -Destination $releasePath -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs\IIS-INSTALLATION.md') -Destination (Join-Path $releasePath 'INSTALLATION.md') -Force
$archivePath=Join-Path $projectRoot "VITASOUSS-V$Version-IIS.zip"
Compress-Archive -Path (Join-Path $releasePath '*') -DestinationPath $archivePath -Force
Write-Host "Paquet préparé : $archivePath"

param([switch]$SkipInstall)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$dotnetPath=Join-Path $projectRoot '.dotnet\dotnet.exe'
if(-not (Test-Path -LiteralPath $dotnetPath)) { $dotnetPath='dotnet' }
$env:DOTNET_CLI_HOME=Join-Path $projectRoot '.dotnet-home'
$env:NUGET_PACKAGES=Join-Path $projectRoot '.nuget'
Push-Location (Join-Path $projectRoot 'frontend')
try {
 if(-not $SkipInstall) { & npm.cmd ci --no-audit --no-fund; if($LASTEXITCODE -ne 0){throw 'Installation frontend échouée'} }
 & npm.cmd run build
 if($LASTEXITCODE -ne 0){throw 'Compilation frontend échouée'}
} finally { Pop-Location }
$webRoot=Join-Path $projectRoot 'backend\wwwroot'
New-Item -ItemType Directory -Force $webRoot | Out-Null
Copy-Item -Path (Join-Path $projectRoot 'frontend\dist\*') -Destination $webRoot -Recurse -Force
# Le dossier publish est le livrable compilé pour IIS.
Push-Location $projectRoot
try {
 & $dotnetPath publish backend\Vitasouss.Api.csproj -c Release -o publish --self-contained false
 if($LASTEXITCODE -ne 0){throw 'Publication .NET échouée'}
 Write-Host "Application IIS publiée dans $projectRoot\publish"
} finally { Pop-Location }


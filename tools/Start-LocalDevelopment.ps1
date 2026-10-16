$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$cfg = Get-Content (Join-Path $projectRoot 'backend/appsettings.Local.json') -Raw | ConvertFrom-Json
if ($cfg.Admin.Host -ne '127.0.0.1' -or $cfg.Admin.Port -ne 33307) { throw 'MySQL local de test requis sur 127.0.0.1:33307.' }
foreach ($port in @(5081,5173)) {
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { throw "Port $port occupé. Aucun processus arrêté." }
}
if (-not (Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 33307 -State Listen -ErrorAction SilentlyContinue)) { throw 'MySQL local de test arrêté.' }
$env:DOTNET_CLI_HOME = Join-Path $projectRoot '.dotnet-home'
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:ASPNETCORE_URLS = 'http://127.0.0.1:5081'
$env:DOTNET_WATCH_SUPPRESS_LAUNCH_BROWSER = '1'
$env:DOTNET_WATCH_RESTART_ON_RUDE_EDIT = '1'
$api = Start-Process -FilePath (Join-Path $projectRoot '.dotnet/dotnet.exe') -ArgumentList @('watch','--non-interactive','--project','Vitasouss.Api.csproj','run','--no-launch-profile','--property:OutputPath=bin/LocalDevelopment/') -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'output/local-dev-api.log') -RedirectStandardError (Join-Path $projectRoot 'output/local-dev-api-error.log') -PassThru
$ui = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @('node_modules/vite/bin/vite.js','--config','vite.local.config.ts') -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'output/local-dev-vite.log') -RedirectStandardError (Join-Path $projectRoot 'output/local-dev-vite-error.log') -PassThru
@{ apiWatcherPid=$api.Id; vitePid=$ui.Id; url='http://127.0.0.1:5173'; apiUrl='http://127.0.0.1:5081' } | ConvertTo-Json | Set-Content (Join-Path $projectRoot 'output/local-dev-processes.json')
Write-Output 'http://127.0.0.1:5173'

# Lancement manuel local uniquement. Aucun import, migration ou accès aux VM.
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if($projectRoot -ne 'C:\logista_zaouia'){throw 'Dossier local non reconnu'}
$cfg=Get-Content -LiteralPath (Join-Path $projectRoot 'backend\appsettings.Local.json') -Raw|ConvertFrom-Json
if($cfg.Admin.Host -ne '127.0.0.1' -or $cfg.Admin.Port -ne 33307){throw 'Configuration distante interdite'}
$assembly=Join-Path $projectRoot 'publish-v150-tests\Vitasouss.Api.dll'
if(-not(Test-Path -LiteralPath $assembly)){throw 'Compilation de test absente'}
if(Get-NetTCPConnection -LocalPort 5080 -State Listen -ErrorAction SilentlyContinue){throw 'Port 5080 déjà utilisé ; aucun service arrêté automatiquement'}
if(-not(Get-NetTCPConnection -LocalPort 33307 -State Listen -ErrorAction SilentlyContinue)){throw 'MySQL de test doit être démarré sur 127.0.0.1:33307'}
$env:DOTNET_CLI_HOME=Join-Path $projectRoot '.dotnet-home'
$env:ASPNETCORE_ENVIRONMENT='Development'
Start-Process -FilePath (Join-Path $projectRoot '.dotnet\dotnet.exe') -ArgumentList @($assembly,'--urls','http://127.0.0.1:5080','--webroot',(Join-Path $projectRoot 'frontend\dist')) -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'output\api-v150.log') -RedirectStandardError (Join-Path $projectRoot 'output\api-v150-error.log')
Write-Output 'API V1.5.0 lancée sur 127.0.0.1:5080. MySQL, configurations et VM inchangés.'

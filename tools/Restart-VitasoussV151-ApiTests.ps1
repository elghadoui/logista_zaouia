# Relance MANUELLE de la seule API de test locale. Aucune migration ni accès VM.
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if($projectRoot -ne 'C:\logista_zaouia'){throw 'Dossier de test non reconnu'}
$cfg=Get-Content -LiteralPath (Join-Path $projectRoot 'backend\appsettings.Local.json') -Raw | ConvertFrom-Json
if($cfg.Admin.Host -ne '127.0.0.1' -or $cfg.Admin.Port -ne 33307){throw 'Configuration distante interdite'}
$assembly=Join-Path $projectRoot 'publish-v151-candidate\Vitasouss.Api.dll'
if(-not(Test-Path -LiteralPath $assembly)){throw 'Compilation V1.5.1 absente'}
if(-not(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 33307 -State Listen -ErrorAction SilentlyContinue)){throw 'MySQL local 33307 doit être démarré'}
$listener=@(Get-NetTCPConnection -LocalPort 5080 -State Listen -ErrorAction SilentlyContinue)
if($listener.Count -gt 0){
 if($listener.Count -ne 1 -or $listener[0].LocalAddress -ne '127.0.0.1'){throw 'Port 5080 non exclusivement local ; aucun arrêt'}
 $apiProcess=Get-CimInstance Win32_Process -Filter "ProcessId=$($listener[0].OwningProcess)"
 if($apiProcess.Name -ne 'dotnet.exe' -or $apiProcess.CommandLine -notmatch 'C:\\logista_zaouia\\publish-v15[01]-(tests|candidate)\\Vitasouss\.Api\.dll' -or $apiProcess.CommandLine -notlike '*127.0.0.1:5080*'){throw 'API de test non identifiée ; aucun arrêt'}
 Stop-Process -Id $apiProcess.ProcessId
}
$env:DOTNET_CLI_HOME=Join-Path $projectRoot '.dotnet-home'
$env:ASPNETCORE_ENVIRONMENT='Development'
Start-Process -FilePath (Join-Path $projectRoot '.dotnet\dotnet.exe') -ArgumentList @($assembly,'--urls','http://127.0.0.1:5080','--webroot',(Join-Path $projectRoot 'frontend\dist')) -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'output\api-v151.log') -RedirectStandardError (Join-Path $projectRoot 'output\api-v151-error.log')
Write-Output 'API V1.5.1 relancée localement. Aucune migration, aucun accès aux VM.'

# Relance MANUELLE de la seule API locale après compilation. MySQL inchangé.
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if($projectRoot -ne 'C:\logista_zaouia'){throw 'Poste de test non reconnu'}
$testConfig=Get-Content -LiteralPath (Join-Path $projectRoot 'backend\appsettings.Local.json') -Raw|ConvertFrom-Json
if($testConfig.Admin.Host -ne '127.0.0.1' -or $testConfig.Admin.Port -ne 33307){throw 'Configuration distante interdite'}
$assembly=Join-Path $projectRoot 'publish-v1321-ready\Vitasouss.Api.dll'
if(-not(Test-Path -LiteralPath $assembly)){throw 'Compilation finale absente'}
$processes=@(Get-CimInstance Win32_Process|Where-Object {$_.Name -eq 'dotnet.exe' -and $_.CommandLine -match 'C:\\logista_zaouia\\publish-v1321(?:-final|-ready)?\\Vitasouss\.Api\.dll' -and $_.CommandLine -like '*127.0.0.1:5080*'})
if($processes.Count -ne 1){throw 'Une seule API de test identifiée requise ; aucun arrêt effectué'}
Stop-Process -Id $processes[0].ProcessId
$env:DOTNET_CLI_HOME=Join-Path $projectRoot '.dotnet-home'
$env:ASPNETCORE_ENVIRONMENT='Development'
Start-Process -FilePath (Join-Path $projectRoot '.dotnet\dotnet.exe') -ArgumentList @($assembly,'--urls','http://127.0.0.1:5080') -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'output\api-v1321-final.log') -RedirectStandardError (Join-Path $projectRoot 'output\api-v1321-final-error.log')
Write-Output 'API de test finale relancée ; MySQL, VM et données inchangés.'

# Lancement MANUEL par l'utilisateur uniquement. Aucun accès aux VM.
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if($projectRoot -ne 'C:\logista_zaouia'){throw 'Poste/dossier de test non reconnu'}
$configPath=Join-Path $projectRoot 'backend\appsettings.Local.json'
$testConfig=Get-Content -LiteralPath $configPath -Raw|ConvertFrom-Json
if($testConfig.Admin.Host -ne '127.0.0.1' -or $testConfig.Admin.Port -ne 33307){throw 'Configuration locale obligatoire ; aucun serveur distant autorisé'}
$dataPath=Join-Path $projectRoot '.test-data\mysql'
if(-not(Test-Path -LiteralPath (Join-Path $dataPath 'ibdata1'))){throw 'Base locale de test absente : aucune initialisation automatique'}
$assembly=Join-Path $projectRoot 'publish-v1321\Vitasouss.Api.dll'
if(-not(Test-Path -LiteralPath $assembly)){throw 'Compiler publish-v1321 avant lancement'}
if(Get-NetTCPConnection -State Listen -LocalPort 33307,5080 -ErrorAction SilentlyContinue){throw 'Port déjà utilisé : vérifier les services existants sans les arrêter automatiquement'}
Start-Process -FilePath (Join-Path $projectRoot '.local-mysql\mysql-5.7.44-winx64\bin\mysqld.exe') -ArgumentList @('--no-defaults','--basedir=C:/logista_zaouia/.local-mysql/mysql-5.7.44-winx64','--datadir=C:/logista_zaouia/.test-data/mysql','--port=33307','--bind-address=127.0.0.1','--max-connections=40','--innodb-buffer-pool-size=64M') -WindowStyle Hidden
$env:DOTNET_CLI_HOME=Join-Path $projectRoot '.dotnet-home'
$env:ASPNETCORE_ENVIRONMENT='Development'
Start-Process -FilePath (Join-Path $projectRoot '.dotnet\dotnet.exe') -ArgumentList @($assembly,'--urls','http://127.0.0.1:5080') -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'output\api-v1321.log') -RedirectStandardError (Join-Path $projectRoot 'output\api-v1321-error.log')
Write-Output 'Services locaux lancés. Aucune migration, aucun déploiement et aucune base distante modifiée.'

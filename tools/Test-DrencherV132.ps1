param([switch]$ApiMySql)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
$dotnet=Join-Path $projectRoot '.dotnet\dotnet.exe'
if(-not(Test-Path -LiteralPath $dotnet)){$dotnet='dotnet'}
$env:DOTNET_CLI_HOME=Join-Path $projectRoot '.dotnet-home'
$env:NUGET_PACKAGES=Join-Path $projectRoot '.nuget'
& $dotnet run --project tests/DrencherV132Tests -c Release
if($LASTEXITCODE){throw 'Tests métier/PDF échoués'}
& $dotnet run --project tests/AssistantTests -c Release -- docs/tests-drencher-v132-assistant.json
if($LASTEXITCODE){throw 'Tests assistant échoués'}
foreach($file in @('verify-drencher-v132-frontend.mjs','verify-drencher-v132-ui.mjs','verify-drencher-v132-navigation.mjs','verify-drencher-v132-palette-frontend.mjs')){
 & node (Join-Path $PSScriptRoot $file)
 if($LASTEXITCODE){throw ('Test échoué : '+$file)}
}
if($ApiMySql){
 # Aucun démarrage de service et aucune connexion VM. Le script JS vérifie 127.0.0.1:33307.
 $testSecret=Read-Host 'Mot de passe des utilisateurs de test locaux (jamais celui MySQL de production)' -AsSecureString
 try{
  $env:VITASOUSS_TEST_PASSWORD=[Net.NetworkCredential]::new('',$testSecret).Password
  & node tools/verify-drencher-v132.mjs
  if($LASTEXITCODE){throw 'Tests API/MySQL échoués : consulter le rapport sans considérer la livraison validée'}
 }finally{$env:VITASOUSS_TEST_PASSWORD=$null}
}
Write-Output 'Les PDF doivent aussi être contrôlés avec verify-drencher-v132-pdf.py (Python, Poppler, pdfplumber et Pillow).'

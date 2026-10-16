param([string]$Url='http://127.0.0.1:5080')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$dotnetPath=Join-Path $projectRoot '.dotnet\dotnet.exe'
if(-not (Test-Path -LiteralPath $dotnetPath)) { $dotnetPath='dotnet' }
$env:DOTNET_CLI_HOME=Join-Path $projectRoot '.dotnet-home'
$env:ASPNETCORE_ENVIRONMENT='Development'
$localConfigPath=Join-Path $projectRoot 'backend\appsettings.Local.json'
$hasProtectedSecret=$false
if(Test-Path -LiteralPath $localConfigPath) { $localConfig=Get-Content -LiteralPath $localConfigPath -Raw|ConvertFrom-Json; $hasProtectedSecret=-not [string]::IsNullOrWhiteSpace($localConfig.Admin.ProtectedPassword) }
if(-not $hasProtectedSecret -and -not $env:VITASOUSS_ADMIN_PASSWORD -and -not $env:Admin__Password) {
 $secret=Read-Host 'Mot de passe MySQL du compte administration (ou Entrée si secret déjà protégé dans la configuration)' -AsSecureString
 $env:VITASOUSS_ADMIN_PASSWORD=[System.Net.NetworkCredential]::new('', $secret).Password
}
Push-Location (Join-Path $projectRoot 'backend')
try {
 $assembly=Join-Path $projectRoot 'publish\Vitasouss.Api.dll'
 if(-not (Test-Path -LiteralPath $assembly)){ $assembly=Join-Path $projectRoot 'backend\bin\Debug\net10.0\Vitasouss.Api.dll' }
 if(Test-Path -LiteralPath $assembly){ & $dotnetPath $assembly --urls $Url }
 else { & $dotnetPath run --project Vitasouss.Api.csproj --urls $Url }
} finally { $env:VITASOUSS_ADMIN_PASSWORD=$null;Pop-Location }

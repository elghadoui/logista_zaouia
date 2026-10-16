# Lance les contrôles HTTP manquants sur MySQL de test local uniquement.
# Le mot de passe est saisi masqué puis transmis en mémoire au seul processus Node.
param([switch]$SkipRestart)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if($projectRoot -ne 'C:\logista_zaouia'){throw 'Dossier de test non reconnu'}
$securePassword=$null
$bstr=[IntPtr]::Zero
try {
  if(-not $SkipRestart){& (Join-Path $PSScriptRoot 'Restart-VitasoussV151-ApiTests.ps1')}
  $ready=$false
  for($i=0;$i -lt 30;$i++){try{$health=Invoke-RestMethod -Uri 'http://127.0.0.1:5080/api/health' -TimeoutSec 2;if($health.version -eq '1.5.1'){$ready=$true;break}}catch{};Start-Sleep -Seconds 1}
  if(-not $ready){throw 'API V1.5.1 locale non prête sur 127.0.0.1:5080; aucun test HTTP exécuté.'}
  $securePassword=Read-Host 'Mot de passe du compte Admin local de test (saisie masquée)' -AsSecureString
  $bstr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  $env:VITASOUSS_TEST_PASSWORD=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  & node (Join-Path $PSScriptRoot 'verify-v151-api.mjs')
  if($LASTEXITCODE -ne 0){throw "Les contrôles HTTP ont échoué (code $LASTEXITCODE). Lire docs/tests-v151-api.json."}
} finally {
  Remove-Item Env:VITASOUSS_TEST_PASSWORD -ErrorAction SilentlyContinue
  if($bstr -ne [IntPtr]::Zero){[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)}
  if($securePassword){$securePassword.Dispose()}
}

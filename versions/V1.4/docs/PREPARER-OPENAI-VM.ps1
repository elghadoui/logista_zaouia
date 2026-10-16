param([Parameter(Mandatory=$true)][string]$Model,[string]$SiteName)
$ErrorActionPreference='Stop'
if(-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)){throw 'Exécuter dans Windows PowerShell administrateur sur VM-APPS.'}
if([string]::IsNullOrWhiteSpace($Model)){throw 'Modèle OpenAI obligatoire, sans clé API.'}
Import-Module WebAdministration
$poolCandidates=@(Get-ChildItem IIS:\AppPools | Where-Object {$_.processModel.userName -match '(^|\\)svc_vitasouss$'})
$sites=@(Get-Website | Where-Object {$_.applicationPool -in $poolCandidates.Name -and (-not $SiteName -or $_.Name -eq $SiteName)})
if($sites.Count -ne 1){throw 'Site unique utilisant svc_vitasouss introuvable. Relancer avec -SiteName le nom IIS existant.'}
$site=$sites[0]
$pool=Get-Item ('IIS:\AppPools\'+$site.applicationPool)
if(-not $pool.processModel.loadUserProfile){throw 'LoadUserProfile doit être déjà activé sur le pool svc_vitasouss ; vérifier avec votre administrateur IIS.'}
$identity=[string]$pool.processModel.userName
if($identity.StartsWith('.\')){$identity=$env:COMPUTERNAME+$identity.Substring(1)}
if($identity -notmatch '\\'){$identity=$env:COMPUTERNAME+'\'+$identity}
$serviceSid=([Security.Principal.NTAccount]::new($identity)).Translate([Security.Principal.SecurityIdentifier])
$appDir=[IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables($site.physicalPath))
$localPath=Join-Path $appDir 'appsettings.Local.json'
if(-not(Test-Path -LiteralPath (Join-Path $appDir 'Vitasouss.Api.dll')) -or -not(Test-Path -LiteralPath $localPath)){throw 'Installation VITASOUSS existante introuvable.'}
$config=Get-Content -LiteralPath $localPath -Raw | ConvertFrom-Json
if(-not $config.Security.KeyDirectory){throw 'Configurer un Security:KeyDirectory absolu hors site correspondant aux clés existantes, avant activation. Ne pas créer un nouveau trousseau.'}
$keyDir=if([IO.Path]::IsPathRooted($config.Security.KeyDirectory)){[IO.Path]::GetFullPath($config.Security.KeyDirectory)}else{[IO.Path]::GetFullPath((Join-Path $appDir $config.Security.KeyDirectory))}
if(-not(Test-Path -LiteralPath $keyDir)){throw 'Trousseau Data Protection existant introuvable. Ne pas en créer un autre.'}
$baseDir=Join-Path $env:ProgramData 'Vitasouss'
foreach($directoryName in @('secrets','assistant-audit')){
 $directoryPath=Join-Path $baseDir $directoryName
 New-Item -ItemType Directory -Path $directoryPath -Force | Out-Null
 $acl=[Security.AccessControl.DirectorySecurity]::new()
 $acl.SetAccessRuleProtection($true,$false)
 foreach($entry in @(@($serviceSid,'Modify'),@([Security.Principal.SecurityIdentifier]::new('S-1-5-18'),'FullControl'),@([Security.Principal.SecurityIdentifier]::new('S-1-5-32-544'),'FullControl'))){
  $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($entry[0],$entry[1],'ContainerInherit,ObjectInherit','None','Allow'))
 }
 Set-Acl -LiteralPath $directoryPath -AclObject $acl
}
# Preserve all other existing settings and protected MySQL secrets. No API key is accepted by this script.
if(-not $config.PSObject.Properties['Assistant']){$config | Add-Member -NotePropertyName Assistant -NotePropertyValue ([pscustomobject]@{})}
$config.Assistant | Add-Member -NotePropertyName Provider -NotePropertyValue 'OpenAI' -Force
$config.Assistant | Add-Member -NotePropertyName Model -NotePropertyValue $Model -Force
$config | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $localPath -Encoding UTF8
$dotnetPath=(Get-Command dotnet.exe -ErrorAction Stop).Source
$helperPath=Join-Path $baseDir 'activate-openai.ps1'
$appLiteral=$appDir.Replace("'","''"); $dotnetLiteral=$dotnetPath.Replace("'","''")
@"
`$ErrorActionPreference='Stop'
`$env:ASPNETCORE_ENVIRONMENT='Production'
Set-Location -LiteralPath '$appLiteral'
& '$dotnetLiteral' .\Vitasouss.Api.dll --protect-openai-secret
if(`$LASTEXITCODE -ne 0){throw 'Enregistrement non réalisé. Vérifier identité, ACL et clés Data Protection.'}
Write-Host 'Clé enregistrée. Fermer cette fenêtre puis recycler le pool depuis la console administrateur.'
"@ | Set-Content -LiteralPath $helperPath -Encoding UTF8
$helperAcl=[Security.AccessControl.FileSecurity]::new()
$helperAcl.SetAccessRuleProtection($true,$false)
$helperAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($serviceSid,'ReadAndExecute','Allow'))
foreach($sid in @('S-1-5-18','S-1-5-32-544')){$helperAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid),'FullControl','Allow'))}
Set-Acl -LiteralPath $helperPath -AclObject $helperAcl
Write-Host ('Site : '+$site.Name+' ; identité : '+$identity+' ; dossier : '+$appDir)
Write-Host 'runas demande le mot de passe du compte Windows svc_vitasouss. La nouvelle fenêtre demande ensuite la clé OpenAI sans affichage.'
& runas.exe /profile "/user:$identity" "powershell.exe -NoProfile -NoExit -File `"$helperPath`""
if($LASTEXITCODE -ne 0){throw 'Ouverture sous svc_vitasouss non réalisée. Ne pas protéger la clé sous une autre identité.'}
Write-Host 'Après saisie réussie et fermeture de la nouvelle fenêtre :'
Write-Host ("Restart-WebAppPool -Name '"+$site.applicationPool.Replace("'","''")+"'")

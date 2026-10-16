param()
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$published=Join-Path $projectRoot 'publish'
$frontendDist=Join-Path $projectRoot 'frontend\dist'
$currentWebFiles=@(Get-ChildItem -LiteralPath $frontendDist -File -Recurse | ForEach-Object {'wwwroot\'+[IO.Path]::GetRelativePath($frontendDist,$_.FullName)})
$release=Join-Path $projectRoot 'release\VITASOUSS-V1.4'
if(Test-Path -LiteralPath $release){throw 'Dossier de paquet existant : vérifier avant de recréer.'}
if(-not(Test-Path -LiteralPath (Join-Path $published 'Vitasouss.Api.dll'))){throw 'Publication requise'}
New-Item -ItemType Directory -Path (Join-Path $release 'update'),(Join-Path $release 'docs'),(Join-Path $release 'sql') | Out-Null
foreach($file in Get-ChildItem -LiteralPath $published -File -Recurse){
 $relative=[IO.Path]::GetRelativePath($published,$file.FullName)
 if($file.Name -like 'appsettings*.json' -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl' -or $relative -match '(^|[\\/])(keys|logs|secrets|assistant-audit)([\\/]|$)'){continue}
 if($relative.StartsWith('wwwroot\') -and $relative -notin $currentWebFiles){continue}
 $target=Join-Path (Join-Path $release 'update') $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target
}
foreach($name in @('MISE-A-JOUR-V1.4.md','VERIFICATION-V1.4.md','QUESTIONS-V1.4.md','CARTOGRAPHIE-METIER.md','PERMISSIONS-V1.4.md','SYNCHRONISATION-V1.4.md','ACTIVATION-OPENAI.md','VERIFICATION-ASSISTANT-IA.md','assistant-verification.json','assistant-http-verification.json','api-verification.json','api-verification-v11.json','api-verification-v12.json','api-verification-v121.json','api-verification-v13.json','api-verification-v14.json','comparison-verification-v12.json','modified-files-v14.json')){
 Copy-Item -LiteralPath (Join-Path (Join-Path $projectRoot 'docs') $name) -Destination (Join-Path $release 'docs')
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'docs\PREPARER-OPENAI-VM.ps1') -Destination (Join-Path $release 'docs')
Copy-Item -LiteralPath (Join-Path $projectRoot 'sql\002_permissions_v14.sql') -Destination (Join-Path $release 'sql')
$archive=Join-Path $projectRoot 'VITASOUSS-V1.4-IIS.zip'
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $archive -Force
Write-Output ('Paquet : '+$archive)
Write-Output ('SHA256 '+(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash)

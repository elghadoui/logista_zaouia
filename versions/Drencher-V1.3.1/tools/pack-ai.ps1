param()
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$published=Join-Path $projectRoot 'publish'
$release=Join-Path $projectRoot 'release\VITASOUSS-V1.3-AI'
$frontendDist=Join-Path $projectRoot 'frontend\dist'
$currentWebFiles=@(Get-ChildItem -LiteralPath $frontendDist -File -Recurse | ForEach-Object {'wwwroot\'+[IO.Path]::GetRelativePath($frontendDist,$_.FullName)})
if(Test-Path -LiteralPath $release){throw 'Paquet déjà préparé. Utiliser un nouveau dossier de préparation après vérification.'}
if(-not(Test-Path -LiteralPath (Join-Path $published 'Vitasouss.Api.dll'))){throw 'Publication requise'}
New-Item -ItemType Directory -Path (Join-Path $release 'update'),(Join-Path $release 'docs') | Out-Null
foreach($file in Get-ChildItem -LiteralPath $published -File -Recurse){
 $relative=[IO.Path]::GetRelativePath($published,$file.FullName)
 if($file.Name -like 'appsettings*.json' -or $file.Name -eq 'web.config' -or $file.Extension -in '.protected','.jsonl' -or $relative -match '(^|[\\/])(keys|logs|secrets|assistant-audit)([\\/]|$)'){continue}
 if($relative.StartsWith('wwwroot\') -and $relative -notin $currentWebFiles){continue}
 $target=Join-Path (Join-Path $release 'update') $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target
}
foreach($name in @('ACTIVATION-OPENAI.md','VERIFICATION-ASSISTANT-IA.md','PREPARER-OPENAI-VM.ps1','assistant-verification.json','assistant-http-verification.json','api-verification.json')){
 Copy-Item -LiteralPath (Join-Path (Join-Path $projectRoot 'docs') $name) -Destination (Join-Path $release 'docs')
}
$archive=Join-Path $projectRoot 'VITASOUSS-V1.3-AI-IIS.zip'
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $archive -Force
Get-Item -LiteralPath $archive | Select-Object Name,Length
Get-FileHash -LiteralPath $archive -Algorithm SHA256

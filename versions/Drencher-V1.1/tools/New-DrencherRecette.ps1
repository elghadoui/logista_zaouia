param([string]$OutputDirectory=(Join-Path $PWD 'drencher-recette-preparation'))
$ErrorActionPreference='Stop'
$scriptRoot=$PSScriptRoot
$sqlFolder=Join-Path (Split-Path $scriptRoot -Parent) 'sql'
$identiteRecette=[Guid]::NewGuid().ToString('N')
$baseRecette='vitasouss_recette_drencher_'+$identiteRecette
if($baseRecette -notmatch '^vitasouss_recette_drencher_[a-f0-9]{32}$'){throw 'Identité invalide'}
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$destination=Join-Path $OutputDirectory ($baseRecette+'.sql')
# CREATE DATABASE sans IF NOT EXISTS : refuse toute base déjà présente.
$sql="-- Préparation de recette Drencher V1.1. Aucune connexion ni exécution automatique.`nCREATE DATABASE ``$baseRecette`` CHARACTER SET latin1;`nUSE ``$baseRecette``;`n"
foreach($name in @('008_drencher_recette_structure.sql','004_drencher_business.sql','007_drencher_recette_identite.sql')){$sql+=(Get-Content -LiteralPath (Join-Path $sqlFolder $name) -Raw)+"`n"}
$sql+="INSERT INTO vit_dr_recette_identite(id,identite,database_name,date_creation) VALUES(1,'$identiteRecette','$baseRecette',UTC_TIMESTAMP());`n"
[IO.File]::WriteAllText([IO.Path]::GetFullPath($destination),$sql,[Text.UTF8Encoding]::new($false))
$demo=Join-Path $OutputDirectory ($baseRecette+'-demo.sql')
$demoSql="-- Facultatif, données SYNTHÉTIQUES, uniquement APRÈS activation explicite du contexte Recette.`nUSE ``$baseRecette``;`n"
$demoSql+="INSERT INTO adherent(refadh,nomadh) VALUES(1,'ADHERENT RECETTE');`nINSERT INTO verger(refver,nomver,refadh,refsta) VALUES(101,'VERGER RECETTE',1,7816);`nINSERT INTO culture(codcul,nomcul) VALUES(100,'CULTURE RECETTE');`nINSERT INTO grpvar(codgrv,nomgrv) VALUES(1,'GROUPE RECETTE');`nINSERT INTO variete(codvar,nomvar,codcul,codgrv) VALUES(104,'VARIETE RECETTE',100,1);`nINSERT INTO station(refsta,nomsta) VALUES(7816,'ZAOUIA RECETTE');`nINSERT INTO reception(numrec,refsta,codvar,refver,dterec) VALUES(1,7816,104,101,'2026-10-08'),(2,7816,104,101,'2026-10-08');`n"
$rows=1..164 | ForEach-Object {"($_,$(if($_ -le 160){1}else{2}),104,101,1,500)"}
$demoSql+='INSERT INTO palbrut(numpal,numrec,codvar,refver,refadh,pdsfru) VALUES '+($rows -join ',')+";`n"
[IO.File]::WriteAllText([IO.Path]::GetFullPath($demo),$demoSql,[Text.UTF8Encoding]::new($false))
Write-Output ('Base neuve à faire créer par le DBA : '+$baseRecette)
Write-Output ('SQL de préparation : '+[IO.Path]::GetFullPath($destination))
Write-Output ('SQL synthétique facultatif : '+[IO.Path]::GetFullPath($demo))
Write-Output 'Aucune base distante modifiée. Ajouter le contexte ZAOUIA (local_refsta 7816), puis activer Recette dans Drencher en administrateur avant les essais.'

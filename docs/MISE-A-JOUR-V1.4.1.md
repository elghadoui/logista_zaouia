# Mise à jour V1.4 → V1.4.1 sur VM-APPS

Le paquet contient update/, sql/ et docs/. Copier seulement update/ dans le site existant `C:\Apps\VitasoussReferentiels`. Le paquet n’inclut aucun appsettings, web.config, secret, trousseau, journal ou configuration IIS. Le compte/profil svc_vitasouss, les protections MySQL/OpenAI et les chemins des clés restent identiques. Ne pas réinitialiser l’application ni réenregistrer la clé OpenAI pour cette mise à jour.

Valider d’abord sur une installation de recette avec des bases isolées. Sauvegarder les fichiers actuels, referentiels_admin, les bases métier et les clés/secrets externes avec leurs ACL, selon votre procédure habituelle. Conserver les sauvegardes en accès restreint. Aucun déploiement n’a été effectué par Codex.

## Migration administration

Faire exécuter sql/003_permissions_v141.sql par le DBA sur referentiels_admin. La V1.4 doit déjà disposer de app_module_permissions. La migration ajoute Marchés sans modifier les permissions existantes ; elle laisse Marchés fermé pour les comptes existants non Admin. Attribuer ensuite les droits nécessaires depuis Droits par module. Consultation reste sans écriture. La migration peut être rejouée sans remplacer une matrice personnalisée.

Si mysql.exe est installé, dans PowerShell sur la VM avec un compte DBA autorisé :

```powershell
$Paquet = (Resolve-Path -LiteralPath (Read-Host 'Dossier du paquet extrait')).Path
$CompteDBA = Read-Host 'Compte DBA pour referentiels_admin'
$Migration = (Join-Path $Paquet 'sql\003_permissions_v141.sql').Replace('\','/')
mysql.exe --host=192.168.1.254 --port=3306 --user=$CompteDBA --password --database=referentiels_admin --execute="SOURCE $Migration;"
if ($LASTEXITCODE -ne 0) { throw 'Migration non realisee : ne pas poursuivre.' }
```

Le mot de passe est demandé par mysql.exe, jamais écrit dans la commande. Adapter l’hôte/port uniquement si la base administration existante utilise un autre serveur. Utiliser un chemin de paquet sans espaces pour SOURCE, ou votre client SQL habituel. Ne pas exécuter 001_admin.sql ni bootstrap-admin. Vérifier les privilèges ciblés décrits dans SYNCHRONISATION-V1.4.1.md avant la recette.

## Copier update/ en conservant la configuration

Dans **Windows PowerShell administrateur** sur VM-APPS, après sauvegarde et migration :

```powershell
Import-Module WebAdministration
$ErrorActionPreference = 'Stop'
$Paquet = (Resolve-Path -LiteralPath (Read-Host 'Dossier du paquet extrait')).Path
$NomSite = Read-Host 'Nom du site IIS VITASOUSS existant'
$Site = Get-Website -Name $NomSite
if (-not $Site) { throw 'Site IIS introuvable.' }
$Pool = Get-Item ('IIS:\AppPools\' + $Site.applicationPool)
if ($Pool.processModel.userName -notmatch '(^|\\)svc_vitasouss$') { throw 'Identite IIS inattendue : verifier le site avant de poursuivre.' }
$App = [IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables($Site.physicalPath)).TrimEnd('\')
if ($App -ne 'C:\Apps\VitasoussReferentiels') { throw 'Repertoire de site inattendu : verifier la cible.' }
$Update = (Resolve-Path -LiteralPath (Join-Path $Paquet 'update')).Path.TrimEnd('\')
if (-not (Test-Path -LiteralPath (Join-Path $Update 'Vitasouss.Api.dll'))) { throw 'Dossier update invalide.' }
$Fichiers = @(Get-ChildItem -LiteralPath $Update -Recurse -File)
foreach ($Fichier in $Fichiers) {
    $Relatif = $Fichier.FullName.Substring($Update.Length).TrimStart('\')
    if ($Fichier.Name -like 'appsettings*.json' -or $Fichier.Name -eq 'web.config' -or
        $Fichier.Extension -in '.protected','.jsonl' -or
        $Relatif -match '(^|[\\/])(keys|secrets|logs|assistant-audit)([\\/]|$)') { throw "Fichier interdit dans update : $Relatif" }
}
$Proteges = @('appsettings.Local.json','web.config')
$Empreintes = @{}
foreach ($Nom in $Proteges) {
    $Chemin = Join-Path $App $Nom
    if (-not (Test-Path -LiteralPath $Chemin)) { throw "Configuration existante absente : $Nom" }
    $Empreintes[$Nom] = (Get-FileHash -LiteralPath $Chemin -Algorithm SHA256).Hash
}
Stop-WebAppPool -Name $Site.applicationPool
try {
    foreach ($Fichier in $Fichiers) {
        $Relatif = $Fichier.FullName.Substring($Update.Length).TrimStart('\')
        $Cible = Join-Path $App $Relatif
        New-Item -ItemType Directory -Force -Path (Split-Path $Cible -Parent) | Out-Null
        Copy-Item -LiteralPath $Fichier.FullName -Destination $Cible -Force
    }
    foreach ($Nom in $Proteges) {
        if ((Get-FileHash -LiteralPath (Join-Path $App $Nom) -Algorithm SHA256).Hash -ne $Empreintes[$Nom]) { throw "Configuration modifiee : $Nom" }
    }
} catch {
    Write-Error 'Copie non confirmee. Conserver le pool arrete et restaurer la sauvegarde applicative.'
    throw
}
Start-WebAppPool -Name $Site.applicationPool
Invoke-RestMethod -Uri 'http://127.0.0.1:8081/api/health'
```

Adapter uniquement l’URL de santé au binding existant si le site ne répond pas sur localhost. Le résultat attendu est version **1.4.1**. L’identité, les bindings, le profil Windows, web.config, appsettings.Local.json, les ACL et les clés/secrets externes ne sont pas modifiés. Les anciens assets statiques peuvent rester ; le nouvel index utilise les nouveaux noms compilés.

Reconnecter les utilisateurs après tout changement de permissions, puis suivre VERIFICATION-V1.4.1.md. Tester aussi l’Assistant déjà configuré sans communiquer la clé. Le fichier POINTS-A-VALIDER-V1.4.1.md décrit les limites restantes.

## Retour arrière

Arrêter le pool, restaurer les fichiers applicatifs V1.4 sauvegardés en conservant les fichiers locaux, clés, secrets et identité, puis redémarrer. La ligne de permission marche peut rester dans l’administration. Ne pas supprimer les données métier ni l’historique des opérations effectuées pendant la recette. Les nouveaux groupes du menu utilisent une préférence distincte ; les préférences V1.4 ne sont pas supprimées.

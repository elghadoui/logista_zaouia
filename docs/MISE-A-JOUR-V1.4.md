# Mise à jour V1.3-AI → V1.4

Le paquet VITASOUSS-V1.4-IIS.zip contient update/, sql/ et docs/. Copier uniquement update/ dans le site existant. Aucun appsettings, web.config, trousseau, journal ou secret n’est livré. Les chemins C:\ProgramData\Vitasouss\keys et secrets restent en place ; même compte/profil svc_vitasouss, même configuration IIS, même protection MySQL/OpenAI. Ne pas réexécuter 001_admin.sql, bootstrap-admin ou protect-openai-secret pour cette mise à jour.

## Avant installation

Sauvegarder l’application existante, la base d’administration et les bases métier selon votre procédure habituelle, ainsi que les clés/secrets externes avec leurs ACL. Conserver la sauvegarde en accès restreint. Valider d’abord sur un environnement de recette non productif.

Faire exécuter **sql/002_permissions_v14.sql** par le DBA dans la base referentiels_admin existante. Cette migration idempotente ne touche aucune table Logista et ne remplace pas les permissions personnalisées à une seconde exécution. Le runtime ne l’applique pas automatiquement.

Si le client MySQL est disponible sur VM-APPS, la commande PowerShell explicite peut être :

```powershell
$Paquet = (Resolve-Path -LiteralPath (Read-Host 'Dossier du paquet extrait')).Path
$HoteAdmin = Read-Host 'Hote MySQL de la base administration existante'
$PortAdmin = Read-Host 'Port MySQL administration'
$CompteDBA = Read-Host 'Compte DBA autorise pour la migration'
$Migration = (Join-Path $Paquet 'sql\002_permissions_v14.sql').Replace('\','/')
mysql.exe --host=$HoteAdmin --port=$PortAdmin --user=$CompteDBA --password --database=referentiels_admin --execute="SOURCE $Migration;"
if ($LASTEXITCODE -ne 0) { throw 'Migration non realisee : ne pas poursuivre la mise a jour.' }
```

Le mot de passe MySQL est demandé par mysql.exe, sans argument en clair. Aucun secret OpenAI n’est demandé. Adapter le nom de base si l’administration actuelle utilise un autre nom. Si le chemin du paquet contient des espaces, déplacer uniquement le fichier SQL dans un dossier simple avant SOURCE, ou utiliser votre client SQL habituel.

Faire vérifier les droits SQL **table par table** dans SYNCHRONISATION-V1.4.md et PERMISSIONS-V1.4.md. Ne pas attribuer DELETE global ni d’écriture archive. Si un droit manque, l’opération concernée peut rester protégée ; l’application ne l’ajoute pas automatiquement.

## Copier la mise à jour

Dans Windows PowerShell administrateur sur VM-APPS, depuis le même paquet extrait :

```powershell
Import-Module WebAdministration
$Paquet = (Resolve-Path -LiteralPath (Read-Host 'Dossier du paquet extrait')).Path
$NomSite = Read-Host 'Nom du site IIS VITASOUSS existant'
$Site = Get-Website -Name $NomSite
if (-not $Site) { throw 'Site IIS introuvable.' }
$Pool = Get-Item ('IIS:\AppPools\' + $Site.applicationPool)
if ($Pool.processModel.userName -notmatch '(^|\\)svc_vitasouss$') {
    throw 'Identite IIS differente : verifier le site existant avant la mise a jour.'
}
$App = [Environment]::ExpandEnvironmentVariables($Site.physicalPath)
$Update = Join-Path $Paquet 'update'
if (-not (Test-Path -LiteralPath (Join-Path $Update 'Vitasouss.Api.dll'))) {
    throw 'Dossier update invalide.'
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
    foreach ($Fichier in Get-ChildItem -LiteralPath $Update -Recurse -File) {
        $Relatif = $Fichier.FullName.Substring($Update.Length).TrimStart('\')
        if ($Fichier.Name -like 'appsettings*.json' -or $Fichier.Name -eq 'web.config' -or
            $Fichier.Extension -in '.protected','.jsonl' -or
            $Relatif -match '(^|[\\/])(keys|secrets|logs|assistant-audit)([\\/]|$)') {
            throw "Fichier interdit dans update : $Relatif"
        }
        $Cible = Join-Path $App $Relatif
        New-Item -ItemType Directory -Force -Path (Split-Path $Cible -Parent) | Out-Null
        Copy-Item -LiteralPath $Fichier.FullName -Destination $Cible -Force
    }
    foreach ($Nom in $Proteges) {
        if ((Get-FileHash -LiteralPath (Join-Path $App $Nom) -Algorithm SHA256).Hash -ne $Empreintes[$Nom]) {
            throw "Configuration modifiee : $Nom"
        }
    }
} catch {
    Write-Error 'Copie non confirmee. Garder le pool arrete et restaurer la sauvegarde applicative.'
    throw
}
Start-WebAppPool -Name $Site.applicationPool
```

Ces commandes ne modifient pas l’identité/profil du pool, bindings, certificats, ACL du site/trousseau, paramètres de connexion, secret OpenAI ou base historique. Le pool ne doit être relancé qu’après migration/copie confirmées. Les anciens fichiers statiques inutilisés peuvent rester en place ; le nouvel index utilise uniquement les nouveaux assets.

## Validation et retour arrière

Vérifier /api/health = 1.4, connexion Admin et les écrans métier. Configurer les droits depuis Administration → Droits par module, puis reconnecter les comptes concernés. Confirmer la lecture archive et l’assistant OpenAI avec la configuration déjà active. Suivre VERIFICATION-V1.4.md pour la recette complète.

Pour revenir à V1.3-AI, arrêter le pool, restaurer uniquement les fichiers applicatifs sauvegardés en conservant Local/web.config/keys/secrets/identité, puis redémarrer. La nouvelle table de permissions peut rester en place ; V1.3-AI ne l’utilise pas. Ne pas supprimer les données métier ou réinitialiser les utilisateurs. Conserver l’audit des opérations effectuées pendant la recette.

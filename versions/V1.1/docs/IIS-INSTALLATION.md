# Installation du paquet IIS V1.1

Paquet préparé pour validation : `VITASOUSS-V1.1-IIS.zip`. Aucun déploiement de production n’a été effectué. Pour une mise à jour V1, conserver la configuration Local, le répertoire de clés, l’identité du pool et la base admin existants ; aucune migration du schéma historique n’est nécessaire. Lire `docs/VERIFICATION-V1.1.md` avant validation.

Le paquet contient `app/` (application compilée), `sql/` (base d’administration) et `docs/` (décisions et vérifications). Le code source complet et la procédure de développement se trouvent dans le dossier projet `C:\logista_zaouia`.

1. Extraire le paquet. Copier seulement le contenu de `app/` dans le dossier du site IIS, par exemple `C:\Apps\VitasoussReferentiels`.
2. Créer un pool 64 bits No Managed Code, avec une identité Windows dédiée et Load User Profile activé. Le Hosting Bundle .NET 10 doit être installé.
3. Créer un binding HTTPS et un certificat intranet valide. Les secrets et mots de passe circulent uniquement sur HTTPS en exploitation.
4. Exécuter `sql/001_admin.sql` sur le serveur d’administration **explicitement autorisé**. Aucune table logista ne doit être créée/recréée depuis le dump.
5. Créer les comptes SQL dédiés à privilèges limités. Ne pas accorder DROP/ALTER/DELETE aux comptes métier ; utiliser SELECT seul pour les archives si possible.
6. Dans le dossier application, créer `appsettings.Local.json` à partir de `appsettings.Example.json`. Confirmer l’hôte admin, le compte, le DNS AllowedHosts et un répertoire de clés hors site, par exemple `C:\ProgramData\Vitasouss\keys`. Autoriser Modify seulement à l’identité du pool sur ce répertoire, et Lecture/Exécution sur le dossier de l’application.
7. Sous la même identité Windows que le pool et depuis le dossier application, saisir temporairement le mot de passe MySQL admin dans `VITASOUSS_ADMIN_PASSWORD`, puis exécuter :

```powershell
$secret = Read-Host 'Secret MySQL administration' -AsSecureString
$env:VITASOUSS_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $secret).Password
dotnet .\Vitasouss.Api.dll --protect-admin-secret
```

8. Copier uniquement la valeur protégée résultante dans `Admin:ProtectedPassword`, puis supprimer la variable temporaire. Les clés Data Protection sont protégées par DPAPI utilisateur : un secret chiffré sous une autre identité ne fonctionnera pas. Ne pas copier les clés de test.
9. Sous cette même identité, créer le premier admin (seulement lorsque app_users est vide) :

```powershell
$env:VITASOUSS_BOOTSTRAP_USER = 'admin'
$bootstrap = Read-Host 'Mot de passe application administrateur (12 caractères minimum)' -AsSecureString
$env:VITASOUSS_BOOTSTRAP_PASSWORD = [System.Net.NetworkCredential]::new('', $bootstrap).Password
dotnet .\Vitasouss.Api.dll --bootstrap-admin
$env:VITASOUSS_BOOTSTRAP_PASSWORD = $null
$env:VITASOUSS_ADMIN_PASSWORD = $null
```

10. Lancer le site en Production avec `Security:SecureCookies=true`. Vérifier `/api/health`, la connexion et les droits. Configurer ZAOUIA, ses exercices et les accès depuis Administration, d’abord en lecture seule. Raccorder DIAF seulement après confirmation de ses paramètres, de l’exercice correspondant et des identifiants.

Lire `docs/DECISIONS.md` avant raccordement : le dump nommé zaouia contient une table station DIAF/7702 et tous ses vergers ont refsta=7816. Rien n’a été normalisé. La V1 préserve le refsta de la destination pendant la synchronisation.

Le paquet ne contient ni base de test, ni mot de passe, ni fichier Local, ni clés de développement. Aucun serveur de production n’a été contacté pendant la réalisation. Sauvegarder l’administration et ses clés selon une procédure validée avant usage réel.

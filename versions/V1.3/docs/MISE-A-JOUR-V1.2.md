# VM-APPS — mise à jour V1.1 → V1.2

1. Sauvegarder le dossier applicatif et la base d’administration. Arrêter le pool IIS existant.
2. Extraire `VITASOUSS-V1.2-IIS.zip`. Copier **uniquement le contenu de `update/`** dans le dossier applicatif existant. Ce dossier ne contient ni configuration `appsettings*.json`, ni `web.config`, ni secrets, ni clés. Conserver les fichiers de configuration actuels, l’identité **svc_vitasouss** et les réglages du pool/binding IIS.
3. Ne pas toucher à **C:\ProgramData\Vitasouss\keys**. Ne pas exécuter de bootstrap utilisateur, ni recréer la base admin, ni réimporter le dump.
4. Faire attribuer par le DBA les nouveaux privilèges aux comptes métier concernés : **DELETE sur `verger` et `parcelle`**, **LOCK TABLES sur la base métier**, en plus de SELECT/INSERT/UPDATE existants. Le contrôle exige **SELECT sur toute la base métier**, pour éviter qu’une table dépendante soit masquée par les droits SQL. Aucune extension de droits aux comptes d’archives. Après changement de droits, recycler le pool pour renouveler les connexions.
5. Redémarrer le même pool. Vérifier `/api/health` (`version: 1.2`), connexion, contexte/exercice, Consultation, archive et une fiche Verger. Valider les actions sur une copie avant toute suppression réelle.

## Migrations SQL

**Aucune migration de structure requise**, ni dans `logista`, ni dans la base d’administration. Ne pas réexécuter `001_admin.sql` pour cette mise à jour. `app_changes.operation/status` sont déjà des VARCHAR compatibles avec Transfer/Delete/Blocked ; toutes les configurations, stations, exercices, droits, routes et traces existantes sont réutilisés.

Seuls les privilèges SQL nécessaires aux suppressions sont nouveaux. Le DBA doit adapter le compte, l’hôte et le nom de base réels : aucun compte ou mot de passe de production n’est inclus dans le paquet. Si les droits restent inchangés, transferts/KPI continuent à fonctionner ; une suppression sera refusée avec un message contrôlé.

La Data Protection conserve le même nom d’application et le même purpose de protection des secrets. Ne pas changer l’identité, le profil ou les clés lors de cette mise à jour. Le dossier `app/` est une publication complète destinée à examen/installation ; pour remplacer votre instance, utiliser `update/` afin de préserver sa configuration.

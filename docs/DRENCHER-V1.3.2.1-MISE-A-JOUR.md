# Drencher V1.3.2.1 — correctif des autorisations

Mise à jour de VITASOUSS V1.4.1 + Drencher V1.3.2 existant. Aucun déploiement automatique, aucune modification de `logista`, aucun recalcul de stock et aucune réinitialisation des réservations. SQL 010/011 déjà appliqués restent inchangés.

## Cause et correctif

L'écran des droits classait `drencher` dans sa liste de modules en lecture seule, contrairement à l'API. Ajouter/Modifier étaient donc grisés et restaient souvent à false. Le bouton Nouveau cycle suit exactement le droit Ajouter : il était alors désactivé pour le Gestionnaire. Le correctif retire cette classification erronée ; il **ne coche aucun droit automatiquement**.

L'ancien `drencher_manage` servait simultanément aux produits, programmes et entrées stock. Il est remplacé, pour les contrôles effectifs, par trois droits spécifiques : `drencher_products`, `drencher_programs`, `drencher_stock`. Ses anciennes valeurs restent enregistrées et affichées comme ancien droit groupé sans effet de gestion. Il ne sert jamais de repli pour un droit nouveau absent.

La matrice complète les modules absents avec false en lecture, sans écrire dans la base. L'enregistrement explicite par Admin crée les lignes choisies et révoque les sessions antérieures, comme auparavant. Rôles, mots de passe et exercices ne changent pas.

## Installation rapide sur VM-APPS, par votre équipe

1. Sauvegarder le site, `referentiels_admin`, les configurations locales et clés, et conserver le paquet V1.3.2 précédent. Suspendre les écritures pendant la copie.
2. Arrêter le pool du site existant, puis copier uniquement `update/` dans `C:\Apps\VitasoussReferentiels` avec une copie additive. Ne pas utiliser `/MIR`, supprimer le site, changer l'identité ou remplacer les configurations. Le paquet exclut `appsettings*.json`, `web.config`, clés, secrets et journaux.
3. SQL **facultatif**, séparé : le DBA peut exécuter `sql/012_drencher_permissions_v1321.sql` dans `referentiels_admin`. Il ajoute uniquement trois lignes fermées par utilisateur si elles n'existent pas ; il n'accorde rien et conserve les lignes personnalisées. Aucun script métier n'est nécessaire sur `logista`.
4. Redémarrer le pool, vérifier `/api/health` : VITASOUSS `1.4.1`, Drencher `1.3.2.1`. Recharger complètement le navigateur.
5. Dans Administration → Droits par module, configurer explicitement les comptes ci-dessous. Enregistrer puis reconnecter les utilisateurs pour obtenir une session à jour.

Exemple PowerShell sur VM-APPS (adapter le dossier de préparation ; aucune commande exécutée automatiquement) :

```powershell
Import-Module WebAdministration
$siteName = 'VitasoussReferentiels'
$sitePath = 'C:\Apps\VitasoussReferentiels'
$updatePath = 'C:\Preparation\VITASOUSS-DRENCHER-V1.3.2.1\update'
$poolName = (Get-Item "IIS:\Sites\$siteName").applicationPool
Stop-WebAppPool -Name $poolName
robocopy $updatePath $sitePath /E /R:2 /W:2 /XF appsettings*.json web.config /XD keys secrets logs assistant-audit
if ($LASTEXITCODE -ge 8) { throw 'Copie échouée : vérifier avant redémarrage' }
Start-WebAppPool -Name $poolName
Invoke-RestMethod 'http://localhost:8081/api/health'
```

## Droits à attribuer explicitement

Conserver le rôle général **Gestionnaire** pour Hicham, Mbark et Samira et leurs exercices déjà attribués.

| Module Drencher | Hicham | Mbark et Samira |
|---|---|---|
| Saisie (`drencher`) | Voir, Ajouter, Modifier | Voir ; Ajouter/Modifier seulement si vous souhaitez aussi leur confier la saisie de leurs propres brouillons |
| Validation/correction qualité | Aucun | Voir, Modifier |
| Gestion des produits | Aucun | Voir, Ajouter, Modifier selon vos autorisations |
| Gestion des programmes | Aucun | Voir, Ajouter, Modifier |
| Gestion du stock local | Aucun | Voir, Ajouter selon vos autorisations ; Modifier non opérationnel |
| Suppression administrative de cycle | Jamais | Jamais |

Admin conserve son accès complet et la suppression exceptionnelle avec confirmation/motif. Aucun droit Supprimer Drencher n'est attribuable à un Gestionnaire.

Le droit de saisie autorise les lectures de sélection nécessaires au cycle dans sa station/exercice ; il **n'accorde pas de permission sur les modules généraux de référentiels**. Les programmes actifs restent sélectionnables dans Nouveau cycle. La gestion des programmes requiert uniquement son droit spécifique, en plus de Voir Drencher ; Ajouter du droit groupé ancien ne suffit plus.

L'opérateur modifie/soumet uniquement ses brouillons. Un brouillon d'un autre auteur reste consultable mais son édition/soumission est refusée. Après soumission, l'opérateur reste en lecture, y compris via API/ancien formulaire. La qualité corrige et valide sans condition de propriété, avec son droit spécifique. L'administrateur conserve l'accès exceptionnel aux brouillons d'autrui.

L'accès aux journaux/documents de stock demande Voir gestion du stock. Le catalogue des programmes, produits et lots nécessaires à la saisie reste accessible avec Voir Drencher. Les paramètres de station, exercice, archives et identité Recette restent applicables.

## Contrôle après installation

Avec Hicham, vérifier Nouveau cycle actif, sélection de palettes/lots, enregistrement/modification de son brouillon, puis soumission. Vérifier absence des boutons de gestion et refus des appels API de validation/programmes/produits/stock. Avec Mbark/Samira, vérifier correction/validation, programmes et droits produits/stock attribués ; absence de suppression et d'administration. Admin conserve ses fonctions.

La déduction à la soumission, les deltas qualité, les réservations et toutes les impressions F04 sont conservés. Les tests transactionnels locaux et leurs résultats sont détaillés dans le rapport fourni. Faire la recette utilisateur sur la station avant utilisation courante.

## Retour arrière

Arrêter le pool et appliquer un plan validé avec le DBA. L'ancien binaire V1.3.2 utilise le droit groupé et ne connaît pas les nouvelles lignes de permission : **un retour des fichiers seuls peut réintroduire l'accès opérateur aux programmes et rendre sa matrice d'administration incompatible**. Revenir à une sauvegarde cohérente des fichiers et de la matrice de droits, sans écraser des utilisateurs/mots de passe/exercices créés depuis. Aucun DELETE de permission ni restauration de base n'est exécuté par les scripts de livraison. Les données métier et stocks n'ont aucune migration dans ce correctif.

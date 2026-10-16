# Drencher V1.3.2 — mise à jour depuis V1.3.1

Cette livraison met à jour VITASOUSS V1.4.1 existant. Aucune installation autonome et aucun déploiement automatique sur les VM. Les écritures du module portent uniquement sur ses tables `vit_*`. Les tables historiques Logista restent en lecture.

## Avant intervention

1. Tester d'abord dans un contexte isolé, avec des données synthétiques. Faire valider les PDF et l'impression papier par l'opérateur et le responsable qualité.
2. Vérifier que SQL 004 et 010 sont déjà installés et les réservations initialisées. Inventorier les cycles brouillons, soumis et validés et rapprocher les stocks du journal ; résoudre les incohérences avant mise en production.
3. Planifier un arrêt des saisies. Sauvegarder **l'ensemble du site**, ses configurations, les clés Data Protection et secrets, ainsi que les bases métier et administration avec une méthode de sauvegarde MySQL validée par le DBA. Protéger la sauvegarde et en vérifier la restauration.
4. Utiliser le même pool IIS et son identité `svc_vitasouss`. Ne changer ni port, ni site, ni configuration, ni identité. .NET 10 Hosting Bundle reste requis.

## SQL séparé, exécuté par le DBA

Application arrêtée, exécuter uniquement `sql/011_drencher_v132.sql` sur chaque base où le module Drencher est utilisé en écriture, y compris la recette. Il crée deux tables InnoDB liées aux produits et cycles Drencher, avec clés primaires et FK restrictives. Il peut être exécuté plusieurs fois, **sans recalculer de stock, créer des consommations, modifier des cycles ou remplir les tables historiques**.

Le compte applicatif doit avoir SELECT, INSERT, UPDATE et l'inspection TRIGGER sur ces deux nouvelles tables. Le DELETE sur `vit_dr_cycle_v132` et `vit_dr_produit_document` n'est nécessaire qu'au compte de recette autorisé au nettoyage physique. Les permissions déjà requises sur réservations/validations restent nécessaires pour libérer les palettes lors d'une suppression logique. Le DBA conserve la politique de moindre privilège et les comptes existants ; aucun mot de passe ne figure dans cette livraison.

`CREATE TABLE IF NOT EXISTS` n'altère pas une table incompatible déjà présente : l'application vérifie types, clés, relations restrictives, moteur et déclencheurs, et refuse une forme incompatible. Faire corriger une installation incohérente par le DBA, sans suppression de données.

Les archives en lecture seule restent consultables avec leur schéma Drencher V1.3.1, **sans migration de leur base historique**. En l'absence des deux extensions, les anciens produits restent visibles, leur matière active reste non renseignée et l'historique des suppressions est vide. Les API d'écriture restent interdites. Une installation partielle des extensions est refusée. Les bases utilisées en écriture doivent recevoir SQL 011 ; les autres modules continuent normalement.

## Copie IIS sur VM-APPS

Décompresser le ZIP dans un dossier de préparation. Le dossier `update/` contient les fichiers applicatifs ; SQL reste séparé. Il exclut `appsettings*.json`, `web.config`, les clés, secrets et journaux. **Ne pas utiliser /MIR et ne pas supprimer le site existant.**

Commandes à adapter uniquement pour le dossier de préparation et le nom réel du pool, puis à exécuter dans une session PowerShell administrateur de VM-APPS :

```powershell
Import-Module WebAdministration
$sitePath = 'C:\Apps\VitasoussReferentiels'
$updatePath = 'C:\Preparation\VITASOUSS-DRENCHER-V1.3.2\update'
$siteName = 'VitasoussReferentiels'
$poolName = (Get-Item "IIS:\Sites\$siteName").applicationPool
Stop-WebAppPool -Name $poolName
# À ce stade : sauvegardes vérifiées et SQL 011 installé manuellement par le DBA.
robocopy $updatePath $sitePath /E /R:2 /W:2 /XF appsettings*.json web.config /XD keys secrets logs assistant-audit
if ($LASTEXITCODE -ge 8) { throw 'Copie interrompue : conserver le pool arrêté et vérifier les fichiers.' }
Start-WebAppPool -Name $poolName
Invoke-RestMethod 'http://localhost:8081/api/health'
```

Résultat attendu : VITASOUSS `1.4.1`, `drencherVersion` `1.3.2`. Recharger complètement le navigateur. Vérifier connexion, station/exercice, référentiels, comparaison et assistant en lecture seule. Puis appliquer la fiche de recette Drencher.

## Transition des cycles V1.3.1

- **Brouillon** sans mouvement : aucun débit migré ; la première soumission V1.3.2 déduit le réel.
- **Soumis V1.3.1** sans mouvement : aucun débit créé à l'installation ni à la lecture. À la première validation qualité ou correction qualité, son réel est comptabilisé une fois, transactionnellement. Une suppression préalable ne restitue rien puisqu'aucune sortie n'existait. Le statut reste verrouillé pour l'opérateur.
- **Validé V1.3.1** : le journal net existant doit correspondre exactement aux lots de l'instantané. Il est reconnu comme déjà comptabilisé ; correction = différence et suppression = restitution du net. Aucune seconde consommation complète.
- Une incohérence journal/instantané/état bloque l'opération et exige une vérification administrative. Aucune réparation automatique des soldes.

L'état de transition est inscrit lors de la première action d'écriture, sous le verrou Drencher ; les lectures et impressions ne modifient rien. Les anciens mouvements complets de restitution/remplacement restent conservés et sont traités par leur somme nette.

## Retour arrière

**Avant toute écriture V1.3.2**, remettre les fichiers applicatifs V1.3.1 sauvegardés, pool arrêté. Les deux tables additionnelles vides peuvent rester ; ne pas les supprimer automatiquement.

**Après une soumission, correction ou suppression V1.3.2, ne jamais remettre seulement l'ancien binaire.** V1.3.1 déduirait à nouveau certains cycles soumis et ne reconnaît pas la suppression logique. Arrêter les écritures ; soit corriger en V1.3.2, soit restaurer ensemble les fichiers ET une sauvegarde cohérente des bases métier/administration au point précédant la mise à jour, avec le DBA et une décision explicite sur les opérations réalisées depuis. Ne rejouer ni DELETE ni mouvements de compensation manuels sans rapprochement documenté. Ne pas restaurer les utilisateurs/configurations indépendamment d'un plan validé.

Les anciennes éditions et les versions de programme restent conservées. Les paramètres documentaires des anciens instantanés ne sont pas recalculés depuis les fiches produit.

# Installer le MVP Drencher sur VITASOUSS V1.4.1

Extension à tester et valider avec l'opérateur avant tout usage de production. Aucun déploiement ni migration sur VM-APPS/VM-LOGISTA n'a été exécuté par l'agent.

## Contenu

`VITASOUSS-V1.4.1-DRENCHER-V1-IIS.zip` contient `update/`, `sql/` et `docs/`. L'assemblage reste .NET 10 / version socle 1.4.1. Le nouveau manifeste `drencher-schema.json` doit accompagner la DLL.

Le paquet exclut tous les appsettings, web.config, secrets, clés Data Protection, journaux et données de test. Conserver l'identité du pool `svc_vitasouss`, le port IIS 8081, les configurations locales et les paramètres OpenAI existants.

## Ordre de mise à jour

1. Sauvegarder le dossier `C:\Apps\VitasoussReferentiels`, la base métier ZAOUIA et `referentiels_admin`, avec les mécanismes habituels du serveur. Copier les clés Data Protection selon leur emplacement configuré. Protéger cette sauvegarde car elle contient des secrets.
2. Préférer une copie isolée de l'exercice pour la première recette. Sur VM-LOGISTA, un DBA exécute `004_drencher_business.sql` **dans la base métier ZAOUIA choisie**, puis `005_drencher_permissions.sql` **dans referentiels_admin**. Les scripts sont additifs/idempotents ; aucune table historique n'est modifiée. Ne pas exécuter dans DIAF ni automatiquement dans les archives.
3. Vérifier les dix nouvelles tables et leurs types/index avec le script et `drencher-schema.json`. Les tables doivent être InnoDB et sans déclencheur. CREATE IF NOT EXISTS ne répare pas un schéma déjà incompatible : l'application le bloque, faire contrôler par le DBA.
4. Le compte MySQL métier existant doit avoir SELECT sur la base (dont les cinq tables historiques), et TRIGGER sur les dix nouvelles tables pour vérifier l'absence de déclencheurs. Autoriser SELECT/INSERT/UPDATE uniquement sur `vit_traitement_produit`, `vit_dr_programme`, `vit_dr_mutex`, `vit_dr_stock_lot`, `vit_dr_cycle`. Autoriser SELECT/INSERT sur les cinq tables d'historique/registre restantes. Aucun droit DELETE n'est requis. Les droits existants des autres modules sont conservés ; ne pas les révoquer globalement pendant cette mise à jour.
5. Arrêter le pool IIS de l'application, copier uniquement le contenu de `update/`, redémarrer le même pool. Aucun remplacement de configuration IIS ou d'identité.
6. Dans Administration, attribuer les droits et le contexte/exercice aux utilisateurs. Vérifier `/api/health`, connexion, Sidebar, Assistant, comparaison et module Drencher.

Exemple de copie PowerShell **après sauvegarde et validation locale du contenu extrait**, sous une identité autorisée à gérer IIS. Remplacer le nom réel du pool ; aucune nouvelle identité n'est créée :

```powershell
Import-Module WebAdministration
$poolVitasouss = 'NOM_REEL_DU_POOL'
$miseAJourDrencher = 'C:\Temp\VITASOUSS-V1.4.1-DRENCHER-V1\update'
$dossierVitasouss = 'C:\Apps\VitasoussReferentiels'
Stop-WebAppPool -Name $poolVitasouss
try {
    robocopy $miseAJourDrencher $dossierVitasouss /E /XF appsettings*.json web.config *.protected /XD keys secrets logs assistant-audit
    if ($LASTEXITCODE -ge 8) { throw 'Copie de la mise à jour échouée' }
} finally {
    Start-WebAppPool -Name $poolVitasouss
}
```

Ne pas utiliser `/MIR` : ne supprimer aucun fichier local. Aucun mot de passe MySQL/OpenAI n'est demandé ou enregistré par cette copie. Ne pas modifier le mécanisme de protection des clés.

## Permissions

| Profil | Autorisations à attribuer |
|---|---|
| Opérateur Gestionnaire | Drencher Voir/Ajouter/Modifier ; Réceptions, Variétés, Vergers, Adhérents : Voir ; exercice ZAOUIA |
| Responsable qualité Gestionnaire | Drencher Voir ; Drencher qualité Voir/Modifier ; Drencher gestion Voir/Ajouter/Modifier si gestion des produits/programmes/stock ; modules liés Voir |
| Consultation | Voir Drencher et modules de lecture nécessaires ; aucune écriture |

Admin conserve l'accès complet. Les deux nouveaux modules qualité/gestion sont **fermés par défaut**. Les droits existants Drencher sont conservés, l'écriture opérateur doit être attribuée explicitement. Aucun droit Supprimer pour ce module. Modifier la matrice révoque les anciennes sessions : se reconnecter.

## Poids et archives

Après confirmation opérateur, ajouter seulement `"Drencher": { "PaletteWeightUnit": "kg" }` à la configuration locale existante (ou `t` si confirmé). Ne pas remplacer le fichier entier. Sans ce réglage, les poids bruts s'affichent et le tonnage reste non calculé.

Les archives restent en lecture seule. Une archive sans tables Drencher affiche un message de module non installé ; ne pas migrer d'archive historique pour ce MVP. DIAF est refusé pour Drencher.

## Retour arrière

Restaurer le binaire/front de la sauvegarde V1.4.1 en conservant configurations et clés. Garder les nouvelles tables, les mouvements et l'historique ; ne pas supprimer les cycles déjà saisis. Une remise en production nécessite la validation explicite du responsable de station.

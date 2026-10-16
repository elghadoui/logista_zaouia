# Mise à jour V1.2 → V1.2.1

La V1.2 existante est conservée dans `versions/V1.2/`. La mise à jour réutilise toutes les stations, exercices, rôles, routes et traces ; aucune migration de structure ni réimportation du dump n'est requise.

1. Sauvegarder le dossier de l'application et la base d'administration. Pour permettre la restauration de données après une suppression, conserver également une sauvegarde des bases métier concernées. Arrêter le pool IIS existant.
2. Extraire `VITASOUSS-V1.2.1-IIS.zip`. Copier **uniquement le contenu de `update/`** vers le dossier applicatif actuel. Ne pas utiliser `app/` pour écraser une installation existante.
3. Conserver tous les `appsettings*.json` actuels, notamment `appsettings.Local.json`, les secrets, le `web.config` de production, l'identité **svc_vitasouss**, le profil de ce compte, les paramètres du pool et les bindings IIS. Ne pas toucher à **C:\ProgramData\Vitasouss\keys**.
4. Vérifier les privilèges ci-dessous avec le DBA. Ne pas réexécuter `001_admin.sql`, recréer la base admin, relancer le bootstrap utilisateur ou importer le dump. Recycler les connexions après modification des droits.
5. Redémarrer le même pool. Vérifier `/api/health` : version **1.2.1**, connexion, choix d'exercice, listes, KPI, comparaison, transfert et synchronisation. Suivre la recette visuelle dans `VERIFICATION-V1.2.1.md` avant utilisation des suppressions réelles.

## Privilèges métier minimaux

Les seules tables que l'application supprime sont **parcelle**, **verger**, **adherent**. Il n'existe pas de table « producteur » à ajouter arbitrairement. Si V1.2 possède déjà les droits parcelle/verger et les verrous, le seul droit de suppression supplémentaire est **DELETE sur adherent**.

Exemple à adapter au nom exact de chaque base d'exercice modifiable et au compte/hôte MySQL existants, par le DBA uniquement :

```sql
GRANT DELETE ON `BASE_EXERCICE`.`parcelle` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
GRANT DELETE ON `BASE_EXERCICE`.`verger` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
GRANT DELETE ON `BASE_EXERCICE`.`adherent` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
```

Ne pas attribuer `DELETE ON BASE_EXERCICE.*`. Les droits SELECT/INSERT/UPDATE utilisés par les fonctions V1.2 restent ceux déjà configurés. Le contrôle des dépendances exige **SELECT sur toute la base métier** pour éviter les tables masquées par les droits, ainsi que **LOCK TABLES sur cette base** pour verrouiller en lecture les tables dépendantes pendant le contrôle et en écriture uniquement la fiche à supprimer. Ces besoins existaient en V1.2 ; ils ne donnent aucun droit d'écriture à reception_d.

Pour **reception_d**, seul **SELECT** est nécessaire pour les données ; aucun INSERT, UPDATE ou DELETE n'est requis. Le verrou est un verrou de lecture. Ne pas étendre les droits des comptes/bases d'archives. Ne pas attribuer DELETE à DIAF au titre d'une propagation : aucune suppression n'est propagée par cette version.

Sans ces permissions ou si le schéma de liaison n'est pas reconnu, la suppression reste suspendue avec une erreur métier contrôlée. Les autres fonctions V1.2 restent disponibles.

## Retour arrière

Arrêter le pool et restaurer les fichiers applicatifs V1.2 sauvegardés, en conservant les mêmes configurations, secrets, identité et clés. Les suppressions métier déjà confirmées ne sont pas annulées par un retour arrière de l'application : leur restauration nécessite la sauvegarde métier et une intervention contrôlée du DBA.

Le nom Data Protection `Vitasouss.Referentiels.V1` et le purpose `Vitasouss.MySqlSecrets.v1` sont inchangés. Aucune connexion, modification ou installation de production n'a été effectuée pendant cette réalisation.

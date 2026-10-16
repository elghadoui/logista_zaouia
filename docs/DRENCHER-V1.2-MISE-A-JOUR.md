# Drencher V1.2 — installation depuis V1.1

VITASOUSS V1.4.1 et son site IIS sont conservés. Aucun déploiement, migration ou accès aux VM de production n'a été effectué pendant le développement.

## Correctif Stock sans modification des données

Cause reproduite : MySqlConnector avec les options existantes de gestion des dates zéro renvoie certaines colonnes DATE/DATETIME comme **MySqlDateTime**, et Dapper transmet ces objets dans les lignes dynamiques. `peremption` était donc un objet `{year,month,day,...}`, incompatible avec `.slice()`.

V1.2 convertit explicitement les dates civiles en `yyyy-MM-dd` et les instants en chaînes ISO côté API. React accepte aussi les anciennes représentations objets, les chaînes et les valeurs absentes/invalides, sans décalage de fuseau d'une date civile. Les affichages Stock, mouvements, lots, programme et impression sont protégés. La présentation des dates de réception pilote a également été sécurisée.

**Aucune date, entrée de stock, consommation, solde, produit ou programme existant n'est réécrit pour ce correctif.**

## Ordre impératif pour les réservations

1. Sauvegarder les fichiers V1.1, les bases et les clés selon votre procédure habituelle. Prévoir une période de maintenance pour éviter toute saisie pendant la migration.
2. Arrêter le pool IIS actuel, copier `update/` dans `C:\Apps\VitasoussReferentiels` puis redémarrer le même pool pour le diagnostic. Ne copier aucun appsettings/web.config et ne changer ni `svc_vitasouss`, ni les secrets, ni les clés, ni le port 8081. `/api/health` doit indiquer `version=1.4.1`, `drencherVersion=1.2`.
3. Se connecter comme Admin, sélectionner **l'exercice exact** puis Drencher → **Réservations · admin**. Exécuter le diagnostic **avant le script SQL 010**. Il analyse uniquement les derniers instantanés des cycles existants ; aucun cycle n'est modifié automatiquement. La saisie V1.2 reste bloquée tant que le registre n'est pas initialisé. Produits, programmes et consultation Stock restent accessibles.
4. En présence de doublons, déterminer quel cycle correspond au traitement réellement réalisé. Dans le panneau d'arbitrage, choisir un cycle **non validé**, les palettes à retirer, le motif et la phrase `ARBITRER CYCLE <numéro>`. Cette action explicite crée une nouvelle révision, conserve toutes les anciennes valeurs et remet le cycle en Brouillon. Si toutes ses palettes sont retirées, il faudra compléter ce brouillon avant soumission. Les quantités/programmes restent conservés ; aucun déstockage. Un cycle validé n'est jamais arbitré ici.
5. Pour les essais seulement, la suppression autorisée d'un cycle en base Recette peut également résoudre le conflit. Les suppressions restent impossibles sur `logista`. Ne jamais supprimer automatiquement un cycle pour faire passer la migration.
6. Quand le diagnostic ne signale plus de conflit, le DBA exécute `sql/010_drencher_reservations.sql` dans la **base métier de ce contexte**. Script additif/idempotent : deux nouvelles tables, sans ALTER ni DELETE sur les tables historiques ou les cycles. La contrainte unique porte sur le numéro de palette dans le nouveau registre.
7. Le compte MySQL métier existant doit avoir SELECT/INSERT/UPDATE/**DELETE**/TRIGGER sur `vit_dr_palette_reservee` et SELECT/INSERT/UPDATE/TRIGGER sur `vit_dr_reservation_etat`. DELETE est nécessaire uniquement pour libérer/remplacer les réservations d'un brouillon ; il ne donne aucune nouvelle suppression de cycle réel via l'application. Ne pas étendre DELETE aux cycles/historiques de production.
8. Actualiser le diagnostic, puis cliquer Initialiser les réservations et saisir **INITIALISER RESERVATIONS**. L'API recontrôle les conflits et remplit le registre dans une transaction. Elle ne réécrit aucun ancien cycle. Une initialisation déjà faite ou un registre incohérent est refusé.
9. Vérifier les réservations de cycles Brouillon, En attente et Validé, puis terminer la fiche opérateur. Répéter diagnostic/SQL/initialisation pour chaque contexte ZAOUIA Drencher concerné. Pas de synchronisation Drencher vers DIAF.

Les nouveaux cycles réservent leurs palettes dès le brouillon. Modification, soumission et validation recontrôlent les propriétaires ; la contrainte MySQL et le verrou transactionnel protègent aussi les requêtes concurrentes. Le retrait d'une palette du brouillon et la suppression autorisée en Recette libèrent sa réservation. Les palettes d'un cycle validé restent immuables.

## IIS

Utiliser le guide V1.1 pour la copie sans `/MIR`, avec le **même pool** et le nouveau dossier extrait `VITASOUSS-DRENCHER-V1.2`. Les configurations MySQL/OpenAI et Data Protection sont exclues du ZIP. La livraison reste dépendante du runtime .NET 10 installé.

Pour une nouvelle Recette, le générateur `tools/New-DrencherRecette.ps1` fourni inclut désormais les deux tables de réservation. Après activation Recette, effectuer explicitement l'initialisation des réservations avant la première saisie. Le registre d'identité, les reçus et le journal de nettoyage sont conservés après remise à zéro.

## Retour arrière

Ne pas revenir à V1.1 en autorisant de nouvelles saisies : V1.1 ignore le registre et pourrait créer de nouveaux doublons. En cas de retour temporaire aux fichiers sauvegardés, maintenir la saisie Drencher suspendue et conserver les nouvelles tables et toutes les données. Refaire le diagnostic avant reprise V1.2.

Pas de migration destructive et pas de mise en production automatique. Les essais visuels et votre validation restent nécessaires.

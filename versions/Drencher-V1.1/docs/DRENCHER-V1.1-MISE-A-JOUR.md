# Drencher V1.1 — mise à jour depuis V1

Socle VITASOUSS V1.4.1 conservé. Module Drencher V1.1 : écrans Produits, Programmes et Stock modernisés, mode Recette isolé. Aucun déploiement sur VM-APPS ou VM-LOGISTA effectué pendant le développement.

## Conservation de vos données

Vos produits et votre programme déjà créés dans `logista` restent conservés. Aucune donnée existante n'est requalifiée comme test. Les nouveaux nettoyages ne sont jamais disponibles sur `logista`, même pour Admin, même si le contexte ou l'exercice porte le nom « Recette ».

Nouveau cycle et impression : composants conservés, quatre consommations distinctes, lots/palettes, soumission, validation et correction inchangés. Après votre confirmation, `palbrut.pdsfru` est en **kg** ; les nouveaux cycles prennent cette unité par défaut et le tonnage est poids/1000. Les anciens instantanés sans unité ne sont pas modifiés rétroactivement.

## Installer la mise à jour

1. Sauvegarder l'application et les bases selon votre procédure habituelle.
2. Sur la base `referentiels_admin`, le DBA exécute `sql/006_drencher_recette_admin.sql`. Additif et idempotent, ce script crée le registre et le journal des nettoyages ; aucun contexte n'y est inscrit automatiquement. Le compte MySQL d'administration existant doit disposer de SELECT/INSERT/UPDATE sur ces deux nouvelles tables ; aucun DELETE n'est requis. Conserver son secret protégé et ses autres droits existants.
3. Arrêter le pool IIS existant de VITASOUSS, copier le contenu de `update/` dans `C:\Apps\VitasoussReferentiels`, puis redémarrer le même pool. Conserver `svc_vitasouss`, le port 8081, `web.config`, tous les appsettings, les secrets et les clés Data Protection. Aucun changement des utilisateurs ou des droits applicatifs existants.
4. Vérifier `/api/health` : socle `version=1.4.1`, module `drencherVersion=1.1`. Tester Produits, Programmes, Stock, Assistant et comparaison.

Le paquet exclut toutes les configurations locales et tous les secrets. Ne pas copier les dossiers de développement ou les données de test. Ne pas utiliser `/MIR` pour la mise à jour.

```powershell
Import-Module WebAdministration
$poolVitasouss = 'NOM_REEL_DU_POOL'
$miseAJourDrencher = 'C:\Temp\VITASOUSS-DRENCHER-V1.1\update'
$dossierVitasouss = 'C:\Apps\VitasoussReferentiels'
Stop-WebAppPool -Name $poolVitasouss
try {
    robocopy $miseAJourDrencher $dossierVitasouss /E /XF appsettings*.json web.config *.protected /XD keys secrets logs assistant-audit
    if ($LASTEXITCODE -ge 8) { throw 'Copie de la mise à jour échouée' }
} finally {
    Start-WebAppPool -Name $poolVitasouss
}
```

## Préparer le mode Recette isolé

Le mode Recette est réservé à **Admin**, y compris la consultation et la saisie de cycles dans ce contexte. Les opérateurs continuent de travailler en Production selon leurs droits ; la recette s'effectue avec l'administrateur accompagnant l'opérateur.

Le générateur fourni produit uniquement des fichiers SQL et un nom neuf. Il ne se connecte à aucun serveur et ne copie aucune donnée réelle :

```powershell
Set-Location 'C:\Temp\VITASOUSS-DRENCHER-V1.1'
.\tools\New-DrencherRecette.ps1 -OutputDirectory 'C:\Temp\DrencherRecetteSQL'
```

1. Faire examiner/exécuter le fichier généré par le DBA sur VM-LOGISTA. Il commence par `CREATE DATABASE vitasouss_recette_drencher_<identité>` **sans IF NOT EXISTS**, donc refuse de réutiliser une base existante. Il crée les structures historiques vides, les dix tables Drencher et les deux tables d'identité/reçus. Il ne touche pas à `logista`.
2. Le compte MySQL métier utilisé par ZAOUIA doit recevoir SELECT sur cette nouvelle base, et les droits nécessaires aux tables Drencher uniquement. Les droits DELETE sont limités aux huit tables nettoyables : produit, programme, versions de programme, lots stock, cycle, révisions de cycle, palettes validées et mouvements. Aucun DELETE sur les structures historiques, `vit_dr_admin_historique`, l'identité ou les reçus.
3. Conserver INSERT/UPDATE et TRIGGER d'inspection sur les tables Drencher selon V1. Ajouter SELECT/UPDATE/TRIGGER sur l'identité, SELECT/INSERT/TRIGGER sur les reçus. TRIGGER sert à vérifier qu'aucun déclencheur inattendu n'est installé.
4. Pour les nettoyages, **PROCESS** est nécessaire au compte MySQL afin de vérifier les clés étrangères globales InnoDB, y compris une dépendance dans une autre base non visible par SELECT. Ce droit est de lecture des métadonnées ; aucun droit DELETE global, ALTER, DROP ou CREATE n'est demandé au compte applicatif. Sans cette inspection, le nettoyage est bloqué. Le DBA doit accorder ce droit explicitement ; l'application ne modifie pas les privilèges.
5. Dans Administration → Serveurs et contextes, ajouter un contexte ZAOUIA pointant sur le nom exact généré, lecture seule désactivée, station locale 7816, libellé « Recette Drencher ». Ne pas modifier le contexte actuel 2026/2027 ou sa base.
6. Sélectionner ce nouveau contexte puis Drencher → Mode Recette · admin. Saisir **ACTIVER RECETTE**. L'API vérifie identité, serveur, nom réel de base et absence de données Drencher existantes avant inscription. Le badge devient **RECETTE**.
7. Charger éventuellement le fichier `*-demo.sql` généré, uniquement dans cette base isolée et après activation. Il contient 164 palettes synthétiques et des référentiels fictifs, sans produit/programme ni traitement réel. Sinon, faire préparer explicitement des données de recette par le DBA. Rien n'est copié automatiquement depuis la production.

La base Recette reste isolée ; elle n'est pas transformée en Production après essais. Pour la production, revenir au contexte `logista` conservé.

## Nettoyages autorisés en Recette

| Action | Résultat |
|---|---|
| Cycle individuel | Suppression du cycle/révisions et de ses mouvements/claims ; restitution de la consommation nette par lot ; autres cycles et entrées magasin conservés |
| Cycles et stock | Suppression des cycles, révisions, traitements de palettes, mouvements et lots stock ; programmes et produits conservés |
| Tout réinitialiser | Périmètre précédent + programmes, leurs versions et produits |

Chaque action exige un aperçu valable 10 minutes, une phrase exacte et un motif. Les données doivent être identiques à l'aperçu. Aucun TRUNCATE, aucune remise à zéro des AUTO_INCREMENT, aucune suppression en cascade autorisée. Une dépendance extérieure bloque l'opération. Les historiques administratifs et reçus restent conservés.

Un nettoyage est journalisé avant les écritures. Si la finalisation du journal échoue après la transaction métier, l'état `Prepare` et le reçu persistent ; consulter l'historique réconcilie l'opération sans rejouer les suppressions. Ne pas répéter une opération annoncée effectuée avec journal à vérifier.

## Retour arrière

Restaurer les fichiers V1 sauvegardés en conservant paramètres et clés. Ne pas supprimer le registre, le journal, les bases de recette ou les données existantes pour revenir au binaire précédent. La production nécessite votre validation et une recette réelle de l'interface sur la station.

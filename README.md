## V1.6.0 Export — candidat finalisé

Tableau de bord Export en lecture seule : seuls les dossiers codmaj=2 alimentent les KPI et graphiques exportés, poids officiel bdq.pdscom (kg), Client destination.vildes. Statuts En cours/Chargé/Inconnu consultables séparément, détails transport et Excel filtré avec récapitulatif. Drencher 1.3.2.1, droits et migrations conservés. Aucun déploiement; revue visuelle réelle restante. Voir docs/V1.6.0-TESTS.md et docs/V1.6.0-MISE-A-JOUR.md.

# VITASOUSS V1.5.0 — Réceptions et Caisserie

Version applicative 1.5.0 ; Drencher 1.3.2.1 conservé. Pour mettre à jour une installation existante, suivre uniquement [le guide V1.5.0](docs/V1.5.0-MISE-A-JOUR.md) et [les limites métier](docs/V1.5.0-LIMITATIONS.md). Aucun SQL ou bootstrap à rejouer. Sources de l'application existante, sans configuration privée ni données de production.

Les sections historiques ci-dessous documentent les versions précédentes.

# Drencher V1.3.1 — F04 V06 validé

Livraison : `VITASOUSS-DRENCHER-V1.3.1-IIS.zip`. Voir [mise à jour depuis V1.3](docs/DRENCHER-V1.3.1-MISE-A-JOUR.md), [rapport final](docs/DRENCHER-V1.3.1-TESTS.md) et [présentation approuvée](docs/F04-V1.3.1-VALIDATION-VISUELLE.md).

Les deux PDF validés sont conservés exactement. 58 contrôles réussis ; les cinq états de stock sont visuellement identiques à V1.3. Mise à jour du backend uniquement, sans migration SQL ni remplacement du frontend, des configurations, des secrets ou des données. Aucun déploiement sur les VM.

# Drencher V1.3 — F04 V06 et documents de stock

Paquet : `VITASOUSS-DRENCHER-V1.3-IIS.zip`. Voir [mise à jour](docs/DRENCHER-V1.3-MISE-A-JOUR.md), [documents et calculs](docs/DRENCHER-V1.3-DOCUMENTS.md), [tests](docs/DRENCHER-V1.3-TESTS.md) et [recette opérateur / qualité](docs/DRENCHER-V1.3-RECETTE-QUALITE.md).

F04 V06, aperçu/impression/PDF et cinq documents de stock, exclusivement en lecture. 445 contrôles automatisés réussis. Aucune migration SQL nouvelle. Aucun déploiement sur les VM. Approval documentaire qualité et impression physique restent à réaliser en station. Sélection, réservations, dosages, qualité, déstockage et nettoyages V1.2 conservés.

# Drencher V1.2 — Stock, réservations et sélection compacte

Paquet : `VITASOUSS-DRENCHER-V1.2-IIS.zip`. Voir [installation et diagnostic avant migration](docs/DRENCHER-V1.2-MISE-A-JOUR.md), [recette opérateur](docs/DRENCHER-V1.2-RECETTE-OPERATEUR.md), [changements](docs/DRENCHER-V1.2-CORRECTIONS.md) et [tests](docs/DRENCHER-V1.2-TESTS.md).

Dates MySQL normalisées sans réécriture des stocks ; réservations dès le brouillon ; aucun arbitrage automatique des cycles existants. Socle VITASOUSS V1.4.1 et protections Recette conservés.

# Drencher V1.1 — ergonomie et mode Recette

Livraison : `VITASOUSS-DRENCHER-V1.1-IIS.zip`. Voir [mise à jour et base isolée](docs/DRENCHER-V1.1-MISE-A-JOUR.md), [fiche opérateur](docs/DRENCHER-V1.1-RECETTE-OPERATEUR.md), [changements](docs/DRENCHER-V1.1-CORRECTIONS.md) et [tests](docs/DRENCHER-V1.1-TESTS.md).

Le mode Recette est inscrit explicitement sur une base neuve et réservé aux administrateurs. Aucun nettoyage sur logista, aucune requalification des produits/programmes existants. Nouveau cycle est inchangé ; palbrut.pdsfru confirmé en kg.

# Extension Drencher V1 (MVP)

Intégrée au socle V1.4.1. Livraison : `VITASOUSS-V1.4.1-DRENCHER-V1-IIS.zip`. Voir [installation](docs/DRENCHER-V1-INSTALLATION.md), [recette opérateur](docs/DRENCHER-V1-RECETTE-OPERATEUR.md), [audit](docs/DRENCHER-V1-AUDIT.md), [résultats](docs/DRENCHER-V1-TESTS.md) et [démonstration locale](docs/DRENCHER-V1-DEMO-LOCALE.md).

MVP à valider avec l’opérateur ; aucune mise en production automatique. Les corrections V1.4.2, Préligne et Cire ne sont pas intégrées.

# VITASOUSS — V1.4.1

Mise à jour de la V1.4 : règles métier et CRUD protégés, synchronisation confirmée ZAOUIA → DIAF, correction de la comparaison et Sidebar validé puis intégré. Le Drencher est inchangé. Paquet : `VITASOUSS-V1.4.1-IIS.zip`, avec `update/`, sans configuration locale ni secret.

[Mise à jour V1.4.1](docs/MISE-A-JOUR-V1.4.1.md) · [Règles métier](docs/REGLES-METIER-V1.4.1.md) · [Rapport de tests](docs/RAPPORT-TESTS-V1.4.1.md) · [Points à valider](docs/POINTS-A-VALIDER-V1.4.1.md).

Version compilée pour la recette. L’accès navigateur local est refusé par une préférence enregistrée : les interactions visuelles et la recette VM restent à valider avant production. Aucun déploiement automatique.

## Historique V1.3

V1.3 poursuit V1.2.1 : filtres combinés cohérents avec les KPI, colonnes configurables persistées (dont GGN), menu hiérarchique repliable, huit référentiels complémentaires et application confirmée des différences ZAOUIA vers DIAF. Authentification, rôles, archives, audit, Data Protection et fonctions V1.2.1 sont conservés.

**Livraison : `VITASOUSS-V1.3-IIS.zip`, avec `app/` et `update/`.** Utiliser uniquement `update/` pour remplacer l'installation existante. [Mise à jour V1.3](docs/MISE-A-JOUR-V1.3.md) · [Vérification](docs/VERIFICATION-V1.3.md) · [Questions et fonctions protégées](docs/QUESTIONS-V1.3.md).

Les six nouveaux référentiels à identité unique validée autorisent des créations explicites et l'édition des libellés, sans changement de relations. grpemb sans clé unique et declaration_verger MyISAM restent en consultation. Les nouvelles suppressions sont protégées. Les cinq explorateurs opérationnels livrent compteurs SQL, détail paginé et évolution par jour ; aucun tonnage ou flux supposé. Drencher est préparatoire, sa source n'a pas été trouvée. Assistant : outils de lecture utilisables, provider abstrait non configuré, aucun secret ni appel externe.

**237 contrôles API réussis**, dont 65 V1.3 et 172 de non-régression. Menu/colonnes/responsive compilés et revus mais validation visuelle non effectuée : accès navigateur local précédemment refusé par une préférence enregistrée. La source V1.2.1 reste dans `versions/V1.2.1/`. Modifications et empreintes : `docs/modified-files-v13.json`.

Aucune migration obligatoire, aucun GRANT ni accès de production. Les index de date proposés dans `MIGRATIONS-PROPOSEES-V1.3.sql` sont commentés, à examiner par le DBA. Les configurations locales, secrets, web.config de production, clés, identité svc_vitasouss et bindings IIS ne sont pas livrés dans update/.

Pour la recette locale, sélectionner l’exercice **TEST PILOTE V1.3 - ZAOUIA (copie locale)** et sa destination DIAF. Le jeu de validation contient les nouvelles tables et une culture DEMO PILOTE V13 absente de DIAF pour essayer la création confirmée. Aucun jeu de données de test ni compte/secret n’est inclus dans le ZIP.

## Historique V1.2.1 conservé
V1.2.1 ajoute la sélection et la suppression multiple des parcelles/vergers, avec résultats partiels détaillés ; la suppression d'un producteur depuis sa fiche ; et des groupes de navigation extensibles. La protection reception_d applique la relation confirmée **refpar + numcul + refver**, dans l'exercice courant, **toutes stations confondues**. Aucune cascade ni propagation de suppression DIAF. Consultation et archives restent protégées côté API.

**Ancien paquet V1.2.1 : `VITASOUSS-V1.2.1-IIS.zip`.** Copier uniquement `update/` pour remplacer V1.2, en conservant configurations, secrets, web.config, clés, identité et IIS. Instructions et droits SQL table par table : [docs/MISE-A-JOUR-V1.2.1.md](docs/MISE-A-JOUR-V1.2.1.md). **172 vérifications API réussies** ; tests visuels/menu/responsive non réalisés car l'accès navigateur local reste refusé. Rapport : [docs/VERIFICATION-V1.2.1.md](docs/VERIFICATION-V1.2.1.md). Sources V1.2 conservées dans `versions/V1.2/` ; modifications/empreintes dans `docs/modified-files-v121.json`.

## Fonctions V1.2 conservées

V1.2 ajoute **le transfert d’un verger vers un autre adhérent**, **la suppression contrôlée des parcelles/vergers** et **les KPI des trois listes principales**. Le transfert conserve refver/parcelles et réutilise la confirmation DIAF sans écraser refsta. Les suppressions sont contrôlées côté serveur, journalisées et bloquées en Consultation/archives ; aucun DELETE synchronisé vers DIAF.

La page **Comparer ZAOUIA / DIAF**, accessible dans le menu et depuis le dashboard, compare les sept référentiels avec une destination autorisée. Elle affiche valeurs différentes, fiches absentes d’un côté, identités ambiguës et compteurs globaux, avec pagination/recherche et export CSV de tous les résultats filtrés. C’est une lecture seule : aucune correction ni synchronisation automatique. `refsta` et champs générés sont exclus des différences métier.

**Ancien paquet V1.2 : `VITASOUSS-V1.2-IIS.zip`.** Pour remplacer V1.1, utiliser son dossier **`update/`**, qui exclut toutes les configurations et `web.config`. Lire [docs/MISE-A-JOUR-V1.2.md](docs/MISE-A-JOUR-V1.2.md). Aucune migration de structure ; les comptes métier nécessitent DELETE sur parcelle/verger et LOCK TABLES sur la base, à attribuer par le DBA. Les clés, l’identité svc_vitasouss, secrets et base admin existants restent conservés.

La V1.1 avant modification est conservée dans `versions/V1.1/`. Détails d’intégrité et limites : [docs/INTEGRITE-V1.2.md](docs/INTEGRITE-V1.2.md). Résultats : [docs/VERIFICATION-V1.2.md](docs/VERIFICATION-V1.2.md). Les nouveaux tests s’exécutent avec `node tools/verify-api-v12.mjs` uniquement sur les copies locales ; ils ont besoin d’un compte de préparation de fixtures (`VITASOUSS_TEST_SETUP_USER`, secret éventuel dans `VITASOUSS_TEST_SETUP_PASSWORD`), distinct du compte applicatif.

Les transferts/suppressions de tests sont restaurés/nettoyés et les volumes préexistants sont préservés. La copie locale a évolué depuis le dump initial : son total de parcelles doit être vérifié directement en SQL et passé à la suite V1 via `VITASOUSS_EXPECTED_PARCELLES`, plutôt que supprimer des données pour retrouver un ancien total.

## Historique et fonctionnement conservé de V1.1

Évolution du projet V1 existant : sidebar réductible, libellés métier, synthèses Adhérent/Verger, navigation vers les parents, listes mobile et sauvegarde avec comparaison DIAF depuis la fiche. Le dashboard et l’identité graphique sont conservés.

**Livraison :** `publish/` et `VITASOUSS-V1.1-IIS.zip`. La V1.0 originale est conservée dans `versions/V1.0/`, avec ses sources et son paquet IIS. Voir [CHANGELOG.md](CHANGELOG.md) pour la liste des changements et des fichiers, et [docs/VERIFICATION-V1.1.md](docs/VERIFICATION-V1.1.md) pour les 51 contrôles API réussis et la validation visuelle restant à effectuer.

Les captures V1.1 ne sont pas fournies : une préférence d’autorisation enregistrée bloque le contrôle du navigateur local. Les images présentes dans `docs/` sont les références V1 fournies, pas des captures du résultat.

Pour reproduire la préparation locale : `tools/build.ps1 -SkipInstall`, puis `tools/pack.ps1`. Les tests V1.1 s’exécutent avec `node tools/verify-api-v11.mjs`, après lancement local et saisie du mot de passe du compte de test dans `VITASOUSS_TEST_PASSWORD`. La suite V1 utilise `node tools/verify-api.mjs`. Les scripts refusent une URL de test hors boucle locale.

Application interne ASP.NET Core **.NET 10 / Minimal API / Dapper / MySqlConnector**, et **React / Vite / TypeScript strict / Mantine**. Les données métier restent dans les bases MySQL historiques. La base séparée `referentiels_admin` stocke seulement la configuration, les utilisateurs/droits et les journaux.

**Aucun serveur de production n’a été contacté ou modifié.** La compilation et les tests ont été effectués avec un MySQL **5.7.44 local**, sur une extraction des données réellement présentes dans le dump fourni. Les paramètres DIAF réels restent à configurer. L’accès navigateur ayant été refusé, aucune capture ou vérification visuelle n’est revendiquée.

## Fichiers utiles

```text
backend/
  Api/AdminEndpoints.cs                 Administration et contrôles
  Application/Models.cs                 Schéma et validation des types
  Application/ReferentialService.cs     Consultation, modification, création et dépendances
  Application/SyncService.cs            Comparaison, application et réconciliation
  Infrastructure/Connections.cs         Connexions dynamiques et secrets protégés
  Program.cs                           API, authentification et sécurité
  schema.json                          Catalogue dérivé des DDL réels
  appsettings.json                     Configuration sans mot de passe
  appsettings.Example.json              Exemple pour Windows Server
  Vitasouss.Api.csproj
frontend/
  src/App.tsx                          Connexion, sidebar et sélection station/exercice
  src/Dashboard.tsx                     Indicateurs issus de la base
  src/EntityList.tsx                    Recherche, pagination, tri et filtres
  src/RecordView.tsx                    Fiches par sections et navigation vers les enfants
  src/Hierarchy.tsx                     Culture → groupe → variété → sous-variété
  src/JournalSync.tsx                   Audit et confirmation DIAF
  src/Administration.tsx               Serveurs, stations, exercices, comptes et droits
  src/api.ts                           Client API typé et gestion des états réseau
  src/components.tsx                   Composants partagés
  src/style.css                        Identité graphique
  public/logos/                        Logos ZAOUIA et DIAF fournis
  package.json / package-lock.json
sql/001_admin.sql                      Installation additive de la base admin
tools/build.ps1                        Compilation et publication IIS
tools/start.ps1                        Lancement local
tools/prepare-local-copy.mjs            Extraction non destructive pour MySQL de test
tools/verify-api.mjs                    Tests d’intégration locaux
docs/DECISIONS.md                       Analyse, choix et limites
docs/historical-schema.json             DDL relevés dans le dump
docs/dependencies.txt                   Occurrences des identifiants historiques
docs/api-verification.json              Résultats des tests d’intégration
publish/                               Application IIS compilée
```

Les dossiers `.dotnet`, `.nuget`, `.local-mysql`, `.test-data`, les dépendances frontend et les données locales sont exclus du suivi du projet. Ils ne font pas partie du livrable IIS. Aucune donnée métier factice n’est intégrée au code ou au frontend. Les logos fournis sont utilisés ; l’emplacement VITASOUSS utilise actuellement le nom et un pictogramme, à remplacer par le logo officiel lorsqu’il sera fourni.

## 1. Prérequis

- SDK .NET 10 pour développer/compiler ; le SDK local installé dans `.dotnet` est utilisable sur ce poste.
- Node.js 22.12+ et npm (poste vérifié : Node 22.17.1).
- MySQL 5.7.44 ou un serveur compatible, accessible depuis l’API.
- Pour IIS : Windows Server, IIS et Hosting Bundle .NET 10 déjà indiqués comme installés sur VM-APPS.

## 2. Initialiser uniquement l’administration

Choisir le serveur qui hébergera `referentiels_admin`, puis exécuter `sql/001_admin.sql` avec un compte d’installation autorisé, par exemple dans HeidiSQL. Le script ne modifie aucune table de `logista` et ne contient aucun DROP/DELETE métier.

Créer un compte d’exécution dédié pour la base admin (SELECT, INSERT, UPDATE, DELETE sur cette base uniquement). Le DELETE admin sert à remplacer les attributions de droits ; les journaux ne sont pas supprimés par l’application. Le compte de chaque base métier nécessite SELECT/INSERT/UPDATE sur les tables métier concernées et SELECT sur les autres tables pour le contrôle de dépendances. Ne pas lui accorder DROP/ALTER. En V1.2, DELETE est limité aux tables parcelle/verger et LOCK TABLES à la base métier pour permettre la suppression contrôlée. Pour une archive, utiliser de préférence un compte SQL SELECT seul, en plus du contrôle `read_only` de l’API.

Copier `backend/appsettings.Example.json` vers `backend/appsettings.Local.json` et renseigner l’hôte, le port, la base admin et l’utilisateur. Le fichier Local est ignoré par Git et **exclu de la publication**. En développement, `KeyDirectory` peut être `keys`, `SecureCookies=false` uniquement sur la boucle locale. Aucun mot de passe dans ce fichier en clair.

Pour les premiers lancements, saisir le secret dans une variable temporaire :

```powershell
$secret = Read-Host 'Mot de passe MySQL administration' -AsSecureString
$env:VITASOUSS_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $secret).Password
```

L’API lit cette variable côté serveur. Pour un stockage durable, utiliser `--protect-admin-secret` :

```powershell
Set-Location C:\logista_zaouia\backend
..\.dotnet\dotnet.exe bin\Debug\net10.0\Vitasouss.Api.dll --protect-admin-secret
```

Copier seulement le résultat protégé dans `Admin:ProtectedPassword`, puis retirer la variable temporaire. **Ce chiffrement doit être effectué sous la même identité Windows et avec le même répertoire de clés que l’application cible.** Les clés Windows sont protégées par DPAPI utilisateur : un chiffrement créé sous le compte développeur ne peut pas simplement être copié vers un pool IIS exécuté sous une autre identité. Ne pas copier les clés de développement dans la publication.

## 3. Créer le premier administrateur

La commande est autorisée seulement si `app_users` est vide. Aucun mot de passe par défaut n’est livré pour une installation réelle.

```powershell
Set-Location C:\logista_zaouia\backend
$env:VITASOUSS_BOOTSTRAP_USER = 'admin'
$bootstrapSecret = Read-Host 'Nouveau mot de passe administrateur (12 caractères minimum)' -AsSecureString
$env:VITASOUSS_BOOTSTRAP_PASSWORD = [System.Net.NetworkCredential]::new('', $bootstrapSecret).Password
..\.dotnet\dotnet.exe bin\Debug\net10.0\Vitasouss.Api.dll --bootstrap-admin
$env:VITASOUSS_BOOTSTRAP_PASSWORD = $null
```

Si le backend n’est pas encore compilé, exécuter `dotnet build backend/Vitasouss.Api.csproj` depuis la racine (ou `.\.dotnet\dotnet.exe build ...` avec le SDK local).

Les utilisateurs locaux utilisent le hachage ASP.NET Identity, pas les tables utilisateurs des anciennes applications. Trois rôles : Admin, Gestionnaire, Consultation. Les deux derniers nécessitent une attribution explicite de contextes. Pour synchroniser, le gestionnaire doit avoir accès en écriture à la source **et** à la destination.

## 4. Lancer la V1.1

Depuis la racine :

```powershell
.\tools\build.ps1
.\tools\start.ps1
```

Ouvrir **http://127.0.0.1:5080**. Le frontend compilé est servi par l’API, donc aucun deuxième serveur n’est nécessaire.

Pour développer avec rechargement React :

```powershell
# Terminal 1, depuis la racine
.\tools\start.ps1
# Terminal 2
Set-Location C:\logista_zaouia\frontend
npm run dev
```

Le frontend Vite est sur http://127.0.0.1:5173 et relaie `/api` vers le backend 5080. Garder l’environnement Development pour le cookie HTTP local. En exploitation utiliser HTTPS et `SecureCookies=true`.

### Copie locale disponible sur ce poste

Un MySQL 5.7.44 isolé a été installé dans `.local-mysql`, lié uniquement à `127.0.0.1:33307`, avec son stockage dans `.test-data/mysql`. Il héberge :

- `vitasouss_test_zaouia_v1` : données extraites du dump, 78 adhérents, 119 vergers, 1 014 parcelles et 53 variétés ;
- `vitasouss_test_diaf_v1` : copie dédiée à la vérification de la synchronisation, avec un refsta distinct pour ce test ;
- une archive de test configurée en lecture seule ;
- une administration locale de validation.

L’API locale est configurée dans le fichier Local ignoré. Cette copie ne prouve ni la provenance ZAOUIA du dump ni la correspondance des vrais identifiants DIAF. La copie DIAF est uniquement un environnement de test, **pas une station DIAF réelle**. Aucun de ces paramètres ne doit être publié sur VM-APPS.

Si les processus locaux ont été arrêtés, lancer le serveur de test avec les chemins locaux :

```powershell
.\.local-mysql\mysql-5.7.44-winx64\bin\mysqld.exe --no-defaults --basedir=C:\logista_zaouia\.local-mysql\mysql-5.7.44-winx64 --datadir=C:\logista_zaouia\.test-data\mysql --bind-address=127.0.0.1 --port=33307 --log_syslog=0 --explicit_defaults_for_timestamp=1 --console
```

Les identifiants de cette seule copie locale sont consignés dans `.test-data/ACCES-LOCAL.md`. Le compte MySQL de test et les fichiers de cette copie ne sont pas distribués dans la publication.

## 5. Configurer ZAOUIA et les exercices

Après connexion admin, ouvrir **Administration** :

1. Serveurs : ajouter le serveur MySQL métier ZAOUIA `192.168.1.254:3306`, le compte dédié et son secret. La sauvegarde protège le secret immédiatement ; l’API ne le renvoie jamais.
2. Stations : ajouter ZAOUIA et cocher Maître. Ajouter DIAF seulement avec ses paramètres réels confirmés ; aucune IP DIAF n’est codée.
3. Exercices : ajouter `logista` avec le libellé réellement confirmé. Les nouveaux contextes sont en lecture seule par défaut ; décocher seulement après validation du contexte courant. Ajouter les archives en conservant Lecture seule.
4. Confirmer le `refsta` local avec l’exploitation. Le dump contient `station.nomsta=DIAF`, `refsta=7702`, tandis que ses 119 vergers portent `refsta=7816` : ne pas normaliser ces valeurs ou déduire la station de son nom de fichier.
5. Utilisateurs & droits : créer les comptes et attribuer leurs exercices.
6. Routes DIAF : associer explicitement le contexte ZAOUIA au contexte DIAF correspondant au même exercice. Tester les schémas depuis Exercices.

Le navigateur transmet uniquement un ID de contexte, jamais une connexion ou un nom de base libre. L’API résout la configuration autorisée et contrôle les droits sur chaque opération.

## 6. Parcours métier et synchronisation

- Dashboard : compteurs réels, demandes DIAF et dernières modifications.
- Adhérents : recherche instantanée temporisée, pagination et tri ; fiche avec ses vergers.
- Verger : informations, localisation, exploitation, certification, état ; parcelles dans un onglet accessible.
- Parcelle : identification, culture, plantation, irrigation, protection, localisation, estimation. Variété et sous-variété dépendantes ; changer la variété réinitialise la sous-variété. Les deux couples primaire/secondaire sont validés côté serveur.
- Variétés : exploration hiérarchique et fiches liées. Un groupe n’a pas de champ culture dans le dump : la hiérarchie est déduite via ses variétés.
- Modification : afficher les valeurs avant/après avant de choisir ZAOUIA uniquement ou Enregistrer + DIAF. Ce deuxième choix prépare une demande durable. Ouvrir Synchronisation, Comparer / reprendre, puis confirmer les différences DIAF. `refsta`, clés et `UpdatedAt` sont exclus du patch vers DIAF.
- DIAF absent/inaccessible : aucune écriture DIAF silencieuse. ZAOUIA reste enregistré ; la demande reste visible et peut être reprise après un nouvel aperçu. Une ligne DIAF absente/ambiguë exige une vérification et une initialisation manuelle, jamais un INSERT automatique.
- Journal : consulter utilisateur, contexte, clé, valeurs, demande et état. Les tentatives incertaines sont vérifiables par l’administrateur. Le bouton de réconciliation confirme uniquement un résultat observé ; il ne réécrit pas les données.
- Archives : badge explicite et blocage serveur des INSERT/UPDATE/DELETE, y compris pour Admin.

Les suppressions V1.2 sont autorisées uniquement pour les parcelles et vergers après les contrôles détaillés dans `docs/INTEGRITE-V1.2.md`. Les autres référentiels restent protégés. Le champ historique de blocage demeure disponible, sans interprétation arbitraire de ses codes. La création de sous-variétés reste bloquée faute de clé unique.

## 7. Compiler et publier IIS

```powershell
Set-Location C:\logista_zaouia
.\tools\build.ps1
# Si les dépendances sont déjà restaurées :
.\tools\build.ps1 -SkipInstall
```

La sortie `publish` contient `Vitasouss.Api.dll`, ses dépendances/runtimeconfig, `schema.json`, les paramètres sans secrets, `wwwroot` et le `web.config` généré par le SDK Web. Le frontend est compilé, aucun Node.js n’est nécessaire sur IIS.

Sur VM-APPS **après autorisation de raccordement et de déploiement** :

1. Copier le contenu de `publish` dans un nouveau dossier d’application, par exemple `C:\Apps\VitasoussReferentiels`.
2. Créer un pool IIS .NET CLR **No Managed Code**, 64 bits, identité dédiée ; activer **Load User Profile** pour DPAPI. Site/binding HTTPS avec certificat intranet valide.
3. Donner Lecture/Exécution au dossier applicatif. Créer `C:\ProgramData\Vitasouss\keys` et accorder Modify seulement à l’identité du pool (ainsi qu’aux administrateurs autorisés). Le répertoire de clés est hors wwwroot et hors livrable.
4. Créer la configuration de production `appsettings.Local.json` **sur le serveur** à partir de l’exemple : Admin réel, KeyDirectory, SecureCookies=true et AllowedHosts correspondant au DNS/IP utilisés.
5. Initialiser `referentiels_admin` avec le script fourni, protéger son secret et créer le premier admin **sous l’identité qui exécutera l’application**, avec le même répertoire de clés. Utiliser une session administrée sous cette identité ou un mécanisme d’exploitation validé. La variable de secret n’est qu’un moyen de bootstrap ; ne pas enregistrer un secret en clair dans web.config.
6. Conserver `ASPNETCORE_ENVIRONMENT=Production`, activer le site et vérifier `/api/health`, la connexion et les contrôles d’accès.
7. Configurer ZAOUIA et ses exercices depuis l’interface, d’abord en lecture seule. Confirmer ensuite l’exercice courant et les droits d’écriture. Configurer DIAF séparément après vérification de la correspondance des exercices/identifiants.

Prévoir une sauvegarde cohérente de la base admin et des clés Data Protection. Un changement d’identité Windows, de machine ou de profil peut empêcher le déchiffrement DPAPI ; prévoir la procédure de réenregistrement des secrets sous la nouvelle identité. Ne pas remplacer des clés sans plan de reprise.

## 8. Tests et résultats

Les tests de `tools/verify-api.mjs` sont volontairement limités à une URL locale et aux bases de copie explicitement nommées. Les mots de passe de test viennent de variables d’environnement. Ils ne peuvent pas être dirigés vers une URL de production.

```powershell
$env:VITASOUSS_TEST_PASSWORD = Read-Host 'Mot de passe applicatif du test local'
$env:VITASOUSS_TEST_MYSQL_PASSWORD = Read-Host 'Mot de passe MySQL du test local'
node tools/verify-api.mjs
```

Rapport détaillé : `docs/api-verification.json`. Les contrôles incluent authentification, schéma, pagination, paramètres SQL, clés protégées, archives, CSRF, cohérence variété/sous-variété, sauvegarde ZAOUIA, conflit concurrent, DIAF inaccessible, reprise explicite, conservation refsta, audit et droits.

Le script de copie `prepare-local-copy.mjs` ne se connecte à aucun serveur. Il extrait uniquement CREATE TABLE et INSERT pour un périmètre contrôlé, sans exécuter le dump brut. Il refuse d’interpréter un point-virgule à l’intérieur d’un texte comme une fin d’instruction. Sa sortie crée des bases nommées `vitasouss_test_*`, jamais `logista`. Importer uniquement dans un MySQL local isolé vide ; ne pas réimporter dans une copie déjà chargée.

## 9. Points restant à valider

Voir `docs/DECISIONS.md` et `docs/INTEGRITE-V1.2.md` pour les choix et limites : provenance du dump, paramètres/refsta des stations, correspondance des exercices, codes de blocage et identités historiques. La validation visuelle et responsive reste à effectuer ; les API sont testées sur copies locales. Le contrôle de dépendances est conservateur et peut bloquer une suppression pour demander une validation du schéma.








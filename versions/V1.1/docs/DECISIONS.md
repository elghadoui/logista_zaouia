# Décisions V1 et analyse du dump

Le dump fourni a été lu, jamais exécuté sur un serveur existant. Il contient `DROP DATABASE logista`, `DROP TABLE` et `DELETE` : ne pas l’exécuter en production pour installer cette application.

## Structures confirmées

| Table | Identité conservée | Particularités |
|---|---|---|
| adherent | refadh SMALLINT signé | InnoDB, nomadh VARCHAR(100) |
| verger | refver INT | refadh/refsta SMALLINT ; supver DECIMAL(8,2) ; UpdatedAt généré |
| parcelle | idparcelle + refpar + numcul + refver | Clé primaire composée réelle ; idparcelle AUTO_INCREMENT ; refpar CHAR(10) |
| culture | codcul INT | nomcul CHAR(30) |
| grpvar | codgrv SMALLINT | Aucun codcul : un groupe peut apparaître sous plusieurs cultures via variete |
| variete | codvar INT | codcul/codgrv SMALLINT ; attention aux limites des références SMALLINT dans les autres tables |
| souvar | recherche par codsvar + codvar | MyISAM, aucune clé primaire/unique, deux colonnes nullable ; nomsvar CHAR(15) |

Les DDL exacts et types figurent dans `historical-schema.json` et `backend/schema.json`. Les occurrences des clés dans les autres tables sont recensées dans `dependencies.txt`. Ce recensement indique des relations candidates ; le nom d’une colonne seul ne prouve pas une relation métier.

Le dump ne définit pas de clés étrangères pour ces sept référentiels. Il existe des cascades sur d’autres tables sans rapport direct avec eux ; aucune cascade n’a été ajoutée.

**Anomalie à confirmer :** `station` contient `refsta=7702`, `nomsta=DIAF`, alors que le fichier est nommé `logista_zaouia_051026.sql`. Les 119 vergers portent tous `refsta=7816`, absent de cette table station. Le nom du fichier et cette table ne suffisent donc pas à établir seuls l’identité locale correcte. Aucun refsta existant n’a été normalisé ; le paramétrage et le sens de cette incohérence doivent être confirmés avant raccordement réel.

## Règles retenues

- Aucune modification de structure historique, aucun DELETE métier. Le compte MySQL métier peut n’avoir que SELECT/INSERT/UPDATE ; comptes SELECT seuls recommandés pour archives.
- Toutes les clés sont immuables après création. La parcelle utilise sa clé composée complète sur les API et la synchronisation, sans supposer qu’idparcelle soit une contrainte unique isolée.
- Les créations exigent les identifiants explicites (hors idparcelle généré). Aucun MAX(id)+1 et aucun mapping entre stations.
- Pour souvar, la consultation/édition exige une paire codsvar/codvar non ambiguë. La création reste désactivée faute de contrainte unique historique. Valider une stratégie d’allocation avec le DBA avant de l’activer. Les anciennes applications doivent également respecter l’unicité logique ; l’API refuse les ambiguïtés constatées.
- `numcul` reste le numéro de culture historique de la parcelle ; il n’est pas interprété comme une FK culture.codcul. Le rattachement culture/groupe est celui de la variété.
- Les champs sont typés/limités d’après le dump. Les liens sont validés côté serveur. Les deux couples variété/sous-variété sont validés. Les dates zéro historiques sont exposées comme null et ne sont pas proposées comme dates métier valides.
- `lier`, distances, `refremp` et sens exact des codes `blocker` n’étant pas documentés métier, ils ne sont pas réinterprétés. Les champs techniques non exposés sont préservés lors d’une modification. Le formulaire indique les codes de blocage historiques sans inventer leur signification.
- `.NET 10 Minimal API → Application → Infrastructure`, sans EF. Dapper, MySqlDataSource partagé et pooling ; noms de tables/champs issus du catalogue, bases issues de l’allowlist admin.
- Authentification cookie HttpOnly/SameSite Strict, expiration 8h, rôles et autorisations par contexte vérifiés à chaque requête. CSRF sur mutations, contrôle d’origine, limite de tentatives de connexion. Révocation des sessions lors d’un changement de droits.
- Secrets des serveurs métier protégés par ASP.NET Data Protection. Clés persistées et protégées par DPAPI sur Windows, sous l’identité du processus. Mot de passe admin par secret protégé ou variable d’environnement temporaire ; aucun secret retourné au frontend.
- Pas de transaction distribuée entre admin/ZAOUIA/DIAF. Intention durable `Prepared` puis contrôle optimiste atomique des anciennes valeurs SQL. Le journal conserve les tentatives incertaines et l’administrateur peut réconcilier après vérification des données.
- Synchronisation seulement ZAOUIA maître → DIAF, sur routes explicitement configurées et autorisées pour l’utilisateur. Seulement le patch demandé, jamais `refsta`, clés ou colonnes générées. Pas d’INSERT DIAF implicite en cas d’identifiant manquant.
- L’action « Enregistrer + DIAF » enregistre ZAOUIA et prépare une demande durable. L’application DIAF se fait après un aperçu et confirmation dans l’écran Synchronisation. Aucun traitement automatique silencieux.
- Une coupure DIAF n’annule pas ZAOUIA. Une ancienne demande dont les champs ont évolué dans ZAOUIA est refusée. Les anciennes valeurs DIAF sont contrôlées au moment de l’UPDATE.
- Une tentative DIAF interrompue en `Applying` se vérifie via la réconciliation admin, après un délai de 60 secondes. Aucun retry aveugle.

## Limites et validations nécessaires avant production

1. Confirmer la provenance du dump, les `refsta` locaux et les paramètres DIAF.
2. Confirmer les libellés des exercices et leurs correspondances ; activer l’écriture uniquement sur les contextes courants validés.
3. Confirmer le sens de `blocker`, `lier`, distances, estimation (unité), traitement et certification. Le formulaire conserve les données telles qu’elles existent.
4. Valider les doublons/NULL de souvar et les références orphelines. L’absence de FK historique ne garantit pas leur intégrité.
5. Valider la grille visuelle sur les écrans et la tablette : accès navigateur refusé pendant cette réalisation ; aucune capture ni vérification visuelle automatisée revendiquée.
6. Définir sauvegardes, rétention des journaux, politique des comptes/mots de passe et certificats TLS des MySQL historiques.
7. Le contrôle de dépendances par colonnes est conservateur et non exhaustif ; les suppressions restent donc bloquées. Il doit être enrichi métier avant toute autorisation future.
8. Le journal et la file affichent les 200 dernières opérations ; la navigation hiérarchique affiche jusqu’à 100 références par colonne et indique la limite. Les listes paginées/recherchables permettent l’accès complet.
9. L’indicateur DIAF compare l’enregistrement ouvert. Ce contrôle identifie les différences/identifiants absents ou ambigus ; la V1 n’exécute pas de réconciliation massive entre bases.
10. L’authentification locale est fonctionnelle. SSO/AD, MFA, réinitialisation des mots de passe, édition complète des stations/routes et archivage des journaux ne font pas partie de cette V1.

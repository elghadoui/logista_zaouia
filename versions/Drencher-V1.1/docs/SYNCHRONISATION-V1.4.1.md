# Synchronisation ZAOUIA → DIAF V1.4.1

ZAOUIA reste maître. DIAF reçoit les mêmes identifiants métier après une confirmation distincte. Les champs refsta/refstat restent locaux et sont exclus des patchs. Les suppressions, fusions et réattributions automatiques de codes sont interdites.

Les neuf référentiels complémentaires sont lisibles dans la comparaison. La synchronisation des déclarations demeure protégée : id est une identité technique auto-incrémentée, pas une identité métier interstations validée. Le CRUD local des déclarations est désormais permis selon le lien réception confirmé. Les autres référentiels historiques gardent leurs restrictions V1.4, notamment les créations dépendantes qui exigent une initialisation contrôlée.

## Depuis un formulaire

Après un enregistrement ZAOUIA confirmé, un utilisateur autorisé à Synchronisation/Modifier reçoit « Synchroniser également vers DIAF ? ». Il choisit un exercice DIAF autorisé, demande un aperçu, puis confirme ou ferme l’aperçu. Fermer n’applique aucun changement ; une demande déjà préparée peut rester dans la file pour une reprise humaine. Aucun traitement automatique de cette file n’a été ajouté.

Le backend relit les deux fiches, vérifie les instantanés et prépare la demande. Les mises à jour DIAF passent les mêmes règles d’usage que les CRUD locaux. Une référence autorisée à changer dans ZAOUIA peut donc être refusée dans DIAF si ses usages sont différents.

La comparaison manuelle, les filtres et les exports CSV restent disponibles. Les conflits affichent les codes DIAF concernés. Les libellés vides ne sont pas assimilés à un conflit de noms ; les identifiants nuls sont signalés comme ambigus.

## Ordre des parents

- Marché avant pays ; pays avant destination/partenaire.
- Groupe d’emballages avant groupe article.
- Culture avant défaut lorsque la culture n’existe pas dans DIAF.

Une préparation sans parent est refusée avec un message explicite. Synchroniser d’abord le parent, puis préparer à nouveau l’enfant. Le traitement ne crée pas ou ne renumérote pas un parent à votre place.

## Incidents et reprise

- DIAF indisponible avant toute écriture : statut Error, erreur enregistrée, source conservée ; demander un nouvel aperçu puis confirmer après rétablissement.
- Fiche changée, dépendance nouvelle ou conflit : refus, aucune application ; refaire la comparaison et l’aperçu.
- Résultat incertain après début de mutation : statut Applying, réconciliation administrateur obligatoire avant reprise. Ne pas relancer une seconde écriture.
- Journal source Prepared : vérifier/réconcilier ZAOUIA avant toute synchronisation.

Les journaux existants et les sessions restent en place. Les permissions du référentiel, des parents consultés, de Synchronisation et des deux exercices sont revérifiées ; Consultation ne peut préparer ni appliquer.

## Droits SQL à examiner avec le DBA

Conserver les comptes et secrets existants. La mise à jour n’accorde aucun privilège automatiquement. Sur les exercices actifs ZAOUIA, les opérations souhaitées nécessitent SELECT, INSERT, UPDATE et DELETE ciblés sur les neuf référentiels concernés, inspection des déclencheurs et LOCK TABLES. Sur DIAF, SELECT/INSERT/UPDATE ciblés suffisent à la synchronisation ; aucune permission DELETE DIAF n’est nécessaire. Les dépendances et parents doivent pouvoir être lus. Les archives gardent uniquement leurs droits de lecture.

Une visibilité SELECT couvrant le schéma métier est nécessaire pour certifier l’inspection complète des dépendances : des droits limités à quelques tables peuvent masquer une contrainte entrante avec cascade. L’application refuse alors les écritures. Cela ne donne aucun accès SQL libre au modèle ; les permissions et outils backend restent applicables. Les droits de mutation restent ciblés par table.

Les privilèges doivent être accordés pour les noms de bases et comptes réellement configurés, après inspection des droits existants. Ne pas accorder DROP, ALTER ou DELETE global au compte applicatif. La migration de permissions concerne uniquement referentiels_admin.

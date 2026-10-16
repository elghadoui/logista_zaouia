# Rapport des corrections V1.4.1

## Chantier A

Le service ComplementaryRules centralise les usages et protections communs aux CRUD et à la synchronisation. Les contrôles portent sur la fiche d’origine, les dépendances présentes, les références parentes, les permissions et les instantanés. Les suppressions utilisées sont refusées avant toute mutation, y compris lorsqu’une contrainte SQL prévoit une cascade.

Les coordonnées de partenaire, les adresses de destination, le marché d’un pays inutilisé par destination, les familles/cultures de défaut et les références de déclarations inutilisées sont désormais corrigibles selon les règles validées. Les groupes utilisés, articles utilisés, défauts utilisés et types d’écart utilisés sont protégés. La déclaration est contrôlée sur les quatre valeurs simultanées d’origine ; le blocage global V1.4 est retiré. Les créations gardent les identifiants explicites ou une attribution contrôlée dans ZAOUIA.

Marchés est ajouté au catalogue, aux permissions, aux formulaires et à la comparaison/synchronisation. Les relations pays→marché, défaut→culture, dossier→partenaires et réception→verger réel affichent leurs libellés. Rep et pays texte restent des textes libres. La famille de défaut reçoit des suggestions mais n’est pas transformée en clé étrangère.

Les formulaires proposent une synchronisation distincte après enregistrement. Les demandes sont préparées sans écriture DIAF, avec aperçu et confirmation. Les protections sont revérifiées dans DIAF. L’échec de connexion avant mutation laisse une erreur reprenable ; l’incertitude après début de mutation conserve la réconciliation administrateur. L’ordre des parents n’est pas contourné.

## Page blanche de comparaison

Cause : l’ajout des référentiels complémentaires alimentait Select avec des libellés undefined, car le dictionnaire frontend ne contenait que les sept référentiels historiques. L’erreur est reproduite avec la fonction réelle de Mantine 8.3.1. Le dictionnaire est complété et partagé ; un nom futur possède aussi un libellé utilisable.

Une sélection initiale autorisée remplace l’hypothèse « verger toujours accessible ». Le catalogue vide est expliqué. Un rapport incomplet est refusé avec un message de service ; les valeurs SQL NULL légitimes restent acceptées. Les libellés vides n’engendrent plus de faux conflits, les clés nulles deviennent des identités ambiguës. Un ErrorBoundary isole la page et garde l’enveloppe de navigation disponible. Comparaison, filtres et exports existants sont conservés.

## Chantier B

L’arborescence et les maquettes développé/compact/mobile ont été validées par l’utilisateur avant implémentation. Le travail a été compilé dans .test-data/sidebar-v141 avant intégration. La navigation est extraite de Workspace dans navigation.ts et Sidebar.tsx, avec styles séparés.

Les neuf rubriques reprennent les routes existantes. Le menu possède un défilement indépendant, groupes animés, ouverture imposée du groupe actif, préférences distinctes, boutons accessibles, icônes/infobulles en mode compact, sous-menu compact, tiroir mobile avec fermeture Escape/focus Mantine et choix clair/sombre. Les opérations restent signalées en lecture seule. Les rubriques vides disparaissent après filtrage des droits. Aucun lien vers un module fictif n’est créé.

DrencherPanel et le fichier PilotViews.tsx sont identiques à la V1.4 ; aucune intégration externe ni modification du Drencher. La présentation existante reste accessible à la même permission, et la future intégration est uniquement indiquée.

## Préservations et limites

Authentification, révocation des sessions, protections CSRF, archives, clés/purposes Data Protection, secrets MySQL/OpenAI, provider IA et outils de lecture sont conservés. Le paquet exclut configurations et secrets. Aucune migration métier et aucun déploiement sur les VM.

Les preuves automatisées sont listées dans RAPPORT-TESTS-V1.4.1.md. Le rendu réel dans un navigateur et la recette sur VM-APPS restent identifiés séparément dans POINTS-A-VALIDER-V1.4.1.md ; les maquettes ne sont pas présentées comme des captures de l’application finale.

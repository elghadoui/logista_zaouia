# Vérification VITASOUSS V1.4

**359 contrôles automatisés réussis** sur copies locales : V1.4 62, V1.3 65, provider/outils Assistant 46, Assistant HTTP 14, socle V1 27, V1.1 24, V1.2 46, V1.2.1 50, comparaison 25. Rapports JSON joints au paquet. Aucun accès ou changement de données de production ; aucun appel OpenAI réel ni clé réelle utilisés.

Backend .NET 10 Release compilé sans avertissement/erreur ; frontend TypeScript strict/Mantine/Vite compilé. La publication expose /api/health version 1.4 et les nouvelles ressources d’interface. Les empreintes schema.json, pilot-schema.json, appsettings.json, provider OpenAI et OpenAiSecretStore sont identiques à la V1.3-AI. L’application Data Protection et les purposes des secrets restent identiques.

## Fonctions terminées

- Matrice Voir/Ajouter/Modifier/Supprimer par utilisateur/module, rôle Consultation toujours en lecture, Admin complet, révocation des sessions après modification. API directe refusée, menus/boutons adaptés, journaux/files filtrés sur les modules visibles.
- Menu hiérarchisé, rubriques/sous-groupes repliables et mémorisés, indentation et état actif ; administration Utilisateurs/Droits/Serveurs-contextes séparée.
- Référentiels complémentaires : création maître, libellés modifiables, clés numériques attribuées côté serveur, champs structurels existants protégés. Champs de relations présentés par libellé et sélections recherchables. Les clés restent dans les API/snapshots.
- grpemb : clé métier applicative vérifiée, nombre et fiche des articles, création/libellé, suppression contrôlée uniquement lorsque les dépendances/ambiguïtés ne la protègent pas. groupart : référence PEG/PHG conservée, groupe par nom et sélection, relation existante immuable.
- Déclarations : création avec producteur/verger réel, déclaré sous, variété et station valides ; mêmes vergers autorisés ; quadruplet déjà présent refusé. Aucune normalisation de station ou PK/FK ajoutée.
- Réplication des sept référentiels complémentaires validables avec **même code ZAOUIA**, parents d’abord, aperçu/confirmation, journal et résultat individuel ; groupes sans PK SQL formelle acceptés après contrôles applicatifs. Aucun DELETE DIAF.
- Conflits de libellé/autre code signalés, codes DIAF à examiner affichés et application bloquée ; création de doublon de libellé maître protégée. Les libellés sans preuve d’identité ne sont jamais fusionnés automatiquement.
- Relations historiques détectées comme utilisées protégées dans les modifications ordinaires/synchronisations. Le transfert métier contrôlé préexistant reste conservé et testé.
- Assistant IA OpenAI conservé : provider, secret, limites, audit, contexte et lecture seule ; outils soumis également aux nouvelles permissions.

## Opérations protégées / non terminées

Modifier/supprimer une déclaration et la répliquer vers DIAF restent bloqués, faute de prédicat d’usage réception et d’identité interstations prouvés. Suppression des partenaires, destinations, pays, articles, défauts et types d’écart reste bloquée, faute de cartographie exhaustive. Les changements structurels complémentaires restent protégés. Les créations dépendantes DIAF déjà protégées en V1.3 (vergers/parcelles/variétés, etc.) ne sont pas élargies arbitrairement. Sous-variété sans clé unique : création toujours protégée.

Déclencheurs présents/inspection indisponible, schéma différent, doublons/nulls de clés : seule la nouvelle écriture concernée est protégée. Aucun problème historique n’a été corrigé automatiquement en production. Lire QUESTIONS-V1.4.md et CARTOGRAPHIE-METIER.md.

## Recette utilisateur sur un environnement autorisé de validation

1. Installer selon MISE-A-JOUR-V1.4.md, avec migration admin explicite, copie de update/ et conservation de tous les secrets/configurations. Vérifier santé 1.4 et connexion.
2. Avec Admin, consulter les mêmes exercices et archives qu’avant. Vérifier le menu et les libellés ; replier des rubriques, actualiser et confirmer la mémorisation.
3. Administration → Droits par module : retirer Voir Partenaires à un utilisateur Gestionnaire et Supprimer Groupes emballages ; enregistrer/reconnecter. Menu et actions doivent être adaptés. Une requête directe vers le module interdit doit renvoyer 403 ; l’ancien cookie doit être révoqué.
4. En ZAOUIA de validation, créer une famille puis un article avec référence métier et sélection de famille. Vérifier le nom affiché et le nombre d’articles. Suppression de la famille utilisée refusée ; correction du libellé autorisée ; famille inutilisée supprimable après contrôle/confirmation.
5. Créer une déclaration sur les références existantes, éventuellement réel=déclaré. Vérifier les noms et stations. Toute modification/suppression doit rester protégée avec raison affichée.
6. Créer un pays puis une destination dans ZAOUIA. Comparer DIAF : absence détectée ; créer après aperçu/confirmation et constater le même code. Pays/famille parents doivent exister d’abord à DIAF. Modifier un libellé, comparer et confirmer sa correction.
7. Dans une copie de test, prévoir le même libellé sous un autre code DIAF : conflit et codes affichés, aucune application automatique. Vérifier qu’une ligne propre à DIAF n’est jamais supprimée.
8. Vérifier transfert contrôlé, suppression protégée par réception, tableaux de bord et archives. Confirmer que les refsta/refstat locaux restent conservés.
9. Assistant : utiliser la configuration OpenAI déjà active ; poser une question sur un adhérent/une période dans un contexte de validation autorisé. Vérifier ses droits, ses réponses et l’absence de mutation. Si indisponible, les autres modules doivent fonctionner.

## Reproduire les tests du poste de développement

Les scripts tools/verify-api*.mjs et verify-comparison-v12.mjs sont adaptés aux copies locales existantes ; ne pas les lancer sur VM-APPS/production. Ils nécessitent le mot de passe du compte applicatif de test dans VITASOUSS_TEST_PASSWORD, et les fixtures MySQL 127.0.0.1:33307. Les suites avec mutations utilisent des nouvelles copies ou des données isolées puis restaurent/désactivent leurs fixtures. Le provider est simulé dans tests/AssistantTests, sans clé réelle.

La migration est testée idempotente et conserve une permission personnalisée. Les tests d’anciens modules utilisent maintenant 403 pour un nom de module/SQL interdit, rejeté en amont par la couche permissions. La fixture de comparaison insère ses données DIAF par le préparateur SQL local, car la création directe DIAF par API est volontairement interdite en V1.4.

La recette visuelle dans le navigateur et l’installation réelle sous svc_vitasouss sur VM-APPS restent à effectuer. La compilation, les tests backend/HTTP et les contrats simulés ne remplacent pas ces vérifications. Aucun screenshot visuel n’est prétendu validé.

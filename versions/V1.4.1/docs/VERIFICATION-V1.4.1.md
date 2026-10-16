# Recette V1.4.1

Utiliser des exercices de test isolés, sans écrire dans logista de production ni dans les archives. Les scripts locaux de preuve utilisent uniquement 127.0.0.1:33307 et l’API locale ; ne pas les pointer sur les VM de production. Les nouveaux scénarios métier utilisent des données synthétiques créées sur un schéma extrait du dump, sans importer ses enregistrements.

## Contrôles de mise à jour

Santé API = 1.4.1 ; connexion/session existante ; fichiers Local/web.config identiques ; même compte/profil svc_vitasouss ; mêmes chemins de clés/secrets ; Assistant existant accessible sans reconfiguration. Marchés fermé par défaut pour les comptes existants non Admin, puis droits attribués explicitement et utilisateur reconnecté.

## CRUD sur données de recette

Pour chaque référentiel, créer une référence libre, modifier ses champs autorisés, vérifier son identifiant, supprimer après précontrôle. Refaire avec une référence utilisée : vérifier les messages spécifiques et les champs protégés. Tester aussi un appel API direct, un droit manquant, Consultation, un exercice non attribué, l’archive, un snapshot périmé et une relation absente.

- Destination utilisée dans dossier : adresses et désignation corrigeables ; pays et suppression bloqués.
- Partenaire utilisé par les quatre champs dossier ou palette.codexp : type bloqué ; coordonnées/pays/rep corrigeables. Ref et rep restent distincts.
- Pays seulement utilisé par partenaire : modifiable. Pays utilisé par destination : aucune modification.
- Grpemb/groupart : usages groupart/tpalette bloquent toute correction ; identifiants doublons/nuls refusés.
- Défaut : familles suggérées/modifiables, culture nommée, techniques lier/catdef=1 ; agréage bloque tout.
- Type écart utilisé : modification et suppression bloquées.
- Déclaration : exactement quatre valeurs simultanées ; une seule valeur différente n’établit pas cet usage. Contrôler l’origine avant modification, doublons création/modification, même verger réel/déclaré, station existante, suppression libre.

## Synchronisation

Vérifier DIAF inchangé avant confirmation. Depuis les formulaires, demander l’aperçu puis annuler ou confirmer. Tester marché→pays→destination et grpemb→groupart, parent absent, conflit de code/libellé, cible devenue utilisée, fiche modifiée après aperçu, refus de suppression synchronisée et conservation refsta/refstat. Simuler la panne de DIAF seulement sur la recette ; constater le maintien de ZAOUIA et la reprise contrôlée.

## Comparaison

Ouvrir la page pour les sept historiques et les neuf complémentaires. Rechercher, filtrer les états, paginer et exporter CSV. Tester libellé NULL/vide, clé NULL, doublon, colonnes absentes et utilisateur sans permission Vergers. Aucun crash global ; un rapport incomplet doit produire un message. Vérifier que l’export neutralise les formules de tableur.

## Sidebar — vérification visuelle à effectuer

Sur ordinateur (1440 px), intermédiaire (768 px) et téléphone (390 px), vérifier tous les groupes et liens, la page active, le défilement, développé/compact, infobulles, sous-menu compact et fermeture du tiroir. Au clavier : Tab, Entrée/Espace, Escape, retour du focus. Vérifier clair/sombre, préférence entre navigations, stockage désactivé et mouvement réduit. Refaire avec Admin, Gestionnaire et Consultation restreinte. Aucun groupe vide, lien interdit ou faux module. L’écran Drencher existant reste inchangé.

Cette vérification visuelle est distincte des tests React serveur automatisés ; elle ne doit pas être considérée passée sans observation du navigateur. Voir les limitations du rapport.

## Preuves locales

Les fichiers JSON livrés contiennent les résultats par scénario, leurs dates et les noms des bases de recette. AssistantTests utilise un transport OpenAI fictif et des outils locaux, sans appel réel à OpenAI. La vérification du paquet contrôle les exclusions et simule une copie avec des marqueurs de configuration/secrets factices.

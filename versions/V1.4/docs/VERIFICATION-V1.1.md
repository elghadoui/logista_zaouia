# Vérification V1.1 — 6 octobre 2026

## Résultats établis

- Backend .NET 10 : compilation Release, zéro erreur et zéro avertissement.
- Frontend : TypeScript strict et compilation Vite de production.
- Suite V1 inchangée : **27/27** contrôles réussis, rapport `api-verification.json`.
- Suite V1.1 : **24/24** contrôles réussis, rapport `api-verification-v11.json`.

Les tests utilisent uniquement `127.0.0.1:5080` et le MySQL local 5.7.44 sur `127.0.0.1:33307`. Ils vérifient les copies ZAOUIA/DIAF et l’archive ; aucun serveur réel n’a été contacté.

Les contrôles V1 couvrent les droits, CSRF, archive, clés historiques, audit, modifications ZAOUIA, file DIAF sans écriture silencieuse, conflit, panne DIAF puis reprise, conservation de `refsta`, écriture parcelle avec clé composée, dates zéro et précision SQL. Les valeurs métier modifiées par cette suite sont restaurées.

Les contrôles V1.1 confrontent les nouvelles lectures aux relations et lignes brutes : cardinalité des sept listes, noms de cultures/variétés/sous-variétés, propriétaire du verger, liens parents d’une parcelle, compteurs et surfaces réels, sommes indépendantes de la pagination, recherche limitée, nom sélectionné hors première page, cascades 104/105, lecture des synthèses en archive et rejet d’un nom SQL non autorisé.

Les deux suites ont aussi été relancées avec succès sur la publication finale. `/api/health` répond avec la version `1.1` ; l’index et ses deux assets compilés sont servis en HTTP 200. Le paquet contient le backend, le frontend et `web.config` ; leurs contenus concordent avec `publish/` et `frontend/dist/`. Aucun fichier Local, clé de développement ou accès de test n’est présent dans le paquet. L’empreinte du paquet V1.0 conservé correspond à celle de l’original.

## Vérification visuelle restant à effectuer

Le navigateur a refusé l’inspection de l’application locale avec le motif : « A saved user permission setting blocks this action ». Cette préférence bloque `http://127.0.0.1:5080` ; aucun autre navigateur ou mécanisme de capture n’a été utilisé pour contourner ce refus.

Les captures après amélioration et les interactions desktop/tablette/téléphone ne sont donc **pas vérifiées**. Les images `ChatGPT Image Oct 5…` fournies par l’utilisateur sont des références V1, pas des captures V1.1.

Après la réactivation annoncée par l’utilisateur, une nouvelle navigation vers l’adresse HTTP locale a encore été refusée pour cette même préférence. Une demande de levée du refus reste en attente. Le paquet peut être examiné sans attendre ; aucune capture fictive n’a été ajoutée.

La V1.1 est compilée et testée côté API, prête pour une validation visuelle locale dès que cet accès est autorisé. Ne pas considérer les contrôles API comme une preuve des interactions navigateur.

## Parcours de validation visuelle

1. Ouvrir `http://127.0.0.1:5080`, se connecter avec le compte local documenté dans `.test-data/ACCES-LOCAL.md`.
2. Desktop : réduire/développer la sidebar, vérifier tooltips et agrandissement du contenu, naviguer puis recharger pour vérifier la préférence.
3. Ouvrir un adhérent, ses vergers, puis le verger 7602 et ses parcelles. Vérifier noms, références secondaires, surfaces et liens de retour.
4. Ajouter une parcelle depuis le verger : parent nommé, id interne masqué, sous-variété filtrée après changement des deux variétés.
5. Modifier un champ : récapitulatif et case DIAF décochée. Enregistrer ZAOUIA seul, puis faire une modification avec DIAF, comparer et confirmer.
6. Vérifier le message de source enregistrée si DIAF devient indisponible ; reprendre depuis Synchronisation. Ce comportement API est déjà testé avec une panne simulée.
7. Archive : vérifier badge, absence d’Ajouter/Enregistrer et consultation des synthèses.
8. Tablette puis téléphone : menu mobile, formulaires en une/deux colonnes et cartes de consultation ; vérifier absence de débordement du header.
9. Capturer dashboard, sidebar réduite, fiche adhérent, fiche verger/onglet parcelles, création parcelle, comparaison DIAF et archive.

## Limites historiques conservées

La création de sous-variétés reste suspendue en l’absence de clé unique ; aucune contrainte historique n’a été ajoutée. Un nom de sous-variété ambigu n’est pas choisi arbitrairement dans les listes enrichies. La modification administrative de `refsta` n’est pas ajoutée au formulaire standard.

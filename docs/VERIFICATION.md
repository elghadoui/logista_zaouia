# Vérification de livraison

## Environnement isolé

- SDK .NET 10.0.401.
- Node.js 22.17.1 ; TypeScript en mode strict.
- MySQL 5.7.44 Windows local, bind 127.0.0.1:33307.
- Données réelles extraites du dump fourni : 78 adhérents, 119 vergers, 1 014 parcelles, 53 variétés.
- Copie DIAF dédiée au test uniquement ; ses vergers ont un refsta distinct pour prouver sa conservation.
- Aucun appel au serveur de production. Aucun changement de DDL métier.

## Résultats API

**27 vérifications d’intégration réussies**, consignées dans `api-verification.json` :

- Authentification réelle avec cookie de session.
- Configuration sans secret MySQL dans les réponses.
- Clé parcelle composée conforme au dump.
- Compteurs et pagination sur les données importées.
- Tri SQL non autorisé refusé.
- Fiche verger avec ses champs historiques.
- Archives interdites à l’écriture côté serveur.
- CSRF exigé sur les mutations.
- Identifiants immuables et suppression physique refusée.
- Sous-variétés filtrées par variété et incohérence refusée côté serveur.
- ZAOUIA enregistré avec intention DIAF journalisée.
- DIAF inchangé tant que l’utilisateur n’a pas confirmé l’aperçu.
- Ancienne fiche en conflit refusée.
- Destination indisponible : ZAOUIA conservé et synchronisation en attente.
- Reprise après comparaison avec exclusion de refsta, y compris lorsque refsta a été modifié dans la source.
- Mise à jour DIAF avec maintien de son refsta différent.
- Valeurs métier du verger restaurées après test.
- Modification puis restauration d’une estimation de parcelle via sa clé composée complète.
- Reconnaissance des dates zéro historiques dans les contrôles optimistes SQL, sans les remplacer si elles ne sont pas modifiées.
- Superficie hors précision SQL et clé parcelle partielle refusées.
- Audit avant/après et utilisateur, avec horodatages sérialisés correctement pour le frontend.
- Consultation interdite à l’écriture ; Gestionnaire sans attribution interdit au contexte.

Les changements de test sont visibles dans l’audit local ; les champs métier modifiés ont été restaurés. Les UpdatedAt restent naturellement actualisés par MySQL. Les deux comptes verification_* ont été désactivés après les vérifications.

## Compilations et portée

Le backend compile sans erreur ni avertissement. Le frontend passe TypeScript strict et Vite. Le build IIS est fourni séparément dans `publish`.

L’autorisation d’accès du navigateur au site local a été refusée. Aucun contournement n’a été effectué : **pas de test visuel ou de capture des écrans revendiqué**. Le rendu sur bureau/tablette, le parcours complet dans les formulaires et les créations métier restent à valider à l’utilisation. Les tests ont couvert les modifications/synchronisations et les garde-fous décrits ci-dessus, pas toutes les branches de création ou de réconciliation après crash.

La correspondance des véritables bases ZAOUIA/DIAF et la configuration réelle IIS n’ont pas été testées. Lire `DECISIONS.md` avant raccordement.


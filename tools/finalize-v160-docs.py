from pathlib import Path
p=Path('tools/verify-v160-excel.py');s=p.read_text(encoding='utf-8-sig').replace('all(r[16] is None for r in rows)',"all(r[16] in (None,'') for r in rows)");p.write_text(s,encoding='utf-8')
p=Path('docs/V1.6.0-INDICATEURS-EXPORT.md');p.write_text('''# Indicateurs Export — V1.6.0 candidate finalisée

Règles confirmées par le métier : `codmaj=0` En cours, `1` Chargé, `2` Expédié et clôturé. Toute autre valeur, y compris NULL, est inconnue et exclue des exportations.

| Indicateur | Définition |
|---|---|
| Tonnage officiellement exporté | SUM(`bdq.pdscom`) / 1000, uniquement `dossier.codmaj=2` |
| Palettes expédiées | SUM(`bdq.nbrpal`) sur les mêmes dossiers clôturés |
| Colis expédiés | SUM(`bdq.nbrcol`) sur les mêmes dossiers clôturés |
| Dossiers expédiés et clôturés | Distinct `(contexte,numdos)` des lignes codmaj 2 : plusieurs BDQ/variétés ne multiplient pas le dossier |
| Dossiers en cours / chargés / inconnus | Dossiers distincts reliés aux BDQ, sous les filtres de date et dimensions, avant le filtre statut |
| Client | `dossier.coddes → destination.coddes → destination.vildes` |
| Pays | `destination.codpay → pays.codpay` |
| Exportateur | `dossier.refexp → partenaire.ref`, séparé du client |
| Poids secondaires | `bdq.pdsnet` et `bdq.pdspse`, jamais substitués à pdscom. Brut officiel indisponible |

Le filtre statut restreint les détails, l'Excel et les exports officiels. « Tous les statuts » permet de consulter les dossiers préparés, mais les quatre KPI et tous les graphiques restent exclusivement codmaj 2. Un filtre En cours/Chargé/Inconnu donne donc zéro export officiel sur sa sélection. Les compteurs de statuts restent visibles avec les autres filtres. L'API expose `total`/`observed` comme sommes de sélection tous statuts filtrés, `official` et `confirmedNetKg` comme export officiel; le champ historique `netKg` des groupes graphiques contient désormais le poids commercial officiel. `sources.metrics` concerne uniquement les clôturés, `selectedMetrics` la sélection consultée.

Grain : un bon de quai de la station relié à un dossier daté. Les dossiers sans bon de quai n'alimentent pas les compteurs de ce tableau. Une quantité NULL ou négative rend sa somme indisponible; jamais de remplacement par zéro ou poids secondaire. Une sélection vide vaut zéro, une source inaccessible interdit le total global et l'Excel. Les codes ambigus suspendent les agrégats.

Calibre : colis et palettes distinctes proviennent de `palette_d`. Le poids officiel `bdq.pdscom` n'est pas ventilé de façon attestée par calibre : sous ce filtre il reste NULL, sans prorata ni substitution par le poids du détail. Les palettes multicalibres ne sont pas additionnées entre calibres.

Dates : `dossier.dtedep`, date enregistrée dans Logista, sans preuve de départ physique. Bornes inclusives limitées à `entreprise` et semaines ISO lundi–dimanche avec année ISO. Aucun jour/semaine absent interpolé.

Consolidation : droits sur tous les contextes avant lecture, station bornée par `bdq.refsta`, identité séparée par contexte. Début, fin et libellé de campagne doivent correspondre. Répartitions par client, pays, variété et emballage gardent la station; pas de fusion arbitraire des codes. Archives autorisées read-only alignées sur les jours écoulés, borne courante limitée à aujourd'hui; dates/semaines ISO réelles conservées.

Détails de transport lorsqu'ils existent : `reftrp → partenaire.ref` transporteur, `refte → partenaire.ref` transitaire, `numrem` conteneur/remorque, `numtra` navire/référence de transport. Les champs absents sont NULL. Aucune inférence de départ à partir de ces textes.

Excel : 24 colonnes typées, toutes les lignes filtrées (pas seulement la page), codes et libellés de statut, Client/Pays/Exportateur séparés, commercial officiel uniquement codmaj 2 et commercial de sélection dans une colonne distincte. L'onglet Contexte contient les filtres et totaux officiels/selection. Dates natives, aucune formule. Recherche paramétrée et tri sur liste blanche.

Permission existante `export:view`, sans élargissement des droits, aucun endpoint de mutation. Aucun montant, règlement ou réclamation.
''',encoding='utf-8')
p=Path('docs/V1.6.0-AUDIT-EXPORT.md');s=p.read_text(encoding='utf-8-sig');idx=s.index('## Règles qui ne sont pas encore prouvées');s=s[:idx]+'''## Interprétation métier confirmée après audit

Les observations précédentes sont conservées, sans réimport ni nouvel audit complet. La confirmation métier remplace les réserves du premier candidat : codmaj 0 En cours, 1 Chargé, 2 Expédié et clôturé; toutes les autres valeurs inconnues sont exclues. Le poids officiel est bdq.pdscom (kg), et Client est destination.vildes par dossier.coddes. L'exportateur refexp reste distinct.

Dans la copie fournie, les quatre dossiers sont codmaj 0 : **zéro dossier et zéro tonne officiellement exportés**, malgré 21 palettes et 21858 kg commerciaux enregistrés tous statuts. Les tests de statut 1, 2 et inconnu utilisent exclusivement des fixtures locales synthétiques; aucune donnée importée AUDIT n'est requalifiée.

Date dtedep : date enregistrée dans Logista, sans preuve physique de départ. Poids brut officiel non disponible. Sous filtre calibre, pdscom du BDQ n'est pas réparti arbitrairement : poids officiel NULL.

Détails de transport : dossier.reftrp et refte reliés séparément à partenaire.ref; numrem et numtra conservés tels qu'enregistrés, lorsqu'ils existent. Les agrégats restent au grain BDQ, jamais joints aux lignes de palette pour additionner les poids d'en-tête.

ZAOUIA vérifié sur la copie fournie. DIAF et archives testés sur fixtures synthétiques isolées; leurs campagnes réelles restent non vérifiées. Voir le dictionnaire des indicateurs et le rapport de tests pour les périmètres exacts.
''';s=s.replace('Destination `vildes`','Client métier `vildes`');p.write_text(s,encoding='utf-8')
p=Path('docs/V1.6.0-MISE-A-JOUR.md');s=p.read_text(encoding='utf-8-sig').replace("Il ne certifie pas les indicateurs d'export réel tant que les règles métier listées dans l'audit ne sont pas confirmées.","Il applique les règles métier confirmées : codmaj=2, bdq.pdscom en kg et Client destination.vildes. La date dtedep reste une date enregistrée dans Logista, sans preuve physique de départ.");s+='\nRecette Export : vérifier les filtres Tous/En cours/Chargé/Expédié/Inconnu, les quatre KPI codmaj 2 et les totaux Excel. Une copie dont tous les dossiers sont codmaj 0 doit afficher zéro export officiel. Aucun correctif de données n’est inclus.\n\nLe frontend candidat est construit dans `frontend/dist-v160`, séparé du webroot local sur 5080 : le service existant n’est ni relancé ni remplacé. La revue navigateur réelle V1.6.0 n’est pas effectuée; voir le rapport pour les validations restantes.\n';p.write_text(s,encoding='utf-8')

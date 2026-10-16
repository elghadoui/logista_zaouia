# Drencher V1.3 — documents et règles de calcul

VITASOUSS V1.4.1 conserve ses modules et son site IIS. Cette mise à jour ajoute des lectures et des documents PDF ; aucune migration SQL nouvelle n'est nécessaire sur une V1.2 opérationnelle.

## Analyse des modèles fournis

Les originaux sont conservés. Le formulaire modèle contient deux feuilles : NADORCOTTE (A1:M63) et CLEM+ORANGE (A1:M31). Les feuilles utilisent des cellules fusionnées, des en-têtes à deux niveaux, des logos, des totaux et deux visas. Format A4 paysage, sans zone d'impression ni titres d'impression déclarés. Aucun tableau Excel structuré ou regroupement de lignes. NADORCOTTE contient deux formulaires : V06 en haut et V04 en bas ; CLEM+ORANGE indique V05. Le nom du fichier mentionne également V05. La cible retenue sur instruction du demandeur est exclusivement **F04 MPS-01 V06**.

L'état Clémentine/Oranges contient 42 feuilles : une première feuille, des relevés journaliers de janvier à mars 2026, plusieurs journées dédoublées et une feuille Formule. Présentation variable (A1:L23 à A1:P30), cellules fusionnées et formules de sommes, eau, consommation théorique et dosage constaté. Absence de zone et de titres d'impression explicites. Les mentions de version, les produits préremplis et les unités de dose ne sont pas homogènes. Des valeurs en kg figurent sous « tonnage » ; la somme ne divise pas systématiquement par 1 000. Certaines formules d'eau reposent sur un forfait par palette plus une cuve initiale, qui n'est pas la mesure d'eau enregistrée par VITASOUSS. Les écarts entre consommations réelles et calculées sont présents dans les relevés.

Ces documents servent de références de structure, jamais de données de test ni de source pour modifier un cycle. V1.3 reprend l'identification, les lots de fruits, les produits, les quantités, les totaux et les visas ; elle sépare les quatre quantités et ajoute une annexe exhaustive des palettes. Elle n'importe ni les noms d'opérateurs historiques, ni les produits, ni les doses, ni les matières actives d'Excel. Les empreintes des originaux et l'analyse exhaustive sont conservées dans le dossier de travail ; les relevés réels ne sont pas inclus dans le paquet IIS.

## F04 V06

Ouvrir un cycle puis utiliser Aperçu F04, Imprimer F04 ou Exporter PDF. Les trois actions utilisent un PDF généré côté serveur avec PDFsharp/MigraDoc 6.2.4. Le document est au format A4 paysage ; station, référence, cycle, révision, date et heures se répètent. Identifiant d'édition, date/heure UTC et pagination figurent en pied de page. Les en-têtes des tableaux se répètent ; les lignes ne sont pas coupées. Les textes exceptionnellement longs se poursuivent sur des lignes supplémentaires sans troncature.

Les réceptions sont regroupées par réception, variété, producteur et verger. Le détail de chaque palette figure en annexe. Les identifiants historiques accompagnent les libellés. Poids stockés en kg : tonnes = kg / 1 000. Une ancienne unité explicitement enregistrée en tonnes est conservée et convertie correctement. Une unité historique inconnue ou un poids manquant est signalé : aucun poids inventé, total partiel indiqué.

Programme et produits proviennent exclusivement de la révision du cycle. Le PDF conserve les doses appliquées, théoriques initiales/finales, machine, réel, écarts, produits supplémentaires, doses modifiées, lots fabricants et péremptions. Les totaux réels restent séparés par produit et unité. Aucune consommation n'est recalculée avec le programme actuel.

Un cycle non validé porte NON VALIDÉE — DOCUMENT DE TRAVAIL. Une ancienne révision remplacée reste consultable par l'API avec `revision`. Une action historique Validation ou Correction atteste son auteur et sa date : la fiche porte RÉVISION HISTORIQUE REMPLACÉE. Sans attestation explicite, elle reste un document de travail. Le cycle actuellement validé affiche son validateur et sa date, ainsi que l'auteur et la date de sa révision/correction. Recette porte toujours RECETTE — DONNÉES DE TEST, y compris après validation d'un cycle d'essai.

Les matières actives ne sont actuellement ni enregistrées ni attestées dans les instantanés V1.2. Elles sont indiquées **Non renseignée / non vérifiée**. Aucun rapprochement par nom commercial ne remplace une vérification. Les zones de visa sont imprimées ; aucune signature numérique ou conformité C/NC n'est inventée.

## Stock local — Impressions et états

| Document | Période / calcul |
|---|---|
| État du stock actuel | Soldes MySQL des lots à l'édition ; produit, lot et statut ; détail des péremptions facultatif. Inclut les produits sans mouvement. |
| Fiche de stock produit | Période d'enregistrement UTC. Ouverture = somme des mouvements antérieurs au début. Clôture = ouverture + mouvements de la période. |
| Journal des entrées | Période selon date de réception magasin ; bon, auteur et date d'enregistrement UTC conservés. |
| Journal des consommations | Période selon date du traitement ; consommation nette par cycle validé et lot, après toutes les corrections connues à l'édition. |
| Journal des mouvements | Période d'enregistrement UTC puis identifiant croissant ; entrées, sorties, restitutions, corrections et solde par produit. |

Les bornes de dates sont inclusives, avec une borne haute exclusive au lendemain. Les soldes sont calculés par produit/unité et, si demandé, sur le lot sélectionné. Le filtre de nature masque des lignes sans modifier le calcul du solde. Un stock initial nul n'est affiché que si le cumul des mouvements antérieurs est nul. Les journaux vides restent explicites. Aucun mélange de L, mL, kg ou g, même lorsque ces unités sont convertibles. Un désaccord entre le solde stocké et le cumul du journal est signalé explicitement sans correction automatique.

Le journal brut montre l'ancienne consommation, sa restitution et son remplacement. Le bilan net additionne leurs signes : consommation 2,7, restitution 2,7 et nouvelle consommation 3 donnent **3**, jamais 5,7. Une correction enregistrée après la période de traitement est incluse dans le bilan net actuel et annoncée comme telle. La fiche comptable la situe à sa date d'enregistrement. Les dates sont présentées en UTC pour rendre les coupures de période explicites.

## Permissions, confidentialité et limites

Les routes exigent une session, le droit de lecture Drencher, un contexte attribué et ZAOUIA configurée. Consultation peut lire les documents d'un contexte autorisé ; Recette reste réservée aux administrateurs. Les archives autorisées restent en lecture seule. Les PDF sont privés, sans cache, et leurs liens temporaires sont libérés à la fermeture, au changement de cycle/révision et à la sortie du contexte. Aucun secret n'est transmis.

La lecture utilise une transaction MySQL REPEATABLE READ explicitement READ ONLY. Aucune réservation, consommation ou écriture métier ne découle d'une édition. Les événements d'édition utilisent la journalisation serveur existante avec identifiant du document, contexte, utilisateur et mode, sans recopier les données sensibles. Les documents volumineux sont refusés au-delà de 20 000 lignes et invitent à réduire les filtres ; aucun résultat n'est silencieusement tronqué.

L'aperçu affiche le même fichier PDF que le téléchargement et l'impression. Un lecteur PDF navigateur doit être disponible ; sinon ouvrir/télécharger le PDF et l'imprimer depuis le lecteur installé. Les boutons ne nécessitent ni Excel ni Office sur IIS. Arial doit être lisible dans le dossier de polices Windows sous l'identité du pool ; aucun fichier de police Microsoft n'est distribué. La bibliothèque PDF est sous licence MIT : [documentation officielle](https://www.pdfsharp.com/MigraDoc).

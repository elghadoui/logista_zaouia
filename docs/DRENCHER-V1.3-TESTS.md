# Drencher V1.3 — tests vérifiables

2026-10-09T14:58:55.413Z

**445 contrôles automatisés réussis**, aucun échec dans les dernières suites livrées. .NET 10 Release sans avertissement/erreur ; TypeScript vérifié. Toutes les connexions MySQL sont locales sur 127.0.0.1:33307 et les données sont synthétiques. Aucun accès/migration/déploiement sur les VM, aucun appel OpenAI réel.

| Suite | Réussis |
|---|---:|
| tests-drencher-v13-api.json | 40 |
| tests-drencher-v13-frontend.json | 11 |
| tests-drencher-v13-pdf.json | 30 |
| tests-drencher-v13-reservations.json | 31 |
| tests-drencher-v13-legacy.json | 56 |
| tests-drencher-v13-recette.json | 45 |
| tests-drencher-v13-palette-frontend.json | 18 |
| tests-drencher-v13-navigation.json | 26 |
| tests-drencher-v13-regression.json | 141 |
| tests-drencher-v13-assistant.json | 33 |
| tests-drencher-v13-assistant-http.json | 14 |

Documents : F04 une/multiples réceptions, deux variétés, quatre produits/unités, produits supplémentaires, écarts, poids absent et libellés nuls, cycle validé après modification du programme, ancienne révision remplacée. Stock : ouverture 47,3, restitution 2,7, nouvelle sortie 3, clôture 47 ; bilan net 3 ; stocks nuls et produits sans mouvement ; périodes vides, filtres lot/nature, désaccord journal/stock signalé. Les CHECKSUM des tables Drencher et historiques restent identiques après génération des documents. Droits Consultation, droits retirés, mauvais exercice, Recette Admin et accès anonyme testés.

Six PDF réellement générés par les endpoints, format/signature PDF vérifiés, A4 paysage, identité/UTC/pagination/en-têtes répétés. Rendus Poppler examinés en PNG et planches contact ; texte et structure vérifiés par pypdf. Aucun document officiel de production généré pour tester. Originaux Excel vérifiés inchangés par SHA256. Aucun relevé réel Excel n’est embarqué dans le paquet.

Interfaces : rendu serveur des véritables composants Mantine et tests du téléchargement, session, URL API, erreurs permission/panne/connexion, annulation ; même Blob PDF pour aperçu, export et impression. Aucun navigateur ou impression physique testé. La recette de station doit vérifier le lecteur PDF, le bouton Imprimer, les marges de l’imprimante et faire approuver F04 V06 par le responsable qualité.

Non-régression : réservations V1.2, sélection paginée/globale, quatre quantités, contrôle qualité, corrections et concurrence, Recipe confirmations/FK/cascades/historique, CRUD/synchronisation/comparaison, navigation et Assistant. Empreintes des vingt fichiers métier/écrans préservés comparées à la copie V1.2 dans le rapport JSON. Les suites métier ont été exécutées avant les dernières retouches limitées aux nouveaux documents ; leurs sources préservées sont inchangées.

Les premiers essais ont détecté un DATE MySqlDateTime incompatible avec DateTime? : les nouvelles lectures de rapports passent par la normalisation existante. L’identité contextuelle unique a été respectée dans les fixtures : Production est simulée sur une seconde base locale synthétique. La révocation de session lors du changement de droits est intégrée au test. La construction Vite habituelle a rencontré la limite de mémoire virtuelle du poste ; la méthode esbuild + Vite documentée compile les mêmes sources sans arrêter d’autres applications ni changer Windows.

DLL livrée SHA256 : 7D81464AF6139D9CA56442A60F47F7E1B18C38C09A8006DF1E5A27C1959CE675. Ressource JS : /assets/index-d0b707e51223.js. Voir update-manifest.json pour les fichiers IIS.

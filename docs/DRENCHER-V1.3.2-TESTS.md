# Drencher V1.3.2 — rapport de vérification

## État de validation

Compilation backend .NET 10 Release réussie, zéro avertissement/erreur. Vérification TypeScript réussie. Frontend complet compilé par la procédure esbuild/Vite adaptée à la mémoire disponible. Les rapports JSON `tests-drencher-v132-*.json` donnent les résultats vérifiables et les dates des tests réellement exécutés.

**Les tests transactionnels API/MySQL restent à exécuter.** Le contrôle automatique a refusé le démarrage des services locaux avec « blocked by policy ». Les fichiers de test sont préparés ; ils ne constituent pas une preuve de réussite tant que leur rapport n'a pas été produit. Cette livraison est donc un **candidat compilé pour recette**, et ne doit pas être considérée comme validée pour Production avant ces tests.

## Vérifications exécutées

- Règles pures de stock : séquence 50 → 47 → 47,5 → 46 → 47 → 50, rejeu sans delta, changements de lot, précision, quantité négative et capacité DECIMAL18,6.
- Compatibilité JSON des anciens produits et instantanés : F04 visible par défaut, matière active non inventée ; génération sans mutation.
- F04 simple/complexe : comparaison raster exacte entre le moteur V1.3.1 de référence et le nouveau moteur, avec le même instantané, le même document et les mêmes dates ; une page dans les deux cas.
- Cinq modèles stock : comparaison raster exacte de l'ancien et du nouveau moteur avec les mêmes données de rapport.
- Modes réel/théorique/machine : libellé, quantité principale historisée, matière active, masquage, dimensions A4, limites de page, pagination/annexes. Cas tous produits masqués.
- Rendu React/Mantine serveur : produits, programmes, bouton administratif, archive désactivée, éditeur de correction pour un cycle soumis ; document temporaire partagé entre aperçu/print/export, erreurs, annulation, révocation Blob.
- Non-régression du sélecteur de palettes, des dates MySqlDateTime, de la navigation, du Sidebar, du contrat de comparaison avec valeurs nulles et permissions restreintes.
- Assistant : 33 vérifications via faux transport OpenAI ; outils interdits, SQL/mutations refusés, limites, timeouts, conversations isolées. Aucun appel réel OpenAI.

Le nombre exact est calculé dans `tests-drencher-v132-summary.json`, sans comptabiliser les tests API non exécutés. Les interfaces ont été rendues en SSR, sans prétendre une interaction navigateur ou une impression papier.

## Tests API/MySQL préparés

`tools/verify-drencher-v132.mjs` crée une base synthétique neuve locale `vitasouss_test_dr132_<identité>` à partir de **DDL sans lignes de production**, applique 004/010/011, vérifie le serveur configuré `127.0.0.1:33307` et utilise l'API locale `127.0.0.1:5080`. Aucun accès VM. Les tables historiques reçoivent uniquement des données fictives au montage ; leurs empreintes sont comparées après les tests. Les comptes/contextes créés sont désactivés en fin de test ; aucune base n'est supprimée automatiquement.

Scénarios : droits opérateur/qualité/Consultation/Admin, archive sans migration historique, immutabilité produit, paramètres documentaires, réservation, deux soumissions concurrentes, soldes réellement lus en base, API directe/stale form verrouillés, corrections successives, validation sans second débit, stock insuffisant/rollback multi-produits, migration sur données existantes/idempotence, documents, suppression des trois états/confirmation/motif/rejeu/restauration/audit, historique Admin, états de programme, transition d'anciens cycles soumis/validés, journal incohérent bloqué et rapprochement solde/journal.

Le script utilise un compte MySQL **local de fixture**, jamais les identifiants de Production. Les secrets de connexion de l'application restent dans ses configurations locales protégées. Le mot de passe de test applicatif est saisi dans une variable temporaire, pas écrit dans le projet ou le paquet.

## Reproduction

À la racine des sources, avec .NET 10, Node et les dépendances frontend installées :

```powershell
npm.cmd --prefix frontend ci --no-audit --no-fund
dotnet build backend -c Release
frontend/node_modules/.bin/tsc.cmd -p frontend/tsconfig.json
powershell -File tools/Test-DrencherV132.ps1
```

Pour les tests API/MySQL, préparer séparément et autoriser les deux services de test locaux, avec une administration locale et les permissions Drencher. Puis :

```powershell
powershell -File tools/Test-DrencherV132.ps1 -ApiMySql
```

Le test API refuse les serveurs métier non locaux. Il suppose le compte de fixture MySQL `vitasouss_test@127.0.0.1` et une instance locale sur 33307 administrable uniquement pour les fixtures. **Ne pas adapter ces garde-fous pour pointer vers les VM.** Pour le contrôle raster : Python avec Pillow/pdfplumber et Poppler ; adapter uniquement le chemin local de Poppler du script si nécessaire.

## Limites et recette restante

La validation API/MySQL, les interactions réelles navigateur, l'installation IIS sur VM-APPS et l'impression papier sur ZAOUIA ne sont pas attestées. Aucun déploiement, changement de configuration, suppression ou écriture sur les VM de Production n'a été effectué. Les sauvegardes et le rapprochement des anciens cycles doivent précéder toute mise en Production.

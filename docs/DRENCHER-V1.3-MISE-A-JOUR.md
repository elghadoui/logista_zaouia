# Mise à jour VITASOUSS V1.4.1 + Drencher V1.2 vers Drencher V1.3

Le paquet contient update/, docs/ et des exemples PDF portant la mention RECETTE. Aucun déploiement sur VM-APPS et aucune connexion aux bases des VM n'ont été effectués pendant le développement. Aucun SQL nouveau n'est requis sur la V1.2 déjà installée.

1. Prévoir une interruption courte et une sauvegarde des fichiers du site `C:\Apps\VitasoussReferentiels`.
2. Vérifier l'archive et le manifeste SHA256 de update/ ; extraire le ZIP dans un dossier temporaire distinct du site.
3. Arrêter le pool/site VITASOUSS existant pendant la copie. Conserver son nom, ses paramètres, le port 8081 et l'identité svc_vitasouss.
4. Copier le **contenu de update/** sur l'application existante. Ne pas utiliser de miroir supprimant les autres fichiers. Le paquet exclut `appsettings*.json`, `web.config`, clés Data Protection, secrets protégés, journaux et identités IIS. Aucun changement de configuration locale n'est nécessaire.
5. Redémarrer le pool existant. Le .NET 10 Hosting Bundle déjà utilisé reste requis. Aucune installation d'Office, de navigateur serveur ou de Python.
6. Vérifier `/api/health` : `version` = `1.4.1`, `drencherVersion` = `1.3`.
7. Actualiser complètement le navigateur. Vérifier la connexion, le bon exercice, la station et le badge Recette/Production.
8. Exécuter la fiche de recette en base isolée, puis faire approuver F04 V06 par le responsable qualité avant toute utilisation officielle.

La configuration du secret OpenAI, les secrets MySQL, les utilisateurs et les permissions ne changent pas. Les routes actuelles restent accessibles. Les nouveaux fichiers PDFsharp/MigraDoc du paquet doivent tous accompagner la DLL ; ne pas copier uniquement Vitasouss.Api.dll.

## Retour arrière

Arrêter le même pool et restaurer les binaires/frontends sauvegardés de V1.2, en conservant les configurations et secrets. Aucune migration ou donnée créée par l'édition des rapports ne nécessite de retour SQL. Les anciennes empreintes et l'archive V1.2 sont conservées dans le dossier de développement.

## Construction locale

La compilation habituelle reste `tools/build.ps1 -SkipInstall`. Sur un poste dont la mémoire virtuelle disponible est faible, `node tools/build-frontend-low-memory.mjs` compile les mêmes sources React/TypeScript avec esbuild, puis laisse Vite préparer le HTML et les ressources statiques. TypeScript doit être vérifié séparément. Le rapport de tests indique la méthode réellement utilisée et les empreintes des ressources livrées. Cette adaptation ne change pas les réglages Windows ni les autres applications.

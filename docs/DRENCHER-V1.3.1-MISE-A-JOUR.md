# Mise à jour depuis Drencher V1.3 vers V1.3.1

La présentation des deux modèles F04 V06 est validée pour cette livraison. Le paquet `VITASOUSS-DRENCHER-V1.3.1-IIS.zip` contient `update/` et `docs/`, dont les deux PDF de démonstration approuvés et le manifeste SHA256.

Le paquet met à jour uniquement le backend et ajoute `pdf-assets/f04-zaouia.png`. Les interfaces et les cinq états de stock de V1.3 sont conservés. Aucune migration SQL, aucun changement de secret ou de permission et aucun nouvel utilisateur. Ne pas relancer les commandes de bootstrap ou de protection des secrets.

1. Sur VM-APPS, vérifier que la V1.3 fonctionne puis sauvegarder les fichiers de `C:\Apps\VitasoussReferentiels`, y compris ses configurations et clés, dans un emplacement sécurisé distinct.
2. Vérifier le SHA256 du ZIP avec son fichier `.sha256` fourni à côté ; extraire dans un répertoire temporaire distinct du site, par exemple `C:\Temp\VitasoussV131`.
3. Contrôler les empreintes de `update/` avec `docs/update-manifest.json`. Le paquet exclut tous les appsettings, web.config, clés et secrets.
4. Arrêter le pool existant associé au site VITASOUSS pour libérer les DLL. Conserver le nom du site, le port 8081, la configuration du pool et son identité `svc_vitasouss`.
5. Copier le **contenu de update/** sur le répertoire installé, sans miroir, sans suppression et sans recréer le site. Copier toutes les DLL et fichiers de dépendances présents, ainsi que le dossier `pdf-assets` ; ne pas copier uniquement Vitasouss.Api.dll. Aucun fichier frontend n'est remplacé.
6. Redémarrer le même pool. Le .NET 10 Hosting Bundle déjà utilisé reste requis.
7. Vérifier `http://192.168.1.253:8081/api/health` : `status` = `ok`, `version` = `1.4.1`, `drencherVersion` = `1.3.1`.
8. Se connecter avec un utilisateur existant et le bon contexte Recette. Générer une fiche simple puis une fiche complexe. Vérifier Aperçu, Exporter PDF et Imprimer F04 ; les autres actions n'ont pas changé.
9. Contrôler les cinq états de stock, les réservations et la validation qualité, puis effectuer l'impression papier sur ZAOUIA comme prévu.

Conserver `appsettings.Local.json`, tous les autres appsettings, `web.config`, secrets MySQL/OpenAI, clés Data Protection, utilisateurs, permissions et paramètres IIS. La copie a été simulée et vérifiée sur un faux site local avec des marqueurs protégés ; aucun site de VM n'a été modifié.

Pour contrôler le manifeste dans PowerShell avant la copie :

```powershell
$packageRoot = 'C:\Temp\VitasoussV131'
$manifest = Get-Content -LiteralPath (Join-Path $packageRoot 'docs\update-manifest.json') -Raw | ConvertFrom-Json
foreach ($file in $manifest) {
    $source = Join-Path (Join-Path $packageRoot 'update') $file.path
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash -ne $file.sha256) {
        throw ('Fichier de mise à jour non conforme : ' + $file.path)
    }
}
```

La génération PDF utilise .NET et PDFsharp déjà présents en V1.3. Aucun Office, Excel, Python ou navigateur serveur à installer. Le logo est une ressource du formulaire fourni, sans nouveau téléchargement réseau.

Après installation, contrôler le rendu dans le lecteur PDF de la station, l'impression A4 paysage et les visas avec le responsable qualité. Le retour arrière consiste à arrêter le même pool, restaurer les binaires de V1.3 sauvegardés et redémarrer, en conservant configurations et secrets ; aucune opération SQL n'est nécessaire.

Aucun déploiement sur les VM n'a été effectué. L'installation est réalisée par votre équipe.

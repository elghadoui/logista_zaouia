# Démonstration locale

L'application locale à `http://127.0.0.1:5080` contient le contexte **DEMO DRENCHER V1 - donnees synthetiques**, station ZAOUIA.

Sélectionner cet exercice, puis Drencher dans le Sidebar. Un programme de démonstration, deux produits et trois lots fabricants sont disponibles. Réception 1 : 160 palettes ; réception 2 : 4 palettes. Aucun cycle prévalidé ; il est possible de suivre toute la recette à partir d'un nouveau cycle.

La base locale est distincte de toutes les bases de recette automatisée et de toute base de production. Ses coordonnées figurent dans `docs/drencher-demo-local.json`, qui n'est pas inclus dans le paquet IIS. Aucun fichier de données de production n'a été importé.

Le générateur `tools/create-drencher-demo.mjs` est volontairement limité à 127.0.0.1:33307, au compte MySQL local de tests et à un nom de base synthétique neuf. Il refuse les stations configurées sur un serveur distant. Il n'est pas un script d'installation VM-LOGISTA.

Le paquet IIS ne contient ni mots de passe locaux ni données de démonstration. Sur VM-APPS, utiliser les comptes existants et une base de recette configurée par l'administrateur ; ne pas charger ces exemples dans les traitements réels.

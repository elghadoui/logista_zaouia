# Activation OpenAI — mise à jour V1.3-AI

Le provider utilise l’API officielle Responses, avec uniquement cinq fonctions métier strictes. Le modèle reste côté serveur. Aucun secret n’est fourni dans ce document ou dans le paquet.

## Installer la petite mise à jour

Sur VM-APPS, sauvegarder l’installation et arrêter le pool existant. Extraire VITASOUSS-V1.3-AI-IIS.zip, puis copier uniquement le contenu de **update/** dans le dossier du site existant. Conserver les appsettings, web.config, trousseau Data Protection, compte/profil svc_vitasouss et paramètres IIS. Aucune migration SQL et aucun changement de droits MySQL requis. L’archive n’inclut pas de dossier app/ d’installation neuve.

Redémarrer le pool. Les modules VITASOUSS fonctionnent même sans clé. L’assistant indique « Assistant IA indisponible » tant que modèle ou clé sont absents.

## Configuration serveur (sans clé)

Le script ci-dessous fusionne Provider/Model dans le fichier Local existant et conserve les autres paramètres. Il ne reçoit jamais de clé API. Les limites suivantes sont optionnelles ; leurs valeurs par défaut sont intégrées au backend :

```json
"Assistant": {
  "Provider": "OpenAI",
  "Model": "IDENTIFIANT_DU_MODELE_AUTORISE_SUR_VOTRE_PROJET_OPENAI",
  "MaxQuestionCharacters": 2000,
  "MaxToolCalls": 4,
  "MaxRowsPerTool": 25,
  "TimeoutSeconds": 60,
  "MaxContextCharacters": 32000,
  "MaxOutputTokens": 1200,
  "RequestsPerMinute": 6
}
```

Sélectionner un modèle de votre projet OpenAI compatible Responses et function calling. Aucun nom n’est codé en dur dans le frontend. Changer le modèle ou les limites nécessite le recyclage du pool. Plafonds de sécurité absolus : question 8000 caractères, 10 outils, 25 lignes par outil, timeout 180 secondes, contexte 100000 caractères (JSON complet envoyé inclus), 4096 tokens de sortie par requête. Le nombre de requêtes OpenAI d’un message est au plus MaxToolCalls + 1. Six messages par minute et utilisateur par défaut ; 16 générations simultanées au maximum par instance. Pour un plafond monétaire, régler aussi le budget du projet OpenAI.

## Commandes exactes sur VM-APPS

Ouvrir **Windows PowerShell en administrateur** sur VM-APPS. Se placer dans le dossier du paquet extrait :

```powershell
$Paquet = Read-Host 'Chemin du dossier VITASOUSS-V1.3-AI extrait'
Set-Location -LiteralPath $Paquet
$Modele = Read-Host 'Identifiant du modèle OpenAI autorisé'
& .\docs\PREPARER-OPENAI-VM.ps1 -Model $Modele
```

Le script identifie le site/pool existant utilisant svc_vitasouss, vérifie LoadUserProfile et le trousseau configuré, sécurise **uniquement** les nouveaux dossiers secrets/assistant-audit et prépare le modèle côté serveur. S’il existe plusieurs sites concernés, ajouter `-SiteName 'NOM_IIS_EXISTANT'`. Il ne modifie ni web.config, ni les ACL du trousseau existant, ni l’identité/configuration IIS, ni les secrets MySQL.

`runas /profile` demande le mot de passe du **compte Windows svc_vitasouss**, pas la clé API. Dans la nouvelle fenêtre sous cette identité, le script lance exactement :

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Production'
# Le script place automatiquement la console dans le dossier physique du site IIS.
dotnet .\Vitasouss.Api.dll --protect-openai-secret
```

Saisir/coller la clé dans cette console : aucun caractère n’est affiché. Entrée enregistre ; Échap annule. Ne jamais passer la clé en argument, variable d’environnement, fichier JSON ou dans une transcription PowerShell. La commande refuse une autre identité Windows et une entrée redirigée. La protection conserve ApplicationName Vitasouss.Referentiels.V1 et les clés existantes, avec un purpose distinct Vitasouss.OpenAiSecrets.v1.

Une fois le message de réussite affiché, fermer cette fenêtre et revenir dans la console administrateur :

```powershell
Import-Module WebAdministration
$Pools = @(Get-ChildItem IIS:\AppPools | Where-Object { $_.processModel.userName -match '(^|\\)svc_vitasouss$' })
if ($Pools.Count -ne 1) { throw 'Choisir le pool existant indiqué par le script de préparation.' }
Restart-WebAppPool -Name $Pools[0].Name
```

Si la politique Windows interdit l’ouverture de session interactive à svc_vitasouss, runas échoue : faire intervenir l’administrateur Windows pour cette opération sous l’identité du pool. Ne pas chiffrer sous Administrateur ou SYSTEM et ne pas changer l’identité IIS pour contourner DPAPI.

## Emplacement et rotation

La clé protégée est enregistrée atomiquement dans **C:\ProgramData\Vitasouss\secrets\openai.protected** (ProgramData réel de la VM), hors site IIS. ACL : svc_vitasouss Modification, SYSTEM et Administrateurs Contrôle total, héritage extérieur désactivé. Les clés Data Protection restent au chemin déjà configuré. DPAPI est lié au compte/profil Windows : conserver ce profil et le trousseau lors des mises à jour. Refaire la même commande pour remplacer la clé, puis recycler le pool. Aucun secret en clair ni valeur protégée n’est affiché.

Autoriser la sortie HTTPS vers api.openai.com:443. L’endpoint est fixe ; aucune URL personnalisée de provider ni redirection HTTP n’est autorisée. Une clé absente/illisible, une erreur 401/403, une limite 429 ou un timeout n’affecte pas les autres modules. Les diagnostics publics restent « Assistant IA indisponible » ; les codes techniques sont accessibles aux administrateurs seulement.

## Données et journal

Le modèle reçoit la question, un historique récent en mémoire, le contexte station/exercice imposé et des résultats métier minimisés. Les noms/références adhérents et les identifiants/date des opérations peuvent être transmis ; CIN, coordonnées, commentaires libres et comptes financiers sont exclus des outils. Aucun SQL libre ni fonction d’écriture/synchronisation n’est exposé. Consultation et archives autorisées restent en lecture. Les droits du compte et de l’exercice sont revérifiés avant chaque outil.

Les conversations sont isolées par utilisateur et contexte, expirent après 30 minutes d’inactivité et ne sont pas persistées sur disque. Le changement de contexte ouvre un écran neuf ; « Nouvelle conversation » supprime l’historique de la session précédente. Un recyclage les efface.

L’audit quotidien est dans C:\ProgramData\Vitasouss\assistant-audit\YYYY-MM-DD.jsonl et dans les logs du serveur : utilisateur, date, contexte, modèle, outil, résultat et tokens disponibles. Aucun prompt, argument, résultat métier ou message brut OpenAI n’est journalisé. L’instance conserve un journal local ; intégrer ce répertoire à votre collecte et votre durée de conservation. Les tokens des réponses réussies sont cumulés sur les appels du message ; si un appel échoue, leur total partiel n’est pas remonté.

Les requêtes utilisent `store:false` : cela désactive le stockage des réponses pour leur réutilisation côté API, sans constituer une garantie Zero Data Retention. Voir [Responses et stockage](https://developers.openai.com/api/docs/guides/migrate-to-responses) et [Function calling officiel](https://developers.openai.com/api/docs/guides/function-calling).

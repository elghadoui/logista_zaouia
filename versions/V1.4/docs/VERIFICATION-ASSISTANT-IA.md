# Vérification Assistant IA — V1.3-AI

## Résultat de livraison

Backend .NET 10 compilé en Release, sans avertissement ; frontend TypeScript strict/Mantine compilé par Vite. Les tests utilisent un HttpMessageHandler OpenAI simulé et les copies locales MySQL 5.7 à 127.0.0.1:33307. **Aucun appel OpenAI réel, aucune clé réelle, aucun accès à une base de production.** La validation d’un vrai modèle et du compte svc_vitasouss sur VM-APPS reste à effectuer après activation.

Résultat : **87 contrôles réussis** (46 provider/outils, 14 HTTP, 27 de régression des fonctions existantes). La régression confirme authentification, CSRF, rôles, archives, identifiants historiques et synchronisation existante. Refus de la commande de protection sous une autre identité Windows confirmé sans demander de clé.

Rapports reproductibles : assistant-verification.json (provider + outils locaux) et assistant-http-verification.json (routes de l’application publiée). Le script d’activation est vérifié syntaxiquement ; il n’a pas été exécuté contre IIS/VM-APPS depuis ce poste.

## Contrôles automatisés

- Provider absent, erreur d’authentification 401 et timeout HTTP/outils : erreur publique contrôlée, aucun corps d’erreur fournisseur exposé.
- API Responses officielle fixe, modèle serveur, fonctions strictes, store false, clé en en-tête uniquement, retour function_call_output relié au call_id.
- Comptage de tokens cumulés sur les réponses réussies ; plafond d’appels appliqué avant toute exécution d’un lot excessif.
- Outils inconnus, synchronisation, SQL arbitraire, INSERT/UPDATE/DELETE/ALTER/DROP et arguments supplémentaires refusés.
- Champs adhérent minimisés, lignes limitées réellement, périodes des réceptions/versements/écarts.
- Consultation autorisée en lecture, exercice non attribué refusé, droits du compte révoqués avant outil.
- Conversations isolées par utilisateur et exercice ; suppression de l’historique à la nouvelle conversation ; question/contexte trop grands refusés.
- Absence de modification de données ZAOUIA et DIAF : compteurs et CHECKSUM TABLE comparés avant/après sur adherent, verger, parcelle, reception, reception_d, versement et ecart_e.
- Routes HTTP : CSRF obligatoire, diagnostic non affiché à Consultation, admin autorisé à voir NOT_CONFIGURED, corps volumineux refusé, limitation des messages, référentiels et santé disponibles sans OpenAI, interface publiée accessible.

## Reproduire sur ce poste de développement

```powershell
Set-Location C:\logista_zaouia
$env:DOTNET_CLI_HOME = 'C:\logista_zaouia\.dotnet-home'
$env:NUGET_PACKAGES = 'C:\logista_zaouia\.nuget'
.\.dotnet\dotnet.exe run --project .\tests\AssistantTests\AssistantTests.csproj -c Release -- --local-integration C:\logista_zaouia\docs\assistant-verification.json
```

Le mode local-integration exige la configuration de test déjà existante, un serveur MySQL 127.0.0.1:33307 et les contextes pilotes de test existants. Il crée/supprime un utilisateur de test dans l’administration locale, sans changer de données métier. Sans ce commutateur, seuls les contrats OpenAI simulés et l’isolation mémoire sont testés. Ne pas exécuter le mode intégration sur VM-APPS/production.

Pour les routes HTTP, lancer l’application locale avec tools/start.ps1, fournir le mot de passe **du compte de test local** dans VITASOUSS_TEST_PASSWORD et exécuter `node tools/verify-assistant-http.mjs`. Ce script active temporairement le compte Consultation de test puis restaure ses droits ; il refuse les connexions autres que les copies locales prévues. Aucune clé OpenAI n’est utilisée.

## Recette sur VM-APPS après activation

1. Suivre ACTIVATION-OPENAI.md, copier uniquement update/, conserver identité/profil/trousseau et config IIS. Sous svc_vitasouss, saisir la clé via --protect-openai-secret, puis recycler le pool.
2. Vérifier la connexion et les référentiels. Avec un contexte de validation autorisé et non productif, ouvrir Assistant IA. Envoyer « Combien de vergers possède l’adhérent REF_TEST ? » puis « Quelles sont ses parcelles ? ». Vérifier le contexte et comparer les compteurs aux écrans métier.
3. Demander les réceptions, versements et écarts d’une période de validation. Le compte porte sur les lignes principales ; les unités/tonnages ne sont pas déduits. Les résultats sont des échantillons limités, pas toutes les fiches.
4. Cliquer Nouvelle conversation. Vérifier l’écran vierge et le changement de contexte. Les réponses sont du texte affiché sans HTML exécutable.
5. Connecter un compte Consultation et vérifier ses exercices autorisés seulement. Une demande de supprimer/modifier/synchroniser ne doit déclencher aucun changement.
6. Sur un environnement de validation, retirer temporairement l’accès OpenAI réseau puis poser une question : seul l’assistant devient indisponible. Restaurer l’accès. Ne pas remplacer une clé de production par une fausse clé pour cette recette.
7. Consulter l’audit et vérifier modèle, utilisateur, outil, succès et tokens. Aucun secret ni question/résultat brut ne doit y figurer. Les codes admin possibles : NOT_CONFIGURED, OPENAI_AUTH, OPENAI_LIMIT, TIMEOUT, TOOL_FORBIDDEN, TOOL_ARGUMENTS, TOOL_LIMIT, CONTEXT_LIMIT, USER_ACCESS_CHANGED, OPENAI_UNAVAILABLE.

La validation automatisée ne constitue pas une recette visuelle navigateur ni une activation réelle sur VM-APPS. Le navigateur local n’a pas été utilisé pendant cette livraison. La commande de protection exige le compte Windows réel svc_vitasouss : cette identité et l’installation IIS ne sont pas présentes sur le poste de test.


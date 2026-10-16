**Mise à jour du 7 octobre 2026 : le provider OpenAI est maintenant livré dans V1.3-AI. Lire ACTIVATION-OPENAI.md et VERIFICATION-ASSISTANT-IA.md. Le contenu ci-dessous décrit la préparation initiale V1.3.**

# Assistant IA — raccordement ultérieur

La V1.3 ne nécessite aucune clé et ne fait aucun appel à un modèle externe. L'interface montre son état réel. Les outils métier sont utilisables depuis le portail en lecture seule, avec les permissions et le contexte de l'utilisateur connecté.

## Contrat technique

`IAssistantProvider` expose `Configured` et `Answer(question, readTool, cancellation)`. L'implémentation livrée `UnconfiguredAssistantProvider` refuse explicitement le chat et permet au reste de l'application de compiler/fonctionner. `AssistantService` fournit une délégation bornée au contexte autorisé ; le provider ne reçoit ni chaîne de connexion, ni credentials MySQL, ni méthode d'écriture.

Raccordement à réaliser lors du choix du provider :

1. Implémenter un adapter .NET pour son API et remplacer l'enregistrement DI de `UnconfiguredAssistantProvider`. Aucun framework, identité IIS ou nom Data Protection à renommer.
2. Lire l'endpoint, le modèle et le secret via des paramètres sécurisés hors du paquet (variables d'environnement sous l'identité actuelle ou configuration locale protégée). Ne jamais placer un secret dans les sources, le frontend ou appsettings publié.
3. Limiter les appels d'outils aux noms fournis : `adherent`, `parcelles-adherent`, `receptions`, `versements`, `ecarts`. Les arguments métier sont typés et bornés. Ne pas construire de SQL à partir du texte du modèle ; ne pas accepter un identifiant de contexte choisi par le modèle.
4. Ajouter limites de durée/tokens, annulation, audit adapté et tests de refus des outils inconnus, des autres exercices et des mutations. Réévaluer les droits pour chaque consultation ; ne pas exposer un résultat d'un autre utilisateur par cache partagé.
5. Faire valider l'hébergement et les données transmissibles avant activation. Aucun journal, secret ou fichier arbitraire ne doit être envoyé au modèle. Distinguer ce qui provient des outils de ce que le modèle infère.

Endpoints actuels : GET `/api/assistant`, GET `/api/contexts/{id}/assistant/tools/{name}?refadh=...`, POST `/api/contexts/{id}/assistant/chat`. Le chat nécessite une session, CSRF et un provider configuré. Les outils sont des lectures ; archives autorisées selon les mêmes droits de consultation. Les parcelles renvoient total et première page de 25, sans charger toute la table dans le navigateur.

Les synthèses de réceptions/écarts héritent des limites métier des tableaux de bord pilotes : aucun tonnage ni rapprochement réel/déclaré n'est fabriqué par l'assistant.


# Proposition Sidebar V1.4.1 — à valider

Date : 7 octobre 2026. Cette proposition ne modifie pas le Sidebar de l’application.

## Audit de la V1.4

Le menu est défini directement dans `frontend/src/App.tsx`, dans Workspace. Les pages utilisent des clés internes de navigation, sans routeur URL. Les mêmes clés devront être conservées. L’authentification et les contrôles serveur restent indépendants du menu.

Le menu comporte actuellement Tableau de bord ; Référentiels (Patrimoine agricole, Variétés, Commerce / Export, Conditionnement, Origines / Déclarations) ; Suivi ; Qualité / Drencher ; Assistant IA ; Administration. Les familles et sous-groupes utilisent Mantine Collapse. Le mode compact mesure 76 px, le mode développé 242 px. Les préférences sont mémorisées dans localStorage. La navigation mobile utilise AppShell et Burger.

Les liens sont filtrés par permissions `view`, les trois pages de configuration exigent Admin. Les défauts et types d’écarts sont actuellement classés dans Conditionnement. Marchés n’existe pas encore dans le catalogue ou le menu. Les groupes fermés ne sont pas automatiquement rouverts pour la page active. Les familles deviennent une seule lettre en mode compact. Le défilement n’a pas de zone ScrollArea dédiée. Le menu mobile ne dispose pas d’un véritable tiroir avec fond, fermeture Escape et gestion du focus. Aucun thème sombre spécifique n’est défini pour les styles de navigation.

## Arborescence proposée et clés conservées

| Rubrique | Pages | Clés existantes / nouvelle clé |
|---|---|---|
| Tableau de bord | Vue générale | dashboard |
| Référentiels agricoles | Adhérents, Vergers, Parcelles ; Explorer la hiérarchie ; Cultures, Groupes de variétés, Variétés, Sous-variétés | adherent, verger, parcelle, hierarchy, culture, grpvar, variete, souvar |
| Commerce & Export | Partenaires, Destinations, Pays, Marchés | pilot:partenaire, pilot:destination, pilot:pays ; pilot:marche à créer dans le chantier A |
| Conditionnement | Groupes d’emballages, Groupes articles | pilot:grpemb, pilot:groupart |
| Qualité | Défauts, Types d’écarts, Déclarations verger | pilot:defaut, pilot:typeecart, pilot:declaration_verger |
| Opérations | Réceptions, Caisserie, Versements, Export, Écarts | board:receptions, board:caisserie, board:versements, board:export, board:ecarts |
| Drencher | Emplacement réservé, indiqué « Intégration future » | Aucun nouveau lien. L’écran Drencher existant et sa clé drencher restent inchangés et accessibles aux mêmes utilisateurs ; aucun lien vers une autre application n’est ajouté. |
| Assistant IA | Assistant existant | assistant |
| Administration | Utilisateurs, Droits par module, Serveurs et contextes ; Synchronisation, Comparer ZAOUIA/DIAF, Journal | admin:users, admin:permissions, admin:contexts, sync, compare, journal |

Les opérations actuellement en lecture seule gardent cette indication. Les rubriques vides après filtrage des permissions disparaissent. Aucune page fictive n’est ajoutée pour un futur module. L’exploration de la hiérarchie et la comparaison restent visibles dans l’arborescence.

## Direction visuelle

Inspiration : [EduAdmin index14](https://eduadmin-template.multipurposethemes.com/bs5/main/index14.html), observé dans le navigateur. Réinterprétation originale : fond clair, groupes espacés, icônes distinctes, chevrons et sélection arrondie. Palette VITASOUSS vert forêt ; accent orange discret. Aucune ressource du modèle n’est copiée.

- Développé : environ 272 px ; logo et marque ; libellés lisibles ; un groupe principal ouvert avec sa liste. Le groupe de la page active reste ouvert ; les autres choix manuels sont mémorisés.
- Compact : environ 76 px ; icônes des rubriques, infobulles et sous-menu accessible au clic ou au clavier. Pas d’initiales ambiguës. La page active demeure indiquée.
- Mobile : tiroir Mantine, fond atténué, bouton Fermer, Escape et focus gérés. Après choix d’une page, fermeture du tiroir.
- Défilement indépendant entre marque et pied de menu ; session et contexte restent accessibles.
- Clair / sombre : mêmes contrastes et indications, selon le thème Mantine.

La maquette `sidebar-v141-maquette.html` montre les trois états et permet de consulter le thème sombre. Il s’agit d’une proposition visuelle, pas de l’application livrée.

## Composants prévus, après validation seulement

1. Extraire la configuration de navigation dans `frontend/src/navigation.ts` : clés, libellés, icônes, permissions, statut futur.
2. Créer `frontend/src/Sidebar.tsx` et ses styles : Collapse, ScrollArea, Tooltip, Popover/Menu en mode compact, Drawer mobile.
3. Adapter uniquement l’intégration dans App.tsx : navigation, état, dimensions AppShell. Conserver les écrans et contrôles existants.
4. Adapter les styles de navigation et le thème dans main.tsx si nécessaire, sans dépendance Bootstrap/jQuery.

## Isolation et risques à tester

Une copie du code V1.4 est conservée dans versions/V1.4. Après validation, les fichiers du chantier B seront travaillés dans une copie distincte et intégrés après tests ; le chantier A demeure dans les services et formulaires métier.

Risques : filtrage d’une famille sans page accessible ; groupe actif fermé par une ancienne préférence ; correspondance entre sélection d’une fiche et groupe actif ; perte de focus au repli ; menu compact inaccessible au clavier ; collision du tiroir avec les modales ; largeur du header sur téléphone ; styles sombres ; confusion entre écran Drencher existant et future intégration.

Vérifications prévues : Admin/Gestionnaire/Consultation avec droits restreints ; toutes les clés existantes ; navigation entre fiche/liste/contexte ; stockage désactivé ; clavier et Escape ; écrans 390, 768 et 1440 px ; menu long ; clair/sombre. Le Drencher n’est pas modifié.

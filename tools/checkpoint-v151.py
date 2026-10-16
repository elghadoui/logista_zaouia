from pathlib import Path
p=Path('docs/V1.5.1-ETAT-REPRISE.md');s=p.read_text(encoding='utf-8');s+='''

## Avancement enregistré — implémentation et premiers tests
- Ajout ContextVisibility.cs, option administrative show_in_selectors et SQL013 séparé. Resolve n’est pas filtré par visibilité. Repli vers contexte autorisé visible, rafraîchissement au retour sur la fenêtre.
- Dashboard premium : filtres repliés, badges actifs, nouvelles cartes icônes/courbes, graphiques SVG interactifs, anneau de répartition, aperçu 5 lignes/détail complet, comparaison explicite.
- Sidebar vert foncé, en conservant routes/droits et modes compact/mobile.
- API caisserie enrichie : E/S/variation E−S par type et flux par producteur/verger, anomalies de rattachement signalées ; aucune dette ni stock absolu inventé.
- Inventaires d’ouverture append-only dans administration : SQL014, CrateOpeningService, interface admin, confirmation, contrôle propriété/physique/dettes, historique et concurrence par révision. Ces déclarations n’activent aucun solde certifié.
- Backend et TypeScript compilés ; frontend construit. 62 assertions de service MySQL locales passées (vérifier le compteur exact dans docs/tests-v151-service.json). 16 assertions React SSR passées. Non-régression UI Drencher 14 passée.
- MySQL local 33307 a été redémarré ; 013 et 014 appliquées DEUX FOIS uniquement à referentiels_admin sur 127.0.0.1:33307. Aucune base de VM contactée.
- Navigateur : refus explicite par préférence utilisateur enregistrée pour http://127.0.0.1:5080. Question de réactivation en attente. Ne pas contourner.
- L’API sur 5080 reste la V1.5.0 jusqu’à relance sur publish-v151-tests. Publier et tester la dernière version avant toute affirmation de validation HTTP.
- Attention encodage Windows : tous les scripts Python doivent utiliser encoding='utf-8' pour lire et écrire. Une altération d’accents a été réparée et les tests SSR repassent.

### Restant avant livraison validée
- Finaliser tests d’anomalies caisserie / inventaire et non-régression compilée.
- Publier backend V1.5.1, tests HTTP réels ; préparer relance locale contrôlée si blocage.
- Revue navigateur et captures desktop/compact/mobile (actuellement refusée par préférence).
- Rapports d’audit/calculs/tests, guide installation/rollback, paquet IIS et sources V1.5.1.
- Vérifier conservation stricte des sources Drencher avec output/audit-v150/baseline/drencher-hashes.json.
''';p.write_text(s,encoding='utf-8')

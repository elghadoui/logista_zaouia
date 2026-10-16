from pathlib import Path
import json,datetime
root=Path.cwd();p=root/'docs/V1.5.1-ETAT-REPRISE.md';history=root/'docs/V1.5.1-HISTORIQUE-REPRISE.md'
if not history.exists():history.write_text(p.read_text(encoding='utf-8-sig'),encoding='utf-8')
names=['service','ui','excel','drencher-permissions','drencher-ui','assistant','api','drencher-api','drencher-guard']
counts={}
for name in names:
 r=json.loads((root/f'docs/tests-v151-{name}.json').read_text(encoding='utf-8-sig'))
 assert r.get('success',True) and r.get('failed',0)==0 and all(t['passed'] for t in r['results'])
 counts[name]=len(r['results'])
text='''# VITASOUSS V1.5.1 — ÉTAT ACTUEL DE REPRISE

## Statut
Code conservé, .NET 10 Release publié, TypeScript et frontend compilés. **%d assertions automatisées réussies** ; aucune VM contactée, aucun déploiement. La validation visuelle avec captures est le seul blocage restant : le navigateur refuse http://127.0.0.1:5080 à cause d’une préférence utilisateur enregistrée. Une demande de réactivation est en attente. Ne pas contourner ce refus.

## Services et binaire
- MySQL local : 127.0.0.1:33307, données .test-data/mysql. Ne jamais utiliser les VM dans les tests.
- API V1.5.1 déjà relancée par l’utilisateur sur 127.0.0.1:5080 ; NE PAS demander de nouvelle relance pour les seules modifications frontend.
- DLL publiée/testée : publish-v151-tests/Vitasouss.Api.dll, SHA256 **6B3C52C073141D9DD4C0495459B7CD1F704C0227487BDB3FE0192A2F67C3D6C6**.
- Frontend servi depuis frontend/dist. Les corrections frontend ultérieures demandent uniquement un rafraîchissement de page.

## Implémentation terminée
- Tableaux de bord : filtres repliés, badges actifs, cartes icônes/courbes, graphiques SVG interactifs accessibles au clavier, anneau réel, onglets existants, comparaison avec dates/tonnages/signe et infobulle, aperçu cinq lignes/détail paginé/Excel.
- Sidebar vert foncé, compact/mobile/thèmes, routes et droits conservés.
- Visibilité administrative indépendante des droits : SQL013, ContextVisibility, sélecteurs globaux et cibles de comparaison/synchronisation filtrés. Repli sûr ; archives associées retirées si leur station/archive principale disparaît.
- useContextList préserve le formulaire monté pendant les actualisations en arrière-plan ; résultat inchangé ne remplace pas les données. Erreur = avertissement, pas d’effacement. À vérifier en interaction sur un cycle brouillon lors de la revue navigateur.
- Caisserie : E entrée / S sortie, variation physique E−S par type et flux producteur/verger. Audit réel : −41 010 caisses du type 1. Anomalies de quantité/sens/type/rattachement signalées ; aucune dette/stock absolu inventé.
- Inventaires administratifs append-only (SQL014), propriété distincte du physique facultatif et des dus individuels connus. Admin seul, confirmations, validations de références/rattachements/quantités, historique et concurrence par révision. Ces déclarations n’activent pas les soldes courants certifiés.
- Sources Drencher et SQL010/011 identiques à la référence, dépendances inchangées. Trois modes F04 et cinq documents de stock testés sans mutation.

## Résultats réellement exécutés

'''%sum(counts.values())
text+='| Rapport docs/tests-v151-*.json | Assertions |\n|---|---:|\n'+''.join(f'| {n} | {v} |\n' for n,v in counts.items())
text+='''
SQL013/014 appliqués deux fois **uniquement dans l’administration locale**. Tests transactionnels sur bases synthétiques, copie auditée en lecture seule. Les comptes/contextes des suites HTTP ont été désactivés de façon ciblée, sans supprimer leurs données. Une première tentative Drencher a rencontré 429 ; la suite complète a ensuite passé en respectant la fenêtre du limiteur. Ne pas désactiver ce limiteur.

ESLint absent des dépendances : aucun succès lint revendiqué. Les alertes NuGet Pkcs préexistantes restent documentées, aucune dépendance n’est mise à niveau.

## Livrables conservés
- VITASOUSS-V1.5.1-IIS-CANDIDAT.zip et .sha256.
- VITASOUSS-V1.5.1-SOURCES-CANDIDAT.zip et .sha256.
- release/VITASOUSS-V1.5.1-CANDIDAT/update : sept fichiers additifs, aucun fichier de configuration, secret, clé, web.config ou ressource PDF remplacé.
- SQL013/014 séparés ; guides V1.5.1-IMPACTS-ET-REGLES.md, MISE-A-JOUR.md, SOURCES-ET-REPRISE.md et TESTS.md.
- Après fabrication, tools/verify-v151-package.py contrôle 16 points, dont simulation de copie préservant des configurations/secrets/clés fictifs.

## Étapes restantes (ne pas recommencer le développement)
1. Attendre la réactivation explicite de l’accès navigateur par l’utilisateur. Réutiliser le navigateur IAB sélectionné (ID 2), sans surface alternative de contournement.
2. Contrôler visuellement la vraie application locale : bureau développé, compact et mobile ; thèmes clair/sombre ; filtres, onglets et graphiques, contexte caché/réaffiché, inventaire, comparaison. Vérifier qu’un retour de fenêtre conserve un brouillon Drencher non enregistré si le contexte n’a pas changé.
3. Préparer au besoin un contexte de copie locale autorisé visible pour la revue (les contextes de test sont désactivés après les suites). Les données d’audit de ZAOUIA sont dans vitasouss_test_audit_20261015. Aucun accès à une VM.
4. Corriger les défauts de rendu éventuels, reconstruire le frontend et ne répéter que les tests touchés. Aucun redémarrage backend si ses sources ne changent pas.
5. Enregistrer de vraies captures dans docs/, produire docs/tests-v151-visual.json avec results[{name,passed}], failed=0 et screenshots (au moins trois chemins relatifs docs/). Ne pas fabriquer ces preuves.
6. Exécuter tools/pack-v151.py --final puis tools/verify-v151-package.py --final pour les archives définitives. Le mode final refuse les preuves manquantes.
7. Toujours aucun déploiement automatique.

## Précautions
Tous les scripts Python doivent lire/écrire en UTF-8 explicitement (Windows peut sinon altérer les accents). Ne pas exécuter les scripts ponctuels edit/fix/polish/prepare-test-source à nouveau : les modifications sont déjà appliquées ; seuls les scripts de test/fixtures/packaging documentés sont réutilisables. Ne jamais exécuter le dump brut qui contient des instructions destructrices. Ne pas remplacer globalement les versions des dépendances dans package-lock. Ne pas toucher aux données historiques, réservations ou mouvements de production.

L’historique de ce travail est conservé dans V1.5.1-HISTORIQUE-REPRISE.md. Les archives V1.5.0 sont conservées à la racine.
'''
p.write_text(text,encoding='utf-8')
p=root/'tools/pack-v151.py';s=p.read_text(encoding='utf-8').replace('CANDIDAT : NE PAS INSTALLER EN PRODUCTION AVANT VALIDATION HTTP ET VISUELLE.','CANDIDAT : NE PAS INSTALLER EN PRODUCTION AVANT FIN DE LA VALIDATION VISUELLE.');p.write_text(s,encoding='utf-8')
print({'automatedPassed':sum(counts.values()),'visualPending':True,'productionDeploy':False})

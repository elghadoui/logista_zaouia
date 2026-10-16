from pathlib import Path
import json,re
root=Path(__file__).resolve().parent.parent
labels={'service':'Service analytique / MySQL 5.7','ui':'Interface tableaux de bord / SSR','excel':'Excel direct et HTTP / relecture indépendante','drencher-permissions':'Politique backend Drencher','drencher-ui':'Interface Drencher / SSR','assistant':'Assistant IA / provider simulé','api':'Tableaux de bord / HTTP','drencher-api':'Drencher transactionnel / HTTP','drencher-guard':'Brouillons et refus PUT /cycles/0 / HTTP'}
counts={}
for key in labels:
 r=json.loads((root/f'docs/tests-v150-{key}.json').read_text(encoding='utf-8-sig'))
 assert r.get('success',True) and r.get('failed',0)==0 and all(t['passed'] for t in r['results']),key
 counts[key]=len(r['results'])
total=sum(counts.values())
p=root/'docs/V1.5.0-TESTS.md';text=p.read_text(encoding='utf-8-sig')
table='## Vérifications réalisées\n\n| Suite | Contrôles |\n|---|---:|\n'+'\n'.join(f'| {labels[key]} | {counts[key]} |' for key in labels)+f'\n| **Total** | **{total} réussis, aucun échec final** |\n\n'
text=re.sub(r'## Vérifications déjà réalisées\n.*?(?=Les 15 contrôles)',table,text,flags=re.S)
http=f'''## Étape HTTP locale terminée

L'utilisateur a démarré la compilation finale sur 127.0.0.1:5080 avec le lanceur local après refus du démarrage automatique. La DLL livrée reste celle de ce processus ; aucune nouvelle relance n'a été demandée.

Les **{counts['api']} contrôles HTTP analytiques** passent : authentification, refus d'accès par module/station/archive, consolidation 5,5 tonnes sans collision sur les fixtures, comparaison de quatre contextes, source indisponible sans faux total, SQL/tri/paramètres invalides refusés, aucune route POST/PUT/DELETE, export Excel et empreintes métier inchangées. Les deux exports (service et HTTP) sont relus indépendamment.

Les **{counts['drencher-api']} contrôles transactionnels Drencher** passent sur une base synthétique neuve : opérateur/qualité/Admin, programmes séparés, stock à la soumission, corrections différentielles, concurrence, réservations, archives, suppressions logiques réservées Admin, F04 et cinq rapports de stock. Les **{counts['drencher-guard']} contrôles ciblés** confirment en plus les brouillons propriétaires et le refus du contournement PUT /cycles/0 ou identifiant négatif.

Une première tentative de la suite Drencher a rencontré HTTP429 après les connexions de la suite analytique. Le délai normal a été respecté avant reprise ; le limiteur n'a été ni désactivé ni modifié. Cette tentative interrompue n'est pas comptée comme une passe validée. Les rapports réussis portent sur la V1.5.0 actuelle, pas sur la livraison précédente.

Les comptes et contextes synthétiques sont désactivés à la fin des scripts. Les empreintes des tables historiques de fixture restent identiques, les documents restent en lecture seule. Aucun accès aux VM ni à la base de production.

Le paquet final est construit avec `httpValidated=true` et `candidate=false`, uniquement après validation de tous les rapports. L'ancien candidat reste distinct ; installer le paquet final VITASOUSS-V1.5.0-IIS.zip.

'''
text=re.sub(r'## Étape HTTP locale\n.*?(?=## Non-régression)',http,text,flags=re.S)
text=text.replace('node tools/verify-drencher-v1321-ui.mjs','node tools/verify-drencher-v1321-ui.mjs\nnode tools/verify-v150-api.mjs\nnode tools/verify-drencher-v150-api.mjs\nnode tools/verify-drencher-v150-guard.mjs')
p.write_text(text,encoding='utf-8')
print(f'Final report: {total} passed assertions, 15 separate package checks')

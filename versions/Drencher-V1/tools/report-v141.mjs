import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const files=[
 ['Métier et synchronisation','api-verification-v141.json'],
 ['Frontend : contrat, rendu React serveur, navigation','frontend-verification-v141.json'],
 ['Opérations, relations, absence de cascade et inspection','boards-verification-v141.json'],
 ['Assistant provider et outils locaux','assistant-verification-v141.json'],
 ['Assistant HTTP et fichiers statiques','assistant-http-verification-v141.json'],
 ['CRUD historiques, sécurité, sessions','core-verification-v141.json'],
 ['Présentations et relations historiques','presentation-verification-v141.json'],
 ['Transferts et suppressions historiques','operations-core-verification-v141.json'],
 ['Réceptions et suppressions par lots','receipt-protection-verification-v141.json'],
 ['Comparaison et exports historiques','comparison-core-verification-v141.json'],
];
let total=0;const suites=[];
for(const [title,file]of files){const data=JSON.parse(readFileSync('docs/'+file,'utf8'));if(!data.results?.length||data.results.some(r=>!r.passed)||data.failed>0)throw Error('Rapport non validé : '+file);total+=data.results.length;suites.push({title,file,passed:data.results.length,date:data.date??data.testedAt??null});}
const sha=bytes=>createHash('sha256').update(bytes).digest('hex').toUpperCase();
function list(folder){return readdirSync(folder,{withFileTypes:true}).flatMap(d=>d.isDirectory()&&!['node_modules','bin','obj','dist','wwwroot','keys','logs','secrets','assistant-audit'].includes(d.name)?list(path.join(folder,d.name)):d.isFile()?[path.join(folder,d.name)]:[]);}
const modified=[];
for(const folder of ['backend','frontend','sql','tools','docs','tests'])for(const file of list(folder)){
 const relative=file.replaceAll('\\','/');
 if(/appsettings|\.protected$|\.jsonl$/.test(relative)||relative.endsWith('package-verification-v141.json')||relative.endsWith('modified-files-v141.json')||relative.endsWith('RAPPORT-TESTS-V1.4.1.md')||relative.endsWith('tests-summary-v141.json'))continue;
 const before=path.join('versions/V1.4',file);const bytes=readFileSync(file);const hash=sha(bytes);
 if(!existsSync(before)||sha(readFileSync(before))!==hash)modified.push({path:relative,status:existsSync(before)?'Modified':'Added',sha256:hash});
}
writeFileSync('docs/modified-files-v141.json',JSON.stringify({date:new Date().toISOString(),baseline:'versions/V1.4',files:modified},null,2));
if(process.argv.includes('--manifest-only')){console.log(modified.length+' fichiers recensés.');process.exit(0);}
const summary={date:new Date().toISOString(),version:'1.4.1',passed:total,failed:0,realOpenAiCalls:0,visualBrowserStatus:'Non validé : accès navigateur local refusé par préférence enregistrée',assemblySha256:sha(readFileSync('publish/Vitasouss.Api.dll')),suites};
writeFileSync('docs/tests-summary-v141.json',JSON.stringify(summary,null,2));
writeFileSync('docs/RAPPORT-TESTS-V1.4.1.md',`# Rapport de tests V1.4.1\n\nGénéré le ${summary.date}. **${total} contrôles automatisés réussis, aucun échec dans les rapports finaux.** .NET 10 Release et TypeScript/Vite compilés. Aucun appel OpenAI réel. Aucun déploiement production.\n\n| Suite | Réussis | Preuve |\n|---|---:|---|\n${suites.map(s=>`| ${s.title} | ${s.passed} | ${s.file} |`).join('\n')}\n\nLes nouveaux tests métier, opérations et relations utilisent des données synthétiques dans vitasouss_test_v141_*, sur MySQL 5.7.44 local 127.0.0.1:33307. Les suites historiques réutilisent leurs copies locales de recette et restaurent leurs fixtures. Elles ne contactent pas les VM et ne modifient pas logista de production.\n\nLes scénarios V1.4 devenus contraires aux nouvelles règles sont remplacés par la suite métier V1.4.1 ; leurs anciens rapports ne sont pas présentés comme une preuve de la nouvelle version. Les tests sont lancés en séquence pour les sessions partagées ; un refus 429 pendant une première tentative parallèle a confirmé que la limite de connexion reste active. La limite n’a pas été désactivée.\n\n## Limites\n\nLe rendu React serveur teste le contrat et les composants réels, mais ne remplace pas les interactions du navigateur. **Tests visuels, responsive, focus et animations non validés** : l’accès à http://127.0.0.1:5080 est refusé par une préférence enregistrée. Les maquettes ont été validées par l’utilisateur ; ce ne sont pas des captures de l’application finale. La recette VM et les droits/schémas réellement installés restent à vérifier avant production.\n\nLe contrôle du paquet et la simulation de mise à jour sont consignés séparément dans payload-verification-v141.json après fabrication.\n\nAssemblage API SHA256 : ${summary.assemblySha256}.\n`);
console.log(total+' contrôles automatisés réussis.');

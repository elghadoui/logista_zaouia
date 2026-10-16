import {readFileSync,writeFileSync} from 'node:fs';
const file='backend/pilot-schema.json';
const catalog=JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const ddl=readFileSync('F:/diafbacukup/logista_zaouia_051026.sql','utf8').match(/CREATE TABLE IF NOT EXISTS `marche` \([\s\S]*?\) ENGINE=[^;]+;/)[0];
if(!catalog.some(e=>e.name==='marche'))catalog.push({name:'marche',keys:['codmar'],label:'nommar',columns:[...ddl.matchAll(/^\s*`([^`]+)` ([^\r\n]+)/gm)].map(m=>({name:m[1],definition:m[2].replace(/,$/,'')})),ddl});
writeFileSync(file,JSON.stringify(catalog,null,2)+'\n');
for(const file of ['backend/Vitasouss.Api.csproj','backend/Program.cs','frontend/package.json','frontend/package-lock.json']){
 let data=readFileSync(file,'utf8').replaceAll('1.4.0','1.4.1');
 if(file.endsWith('Program.cs'))data=data.replace('version = "1.4"','version = "1.4.1"');
 writeFileSync(file,data);
}
const pilot='backend/Application/PilotService.cs';let data=readFileSync(pilot,'utf8');
data=data.replace('name=="declaration_verger"?"Création validée par les références existantes. Modification et suppression protégées : preuve d\'usage réception non établie.":safe ? "Création dans ZAOUIA maître et correction des libellés. Les champs structurels restent protégés."','safe ? "Les identifiants historiques sont conservés. Les modifications et suppressions sont contrôlées selon les usages métier ; consultez la fiche pour les protections applicables."');
writeFileSync(pilot,data);

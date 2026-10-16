import { readFileSync, writeFileSync } from 'node:fs';
const dump=readFileSync('F:/diafbacukup/logista_zaouia_051026.sql','utf8');
const tables=[...dump.matchAll(/CREATE TABLE IF NOT EXISTS `([^`]+)` \(([\s\S]*?)\) ENGINE=([^;]+);/g)].map(m=>({name:m[1],columns:[...m[2].matchAll(/^\s*`([^`]+)` ([^\r\n]+)/gm)].map(c=>({name:c[1],definition:c[2].replace(/,$/,'')})),indexes:m[2].split(/\r?\n/).filter(s=>/KEY|CONSTRAINT/.test(s)),engine:m[3]}));
const fields=['coddes','codpay','codgre','codgrp','coddef','codtype','refexp','refte','reftrp','reftm','codexp','codmar'];
const candidates=Object.fromEntries(fields.map(field=>[field,tables.filter(t=>t.columns.some(c=>c.name===field)).map(t=>t.name)]));
const report={date:'2026-10-07',source:'DDL du dump fourni, sans données de production',tables:tables.filter(t=>['destination','partenaire','pays','marche','grpemb','groupart','defaut','typeecart','declaration_verger','reception','dossier','palette','tpalette','agreage','ecart_e'].includes(t.name)),candidates};
writeFileSync('docs/schema-audit-v141.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(candidates,null,2));

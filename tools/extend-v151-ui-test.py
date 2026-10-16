from pathlib import Path
p=Path('tools/verify-v151-ui.mjs');s=p.read_text(encoding='utf-8');s=s.replace("'frontend/src/navigation.ts']", "'frontend/src/navigation.ts','frontend/src/Administration.tsx','frontend/src/Sidebar.tsx']")
s=s.replace("'@mantine/hooks']", "'@mantine/hooks','@mantine/notifications']")
s=s.replace('export const useApi=()=>({data:globalThis.__analytics', 'export const api=async()=>({});export const useApi=(url)=>({data:url==="/admin/configuration"?globalThis.__configuration:globalThis.__analytics')
idx=s.index("writeFileSync('docs/tests-v151-ui.json'")
s=s[:idx]+'''const {Administration}=require(path.join(dir,'Administration.cjs'));
globalThis.__configuration={servers:[],stations:[{id:1,code:'ZAOUIA'}],contexts:[{id:1,station_id:1,label:'Contexte masqué de test',database_name:'vitasouss_test_z',read_only:false,local_refsta:7816,show_in_selectors:false}],users:[],grants:[],routes:[]};
html=renderToStaticMarkup(React.createElement(MantineProvider,null,React.createElement(Administration,{onConfigured:()=>{},initialTab:'contexts'})));
check('Administration conserve les contextes masqués et permet leur réactivation',html.includes('Contexte masqué de test')&&html.includes('Masqué des sélecteurs')&&html.includes('Afficher dans les sélecteurs'));
check('Inventaire accessible dans administration, sans nouvel accès opérateur',html.includes('Inventaires caisserie'));
''' +s[idx:];p.write_text(s,encoding='utf-8')

import {readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
const base='.test-data/sidebar-v141/src/';
let app=readFileSync('frontend/src/App.tsx','utf8');
app=app.replace("import { PageErrorBoundary } from './PageErrorBoundary';","import { PageErrorBoundary } from './PageErrorBoundary';\nimport { Sidebar } from './Sidebar';");
let start=app.indexOf('  const [closedGroups, setClosedGroups]');let end=app.indexOf('  const [trail, setTrail]',start);if(start<0||end<0)throw Error('Groupe initial introuvable');app=app.slice(0,start)+app.slice(end);
start=app.indexOf('  // Groupes extensibles');end=app.indexOf('  return (\n    <PermissionContext.Provider',start);if(end<0)end=app.indexOf('  return (\r\n    <PermissionContext.Provider',start);if(start<0||end<0)throw Error('Configuration navigation introuvable');app=app.slice(0,start)+app.slice(end);
start=app.indexOf('        <AppShell.Navbar');end=app.indexOf('        <AppShell.Main>',start);if(start<0||end<0)throw Error('Navbar introuvable');
app=app.slice(0,start)+`        <AppShell.Navbar p={0} visibleFrom="sm">
          <Sidebar user={user} context={context} active={selection?.entity ?? page} compact={compact}
            mobileOpened={opened} allowed={allowed} navigate={navigate} onLogout={onLogout}
            onToggle={toggleSidebar} onMobileClose={() => setOpened(false)} />
        </AppShell.Navbar>
`+app.slice(end);
// Drawer is portaled by Mantine, outside the hidden desktop navbar.
app=app.replace('navbar={{ width: compact ? 76 : 242, breakpoint: \'sm\', collapsed: { mobile: !opened } }}','navbar={{ width: compact ? 76 : 272, breakpoint: \'sm\', collapsed: { mobile: true } }}');
app=app.replace('VITASOUSS · V1.4{','VITASOUSS · V1.4.1{');
for(const unused of ['ActionIcon','Collapse','Box','NavLink','Tooltip','IconDashboard','IconArrowLeft','IconChevronRight','IconHistory','IconPlant2','IconLogout','IconMap2','IconSettings','IconSwitchHorizontal','IconUsers']){
 app=app.replace(new RegExp('^  '+unused+',\\r?\\n','m'),'');
}
app=app.replace('api, setCsrf, titles, useApi','api, setCsrf, useApi');
writeFileSync(base+'App.tsx',app);
for(const file of ['PageErrorBoundary.tsx','api.ts','comparisonContract.ts','ReferentialComparison.tsx','ComplementaryPanel.tsx','FormSyncOffer.tsx','RecordView.tsx','SyncReview.tsx','Permissions.tsx'])copyFileSync('frontend/src/'+file,base+file);
if(process.argv.includes('--apply'))for(const file of ['App.tsx','Sidebar.tsx','navigation.ts','Sidebar.module.css','style-modules.d.ts']){if(!existsSync(base+file))throw Error(file);copyFileSync(base+file,'frontend/src/'+file);}

from pathlib import Path
p=Path('tests/AnalyticsV151Tests/Program.cs');s=p.read_text().replace('docs/tests-v150-service.json','docs/tests-v151-service.json').replace('output/audit-v150/receptions-export-test.xlsx','output/audit-v151/receptions-export-test.xlsx').replace('Directory.CreateDirectory(Path.Combine(root,"output/audit-v150"))','Directory.CreateDirectory(Path.Combine(root,"output/audit-v151"))')
needle=' var fake=new AnalyticsSource'
extra='''
 Check("Variation physique auditée E−S = −41 010, aucune dette déduite",crates.CrateFlows.Single(f=>f.Scope=="type"&&f.CrateType==1).PhysicalVariation==-41010m && crates.CrateFlows.All(f=>f.ProducerDebt is null));
 Check("Types de caisses jamais interchangeables",(await service.Read(z,"caisserie",new(),admin))[0].CrateFlows.Count(f=>f.Scope=="type")==2);
 Check("Inventaire : propriété seule ne remplit pas le physique",CrateOpeningService.Validate(new(1,"2026-09-01",1000,null,[],"Inventaire test",true,0))==new DateTime(2026,9,1));
 Check("Inventaire sans confirmation refusé",await Refused(()=>Task.Run(()=>CrateOpeningService.Validate(new(1,"2026-09-01",1000,600,[],"Test",false,0))),400));
 Check("Inventaire : physique supérieur à propriété refusé",await Refused(()=>Task.Run(()=>CrateOpeningService.Validate(new(1,"2026-09-01",1000,1001,[],"Test",true,0))),400));
 Check("Inventaire : dettes + physique supérieurs à propriété refusés",await Refused(()=>Task.Run(()=>CrateOpeningService.Validate(new(1,"2026-09-01",1000,600,[new(1,null,401)],"Test",true,0))),400));
 Check("Inventaire : doublons producteurs/vergers refusés",await Refused(()=>Task.Run(()=>CrateOpeningService.Validate(new(1,"2026-09-01",1000,null,[new(1,null,100),new(1,null,100)],"Test",true,0))),400));
 var inventoryService=new CrateOpeningService(connections);
 Check("Inventaires interdits à Consultation et Gestionnaire",await Refused(()=>inventoryService.List(z,consultation),403)&&await Refused(()=>inventoryService.Save(z,new(1,"2026-09-01",1000,null,[],"Test",true,0),User("Gestionnaire",uid)),403));
 var fixtureAdminId=await db.ExecuteScalarAsync<int>("SELECT id FROM app_users WHERE username='admin' AND role='Admin'");
 var fixtureAdmin=User("Admin",fixtureAdminId);
 var revision=await db.ExecuteScalarAsync<int>("SELECT COALESCE(MAX(revision),0) FROM app_crate_openings WHERE context_id=@z AND crate_type=1 AND campaign_start='2026-09-01'",new{z});
 var declaration=new CrateOpeningRequest(1,"2026-09-01",1000,600,[new(1,10,300)],"Inventaire synthétique local "+nonce,true,revision);
 await inventoryService.Save(z,declaration,fixtureAdmin);
 Check("Inventaire stocké dans administration uniquement",await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_crate_openings WHERE context_id=@z AND revision=@revision AND owned_total=1000 AND physical_quantity=600",new{z,revision=revision+1})==1);
 Check("Révision concurrente périmée refusée",await Refused(()=>inventoryService.Save(z,declaration,fixtureAdmin),409));
 await inventoryService.Save(z,declaration with {ExpectedRevision=revision+1,PhysicalQuantity=null,Dues=[]},fixtureAdmin);
 Check("Historique : révisions préservées et physique inconnu NULL",await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_crate_openings WHERE context_id=@z AND revision IN (@first,@second)",new{z,first=revision+1,second=revision+2})==2);
 Check("Inventaire archive interdit",await Refused(()=>inventoryService.Save(pz,declaration,fixtureAdmin),403));
 Check("Inventaire verger incompatible refusé",await Refused(()=>inventoryService.Save(z,declaration with {Dues=[new(1,20,100)]},fixtureAdmin),409));
 Check("Inventaire type absent refusé",await Refused(()=>inventoryService.Save(z,declaration with {CrateType=999999},fixtureAdmin),409));
 Check("Inventaire hors campagne refusé",await Refused(()=>inventoryService.Save(z,declaration with {OpeningDate="2025-09-01"},fixtureAdmin),409));
 await db.ExecuteAsync("UPDATE app_contexts SET show_in_selectors=0 WHERE id=@z",new{z});
 try {
  Check("Contexte masqué absent des sélecteurs Admin",!(await ContextVisibility.Select(connections,admin)).Any(c=>(int)c.id==z));
  Check("Contexte masqué absent des sélecteurs Consultation",!(await ContextVisibility.Select(connections,consultation)).Any(c=>(int)c.id==z));
  Check("Visibilité distincte du droit : résolution directe autorisée",(await connections.Resolve(z,consultation)).Id==z);
  Check("Visibilité ne donne aucun droit DIAF",await Refused(()=>connections.Resolve(d,consultation),403));
  Check("Droits et utilisateurs préservés après masquage",await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_user_contexts WHERE user_id=@uid AND context_id=@z",new{uid,z})==1);
 } finally { await db.ExecuteAsync("UPDATE app_contexts SET show_in_selectors=1 WHERE id=@z",new{z}); }
 Check("Réactivation visible sans réattribution des droits",(await ContextVisibility.Select(connections,consultation)).Any(c=>(int)c.id==z));
'''
s=s.replace(needle,extra+needle)
p.write_text(s,encoding='utf-8')

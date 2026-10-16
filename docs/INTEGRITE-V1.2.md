# Transfert et suppression — décisions V1.2

## Relations confirmées

`verger.refadh` est le rattachement à `adherent.refadh`. `parcelle.refver` reste attaché à `verger.refver`. Le transfert change seulement `verger.refadh` ; le timestamp généré peut évoluer normalement. Il ne renumérote ni ne recrée le verger, ne change aucune parcelle et ne réécrit pas les anciennes données de réception/palette contenant leur propre refadh.

Le dump ne définit pas de FK pour ces référentiels. Les dépendances ne se limitent pourtant pas aux colonnes de la V1 : le recensement a trouvé notamment `refverreel`, `refveretiq`, `refver_reel`, `refver_nreel`, `parccertificat.idpar`, `parprotocole.idpar` et les identités partielles de parcelles dans `reception_d`, `estimparc`, `fertil`, etc.

## Suppression contrôlée

La suppression physique est activée uniquement pour **Parcelle et Verger**. L’ancien DELETE sans contexte de confirmation reste refusé ; l’opération métier utilise un POST `/delete` avec clé complète, snapshot avant et confirmation `SUPPRIMER`.

Chaque opération découvre les tables de base/colonnes présentes et les FK entrantes depuis information_schema. Les aliases refver sont contrôlés ; les références par idpar/idparcelle et refpar sont vérifiées, en utilisant refver/numcul lorsqu’ils font partie du tuple disponible. Une relation candidate positive est bloquante même si elle n’a pas de FK. Les FK à noms différents sont également contrôlées. Les vues SQL ne sont pas traitées comme des données stockées ; leurs tables sous-jacentes sont contrôlées.

L’aperçu ne vaut jamais autorisation définitive : le serveur verrouille la fiche en WRITE et les tables dépendantes en READ, puis relit le snapshot, le schéma et les dépendances avant de supprimer exactement une ligne par clé complète. Ces verrous empêchent aussi une insertion dépendante concurrente par les applications historiques, sans supposer qu’elles coopèrent avec un verrou applicatif. Attente de verrou limitée ; aucun retry aveugle.

Le compte doit avoir SELECT à l’échelle de la base (ou un privilège global équivalent), vérifié dans les métadonnées de droits. Une visibilité limitée à quelques tables est refusée, car elle pourrait masquer une dépendance. Les colonnes/types du référentiel doivent correspondre au catalogue validé ; un champ supplémentaire inconnu suspend aussi la suppression.

La présence de parcelles, de données métier ou de demandes DIAF en attente bloque la suppression. Un moteur/PK non conforme, une identité nouvelle non reconnue, un trigger sur la table ou une FK externe/réflexive bloque également l’opération. Toute erreur de contrôle ou de droits refuse la suppression ; les erreurs SQL restent dans les logs serveur. L’Admin ne peut pas contourner ces contrôles.

Un audit durable Prepared précède le DELETE ; succès Applied, tentative bloquée importante Blocked. Si le résultat SQL est incertain après une panne, le journal reste à vérifier ; la réconciliation admin vérifie l’absence de la fiche et ne relance pas de DELETE. Il n’y a pas de transaction distribuée avec la base admin.

## Limites conservatrices

Les aliases idpar sont des relations candidates : une correspondance bloque plutôt que supposer son innocuité. Une absence de FK n’autorise pas à ignorer une dépendance connue. Le contrôle couvre le schéma présent, les aliases recensés et les FK déclarées ; il ne peut certifier des références cachées dans des textes libres, du code externe ou des bases non accessibles. Les changements de schéma métier doivent être suspendus pendant une opération destructive.

Les autres référentiels restent désactivés pour la suppression, en attendant une validation équivalente de leurs dépendances. Aucune cascade et aucune suppression synchronisée DIAF ne sont ajoutées. Un transfert utilise la file, la comparaison et la confirmation DIAF existantes, toujours sans refsta.

Le champ historique blocker existe, mais le sens métier de N/O/Y demeure non confirmé. Le dialogue explique où modifier cet état ; il n’introduit aucun bouton interprétant arbitrairement un code comme « désactivé ». Les KPI actifs/bloqués ne sont donc pas inventés.

## KPI et unités

Superficie déclarée du verger : `verger.supver`. Superficie des parcelles : `parcelle.suppar`, en ha selon les libellés métier déjà utilisés dans V1.1. Ces deux sommes restent distinctes. AVG utilise les valeurs disponibles ; une colonne absente ou une somme sans valeurs apparaît indisponible, pas comme une surface fabriquée.

Les agrégations utilisent les filtres de la liste et toutes leurs lignes, indépendamment de la pagination. Dans la liste Adhérents sans filtre, les totaux de l’exercice incluent aussi les parcelles orphelines ; les moyennes par adhérent utilisent seulement les rattachements complets et un message explique cette différence. Les cultures représentées sont obtenues via variete.codcul, jamais numcul.

-- Structures du dump fourni, sans aucune donnée. À créer UNIQUEMENT dans une base de recette NEUVE.
CREATE TABLE IF NOT EXISTS `adherent` (
  `refadh` smallint(6) NOT NULL DEFAULT '0',
  `nomadh` varchar(100) DEFAULT NULL,
  `cinadh` char(50) DEFAULT NULL,
  `adradh` char(250) DEFAULT NULL,
  `viladh` char(200) DEFAULT NULL,
  `teladh` char(50) DEFAULT NULL,
  `faxadh` char(50) DEFAULT NULL,
  `lier` char(1) NOT NULL DEFAULT '',
  `certif` varchar(30) DEFAULT '',
  `Type` varchar(50) DEFAULT NULL,
  `nompro` varchar(100) DEFAULT '',
  `txtref` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`refadh`),
  KEY `idx_refadh` (`refadh`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `culture` (
  `codcul` int(11) NOT NULL DEFAULT '0',
  `nomcul` char(30) DEFAULT '0',
  `lier` char(1) DEFAULT '0',
  PRIMARY KEY (`codcul`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `grpvar` (
  `codgrv` smallint(6) NOT NULL DEFAULT '0',
  `nomgrv` char(25) DEFAULT NULL,
  `lier` char(1) DEFAULT '1',
  PRIMARY KEY (`codgrv`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `palbrut` (
  `numpal` int(11) NOT NULL DEFAULT '0',
  `numrec` int(11) DEFAULT '0',
  `dterec` date DEFAULT NULL,
  `refadh` smallint(6) DEFAULT NULL,
  `refver` smallint(6) DEFAULT NULL,
  `codvar` smallint(6) DEFAULT '0',
  `typcai` smallint(6) DEFAULT NULL,
  `nbrcai` smallint(6) DEFAULT '0',
  `pdsfru` double DEFAULT NULL,
  `frigo` char(1) DEFAULT 'N',
  `deverdi` char(1) DEFAULT 'N',
  `numtrf` int(10) unsigned DEFAULT '0',
  `numver` int(11) DEFAULT '0',
  `numcire` int(10) unsigned DEFAULT '0',
  `refsta1` smallint(6) DEFAULT NULL,
  `refsta2` smallint(6) DEFAULT NULL,
  `etat` char(1) DEFAULT 'R',
  `codsvar` int(11) DEFAULT NULL,
  `depot` varchar(50) DEFAULT NULL,
  `varorg` smallint(6) DEFAULT NULL,
  `chkfruit` int(11) DEFAULT NULL,
  `nbrFruit` double DEFAULT NULL,
  `refverreel` int(11) DEFAULT '0',
  `pchamp` varchar(50) DEFAULT 'NON',
  PRIMARY KEY (`numpal`),
  KEY `Index 2` (`numrec`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `parcelle` (
  `refpar` char(10) NOT NULL DEFAULT '0',
  `numcul` smallint(6) NOT NULL DEFAULT '0',
  `refver` int(11) NOT NULL DEFAULT '0',
  `codvar` smallint(6) DEFAULT NULL,
  `suppar` decimal(8,4) DEFAULT NULL,
  `nbrarb` int(10) unsigned DEFAULT NULL,
  `ecarte` decimal(6,2) DEFAULT NULL,
  `espace` decimal(6,2) DEFAULT NULL,
  `irriga` char(15) DEFAULT NULL,
  `portgref` varchar(250) DEFAULT NULL,
  `dtepln` date DEFAULT NULL,
  `dtearr` date DEFAULT NULL,
  `traite` char(3) DEFAULT NULL,
  `certif` char(10) DEFAULT NULL,
  `lier` char(1) NOT NULL DEFAULT '',
  `codsvar` smallint(6) DEFAULT NULL,
  `idparcelle` int(11) NOT NULL AUTO_INCREMENT,
  `latitude` varchar(50) DEFAULT '0',
  `longitude` varchar(50) DEFAULT '0',
  `codvar2` int(11) DEFAULT '0',
  `souvar2` int(11) DEFAULT '0',
  `couverture` char(50) DEFAULT 'N',
  `typefilet` varchar(50) DEFAULT '0',
  `estimation` double DEFAULT '0',
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idparcelle`,`refpar`,`numcul`,`refver`) USING BTREE,
  KEY `idx_refver_refpar_numcul` (`refver`,`refpar`,`numcul`),
  KEY `idx_codsvar` (`codsvar`)
) ENGINE=InnoDB AUTO_INCREMENT=1025 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `reception` (
  `numrec` int(11) NOT NULL DEFAULT '0',
  `refsta` smallint(6) DEFAULT NULL,
  `codvar` smallint(6) DEFAULT NULL,
  `varrec` smallint(6) DEFAULT NULL,
  `refver` int(11) DEFAULT NULL,
  `numveh` varchar(20) DEFAULT NULL,
  `numcai` int(11) DEFAULT NULL,
  `numtrs` int(11) DEFAULT NULL,
  `numbl` int(11) DEFAULT NULL,
  `dterec` date DEFAULT NULL,
  `herrec` varchar(5) DEFAULT NULL,
  `dtecue` date DEFAULT NULL,
  `hercue` varchar(5) DEFAULT NULL,
  `typcai` smallint(6) DEFAULT NULL,
  `nbrcai` int(11) DEFAULT NULL,
  `nbrpal` int(11) DEFAULT NULL,
  `pdspes` decimal(10,2) DEFAULT NULL,
  `brurec` decimal(10,2) DEFAULT NULL,
  `tarrec` decimal(10,2) DEFAULT NULL,
  `netrec` decimal(10,2) DEFAULT NULL,
  `moycai` decimal(6,2) DEFAULT NULL,
  `coment` varchar(25) DEFAULT NULL,
  `certif` char(3) DEFAULT NULL,
  `codmaj` char(1) DEFAULT NULL,
  `numbou` int(10) unsigned DEFAULT '0',
  `codaff` smallint(5) unsigned DEFAULT '0',
  `pdsech` decimal(10,2) DEFAULT '0.00',
  `nbrfru` smallint(5) unsigned DEFAULT '0',
  `tmprec` decimal(10,2) DEFAULT '0.00',
  `numr` int(10) unsigned DEFAULT '0',
  `numpes` int(11) DEFAULT '0',
  `numord` int(11) DEFAULT '0',
  `numcaisor` int(11) DEFAULT '0',
  `nbrcailiv` int(11) DEFAULT '0',
  `nbrpalliv` int(11) DEFAULT '0',
  `codtrj` int(11) DEFAULT '0',
  `listpar` varchar(50) DEFAULT NULL,
  `comagri` varchar(50) DEFAULT NULL,
  `affect` smallint(6) DEFAULT NULL,
  `typetrns` char(1) DEFAULT 'K',
  `mttrans` double DEFAULT '0',
  `dttare` date DEFAULT '0000-00-00',
  `pese` char(1) DEFAULT '0',
  `pdsNet` double DEFAULT '0',
  `etatpal` varchar(50) DEFAULT NULL,
  `decisiondef` varchar(50) DEFAULT NULL,
  `decisionbrx` varchar(50) DEFAULT NULL,
  `refverreel` int(11) DEFAULT NULL,
  PRIMARY KEY (`numrec`),
  KEY `idx_dterec_refver` (`dterec`,`refver`),
  KEY `idx_numrec` (`numrec`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `souvar` (
  `codsvar` int(10) unsigned DEFAULT NULL,
  `nomsvar` char(15) DEFAULT NULL,
  `codvar` int(10) unsigned DEFAULT NULL,
  KEY `idx_codsvar` (`codsvar`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `station` (
  `refsta` smallint(6) NOT NULL DEFAULT '0',
  `letsta` char(1) DEFAULT '0',
  `nomsta` char(30) DEFAULT '0',
  PRIMARY KEY (`refsta`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `variete` (
  `codvar` int(11) NOT NULL DEFAULT '0',
  `nomvar` char(40) DEFAULT NULL,
  `codgrv` smallint(6) DEFAULT NULL,
  `codcul` smallint(6) DEFAULT NULL,
  `lier` char(1) NOT NULL DEFAULT '1',
  `nomimp` varchar(50) DEFAULT NULL,
  `catII` int(11) DEFAULT '0',
  `prixmoy` decimal(10,2) DEFAULT '1.00',
  PRIMARY KEY (`codvar`),
  KEY `idx_variete_codvar` (`codvar`),
  KEY `idx_codvar` (`codvar`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `verger` (
  `refver` int(11) NOT NULL DEFAULT '0',
  `letver` char(1) DEFAULT NULL,
  `refadh` smallint(6) DEFAULT NULL,
  `refsta` smallint(6) DEFAULT NULL,
  `nomver` char(50) DEFAULT NULL,
  `supver` decimal(8,2) DEFAULT NULL,
  `region` char(50) DEFAULT NULL,
  `locver` char(50) DEFAULT NULL,
  `tecver` char(50) DEFAULT NULL,
  `disvera` smallint(5) unsigned DEFAULT '0',
  `disverf` smallint(5) unsigned DEFAULT '0',
  `tarif` decimal(8,2) DEFAULT '0.00',
  `coment` char(50) DEFAULT NULL,
  `lier` char(1) NOT NULL DEFAULT '',
  `codggn` varchar(50) DEFAULT NULL,
  `certif` char(3) DEFAULT 'NON',
  `geoloc` varchar(100) DEFAULT NULL,
  `libelle` varchar(500) DEFAULT NULL,
  `blocker` char(1) DEFAULT 'N',
  `refremp` int(11) DEFAULT '0',
  `technicien` varchar(50) DEFAULT NULL,
  `douar` varchar(50) DEFAULT NULL,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`refver`),
  KEY `idx_refver` (`refver`),
  KEY `idx_refadh` (`refadh`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
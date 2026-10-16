import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import type { Catalog } from './drencherTypes';
import { today } from './drencherTypes';
import { fetchDrencherPdf } from './drencherDocumentClient';

interface PdfFile {
  url: string;
  name: string;
}
function useDocument() {
  const [file, setFile] = useState<PdfFile | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  const address = useRef<string | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      if (address.current) URL.revokeObjectURL(address.current);
    },
    [],
  );
  function clear() {
    request.current?.abort();
    request.current = null;
    if (address.current) URL.revokeObjectURL(address.current);
    address.current = null;
    setFile(null);
    setError('');
    setBusy(false);
  }
  async function generate(path: string) {
    clear();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    try {
      const { blob, name } = await fetchDrencherPdf(path, controller.signal);
      if (controller.signal.aborted) return null;
      const url = URL.createObjectURL(blob);
      address.current = url;
      const result = { url, name };
      setFile(result);
      return result;
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : 'Génération impossible.');
      return null;
    } finally {
      if (request.current === controller) setBusy(false);
    }
  }
  return { file, error, busy, clear, generate };
}
function download(file: PdfFile) {
  const a = document.createElement('a');
  a.href = file.url;
  a.download = file.name;
  a.click();
}
function PdfView({ file, error }: { file: PdfFile | null; error: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [printError, setPrintError] = useState('');
  useEffect(() => setPrintError(''), [file]);
  return (
    <Stack>
      {error ? <Alert color="red">{error}</Alert> : null}
      {file ? (
        <>
          <Group>
            <Button
              onClick={() => {
                try {
                  frame.current?.contentWindow?.focus();
                  frame.current?.contentWindow?.print();
                } catch {
                  setPrintError('Ouvrez le PDF puis utilisez le bouton Imprimer du lecteur PDF.');
                }
              }}
            >
              Imprimer
            </Button>
            <Button variant="default" onClick={() => download(file)}>
              Exporter PDF
            </Button>
            <Button component="a" href={file.url} target="_blank" rel="noopener" variant="subtle">
              Ouvrir le PDF
            </Button>
          </Group>
          {printError ? <Alert>{printError}</Alert> : null}
          <Text size="sm" c="dimmed">
            L’aperçu, l’impression et l’export utilisent ce même document. Si votre navigateur
            n’affiche pas les PDF, utilisez « Ouvrir le PDF ».
          </Text>
          <iframe
            ref={frame}
            src={file.url}
            title="Aperçu du document Drencher"
            style={{
              width: '100%',
              height: '65vh',
              border: '1px solid var(--mantine-color-default-border)',
            }}
          />
        </>
      ) : null}
    </Stack>
  );
}
export function DrencherF04Actions({
  path,
  cycleId,
  revision,
}: {
  path: string;
  cycleId: number;
  revision: number;
}) {
  const doc = useDocument();
  const [quantityMode, setQuantityMode] = useState<string | null>('reel');
  const [opened, setOpened] = useState(false);
  // A revision change invalidates a previously generated preview.
  useEffect(() => {
    doc.clear();
    setOpened(false);
  }, [cycleId, revision]); // eslint-disable-line react-hooks/exhaustive-deps
  async function open(exportOnly = false) {
    if (!exportOnly) setOpened(true);
    const file = await doc.generate(
      `${path}/reports/f04/${cycleId}?revision=${revision}&quantite=${quantityMode ?? 'reel'}`,
    );
    if (exportOnly && file) download(file);
    if (!file) setOpened(true);
  }
  return (
    <>
      <Group gap="xs">
        <Select
          aria-label="Quantité du F04"
          value={quantityMode}
          allowDeselect={false}
          disabled={doc.busy}
          onChange={(v) => {
            doc.clear();
            setQuantityMode(v);
          }}
          data={[
            { value: 'reel', label: 'F04 · Réel' },
            { value: 'theorique', label: 'F04 · Théorique final' },
            { value: 'machine', label: 'F04 · Machine' },
          ]}
        />
        <Button variant="default" loading={doc.busy} onClick={() => void open()}>
          Aperçu F04
        </Button>
        <Button variant="default" disabled={doc.busy} onClick={() => void open()}>
          Imprimer F04
        </Button>
        <Button variant="default" disabled={doc.busy} onClick={() => void open(true)}>
          Exporter PDF
        </Button>
      </Group>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          doc.clear();
        }}
        title="F04 MPS-01 V06"
        size="95%"
      >
        <Text mb="sm">
          Document à faire approuver par le responsable qualité avant utilisation officielle.
        </Text>
        {doc.busy ? <Text>Génération du document…</Text> : null}
        <PdfView file={doc.file} error={doc.error} />
      </Modal>
    </>
  );
}
export function DrencherStockDocuments({ path, catalog }: { path: string; catalog: Catalog }) {
  const doc = useDocument();
  const [opened, setOpened] = useState(false);
  const [type, setType] = useState<string | null>('stock');
  const [product, setProduct] = useState<string | null>(null),
    [lot, setLot] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null),
    [nature, setNature] = useState<string | null>(null);
  const [from, setFrom] = useState(today),
    [to, setTo] = useState(today),
    [details, setDetails] = useState(true);
  function changed() {
    doc.clear();
  }
  function generate() {
    const query = new URLSearchParams({ type: type ?? 'stock', detailLots: String(details) });
    if (type !== 'stock') {
      if (from) query.set('from', from);
      if (to) query.set('to', to);
    }
    if (product) query.set('produitId', product);
    if (lot) query.set('lotId', lot);
    if (active && type === 'stock') query.set('actif', active);
    if (nature && (type === 'fiche' || type === 'mouvements')) query.set('nature', nature);
    void doc.generate(path + '/reports/stock?' + query);
  }
  return (
    <>
      <Button variant="light" onClick={() => setOpened(true)}>
        Impressions et états
      </Button>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          doc.clear();
        }}
        title="Documents de stock Drencher"
        size="95%"
      >
        <Stack>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Select
              label="Document"
              value={type}
              allowDeselect={false}
              onChange={(v) => {
                changed();
                setType(v);
              }}
              data={[
                { value: 'stock', label: 'État du stock actuel' },
                { value: 'fiche', label: 'Fiche de stock produit' },
                { value: 'entrees', label: 'Journal des entrées' },
                { value: 'consommations', label: 'Journal des consommations' },
                { value: 'mouvements', label: 'Journal des mouvements' },
              ]}
            />
            <Select
              label="Produit"
              searchable
              clearable
              required={type === 'fiche'}
              value={product}
              onChange={(v) => {
                changed();
                setProduct(v);
                setLot(null);
              }}
              data={catalog.produits.map((p) => ({
                value: String(p.id),
                label: `${p.reference} · ${p.nom} (${p.unite})`,
              }))}
            />
            <Select
              label="Lot fabricant"
              searchable
              clearable
              value={lot}
              onChange={(v) => {
                changed();
                setLot(v);
              }}
              data={catalog.lots
                .filter((l) => !product || l.produitId === Number(product))
                .map((l) => ({ value: String(l.id), label: `${l.nom} · ${l.lot}` }))}
            />
            {type !== 'stock' ? (
              <>
                <TextInput
                  type="date"
                  label="Du (inclus)"
                  value={from}
                  onChange={(e) => {
                    changed();
                    setFrom(e.currentTarget.value);
                  }}
                />
                <TextInput
                  type="date"
                  label="Au (inclus)"
                  value={to}
                  onChange={(e) => {
                    changed();
                    setTo(e.currentTarget.value);
                  }}
                />
              </>
            ) : (
              <Select
                label="Statut du produit"
                clearable
                value={active}
                onChange={(v) => {
                  changed();
                  setActive(v);
                }}
                data={[
                  { value: 'actif', label: 'Actif' },
                  { value: 'inactif', label: 'Inactif' },
                ]}
              />
            )}
            {type === 'fiche' || type === 'mouvements' ? (
              <Select
                label="Nature affichée"
                clearable
                value={nature}
                onChange={(v) => {
                  changed();
                  setNature(v);
                }}
                data={[
                  'Entree',
                  'Consommation',
                  'Correction restitution',
                  'Correction consommation',
                  'Soumission consommation',
                  'Suppression restitution',
                ]}
              />
            ) : null}
          </SimpleGrid>
          {type === 'stock' ? (
            <Checkbox
              label="Inclure le détail des lots et péremptions"
              checked={details}
              onChange={(e) => {
                changed();
                setDetails(e.currentTarget.checked);
              }}
            />
          ) : null}
          {type === 'fiche' || type === 'mouvements' ? (
            <Text size="sm" c="dimmed">
              Période d’enregistrement des mouvements en UTC. Le solde tient compte de toutes les
              natures.
            </Text>
          ) : null}
          {type === 'consommations' ? (
            <Text size="sm" c="dimmed">
              Période de traitement. Les quantités nettes intègrent les corrections enregistrées à
              ce jour.
            </Text>
          ) : null}
          <Button loading={doc.busy} disabled={type === 'fiche' && !product} onClick={generate}>
            Générer l’aperçu
          </Button>
          <PdfView file={doc.file} error={doc.error} />
        </Stack>
      </Modal>
    </>
  );
}

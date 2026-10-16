"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// frontend/src/DrencherDocuments.tsx
var DrencherDocuments_exports = {};
__export(DrencherDocuments_exports, {
  DrencherF04Actions: () => DrencherF04Actions,
  DrencherStockDocuments: () => DrencherStockDocuments
});
module.exports = __toCommonJS(DrencherDocuments_exports);
var import_react = require("react");
var import_core = require("@mantine/core");

// frontend/src/drencherTypes.ts
var today = () => {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// frontend/src/drencherDocumentClient.ts
async function fetchDrencherPdf(path, signal) {
  const response = await fetch("/api" + path, {
    credentials: "same-origin",
    signal,
    cache: "no-store"
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.title ?? data?.error ?? data?.message ?? "Document indisponible. V\xE9rifiez vos droits et le contexte."
    );
  }
  if (!response.headers.get("content-type")?.includes("application/pdf")) {
    throw new Error("R\xE9ponse PDF attendue. Rechargez votre session.");
  }
  const blob = await response.blob();
  return { blob, name: `Drencher-${response.headers.get("X-Document-Id") ?? "document"}.pdf` };
}

// frontend/src/DrencherDocuments.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function useDocument() {
  const [file, setFile] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const request = (0, import_react.useRef)(null);
  const address = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(
    () => () => {
      request.current?.abort();
      if (address.current) URL.revokeObjectURL(address.current);
    },
    []
  );
  function clear() {
    request.current?.abort();
    request.current = null;
    if (address.current) URL.revokeObjectURL(address.current);
    address.current = null;
    setFile(null);
    setError("");
    setBusy(false);
  }
  async function generate(path) {
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
        setError(e instanceof Error ? e.message : "G\xE9n\xE9ration impossible.");
      return null;
    } finally {
      if (request.current === controller) setBusy(false);
    }
  }
  return { file, error, busy, clear, generate };
}
function download(file) {
  const a = document.createElement("a");
  a.href = file.url;
  a.download = file.name;
  a.click();
}
function PdfView({ file, error }) {
  const frame = (0, import_react.useRef)(null);
  const [printError, setPrintError] = (0, import_react.useState)("");
  (0, import_react.useEffect)(() => setPrintError(""), [file]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
    error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: error }) : null,
    file ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_core.Button,
          {
            onClick: () => {
              try {
                frame.current?.contentWindow?.focus();
                frame.current?.contentWindow?.print();
              } catch {
                setPrintError("Ouvrez le PDF puis utilisez le bouton Imprimer du lecteur PDF.");
              }
            },
            children: "Imprimer"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", onClick: () => download(file), children: "Exporter PDF" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { component: "a", href: file.url, target: "_blank", rel: "noopener", variant: "subtle", children: "Ouvrir le PDF" })
      ] }),
      printError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { children: printError }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", children: "L\u2019aper\xE7u, l\u2019impression et l\u2019export utilisent ce m\xEAme document. Si votre navigateur n\u2019affiche pas les PDF, utilisez \xAB Ouvrir le PDF \xBB." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "iframe",
        {
          ref: frame,
          src: file.url,
          title: "Aper\xE7u du document Drencher",
          style: {
            width: "100%",
            height: "65vh",
            border: "1px solid var(--mantine-color-default-border)"
          }
        }
      )
    ] }) : null
  ] });
}
function DrencherF04Actions({
  path,
  cycleId,
  revision
}) {
  const doc = useDocument();
  const [quantityMode, setQuantityMode] = (0, import_react.useState)("reel");
  const [opened, setOpened] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    doc.clear();
    setOpened(false);
  }, [cycleId, revision]);
  async function open(exportOnly = false) {
    if (!exportOnly) setOpened(true);
    const file = await doc.generate(
      `${path}/reports/f04/${cycleId}?revision=${revision}&quantite=${quantityMode ?? "reel"}`
    );
    if (exportOnly && file) download(file);
    if (!file) setOpened(true);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { gap: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_core.Select,
        {
          "aria-label": "Quantit\xE9 du F04",
          value: quantityMode,
          allowDeselect: false,
          disabled: doc.busy,
          onChange: (v) => {
            doc.clear();
            setQuantityMode(v);
          },
          data: [
            { value: "reel", label: "F04 \xB7 R\xE9el" },
            { value: "theorique", label: "F04 \xB7 Th\xE9orique final" },
            { value: "machine", label: "F04 \xB7 Machine" }
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", loading: doc.busy, onClick: () => void open(), children: "Aper\xE7u F04" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", disabled: doc.busy, onClick: () => void open(), children: "Imprimer F04" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", disabled: doc.busy, onClick: () => void open(true), children: "Exporter PDF" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_core.Modal,
      {
        opened,
        onClose: () => {
          setOpened(false);
          doc.clear();
        },
        title: "F04 MPS-01 V06",
        size: "95%",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { mb: "sm", children: "Document \xE0 faire approuver par le responsable qualit\xE9 avant utilisation officielle." }),
          doc.busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { children: "G\xE9n\xE9ration du document\u2026" }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfView, { file: doc.file, error: doc.error })
        ]
      }
    )
  ] });
}
function DrencherStockDocuments({ path, catalog }) {
  const doc = useDocument();
  const [opened, setOpened] = (0, import_react.useState)(false);
  const [type, setType] = (0, import_react.useState)("stock");
  const [product, setProduct] = (0, import_react.useState)(null), [lot, setLot] = (0, import_react.useState)(null);
  const [active, setActive] = (0, import_react.useState)(null), [nature, setNature] = (0, import_react.useState)(null);
  const [from, setFrom] = (0, import_react.useState)(today), [to, setTo] = (0, import_react.useState)(today), [details, setDetails] = (0, import_react.useState)(true);
  function changed() {
    doc.clear();
  }
  function generate() {
    const query = new URLSearchParams({ type: type ?? "stock", detailLots: String(details) });
    if (type !== "stock") {
      if (from) query.set("from", from);
      if (to) query.set("to", to);
    }
    if (product) query.set("produitId", product);
    if (lot) query.set("lotId", lot);
    if (active && type === "stock") query.set("actif", active);
    if (nature && (type === "fiche" || type === "mouvements")) query.set("nature", nature);
    void doc.generate(path + "/reports/stock?" + query);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "light", onClick: () => setOpened(true), children: "Impressions et \xE9tats" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.Modal,
      {
        opened,
        onClose: () => {
          setOpened(false);
          doc.clear();
        },
        title: "Documents de stock Drencher",
        size: "95%",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.SimpleGrid, { cols: { base: 1, sm: 3 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Select,
              {
                label: "Document",
                value: type,
                allowDeselect: false,
                onChange: (v) => {
                  changed();
                  setType(v);
                },
                data: [
                  { value: "stock", label: "\xC9tat du stock actuel" },
                  { value: "fiche", label: "Fiche de stock produit" },
                  { value: "entrees", label: "Journal des entr\xE9es" },
                  { value: "consommations", label: "Journal des consommations" },
                  { value: "mouvements", label: "Journal des mouvements" }
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Select,
              {
                label: "Produit",
                searchable: true,
                clearable: true,
                required: type === "fiche",
                value: product,
                onChange: (v) => {
                  changed();
                  setProduct(v);
                  setLot(null);
                },
                data: catalog.produits.map((p) => ({
                  value: String(p.id),
                  label: `${p.reference} \xB7 ${p.nom} (${p.unite})`
                }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Select,
              {
                label: "Lot fabricant",
                searchable: true,
                clearable: true,
                value: lot,
                onChange: (v) => {
                  changed();
                  setLot(v);
                },
                data: catalog.lots.filter((l) => !product || l.produitId === Number(product)).map((l) => ({ value: String(l.id), label: `${l.nom} \xB7 ${l.lot}` }))
              }
            ),
            type !== "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.TextInput,
                {
                  type: "date",
                  label: "Du (inclus)",
                  value: from,
                  onChange: (e) => {
                    changed();
                    setFrom(e.currentTarget.value);
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.TextInput,
                {
                  type: "date",
                  label: "Au (inclus)",
                  value: to,
                  onChange: (e) => {
                    changed();
                    setTo(e.currentTarget.value);
                  }
                }
              )
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Select,
              {
                label: "Statut du produit",
                clearable: true,
                value: active,
                onChange: (v) => {
                  changed();
                  setActive(v);
                },
                data: [
                  { value: "actif", label: "Actif" },
                  { value: "inactif", label: "Inactif" }
                ]
              }
            ),
            type === "fiche" || type === "mouvements" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Select,
              {
                label: "Nature affich\xE9e",
                clearable: true,
                value: nature,
                onChange: (v) => {
                  changed();
                  setNature(v);
                },
                data: [
                  "Entree",
                  "Consommation",
                  "Correction restitution",
                  "Correction consommation",
                  "Soumission consommation",
                  "Suppression restitution"
                ]
              }
            ) : null
          ] }),
          type === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Checkbox,
            {
              label: "Inclure le d\xE9tail des lots et p\xE9remptions",
              checked: details,
              onChange: (e) => {
                changed();
                setDetails(e.currentTarget.checked);
              }
            }
          ) : null,
          type === "fiche" || type === "mouvements" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", children: "P\xE9riode d\u2019enregistrement des mouvements en UTC. Le solde tient compte de toutes les natures." }) : null,
          type === "consommations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", children: "P\xE9riode de traitement. Les quantit\xE9s nettes int\xE8grent les corrections enregistr\xE9es \xE0 ce jour." }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { loading: doc.busy, disabled: type === "fiche" && !product, onClick: generate, children: "G\xE9n\xE9rer l\u2019aper\xE7u" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfView, { file: doc.file, error: doc.error })
        ] })
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DrencherF04Actions,
  DrencherStockDocuments
});

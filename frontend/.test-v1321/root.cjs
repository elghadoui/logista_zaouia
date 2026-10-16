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

// frontend/.test-v1321/entry.ts
var entry_exports = {};
__export(entry_exports, {
  Drencher: () => Drencher,
  PermissionContext: () => PermissionContext
});
module.exports = __toCommonJS(entry_exports);

// frontend/src/DrencherCycleAdmin.tsx
var import_react3 = require("react");
var import_core4 = require("@mantine/core");

// frontend/src/api.ts
var titles = {};
var api = async () => {
  throw Error("No network fixture");
};
var useApi = (url) => ({ loading: false, error: "", refresh: () => {
}, data: url?.endsWith("/catalog") ? globalThis.__drFixture : url?.endsWith("/mode") ? { mode: "Production", registered: false } : url?.endsWith("/reservations/status") ? { ready: true } : url?.includes("/cycles?page") ? { total: 0, rows: [], summary: { cycles: 0, attente: 0, palettes: 0, consommations: [] } } : void 0 });

// frontend/src/components.tsx
var import_core = require("@mantine/core");

// frontend/node_modules/@tabler/icons-react/dist/esm/createReactComponent.mjs
var import_react = require("react");

// frontend/node_modules/@tabler/icons-react/dist/esm/defaultAttributes.mjs
var defaultAttributes = {
  outline: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  },
  filled: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    stroke: "none"
  }
};

// frontend/node_modules/@tabler/icons-react/dist/esm/createReactComponent.mjs
var createReactComponent = (type, iconName, iconNamePascal, iconNode) => {
  const Component = (0, import_react.forwardRef)(
    ({ color = "currentColor", size = 24, stroke = 2, title, className, children, ...rest }, ref) => (0, import_react.createElement)(
      "svg",
      {
        ref,
        ...defaultAttributes[type],
        width: size,
        height: size,
        className: [`tabler-icon`, `tabler-icon-${iconName}`, className].join(" "),
        ...type === "filled" ? {
          fill: color
        } : {
          strokeWidth: stroke,
          stroke: color
        },
        ...rest
      },
      [
        title && (0, import_react.createElement)("title", { key: "svg-title" }, title),
        ...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    )
  );
  Component.displayName = `${iconNamePascal}`;
  return Component;
};

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconAlertCircle.mjs
var __iconNode = [["path", { "d": "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "key": "svg-0" }], ["path", { "d": "M12 8v4", "key": "svg-1" }], ["path", { "d": "M12 16h.01", "key": "svg-2" }]];
var IconAlertCircle = createReactComponent("outline", "alert-circle", "AlertCircle", __iconNode);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconDatabaseOff.mjs
var __iconNode2 = [["path", { "d": "M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74", "key": "svg-0" }], ["path", { "d": "M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6", "key": "svg-1" }], ["path", { "d": "M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4", "key": "svg-2" }], ["path", { "d": "M3 3l18 18", "key": "svg-3" }]];
var IconDatabaseOff = createReactComponent("outline", "database-off", "DatabaseOff", __iconNode2);

// frontend/src/components.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function State({
  loading,
  error,
  empty: empty4,
  retry,
  children
}) {
  if (loading)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Center, { py: 70, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Loader, { color: "forest" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { c: "dimmed", children: "Chargement de vos donn\xE9es\u2026" })
    ] }) });
  if (error)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Alert, { color: "red", title: "Impossible de charger les donn\xE9es", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconAlertCircle, {}), children: [
      error,
      retry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { mt: "md", variant: "light", color: "red", onClick: retry, children: "R\xE9essayer" }) : null
    ] });
  if (empty4)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Paper, { withBorder: true, p: 50, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconDatabaseOff, { size: 36, color: "#83968d" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 600, children: "Aucun enregistrement" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { c: "dimmed", size: "sm", children: "Adaptez votre recherche ou ajoutez un r\xE9f\xE9rentiel si vos droits le permettent." })
    ] }) });
  return children;
}

// frontend/src/drencherDates.ts
function drDay(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : valid(value.getFullYear(), value.getMonth() + 1, value.getDate());
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/.exec(value.trim());
    return m ? valid(Number(m[1]), Number(m[2]), Number(m[3])) : null;
  }
  if (typeof value === "object") {
    const v = value;
    if (v.isValidDateTime === false || v.IsValidDateTime === false) return null;
    return valid(Number(v.year ?? v.Year), Number(v.month ?? v.Month), Number(v.day ?? v.Day));
  }
  return null;
}
function valid(y, m, d) {
  if (!Number.isInteger(y) || y < 1e3 || y > 9999 || !Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(d) || d < 1 || d > 31)
    return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d)
    return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
var drDateText = (v) => drDay(v) ?? "\u2014";
var drExpired = (v, day) => {
  const date = drDay(v), reference = drDay(day);
  return date !== null && reference !== null && date < reference;
};

// frontend/src/DrencherPrint.tsx
var import_core2 = require("@mantine/core");

// frontend/src/drencherTypes.ts
var amount = (water, dose) => Math.round(water * dose / 1e3 * 1e6) / 1e6;
var number = (v) => v == null ? "\u2014" : v.toLocaleString("fr-MA", { maximumFractionDigits: 6 });
var today = () => {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// frontend/src/DrencherPrint.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function DrencherPrint({ detail }) {
  const s = detail.revisions[0].snapshot;
  const known = s.palettes.every((p) => p.poids !== null), weight = s.palettes.reduce((n, p) => n + (p.poids ?? 0), 0), tonnage = known && s.unitePoids ? s.unitePoids === "kg" ? weight / 1e3 : weight : null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dr-print", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Title, { order: 3, children: [
      "VITASOUSS \xB7 Suivi Drencher \xB7 cycle #",
      detail.id
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: "Consultation du cycle et de son historique. Utilisez \xAB Aper\xE7u F04 \xBB pour le document F04 MPS-01 V06." }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
      s.date,
      " \xB7 ",
      s.debut,
      "\u2013",
      s.fin,
      " \xB7 ",
      detail.statut,
      " \xB7 Programme ",
      s.programmeNom,
      " v",
      s.programmeVersion
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
      "Op\xE9rateur : ",
      detail.auteur,
      " \xB7 Cr\xE9ation : ",
      detail.dateCreation,
      " \xB7 Validation :",
      " ",
      detail.validateur ?? "En attente",
      " ",
      detail.dateValidation ?? ""
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
      s.palettes.length,
      " palettes \xB7 Tonnage :",
      " ",
      tonnage === null ? "non calcul\xE9 \u2014 unit\xE9/poids \xE0 confirmer" : number(tonnage) + " t",
      " \xB7 Eau initiale : ",
      number(s.eauInitiale),
      " L \xB7 Eau consomm\xE9e : ",
      number(s.eauConsommee),
      " L"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { mt: "md", withTableBorder: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tr, { children: [
        "Produit / dose",
        "Initial calcul\xE9",
        "Final th\xE9orique",
        "Machine",
        "R\xE9el",
        "\u0394 r\xE9el/th\xE9orie",
        "\u0394 r\xE9el/machine",
        "Lots fabricants"
      ].map((l) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: l }, l)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: s.produits.map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
          p.nom,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("br", {}),
          number(p.dose),
          " ",
          p.unite,
          "/1000 L",
          p.horsProgramme ? " \xB7 HORS PROGRAMME" : "",
          p.doseModifiee ? " \xB7 DOSE MODIFI\xC9E" : ""
        ] }),
        [p.initial, p.final, p.machine, p.reel, p.ecartTheorique, p.ecartMachine].map(
          (n, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
            number(n),
            " ",
            p.unite
          ] }, i)
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.lots.map((l) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          l.lot,
          " : ",
          number(l.quantite),
          " ",
          p.unite,
          drExpired(l.peremption, s.date) ? " \xB7 P\xC9RIM\xC9" : ""
        ] }, l.lotId)) })
      ] }, p.produitId)) })
    ] }),
    s.produits.some(
      (p) => p.horsProgramme || p.doseModifiee || p.ecartTheorique !== 0 || p.ecartMachine !== 0 || p.lots.some((l) => drExpired(l.peremption, s.date))
    ) ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "orange", mt: "sm", children: "\xC9carts \xE0 examiner par le responsable qualit\xE9. Aucune consommation r\xE9elle n'est omise." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { mt: "md", children: [
      "Observations : ",
      s.observations || "\u2014"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { mt: "md", withTableBorder: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tr, { children: ["R\xE9ception", "Palette", "Vari\xE9t\xE9", "Verger", "Adh\xE9rent", "Poids Logista"].map((l) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: l }, l)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: s.palettes.map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.numrec }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.numpal }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.variete ?? p.codvar ?? "\u2014" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.verger ?? p.refver ?? "\u2014" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.adherent ?? p.refadh ?? "\u2014" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
          number(p.poids),
          " ",
          s.unitePoids || "(unit\xE9 non confirm\xE9e)"
        ] })
      ] }, p.numpal)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Title, { order: 4, mt: "lg", children: "Historique conserv\xE9" }),
    [...detail.revisions].reverse().map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dr-revision", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 600, children: [
        "R\xE9vision ",
        r.version,
        " \xB7 ",
        r.action,
        " \xB7 ",
        r.auteur,
        " \xB7 ",
        r.dateCreation
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { children: r.motif || "\u2014" }),
      r.version !== detail.version ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: r.snapshot.produits.map(
        (p) => `${p.nom} : machine ${number(p.machine)}, r\xE9el ${number(p.reel)} ${p.unite}, lots ${p.lots.map((l) => `${l.lot}=${number(l.quantite)}`).join(", ")}`
      ).join(" ; ") }) : null
    ] }, r.version))
  ] });
}

// frontend/src/DrencherDocuments.tsx
var import_react2 = require("react");
var import_core3 = require("@mantine/core");

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
var import_jsx_runtime3 = require("react/jsx-runtime");
function useDocument() {
  const [file, setFile] = (0, import_react2.useState)(null);
  const [error, setError] = (0, import_react2.useState)("");
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const request = (0, import_react2.useRef)(null);
  const address = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(
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
  const frame = (0, import_react2.useRef)(null);
  const [printError, setPrintError] = (0, import_react2.useState)("");
  (0, import_react2.useEffect)(() => setPrintError(""), [file]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { children: [
    error ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "red", children: error }) : null,
    file ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_core3.Button,
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
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "default", onClick: () => download(file), children: "Exporter PDF" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { component: "a", href: file.url, target: "_blank", rel: "noopener", variant: "subtle", children: "Ouvrir le PDF" })
      ] }),
      printError ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { children: printError }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", c: "dimmed", children: "L\u2019aper\xE7u, l\u2019impression et l\u2019export utilisent ce m\xEAme document. Si votre navigateur n\u2019affiche pas les PDF, utilisez \xAB Ouvrir le PDF \xBB." }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
  const [quantityMode, setQuantityMode] = (0, import_react2.useState)("reel");
  const [opened, setOpened] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { gap: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        import_core3.Select,
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "default", loading: doc.busy, onClick: () => void open(), children: "Aper\xE7u F04" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "default", disabled: doc.busy, onClick: () => void open(), children: "Imprimer F04" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "default", disabled: doc.busy, onClick: () => void open(true), children: "Exporter PDF" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      import_core3.Modal,
      {
        opened,
        onClose: () => {
          setOpened(false);
          doc.clear();
        },
        title: "F04 MPS-01 V06",
        size: "95%",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { mb: "sm", children: "Document \xE0 faire approuver par le responsable qualit\xE9 avant utilisation officielle." }),
          doc.busy ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { children: "G\xE9n\xE9ration du document\u2026" }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PdfView, { file: doc.file, error: doc.error })
        ]
      }
    )
  ] });
}
function DrencherStockDocuments({ path, catalog }) {
  const doc = useDocument();
  const [opened, setOpened] = (0, import_react2.useState)(false);
  const [type, setType] = (0, import_react2.useState)("stock");
  const [product, setProduct] = (0, import_react2.useState)(null), [lot, setLot] = (0, import_react2.useState)(null);
  const [active, setActive] = (0, import_react2.useState)(null), [nature, setNature] = (0, import_react2.useState)(null);
  const [from, setFrom] = (0, import_react2.useState)(today), [to, setTo] = (0, import_react2.useState)(today), [details, setDetails] = (0, import_react2.useState)(true);
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "light", onClick: () => setOpened(true), children: "Impressions et \xE9tats" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      import_core3.Modal,
      {
        opened,
        onClose: () => {
          setOpened(false);
          doc.clear();
        },
        title: "Documents de stock Drencher",
        size: "95%",
        children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.SimpleGrid, { cols: { base: 1, sm: 3 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Select,
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
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Select,
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
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Select,
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
            type !== "stock" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                import_core3.TextInput,
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
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                import_core3.TextInput,
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
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Select,
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
            type === "fiche" || type === "mouvements" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Select,
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
          type === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.Checkbox,
            {
              label: "Inclure le d\xE9tail des lots et p\xE9remptions",
              checked: details,
              onChange: (e) => {
                changed();
                setDetails(e.currentTarget.checked);
              }
            }
          ) : null,
          type === "fiche" || type === "mouvements" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", c: "dimmed", children: "P\xE9riode d\u2019enregistrement des mouvements en UTC. Le solde tient compte de toutes les natures." }) : null,
          type === "consommations" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", c: "dimmed", children: "P\xE9riode de traitement. Les quantit\xE9s nettes int\xE8grent les corrections enregistr\xE9es \xE0 ce jour." }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { loading: doc.busy, disabled: type === "fiche" && !product, onClick: generate, children: "G\xE9n\xE9rer l\u2019aper\xE7u" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PdfView, { file: doc.file, error: doc.error })
        ] })
      }
    )
  ] });
}

// frontend/src/DrencherCycleAdmin.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function DrencherCycleAdmin({
  path,
  cycle,
  onUpdated,
  readOnly = false
}) {
  const [opened, setOpened] = (0, import_react3.useState)(false), [phrase, setPhrase] = (0, import_react3.useState)(""), [motif, setMotif] = (0, import_react3.useState)(""), [busy, setBusy] = (0, import_react3.useState)(false), [error, setError] = (0, import_react3.useState)(""), [page, setPage] = (0, import_react3.useState)(1), [selected, setSelected] = (0, import_react3.useState)(null);
  const history = useApi(
    cycle ? null : `${path}/cycles/deleted?page=${page}`
  );
  const detail = useApi(selected ? `${path}/cycles/${selected}` : null);
  async function remove() {
    if (!cycle) return;
    setBusy(true);
    setError("");
    try {
      await api(`${path}/cycles/${cycle.id}/delete`, "POST", {
        version: cycle.version,
        confirmation: phrase,
        motif
      });
      setOpened(false);
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setBusy(false);
    }
  }
  if (!cycle)
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Title, { order: 4, children: "Historique des cycles supprim\xE9s" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { children: "Les instantan\xE9s et les mouvements sont conserv\xE9s. Consultation administrative uniquement." }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(State, { loading: history.loading, error: history.error, retry: history.refresh, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.ScrollContainer, { minWidth: 650, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tr, { children: ["Cycle", "Date UTC", "Administrateur", "Motif", ""].map((x) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Th, { children: x }, x)) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tbody, { children: history.data?.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Td, { children: [
            "#",
            r.id,
            " \xB7 v",
            r.version
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: r.date_suppression }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: r.administrateur }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: r.motif }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Button, { variant: "subtle", onClick: () => setSelected(r.id), children: "Consulter" }) })
        ] }, r.id)) })
      ] }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_core4.Pagination,
        {
          total: Math.max(1, Math.ceil((history.data?.total ?? 0) / 25)),
          value: page,
          onChange: setPage
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_core4.Modal,
        {
          opened: selected !== null,
          onClose: () => setSelected(null),
          title: "Archive administrative \xB7 cycle supprim\xE9",
          size: "95%",
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(State, { loading: detail.loading, error: detail.error, retry: detail.refresh, children: detail.data ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "red", children: "SUPPRIM\xC9 \xB7 document d\u2019archive uniquement" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              DrencherF04Actions,
              {
                path,
                cycleId: detail.data.id,
                revision: detail.data.version
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DrencherPrint, { detail: detail.data })
          ] }) : null })
        }
      )
    ] });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_core4.Button,
      {
        color: "red",
        variant: "light",
        disabled: readOnly || cycle.statut === "Supprim\xE9",
        onClick: () => {
          setPhrase("");
          setMotif("");
          setError("");
          setOpened(true);
        },
        children: "Supprimer le cycle \xB7 admin"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_core4.Modal,
      {
        opened,
        onClose: () => {
          if (!busy) setOpened(false);
        },
        title: `Supprimer le cycle #${cycle.id} ?`,
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "orange", children: "Suppression logique d\xE9finitive pour les op\xE9rations : les quantit\xE9s r\xE9ellement comptabilis\xE9es seront restitu\xE9es et les palettes lib\xE9r\xE9es. L\u2019historique sera conserv\xE9." }),
          error ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "red", children: error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Textarea,
            {
              label: "Motif obligatoire",
              maxLength: 1e3,
              value: motif,
              disabled: busy,
              onChange: (e) => setMotif(e.currentTarget.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.TextInput,
            {
              label: `Recopier : SUPPRIMER CYCLE ${cycle.id}`,
              value: phrase,
              disabled: busy,
              onChange: (e) => setPhrase(e.currentTarget.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { justify: "end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Button, { variant: "default", disabled: busy, onClick: () => setOpened(false), children: "Annuler" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.Button,
              {
                color: "red",
                loading: busy,
                disabled: readOnly || phrase !== `SUPPRIMER CYCLE ${cycle.id}` || !motif.trim(),
                onClick: () => void remove(),
                children: "Confirmer la suppression"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}

// frontend/src/DrencherReservationAdmin.tsx
var import_react4 = require("react");
var import_core5 = require("@mantine/core");
var import_jsx_runtime5 = require("react/jsx-runtime");
function DrencherReservationAdmin({
  path,
  onUpdated
}) {
  const diag = useApi(path + "/reservations/diagnostic");
  const [error, setError] = (0, import_react4.useState)(""), [busy, setBusy] = (0, import_react4.useState)(false), [initialize, setInitialize] = (0, import_react4.useState)(false), [cycle, setCycle] = (0, import_react4.useState)(null), [remove, setRemove] = (0, import_react4.useState)([]), [phrase, setPhrase] = (0, import_react4.useState)(""), [motif, setMotif] = (0, import_react4.useState)("");
  const owners = Array.from(
    new Map(
      (diag.data?.conflicts ?? []).flatMap((p) => p.cycles).map((c) => [c.cycleId, c])
    ).values()
  );
  const current = owners.find((c) => String(c.cycleId) === cycle);
  async function act() {
    setBusy(true);
    setError("");
    try {
      await api(
        path + `/reservations/${initialize ? "initialize" : "arbitrate"}`,
        "POST",
        initialize ? { confirmation: phrase } : {
          cycleId: current?.cycleId,
          version: current?.version,
          retirer: remove.map(Number),
          confirmation: phrase,
          motif
        }
      );
      setInitialize(false);
      setCycle(null);
      setPhrase("");
      setRemove([]);
      setMotif("");
      diag.refresh();
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action impossible.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Title, { order: 4, children: "Diagnostic et migration des r\xE9servations V1.2" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Alert, { children: "Aucun cycle n'est modifi\xE9 automatiquement. Diagnostic avant le SQL 010, arbitrage explicite des doublons, puis initialisation du nouveau registre. Les cycles valid\xE9s ne sont jamais arbitr\xE9s ici." }),
    diag.error || error ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Alert, { color: "red", children: diag.error || error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Button, { variant: "light", onClick: diag.refresh, children: "Actualiser le diagnostic" }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        import_core5.Button,
        {
          disabled: !diag.data?.installed || !!diag.data?.conflicts.length || busy,
          onClick: () => {
            setInitialize(true);
            setPhrase("");
          },
          children: "Initialiser les r\xE9servations"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Text, { children: diag.data?.message }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Table, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Table.Th, { children: "Palette en conflit" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Table.Th, { children: "Cycles et \xE9tats" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Table.Tbody, { children: diag.data?.conflicts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Table.Td, { children: p.numpal }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Table.Td, { children: p.cycles.map((c) => `#${c.cycleId} (${c.statut}, v${c.version})`).join(" \xB7 ") })
      ] }, p.numpal)) })
    ] }),
    owners.some((c) => c.statut !== "Valid\xE9") ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      import_core5.Select,
      {
        label: "Cycle non valid\xE9 \xE0 arbitrer",
        value: cycle,
        data: owners.filter((c) => c.statut !== "Valid\xE9").map((c) => ({ value: String(c.cycleId), label: `Cycle #${c.cycleId} \xB7 ${c.statut}` })),
        onChange: (v) => {
          setCycle(v);
          setPhrase("");
          setRemove([]);
          setMotif("");
        }
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      import_core5.Modal,
      {
        opened: initialize || cycle !== null,
        onClose: () => {
          if (!busy) {
            setInitialize(false);
            setCycle(null);
          }
        },
        title: initialize ? "Confirmer l\u2019initialisation" : "Arbitrage explicite d\u2019un cycle",
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Alert, { color: "red", children: error }) : null,
          initialize ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Text, { children: "Seul le registre de r\xE9servation est rempli. Les instantan\xE9s existants ne sont pas r\xE9\xE9crits." }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Alert, { color: "orange", children: "Choisir le cycle qui correspond au traitement r\xE9el. Les palettes retir\xE9es et les anciennes valeurs restent visibles dans l'historique. Si aucune palette ne reste, compl\xE9ter ce brouillon avant soumission." }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              import_core5.MultiSelect,
              {
                label: "Palettes en conflit \xE0 retirer de ce cycle",
                value: remove,
                onChange: setRemove,
                data: (diag.data?.conflicts ?? []).filter((p) => p.cycles.some((c) => String(c.cycleId) === cycle)).map((p) => ({ value: String(p.numpal), label: `Palette ${p.numpal}` }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              import_core5.Textarea,
              {
                label: "Motif obligatoire de l'arbitrage",
                value: motif,
                onChange: (e) => setMotif(e.currentTarget.value)
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            import_core5.TextInput,
            {
              label: `Saisir ${initialize ? "INITIALISER RESERVATIONS" : "ARBITRER CYCLE " + cycle}`,
              value: phrase,
              onChange: (e) => setPhrase(e.currentTarget.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            import_core5.Button,
            {
              loading: busy,
              disabled: phrase !== (initialize ? "INITIALISER RESERVATIONS" : "ARBITRER CYCLE " + cycle) || !initialize && (!remove.length || !motif.trim()),
              onClick: () => void act(),
              children: "Confirmer"
            }
          )
        ] })
      }
    )
  ] });
}

// frontend/src/Drencher.tsx
var import_react12 = require("react");
var import_core14 = require("@mantine/core");

// frontend/src/Permissions.tsx
var import_react5 = require("react");
var import_core6 = require("@mantine/core");
var import_jsx_runtime6 = require("react/jsx-runtime");
var PermissionContext = (0, import_react5.createContext)([]);
function usePermissions(module2) {
  return (0, import_react5.useContext)(PermissionContext).find((p) => p.module === module2) ?? {
    module: module2,
    view: false,
    add: false,
    modify: false,
    delete: false
  };
}
var names = {
  ...titles,
  hierarchy: "Hi\xE9rarchie",
  partenaire: "Partenaires",
  destination: "Destinations",
  pays: "Pays",
  grpemb: "Groupes emballages",
  groupart: "Groupes articles",
  defaut: "D\xE9fauts",
  typeecart: "Types d\u2019\xE9cart",
  declaration_verger: "Origines / d\xE9clarations",
  receptions: "R\xE9ceptions",
  caisserie: "Caisserie",
  versements: "Versements",
  export: "Export",
  ecarts: "\xC9carts",
  dashboard: "Tableau de bord",
  assistant: "Assistant IA",
  drencher: "Drencher \xB7 saisie",
  drencher_quality: "Drencher \xB7 validation et correction qualit\xE9",
  drencher_products: "Drencher \xB7 gestion des produits",
  drencher_programs: "Drencher \xB7 gestion des programmes",
  drencher_stock: "Drencher \xB7 gestion du stock local",
  drencher_manage: "Drencher \xB7 ancien droit group\xE9 (conserv\xE9, sans effet de gestion)",
  compare: "Comparaison ZAOUIA / DIAF",
  sync: "Synchronisation",
  journal: "Journal"
};

// frontend/src/DrencherPalettePicker.tsx
var import_react6 = require("react");
var import_core7 = require("@mantine/core");
var import_hooks = require("@mantine/hooks");
var import_jsx_runtime7 = require("react/jsx-runtime");
function summarizePalettes(rows) {
  const groups = /* @__PURE__ */ new Map();
  for (const p of rows) {
    const key = JSON.stringify([p.codvar, p.refadh, p.refver]);
    const g = groups.get(key) ?? {
      variete: p.variete,
      adherent: p.adherent,
      verger: p.verger,
      count: 0,
      poids: 0
    };
    g.count++;
    g.poids = g.poids === null || p.poids === null ? null : g.poids + p.poids;
    groups.set(key, g);
  }
  return {
    ids: rows.map((p) => p.numpal),
    count: rows.length,
    poids: rows.every((p) => p.poids !== null) ? rows.reduce((n, p) => n + (p.poids ?? 0), 0) : null,
    receptions: new Set(rows.map((p) => p.numrec)).size,
    groups: Array.from(groups.values()),
    skipped: 0
  };
}
var paletteMerge = (ids, more) => Array.from(/* @__PURE__ */ new Set([...ids, ...more]));
var paletteAvailable = (p, cycleId) => p.cycleAffecte == null || p.cycleAffecte === cycleId;
function DrencherPalettePicker({
  path,
  cycleId,
  ids,
  onCancel,
  onConfirm
}) {
  const [draft, setDraft] = (0, import_react6.useState)(ids), [reception, setReception] = (0, import_react6.useState)(""), [numpal, setNumpal] = (0, import_react6.useState)(""), [search, setSearch] = (0, import_react6.useState)(""), [page, setPage] = (0, import_react6.useState)(1), [pageSize, setPageSize] = (0, import_react6.useState)("50"), [codvar, setCodvar] = (0, import_react6.useState)(null), [refadh, setRefadh] = (0, import_react6.useState)(null), [refver, setRefver] = (0, import_react6.useState)(null), [busy, setBusy] = (0, import_react6.useState)(false), [error, setError] = (0, import_react6.useState)(""), [info, setInfo] = (0, import_react6.useState)("");
  const [query] = (0, import_hooks.useDebouncedValue)(search, 200);
  const filters = useApi(path + "/palettes/filters");
  const args = new URLSearchParams({
    page: String(page),
    pageSize: pageSize ?? "50",
    search: query
  });
  for (const [k, v] of Object.entries({ reception, numpal, codvar, refadh, refver }))
    if (v) args.set(k, String(v));
  const result = useApi(path + "/palettes/choices?" + args.toString());
  const options = (rows) => rows?.map((r) => ({ value: String(r.value), label: r.label })) ?? [];
  async function allLot() {
    if (!reception) {
      setError("Indiquer un num\xE9ro de r\xE9ception.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const s = await api(path + "/palettes/selection", "POST", {
        cycleId,
        ids: draft,
        ajouterLot: Number(reception)
      });
      setDraft(s.ids);
      setInfo(
        `${s.count} palettes s\xE9lectionn\xE9es. ${s.skipped} palettes indisponibles du lot exclues.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "S\xE9lection impossible.");
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    setBusy(true);
    setError("");
    try {
      onConfirm(
        await api(path + "/palettes/selection", "POST", { cycleId, ids: draft })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confirmation impossible.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
    import_core7.Modal,
    {
      opened: true,
      onClose: () => {
        if (!busy) onCancel();
      },
      title: "S\xE9lectionner les palettes",
      size: "95%",
      centered: true,
      children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Stack, { children: [
        error ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Alert, { color: "red", children: error }) : null,
        info ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Alert, { color: "blue", children: info }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Group, { align: "end", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.NumberInput,
            {
              label: "Num\xE9ro de r\xE9ception",
              min: 1,
              value: reception,
              onChange: (v) => {
                setReception(v);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.NumberInput,
            {
              label: "Num\xE9ro de palette",
              min: 1,
              value: numpal,
              onChange: (v) => {
                setNumpal(v);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.TextInput,
            {
              label: "Recherche rapide",
              value: search,
              onChange: (e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.Select,
            {
              label: "Vari\xE9t\xE9",
              searchable: true,
              clearable: true,
              value: codvar,
              data: options(filters.data?.varietes),
              onChange: (v) => {
                setCodvar(v);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.Select,
            {
              label: "Producteur / adh\xE9rent",
              searchable: true,
              clearable: true,
              value: refadh,
              data: options(filters.data?.adherents),
              onChange: (v) => {
                setRefadh(v);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.Select,
            {
              label: "Verger",
              searchable: true,
              clearable: true,
              value: refver,
              data: options(filters.data?.vergers),
              onChange: (v) => {
                setRefver(v);
                setPage(1);
              }
            }
          )
        ] }),
        result.error || filters.error ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Alert, { color: "red", children: result.error || filters.error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Group, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              import_core7.Button,
              {
                variant: "light",
                disabled: busy || !result.data,
                onClick: () => setDraft(
                  (old) => paletteMerge(
                    old,
                    result.data.rows.filter((p) => paletteAvailable(p, cycleId)).map((p) => p.numpal)
                  )
                ),
                children: "S\xE9lectionner la page"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              import_core7.Button,
              {
                variant: "light",
                loading: busy,
                disabled: !reception,
                onClick: () => void allLot(),
                children: "Toutes les palettes disponibles du lot"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Button, { variant: "subtle", disabled: busy, onClick: () => setDraft([]), children: "Retirer toute la s\xE9lection" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Badge, { children: [
            draft.length,
            " s\xE9lectionn\xE9es"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.ScrollContainer, { minWidth: 900, h: 430, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Table, { stickyHeader: true, striped: true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Tr, { children: [
            "",
            "R\xE9ception",
            "Palette",
            "Vari\xE9t\xE9",
            "Producteur / adh\xE9rent",
            "Verger",
            "Poids (kg)",
            "Disponibilit\xE9"
          ].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Th, { children: h }, i)) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Tbody, { children: result.data?.rows.map((p) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              import_core7.Checkbox,
              {
                "aria-label": `Palette ${p.numpal}`,
                disabled: busy || !paletteAvailable(p, cycleId) && !draft.includes(p.numpal),
                checked: draft.includes(p.numpal),
                onChange: (e) => {
                  const selected = e.currentTarget.checked;
                  setDraft(
                    (old) => selected ? paletteMerge(old, [p.numpal]) : old.filter((n) => n !== p.numpal)
                  );
                }
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: p.numrec }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: p.numpal }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: p.variete ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: p.adherent ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: p.verger ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: number(p.poids) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Table.Td, { children: p.cycleAffecte ? `Cycle #${p.cycleAffecte} (${p.etatCycle})${p.cycleAffecte === cycleId ? " \xB7 ce cycle" : ""}` : "Disponible" })
          ] }, p.numpal)) })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.Pagination,
            {
              value: page,
              onChange: setPage,
              total: Math.max(1, Math.ceil((result.data?.total ?? 0) / Number(pageSize)))
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            import_core7.Select,
            {
              label: "Palettes par page",
              value: pageSize,
              data: ["25", "50"],
              onChange: (v) => {
                setPageSize(v);
                setPage(1);
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Text, { size: "sm", c: "dimmed", children: "La s\xE9lection reste conserv\xE9e entre les pages et les r\xE9ceptions. Les palettes sont r\xE9serv\xE9es \xE0 l'enregistrement du brouillon ; l'API recontr\xF4le les conflits." }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_core7.Group, { justify: "end", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Button, { variant: "default", disabled: busy, onClick: onCancel, children: "Annuler" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_core7.Button, { loading: busy, onClick: () => void confirm(), children: "Confirmer la s\xE9lection" })
        ] })
      ] })
    }
  );
}

// frontend/src/DrencherEditor.tsx
var import_react7 = require("react");
var import_core8 = require("@mantine/core");
var import_jsx_runtime8 = require("react/jsx-runtime");
var numeric = (v) => Number(v) || 0;
var nullable = (v) => v === "" ? null : Number(v);
function DrencherEditor({
  path,
  catalog,
  initial,
  onCancel,
  onSaved
}) {
  const s = initial?.revisions[0]?.snapshot;
  const [form, setForm] = (0, import_react7.useState)(() => ({
    version: initial?.version ?? 0,
    date: s?.date ?? today(),
    debut: s?.debut ?? "08:00",
    fin: s?.fin ?? "09:00",
    programmeId: s?.programmeId ?? 0,
    programmeVersion: s?.programmeVersion ?? 0,
    eauInitiale: s?.eauInitiale ?? 0,
    eauConsommee: s?.eauConsommee ?? 0,
    palettes: s?.palettes.map((p) => p.numpal) ?? [],
    produits: s?.produits.map((p) => ({
      produitId: p.produitId,
      dose: p.dose,
      machine: p.machine,
      reel: p.reel,
      lots: p.lots.map((l) => ({ lotId: l.lotId, quantite: l.quantite }))
    })) ?? [],
    observations: s?.observations ?? "",
    motif: ""
  }));
  const [selected, setSelected] = (0, import_react7.useState)(s?.palettes.map((p) => p.numpal) ?? []), [summary, setSummary] = (0, import_react7.useState)(
    s ? summarizePalettes(s.palettes) : null
  ), [picker, setPicker] = (0, import_react7.useState)(false), [extra, setExtra] = (0, import_react7.useState)(null), [error, setError] = (0, import_react7.useState)(""), [busy, setBusy] = (0, import_react7.useState)(false);
  const correction = initial?.statut === "Valid\xE9" || initial?.statut === "En attente de validation";
  function change(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function usage(index, value) {
    setForm((f) => ({
      ...f,
      produits: f.produits.map((p, i) => i === index ? { ...p, ...value } : p)
    }));
  }
  function chooseProgram(id) {
    const p = catalog.programmes.find((p2) => p2.id === Number(id));
    if (!p) return;
    setForm((f) => {
      const retained = f.produits.filter((u) => (u.reel ?? 0) > 0 || (u.machine ?? 0) > 0);
      return {
        ...f,
        programmeId: p.id,
        programmeVersion: p.version,
        produits: [
          ...p.produits.map(
            (d) => retained.find((u) => u.produitId === d.produitId) ?? {
              produitId: d.produitId,
              dose: d.dose,
              machine: null,
              reel: null,
              lots: []
            }
          ),
          ...retained.filter((u) => !p.produits.some((d) => d.produitId === u.produitId))
        ]
      };
    });
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const result = await api(
        path + `/cycles${initial ? `/${initial.id}${correction ? "/correct" : ""}` : ""}`,
        initial && !correction ? "PUT" : "POST",
        { ...form, palettes: selected }
      );
      onSaved(result.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Title, { order: 3, children: correction ? "Corriger le cycle valid\xE9" : initial ? "Modifier le cycle" : "Nouveau cycle" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Button, { variant: "default", onClick: onCancel, children: "Retour" })
    ] }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Alert, { color: "red", children: error }) : null,
    correction ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Alert, { color: "orange", children: "Correction qualit\xE9 : motif obligatoire, palettes conserv\xE9es, ajustement du stock et historique pr\xE9serv\xE9." }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Alert, { color: "blue", children: "L'enregistrement conserve un brouillon sans sortie de stock. La soumission d\xE9duit le stock r\xE9el ; la qualit\xE9 valide ensuite le cycle. Toute modification d'un cycle en attente le remet en brouillon." }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Paper, { withBorder: true, p: "md", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.SimpleGrid, { cols: { base: 1, sm: 3 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        import_core8.TextInput,
        {
          type: "date",
          label: "Date du traitement",
          value: form.date,
          onChange: (e) => change("date", e.currentTarget.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        import_core8.TextInput,
        {
          type: "time",
          label: "D\xE9but",
          value: form.debut,
          onChange: (e) => change("debut", e.currentTarget.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        import_core8.TextInput,
        {
          type: "time",
          label: "Fin (m\xEAme jour)",
          value: form.fin,
          onChange: (e) => change("fin", e.currentTarget.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Group, { justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Title, { order: 4, children: "R\xE9ceptions & palettes" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Badge, { children: [
          selected.length,
          " s\xE9lectionn\xE9es"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Group, { mt: "sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Text, { children: [
          "Poids total : ",
          number(summary?.poids),
          " kg"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Text, { children: [
          "R\xE9ceptions : ",
          summary?.receptions ?? 0
        ] }),
        !correction ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Button, { onClick: () => setPicker(true), children: selected.length ? "Modifier la s\xE9lection" : "S\xE9lectionner les palettes" }) : null
      ] }),
      summary?.groups.length ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table, { mt: "sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Th, { children: "Vari\xE9t\xE9" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Th, { children: "Producteur / adh\xE9rent" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Th, { children: "Verger" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Th, { children: "Palettes" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Th, { children: "Poids kg" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Tbody, { children: summary.groups.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: g.variete ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: g.adherent ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: g.verger ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: g.count }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: number(g.poids) })
        ] }, i)) })
      ] }) : null
    ] }),
    picker ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      DrencherPalettePicker,
      {
        path,
        cycleId: initial?.id,
        ids: selected,
        onCancel: () => setPicker(false),
        onConfirm: (v) => {
          setSelected(v.ids);
          setSummary(v);
          setPicker(false);
        }
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.SimpleGrid, { cols: { base: 1, sm: 3 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          import_core8.Select,
          {
            label: "Programme de traitement",
            searchable: true,
            value: form.programmeId ? String(form.programmeId) : null,
            data: catalog.programmes.filter((p) => p.actif || p.id === form.programmeId).map((p) => ({ value: String(p.id), label: `${p.nom} \xB7 v${p.version}` })),
            onChange: chooseProgram
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          import_core8.NumberInput,
          {
            label: "Eau initiale (L)",
            min: 0,
            decimalScale: 6,
            value: form.eauInitiale,
            onChange: (v) => change("eauInitiale", numeric(v))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          import_core8.NumberInput,
          {
            label: "Eau totale consomm\xE9e (L)",
            min: 0,
            decimalScale: 6,
            value: form.eauConsommee,
            onChange: (v) => change("eauConsommee", numeric(v))
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Text, { size: "xs", c: "dimmed", mt: "sm", children: [
        "Version appliqu\xE9e au cycle : ",
        form.programmeVersion || "\u2014",
        ". Les consommations d\xE9j\xE0 saisies sont conserv\xE9es lors d\u2019un changement de programme pour examen qualit\xE9."
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Title, { order: 4, children: "Produits & consommations" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.ScrollContainer, { minWidth: 1080, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Tr, { children: [
          "Produit",
          "Dose / 1000 L",
          "Initial calcul\xE9",
          "Final th\xE9orique",
          "Machine",
          "R\xE9el physique",
          "\xC9carts r\xE9el",
          "Lots fabricants / quantit\xE9s"
        ].map((h) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Th, { children: h }, h)) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Tbody, { children: form.produits.map((p, i) => {
          const ref = catalog.produits.find((r) => r.id === p.produitId), unit = ref?.unite ?? "", initialAmount = amount(form.eauInitiale, p.dose), final = amount(form.eauConsommee, p.dose);
          return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table.Td, { children: [
              ref?.nom,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Text, { size: "xs", children: unit })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              import_core8.NumberInput,
              {
                "aria-label": `Dosage ${ref?.nom}`,
                min: 0,
                w: 110,
                decimalScale: 6,
                value: p.dose,
                onChange: (v) => usage(i, { dose: numeric(v) })
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table.Td, { children: [
              number(initialAmount),
              " ",
              unit
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table.Td, { children: [
              number(final),
              " ",
              unit
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              import_core8.NumberInput,
              {
                "aria-label": `Machine ${ref?.nom}`,
                min: 0,
                w: 100,
                decimalScale: 6,
                value: p.machine ?? "",
                onChange: (v) => usage(i, { machine: nullable(v) })
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              import_core8.NumberInput,
              {
                "aria-label": `R\xE9el ${ref?.nom}`,
                min: 0,
                w: 100,
                decimalScale: 6,
                value: p.reel ?? "",
                onChange: (v) => usage(i, { reel: nullable(v) })
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Table.Td, { children: [
              "Th\xE9orie : ",
              number(p.reel === null ? null : p.reel - final),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("br", {}),
              "Machine :",
              " ",
              number(p.reel === null || p.machine === null ? null : p.reel - p.machine)
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Stack, { gap: "xs", children: [
              p.lots.map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Group, { gap: "xs", wrap: "nowrap", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  import_core8.Select,
                  {
                    "aria-label": `Lot ${ref?.nom} ${j + 1}`,
                    searchable: true,
                    w: 210,
                    value: l.lotId ? String(l.lotId) : null,
                    data: catalog.lots.filter((lot) => lot.produitId === p.produitId).map((lot) => ({
                      value: String(lot.id),
                      label: `${lot.lot} \xB7 stock ${number(lot.solde)} ${unit}`
                    })),
                    onChange: (v) => usage(i, {
                      lots: p.lots.map(
                        (r, k) => k === j ? { ...r, lotId: Number(v) } : r
                      )
                    })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  import_core8.NumberInput,
                  {
                    "aria-label": `Quantit\xE9 lot ${j + 1}`,
                    w: 100,
                    min: 0,
                    decimalScale: 6,
                    value: l.quantite,
                    onChange: (v) => usage(i, {
                      lots: p.lots.map(
                        (r, k) => k === j ? { ...r, quantite: numeric(v) } : r
                      )
                    })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  import_core8.Button,
                  {
                    variant: "subtle",
                    "aria-label": "Retirer cette r\xE9partition",
                    onClick: () => usage(i, { lots: p.lots.filter((_, k) => k !== j) }),
                    children: "\xD7"
                  }
                )
              ] }, j)),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                import_core8.Button,
                {
                  variant: "light",
                  size: "xs",
                  onClick: () => usage(i, {
                    lots: [
                      ...p.lots,
                      { lotId: 0, quantite: p.lots.length ? 0 : p.reel ?? 0 }
                    ]
                  }),
                  children: "Ajouter un lot"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Text, { size: "xs", children: [
                "R\xE9parti : ",
                number(p.lots.reduce((n, l) => n + l.quantite, 0)),
                " ",
                unit
              ] })
            ] }) })
          ] }, p.produitId);
        }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Group, { mt: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          import_core8.Select,
          {
            label: "Produit suppl\xE9mentaire r\xE9ellement utilis\xE9",
            searchable: true,
            clearable: true,
            value: extra,
            onChange: setExtra,
            data: catalog.produits.filter((p) => p.actif && !form.produits.some((u) => u.produitId === p.id)).map((p) => ({ value: String(p.id), label: p.nom }))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          import_core8.Button,
          {
            mt: "lg",
            disabled: !extra,
            variant: "light",
            onClick: () => {
              change("produits", [
                ...form.produits,
                { produitId: Number(extra), dose: 0, machine: null, reel: null, lots: [] }
              ]);
              setExtra(null);
            },
            children: "Ajouter ce produit"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      import_core8.Textarea,
      {
        label: "Observations / \xE9carts de traitement",
        maxLength: 2e3,
        value: form.observations,
        onChange: (e) => change("observations", e.currentTarget.value)
      }
    ),
    correction ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      import_core8.Textarea,
      {
        label: "Motif obligatoire de correction",
        maxLength: 1e3,
        value: form.motif,
        onChange: (e) => change("motif", e.currentTarget.value)
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_core8.Group, { justify: "end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Button, { variant: "default", onClick: onCancel, children: "Annuler" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_core8.Button, { loading: busy, onClick: () => void save(), children: correction ? "Enregistrer la correction & ajuster le stock" : "Enregistrer le brouillon" })
    ] })
  ] });
}

// frontend/src/DrencherManagement.tsx
var import_core12 = require("@mantine/core");

// frontend/src/DrencherProducts.tsx
var import_react8 = require("react");
var import_core9 = require("@mantine/core");
var import_notifications = require("@mantine/notifications");
var import_jsx_runtime9 = require("react/jsx-runtime");
var empty = {
  id: 0,
  reference: "",
  nom: "",
  unite: "L",
  actif: true,
  matiereActive: "",
  afficherF04: true
};
function DrencherProducts({ path, catalog, canAdd, canModify, refresh }) {
  const [search, setSearch] = (0, import_react8.useState)(""), [status, setStatus] = (0, import_react8.useState)(null), [page, setPage] = (0, import_react8.useState)(1), [form, setForm] = (0, import_react8.useState)(null), [busy, setBusy] = (0, import_react8.useState)(false), [error, setError] = (0, import_react8.useState)("");
  const q = search.trim().toLocaleLowerCase("fr");
  const rows = catalog.produits.filter(
    (p) => (!status || p.actif === (status === "actif")) && (p.reference + " " + p.nom).toLocaleLowerCase("fr").includes(q)
  );
  async function save(p) {
    setBusy(true);
    setError("");
    try {
      await api(path + "/products", "POST", p);
      setForm(null);
      import_notifications.notifications.show({
        color: "green",
        title: "Produits Drencher",
        message: p.id ? "Produit mis \xE0 jour." : "Produit ajout\xE9."
      });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Title, { order: 4, children: "Produits enregistr\xE9s" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Text, { size: "sm", c: "dimmed", children: "R\xE9f\xE9rentiel commun \xB7 r\xE9f\xE9rences et unit\xE9s conserv\xE9es apr\xE8s cr\xE9ation." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        import_core9.Button,
        {
          disabled: !canAdd,
          onClick: () => {
            setForm({ ...empty });
            setError("");
          },
          children: "Ajouter un produit"
        }
      )
    ] }),
    !form && error ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Alert, { color: "red", children: error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        import_core9.TextInput,
        {
          label: "Recherche par r\xE9f\xE9rence ou nom",
          value: search,
          onChange: (e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          },
          flex: 1
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        import_core9.Select,
        {
          label: "Statut du produit",
          clearable: true,
          value: status,
          onChange: (v) => {
            setStatus(v);
            setPage(1);
          },
          data: [
            { value: "actif", label: "Actifs" },
            { value: "inactif", label: "Inactifs" }
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Badge, { variant: "light", children: [
        rows.length,
        " produits"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.ScrollContainer, { minWidth: 620, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Table, { striped: true, highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Tr, { children: ["R\xE9f\xE9rence", "Produit", "Mati\xE8re active", "F04", "Unit\xE9", "Statut", "Actions"].map(
        (h) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Th, { children: h }, h)
      ) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Tbody, { children: rows.slice((page - 1) * 25, page * 25).map((p) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Td, { children: p.reference }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Td, { fw: 600, children: p.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Td, { children: p.matiereActive || "Non renseign\xE9e" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Td, { children: p.afficherF04 === false ? "Masqu\xE9" : "Affich\xE9" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Td, { children: p.unite }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Badge, { color: p.actif ? "green" : "gray", children: p.actif ? "Actif" : "Inactif" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Group, { gap: "xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            import_core9.Button,
            {
              size: "xs",
              variant: "light",
              disabled: !canModify || busy,
              onClick: () => {
                setForm({ ...p });
                setError("");
              },
              children: "Modifier"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
            import_core9.Button,
            {
              size: "xs",
              variant: "subtle",
              color: p.actif ? "orange" : "green",
              disabled: !canModify || busy,
              onClick: () => void save({ ...p, actif: !p.actif }),
              children: p.actif ? "D\xE9sactiver" : "R\xE9activer"
            }
          )
        ] }) })
      ] }, p.id)) })
    ] }) }),
    !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Text, { c: "dimmed", children: "Aucun produit ne correspond \xE0 cette recherche." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      import_core9.Pagination,
      {
        value: page,
        onChange: setPage,
        total: Math.max(1, Math.ceil(rows.length / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
      import_core9.Modal,
      {
        opened: form !== null,
        onClose: () => {
          if (!busy) setForm(null);
        },
        title: form?.id ? "Modifier le produit" : "Ajouter un produit",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Alert, { color: "red", children: error }) : null,
          form ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              import_core9.TextInput,
              {
                label: "R\xE9f\xE9rence",
                required: true,
                disabled: form.id !== 0 || busy,
                maxLength: 40,
                value: form.reference,
                onChange: (e) => {
                  const value = e.currentTarget.value;
                  setForm((p) => p ? { ...p, reference: value } : p);
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              import_core9.TextInput,
              {
                label: "Nom du produit",
                required: true,
                maxLength: 120,
                disabled: busy,
                value: form.nom,
                onChange: (e) => {
                  const value = e.currentTarget.value;
                  setForm((p) => p ? { ...p, nom: value } : p);
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.SimpleGrid, { cols: 2, children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                import_core9.Select,
                {
                  label: "Unit\xE9",
                  required: true,
                  disabled: form.id !== 0 || busy,
                  value: form.unite,
                  data: ["L", "kg", "g", "mL"],
                  onChange: (v) => setForm((p) => p ? { ...p, unite: v ?? "L" } : p)
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                import_core9.TextInput,
                {
                  label: "Mati\xE8re active",
                  maxLength: 255,
                  disabled: busy,
                  value: form.matiereActive ?? "",
                  onChange: (e) => {
                    const value = e.currentTarget.value;
                    setForm((p) => p ? { ...p, matiereActive: value } : p);
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                import_core9.Checkbox,
                {
                  label: "Afficher dans le F04 imprimable",
                  disabled: busy,
                  checked: form.afficherF04 !== false,
                  onChange: (e) => {
                    const value = e.currentTarget.checked;
                    setForm((p) => p ? { ...p, afficherF04: value } : p);
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Text, { size: "sm", c: "dimmed", children: "Ces param\xE8tres sont conserv\xE9s dans chaque nouveau cycle. Les cycles existants gardent leurs param\xE8tres ; un produit masqu\xE9 reste comptabilis\xE9 en stock." }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                import_core9.Checkbox,
                {
                  label: "Produit actif",
                  mt: "xl",
                  disabled: busy,
                  checked: form.actif,
                  onChange: (e) => {
                    const value = e.currentTarget.checked;
                    setForm((p) => p ? { ...p, actif: value } : p);
                  }
                }
              )
            ] }),
            form.id ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Text, { size: "xs", c: "dimmed", children: "La r\xE9f\xE9rence et l'unit\xE9 sont immuables. La d\xE9sactivation conserve les usages et l'historique." }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_core9.Group, { justify: "end", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_core9.Button, { variant: "default", disabled: busy, onClick: () => setForm(null), children: "Annuler" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
                import_core9.Button,
                {
                  loading: busy,
                  disabled: !(form.id ? canModify : canAdd),
                  onClick: () => void save(form),
                  children: "Enregistrer"
                }
              )
            ] })
          ] }) : null
        ] })
      }
    )
  ] });
}

// frontend/src/DrencherPrograms.tsx
var import_react9 = require("react");
var import_core10 = require("@mantine/core");
var import_notifications2 = require("@mantine/notifications");
var import_jsx_runtime10 = require("react/jsx-runtime");
var empty2 = { id: 0, version: 0, nom: "", actif: true, produits: [] };
function DrencherPrograms({ path, catalog, canAdd, canModify, refresh }) {
  const [stateProgram, setStateProgram] = (0, import_react9.useState)(null);
  const [search, setSearch] = (0, import_react9.useState)(""), [status, setStatus] = (0, import_react9.useState)(null), [page, setPage] = (0, import_react9.useState)(1), [form, setForm] = (0, import_react9.useState)(null), [selected, setSelected] = (0, import_react9.useState)(null), [version, setVersion] = (0, import_react9.useState)(null), [error, setError] = (0, import_react9.useState)(""), [busy, setBusy] = (0, import_react9.useState)(false);
  const history = useApi(selected ? path + `/programs/${selected}/versions` : null);
  const current = history.data?.find((v) => String(v.version) === version) ?? history.data?.[0];
  const rows = catalog.programmes.filter(
    (p) => (!status || p.actif === (status === "actif")) && p.nom.toLocaleLowerCase("fr").includes(search.trim().toLocaleLowerCase("fr"))
  );
  async function changeState() {
    if (!stateProgram) return;
    setBusy(true);
    setError("");
    try {
      await api(path + `/programs/${stateProgram.id}/state`, "POST", {
        version: stateProgram.version,
        actif: !stateProgram.actif,
        confirmation: `DESACTIVER PROGRAMME ${stateProgram.id}`
      });
      setStateProgram(null);
      refresh();
      history.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Op\xE9ration impossible.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!form) return;
    setBusy(true);
    setError("");
    try {
      await api(path + "/programs", "POST", form);
      setForm(null);
      import_notifications2.notifications.show({
        color: "green",
        title: "Programmes Drencher",
        message: "Nouvelle version enregistr\xE9e. Les cycles existants sont conserv\xE9s."
      });
      refresh();
      history.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Title, { order: 4, children: "Programmes de traitement" }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Text, { size: "sm", c: "dimmed", children: "Chaque enregistrement cr\xE9e une version ; les dosages des cycles restent inchang\xE9s." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_core10.Button,
        {
          disabled: !canAdd,
          onClick: () => {
            setForm({ ...empty2, produits: [] });
            setError("");
          },
          children: "Ajouter un programme"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_core10.TextInput,
        {
          label: "Rechercher un programme",
          flex: 1,
          value: search,
          onChange: (e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_core10.Select,
        {
          label: "Statut du programme",
          clearable: true,
          value: status,
          onChange: (v) => {
            setStatus(v);
            setPage(1);
          },
          data: [
            { value: "actif", label: "Actifs" },
            { value: "inactif", label: "Inactifs" }
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.ScrollContainer, { minWidth: 600, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table, { striped: true, highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Tr, { children: ["Programme", "Statut", "Version", "Produits", "Actions"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Th, { children: h }, h)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Tbody, { children: rows.slice((page - 1) * 25, page * 25).map((p) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Td, { fw: 600, children: p.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Badge, { color: p.actif ? "green" : "gray", children: p.actif ? "Actif" : "Inactif" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Td, { children: [
          "v",
          p.version
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Td, { children: p.produits.length }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Group, { gap: "xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            import_core10.Button,
            {
              size: "xs",
              variant: "light",
              disabled: !canModify || busy,
              onClick: () => {
                setError("");
                setStateProgram(p);
              },
              children: p.actif ? "D\xE9sactiver" : "Activer"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            import_core10.Button,
            {
              size: "xs",
              variant: "light",
              onClick: () => {
                setSelected(p.id);
                setVersion(null);
              },
              children: "Consulter les versions"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            import_core10.Button,
            {
              size: "xs",
              disabled: !canModify,
              variant: "subtle",
              onClick: () => {
                setForm({ ...p, produits: p.produits.map((d) => ({ ...d })) });
                setError("");
              },
              children: "Modifier"
            }
          )
        ] }) })
      ] }, p.id)) })
    ] }) }),
    !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Text, { c: "dimmed", children: "Aucun programme ne correspond \xE0 cette recherche." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      import_core10.Pagination,
      {
        value: page,
        onChange: setPage,
        total: Math.max(1, Math.ceil(rows.length / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      import_core10.Modal,
      {
        opened: form !== null,
        onClose: () => {
          if (!busy) setForm(null);
        },
        title: form?.id ? "Enregistrer une nouvelle version" : "Ajouter un programme",
        size: "lg",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Alert, { color: "red", children: error }) : null,
          form ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              import_core10.TextInput,
              {
                label: "Nom du programme",
                required: true,
                disabled: busy,
                value: form.nom,
                maxLength: 120,
                onChange: (e) => {
                  const value = e.currentTarget.value;
                  setForm((p) => p ? { ...p, nom: value } : p);
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              import_core10.Checkbox,
              {
                label: "Programme actif",
                disabled: busy,
                checked: form.actif,
                onChange: (e) => {
                  const value = e.currentTarget.checked;
                  setForm((p) => p ? { ...p, actif: value } : p);
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Th, { children: "Produit" }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Th, { children: "Dose (unit\xE9 / 1000 L eau)" }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Th, { children: "Actions" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Tbody, { children: form.produits.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  import_core10.Select,
                  {
                    "aria-label": `Produit ligne ${i + 1}`,
                    searchable: true,
                    disabled: busy,
                    value: d.produitId ? String(d.produitId) : null,
                    data: catalog.produits.filter((p) => p.actif || p.id === d.produitId).map((p) => ({
                      value: String(p.id),
                      label: p.nom + " \xB7 " + p.unite + (p.actif ? "" : " \xB7 Inactif")
                    })),
                    onChange: (v) => setForm(
                      (p) => p ? {
                        ...p,
                        produits: p.produits.map(
                          (r, j) => i === j ? { ...r, produitId: Number(v) } : r
                        )
                      } : p
                    )
                  }
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  import_core10.NumberInput,
                  {
                    "aria-label": `Dosage ligne ${i + 1}`,
                    disabled: busy,
                    min: 0,
                    decimalScale: 6,
                    value: d.dose,
                    onChange: (v) => setForm(
                      (p) => p ? {
                        ...p,
                        produits: p.produits.map(
                          (r, j) => i === j ? { ...r, dose: Number(v) || 0 } : r
                        )
                      } : p
                    )
                  }
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  import_core10.Button,
                  {
                    size: "xs",
                    color: "red",
                    variant: "subtle",
                    disabled: busy,
                    onClick: () => setForm(
                      (p) => p ? { ...p, produits: p.produits.filter((_, j) => i !== j) } : p
                    ),
                    children: "Retirer"
                  }
                ) })
              ] }, i)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              import_core10.Button,
              {
                variant: "light",
                disabled: busy || form.produits.length >= 30,
                onClick: () => setForm(
                  (p) => p ? { ...p, produits: [...p.produits, { produitId: 0, dose: 0 }] } : p
                ),
                children: "Ajouter une ligne produit"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Alert, { children: [
              "Version \xE0 enregistrer : ",
              form.version + 1,
              ". Aucune modification r\xE9troactive des cycles ou des versions ant\xE9rieures."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Group, { justify: "end", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Button, { variant: "default", disabled: busy, onClick: () => setForm(null), children: "Annuler" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                import_core10.Button,
                {
                  loading: busy,
                  disabled: !(form.id ? canModify : canAdd),
                  onClick: () => void save(),
                  children: "Enregistrer la version"
                }
              )
            ] })
          ] }) : null
        ] })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      import_core10.Modal,
      {
        opened: stateProgram !== null,
        onClose: () => {
          if (!busy) setStateProgram(null);
        },
        title: stateProgram?.actif ? "D\xE9sactiver le programme ?" : "Activer le programme ?",
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Alert, { color: "red", children: error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Text, { children: [
            stateProgram?.nom,
            " : une nouvelle version sera cr\xE9\xE9e, sans changer les cycles ant\xE9rieurs."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Group, { justify: "end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Button, { variant: "default", disabled: busy, onClick: () => setStateProgram(null), children: "Annuler" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Button, { loading: busy, disabled: !canModify, onClick: () => void changeState(), children: "Confirmer" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      import_core10.Drawer,
      {
        opened: selected !== null,
        onClose: () => setSelected(null),
        title: "Produits, dosages et versions du programme",
        position: "right",
        size: "lg",
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Stack, { children: [
          history.error ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Alert, { color: "red", children: history.error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
            import_core10.Select,
            {
              label: "Version \xE0 consulter",
              value: current ? String(current.version) : null,
              onChange: setVersion,
              data: (history.data ?? []).map((v) => ({
                value: String(v.version),
                label: `Version ${v.version} \xB7 ${drDateText(v.dateCreation)}`
              }))
            }
          ),
          current ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Title, { order: 4, children: [
              current.programme.nom,
              " \xB7 v",
              current.version
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Badge, { color: current.programme.actif ? "green" : "gray", children: current.programme.actif ? "Actif" : "Inactif" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Text, { size: "sm", children: [
              current.auteur,
              " \xB7 ",
              current.dateCreation
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Th, { children: "Produit / r\xE9f\xE9rence" }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Th, { children: "Dosage appliqu\xE9" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Table.Tbody, { children: current.programme.produits.map((d) => {
                const p = catalog.produits.find((p2) => p2.id === d.produitId);
                return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Tr, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Td, { children: [
                    p?.nom ?? "Produit #" + d.produitId,
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Text, { size: "xs", c: "dimmed", children: p?.reference ?? "\u2014" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_core10.Table.Td, { children: [
                    number(d.dose),
                    " ",
                    p?.unite ?? "",
                    " / 1000 L"
                  ] })
                ] }, d.produitId);
              }) })
            ] })
          ] }) : history.loading ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_core10.Text, { children: "Chargement des versions\u2026" }) : null
        ] })
      }
    )
  ] });
}

// frontend/src/DrencherStock.tsx
var import_react10 = require("react");
var import_core11 = require("@mantine/core");
var import_hooks2 = require("@mantine/hooks");
var import_notifications3 = require("@mantine/notifications");
var import_jsx_runtime11 = require("react/jsx-runtime");
var empty3 = () => ({
  produitId: 0,
  lot: "",
  peremption: "",
  quantite: 0,
  bon: "",
  date: today()
});
function DrencherStock({ path, catalog, canAdd, refresh }) {
  const [search, setSearch] = (0, import_react10.useState)(""), [filter, setFilter] = (0, import_react10.useState)(null), [available, setAvailable] = (0, import_react10.useState)(null), [nature, setNature] = (0, import_react10.useState)(null), [page, setPage] = (0, import_react10.useState)(1), [opened, setOpened] = (0, import_react10.useState)(false), [entry, setEntry] = (0, import_react10.useState)(empty3), [error, setError] = (0, import_react10.useState)(""), [busy, setBusy] = (0, import_react10.useState)(false), [lotPage, setLotPage] = (0, import_react10.useState)(1);
  const [query] = (0, import_hooks2.useDebouncedValue)(search, 200);
  const movements = useApi(
    path + `/stock?page=${page}&search=${encodeURIComponent(query)}${filter ? `&produitId=${filter}` : ""}${nature ? `&nature=${encodeURIComponent(nature)}` : ""}`
  );
  const q = search.trim().toLocaleLowerCase("fr");
  const lots = catalog.lots.filter(
    (l) => (!filter || l.produitId === Number(filter)) && (!available || (available === "positif" ? l.solde > 0 : l.solde === 0)) && (l.nom + " " + l.lot + " " + (catalog.produits.find((p) => p.id === l.produitId)?.reference ?? "")).toLocaleLowerCase("fr").includes(q)
  );
  const products = catalog.produits.map((p) => ({ ...p, lots: catalog.lots.filter((l) => l.produitId === p.id) })).filter(
    (p) => (!filter || p.id === Number(filter)) && (p.nom + " " + p.reference + " " + p.lots.map((l) => l.lot).join(" ")).toLocaleLowerCase("fr").includes(q)
  ).filter(
    (p) => p.lots.length && (!available || (available === "positif" ? p.lots.some((l) => l.solde > 0) : p.lots.every((l) => l.solde === 0)))
  );
  async function receive() {
    setBusy(true);
    setError("");
    try {
      await api(path + "/stock", "POST", entry);
      setOpened(false);
      setEntry(empty3());
      import_notifications3.notifications.show({
        color: "green",
        title: "Stock Drencher",
        message: "R\xE9ception enregistr\xE9e avec son bon magasin."
      });
      refresh();
      movements.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "R\xE9ception impossible.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Title, { order: 4, children: "Stock local Drencher" }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Text, { size: "sm", c: "dimmed", children: "Disponibilit\xE9s par produit et lot fabricant \xB7 sorties apr\xE8s validation qualit\xE9." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Group, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(DrencherStockDocuments, { path, catalog }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          import_core11.Button,
          {
            disabled: !canAdd,
            onClick: () => {
              setEntry(empty3());
              setError("");
              setOpened(true);
            },
            children: "R\xE9ceptionner des produits"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        import_core11.TextInput,
        {
          label: "Rechercher produit, r\xE9f\xE9rence, lot ou bon",
          flex: 1,
          value: search,
          onChange: (e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
            setLotPage(1);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        import_core11.Select,
        {
          label: "Produit en stock",
          clearable: true,
          searchable: true,
          value: filter,
          onChange: (v) => {
            setFilter(v);
            setPage(1);
            setLotPage(1);
          },
          data: catalog.produits.map((p) => ({ value: String(p.id), label: p.nom }))
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        import_core11.Select,
        {
          label: "Disponibilit\xE9",
          clearable: true,
          value: available,
          onChange: (v) => {
            setAvailable(v);
            setLotPage(1);
          },
          data: [
            { value: "positif", label: "Stock disponible" },
            { value: "zero", label: "Stock \xE9puis\xE9" }
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.ScrollContainer, { minWidth: 580, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table, { striped: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Tr, { children: ["R\xE9f\xE9rence", "Produit", "Disponible", "Lots fabricants"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Th, { children: h }, h)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Tbody, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { children: p.reference }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { fw: 600, children: p.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Td, { children: [
          number(p.lots.reduce((n, l) => n + l.solde, 0)),
          " ",
          p.unite
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { children: p.lots.length })
      ] }, p.id)) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Title, { order: 5, children: "D\xE9tail des lots fabricants" }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.ScrollContainer, { minWidth: 580, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table, { highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Tr, { children: ["Produit", "Lot fabricant", "P\xE9remption", "Quantit\xE9 disponible"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Th, { children: h }, h)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Tbody, { children: lots.slice((lotPage - 1) * 25, lotPage * 25).map((l) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { children: l.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { children: l.lot }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Td, { children: [
          drDateText(l.peremption),
          drExpired(l.peremption, today()) ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Badge, { color: "orange", ml: "xs", children: "P\xE9rim\xE9" }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Td, { children: [
          number(l.solde),
          " ",
          l.unite
        ] })
      ] }, l.id)) })
    ] }) }),
    !lots.length ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Text, { c: "dimmed", children: "Aucun lot ne correspond \xE0 ces filtres." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      import_core11.Pagination,
      {
        value: lotPage,
        onChange: setLotPage,
        total: Math.max(1, Math.ceil(lots.length / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Title, { order: 4, children: "R\xE9ceptions et mouvements" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        import_core11.Select,
        {
          "aria-label": "Filtrer la nature des mouvements",
          placeholder: "Tous les mouvements",
          clearable: true,
          value: nature,
          onChange: (v) => {
            setNature(v);
            setPage(1);
          },
          data: [
            { value: "Entree", label: "R\xE9ceptions magasin" },
            { value: "Soumission consommation", label: "Sorties \xE0 la soumission" },
            { value: "Suppression restitution", label: "Restitutions apr\xE8s suppression" },
            { value: "Consommation", label: "Consommations valid\xE9es" },
            { value: "Correction restitution", label: "Restitutions de correction" },
            { value: "Correction consommation", label: "Consommations de correction" }
          ]
        }
      )
    ] }),
    movements.error ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Alert, { color: "red", children: movements.error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.ScrollContainer, { minWidth: 800, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table, { striped: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Tr, { children: ["Date", "Produit / lot", "Nature / cycle", "Quantit\xE9", "Bon magasin", "Auteur"].map(
        (h) => /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Th, { children: h }, h)
      ) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Tbody, { children: movements.data?.rows.map((m) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { children: drDateText(m.dateReception ?? m.dateCreation) }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Td, { children: [
          m.nom,
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Text, { size: "xs", c: "dimmed", children: m.lot })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Td, { children: [
          m.nature === "Entree" ? "R\xE9ception magasin" : m.nature,
          m.cycleId ? " \xB7 #" + m.cycleId : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Table.Td, { children: [
          number(m.quantite),
          " ",
          m.unite
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { children: m.bon || "\u2014" }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Table.Td, { children: m.auteur })
      ] }, m.id)) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      import_core11.Pagination,
      {
        value: page,
        onChange: setPage,
        total: Math.max(1, Math.ceil((movements.data?.total ?? 0) / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      import_core11.Modal,
      {
        opened,
        onClose: () => {
          if (!busy) setOpened(false);
        },
        title: "R\xE9ception du magasin central",
        size: "lg",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Alert, { color: "red", children: error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.SimpleGrid, { cols: { base: 1, sm: 2 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
              import_core11.TextInput,
              {
                label: "Bon de transfert / sortie magasin",
                required: true,
                disabled: busy,
                maxLength: 100,
                value: entry.bon,
                onChange: (e) => {
                  const bon = e.currentTarget.value;
                  setEntry((r) => ({ ...r, bon }));
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
              import_core11.TextInput,
              {
                type: "date",
                label: "Date de r\xE9ception",
                required: true,
                disabled: busy,
                value: entry.date,
                onChange: (e) => {
                  const date = e.currentTarget.value;
                  setEntry((r) => ({ ...r, date }));
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
              import_core11.Select,
              {
                label: "Produit re\xE7u",
                searchable: true,
                required: true,
                disabled: busy,
                value: entry.produitId ? String(entry.produitId) : null,
                data: catalog.produits.filter((p) => p.actif).map((p) => ({ value: String(p.id), label: p.nom + " \xB7 " + p.unite })),
                onChange: (v) => setEntry((r) => ({ ...r, produitId: Number(v) }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
              import_core11.NumberInput,
              {
                label: `Quantit\xE9 re\xE7ue (${catalog.produits.find((p) => p.id === entry.produitId)?.unite ?? "unit\xE9 produit"})`,
                required: true,
                disabled: busy,
                min: 0,
                decimalScale: 6,
                value: entry.quantite,
                onChange: (v) => setEntry((r) => ({ ...r, quantite: Number(v) || 0 }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
              import_core11.TextInput,
              {
                label: "Lot fabricant",
                required: true,
                disabled: busy,
                maxLength: 100,
                value: entry.lot,
                onChange: (e) => {
                  const lot = e.currentTarget.value;
                  setEntry((r) => ({ ...r, lot }));
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
              import_core11.TextInput,
              {
                type: "date",
                label: "P\xE9remption (si applicable)",
                disabled: busy,
                value: entry.peremption,
                onChange: (e) => {
                  const peremption = e.currentTarget.value;
                  setEntry((r) => ({ ...r, peremption }));
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Text, { size: "sm", c: "dimmed", children: "Un m\xEAme bon et lot ne peut \xEAtre enregistr\xE9 deux fois. Les consommations restent d\xE9duites uniquement apr\xE8s validation qualit\xE9." }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_core11.Group, { justify: "end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Button, { variant: "default", disabled: busy, onClick: () => setOpened(false), children: "Annuler" }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_core11.Button, { loading: busy, disabled: !canAdd, onClick: () => void receive(), children: "Enregistrer la r\xE9ception" })
          ] })
        ] })
      }
    )
  ] });
}

// frontend/src/DrencherManagement.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function DrencherManagement(props) {
  const visible = ["products", "programs", "stock"].filter(
    (k) => props.permissions[k].view
  );
  const active = visible.includes(props.activeTab ?? "") ? props.activeTab : visible[0];
  if (!visible.length) return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_core12.Alert, { children: "Aucun droit de gestion Drencher attribu\xE9." });
  const rights = (key) => ({
    ...props,
    canAdd: props.permissions[key].add,
    canModify: props.permissions[key].modify
  });
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_core12.Tabs, { value: active, onChange: props.onTabChange, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_core12.Tabs.List, { children: [
      props.permissions.products.view ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_core12.Tabs.Tab, { value: "products", children: "Produits" }) : null,
      props.permissions.programs.view ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_core12.Tabs.Tab, { value: "programs", children: "Programmes" }) : null,
      props.permissions.stock.view ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_core12.Tabs.Tab, { value: "stock", children: "Stock local" }) : null
    ] }),
    props.permissions.products.view ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_core12.Tabs.Panel, { value: "products", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DrencherProducts, { ...rights("products") }) }) : null,
    props.permissions.programs.view ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_core12.Tabs.Panel, { value: "programs", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DrencherPrograms, { ...rights("programs") }) }) : null,
    props.permissions.stock.view ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_core12.Tabs.Panel, { value: "stock", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DrencherStock, { ...rights("stock") }) }) : null
  ] });
}

// frontend/src/DrencherRecette.tsx
var import_react11 = require("react");
var import_core13 = require("@mantine/core");
var import_notifications4 = require("@mantine/notifications");
var import_jsx_runtime13 = require("react/jsx-runtime");
var cleanupLabels = {
  vit_dr_cycle: "Cycles",
  vit_dr_revision: "R\xE9visions des cycles",
  vit_dr_palette_validee: "Palettes trait\xE9es",
  vit_dr_mouvement: "Mouvements de stock",
  vit_dr_stock_lot: "Lots fabricants en stock",
  vit_dr_programme: "Programmes",
  vit_dr_programme_revision: "Versions des programmes",
  vit_traitement_produit: "Produits"
};
function DrencherRecette({
  path,
  mode,
  refresh
}) {
  const [id, setId] = (0, import_react11.useState)(""), [activation, setActivation] = (0, import_react11.useState)(""), [preview, setPreview] = (0, import_react11.useState)(null), [confirmation, setConfirmation] = (0, import_react11.useState)(""), [motif, setMotif] = (0, import_react11.useState)(""), [busy, setBusy] = (0, import_react11.useState)(false), [error, setError] = (0, import_react11.useState)("");
  const history = useApi(mode.registered ? path + "/recette/history" : null);
  async function run(operation) {
    setBusy(true);
    setError("");
    try {
      const p = await api(path + "/recette/preview", "POST", {
        operation,
        cycleId: operation === "Cycle" ? Number(id) : null
      });
      setPreview(p);
      setConfirmation("");
      setMotif("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aper\xE7u impossible.");
    } finally {
      setBusy(false);
    }
  }
  async function activate() {
    setBusy(true);
    setError("");
    try {
      await api(path + "/recette/activate", "POST", { confirmation: activation });
      import_notifications4.notifications.show({ color: "green", message: "Mode Recette inscrit sur la base isol\xE9e." });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activation impossible.");
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    if (!preview) return;
    setBusy(true);
    setError("");
    try {
      await api(path + "/recette/apply", "POST", { ticket: preview.ticket, confirmation, motif });
      setPreview(null);
      import_notifications4.notifications.show({
        color: "green",
        message: "Nettoyage de recette effectu\xE9 et journalis\xE9."
      });
      refresh();
      history.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nettoyage impossible.");
      history.refresh();
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Title, { order: 4, children: "Mode Recette Drencher \xB7 administration" }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Alert, { color: mode.registered ? "orange" : "blue", children: mode.registered ? "Base de test isol\xE9e. Les nettoyages sont r\xE9serv\xE9s aux administrateurs, apr\xE8s aper\xE7u et confirmation." : "Les suppressions sont d\xE9sactiv\xE9es sur ce contexte. Aucune donn\xE9e existante n\u2019est automatiquement consid\xE9r\xE9e comme un test." }),
    error && !preview ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Alert, { color: "red", children: error }) : null,
    !mode.installation ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Alert, { color: "orange", children: "Installer le script 006_drencher_recette_admin.sql dans la base d'administration avant activation." }) : null,
    !mode.registered ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Paper, { withBorder: true, p: "md", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Stack, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Title, { order: 5, children: "Pr\xE9parer une base isol\xE9e neuve" }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Text, { children: "Le guide de mise \xE0 jour contient le g\xE9n\xE9rateur SQL New-DrencherRecette.ps1. Faire cr\xE9er la base neuve par le DBA, puis ajouter son contexte ZAOUIA dans Administration et le s\xE9lectionner ici. Aucun nettoyage n'est disponible pour logista." }),
      mode.eligible && mode.installation ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Text, { size: "sm", children: "Activation possible seulement si les tables Drencher sont vides et l'identit\xE9 de recette est v\xE9rifi\xE9e." }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          import_core13.TextInput,
          {
            label: "Saisir ACTIVER RECETTE",
            value: activation,
            onChange: (e) => setActivation(e.currentTarget.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          import_core13.Button,
          {
            loading: busy,
            disabled: activation !== "ACTIVER RECETTE",
            onClick: () => void activate(),
            children: "Inscrire ce contexte en Recette"
          }
        )
      ] }) : null
    ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Paper, { withBorder: true, p: "md", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Stack, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Title, { order: 5, children: "Supprimer un cycle de test" }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Text, { size: "sm", children: "Un cycle valid\xE9 de recette peut \xEAtre supprim\xE9 : son stock est restitu\xE9 et ses palettes lib\xE9r\xE9es. Cette action reste interdite en production." }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Group, { align: "end", children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.NumberInput, { label: "Num\xE9ro du cycle de test", min: 1, value: id, onChange: setId }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            import_core13.Button,
            {
              color: "red",
              variant: "light",
              disabled: !id || busy,
              onClick: () => void run("Cycle"),
              children: "Voir l'aper\xE7u de suppression"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Paper, { withBorder: true, p: "md", children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Stack, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Title, { order: 5, children: "Remise \xE0 z\xE9ro des essais" }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Text, { size: "sm", children: "L'historique administratif et les tables historiques Logista sont conserv\xE9s. Les identifiants ne sont jamais r\xE9attribu\xE9s." }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Group, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            import_core13.Button,
            {
              color: "orange",
              variant: "light",
              disabled: busy,
              onClick: () => void run("CyclesStock"),
              children: "R\xE9initialiser cycles et stock"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
            import_core13.Button,
            {
              color: "red",
              variant: "light",
              disabled: busy,
              onClick: () => void run("Tout"),
              children: "Tout r\xE9initialiser, produits et programmes inclus"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Title, { order: 5, children: "Historique des nettoyages" }),
      history.error ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Alert, { color: "red", children: history.error }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.ScrollContainer, { minWidth: 650, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Tr, { children: ["Date", "Op\xE9ration / cycle", "\xC9tat", "Motif", "Administrateur"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Th, { children: h }, h)) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Tbody, { children: history.data?.map((h) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Td, { children: h.dateExecution ?? h.dateCreation }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Td, { children: [
            h.operation,
            h.cycleId ? " \xB7 #" + h.cycleId : ""
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Td, { children: h.etat }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Td, { children: h.motif || "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Td, { children: h.auteur })
        ] }, h.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      import_core13.Modal,
      {
        opened: preview !== null,
        onClose: () => {
          if (!busy) setPreview(null);
        },
        title: "Confirmer le nettoyage de recette",
        size: "lg",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Alert, { color: "red", children: error }) : null,
          preview ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Alert, { color: "red", children: [
              "Base isol\xE9e : ",
              preview.details.database,
              ".",
              " ",
              preview.details.cycleId ? "Cycle de test #" + preview.details.cycleId : "Toutes les donn\xE9es du p\xE9rim\xE8tre choisi",
              ". Cette suppression est d\xE9finitive dans la recette."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Text, { children: [
              "Programmes et produits :",
              " ",
              preview.details.programmesProduitsConserves ? "conserv\xE9s" : "supprim\xE9s",
              ". Historique administratif conserv\xE9. Aper\xE7u valable ",
              preview.expiresMinutes,
              " minutes."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Text, { size: "sm", c: "dimmed", children: "Lignes concern\xE9es par le nettoyage. Les autres cycles sont conserv\xE9s lors d'une suppression individuelle." }),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Tbody, { children: Object.entries(preview.details.counts).map(([name, count]) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Tr, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Td, { children: cleanupLabels[name] ?? name }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Td, { children: count })
            ] }, name)) }) }),
            preview.details.restitutions.length ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_jsx_runtime13.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Text, { fw: 600, children: "Stock restitu\xE9 apr\xE8s suppression du cycle de test" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Tr, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Th, { children: "Produit / lot" }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Th, { children: "Restitu\xE9" }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Th, { children: "Stock apr\xE8s" })
                ] }) }),
                /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Table.Tbody, { children: preview.details.restitutions.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Tr, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Td, { children: [
                    r.nom,
                    " \xB7 ",
                    r.lot
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Td, { children: [
                    number(r.quantiteRestituee),
                    " ",
                    r.unite
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Table.Td, { children: [
                    number(r.soldeApres),
                    " ",
                    r.unite
                  ] })
                ] }, i)) })
              ] })
            ] }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              import_core13.TextInput,
              {
                label: `Recopier : ${preview.confirmation}`,
                value: confirmation,
                onChange: (e) => setConfirmation(e.currentTarget.value),
                disabled: busy
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
              import_core13.Textarea,
              {
                label: "Motif obligatoire du nettoyage",
                maxLength: 1e3,
                value: motif,
                onChange: (e) => setMotif(e.currentTarget.value),
                disabled: busy
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(import_core13.Group, { justify: "end", children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_core13.Button, { variant: "default", disabled: busy, onClick: () => setPreview(null), children: "Annuler" }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
                import_core13.Button,
                {
                  color: "red",
                  loading: busy,
                  disabled: confirmation !== preview.confirmation || !motif.trim(),
                  onClick: () => void apply(),
                  children: "Confirmer le nettoyage"
                }
              )
            ] })
          ] }) : null
        ] })
      }
    )
  ] });
}

// frontend/src/Drencher.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
function Drencher({ context, admin = false }) {
  const path = `/contexts/${context.id}/drencher`;
  const rights = usePermissions("drencher"), quality = usePermissions("drencher_quality"), products = usePermissions("drencher_products"), programs = usePermissions("drencher_programs"), stock = usePermissions("drencher_stock");
  const [tab, setTab] = (0, import_react12.useState)("cycles"), [managementTab, setManagementTab] = (0, import_react12.useState)("products"), [search, setSearch] = (0, import_react12.useState)(""), [status, setStatus] = (0, import_react12.useState)(null), [from, setFrom] = (0, import_react12.useState)(""), [to, setTo] = (0, import_react12.useState)(""), [page, setPage] = (0, import_react12.useState)(1), [selected, setSelected] = (0, import_react12.useState)(null), [editing, setEditing] = (0, import_react12.useState)(false), [busy, setBusy] = (0, import_react12.useState)(false), [error, setError] = (0, import_react12.useState)(""), [note, setNote] = (0, import_react12.useState)("");
  const mode = useApi(context.station === "ZAOUIA" ? path + "/mode" : null);
  const catalog = useApi(context.station === "ZAOUIA" ? path + "/catalog" : null);
  const reservations = useApi(
    context.station === "ZAOUIA" ? path + "/reservations/status" : null
  );
  const cycles = useApi(
    catalog.data ? path + `/cycles?page=${page}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status ?? "")}&from=${from}&to=${to}` : null
  );
  const detail = useApi(selected ? path + "/cycles/" + selected : null);
  const writable = !context.readOnly;
  const s = detail.data?.revisions[0]?.snapshot;
  function refresh() {
    mode.refresh();
    catalog.refresh();
    cycles.refresh();
    detail.refresh();
  }
  async function transition(validate) {
    if (!detail.data) return;
    setBusy(true);
    setError("");
    try {
      await api(path + `/cycles/${selected}/${validate ? "validate" : "submit"}`, "POST", {
        version: detail.data.version,
        motif: note
      });
      refresh();
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Op\xE9ration impossible");
    } finally {
      setBusy(false);
    }
  }
  if (context.station !== "ZAOUIA")
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Alert, { color: "orange", children: "Le Drencher V1 est disponible uniquement pour ZAOUIA." });
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Stack, { className: "drencher-workspace", children: [
    /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Group, { justify: "space-between", className: "dr-no-print", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Text, { size: "xs", c: "dimmed", children: [
          "OP\xC9RATIONS \xB7 ZAOUIA / ",
          context.label
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Title, { order: 2, children: "Drencher" }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Text, { c: "dimmed", children: "Stock d\xE9duit \xE0 la soumission. Validation qualit\xE9 sans seconde sortie ; corrections diff\xE9rentielles." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Badge, { color: mode.data?.registered ? "orange" : "blue", children: mode.data ? mode.data.mode.toUpperCase() : "MODE NON V\xC9RIFI\xC9" })
    ] }),
    reservations.data && !reservations.data.ready ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Alert, { color: "orange", className: "dr-no-print", children: "R\xE9servations V1.2 \xE0 initialiser : diagnostic et arbitrage \xE9ventuel dans R\xE9servations \xB7 admin. La saisie est prot\xE9g\xE9e jusqu'\xE0 la migration." }) : null,
    error ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Alert, { color: "red", className: "dr-no-print", withCloseButton: true, onClose: () => setError(""), children: error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(State, { loading: catalog.loading, error: catalog.error, retry: catalog.refresh, children: catalog.data ? editing ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      DrencherEditor,
      {
        path,
        catalog: catalog.data,
        initial: selected ? detail.data ?? void 0 : void 0,
        onCancel: () => setEditing(false),
        onSaved: (id) => {
          setSelected(id);
          setEditing(false);
          refresh();
        }
      },
      `${selected ?? 0}:${detail.data?.version ?? 0}`
    ) : /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Tabs, { value: tab, onChange: setTab, className: "dr-no-print", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Tabs.List, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Tabs.Tab, { value: "cycles", children: "Cycles & qualit\xE9" }),
        products.view || programs.view || stock.view ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Tabs.Tab, { value: "management", children: "Produits, programmes & stock" }) : null,
        admin ? /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Tabs.Tab, { value: "deleted", children: "Cycles supprim\xE9s \xB7 admin" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Tabs.Tab, { value: "recette", children: "Mode Recette \xB7 admin" }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Tabs.Tab, { value: "reservations", children: "R\xE9servations \xB7 admin" })
        ] }) : null
      ] }) }),
      tab === "deleted" && admin ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DrencherCycleAdmin, { path, readOnly: Boolean(context.readOnly) }) : tab === "reservations" && admin ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DrencherReservationAdmin, { path, onUpdated: reservations.refresh }) : tab === "recette" && admin ? mode.data ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DrencherRecette, { path, mode: mode.data, refresh }) : /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Alert, { color: "orange", children: mode.error || "Chargement du mode\u2026" }) : tab === "management" ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        DrencherManagement,
        {
          activeTab: managementTab,
          onTabChange: setManagementTab,
          path,
          catalog: catalog.data,
          permissions: {
            products: {
              view: products.view,
              add: writable && products.add,
              modify: writable && products.modify
            },
            programs: {
              view: programs.view,
              add: writable && programs.add,
              modify: writable && programs.modify
            },
            stock: { view: stock.view, add: writable && stock.add, modify: false }
          },
          refresh: catalog.refresh
        }
      ) : /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_jsx_runtime14.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.SimpleGrid, { cols: { base: 1, sm: 3 }, className: "dr-no-print", children: [
          ["Cycles enregistr\xE9s", cycles.data?.summary.cycles],
          ["En attente qualit\xE9", cycles.data?.summary.attente],
          ["Palettes valid\xE9es", cycles.data?.summary.palettes]
        ].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Paper, { withBorder: true, p: "md", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Text, { c: "dimmed", children: label }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Title, { order: 3, children: value ?? "\u2014" })
        ] }, label)) }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Text, { size: "sm", className: "dr-no-print", children: [
          "Consommations comptabilis\xE9es :",
          " ",
          cycles.data?.summary.consommations.map((p) => `${p.nom} : ${number(p.quantite)} ${p.unite}`).join(" \xB7 ") || "Aucune"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Group, { className: "dr-no-print", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            import_core14.TextInput,
            {
              label: "R\xE9ception, palette, vari\xE9t\xE9 ou cycle",
              value: search,
              onChange: (e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            import_core14.TextInput,
            {
              type: "date",
              label: "Du",
              value: from,
              onChange: (e) => {
                setFrom(e.currentTarget.value);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            import_core14.TextInput,
            {
              type: "date",
              label: "Au",
              value: to,
              onChange: (e) => {
                setTo(e.currentTarget.value);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            import_core14.Select,
            {
              label: "Statut",
              clearable: true,
              data: ["Brouillon", "En attente de validation", "Valid\xE9"],
              value: status,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            import_core14.Button,
            {
              mt: "lg",
              disabled: !writable || !rights.add,
              onClick: () => {
                setSelected(null);
                setEditing(true);
              },
              children: "Nouveau cycle"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(State, { loading: cycles.loading, error: cycles.error, retry: cycles.refresh, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.ScrollContainer, { minWidth: 650, className: "dr-no-print", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Table, { highlightOnHover: true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.Tr, { children: [
            "Cycle / date",
            "Programme",
            "Palettes",
            "Statut",
            "Op\xE9rateur",
            ""
          ].map((v) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.Th, { children: v }, v)) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.Tbody, { children: cycles.data?.rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Table.Td, { children: [
              "#",
              c.id,
              " \xB7 ",
              c.snapshot.date
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Table.Td, { children: [
              c.snapshot.programmeNom,
              " v",
              c.snapshot.programmeVersion
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.Td, { children: c.snapshot.palettes.length }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              import_core14.Badge,
              {
                color: c.statut === "Valid\xE9" ? "green" : c.statut === "Brouillon" ? "gray" : "orange",
                children: c.statut
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Table.Td, { children: c.auteur }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Table.Td, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                import_core14.Button,
                {
                  variant: "subtle",
                  onClick: () => {
                    setSelected(c.id);
                    setNote("");
                  },
                  children: "Ouvrir"
                }
              ),
              admin && writable ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                DrencherCycleAdmin,
                {
                  path,
                  cycle: c,
                  onUpdated: () => {
                    setSelected(null);
                    refresh();
                  }
                }
              ) : null
            ] })
          ] }, c.id)) })
        ] }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          import_core14.Pagination,
          {
            className: "dr-no-print",
            total: Math.max(1, Math.ceil((cycles.data?.total ?? 0) / 25)),
            value: page,
            onChange: setPage
          }
        ),
        selected ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(State, { loading: detail.loading, error: detail.error, retry: detail.refresh, children: detail.data && s ? /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Paper, { withBorder: true, p: "lg", children: [
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Group, { justify: "space-between", className: "dr-no-print", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Title, { order: 3, children: [
              "Cycle #",
              selected,
              " \xB7 ",
              detail.data.statut
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Group, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                DrencherF04Actions,
                {
                  path,
                  cycleId: selected,
                  revision: detail.data.version
                }
              ),
              writable && (detail.data.statut === "Brouillon" ? rights.modify && detail.data.canEditDraft === true : ["Valid\xE9", "En attente de validation"].includes(
                detail.data.statut
              ) && quality.modify) ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Button, { onClick: () => setEditing(true), children: detail.data.statut !== "Brouillon" ? "Correction qualit\xE9" : "Modifier" }) : null
            ] })
          ] }),
          admin && writable ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            DrencherCycleAdmin,
            {
              path,
              cycle: detail.data,
              onUpdated: () => {
                setSelected(null);
                refresh();
              }
            }
          ) : null,
          /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DrencherPrint, { detail: detail.data }),
          /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)(import_core14.Group, { className: "dr-no-print", mt: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              import_core14.Textarea,
              {
                label: "Observations du contr\xF4le qualit\xE9",
                value: note,
                maxLength: 1e3,
                onChange: (e) => setNote(e.currentTarget.value),
                flex: 1
              }
            ),
            writable && detail.data.statut === "Brouillon" && rights.modify && detail.data.canEditDraft === true ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Button, { loading: busy, onClick: () => void transition(false), children: "Envoyer pour validation qualit\xE9" }) : null,
            writable && detail.data.statut === "En attente de validation" && quality.modify ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_core14.Button, { loading: busy, onClick: () => void transition(true), children: "Valider" }) : null
          ] })
        ] }) : null }) : null
      ] })
    ] }) : null })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Drencher,
  PermissionContext
});
/*! Bundled license information:

@tabler/icons-react/dist/esm/defaultAttributes.mjs:
@tabler/icons-react/dist/esm/createReactComponent.mjs:
@tabler/icons-react/dist/esm/icons/IconAlertCircle.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabaseOff.mjs:
  (**
   * @license @tabler/icons-react v3.35.0 - MIT
   *
   * This source code is licensed under the MIT license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

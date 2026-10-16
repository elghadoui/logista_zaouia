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

// frontend/src/DrencherCycleAdmin.tsx
var DrencherCycleAdmin_exports = {};
__export(DrencherCycleAdmin_exports, {
  DrencherCycleAdmin: () => DrencherCycleAdmin
});
module.exports = __toCommonJS(DrencherCycleAdmin_exports);
var import_react4 = require("react");
var import_core4 = require("@mantine/core");

// frontend/src/api.ts
var import_react = require("react");
var csrf = "";
async function api(path, method = "GET", body, signal) {
  const response = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: body === void 0 ? void 0 : JSON.stringify(body),
    signal
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(
      result?.title ?? (response.status === 401 ? "Connectez-vous pour acc\xE9der \xE0 votre espace." : `Service indisponible (${response.status}).`)
    );
  }
  if (response.status === 204) return void 0;
  return response.json();
}
function useApi(path) {
  const [data, setData] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [version, setVersion] = (0, import_react.useState)(0);
  const refresh = (0, import_react.useCallback)(() => setVersion((v) => v + 1), []);
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    setData(null);
    setError("");
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void api(path, "GET", void 0, controller.signal).then(setData).catch((e) => {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Erreur inconnue");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [path, version]);
  return { data, error, loading, refresh };
}

// frontend/src/components.tsx
var import_core = require("@mantine/core");

// frontend/node_modules/@tabler/icons-react/dist/esm/createReactComponent.mjs
var import_react2 = require("react");

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
  const Component = (0, import_react2.forwardRef)(
    ({ color = "currentColor", size = 24, stroke = 2, title, className, children, ...rest }, ref) => (0, import_react2.createElement)(
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
        title && (0, import_react2.createElement)("title", { key: "svg-title" }, title),
        ...iconNode.map(([tag, attrs]) => (0, import_react2.createElement)(tag, attrs)),
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
  empty,
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
  if (empty)
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
var drExpired = (v, day) => {
  const date = drDay(v), reference = drDay(day);
  return date !== null && reference !== null && date < reference;
};

// frontend/src/DrencherPrint.tsx
var import_core2 = require("@mantine/core");

// frontend/src/drencherTypes.ts
var number = (v) => v == null ? "\u2014" : v.toLocaleString("fr-MA", { maximumFractionDigits: 6 });

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
var import_react3 = require("react");
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
  const [file, setFile] = (0, import_react3.useState)(null);
  const [error, setError] = (0, import_react3.useState)("");
  const [busy, setBusy] = (0, import_react3.useState)(false);
  const request = (0, import_react3.useRef)(null);
  const address = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(
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
  const frame = (0, import_react3.useRef)(null);
  const [printError, setPrintError] = (0, import_react3.useState)("");
  (0, import_react3.useEffect)(() => setPrintError(""), [file]);
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
  const [quantityMode, setQuantityMode] = (0, import_react3.useState)("reel");
  const [opened, setOpened] = (0, import_react3.useState)(false);
  (0, import_react3.useEffect)(() => {
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

// frontend/src/DrencherCycleAdmin.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function DrencherCycleAdmin({
  path,
  cycle,
  onUpdated,
  readOnly = false
}) {
  const [opened, setOpened] = (0, import_react4.useState)(false), [phrase, setPhrase] = (0, import_react4.useState)(""), [motif, setMotif] = (0, import_react4.useState)(""), [busy, setBusy] = (0, import_react4.useState)(false), [error, setError] = (0, import_react4.useState)(""), [page, setPage] = (0, import_react4.useState)(1), [selected, setSelected] = (0, import_react4.useState)(null);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DrencherCycleAdmin
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

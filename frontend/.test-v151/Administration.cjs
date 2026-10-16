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

// frontend/src/Administration.tsx
var Administration_exports = {};
__export(Administration_exports, {
  Administration: () => Administration,
  EmptyConfiguration: () => EmptyConfiguration
});
module.exports = __toCommonJS(Administration_exports);

// frontend/src/Permissions.tsx
var import_react = require("react");
var import_core = require("@mantine/core");

// frontend/src/api.ts
var display = (x) => String(x);
var titles = {};
var api = async () => ({});
var useApi = (url) => ({ data: url === "/admin/configuration" ? globalThis.__configuration : globalThis.__analytics, loading: false, error: "", refresh: () => {
} });

// frontend/src/Permissions.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var PermissionContext = (0, import_react.createContext)([]);
var groups = [
  ["Patrimoine agricole", ["adherent", "verger", "parcelle"]],
  ["Vari\xE9t\xE9s", ["hierarchy", "culture", "grpvar", "variete", "souvar"]],
  ["Commerce / export", ["partenaire", "destination", "pays", "marche"]],
  ["Conditionnement", ["grpemb", "groupart", "defaut", "typeecart"]],
  ["Origines", ["declaration_verger"]],
  [
    "Suivi / qualit\xE9",
    [
      "dashboard",
      "receptions",
      "caisserie",
      "versements",
      "export",
      "ecarts",
      "drencher",
      "drencher_quality",
      "drencher_products",
      "drencher_programs",
      "drencher_stock",
      "drencher_manage"
    ]
  ],
  ["Assistance / administration", ["assistant", "compare", "sync", "journal"]]
];
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
var readOnly = [
  "dashboard",
  "hierarchy",
  "receptions",
  "caisserie",
  "versements",
  "export",
  "ecarts",
  "drencher_manage",
  "assistant",
  "compare",
  "journal"
];
function permissionDisabled(module2, action, p, consultation, busy = false) {
  return busy || action !== "view" && (!p.view || consultation || readOnly.includes(module2) || module2 === "drencher_quality" && action === "add" || module2 === "drencher_stock" && action === "modify" || module2.startsWith("drencher") && action === "delete" || module2 === "sync" && action !== "modify");
}
function UserPermissions({
  users
}) {
  const [id, setId] = (0, import_react.useState)(null), [draft, setDraft] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [busy, setBusy] = (0, import_react.useState)(false);
  const result = useApi(id ? `/admin/users/${id}/permissions` : null);
  const data = draft ?? result.data ?? [];
  const consultation = users.find((u) => String(u.id) === id)?.role === "Consultation";
  function change(module2, action, value) {
    setDraft(
      data.map(
        (p) => p.module !== module2 ? p : action === "view" && !value ? { ...p, view: false, add: false, modify: false, delete: false } : { ...p, [action]: value }
      )
    );
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      await api(`/admin/users/${id}/permissions`, "PUT", { permissions: data });
      result.refresh();
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { children: "Admin conserve son acc\xE8s complet. Consultation reste en lecture seule. Les exercices attribu\xE9s et les archives restent applicables ; modifier ces droits r\xE9voque les sessions pr\xE9c\xE9dentes." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.Select,
      {
        label: "Utilisateur",
        searchable: true,
        data: users.filter((u) => u.role !== "Admin").map((u) => ({ value: String(u.id), label: u.display_name + " \xB7 " + u.role })),
        value: id,
        onChange: (value) => {
          setId(value);
          setDraft(null);
          setError("");
        }
      }
    ),
    result.error || error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: error || result.error }) : null,
    id ? groups.map(([label, modules]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 750, mb: "md", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: "Module" }),
          ["Voir", "Ajouter", "Modifier", "Supprimer"].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: a }, a))
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tbody, { children: modules.map((module2) => {
          const p = data.find((p2) => p2.module === module2);
          return p ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: names[module2] ?? module2 }),
            ["view", "add", "modify", "delete"].map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Checkbox,
              {
                "aria-label": `${names[module2] ?? module2} : ${action}`,
                checked: p[action],
                disabled: permissionDisabled(module2, action, p, consultation, busy),
                onChange: (e) => change(module2, action, e.currentTarget.checked)
              }
            ) }, action))
          ] }, module2) : null;
        }) })
      ] })
    ] }, label)) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { loading: busy, disabled: !id || !draft, onClick: () => void save(), children: "Enregistrer les droits" })
  ] });
}

// frontend/src/CrateOpenings.tsx
var import_core3 = require("@mantine/core");
var import_react3 = require("react");

// frontend/src/components.tsx
var import_core2 = require("@mantine/core");

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
var import_jsx_runtime2 = require("react/jsx-runtime");
function State({
  loading,
  error,
  empty,
  retry,
  children
}) {
  if (loading)
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Center, { py: 70, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Loader, { color: "forest" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: "Chargement de vos donn\xE9es\u2026" })
    ] }) });
  if (error)
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Alert, { color: "red", title: "Impossible de charger les donn\xE9es", icon: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconAlertCircle, {}), children: [
      error,
      retry ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { mt: "md", variant: "light", color: "red", onClick: retry, children: "R\xE9essayer" }) : null
    ] });
  if (empty)
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Paper, { withBorder: true, p: 50, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { align: "center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconDatabaseOff, { size: 36, color: "#83968d" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 600, children: "Aucun enregistrement" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", size: "sm", children: "Adaptez votre recherche ou ajoutez un r\xE9f\xE9rentiel si vos droits le permettent." })
    ] }) });
  return children;
}
function PageHeading({
  title,
  eyebrow,
  subtitle,
  action
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", align: "end", mb: 26, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      eyebrow ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { className: "eyebrow", mb: 7, children: eyebrow }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { component: "h1", className: "page-title", children: title }),
      subtitle ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", mt: 6, size: "sm", children: subtitle }) : null
    ] }),
    action
  ] });
}

// frontend/src/CrateOpenings.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function CrateOpenings({ contextId, label, close }) {
  const result = useApi(`/admin/contexts/${contextId}/crate-openings`);
  const [type, setType] = (0, import_react3.useState)(null);
  const [date, setDate] = (0, import_react3.useState)("");
  const [owned, setOwned] = (0, import_react3.useState)("");
  const [physical, setPhysical] = (0, import_react3.useState)("");
  const [dues, setDues] = (0, import_react3.useState)([]);
  const [note, setNote] = (0, import_react3.useState)(""), [confirmed, setConfirmed] = (0, import_react3.useState)(false), [busy, setBusy] = (0, import_react3.useState)(false), [message, setMessage] = (0, import_react3.useState)(""), [error, setError] = (0, import_react3.useState)("");
  async function save() {
    if (owned === "" || !type || !date || dues.some((d) => d.producerId === "" || d.quantity === "")) {
      setError("Renseignez les quantit\xE9s et r\xE9f\xE9rences obligatoires.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await api(`/admin/contexts/${contextId}/crate-openings`, "POST", { crateType: Number(type), openingDate: date, ownedTotal: Number(owned), physicalQuantity: physical === "" ? null : Number(physical), dues: dues.map((d) => ({ producerId: Number(d.producerId), orchardId: d.orchardId === "" ? null : Number(d.orchardId), quantity: Number(d.quantity) })), note, confirmed, expectedRevision: result.data?.revisions?.find((r) => r.crate_type === Number(type))?.revision ?? 0 });
      setMessage(response.message);
      setConfirmed(false);
      result.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement indisponible.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Drawer, { opened: true, onClose: close, position: "right", size: "xl", title: `Inventaires d\u2019ouverture \xB7 ${label}`, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(State, { loading: result.loading, error: result.error, retry: result.refresh, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "orange", children: "Inventaires d\xE9claratifs r\xE9serv\xE9s aux administrateurs. Les anciennes r\xE9visions sont conserv\xE9es. Aucun mouvement historique n\u2019est modifi\xE9. L\u2019enregistrement ne certifie pas les soldes courants." }),
    result.data && !result.data.installed ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { children: "La migration administrative 014 doit \xEAtre appliqu\xE9e pour enregistrer les ouvertures." }) : null,
    result.data?.installed ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { grow: true, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Select, { label: "Type de caisse", searchable: true, data: result.data.types.map((t) => ({ value: String(t.value), label: `${t.label} [${t.value}]` })), value: type, onChange: setType }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.TextInput, { type: "date", label: "Date d\u2019ouverture \xB7 d\xE9but de journ\xE9e", value: date, onChange: (e) => setDate(e.currentTarget.value) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { grow: true, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.NumberInput, { label: "Total appartenant \xE0 la station", min: 0, max: 1e12, allowDecimal: false, value: owned, onChange: setOwned }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.NumberInput, { label: "Physiquement pr\xE9sent \xB7 facultatif", description: "Laisser vide si inconnu, ne pas saisir z\xE9ro par d\xE9faut.", min: 0, max: 1e12, allowDecimal: false, value: physical, onChange: setPhysical })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 600, size: "sm", children: "Quantit\xE9s initiales dues connues et valid\xE9es \xB7 facultatif" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", children: "Une ligne par producteur/verger. Laisser le verger vide si l\u2019attribution n\u2019est pas prouv\xE9e. Une liste partielle ne repr\xE9sente pas toutes les dettes." }),
      dues.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { p: "sm", withBorder: true, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { grow: true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Select, { label: "Producteur", searchable: true, data: (result.data?.producers ?? []).map((p) => ({ value: String(p.value), label: `${p.label} [${p.value}]` })), value: d.producerId === "" ? null : String(d.producerId), onChange: (v) => setDues((rows) => rows.map((r, j) => j === i ? { ...r, producerId: v ?? "", orchardId: "" } : r)) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Select, { label: "Verger \xB7 facultatif", searchable: true, clearable: true, data: (result.data?.orchards ?? []).filter((p) => p.producer === Number(d.producerId)).map((p) => ({ value: String(p.value), label: `${p.label} [${p.value}]` })), value: d.orchardId === "" ? null : String(d.orchardId), onChange: (v) => setDues((rows) => rows.map((r, j) => j === i ? { ...r, orchardId: v ?? "" } : r)) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.NumberInput, { label: "Quantit\xE9 due", min: 0, max: 1e12, allowDecimal: false, value: d.quantity, onChange: (v) => setDues((rows) => rows.map((r, j) => j === i ? { ...r, quantity: v } : r)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "subtle", size: "xs", onClick: () => setDues((rows) => rows.filter((_, j) => j !== i)), children: "Retirer cette ligne non enregistr\xE9e" })
      ] }, i)),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "light", disabled: dues.length >= 200, onClick: () => setDues((rows) => [...rows, { producerId: "", orchardId: "", quantity: "" }]), children: "Ajouter un solde initial producteur" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Textarea, { label: "Justification / r\xE9f\xE9rence de l\u2019inventaire", maxLength: 500, value: note, onChange: (e) => setNote(e.currentTarget.value) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Checkbox, { checked: confirmed, onChange: (e) => setConfirmed(e.currentTarget.checked), label: "Je confirme l\u2019inventaire et les seules quantit\xE9s initiales renseign\xE9es, apr\xE8s contr\xF4le. Une nouvelle r\xE9vision sera historis\xE9e." }),
      error ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "red", children: error }) : null,
      message ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "green", children: message }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { loading: busy, disabled: !confirmed, onClick: () => void save(), children: "Enregistrer une r\xE9vision d\u2019ouverture" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "Historique des inventaires" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", children: "200 derni\xE8res r\xE9visions. Les ouvertures ne sont pas additionn\xE9es entre r\xE9visions." }),
      result.data.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { fw: 600, children: [
            result.data?.types.find((t) => t.value === r.crate_type)?.label ?? r.crate_type,
            " \xB7 ",
            r.campaign_label
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Badge, { children: [
            "R\xE9vision ",
            r.revision
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { size: "sm", children: [
          r.opening_date,
          " \xB7 Propri\xE9t\xE9 ",
          r.owned_total,
          " \xB7 Physique ",
          r.physical_quantity ?? "inconnu"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { size: "xs", c: "dimmed", children: [
          r.created_by,
          " \xB7 ",
          r.created_at,
          " \xB7 ",
          r.note
        ] }),
        result.data?.dues.some((d) => d.opening_id === r.id) ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Adh\xE9rent" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Verger" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Initial d\xFB" })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: result.data.dues.filter((d) => d.opening_id === r.id).map((d) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: d.producer_id }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: d.orchard_id || "Non attribu\xE9" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: d.quantity })
          ] }, `${d.producer_id}:${d.orchard_id}`)) })
        ] }) : null
      ] }, r.id))
    ] }) : null
  ] }) }) });
}

// frontend/src/Administration.tsx
var import_core4 = require("@mantine/core");
var import_notifications = require("@mantine/notifications");
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function Administration({
  onConfigured,
  initialTab
}) {
  const result = useApi("/admin/configuration");
  const [error, setError] = (0, import_react4.useState)("");
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const [server, setServer] = (0, import_react4.useState)({
    label: "",
    host: "",
    port: 3306,
    username: "",
    password: "",
    sslMode: "Required"
  });
  const [serverId, setServerId] = (0, import_react4.useState)(null);
  const [station, setStation] = (0, import_react4.useState)({
    code: "ZAOUIA",
    label: "",
    serverId: "",
    isMaster: true
  });
  const [context, setContext] = (0, import_react4.useState)({
    stationId: "",
    databaseName: "logista",
    label: "",
    readOnly: true,
    showInSelectors: true,
    localRefsta: ""
  });
  const [contextId, setContextId] = (0, import_react4.useState)(null);
  const [inventory, setInventory] = (0, import_react4.useState)(null);
  const [user, setUser] = (0, import_react4.useState)({
    username: "",
    displayName: "",
    password: "",
    role: "Consultation",
    contextIds: []
  });
  const [route, setRoute] = (0, import_react4.useState)({ sourceContextId: "", targetContextId: "" });
  const [access, setAccess] = (0, import_react4.useState)({
    id: "",
    role: "Consultation",
    enabled: true,
    contextIds: []
  });
  const servers = result.data?.servers.map((s) => ({ value: String(s.id), label: s.label })) ?? [];
  const stations = result.data?.stations.map((s) => ({ value: String(s.id), label: s.code })) ?? [];
  const contexts = result.data?.contexts.map((c) => ({
    value: String(c.id),
    label: `${result.data?.stations.find((s) => s.id === c.station_id)?.code} \xB7 ${c.label}${c.read_only ? " (archive)" : ""}`
  })) ?? [];
  async function submit(path, body, method = "POST") {
    setBusy(true);
    setError("");
    try {
      const r = await api(path, method, body);
      import_notifications.notifications.show({ message: r.message, color: "forest" });
      result.refresh();
      onConfigured();
      setServer((s) => ({ ...s, password: "" }));
      setUser((u) => ({ ...u, password: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }
  async function test(id) {
    setBusy(true);
    setError("");
    try {
      const r = await api(
        `/admin/contexts/${id}/test`,
        "POST"
      );
      import_notifications.notifications.show({
        title: "Contr\xF4le de la base",
        message: `Connexion r\xE9ussie. ${r.errors.length} colonne(s) manquante(s), ${r.ambiguousSubvarieties} cl\xE9(s) sous-vari\xE9t\xE9 ambigu\xEB(s). ${r.errors.join(", ")}`,
        color: r.errors.length ? "orange" : "forest"
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
    inventory ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CrateOpenings, { contextId: inventory.id, label: inventory.label, close: () => setInventory(null) }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      PageHeading,
      {
        eyebrow: "ADMINISTRATION",
        title: "Stations, acc\xE8s et exercices",
        subtitle: "Configurez les bases autoris\xE9es. Les secrets MySQL sont prot\xE9g\xE9s et ne sont jamais renvoy\xE9s au navigateur."
      }
    ),
    error ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "red", mb: "lg", children: error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(State, { loading: result.loading, error: result.error, retry: result.refresh, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Tabs, { defaultValue: initialTab ?? "servers", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Tabs.List, { mb: "lg", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Tab, { value: "permissions", children: "Droits par module" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Tab, { value: "servers", children: "Serveurs" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Tab, { value: "stations", children: "Stations" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Tab, { value: "contexts", children: "Exercices" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Tab, { value: "users", children: "Utilisateurs & droits" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Tab, { value: "routes", children: "Routes DIAF" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Panel, { value: "permissions", pt: "lg", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(UserPermissions, { users: result.data?.users ?? [] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Panel, { value: "servers", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Paper, { withBorder: true, p: "xl", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, mb: "lg", children: serverId ? "Modifier le serveur" : "Ajouter un serveur MySQL" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
              {
                label: "Libell\xE9",
                value: server.label,
                onChange: (e) => setServer({ ...server, label: e.currentTarget.value })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
              {
                label: "Adresse serveur",
                value: server.host,
                onChange: (e) => setServer({ ...server, host: e.currentTarget.value })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.NumberInput,
              {
                label: "Port",
                value: server.port,
                min: 1,
                max: 65535,
                onChange: (v) => setServer({ ...server, port: Number(v) })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
              {
                label: "Compte MySQL",
                value: server.username,
                onChange: (e) => setServer({ ...server, username: e.currentTarget.value })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.PasswordInput,
              {
                label: serverId ? "Nouveau secret (vide = conserver)" : "Secret MySQL",
                value: server.password,
                onChange: (e) => setServer({ ...server, password: e.currentTarget.value }),
                autoComplete: "new-password"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.Select,
              {
                label: "Transport TLS",
                value: server.sslMode,
                data: ["Required", "VerifyCA", "VerifyFull", "Preferred", "None"],
                onChange: (v) => setServer({ ...server, sslMode: v ?? "Required" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { size: "xs", c: "dimmed", children: "TLS requis par d\xE9faut. Une exception pour un ancien serveur doit \xEAtre valid\xE9e avec l\u2019administrateur r\xE9seau." }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_core4.Button,
                {
                  loading: busy,
                  onClick: () => void submit(
                    `/admin/servers${serverId ? `/${serverId}` : ""}`,
                    server,
                    serverId ? "PUT" : "POST"
                  ),
                  children: "Enregistrer le serveur"
                }
              ),
              serverId ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_core4.Button,
                {
                  variant: "default",
                  onClick: () => {
                    setServerId(null);
                    setServer({
                      label: "",
                      host: "",
                      port: 3306,
                      username: "",
                      password: "",
                      sslMode: "Required"
                    });
                  },
                  children: "Nouveau"
                }
              ) : null
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Paper, { withBorder: true, p: "xl", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, mb: "lg", children: "Serveurs configur\xE9s" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Stack, { children: result.data?.servers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "md", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { justify: "space-between", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 600, children: s.label }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Text, { size: "sm", c: "dimmed", children: [
                s.host,
                ":",
                s.port,
                " \xB7 ",
                s.username
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Badge, { mt: 5, variant: "light", children: s.ssl_mode })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.Button,
              {
                variant: "light",
                size: "xs",
                onClick: () => {
                  setServerId(s.id);
                  setServer({
                    label: s.label,
                    host: s.host,
                    port: s.port,
                    username: s.username,
                    password: "",
                    sslMode: s.ssl_mode
                  });
                },
                children: "Modifier"
              }
            )
          ] }) }, s.id)) })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Panel, { value: "stations", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, children: "Ajouter une station" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.TextInput,
            {
              label: "Code",
              value: station.code,
              onChange: (e) => setStation({
                ...station,
                code: e.currentTarget.value.toUpperCase(),
                isMaster: e.currentTarget.value.toUpperCase() === "ZAOUIA"
              })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.TextInput,
            {
              label: "Libell\xE9",
              value: station.label,
              onChange: (e) => setStation({ ...station, label: e.currentTarget.value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Select,
            {
              label: "Serveur",
              data: servers,
              value: station.serverId,
              onChange: (v) => setStation({ ...station, serverId: v ?? "" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Checkbox,
            {
              label: "Base ma\xEEtre des r\xE9f\xE9rentiels",
              checked: station.isMaster,
              disabled: station.code !== "ZAOUIA",
              onChange: (e) => setStation({ ...station, isMaster: e.currentTarget.checked })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Button,
            {
              loading: busy,
              onClick: () => void submit("/admin/stations", {
                ...station,
                serverId: Number(station.serverId)
              }),
              children: "Ajouter"
            }
          )
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Stack, { children: result.data?.stations.map((s) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Text, { fw: 600, children: [
            s.code,
            " \xB7 ",
            s.label
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Badge, { variant: "light", children: s.is_master ? "Ma\xEEtre" : "Station locale" })
        ] }, s.id)) }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Tabs.Panel, { value: "contexts", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "orange", mb: "lg", children: "Les nouveaux contextes sont en lecture seule par d\xE9faut. Confirmez vous-m\xEAme le libell\xE9 de l\u2019exercice ; le suffixe de la base ne le d\xE9termine pas." }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, children: contextId ? "Modifier l\u2019exercice" : "Ajouter un exercice" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.Select,
              {
                label: "Station",
                data: stations,
                value: context.stationId,
                disabled: !!contextId,
                onChange: (v) => setContext({ ...context, stationId: v ?? "" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
              {
                label: "Nom r\xE9el de la base",
                value: context.databaseName,
                disabled: !!contextId,
                onChange: (e) => setContext({ ...context, databaseName: e.currentTarget.value })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
              {
                label: "Libell\xE9 confirm\xE9 de l\u2019exercice",
                placeholder: "2026/2027",
                value: context.label,
                onChange: (e) => setContext({ ...context, label: e.currentTarget.value })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.NumberInput,
              {
                label: "refsta local (facultatif)",
                value: context.localRefsta,
                onChange: (v) => setContext({ ...context, localRefsta: v })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.Checkbox,
              {
                label: "Archive / lecture seule",
                checked: context.readOnly,
                onChange: (e) => setContext({ ...context, readOnly: e.currentTarget.checked })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.Checkbox,
              {
                label: "Afficher dans les s\xE9lecteurs",
                description: "Masquer conserve la configuration et les autorisations. R\xE9activation possible ici.",
                checked: context.showInSelectors,
                onChange: (e) => setContext({ ...context, showInSelectors: e.currentTarget.checked })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_core4.Button,
                {
                  loading: busy,
                  onClick: () => void submit(
                    `/admin/contexts${contextId ? `/${contextId}` : ""}`,
                    {
                      ...context,
                      stationId: Number(context.stationId),
                      localRefsta: context.localRefsta === "" ? null : Number(context.localRefsta)
                    },
                    contextId ? "PUT" : "POST"
                  ),
                  children: "Enregistrer"
                }
              ),
              contextId ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_core4.Button,
                {
                  variant: "default",
                  onClick: () => {
                    setContextId(null);
                    setContext({
                      stationId: "",
                      databaseName: "logista",
                      label: "",
                      readOnly: true,
                      showInSelectors: true,
                      localRefsta: ""
                    });
                  },
                  children: "Nouveau"
                }
              ) : null
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Stack, { children: result.data?.contexts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Paper, { withBorder: true, p: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Text, { fw: 600, children: [
              result.data?.stations.find((s) => s.id === c.station_id)?.code,
              " \xB7 ",
              c.label
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Text, { size: "sm", c: "dimmed", children: [
              c.database_name,
              " \xB7 refsta ",
              display(c.local_refsta)
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Badge, { color: c.read_only ? "gray" : "forest", variant: "light", my: "sm", children: c.read_only ? "Archive \xB7 lecture seule" : "Modifiable" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Badge, { color: c.show_in_selectors === false || c.show_in_selectors === 0 ? "orange" : "gray", variant: "light", ml: "xs", children: c.show_in_selectors === false || c.show_in_selectors === 0 ? "Masqu\xE9 des s\xE9lecteurs" : "Visible dans les s\xE9lecteurs" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_core4.Button,
                {
                  size: "xs",
                  variant: "light",
                  loading: busy,
                  onClick: () => void test(c.id),
                  children: "Tester le sch\xE9ma"
                }
              ),
              !c.read_only ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Button, { size: "xs", variant: "light", onClick: () => setInventory(c), children: "Inventaires caisserie" }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_core4.Button,
                {
                  size: "xs",
                  variant: "subtle",
                  onClick: () => {
                    setContextId(c.id);
                    setContext({
                      stationId: String(c.station_id),
                      databaseName: c.database_name,
                      label: c.label,
                      readOnly: !!c.read_only,
                      showInSelectors: c.show_in_selectors !== false && c.show_in_selectors !== 0,
                      localRefsta: c.local_refsta ?? ""
                    });
                  },
                  children: "Modifier"
                }
              )
            ] })
          ] }, c.id)) }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Panel, { value: "users", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, children: "Cr\xE9er un utilisateur" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.TextInput,
            {
              label: "Identifiant",
              value: user.username,
              onChange: (e) => setUser({ ...user, username: e.currentTarget.value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.TextInput,
            {
              label: "Nom affich\xE9",
              value: user.displayName,
              onChange: (e) => setUser({ ...user, displayName: e.currentTarget.value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.PasswordInput,
            {
              label: "Mot de passe (12 caract\xE8res minimum)",
              value: user.password,
              onChange: (e) => setUser({ ...user, password: e.currentTarget.value }),
              autoComplete: "new-password"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Select,
            {
              label: "R\xF4le",
              data: ["Admin", "Gestionnaire", "Consultation"],
              value: user.role,
              onChange: (v) => setUser({ ...user, role: v ?? "Consultation" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.MultiSelect,
            {
              label: "Exercices autoris\xE9s",
              data: contexts,
              value: user.contextIds,
              onChange: (v) => setUser({ ...user, contextIds: v })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Button,
            {
              loading: busy,
              onClick: () => void submit("/admin/users", {
                ...user,
                contextIds: user.contextIds.map(Number)
              }),
              children: "Cr\xE9er le compte"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { size: "xs", c: "dimmed", children: "Les administrateurs acc\xE8dent \xE0 tous les contextes configur\xE9s. Les autres r\xF4les n\xE9cessitent une attribution explicite." })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, children: "Modifier les droits" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Select,
            {
              label: "Utilisateur",
              data: result.data?.users.map((u) => ({
                value: String(u.id),
                label: `${u.display_name} (${u.username})`
              })) ?? [],
              value: access.id,
              onChange: (v) => {
                const u = result.data?.users.find((x) => x.id === Number(v));
                if (u)
                  setAccess({
                    id: String(u.id),
                    role: u.role,
                    enabled: !!u.enabled,
                    contextIds: result.data?.grants.filter((g) => g.user_id === u.id).map((g) => String(g.context_id)) ?? []
                  });
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Select,
            {
              label: "R\xF4le",
              data: ["Admin", "Gestionnaire", "Consultation"],
              value: access.role,
              onChange: (v) => setAccess({ ...access, role: v ?? "Consultation" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.MultiSelect,
            {
              label: "Exercices autoris\xE9s",
              data: contexts,
              value: access.contextIds,
              onChange: (v) => setAccess({ ...access, contextIds: v })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Checkbox,
            {
              label: "Compte actif",
              checked: access.enabled,
              onChange: (e) => setAccess({ ...access, enabled: e.currentTarget.checked })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            import_core4.Button,
            {
              loading: busy,
              disabled: !access.id,
              variant: "light",
              onClick: () => void submit(
                `/admin/users/${access.id}/access`,
                { ...access, contextIds: access.contextIds.map(Number) },
                "PUT"
              ),
              children: "Appliquer les droits"
            }
          )
        ] }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Tabs.Panel, { value: "routes", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: "xl", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, children: "Associer les exercices ZAOUIA et DIAF" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "orange", children: "V\xE9rifiez que les deux contextes repr\xE9sentent le m\xEAme exercice. La route conserve les identifiants et exclut refsta." }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          import_core4.Select,
          {
            label: "Source ZAOUIA ma\xEEtre",
            data: contexts.filter(
              (c) => result.data?.stations.find(
                (s) => s.id === result.data?.contexts.find((x) => String(x.id) === c.value)?.station_id
              )?.code === "ZAOUIA"
            ),
            value: route.sourceContextId,
            onChange: (v) => setRoute({ ...route, sourceContextId: v ?? "" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          import_core4.Select,
          {
            label: "Destination DIAF",
            data: contexts.filter(
              (c) => result.data?.stations.find(
                (s) => s.id === result.data?.contexts.find((x) => String(x.id) === c.value)?.station_id
              )?.code === "DIAF"
            ),
            value: route.targetContextId,
            onChange: (v) => setRoute({ ...route, targetContextId: v ?? "" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          import_core4.Button,
          {
            loading: busy,
            onClick: () => void submit("/admin/routes", {
              sourceContextId: Number(route.sourceContextId),
              targetContextId: Number(route.targetContextId)
            }),
            children: "Ajouter la route"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Th, { children: "Source" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Th, { children: "Destination" })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tbody, { children: result.data?.routes.map((r) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: contexts.find((c) => c.value === String(r.source_context_id))?.label }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: contexts.find((c) => c.value === String(r.target_context_id))?.label })
          ] }, r.id)) })
        ] })
      ] }) }) })
    ] }) })
  ] });
}
function EmptyConfiguration({
  contexts,
  onAdmin
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Paper, { withBorder: true, p: 50, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { align: "center", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { fw: 700, size: "xl", children: contexts.length ? "Choisissez votre station et votre exercice" : "Configurez votre premier exercice" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { c: "dimmed", ta: "center", children: "Ajoutez le serveur MySQL, la station ZAOUIA puis la base courante. Les donn\xE9es restent dans votre base historique." }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Button, { onClick: onAdmin, children: "Ouvrir l\u2019administration" })
  ] }) });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Administration,
  EmptyConfiguration
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

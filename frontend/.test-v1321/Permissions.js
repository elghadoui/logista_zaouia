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

// frontend/src/Permissions.tsx
var Permissions_exports = {};
__export(Permissions_exports, {
  PermissionContext: () => PermissionContext,
  UserPermissions: () => UserPermissions,
  permissionDisabled: () => permissionDisabled,
  usePermissions: () => usePermissions
});
module.exports = __toCommonJS(Permissions_exports);
var import_react = require("react");
var import_core = require("@mantine/core");

// frontend/src/api.ts
var titles = {};
var api = async () => {
  throw Error("No network fixture");
};
var useApi = (url) => ({ loading: false, error: "", refresh: () => {
}, data: url?.endsWith("/catalog") ? globalThis.__drFixture : url?.endsWith("/mode") ? { mode: "Production", registered: false } : url?.endsWith("/reservations/status") ? { ready: true } : url?.includes("/cycles?page") ? { total: 0, rows: [], summary: { cycles: 0, attente: 0, palettes: 0, consommations: [] } } : void 0 });

// frontend/src/Permissions.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var PermissionContext = (0, import_react.createContext)([]);
function usePermissions(module2) {
  return (0, import_react.useContext)(PermissionContext).find((p) => p.module === module2) ?? {
    module: module2,
    view: false,
    add: false,
    modify: false,
    delete: false
  };
}
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PermissionContext,
  UserPermissions,
  permissionDisabled,
  usePermissions
});

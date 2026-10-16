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

// frontend/src/DrencherManagement.tsx
var DrencherManagement_exports = {};
__export(DrencherManagement_exports, {
  DrencherManagement: () => DrencherManagement
});
module.exports = __toCommonJS(DrencherManagement_exports);
var import_core5 = require("@mantine/core");

// frontend/src/DrencherProducts.tsx
var import_react = require("react");
var import_core = require("@mantine/core");
var import_notifications = require("@mantine/notifications");

// frontend/src/api.ts
var api = async () => {
  throw Error("No network fixture");
};
var useApi = (url) => ({ loading: false, error: "", refresh: () => {
}, data: url?.endsWith("/catalog") ? globalThis.__drFixture : url?.endsWith("/mode") ? { mode: "Production", registered: false } : url?.endsWith("/reservations/status") ? { ready: true } : url?.includes("/cycles?page") ? { total: 0, rows: [], summary: { cycles: 0, attente: 0, palettes: 0, consommations: [] } } : void 0 });

// frontend/src/DrencherProducts.tsx
var import_jsx_runtime = require("react/jsx-runtime");
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
  const [search, setSearch] = (0, import_react.useState)(""), [status, setStatus] = (0, import_react.useState)(null), [page, setPage] = (0, import_react.useState)(1), [form, setForm] = (0, import_react.useState)(null), [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)("");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Title, { order: 4, children: "Produits enregistr\xE9s" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", children: "R\xE9f\xE9rentiel commun \xB7 r\xE9f\xE9rences et unit\xE9s conserv\xE9es apr\xE8s cr\xE9ation." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_core.Button,
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
    !form && error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_core.TextInput,
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_core.Select,
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Badge, { variant: "light", children: [
        rows.length,
        " produits"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.ScrollContainer, { minWidth: 620, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table, { striped: true, highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tr, { children: ["R\xE9f\xE9rence", "Produit", "Mati\xE8re active", "F04", "Unit\xE9", "Statut", "Actions"].map(
        (h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: h }, h)
      ) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tbody, { children: rows.slice((page - 1) * 25, page * 25).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.reference }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { fw: 600, children: p.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.matiereActive || "Non renseign\xE9e" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.afficherF04 === false ? "Masqu\xE9" : "Affich\xE9" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.unite }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Badge, { color: p.actif ? "green" : "gray", children: p.actif ? "Actif" : "Inactif" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { gap: "xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Button,
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Button,
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
    !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { c: "dimmed", children: "Aucun produit ne correspond \xE0 cette recherche." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.Pagination,
      {
        value: page,
        onChange: setPage,
        total: Math.max(1, Math.ceil(rows.length / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.Modal,
      {
        opened: form !== null,
        onClose: () => {
          if (!busy) setForm(null);
        },
        title: form?.id ? "Modifier le produit" : "Ajouter un produit",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: error }) : null,
          form ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.TextInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.TextInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.SimpleGrid, { cols: 2, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.Select,
                {
                  label: "Unit\xE9",
                  required: true,
                  disabled: form.id !== 0 || busy,
                  value: form.unite,
                  data: ["L", "kg", "g", "mL"],
                  onChange: (v) => setForm((p) => p ? { ...p, unite: v ?? "L" } : p)
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.TextInput,
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
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.Checkbox,
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
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", children: "Ces param\xE8tres sont conserv\xE9s dans chaque nouveau cycle. Les cycles existants gardent leurs param\xE8tres ; un produit masqu\xE9 reste comptabilis\xE9 en stock." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.Checkbox,
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
            form.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "xs", c: "dimmed", children: "La r\xE9f\xE9rence et l'unit\xE9 sont immuables. La d\xE9sactivation conserve les usages et l'historique." }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "end", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", disabled: busy, onClick: () => setForm(null), children: "Annuler" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.Button,
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

// frontend/src/DrencherPrograms.tsx
var import_react2 = require("react");
var import_core2 = require("@mantine/core");
var import_notifications2 = require("@mantine/notifications");

// frontend/src/drencherTypes.ts
var number = (v) => v == null ? "\u2014" : v.toLocaleString("fr-MA", { maximumFractionDigits: 6 });
var today = () => {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// frontend/src/DrencherPrograms.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var empty2 = { id: 0, version: 0, nom: "", actif: true, produits: [] };
function DrencherPrograms({ path, catalog, canAdd, canModify, refresh }) {
  const [stateProgram, setStateProgram] = (0, import_react2.useState)(null);
  const [search, setSearch] = (0, import_react2.useState)(""), [status, setStatus] = (0, import_react2.useState)(null), [page, setPage] = (0, import_react2.useState)(1), [form, setForm] = (0, import_react2.useState)(null), [selected, setSelected] = (0, import_react2.useState)(null), [version, setVersion] = (0, import_react2.useState)(null), [error, setError] = (0, import_react2.useState)(""), [busy, setBusy] = (0, import_react2.useState)(false);
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Title, { order: 4, children: "Programmes de traitement" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", c: "dimmed", children: "Chaque enregistrement cr\xE9e une version ; les dosages des cycles restent inchang\xE9s." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_core2.Button,
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_core2.TextInput,
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
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_core2.Select,
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.ScrollContainer, { minWidth: 600, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { striped: true, highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tr, { children: ["Programme", "Statut", "Version", "Produits", "Actions"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: h }, h)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: rows.slice((page - 1) * 25, page * 25).map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { fw: 600, children: p.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Badge, { color: p.actif ? "green" : "gray", children: p.actif ? "Actif" : "Inactif" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
          "v",
          p.version
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.produits.length }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { gap: "xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.Button,
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
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.Button,
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
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.Button,
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
    !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: "Aucun programme ne correspond \xE0 cette recherche." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_core2.Pagination,
      {
        value: page,
        onChange: setPage,
        total: Math.max(1, Math.ceil(rows.length / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_core2.Modal,
      {
        opened: form !== null,
        onClose: () => {
          if (!busy) setForm(null);
        },
        title: form?.id ? "Enregistrer une nouvelle version" : "Ajouter un programme",
        size: "lg",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "red", children: error }) : null,
          form ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.TextInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.Checkbox,
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
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Produit" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Dose (unit\xE9 / 1000 L eau)" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Actions" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: form.produits.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_core2.Select,
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
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_core2.NumberInput,
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
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_core2.Button,
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
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.Button,
              {
                variant: "light",
                disabled: busy || form.produits.length >= 30,
                onClick: () => setForm(
                  (p) => p ? { ...p, produits: [...p.produits, { produitId: 0, dose: 0 }] } : p
                ),
                children: "Ajouter une ligne produit"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Alert, { children: [
              "Version \xE0 enregistrer : ",
              form.version + 1,
              ". Aucune modification r\xE9troactive des cycles ou des versions ant\xE9rieures."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "end", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { variant: "default", disabled: busy, onClick: () => setForm(null), children: "Annuler" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                import_core2.Button,
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_core2.Modal,
      {
        opened: stateProgram !== null,
        onClose: () => {
          if (!busy) setStateProgram(null);
        },
        title: stateProgram?.actif ? "D\xE9sactiver le programme ?" : "Activer le programme ?",
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "red", children: error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
            stateProgram?.nom,
            " : une nouvelle version sera cr\xE9\xE9e, sans changer les cycles ant\xE9rieurs."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { variant: "default", disabled: busy, onClick: () => setStateProgram(null), children: "Annuler" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { loading: busy, disabled: !canModify, onClick: () => void changeState(), children: "Confirmer" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_core2.Drawer,
      {
        opened: selected !== null,
        onClose: () => setSelected(null),
        title: "Produits, dosages et versions du programme",
        position: "right",
        size: "lg",
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
          history.error ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "red", children: history.error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.Select,
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
          current ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Title, { order: 4, children: [
              current.programme.nom,
              " \xB7 v",
              current.version
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Badge, { color: current.programme.actif ? "green" : "gray", children: current.programme.actif ? "Actif" : "Inactif" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
              current.auteur,
              " \xB7 ",
              current.dateCreation
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Produit / r\xE9f\xE9rence" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Dosage appliqu\xE9" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: current.programme.produits.map((d) => {
                const p = catalog.produits.find((p2) => p2.id === d.produitId);
                return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
                    p?.nom ?? "Produit #" + d.produitId,
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", children: p?.reference ?? "\u2014" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
                    number(d.dose),
                    " ",
                    p?.unite ?? "",
                    " / 1000 L"
                  ] })
                ] }, d.produitId);
              }) })
            ] })
          ] }) : history.loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { children: "Chargement des versions\u2026" }) : null
        ] })
      }
    )
  ] });
}

// frontend/src/DrencherStock.tsx
var import_react4 = require("react");
var import_core4 = require("@mantine/core");
var import_hooks = require("@mantine/hooks");
var import_notifications3 = require("@mantine/notifications");

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
function DrencherStockDocuments({ path, catalog }) {
  const doc = useDocument();
  const [opened, setOpened] = (0, import_react3.useState)(false);
  const [type, setType] = (0, import_react3.useState)("stock");
  const [product, setProduct] = (0, import_react3.useState)(null), [lot, setLot] = (0, import_react3.useState)(null);
  const [active, setActive] = (0, import_react3.useState)(null), [nature, setNature] = (0, import_react3.useState)(null);
  const [from, setFrom] = (0, import_react3.useState)(today), [to, setTo] = (0, import_react3.useState)(today), [details, setDetails] = (0, import_react3.useState)(true);
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

// frontend/src/DrencherStock.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var empty3 = () => ({
  produitId: 0,
  lot: "",
  peremption: "",
  quantite: 0,
  bon: "",
  date: today()
});
function DrencherStock({ path, catalog, canAdd, refresh }) {
  const [search, setSearch] = (0, import_react4.useState)(""), [filter, setFilter] = (0, import_react4.useState)(null), [available, setAvailable] = (0, import_react4.useState)(null), [nature, setNature] = (0, import_react4.useState)(null), [page, setPage] = (0, import_react4.useState)(1), [opened, setOpened] = (0, import_react4.useState)(false), [entry, setEntry] = (0, import_react4.useState)(empty3), [error, setError] = (0, import_react4.useState)(""), [busy, setBusy] = (0, import_react4.useState)(false), [lotPage, setLotPage] = (0, import_react4.useState)(1);
  const [query] = (0, import_hooks.useDebouncedValue)(search, 200);
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Title, { order: 4, children: "Stock local Drencher" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { size: "sm", c: "dimmed", children: "Disponibilit\xE9s par produit et lot fabricant \xB7 sorties apr\xE8s validation qualit\xE9." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DrencherStockDocuments, { path, catalog }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          import_core4.Button,
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
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_core4.TextInput,
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
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_core4.Select,
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
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_core4.Select,
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
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.ScrollContainer, { minWidth: 580, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table, { striped: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tr, { children: ["R\xE9f\xE9rence", "Produit", "Disponible", "Lots fabricants"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Th, { children: h }, h)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tbody, { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: p.reference }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { fw: 600, children: p.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Td, { children: [
          number(p.lots.reduce((n, l) => n + l.solde, 0)),
          " ",
          p.unite
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: p.lots.length })
      ] }, p.id)) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Title, { order: 5, children: "D\xE9tail des lots fabricants" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.ScrollContainer, { minWidth: 580, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table, { highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tr, { children: ["Produit", "Lot fabricant", "P\xE9remption", "Quantit\xE9 disponible"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Th, { children: h }, h)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tbody, { children: lots.slice((lotPage - 1) * 25, lotPage * 25).map((l) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: l.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: l.lot }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Td, { children: [
          drDateText(l.peremption),
          drExpired(l.peremption, today()) ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Badge, { color: "orange", ml: "xs", children: "P\xE9rim\xE9" }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Td, { children: [
          number(l.solde),
          " ",
          l.unite
        ] })
      ] }, l.id)) })
    ] }) }),
    !lots.length ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { c: "dimmed", children: "Aucun lot ne correspond \xE0 ces filtres." }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_core4.Pagination,
      {
        value: lotPage,
        onChange: setLotPage,
        total: Math.max(1, Math.ceil(lots.length / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Title, { order: 4, children: "R\xE9ceptions et mouvements" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        import_core4.Select,
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
    movements.error ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "red", children: movements.error }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.ScrollContainer, { minWidth: 800, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table, { striped: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tr, { children: ["Date", "Produit / lot", "Nature / cycle", "Quantit\xE9", "Bon magasin", "Auteur"].map(
        (h) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Th, { children: h }, h)
      ) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Tbody, { children: movements.data?.rows.map((m) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: drDateText(m.dateReception ?? m.dateCreation) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Td, { children: [
          m.nom,
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { size: "xs", c: "dimmed", children: m.lot })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Td, { children: [
          m.nature === "Entree" ? "R\xE9ception magasin" : m.nature,
          m.cycleId ? " \xB7 #" + m.cycleId : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Table.Td, { children: [
          number(m.quantite),
          " ",
          m.unite
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: m.bon || "\u2014" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Table.Td, { children: m.auteur })
      ] }, m.id)) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_core4.Pagination,
      {
        value: page,
        onChange: setPage,
        total: Math.max(1, Math.ceil((movements.data?.total ?? 0) / 25))
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_core4.Modal,
      {
        opened,
        onClose: () => {
          if (!busy) setOpened(false);
        },
        title: "R\xE9ception du magasin central",
        size: "lg",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Alert, { color: "red", children: error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.SimpleGrid, { cols: { base: 1, sm: 2 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.Select,
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
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.NumberInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
              import_core4.TextInput,
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
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Text, { size: "sm", c: "dimmed", children: "Un m\xEAme bon et lot ne peut \xEAtre enregistr\xE9 deux fois. Les consommations restent d\xE9duites uniquement apr\xE8s validation qualit\xE9." }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_core4.Group, { justify: "end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Button, { variant: "default", disabled: busy, onClick: () => setOpened(false), children: "Annuler" }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_core4.Button, { loading: busy, disabled: !canAdd, onClick: () => void receive(), children: "Enregistrer la r\xE9ception" })
          ] })
        ] })
      }
    )
  ] });
}

// frontend/src/DrencherManagement.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
function DrencherManagement(props) {
  const visible = ["products", "programs", "stock"].filter(
    (k) => props.permissions[k].view
  );
  const active = visible.includes(props.activeTab ?? "") ? props.activeTab : visible[0];
  if (!visible.length) return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Alert, { children: "Aucun droit de gestion Drencher attribu\xE9." });
  const rights = (key) => ({
    ...props,
    canAdd: props.permissions[key].add,
    canModify: props.permissions[key].modify
  });
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Tabs, { value: active, onChange: props.onTabChange, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_core5.Tabs.List, { children: [
      props.permissions.products.view ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Tabs.Tab, { value: "products", children: "Produits" }) : null,
      props.permissions.programs.view ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Tabs.Tab, { value: "programs", children: "Programmes" }) : null,
      props.permissions.stock.view ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Tabs.Tab, { value: "stock", children: "Stock local" }) : null
    ] }),
    props.permissions.products.view ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Tabs.Panel, { value: "products", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DrencherProducts, { ...rights("products") }) }) : null,
    props.permissions.programs.view ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Tabs.Panel, { value: "programs", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DrencherPrograms, { ...rights("programs") }) }) : null,
    props.permissions.stock.view ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_core5.Tabs.Panel, { value: "stock", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(DrencherStock, { ...rights("stock") }) }) : null
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DrencherManagement
});

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

// frontend/src/DrencherProducts.tsx
var DrencherProducts_exports = {};
__export(DrencherProducts_exports, {
  DrencherProducts: () => DrencherProducts
});
module.exports = __toCommonJS(DrencherProducts_exports);
var import_react2 = require("react");
var import_core = require("@mantine/core");
var import_notifications = require("@mantine/notifications");

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
  const [search, setSearch] = (0, import_react2.useState)(""), [status, setStatus] = (0, import_react2.useState)(null), [page, setPage] = (0, import_react2.useState)(1), [form, setForm] = (0, import_react2.useState)(null), [busy, setBusy] = (0, import_react2.useState)(false), [error, setError] = (0, import_react2.useState)("");
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DrencherProducts
});

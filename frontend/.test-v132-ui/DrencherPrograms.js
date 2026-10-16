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

// frontend/src/DrencherPrograms.tsx
var DrencherPrograms_exports = {};
__export(DrencherPrograms_exports, {
  DrencherPrograms: () => DrencherPrograms
});
module.exports = __toCommonJS(DrencherPrograms_exports);

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

// frontend/src/DrencherPrograms.tsx
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

// frontend/src/drencherTypes.ts
var number = (v) => v == null ? "\u2014" : v.toLocaleString("fr-MA", { maximumFractionDigits: 6 });

// frontend/src/DrencherPrograms.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var empty = { id: 0, version: 0, nom: "", actif: true, produits: [] };
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
      import_notifications.notifications.show({
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Title, { order: 4, children: "Programmes de traitement" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", children: "Chaque enregistrement cr\xE9e une version ; les dosages des cycles restent inchang\xE9s." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_core.Button,
        {
          disabled: !canAdd,
          onClick: () => {
            setForm({ ...empty, produits: [] });
            setError("");
          },
          children: "Ajouter un programme"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_core.TextInput,
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_core.Select,
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.ScrollContainer, { minWidth: 600, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table, { striped: true, highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tr, { children: ["Programme", "Statut", "Version", "Produits", "Actions"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: h }, h)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tbody, { children: rows.slice((page - 1) * 25, page * 25).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { fw: 600, children: p.nom }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Badge, { color: p.actif ? "green" : "gray", children: p.actif ? "Actif" : "Inactif" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Td, { children: [
          "v",
          p.version
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.produits.length }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { gap: "xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Button,
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Button,
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Button,
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
    !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { c: "dimmed", children: "Aucun programme ne correspond \xE0 cette recherche." }) : null,
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
        title: form?.id ? "Enregistrer une nouvelle version" : "Ajouter un programme",
        size: "lg",
        centered: true,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: error }) : null,
          form ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.TextInput,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Checkbox,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: "Produit" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: "Dose (unit\xE9 / 1000 L eau)" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: "Actions" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tbody, { children: form.produits.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_core.Select,
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
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_core.NumberInput,
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
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  import_core.Button,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Button,
              {
                variant: "light",
                disabled: busy || form.produits.length >= 30,
                onClick: () => setForm(
                  (p) => p ? { ...p, produits: [...p.produits, { produitId: 0, dose: 0 }] } : p
                ),
                children: "Ajouter une ligne produit"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Alert, { children: [
              "Version \xE0 enregistrer : ",
              form.version + 1,
              ". Aucune modification r\xE9troactive des cycles ou des versions ant\xE9rieures."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "end", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", disabled: busy, onClick: () => setForm(null), children: "Annuler" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.Button,
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.Modal,
      {
        opened: stateProgram !== null,
        onClose: () => {
          if (!busy) setStateProgram(null);
        },
        title: stateProgram?.actif ? "D\xE9sactiver le programme ?" : "Activer le programme ?",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
          error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Text, { children: [
            stateProgram?.nom,
            " : une nouvelle version sera cr\xE9\xE9e, sans changer les cycles ant\xE9rieurs."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "end", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", disabled: busy, onClick: () => setStateProgram(null), children: "Annuler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { loading: busy, disabled: !canModify, onClick: () => void changeState(), children: "Confirmer" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.Drawer,
      {
        opened: selected !== null,
        onClose: () => setSelected(null),
        title: "Produits, dosages et versions du programme",
        position: "right",
        size: "lg",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
          history.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: history.error }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Select,
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
          current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Title, { order: 4, children: [
              current.programme.nom,
              " \xB7 v",
              current.version
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Badge, { color: current.programme.actif ? "green" : "gray", children: current.programme.actif ? "Actif" : "Inactif" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Text, { size: "sm", children: [
              current.auteur,
              " \xB7 ",
              current.dateCreation
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: "Produit / r\xE9f\xE9rence" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: "Dosage appliqu\xE9" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tbody, { children: current.programme.produits.map((d) => {
                const p = catalog.produits.find((p2) => p2.id === d.produitId);
                return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Td, { children: [
                    p?.nom ?? "Produit #" + d.produitId,
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "xs", c: "dimmed", children: p?.reference ?? "\u2014" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Td, { children: [
                    number(d.dose),
                    " ",
                    p?.unite ?? "",
                    " / 1000 L"
                  ] })
                ] }, d.produitId);
              }) })
            ] })
          ] }) : history.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { children: "Chargement des versions\u2026" }) : null
        ] })
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DrencherPrograms
});

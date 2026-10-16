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

// frontend/src/DrencherEditor.tsx
var DrencherEditor_exports = {};
__export(DrencherEditor_exports, {
  DrencherEditor: () => DrencherEditor
});
module.exports = __toCommonJS(DrencherEditor_exports);

// frontend/src/DrencherPalettePicker.tsx
var import_react2 = require("react");
var import_core = require("@mantine/core");
var import_hooks = require("@mantine/hooks");

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
var amount = (water, dose) => Math.round(water * dose / 1e3 * 1e6) / 1e6;
var number = (v) => v == null ? "\u2014" : v.toLocaleString("fr-MA", { maximumFractionDigits: 6 });
var today = () => {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// frontend/src/DrencherPalettePicker.tsx
var import_jsx_runtime = require("react/jsx-runtime");
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
  const [draft, setDraft] = (0, import_react2.useState)(ids), [reception, setReception] = (0, import_react2.useState)(""), [numpal, setNumpal] = (0, import_react2.useState)(""), [search, setSearch] = (0, import_react2.useState)(""), [page, setPage] = (0, import_react2.useState)(1), [pageSize, setPageSize] = (0, import_react2.useState)("50"), [codvar, setCodvar] = (0, import_react2.useState)(null), [refadh, setRefadh] = (0, import_react2.useState)(null), [refver, setRefver] = (0, import_react2.useState)(null), [busy, setBusy] = (0, import_react2.useState)(false), [error, setError] = (0, import_react2.useState)(""), [info, setInfo] = (0, import_react2.useState)("");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_core.Modal,
    {
      opened: true,
      onClose: () => {
        if (!busy) onCancel();
      },
      title: "S\xE9lectionner les palettes",
      size: "95%",
      centered: true,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Stack, { children: [
        error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: error }) : null,
        info ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "blue", children: info }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { align: "end", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.NumberInput,
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.NumberInput,
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.TextInput,
            {
              label: "Recherche rapide",
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Select,
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Select,
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
        result.error || filters.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Alert, { color: "red", children: result.error || filters.error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Button,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Button,
              {
                variant: "light",
                loading: busy,
                disabled: !reception,
                onClick: () => void allLot(),
                children: "Toutes les palettes disponibles du lot"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "subtle", disabled: busy, onClick: () => setDraft([]), children: "Retirer toute la s\xE9lection" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Badge, { children: [
            draft.length,
            " s\xE9lectionn\xE9es"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.ScrollContainer, { minWidth: 900, h: 430, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table, { stickyHeader: true, striped: true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tr, { children: [
            "",
            "R\xE9ception",
            "Palette",
            "Vari\xE9t\xE9",
            "Producteur / adh\xE9rent",
            "Verger",
            "Poids (kg)",
            "Disponibilit\xE9"
          ].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Th, { children: h }, i)) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Tbody, { children: result.data?.rows.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_core.Checkbox,
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.numrec }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.numpal }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.variete ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.adherent ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.verger ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: number(p.poids) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Table.Td, { children: p.cycleAffecte ? `Cycle #${p.cycleAffecte} (${p.etatCycle})${p.cycleAffecte === cycleId ? " \xB7 ce cycle" : ""}` : "Disponible" })
          ] }, p.numpal)) })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Pagination,
            {
              value: page,
              onChange: setPage,
              total: Math.max(1, Math.ceil((result.data?.total ?? 0) / Number(pageSize)))
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.Select,
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", children: "La s\xE9lection reste conserv\xE9e entre les pages et les r\xE9ceptions. Les palettes sont r\xE9serv\xE9es \xE0 l'enregistrement du brouillon ; l'API recontr\xF4le les conflits." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "end", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { variant: "default", disabled: busy, onClick: onCancel, children: "Annuler" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Button, { loading: busy, onClick: () => void confirm(), children: "Confirmer la s\xE9lection" })
        ] })
      ] })
    }
  );
}

// frontend/src/DrencherEditor.tsx
var import_react3 = require("react");
var import_core2 = require("@mantine/core");
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  const [form, setForm] = (0, import_react3.useState)(() => ({
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
  const [selected, setSelected] = (0, import_react3.useState)(s?.palettes.map((p) => p.numpal) ?? []), [summary, setSummary] = (0, import_react3.useState)(
    s ? summarizePalettes(s.palettes) : null
  ), [picker, setPicker] = (0, import_react3.useState)(false), [extra, setExtra] = (0, import_react3.useState)(null), [error, setError] = (0, import_react3.useState)(""), [busy, setBusy] = (0, import_react3.useState)(false);
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Title, { order: 3, children: correction ? "Corriger le cycle valid\xE9" : initial ? "Modifier le cycle" : "Nouveau cycle" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { variant: "default", onClick: onCancel, children: "Retour" })
    ] }),
    error ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "red", children: error }) : null,
    correction ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "orange", children: "Correction qualit\xE9 : motif obligatoire, palettes conserv\xE9es, ajustement du stock et historique pr\xE9serv\xE9." }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "blue", children: "L'enregistrement conserve un brouillon sans sortie de stock. La soumission d\xE9duit le stock r\xE9el ; la qualit\xE9 valide ensuite le cycle. Toute modification d'un cycle en attente le remet en brouillon." }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Paper, { withBorder: true, p: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 1, sm: 3 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_core2.TextInput,
        {
          type: "date",
          label: "Date du traitement",
          value: form.date,
          onChange: (e) => change("date", e.currentTarget.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_core2.TextInput,
        {
          type: "time",
          label: "D\xE9but",
          value: form.debut,
          onChange: (e) => change("debut", e.currentTarget.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_core2.TextInput,
        {
          type: "time",
          label: "Fin (m\xEAme jour)",
          value: form.fin,
          onChange: (e) => change("fin", e.currentTarget.value)
        }
      )
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Title, { order: 4, children: "R\xE9ceptions & palettes" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Badge, { children: [
          selected.length,
          " s\xE9lectionn\xE9es"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { mt: "sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
          "Poids total : ",
          number(summary?.poids),
          " kg"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
          "R\xE9ceptions : ",
          summary?.receptions ?? 0
        ] }),
        !correction ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { onClick: () => setPicker(true), children: selected.length ? "Modifier la s\xE9lection" : "S\xE9lectionner les palettes" }) : null
      ] }),
      summary?.groups.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { mt: "sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Vari\xE9t\xE9" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Producteur / adh\xE9rent" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Verger" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Palettes" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Poids kg" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: summary.groups.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: g.variete ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: g.adherent ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: g.verger ?? "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: g.count }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: number(g.poids) })
        ] }, i)) })
      ] }) : null
    ] }),
    picker ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 1, sm: 3 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: "Programme de traitement",
            searchable: true,
            value: form.programmeId ? String(form.programmeId) : null,
            data: catalog.programmes.filter((p) => p.actif || p.id === form.programmeId).map((p) => ({ value: String(p.id), label: `${p.nom} \xB7 v${p.version}` })),
            onChange: chooseProgram
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.NumberInput,
          {
            label: "Eau initiale (L)",
            min: 0,
            decimalScale: 6,
            value: form.eauInitiale,
            onChange: (v) => change("eauInitiale", numeric(v))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.NumberInput,
          {
            label: "Eau totale consomm\xE9e (L)",
            min: 0,
            decimalScale: 6,
            value: form.eauConsommee,
            onChange: (v) => change("eauConsommee", numeric(v))
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "xs", c: "dimmed", mt: "sm", children: [
        "Version appliqu\xE9e au cycle : ",
        form.programmeVersion || "\u2014",
        ". Les consommations d\xE9j\xE0 saisies sont conserv\xE9es lors d\u2019un changement de programme pour examen qualit\xE9."
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Title, { order: 4, children: "Produits & consommations" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.ScrollContainer, { minWidth: 1080, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tr, { children: [
          "Produit",
          "Dose / 1000 L",
          "Initial calcul\xE9",
          "Final th\xE9orique",
          "Machine",
          "R\xE9el physique",
          "\xC9carts r\xE9el",
          "Lots fabricants / quantit\xE9s"
        ].map((h) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: h }, h)) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: form.produits.map((p, i) => {
          const ref = catalog.produits.find((r) => r.id === p.produitId), unit = ref?.unite ?? "", initialAmount = amount(form.eauInitiale, p.dose), final = amount(form.eauConsommee, p.dose);
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              ref?.nom,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", children: unit })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.NumberInput,
              {
                "aria-label": `Dosage ${ref?.nom}`,
                min: 0,
                w: 110,
                decimalScale: 6,
                value: p.dose,
                onChange: (v) => usage(i, { dose: numeric(v) })
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              number(initialAmount),
              " ",
              unit
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              number(final),
              " ",
              unit
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.NumberInput,
              {
                "aria-label": `Machine ${ref?.nom}`,
                min: 0,
                w: 100,
                decimalScale: 6,
                value: p.machine ?? "",
                onChange: (v) => usage(i, { machine: nullable(v) })
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.NumberInput,
              {
                "aria-label": `R\xE9el ${ref?.nom}`,
                min: 0,
                w: 100,
                decimalScale: 6,
                value: p.reel ?? "",
                onChange: (v) => usage(i, { reel: nullable(v) })
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              "Th\xE9orie : ",
              number(p.reel === null ? null : p.reel - final),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("br", {}),
              "Machine :",
              " ",
              number(p.reel === null || p.machine === null ? null : p.reel - p.machine)
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { gap: "xs", children: [
              p.lots.map((l, j) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { gap: "xs", wrap: "nowrap", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_core2.Select,
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
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_core2.NumberInput,
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
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  import_core2.Button,
                  {
                    variant: "subtle",
                    "aria-label": "Retirer cette r\xE9partition",
                    onClick: () => usage(i, { lots: p.lots.filter((_, k) => k !== j) }),
                    children: "\xD7"
                  }
                )
              ] }, j)),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                import_core2.Button,
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
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "xs", children: [
                "R\xE9parti : ",
                number(p.lots.reduce((n, l) => n + l.quantite, 0)),
                " ",
                unit
              ] })
            ] }) })
          ] }, p.produitId);
        }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { mt: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: "Produit suppl\xE9mentaire r\xE9ellement utilis\xE9",
            searchable: true,
            clearable: true,
            value: extra,
            onChange: setExtra,
            data: catalog.produits.filter((p) => p.actif && !form.produits.some((u) => u.produitId === p.id)).map((p) => ({ value: String(p.id), label: p.nom }))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Button,
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_core2.Textarea,
      {
        label: "Observations / \xE9carts de traitement",
        maxLength: 2e3,
        value: form.observations,
        onChange: (e) => change("observations", e.currentTarget.value)
      }
    ),
    correction ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      import_core2.Textarea,
      {
        label: "Motif obligatoire de correction",
        maxLength: 1e3,
        value: form.motif,
        onChange: (e) => change("motif", e.currentTarget.value)
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { variant: "default", onClick: onCancel, children: "Annuler" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { loading: busy, onClick: () => void save(), children: correction ? "Enregistrer la correction & ajuster le stock" : "Enregistrer le brouillon" })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DrencherEditor
});

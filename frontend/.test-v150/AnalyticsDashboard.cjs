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

// frontend/src/AnalyticsDashboard.tsx
var AnalyticsDashboard_exports = {};
__export(AnalyticsDashboard_exports, {
  AnalyticsDashboard: () => AnalyticsDashboard
});
module.exports = __toCommonJS(AnalyticsDashboard_exports);
var import_core2 = require("@mantine/core");
var import_react2 = require("react");
var import_hooks = require("@mantine/hooks");

// frontend/src/api.ts
var useApi = () => ({ data: globalThis.__analytics, loading: false, error: "", refresh: () => {
} });

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

// frontend/src/AnalyticsDashboard.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var defaults = {
  period: "campaign",
  from: "",
  to: "",
  category: "",
  product: "",
  variety: "",
  producer: "",
  orchard: "",
  crateType: "",
  movement: "",
  search: "",
  otherContext: "",
  previousContext: "",
  previousOtherContext: ""
};
var storage = (id) => `vitasouss.analytics.v150.${id}`;
function readFilters(id) {
  try {
    const v = JSON.parse(sessionStorage.getItem(storage(id)) ?? "null");
    if (v && typeof v === "object")
      return {
        ...defaults,
        ...Object.fromEntries(
          Object.entries(v).filter(([k, v2]) => k in defaults && typeof v2 === "string")
        )
      };
  } catch {
  }
  return { ...defaults };
}
var format = (n, digits = 3) => n == null ? "Indisponible" : new Intl.NumberFormat("fr-MA", { maximumFractionDigits: digits }).format(n);
var tonnes = (n) => n == null ? "Indisponible" : `${format(n / 1e3)} t`;
function Chart({
  title,
  rows,
  crates = false,
  onChoose
}) {
  const max = Math.max(1, ...rows.map((r) => Math.abs((crates ? r.quantity : r.kg) ?? 0)));
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, mb: "sm", children: title }),
    rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: "Aucune donn\xE9e sur cette p\xE9riode." }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.ScrollArea, { h: Math.min(350, rows.length * 40 + 20), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "analytics-bars", role: "group", children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "button",
      {
        type: "button",
        className: "analytics-bar",
        disabled: !onChoose,
        onClick: () => onChoose?.(r),
        "aria-label": `${r.label}, ${r.station}, ${crates ? format(r.quantity, 0) : tonnes(r.kg)}, ${r.count} mouvements ou lots`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "analytics-bar-label", children: [
            r.label,
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("small", { children: [
              r.station,
              " \xB7 ",
              r.count,
              " ",
              crates ? "mvt." : "lots"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "analytics-track", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "span",
            {
              className: r.station === "DIAF" ? "analytics-fill diaf" : "analytics-fill",
              style: {
                width: `${Math.max(0.4, Math.abs((crates ? r.quantity : r.kg) ?? 0) / max * 100)}%`
              }
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: crates ? format(r.quantity, 0) : tonnes(r.kg) })
        ]
      },
      `${r.station}:${r.key}:${i}`
    )) }) })
  ] });
}
function AnalyticsDashboard({
  context,
  contexts,
  module: module2,
  onContextChange
}) {
  const [filters, setFilters] = (0, import_react2.useState)(() => readFilters(context.id));
  const [search] = (0, import_hooks.useDebouncedValue)(filters.search, 300);
  const [page, setPage] = (0, import_react2.useState)(1), [sort, setSort] = (0, import_react2.useState)("date"), [asc, setAsc] = (0, import_react2.useState)(false), [busy, setBusy] = (0, import_react2.useState)(false), [exportError, setExportError] = (0, import_react2.useState)("");
  function update(patch) {
    setFilters((current2) => {
      const next = { ...current2, ...patch };
      try {
        sessionStorage.setItem(storage(context.id), JSON.stringify(next));
      } catch {
      }
      return next;
    });
    setPage(1);
  }
  const query = new URLSearchParams({
    period: filters.period,
    page: String(page),
    sort,
    asc: String(asc)
  });
  for (const [k, v] of Object.entries({ ...filters, search }))
    if (v && k !== "period") query.set(k, v);
  const endpoint = `/contexts/${context.id}/analytics/${module2}`;
  const result = useApi(`${endpoint}?${query.toString()}`);
  const drillPending = (0, import_react2.useRef)(false);
  (0, import_react2.useEffect)(() => {
    if (result.data && drillPending.current) {
      document.getElementById("analytics-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
      drillPending.current = false;
    }
  }, [result.data]);
  function detailFocus() {
    drillPending.current = true;
    document.getElementById("analytics-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const currentCount = filters.otherContext ? 2 : 1;
  const current = result.data?.sources.slice(0, currentCount) ?? [];
  const receipts = module2 === "receptions";
  function chartSource(source) {
    if (receipts || filters.crateType) return source;
    const counts = (rows) => rows.map((r) => ({ ...r, quantity: r.count }));
    return {
      ...source,
      daily: counts(source.daily),
      weekly: counts(source.weekly),
      varieties: counts(source.varieties),
      producers: counts(source.producers)
    };
  }
  const prior = (result.data?.sources.slice(currentCount) ?? []).map(chartSource);
  const currentAvailable = current.filter((s) => s.available).map(chartSource);
  function options(key) {
    const map = /* @__PURE__ */ new Map();
    for (const s of currentAvailable)
      for (const o of s.options[key] ?? []) map.set(String(o.value), `${o.label} [${o.value}]`);
    return [...map].map(([value, label]) => ({ value, label }));
  }
  const metric = (key) => currentAvailable.reduce((n, s) => n + (s.metrics[key] ?? 0), 0);
  function selectPeriod(from, to) {
    detailFocus();
    update({ period: "custom", from: from.slice(0, 10), to: to.slice(0, 10) });
    document.getElementById("analytics-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function drillDimension(row, key) {
    const source = current.find((s) => s.station === row.station);
    const next = {
      ...filters,
      [key]: row.key === "?" ? "" : row.key,
      otherContext: "",
      previousContext: "",
      previousOtherContext: ""
    };
    if (source && source.contextId !== context.id) {
      try {
        sessionStorage.setItem(storage(source.contextId), JSON.stringify(next));
      } catch {
      }
      onContextChange(source.contextId);
    } else {
      detailFocus();
      update(next);
    }
  }
  function weekPeriod(key) {
    const year = Number(key.slice(0, 4)), week = Number(key.slice(4));
    const d = new Date(Date.UTC(year, 0, 4));
    d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7 + (week - 1) * 7);
    const end = new Date(d);
    end.setUTCDate(d.getUTCDate() + 6);
    selectPeriod(d.toISOString(), end.toISOString());
  }
  async function download() {
    setBusy(true);
    setExportError("");
    try {
      const response = await fetch(`/api${endpoint}/export?${query.toString()}`, {
        credentials: "same-origin"
      });
      if (!response.ok) {
        const e = await response.json();
        throw new Error(e.title ?? "Export indisponible.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VITASOUSS-${module2}.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export indisponible.");
    } finally {
      setBusy(false);
    }
  }
  const other = contexts.find((c) => String(c.id) === filters.otherContext);
  const ctxOptions = (items) => items.map((c) => ({ value: String(c.id), label: `${c.station} \xB7 ${c.label}` }));
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { gap: "lg", className: "analytics-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { className: "eyebrow", children: "TABLEAUX DE BORD \xB7 LECTURE SEULE" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Title, { order: 1, children: receipts ? "Pilotage des r\xE9ceptions" : "Pilotage de la caisserie" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { c: "dimmed", children: [
          context.station,
          " \xB7 ",
          context.label,
          other ? ` + ${other.station} \xB7 ${other.label}` : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Badge, { variant: "light", color: "forest", children: "VITASOUSS 1.5.0" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Paper, { withBorder: true, p: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { gap: "sm", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 1, sm: 2, lg: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: "Station / exercice principal",
            searchable: true,
            value: String(context.id),
            data: ctxOptions(contexts.filter((c) => ["ZAOUIA", "DIAF"].includes(c.station))),
            onChange: (v) => {
              if (v) onContextChange(Number(v));
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: "Consolider avec l'autre station",
            placeholder: "Une station uniquement",
            clearable: true,
            searchable: true,
            value: filters.otherContext || null,
            data: ctxOptions(
              contexts.filter(
                (c) => c.station !== context.station && ["ZAOUIA", "DIAF"].includes(c.station)
              )
            ),
            onChange: (v) => update({ otherContext: v ?? "", previousOtherContext: "" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: "P\xE9riode",
            value: filters.period,
            data: [
              { value: "today", label: "Aujourd'hui" },
              { value: "yesterday", label: "Hier" },
              { value: "seven", label: "7 derniers jours" },
              { value: "week", label: "Semaine en cours" },
              { value: "month", label: "Mois en cours" },
              { value: "campaign", label: "Campagne compl\xE8te" },
              { value: "custom", label: "P\xE9riode personnalis\xE9e" }
            ],
            onChange: (v) => update({ period: v ?? "campaign" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.TextInput,
          {
            label: "Recherche des d\xE9tails",
            placeholder: "Producteur, verger, vari\xE9t\xE9, num\xE9ro",
            value: filters.search,
            onChange: (e) => update({ search: e.currentTarget.value }),
            maxLength: 120
          }
        ),
        filters.period === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.TextInput,
            {
              type: "date",
              label: "Du",
              value: filters.from,
              onChange: (e) => update({ from: e.currentTarget.value })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.TextInput,
            {
              type: "date",
              label: "Au inclus",
              value: filters.to,
              onChange: (e) => update({ to: e.currentTarget.value })
            }
          )
        ] }) : null,
        ["category", "product", "variety", "producer", "orchard", "crateType"].map(
          (key, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_core2.Select,
            {
              label: [
                "Cat\xE9gorie \xB7 culture",
                "Produit \xB7 groupe de vari\xE9t\xE9s",
                "Vari\xE9t\xE9",
                "Producteur / adh\xE9rent",
                "Verger",
                "Type de caisse"
              ][i],
              data: options(
                ["categories", "products", "varieties", "producers", "orchards", "crates"][i]
              ),
              value: filters[key] || null,
              clearable: true,
              searchable: true,
              onChange: (v) => update({ [key]: v ?? "" })
            },
            key
          )
        ),
        !receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: "Mouvement enregistr\xE9",
            data: [
              { value: "E", label: "E \xB7 li\xE9 aux r\xE9ceptions" },
              { value: "S", label: "S \xB7 convention sortie" }
            ],
            clearable: true,
            value: filters.movement || null,
            onChange: (v) => update({ movement: v ?? "" })
          }
        ) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: "Comparer \xE0 une archive",
            placeholder: "Comparaison non activ\xE9e",
            clearable: true,
            searchable: true,
            data: ctxOptions(
              contexts.filter(
                (c) => c.station === context.station && !!c.readOnly && c.id !== context.id
              )
            ),
            value: filters.previousContext || null,
            onChange: (v) => update({ previousContext: v ?? "", previousOtherContext: "" })
          }
        ),
        other && filters.previousContext ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Select,
          {
            label: `Archive ${other.station}`,
            placeholder: "Requise pour consolider",
            clearable: true,
            searchable: true,
            data: ctxOptions(
              contexts.filter((c) => c.station === other.station && !!c.readOnly)
            ),
            value: filters.previousOtherContext || null,
            onChange: (v) => update({ previousOtherContext: v ?? "" })
          }
        ) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", children: "Dates en heure du Maroc. Cat\xE9gorie = culture ; produit = groupe du r\xE9f\xE9rentiel. Les codes filtrent chaque source, sans rapprochement automatique." }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { variant: "subtle", onClick: () => update({ ...defaults }), children: "R\xE9initialiser les filtres" })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(State, { loading: result.loading, error: result.error, retry: result.refresh, children: result.data ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { gap: "lg", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        import_core2.Alert,
        {
          color: result.data.complete ? "green" : "orange",
          title: result.data.complete ? "Sources charg\xE9es" : "Donn\xE9es incompl\xE8tes \u2014 aucun total global garanti",
          children: current.map(
            (s) => `${s.station} : ${s.available ? `${s.campaign?.label} \xB7 ${s.total} lignes` : "indisponible"}`
          ).join(" / ")
        }
      ),
      receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.SimpleGrid, { cols: { base: 2, md: 3, lg: 5 }, children: [
        ["Aujourd'hui", tonnes(metric("todayKg"))],
        ["Hier", tonnes(metric("yesterdayKg"))],
        ["7 derniers jours", tonnes(metric("sevenKg"))],
        ["Mois", tonnes(metric("monthKg"))],
        ["Campagne / p\xE9riode filtr\xE9e", tonnes(result.data.totalKg)],
        ["Lots r\xE9ceptionn\xE9s", format(metric("lots"), 0)],
        ["Producteurs \xB7 station", format(metric("producers"), 0)],
        ["Vari\xE9t\xE9s \xB7 station", format(metric("varieties"), 0)],
        [
          "P\xE9riode pr\xE9c\xE9dente",
          metric("previousKg") ? `${format((metric("selectedKg") - metric("previousKg")) / metric("previousKg") * 100, 1)} %` : "Non comparable"
        ],
        [
          "Campagne pr\xE9c\xE9dente",
          result.data.evolution == null ? "Non comparable" : `${format(result.data.evolution, 1)} %`
        ]
      ].map(([title, value], i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        import_core2.Paper,
        {
          component: "button",
          type: "button",
          "aria-label": `${title} \xB7 voir le d\xE9tail`,
          onClick: () => {
            detailFocus();
            if (i < 4) update({ period: ["today", "yesterday", "seven", "month"][i] });
          },
          withBorder: true,
          p: "md",
          className: "analytics-kpi",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", children: title }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 750, size: "xl", children: [
              !result.data?.complete && i !== 4 ? "Partiel \xB7 " : "",
              value
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", children: "Voir le d\xE9tail \xB7 filtres appliqu\xE9s" })
          ]
        },
        title
      )) }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.SimpleGrid, { cols: { base: 1, md: 3 }, children: [
        "Dette des producteurs en caisses station",
        "Stock physique station",
        "Caisses personnelles \xE0 restituer"
      ].map((label) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: label }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xl", c: "dimmed", children: "Non d\xE9terminable" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: "Propri\xE9t\xE9, ouverture et exhaustivit\xE9 des mouvements \xE0 valider." })
      ] }, label)) }),
      exportError ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "red", children: exportError }) : null,
      !receipts && !filters.crateType ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "blue", children: "Sans type de caisse s\xE9lectionn\xE9, les graphiques temporels et classements comptent les mouvements. S\xE9lectionnez un type pour analyser ses quantit\xE9s. Le tableau par type conserve les quantit\xE9s distinctes ; aucun type n'est consid\xE9r\xE9 interchangeable." }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Tabs, { defaultValue: "daily", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Tabs.List, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "daily", children: "Quotidien" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "weekly", children: "Semaines ISO" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "distribution", children: "R\xE9partition" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "comparison", children: "Stations & campagnes" }),
          receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "estimates", children: "Estimations indicatives" }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Panel, { value: "daily", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          Chart,
          {
            title: receipts ? "Tonnage net par jour \xB7 cliquez pour d\xE9tailler" : filters.crateType ? "Quantit\xE9s du type s\xE9lectionn\xE9 par jour \xB7 aucun solde" : "Nombre de mouvements par jour \xB7 types non additionn\xE9s",
            rows: currentAvailable.flatMap((s) => s.daily).sort((a, b) => a.key.localeCompare(b.key)),
            crates: !receipts,
            onChoose: (r) => selectPeriod(r.key, r.key)
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Panel, { value: "weekly", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", c: "dimmed", children: "Semaine ISO : lundi\u2013dimanche, ann\xE9e ISO. Une semaine partielle suit les bornes des filtres." }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Chart,
            {
              title: receipts ? "R\xE9ceptions par semaine ISO" : "Mouvements par semaine ISO",
              rows: currentAvailable.flatMap((s) => s.weekly).sort((a, b) => a.key.localeCompare(b.key)),
              crates: !receipts,
              onChoose: (r) => weekPeriod(r.key)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(WeeklyComparison, { sources: currentAvailable, crates: !receipts })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Panel, { value: "distribution", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Chart,
            {
              title: "Classement des vari\xE9t\xE9s",
              rows: currentAvailable.flatMap((s) => s.varieties).sort((a, b) => (b.kg ?? b.quantity ?? 0) - (a.kg ?? a.quantity ?? 0)),
              crates: !receipts,
              onChoose: (r) => drillDimension(r, "variety")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Chart,
            {
              title: "Classement des producteurs",
              rows: currentAvailable.flatMap((s) => s.producers).sort((a, b) => (b.kg ?? b.quantity ?? 0) - (a.kg ?? a.quantity ?? 0)),
              crates: !receipts,
              onChoose: (r) => drillDimension(r, "producer")
            }
          ),
          receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: "Part des vari\xE9t\xE9s dans le tonnage observ\xE9" }),
            currentAvailable.flatMap((s) => s.varieties).map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
                r.station,
                " \xB7 ",
                r.label
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: result.data?.observedKg ? format((r.kg ?? 0) / result.data.observedKg * 100, 1) + " %" : "Non calculable" })
            ] }, `${r.station}:${r.key}`))
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Chart,
            {
              title: "Types de caisses et mouvements \xB7 types non interchangeables",
              rows: currentAvailable.flatMap((s) => s.movements),
              crates: true
            }
          )
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Panel, { value: "comparison", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.SimpleGrid, { cols: { base: 1, md: 2 }, children: current.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
              s.station,
              " \xB7 ",
              s.campaign?.label
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xl", children: s.available ? receipts ? tonnes(s.metrics.selectedKg) : `${format(s.total, 0)} mouvements` : "Source indisponible" }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
              "Contribution :",
              " ",
              result.data?.observedKg ? format(
                (s.metrics.selectedKg ?? 0) / result.data.observedKg * 100,
                1
              ) + " %" : "Non calculable"
            ] }) : null
          ] }, s.contextId)) }),
          prior.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { children: "Comparaison \xE0 dur\xE9e \xE9coul\xE9e \xE9quivalente depuis le d\xE9but de campagne ; borne courante limit\xE9e \xE0 aujourd'hui. Les s\xE9ries ci-dessous portent leurs dates r\xE9elles et sont align\xE9es par jours \xE9coul\xE9s dans le tableau comparatif." }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CampaignComparison, { current, prior }) : null,
            prior.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
                s.station,
                " \xB7 ",
                s.campaign?.label,
                " \xB7",
                " ",
                s.available ? "Archive charg\xE9e" : "Archive indisponible"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                Chart,
                {
                  title: "Archive \xB7 \xE9volution quotidienne",
                  rows: s.daily,
                  crates: !receipts
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                Chart,
                {
                  title: "Archive \xB7 semaines ISO",
                  rows: s.weekly,
                  crates: !receipts
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 1, md: 2 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  Chart,
                  {
                    title: "Archive \xB7 vari\xE9t\xE9s",
                    rows: s.varieties,
                    crates: !receipts
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  Chart,
                  {
                    title: "Archive \xB7 producteurs",
                    rows: s.producers,
                    crates: !receipts
                  }
                )
              ] })
            ] }, s.contextId))
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "gray", children: "S\xE9lectionnez une archive r\xE9ellement configur\xE9e pour comparer deux campagnes. Aucune donn\xE9e historique n'est g\xE9n\xE9r\xE9e." })
        ] }) }),
        receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Panel, { value: "estimates", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
          !result.data.estimateConsolidationAvailable ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "orange", children: "Pas d'estimation consolid\xE9e : l'identit\xE9 interstation des parcelles n'est pas d\xE9montr\xE9e. Les valeurs ci-dessous restent s\xE9par\xE9es par source et ne doivent pas \xEAtre additionn\xE9es." }) : null,
          currentAvailable.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Estimates, { source: s }, s.contextId)),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Alert, { color: "orange", children: [
            "Les estimations ne sont pas rattach\xE9es \xE0 une campagne par le sch\xE9ma. Tonnage r\xE9el dans la p\xE9riode : ",
            tonnes(result.data.observedKg),
            ". Aucun \xE9cart ni taux de r\xE9alisation n'est calcul\xE9 sur ces p\xE9rim\xE8tres non comparables."
          ] })
        ] }) }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", id: "analytics-details", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", mb: "md", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: receipts ? "D\xE9tail des r\xE9ceptions" : "Historique des mouvements" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", c: "dimmed", children: [
              format(result.data.total, 0),
              " lignes \xB7 pagination et tri c\xF4t\xE9 serveur"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.Select,
              {
                "aria-label": "Trier les d\xE9tails",
                value: sort,
                data: [
                  { value: "date", label: "Date" },
                  { value: "number", label: "Num\xE9ro" },
                  { value: "producer", label: "Producteur" },
                  { value: "variety", label: "Vari\xE9t\xE9" },
                  receipts ? { value: "net", label: "Poids net" } : { value: "quantity", label: "Quantit\xE9" }
                ],
                onChange: (v) => {
                  setSort(v ?? "date");
                  setPage(1);
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.Button,
              {
                variant: "light",
                onClick: () => {
                  setAsc((v) => !v);
                  setPage(1);
                },
                children: asc ? "Croissant" : "D\xE9croissant"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              import_core2.Button,
              {
                variant: "light",
                loading: busy,
                disabled: !current.every((s) => s.available),
                onClick: () => void download(),
                children: "Exporter Excel"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.ScrollContainer, { minWidth: 1e3, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { striped: true, highlightOnHover: true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Station / n\xB0" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Date" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Producteur" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Verger" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Cat\xE9gorie / produit" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Vari\xE9t\xE9" }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Poids net" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Type caisse" }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Mvt." }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Quantit\xE9" })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: result.data.rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              r.station,
              " \xB7 ",
              r.number
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: r.date ?? "Date manquante" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              r.producer,
              " [",
              r.producerId ?? "?",
              "]"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              r.orchard,
              " [",
              r.orchardId ?? "?",
              "]"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              r.category,
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("br", {}),
              r.product
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: r.variety }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              tonnes(r.netKg),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "xs", c: "dimmed", children: [
                format(r.netKg, 2),
                " kg"
              ] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: r.crate }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Badge, { variant: "light", children: r.movement ?? "?" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: format(r.quantity, 0) })
            ] })
          ] }, `${r.contextId}:${r.number}`)) })
        ] }) }),
        result.data.rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", py: "md", children: "Aucune ligne sur ce p\xE9rim\xE8tre." }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          import_core2.Pagination,
          {
            mt: "md",
            value: page,
            total: Math.max(1, Math.min(400, Math.ceil(result.data.total / 25))),
            onChange: setPage,
            "aria-label": "Pages des d\xE9tails"
          }
        ),
        result.data.total > 1e4 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", children: "Affinez la p\xE9riode pour acc\xE9der au-del\xE0 des 10 000 premi\xE8res lignes. Export jusqu'\xE0 20 000 lignes." }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("details", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("summary", { children: "Sources, calculs et limites des donn\xE9es" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Stack, { gap: "xs", mt: "sm", children: [
          .../* @__PURE__ */ new Set([
            ...result.data.warnings,
            ...result.data.sources.flatMap((s) => s.warnings)
          ])
        ].map((w) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: w }, w)) })
      ] })
    ] }) : null })
  ] });
}
function WeeklyComparison({ sources, crates }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: "Variation par rapport \xE0 la semaine ISO pr\xE9c\xE9dente" }),
    sources.flatMap(
      (s) => s.weekly.map((w, i) => {
        const prior = s.weekly[i - 1];
        const adjacent = prior && Math.round((isoMonday(w.key).getTime() - isoMonday(prior.key).getTime()) / 864e5) === 7;
        const before = adjacent ? crates ? prior.quantity : prior.kg : 0;
        const now = crates ? w.quantity : w.kg;
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
            s.station,
            " \xB7 ",
            w.label,
            " \xB7 ",
            w.count,
            " lots / mvt."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: before && now != null ? format((now - before) / before * 100, 1) + " %" : "Non comparable" })
        ] }, `${s.contextId}:${w.key}`);
      })
    )
  ] });
}
function isoMonday(key) {
  const d = new Date(Date.UTC(Number(key.slice(0, 4)), 0, 4));
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7 + (Number(key.slice(4)) - 1) * 7);
  return d;
}
function CampaignComparison({ current, prior }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: "Alignement depuis le d\xE9but de campagne" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.ScrollContainer, { minWidth: 600, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Station" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Jour campagne" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Actuel" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Archive" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Actuel t" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Archive t" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Cumul actuel t" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Cumul archive t" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: current.flatMap((s, i) => {
        const p = prior[i];
        if (!s.campaign || !p?.campaign || !p.available) return [];
        const start = Date.parse(s.campaign.start), oldStart = Date.parse(p.campaign.start);
        const mapped = new Map(
          p.daily.map((d) => [Math.round((Date.parse(d.key) - oldStart) / 864e5), d])
        );
        let cumul = 0, oldCumul = 0;
        const daily = new Map(
          s.daily.map((d) => [Math.round((Date.parse(d.key) - start) / 864e5), d])
        );
        const days = [.../* @__PURE__ */ new Set([...daily.keys(), ...mapped.keys()])].sort((a, b) => a - b);
        return days.map((day) => {
          const d = daily.get(day), v = mapped.get(day);
          cumul += d?.kg ?? 0;
          oldCumul += v?.kg ?? 0;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: s.station }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
              "J",
              day + 1
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: d?.key ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: v?.key ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: tonnes(d?.kg ?? 0) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: tonnes(v?.kg ?? 0) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: tonnes(cumul) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: tonnes(oldCumul) })
          ] }, `${s.contextId}:${day}`);
        });
      }) })
    ] }) })
  ] });
}
function Estimates({ source }) {
  const e = source.estimates;
  if (!e)
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Alert, { color: "gray", children: [
      source.station,
      " : estimation non disponible dans ce sch\xE9ma."
    ] });
  const coverage = e.summary.parcels ? e.summary.usable / e.summary.parcels * 100 : 0;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
      source.station,
      " \xB7 r\xE9f\xE9rentiel de parcelles"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 2, md: 4 }, mt: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", children: "Estimation partielle exploitable" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: tonnes(e.summary.estimatedKg) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", children: "Parcelles renseign\xE9es et non ambigu\xEBs" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
          e.summary.usable,
          " / ",
          e.summary.parcels
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", children: "Incompl\xE8tes ou ambigu\xEBs" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: e.summary.parcels - e.summary.usable })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", children: "Couverture indicative" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
          format(coverage, 1),
          " %"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Progress, { value: coverage, "aria-label": "Couverture des estimations" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", mt: "md", children: "P\xE9rim\xE8tre du r\xE9f\xE9rentiel : filtres produit, vari\xE9t\xE9, producteur et verger uniquement. Dates, type de caisse et mouvement ne d\xE9crivent pas une parcelle. Aucun rattachement campagne prouv\xE9." }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("details", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("summary", { children: "Parcelles \xE0 compl\xE9ter \xB7 100 premi\xE8res lignes" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.ScrollContainer, { minWidth: 600, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Identit\xE9 m\xE9tier" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "Verger" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: "\xC0 v\xE9rifier" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tbody, { children: e.incomplete.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
            p.refver,
            " / ",
            p.refpar,
            " / ",
            p.numcul
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.orchard }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: p.reason })
        ] }, `${p.idparcelle}:${i}`)) })
      ] }) })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyticsDashboard
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

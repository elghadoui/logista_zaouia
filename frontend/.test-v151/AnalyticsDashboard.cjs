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
  AnalyticsDashboard: () => AnalyticsDashboard,
  ProducerSituationTable: () => ProducerSituationTable
});
module.exports = __toCommonJS(AnalyticsDashboard_exports);
var import_core3 = require("@mantine/core");
var import_react4 = require("react");
var import_hooks = require("@mantine/hooks");

// frontend/src/api.ts
var useApi = (url) => ({ data: url === "/admin/configuration" ? globalThis.__configuration : globalThis.__analytics, loading: false, error: "", refresh: () => {
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
    ({ color: color2 = "currentColor", size = 24, stroke = 2, title, className, children, ...rest }, ref) => (0, import_react.createElement)(
      "svg",
      {
        ref,
        ...defaultAttributes[type],
        width: size,
        height: size,
        className: [`tabler-icon`, `tabler-icon-${iconName}`, className].join(" "),
        ...type === "filled" ? {
          fill: color2
        } : {
          strokeWidth: stroke,
          stroke: color2
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

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconHistory.mjs
var __iconNode3 = [["path", { "d": "M12 8l0 4l2 2", "key": "svg-0" }], ["path", { "d": "M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5", "key": "svg-1" }]];
var IconHistory = createReactComponent("outline", "history", "History", __iconNode3);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconLeaf.mjs
var __iconNode4 = [["path", { "d": "M5 21c.5 -4.5 2.5 -8 7 -10", "key": "svg-0" }], ["path", { "d": "M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z", "key": "svg-1" }]];
var IconLeaf = createReactComponent("outline", "leaf", "Leaf", __iconNode4);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconLock.mjs
var __iconNode5 = [["path", { "d": "M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z", "key": "svg-0" }], ["path", { "d": "M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0", "key": "svg-1" }], ["path", { "d": "M8 11v-4a4 4 0 1 1 8 0v4", "key": "svg-2" }]];
var IconLock = createReactComponent("outline", "lock", "Lock", __iconNode5);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconSwitchHorizontal.mjs
var __iconNode6 = [["path", { "d": "M16 3l4 4l-4 4", "key": "svg-0" }], ["path", { "d": "M10 7l10 0", "key": "svg-1" }], ["path", { "d": "M8 13l-4 4l4 4", "key": "svg-2" }], ["path", { "d": "M4 17l9 0", "key": "svg-3" }]];
var IconSwitchHorizontal = createReactComponent("outline", "switch-horizontal", "SwitchHorizontal", __iconNode6);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconTrees.mjs
var __iconNode7 = [["path", { "d": "M16 5l3 3l-2 1l4 4l-3 1l4 4h-9", "key": "svg-0" }], ["path", { "d": "M15 21l0 -3", "key": "svg-1" }], ["path", { "d": "M8 13l-2 -2", "key": "svg-2" }], ["path", { "d": "M8 12l2 -2", "key": "svg-3" }], ["path", { "d": "M8 21v-13", "key": "svg-4" }], ["path", { "d": "M5.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4z", "key": "svg-5" }]];
var IconTrees = createReactComponent("outline", "trees", "Trees", __iconNode7);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconUsers.mjs
var __iconNode8 = [["path", { "d": "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "key": "svg-0" }], ["path", { "d": "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2", "key": "svg-1" }], ["path", { "d": "M16 3.13a4 4 0 0 1 0 7.75", "key": "svg-2" }], ["path", { "d": "M21 21v-2a4 4 0 0 0 -3 -3.85", "key": "svg-3" }]];
var IconUsers = createReactComponent("outline", "users", "Users", __iconNode8);

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

// frontend/src/contextChoices.ts
var import_react2 = require("react");
function coherentContextFilters(filters) {
  return filters.otherContext && filters.previousContext ? filters : { ...filters, previousOtherContext: "" };
}

// frontend/src/AnalyticsVisuals.tsx
var import_react3 = require("react");
var import_core2 = require("@mantine/core");
var import_jsx_runtime2 = require("react/jsx-runtime");
var number = (n) => new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 3 }).format(n);
var value = (r, crates) => crates ? r.quantity : r.kg == null ? null : r.kg / 1e3;
var color = (station) => station === "DIAF" ? "#dc8b42" : "#43875b";
function Sparkline({ points, label }) {
  const id = (0, import_react3.useId)().replace(/:/g, "");
  if (points.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "analytics-spark-empty", children: "Courbe indisponible" });
  const min = Math.min(0, ...points), span = Math.max(1, Math.max(...points) - min);
  const path = points.map((n, i) => `${i * 156 / (points.length - 1)},${34 - (n - min) / span * 30}`).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { className: "analytics-spark", viewBox: "0 0 156 40", role: "img", "aria-label": label, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { stopColor: "#68a76c", stopOpacity: ".22" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("stop", { offset: "1", stopColor: "#68a76c", stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: `0,40 ${path} 156,40`, fill: `url(#${id})` }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: path, fill: "none", stroke: "#43875b", strokeWidth: "1.8" })
  ] });
}
function TemporalChart({ title, rows, crates = false, onChoose, variant = "line", unitLabel, countLabel }) {
  const [selected, setSelected] = (0, import_react3.useState)(null);
  const [containerWidth, setContainerWidth] = (0, import_react3.useState)(0);
  const plotRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    const element = plotRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const keys = [...new Set(rows.map((r) => r.key))].sort();
  const stations = [...new Set(rows.map((r) => r.station))];
  const values = rows.flatMap((r) => {
    const n = value(r, crates);
    return n == null ? [] : [n];
  });
  const min = Math.min(0, ...values), max = Math.max(0, ...values), span = Math.max(1, max - min);
  const counts = rows.map((r) => r.count);
  const countMax = Math.max(1, ...counts);
  const unit = unitLabel ?? (crates ? "caisses mouvement\xE9es" : "t");
  const countUnit = countLabel ?? (crates ? "mouvements" : "lots");
  const byIdentity = new Map(rows.map((r) => [`${r.station}:${r.key}`, r]));
  const height = variant === "combo" ? 330 : 290;
  const plotTop = variant === "combo" ? 38 : 18, plotBottom = height - 48;
  const plotHeight = plotBottom - plotTop;
  const side = variant === "combo" ? 78 : 68;
  const width = Math.max(520, containerWidth, keys.length * Math.max(22, stations.length * 12) + side * 2 + 20);
  const plotWidth = width - side * 2;
  const cell = plotWidth / Math.max(1, keys.length), bar = Math.min(34, cell / Math.max(1, stations.length) - 5);
  const y = (n) => plotBottom - (n - min) / span * plotHeight;
  const yCount = (n) => plotBottom - n / countMax * plotHeight;
  const pointX = (index) => side + index * cell + cell / 2;
  const displayedKey = (key) => rows.find((r) => r.key === key)?.label ?? key;
  const adjacent = (before, after) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(before) && /^\d{4}-\d{2}-\d{2}$/.test(after))
      return Date.parse(`${after}T00:00:00Z`) - Date.parse(`${before}T00:00:00Z`) === 864e5;
    if (/^\d{6}$/.test(before) && /^\d{6}$/.test(after)) {
      const monday = (key) => {
        const date = new Date(Date.UTC(Number(key.slice(0, 4)), 0, 4));
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7 + (Number(key.slice(4)) - 1) * 7);
        return date.getTime();
      };
      return monday(after) - monday(before) === 7 * 864e5;
    }
    return false;
  };
  function seriesSegments(station, countSeries = false) {
    const points = keys.flatMap((key, i) => {
      const row = byIdentity.get(`${station}:${key}`), n = row ? countSeries ? row.count : value(row, crates) : null;
      return row && n != null ? [{ row, index: i, n }] : [];
    });
    const segments = [];
    for (const point of points) {
      const prior = segments[segments.length - 1]?.at(-1);
      const consecutive = prior && point.index === prior.index + 1 && adjacent(prior.row.key, point.row.key);
      if (!consecutive || !prior) segments.push([point]);
      else segments[segments.length - 1].push(point);
    }
    return segments;
  }
  const barColor = (station) => station === "DIAF" ? "#9b7ab5" : "#76549b";
  const lineColor = (station) => station === "DIAF" ? "#83a94c" : "#2e7d4b";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", className: `analytics-chart-card ${variant === "combo" ? "analytics-chart-combo" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", mb: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { gap: "md", className: "analytics-chart-legend", children: [
        stations.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { className: variant === "combo" ? "analytics-legend-column" : "", style: { background: variant === "combo" ? barColor(s) : color(s) } }),
          s,
          variant === "combo" ? ` \xB7 ${unit}` : ""
        ] }, `${s}:bar`)),
        variant === "combo" && stations.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { className: "analytics-legend-line", style: { background: lineColor(s) } }),
          s,
          " \xB7 ",
          countUnit
        ] }, `${s}:line`))
      ] })
    ] }),
    rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "analytics-chart-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "analytics-empty-mark", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconDatabaseOff, { size: 22 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 600, children: "Aucune donn\xE9e sur cette p\xE9riode" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", children: "Le graphique appara\xEEtra d\xE8s qu\u2019une observation sera disponible pour ces filtres." })
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: plotRef, className: "analytics-plot-scroll", tabIndex: 0, "aria-label": "Graphique d\xE9filant ; chaque observation est accessible au clavier", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: `0 0 ${width} ${height + 38}`, style: { width, minWidth: "100%" }, role: "group", "aria-label": title, children: [
        [0, 1, 2, 3, 4].map((i) => {
          const yy = plotBottom - plotHeight * i / 4;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: side, x2: width - side, y1: yy, y2: yy, className: "analytics-gridline" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: side - 10, y: yy + 4, textAnchor: "end", className: "analytics-axis", children: number(min + span * i / 4) }),
            variant === "combo" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: width - side + 10, y: yy + 4, textAnchor: "start", className: "analytics-axis", children: new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(countMax * i / 4) }) : null
          ] }, i);
        }),
        variant === "combo" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: side, y: "17", className: "analytics-axis analytics-axis-title", children: unit }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: width - side, y: "17", textAnchor: "end", className: "analytics-axis analytics-axis-title", children: countLabel ?? (crates ? "Mouvements" : "Lots") })
        ] }) : null,
        variant === "bars" ? keys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
          stations.map((station, j) => {
            const r = byIdentity.get(`${station}:${key}`);
            if (!r || value(r, crates) == null) return null;
            const n = value(r, crates), h = Math.abs(y(n ?? 0) - y(0));
            const fill = color(station);
            return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-column", "aria-label": `${r.label} \xB7 ${station} \xB7 ${n == null ? "indisponible" : number(n)} ${unit}`, onMouseEnter: () => setSelected(r), onFocus: () => setSelected(r), onClick: () => onChoose?.(r), onKeyDown: (e) => {
              if (onChoose && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChoose(r);
              }
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("title", { children: `${r.label} \xB7 ${station} : ${n == null ? "Indisponible" : number(n)} ${unit} \xB7 ${r.count} ${countUnit}` }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: side + i * cell + j * (bar + 4), y: Math.min(y(0), y(n ?? 0)) - (h === 0 ? 1 : 0), width: Math.max(3, bar), height: Math.max(2, h), rx: "4", fill, opacity: n == null ? 0.3 : 0.9 })
            ] }, station);
          }),
          (i % Math.max(1, Math.ceil(keys.length / 12)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: pointX(i), y: height + 19, textAnchor: "middle", className: "analytics-axis", children: displayedKey(key) })
        ] }, key)) : variant === "combo" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          keys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
            stations.map((station, j) => {
              const r = byIdentity.get(`${station}:${key}`);
              if (!r || value(r, crates) == null) return null;
              const n = value(r, crates), h = Math.abs(y(n ?? 0) - y(0));
              return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-column", "aria-label": `${r.label} \xB7 ${station} \xB7 ${n == null ? "indisponible" : number(n)} ${unit} \xB7 ${r.count} ${countUnit}`, onMouseEnter: () => setSelected(r), onFocus: () => setSelected(r), onClick: () => onChoose?.(r), onKeyDown: (e) => {
                if (onChoose && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChoose(r);
                }
              }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("title", { children: `${r.label} \xB7 ${station} : ${n == null ? "Indisponible" : number(n)} ${unit} \xB7 ${r.count} ${countUnit}` }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: side + i * cell + j * (bar + 4), y: Math.min(y(0), y(n ?? 0)), width: Math.max(3, bar), height: Math.max(2, h), rx: "4", fill: barColor(station), opacity: n == null ? 0.35 : 0.88 })
              ] }, station);
            }),
            (i % Math.max(1, Math.ceil(keys.length / 16)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: pointX(i), y: height + 19, textAnchor: "middle", className: "analytics-axis", children: displayedKey(key) })
          ] }, key)),
          stations.map((station) => seriesSegments(station, true).map((segment, j) => {
            const d = segment.map((p, i) => `${i ? "L" : "M"} ${pointX(p.index)} ${yCount(p.row.count)}`).join(" ");
            return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { className: "analytics-combo-line", children: [
              segment.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d, fill: "none", stroke: lineColor(station), strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }) : null,
              segment.map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-line-point", "aria-label": `${p.row.label} \xB7 ${station} \xB7 ${p.row.count} ${countUnit}`, onMouseEnter: () => setSelected(p.row), onFocus: () => setSelected(p.row), onClick: () => onChoose?.(p.row), onKeyDown: (e) => {
                if (onChoose && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChoose(p.row);
                }
              }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("title", { children: `${p.row.label} \xB7 ${station} : ${p.row.count} ${countUnit}` }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: pointX(p.index), cy: yCount(p.row.count), r: "5", fill: lineColor(station), stroke: "white", strokeWidth: "2" })
              ] }, `${p.row.key}:${station}`))
            ] }, `count:${station}:${j}`);
          }))
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          stations.map((station) => seriesSegments(station).map((segment, j) => {
            const d = segment.map((p, i) => `${i ? "L" : "M"} ${pointX(p.index)} ${y(p.n)}`).join(" ");
            const fill = `${d} L ${pointX(segment[segment.length - 1].index)} ${y(0)} L ${pointX(segment[0].index)} ${y(0)} Z`;
            return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
              segment.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: fill, fill: color(station), opacity: ".08" }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d, fill: "none", stroke: color(station), strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" })
              ] }) : null,
              segment.map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-line-point", "aria-label": `${p.row.label} \xB7 ${station} \xB7 ${number(p.n)} ${crates ? "unit\xE9s" : "tonnes"}`, onMouseEnter: () => setSelected(p.row), onFocus: () => setSelected(p.row), onClick: () => onChoose?.(p.row), onKeyDown: (e) => {
                if (onChoose && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChoose(p.row);
                }
              }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("title", { children: `${p.row.label} \xB7 ${station} : ${number(p.n)} ${crates ? "unit\xE9s" : "t"} \xB7 ${p.row.count} ${countUnit}` }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: pointX(p.index), cy: y(p.n), r: "4", fill: color(station), stroke: "white", strokeWidth: "2" })
              ] }, `${p.row.key}:${station}`))
            ] }, `${station}:${j}`);
          })),
          keys.map((key, i) => (i % Math.max(1, Math.ceil(keys.length / 12)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: pointX(i), y: height + 19, textAnchor: "middle", className: "analytics-axis", children: displayedKey(key) }, key))
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", className: "analytics-chart-caption", children: selected ? `${selected.station} \xB7 ${selected.label} : ${value(selected, crates) == null ? "Indisponible" : number(value(selected, crates))} ${unit}${variant === "combo" ? ` \xB7 ${selected.count} ${countUnit}` : ""}` : `Observations r\xE9elles${variant !== "bars" ? " \xB7 segments interrompus aux semaines ou dates absentes" : ""}${onChoose ? " \xB7 Entr\xE9e ouvre le d\xE9tail" : ""}.` })
    ] })
  ] });
}
function CaisserieFlowChart({ title, rows, unitLabel, unavailableMessage, onChoose }) {
  const plotRef = (0, import_react3.useRef)(null);
  const [containerWidth, setContainerWidth] = (0, import_react3.useState)(0);
  (0, import_react3.useEffect)(() => {
    const element = plotRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const usable = rows.filter((r) => r.invalid === 0 && r.entries != null && r.exits != null);
  const keys = [...new Set(usable.map((r) => r.key))].sort();
  const stations = [...new Set(usable.map((r) => r.station))];
  const byIdentity = new Map(usable.map((r) => [`${r.station}:${r.key}`, r]));
  const maximum = Math.max(0, ...usable.flatMap((r) => [r.entries ?? 0, r.exits ?? 0]));
  const tickMax = Math.max(1, Math.ceil(maximum / 5));
  const height = 320, side = 78, top = 30, bottom = 258, plotHeight = bottom - top;
  const width = Math.max(520, containerWidth, keys.length * Math.max(40, stations.length * 30) + side * 2 + 20);
  const plotWidth = width - 2 * side, cell = plotWidth / Math.max(1, keys.length);
  const groupWidth = Math.min(cell * 0.76, 70), stationWidth = groupWidth / Math.max(1, stations.length), barWidth = Math.max(4, stationWidth * 0.36);
  const pointX = (i) => side + i * cell + cell / 2;
  const y = (n) => bottom - n / (tickMax * 5) * plotHeight;
  const colorFor = (station, movement) => movement === "entry" ? station === "DIAF" ? "#72a95c" : "#2f8054" : station === "DIAF" ? "#e5a251" : "#8b67ad";
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", className: "analytics-chart-card analytics-flow-chart", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", mb: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { gap: "md", className: "analytics-chart-legend", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { style: { background: "#2f8054" } }),
          "Entr\xE9es \xB7 ",
          unitLabel
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { style: { background: "#8b67ad" } }),
          "Sorties \xB7 ",
          unitLabel
        ] })
      ] })
    ] }),
    keys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "analytics-chart-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "analytics-empty-mark", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconDatabaseOff, { size: 22 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 600, children: unavailableMessage ?? "Aucune quantit\xE9 fiable sur cette p\xE9riode" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", children: "Les valeurs absentes ou invalides restent indisponibles. Aucun mouvement n\u2019est remplac\xE9 par un compte de lignes." })
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: plotRef, className: "analytics-plot-scroll", tabIndex: 0, "aria-label": "Graphique des entr\xE9es et sorties par p\xE9riode", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: `0 0 ${width} ${height}`, style: { width, minWidth: "100%" }, role: "group", "aria-label": title, children: [
        [0, 1, 2, 3, 4, 5].map((i) => {
          const v = tickMax * i, yy = y(v);
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: side, x2: width - side, y1: yy, y2: yy, className: "analytics-gridline" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: side - 10, y: yy + 4, textAnchor: "end", className: "analytics-axis", children: formatAxis(v) })
          ] }, i);
        }),
        keys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
          stations.map((station, j) => {
            const row = byIdentity.get(`${station}:${key}`);
            if (!row) return null;
            const base = pointX(i) - groupWidth / 2 + j * stationWidth;
            const values = [{ name: "Entr\xE9es", value: row.entries, x: base + stationWidth * 0.12, color: colorFor(station, "entry") }, { name: "Sorties", value: row.exits, x: base + stationWidth * 0.53, color: colorFor(station, "exit") }];
            return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { children: values.map((item, k) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-column", "aria-label": `${row.label} \xB7 ${station} \xB7 ${item.name} ${formatAxis(item.value)} ${unitLabel}`, onClick: () => onChoose?.(row), onKeyDown: (e) => {
              if (onChoose && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChoose(row);
              }
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("title", { children: `${row.label} \xB7 ${station} \xB7 ${item.name} ${formatAxis(item.value)} ${unitLabel} \xB7 variation sorties \u2212 entr\xE9es : ${formatAxis((row.exits ?? 0) - (row.entries ?? 0))} ${unitLabel}` }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: item.x, y: y(item.value), width: barWidth, height: Math.max(1, bottom - y(item.value)), rx: "3", fill: item.color })
            ] }, k)) }, station);
          }),
          (i % Math.max(1, Math.ceil(keys.length / 14)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: pointX(i), y: height - 20, textAnchor: "middle", className: "analytics-axis", children: rows.find((r) => r.key === key)?.label ?? key })
        ] }, key))
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", className: "analytics-chart-caption", children: "Infobulle : entr\xE9es, sorties et variation (sorties \u2212 entr\xE9es). Les types de caisse restent s\xE9par\xE9s." })
    ] })
  ] });
}
function formatAxis(n) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n);
}
function VarietyRing({ rows, onChoose }) {
  if (rows.some((r) => r.kg != null && r.kg < 0)) return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: "R\xE9partition du tonnage observ\xE9" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", c: "dimmed", mt: "md", children: "R\xE9partition indisponible : des valeurs n\xE9gatives n\xE9cessitent une v\xE9rification. Consultez les classements et les d\xE9tails." })
  ] });
  const sorted = rows.filter((r) => (r.kg ?? 0) > 0).sort((a, b) => b.kg - a.kg);
  const total = sorted.reduce((s, r) => s + r.kg, 0);
  const palette = ["#286044", "#559256", "#93b76c", "#d9bb68", "#cf8c4b"];
  let offset = 0;
  const segments = sorted.slice(0, 4).map((r, i) => ({ row: r, label: r.label, kg: r.kg, color: palette[i] }));
  if (sorted.length > 4) segments.push({ row: sorted[4], label: "Autres vari\xE9t\xE9s", kg: sorted.slice(4).reduce((s, r) => s + r.kg, 0), color: palette[4] });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", className: "analytics-ring-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: "R\xE9partition du tonnage observ\xE9" }),
    total <= 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", py: "xl", children: "Aucune r\xE9partition positive disponible." }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "analytics-ring-layout", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 160 160", role: "img", "aria-label": `R\xE9partition des vari\xE9t\xE9s, ${number(total / 1e3)} tonnes observ\xE9es`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "80", cy: "80", r: "58", fill: "none", stroke: "var(--mantine-color-default-hover)", strokeWidth: "20" }),
        segments.map((s, i) => {
          const part = s.kg / total * 100, start = offset;
          offset += part;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "80", cy: "80", r: "58", pathLength: "100", fill: "none", stroke: s.color, strokeWidth: "20", strokeDasharray: `${part} ${100 - part}`, strokeDashoffset: -start, transform: "rotate(-90 80 80)", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("title", { children: `${s.label} : ${number(part)} %` }) }, i);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: "80", y: "78", textAnchor: "middle", className: "analytics-ring-total", children: number(total / 1e3) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("text", { x: "80", y: "98", textAnchor: "middle", className: "analytics-axis", children: "tonnes" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: segments.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "analytics-ring-label", disabled: s.label === "Autres vari\xE9t\xE9s", onClick: () => onChoose(s.row), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { style: { background: s.color } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
          s.label,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: s.label === "Autres vari\xE9t\xE9s" ? `${sorted.length - 4} vari\xE9t\xE9s` : s.row.station })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("strong", { children: [
          number(s.kg / total * 100),
          " %"
        ] })
      ] }, i)) })
    ] })
  ] });
}

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconFilter.mjs
var __iconNode9 = [["path", { "d": "M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z", "key": "svg-0" }]];
var IconFilter = createReactComponent("outline", "filter", "Filter", __iconNode9);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconFileSpreadsheet.mjs
var __iconNode10 = [["path", { "d": "M14 3v4a1 1 0 0 0 1 1h4", "key": "svg-0" }], ["path", { "d": "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z", "key": "svg-1" }], ["path", { "d": "M8 11h8v7h-8z", "key": "svg-2" }], ["path", { "d": "M8 15h8", "key": "svg-3" }], ["path", { "d": "M11 11v7", "key": "svg-4" }]];
var IconFileSpreadsheet = createReactComponent("outline", "file-spreadsheet", "FileSpreadsheet", __iconNode10);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconPackage.mjs
var __iconNode11 = [["path", { "d": "M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5", "key": "svg-0" }], ["path", { "d": "M12 12l8 -4.5", "key": "svg-1" }], ["path", { "d": "M12 12l0 9", "key": "svg-2" }], ["path", { "d": "M12 12l-8 -4.5", "key": "svg-3" }], ["path", { "d": "M16 5.25l-8 4.5", "key": "svg-4" }]];
var IconPackage = createReactComponent("outline", "package", "Package", __iconNode11);

// frontend/src/AnalyticsDashboard.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
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
      return coherentContextFilters({
        ...defaults,
        ...Object.fromEntries(
          Object.entries(v).filter(([k, v2]) => k in defaults && typeof v2 === "string")
        )
      });
  } catch {
  }
  return { ...defaults };
}
var format = (n, digits = 3) => n == null ? "Indisponible" : new Intl.NumberFormat("fr-MA", { maximumFractionDigits: digits }).format(n);
var signed = (n) => `${n > 0 ? "+" : ""}${format(n, 1)} %`;
var tonnes = (n) => n == null ? "Indisponible" : `${format(n / 1e3)} t`;
function Chart({
  title,
  rows,
  crates = false,
  onChoose
}) {
  const max = Math.max(1, ...rows.map((r) => Math.abs((crates ? r.quantity : r.kg) ?? 0)));
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, mb: "sm", children: title }),
    rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { c: "dimmed", children: "Aucune donn\xE9e sur cette p\xE9riode." }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.ScrollArea, { h: Math.min(350, rows.length * 40 + 20), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "analytics-bars", role: "group", children: rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "button",
      {
        type: "button",
        className: "analytics-bar",
        disabled: !onChoose,
        onClick: () => onChoose?.(r),
        "aria-label": `${r.label}, ${r.station}, ${crates ? format(r.quantity, 0) : tonnes(r.kg)}, ${r.count} mouvements ou lots`,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "analytics-bar-label", children: [
            r.label,
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("small", { children: [
              r.station,
              " \xB7 ",
              r.count,
              " ",
              crates ? "mvt." : "lots"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-track", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "span",
            {
              className: r.station === "DIAF" ? "analytics-fill diaf" : "analytics-fill",
              style: {
                width: `${Math.max(0.4, Math.abs((crates ? r.quantity : r.kg) ?? 0) / max * 100)}%`
              }
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: crates ? format(r.quantity, 0) : tonnes(r.kg) })
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
  const [filtersOpen, setFiltersOpen] = (0, import_react4.useState)(false);
  const [fullDetails, setFullDetails] = (0, import_react4.useState)(false);
  const [caisserieUnit, setCaisserieUnit] = (0, import_react4.useState)("palettes");
  const [producerSearch, setProducerSearch] = (0, import_react4.useState)("");
  const [debouncedProducerSearch] = (0, import_hooks.useDebouncedValue)(producerSearch, 300);
  const [situationPage, setSituationPage] = (0, import_react4.useState)(1);
  const [situationSort, setSituationSort] = (0, import_react4.useState)("exits");
  const [situationAsc, setSituationAsc] = (0, import_react4.useState)(false);
  const [filters, setFilters] = (0, import_react4.useState)(() => readFilters(context.id));
  const [search] = (0, import_hooks.useDebouncedValue)(filters.search, 300);
  const [page, setPage] = (0, import_react4.useState)(1), [sort, setSort] = (0, import_react4.useState)("date"), [asc, setAsc] = (0, import_react4.useState)(false), [busy, setBusy] = (0, import_react4.useState)(false), [exportError, setExportError] = (0, import_react4.useState)("");
  function update(patch) {
    setFilters((current2) => {
      const next = coherentContextFilters({ ...current2, ...patch });
      try {
        sessionStorage.setItem(storage(context.id), JSON.stringify(next));
      } catch {
      }
      return next;
    });
    setPage(1);
  }
  (0, import_react4.useEffect)(() => {
    const patch = {};
    for (const key of ["otherContext", "previousContext", "previousOtherContext"])
      if (filters[key] && !contexts.some((c) => String(c.id) === filters[key])) patch[key] = "";
    if (Object.keys(patch).length) update(patch);
  }, [contexts, filters.otherContext, filters.previousContext, filters.previousOtherContext]);
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
  const situationQuery = new URLSearchParams({ period: filters.period, page: String(situationPage), sort: situationSort, asc: String(situationAsc) });
  for (const [k, v] of Object.entries(filters)) if (v && k !== "period" && k !== "movement" && k !== "previousContext" && k !== "previousOtherContext") situationQuery.set(k, v);
  if (debouncedProducerSearch.trim()) situationQuery.set("search", debouncedProducerSearch.trim());
  else situationQuery.delete("search");
  const situation = useApi(module2 === "caisserie" ? `/contexts/${context.id}/analytics/caisserie/producers?${situationQuery.toString()}` : null);
  const drillPending = (0, import_react4.useRef)(false);
  (0, import_react4.useEffect)(() => {
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
  const partialMetric = (value2, render) => currentAvailable.length === 0 ? "Indisponible" : `${result.data?.complete ? "" : "Partiel \xB7 "}${render(value2)}`;
  function options(key) {
    const map = /* @__PURE__ */ new Map();
    for (const s of currentAvailable)
      for (const o of s.options[key] ?? []) map.set(String(o.value), `${o.label} [${o.value}]`);
    return [...map].map(([value2, label]) => ({ value: value2, label }));
  }
  const metric = (key) => currentAvailable.reduce((n, s) => n + (s.metrics[key] ?? 0), 0);
  function dailyTrend(lots) {
    const sums = /* @__PURE__ */ new Map();
    for (const source of currentAvailable) for (const row of source.daily) {
      if (!lots && row.kg == null) continue;
      sums.set(row.key, (sums.get(row.key) ?? 0) + (lots ? row.count : row.kg / 1e3));
    }
    return [...sums].sort(([a], [b]) => a.localeCompare(b)).map(([, n]) => n);
  }
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
  async function downloadSituation() {
    setBusy(true);
    setExportError("");
    try {
      const response = await fetch(`/api/contexts/${context.id}/analytics/caisserie/producers/export?${situationQuery.toString()}`, { credentials: "same-origin" });
      if (!response.ok) {
        const e = await response.json();
        throw new Error(e.title ?? "Export de situation indisponible.");
      }
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "VITASOUSS-caisserie-producteurs.xlsx";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export indisponible.");
    } finally {
      setBusy(false);
    }
  }
  function flowRows(rows, unit) {
    if (filters.movement) return [];
    return rows.map((r) => ({ station: r.station, key: r.key, label: r.label, entries: (unit === "caisses" ? r.entries : r.entriesPallets) ?? null, exits: (unit === "caisses" ? r.exits : r.exitsPallets) ?? null, invalid: (unit === "caisses" ? r.invalidFlowQuantities : r.invalidPalletQuantities) ?? 0 }));
  }
  const other = contexts.find((c) => String(c.id) === filters.otherContext);
  const ctxOptions = (items) => items.map((c) => ({ value: String(c.id), label: `${c.station} \xB7 ${c.label}` }));
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { gap: "md", className: "analytics-page", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", className: "analytics-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { className: "eyebrow", children: "PILOTAGE DES STATIONS \xB7 LECTURE SEULE" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Title, { order: 1, children: receipts ? "Pilotage des r\xE9ceptions" : "Pilotage de la caisserie" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { c: "dimmed", children: [
          context.station,
          " \xB7 ",
          context.label,
          other ? ` + ${other.station} \xB7 ${other.label}` : ""
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Badge, { variant: "light", color: "forest", children: "VITASOUSS 1.5.1" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", className: "analytics-filter-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", gap: "sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { gap: "xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-heading-icon", children: receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconLeaf, { size: 21 }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconPackage, { size: 21 }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { fw: 700, size: "sm", children: [
              context.station,
              " \xB7 ",
              context.label,
              other ? ` + ${other.station}` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", children: { today: "Aujourd'hui", yesterday: "Hier", seven: "7 derniers jours", week: "Semaine en cours", month: "Mois en cours", campaign: "Campagne compl\xE8te", custom: `${filters.from || "\u2026"} \u2192 ${filters.to || "\u2026"}` }[filters.period] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { gap: "xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Button, { size: "xs", variant: "default", leftSection: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconFilter, { size: 15 }), "aria-expanded": filtersOpen, "aria-controls": "analytics-filters", onClick: () => setFiltersOpen((v) => !v), children: [
            "Filtres",
            Object.entries(filters).filter(([k, v]) => k !== "period" && !!v).length ? ` \xB7 ${Object.entries(filters).filter(([k, v]) => k !== "period" && !!v).length}` : ""
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { size: "xs", variant: "subtle", onClick: () => update({ ...defaults }), children: "R\xE9initialiser" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Group, { gap: "xs", mt: "xs", className: "analytics-active-filters", children: Object.entries(filters).filter(([k, v]) => !!v && !["period", "from", "to"].includes(k)).map(([key, v]) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Badge, { variant: "light", color: "forest", children: [
        { category: "Culture", product: "Produit", variety: "Vari\xE9t\xE9", producer: "Producteur", orchard: "Verger", crateType: "Caisse", movement: "Mouvement", search: "Recherche", otherContext: "Consolidation", previousContext: "Archive", previousOtherContext: "Archive associ\xE9e" }[key],
        " : ",
        key.endsWith("Context") ? contexts.find((c) => String(c.id) === v)?.label ?? v : { category: "categories", product: "products", variety: "varieties", producer: "producers", orchard: "orchards", crateType: "crates" }[key] ? options({ category: "categories", product: "products", variety: "varieties", producer: "producers", orchard: "orchards", crateType: "crates" }[key]).find((o) => o.value === v)?.label ?? v : v
      ] }, key)) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Collapse, { in: filtersOpen, id: "analytics-filters", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { gap: "sm", mt: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.SimpleGrid, { cols: { base: 1, sm: 2, lg: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.Select,
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
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.Select,
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
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.Select,
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
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.TextInput,
            {
              label: "Recherche des d\xE9tails",
              placeholder: "Producteur, verger, vari\xE9t\xE9, num\xE9ro",
              value: filters.search,
              onChange: (e) => update({ search: e.currentTarget.value }),
              maxLength: 120
            }
          ),
          filters.period === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.TextInput,
              {
                type: "date",
                label: "Du",
                value: filters.from,
                onChange: (e) => update({ from: e.currentTarget.value })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.TextInput,
              {
                type: "date",
                label: "Au inclus",
                value: filters.to,
                onChange: (e) => update({ to: e.currentTarget.value })
              }
            )
          ] }) : null,
          ["category", "product", "variety", "producer", "orchard", "crateType"].map(
            (key, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Select,
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
          !receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.Select,
            {
              label: "Mouvement enregistr\xE9",
              data: [
                { value: "E", label: "E \xB7 entr\xE9e station" },
                { value: "S", label: "S \xB7 sortie station" }
              ],
              clearable: true,
              value: filters.movement || null,
              onChange: (v) => update({ movement: v ?? "" })
            }
          ) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.Select,
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
          other && filters.previousContext ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            import_core3.Select,
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
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", children: "Dates en heure du Maroc. Cat\xE9gorie = culture ; produit = groupe du r\xE9f\xE9rentiel. Les codes filtrent chaque source, sans rapprochement automatique." }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "subtle", onClick: () => update({ ...defaults }), children: "R\xE9initialiser les filtres" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(State, { loading: result.loading, error: result.error, retry: result.refresh, children: result.data ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { gap: "lg", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        import_core3.Alert,
        {
          className: "analytics-source-status",
          color: result.data.complete ? "green" : "orange",
          title: result.data.complete ? "Sources charg\xE9es" : "Donn\xE9es incompl\xE8tes \u2014 aucun total global garanti",
          children: current.map(
            (s) => `${s.station} : ${s.available ? `${s.campaign?.label} \xB7 ${s.total} lignes` : "indisponible"}`
          ).join(" / ")
        }
      ),
      receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "analytics-overview", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.SimpleGrid, { cols: { base: 2, sm: 2, xl: 4 }, className: "analytics-kpi-grid", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { component: "button", type: "button", withBorder: true, p: "md", className: "analytics-kpi analytics-kpi-primary", onClick: () => {
            detailFocus();
            update({ period: "today" });
          }, "aria-label": "Tonnage net aujourd'hui, voir le d\xE9tail", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", wrap: "nowrap", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-icon", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconLeaf, { size: 18 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-hint", children: "TONNAGE NET" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", mt: "sm", children: "Aujourd\u2019hui" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 750, size: "xl", children: partialMetric(metric("todayKg"), (n) => tonnes(n)) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Sparkline, { points: dailyTrend(false), label: "Tonnage net quotidien observ\xE9" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { component: "button", type: "button", withBorder: true, p: "md", className: "analytics-kpi analytics-kpi-primary", onClick: () => {
            detailFocus();
            update({ period: "campaign" });
          }, "aria-label": "Tonnage net de la campagne ou p\xE9riode, voir le d\xE9tail", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", wrap: "nowrap", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-icon", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconTrees, { size: 18 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-hint", children: "CAMPAGNE" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", mt: "sm", children: "Tonnage \xB7 p\xE9riode s\xE9lectionn\xE9e" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 750, size: "xl", children: tonnes(result.data.totalKg) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Sparkline, { points: dailyTrend(false), label: "Tonnage net observ\xE9 sur la p\xE9riode" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { component: "button", type: "button", withBorder: true, p: "md", className: "analytics-kpi analytics-kpi-primary", onClick: () => {
            detailFocus();
            update({ period: "campaign" });
          }, "aria-label": "Nombre de lots r\xE9ceptionn\xE9s, voir le d\xE9tail", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", wrap: "nowrap", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-icon", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconPackage, { size: 18 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-hint", children: "ACTIVIT\xC9" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", mt: "sm", children: "Lots r\xE9ceptionn\xE9s" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 750, size: "xl", children: partialMetric(metric("lots"), (n) => format(n, 0)) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Sparkline, { points: dailyTrend(true), label: "Nombre de lots observ\xE9s par jour" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { component: "button", type: "button", withBorder: true, p: "md", className: "analytics-kpi analytics-kpi-primary", onClick: () => {
            detailFocus();
            setFullDetails(true);
          }, "aria-label": "Producteurs distincts, voir le d\xE9tail", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", wrap: "nowrap", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-icon", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconUsers, { size: 18 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-hint", children: "PRODUCTEURS" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", mt: "sm", children: "Producteurs distincts" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 750, size: "xl", children: partialMetric(metric("producers"), (n) => format(n, 0)) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { className: "analytics-kpi-secondary", children: currentAvailable.length ? `${format(metric("varieties"), 0)} vari\xE9t\xE9s sur le p\xE9rim\xE8tre` : "Vari\xE9t\xE9s : indisponible" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, className: "analytics-metric-ribbon", px: "md", py: "sm", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "HIER" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: partialMetric(metric("yesterdayKg"), (n) => tonnes(n)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "7 DERNIERS JOURS" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: partialMetric(metric("sevenKg"), (n) => tonnes(n)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "CE MOIS" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: partialMetric(metric("monthKg"), (n) => tonnes(n)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "P\xC9RIODE PR\xC9C\xC9DENTE" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: metric("previousKg") ? signed((metric("selectedKg") - metric("previousKg")) / metric("previousKg") * 100) : "Non comparable" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "CAMPAGNE PR\xC9C\xC9DENTE" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: result.data.evolution == null ? "Non comparable" : signed(result.data.evolution) })
          ] })
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "analytics-overview", children: [
        (() => {
          const flows = current.flatMap((s) => (s.crateFlows ?? []).filter((f) => f.scope === "type"));
          const available = current.some((s) => s.available);
          const anomalous = flows.filter((f) => f.invalid > 0 || f.incoherent > 0).length;
          const reliable = flows.filter((f) => f.physicalVariation != null).length;
          const kpis = [
            { label: "Types de caisse observ\xE9s", value: available ? format(flows.length, 0) : "Indisponible", icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconPackage, { size: 18 }), hint: "R\xC9F\xC9RENCES DISTINCTES" },
            { label: "Variations calculables", value: available ? `${format(reliable, 0)} / ${format(flows.length, 0)}` : "Indisponible", icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconSwitchHorizontal, { size: 18 }), hint: "PAR TYPE UNIQUEMENT" },
            { label: "Types \xE0 v\xE9rifier", value: available ? format(anomalous, 0) : "Indisponible", icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconHistory, { size: 18 }), hint: "ANOMALIES D\xC9TECT\xC9ES" },
            { label: "Stock / dettes certifi\xE9s", value: "Non d\xE9terminables", icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconLock, { size: 18 }), hint: "OUVERTURES \xC0 CONFIRMER" }
          ];
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.SimpleGrid, { cols: { base: 2, sm: 2, xl: 4 }, className: "analytics-kpi-grid", children: kpis.map((kpi) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", className: "analytics-kpi analytics-kpi-primary", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", wrap: "nowrap", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-icon", children: kpi.icon }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-kpi-hint", children: kpi.hint })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", mt: "sm", children: kpi.label }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 750, size: "xl", children: kpi.value }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { className: "analytics-kpi-secondary", children: "Les types restent s\xE9par\xE9s ; aucun stock absolu n\u2019est d\xE9duit." })
          ] }, kpi.label)) });
        })(),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, className: "analytics-crate-ledger", p: "md", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", mb: "xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "Flux de caisserie par type" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", children: "Lecture par r\xE9f\xE9rence \xB7 quantit\xE9s E et S pr\xE9sent\xE9es s\xE9par\xE9ment" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Badge, { variant: "light", color: "forest", children: "E \u2212 S \xB7 p\xE9riode filtr\xE9e" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.ScrollContainer, { minWidth: 620, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { striped: true, highlightOnHover: true, children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Station" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Type de caisse" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Entr\xE9es E" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Sorties S" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Variation E \u2212 S" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Contr\xF4le" })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: current.flatMap((s) => (s.crateFlows ?? []).filter((f) => f.scope === "type").map((f) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: s.station }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
                f.crate,
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "analytics-code", children: [
                  "#",
                  f.crateType ?? "?"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: format(f.entries, 0) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: format(f.exits, 0) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, c: f.physicalVariation == null ? "dimmed" : f.physicalVariation < 0 ? "orange" : "forest", children: f.physicalVariation == null ? "\xC0 v\xE9rifier" : `${f.physicalVariation > 0 ? "+" : ""}${format(f.physicalVariation, 0)}` }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: f.invalid || f.incoherent ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Badge, { color: "orange", variant: "light", children: "Anomalie" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Badge, { color: "gray", variant: "light", children: "Flux constat\xE9" }) })
            ] }, `${s.contextId}:${f.crateType}`))) })
          ] }) }),
          current.every((s) => !(s.crateFlows ?? []).some((f) => f.scope === "type")) ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "analytics-empty-compact", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "analytics-empty-mark", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconPackage, { size: 22 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 600, children: "Aucun flux de caisse sur ce p\xE9rim\xE8tre" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", children: "Les soldes de propri\xE9t\xE9 ne sont pas d\xE9duits des mouvements disponibles." })
            ] })
          ] }) : null
        ] })
      ] }),
      exportError ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "red", children: exportError }) : null,
      !receipts && !filters.crateType ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "blue", children: "Les quantit\xE9s de caisses exigent un type s\xE9lectionn\xE9. Le graphique Palettes utilise les quantit\xE9s enregistr\xE9es s\xE9par\xE9ment ; les classements non typ\xE9s restent des nombres de mouvements. Aucun type de caisse n'est consid\xE9r\xE9 interchangeable." }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Tabs, { defaultValue: "daily", className: "analytics-tabs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Tabs.List, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Tab, { value: "daily", children: "Quotidien" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Tab, { value: "weekly", children: "Semaines ISO" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Tab, { value: "distribution", children: "R\xE9partition" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Tab, { value: "comparison", children: "Stations & campagnes" }),
          receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Tab, { value: "estimates", children: "Estimations indicatives" }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Tabs.Panel, { value: "daily", pt: "md", children: [
          !receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Group, { justify: "flex-end", mb: "sm", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Select, { "aria-label": "Unit\xE9 du graphique Caisserie", value: caisserieUnit, onChange: (v) => v && setCaisserieUnit(v), data: [{ value: "palettes", label: "Palettes" }, { value: "caisses", label: "Caisses \xB7 s\xE9lectionner un type" }], w: 260 }) }) : null,
          !receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "analytics-daily-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CaisserieFlowChart, { title: `Entr\xE9es et sorties par jour \xB7 ${caisserieUnit}`, unitLabel: caisserieUnit, unavailableMessage: filters.movement ? "Retirez le filtre E/S pour comparer les deux sens." : caisserieUnit === "caisses" && !filters.crateType ? "S\xE9lectionnez un type de caisse pour afficher des quantit\xE9s comparables." : "Aucune quantit\xE9 fiable sur cette p\xE9riode", rows: currentAvailable.flatMap((s) => flowRows(s.daily, caisserieUnit)), onChoose: (r) => selectPeriod(r.key, r.key) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Chart, { title: "Flux par type de caisse", rows: currentAvailable.flatMap((s) => s.movements), crates: true })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "analytics-daily-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              TemporalChart,
              {
                title: receipts ? "Tonnage net par jour \xB7 cliquez pour d\xE9tailler" : filters.crateType ? "Quantit\xE9s du type s\xE9lectionn\xE9 par jour \xB7 aucun solde" : "Nombre de mouvements par jour \xB7 types non additionn\xE9s",
                rows: currentAvailable.flatMap((s) => s.daily).sort((a, b) => a.key.localeCompare(b.key)),
                crates: !receipts,
                unitLabel: receipts ? "tonnes nettes" : filters.crateType ? "caisses mouvement\xE9es" : "mouvements",
                variant: "line",
                onChoose: (r) => selectPeriod(r.key, r.key)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(VarietyRing, { rows: currentAvailable.flatMap((s) => s.varieties), onChoose: (r) => drillDimension(r, "variety") })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Panel, { value: "weekly", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { children: [
          !receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Group, { justify: "flex-end", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Select, { "aria-label": "Unit\xE9 du graphique Caisserie", value: caisserieUnit, onChange: (v) => v && setCaisserieUnit(v), data: [{ value: "palettes", label: "Palettes" }, { value: "caisses", label: "Caisses \xB7 s\xE9lectionner un type" }], w: 260 }) }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", c: "dimmed", className: "analytics-week-intro", children: receipts ? "Semaine ISO lundi\u2013dimanche. Les colonnes montrent les tonnes nettes et la courbe verte le nombre de lots." : `Semaine ISO lundi\u2013dimanche. Les colonnes distinguent les entr\xE9es et sorties de ${caisserieUnit}; les types de caisse ne sont jamais additionn\xE9s.` }),
          !receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CaisserieFlowChart, { title: `Entr\xE9es et sorties par semaine ISO \xB7 ${caisserieUnit}`, unitLabel: caisserieUnit, unavailableMessage: filters.movement ? "Retirez le filtre E/S pour comparer les deux sens." : caisserieUnit === "caisses" && !filters.crateType ? "S\xE9lectionnez un type de caisse pour afficher des quantit\xE9s comparables." : "Aucune quantit\xE9 fiable sur cette p\xE9riode", rows: currentAvailable.flatMap((s) => flowRows(s.weekly, caisserieUnit)), onChoose: (r) => weekPeriod(r.key) }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            TemporalChart,
            {
              title: receipts ? "R\xE9ceptions par semaine ISO" : "Mouvements par semaine ISO",
              rows: currentAvailable.flatMap((s) => s.weekly).sort((a, b) => a.key.localeCompare(b.key)),
              crates: !receipts,
              unitLabel: receipts ? "tonnes nettes" : filters.crateType ? "caisses mouvement\xE9es" : "mouvements",
              variant: "combo",
              onChoose: (r) => weekPeriod(r.key)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(WeeklyComparison, { sources: currentAvailable, crates: !receipts, movementOnly: !receipts && !filters.crateType })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Panel, { value: "distribution", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            Chart,
            {
              title: "Classement des vari\xE9t\xE9s",
              rows: currentAvailable.flatMap((s) => s.varieties).sort((a, b) => (b.kg ?? b.quantity ?? 0) - (a.kg ?? a.quantity ?? 0)),
              crates: !receipts,
              onChoose: (r) => drillDimension(r, "variety")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            Chart,
            {
              title: "Classement des producteurs",
              rows: currentAvailable.flatMap((s) => s.producers).sort((a, b) => (b.kg ?? b.quantity ?? 0) - (a.kg ?? a.quantity ?? 0)),
              crates: !receipts,
              onChoose: (r) => drillDimension(r, "producer")
            }
          ),
          !receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ProducerSituationTable, { data: situation.data, loading: situation.loading, error: situation.error, search: producerSearch, onSearch: (v) => {
            setProducerSearch(v);
            setSituationPage(1);
          }, sort: situationSort, onSort: (v) => {
            setSituationSort(v);
            setSituationPage(1);
          }, asc: situationAsc, onDirection: () => setSituationAsc((v) => !v), page: situationPage, onPage: setSituationPage, onExport: downloadSituation, busy, exportError, onOpen: (r) => {
            if (r.producerId != null) drillDimension({ station: r.station, key: String(r.producerId), label: r.producer, kg: null, count: 0, quantity: null }, "producer");
          } }) : null,
          receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "Part des vari\xE9t\xE9s dans le tonnage observ\xE9" }),
            currentAvailable.flatMap((s) => s.varieties).map((r) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { size: "sm", children: [
                r.station,
                " \xB7 ",
                r.label
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", children: result.data?.observedKg ? format((r.kg ?? 0) / result.data.observedKg * 100, 1) + " %" : "Non calculable" })
            ] }, `${r.station}:${r.key}`))
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            Chart,
            {
              title: "Types de caisses et mouvements \xB7 types non interchangeables",
              rows: currentAvailable.flatMap((s) => s.movements),
              crates: true
            }
          )
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Panel, { value: "comparison", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { children: [
          !receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "Producteurs et vergers \xB7 flux enregistr\xE9s" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", mb: "sm", children: "Ces lignes d\xE9crivent les mouvements associ\xE9s au producteur et au verger ; elles ne certifient ni dette ni propri\xE9t\xE9." }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.ScrollArea, { h: 300, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.ScrollContainer, { minWidth: 700, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Station / attribution" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Nom" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Type" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "E" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "S" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Contr\xF4le" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: current.flatMap((s) => (s.crateFlows ?? []).filter((f) => f.scope !== "type").map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
                  s.station,
                  " \xB7 ",
                  f.scope === "producer" ? "Producteur" : "Verger"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
                  f.scope === "producer" ? f.producerLabel : f.orchardLabel,
                  " [",
                  f.scope === "producer" ? f.producerId : f.orchardId,
                  "]"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: f.crate }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: format(f.entries, 0) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: format(f.exits, 0) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: f.invalid || f.incoherent ? "\xC0 v\xE9rifier" : "Rattachement coh\xE9rent ; nature non certifi\xE9e" })
              ] }, `${s.contextId}:${f.scope}:${i}`))) })
            ] }) }) })
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.SimpleGrid, { cols: { base: 1, md: 2 }, children: current.map((s) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { fw: 700, children: [
              s.station,
              " \xB7 ",
              s.campaign?.label
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xl", children: s.available ? receipts ? tonnes(s.metrics.selectedKg) : `${format(s.total, 0)} mouvements` : "Source indisponible" }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { children: [
              "Contribution :",
              " ",
              result.data?.observedKg ? format(
                (s.metrics.selectedKg ?? 0) / result.data.observedKg * 100,
                1
              ) + " %" : "Non calculable"
            ] }) : null
          ] }, s.contextId)) }),
          prior.length ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", className: "analytics-comparison-summary", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "Comparaison des campagnes" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tooltip, { multiline: true, w: 300, label: "Variation = (tonnage actuel \u2212 tonnage pr\xE9c\xE9dent) / tonnage pr\xE9c\xE9dent \xD7 100. Les dates sont align\xE9es sur le m\xEAme nombre de jours \xE9coul\xE9s depuis le d\xE9but de chaque campagne. Aucun taux de r\xE9alisation pr\xE9visionnelle.", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Badge, { variant: "light", children: "M\xE9thode de calcul \u24D8" }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.SimpleGrid, { cols: { base: 1, sm: 2 }, mt: "sm", children: [...current, ...prior].map((s) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { size: "sm", fw: 600, children: [
                  s.station,
                  " \xB7 ",
                  s.campaign?.label ?? "Campagne indisponible"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { size: "xs", c: "dimmed", children: [
                  s.period?.from?.slice(0, 10),
                  " \u2192 ",
                  s.period?.to?.slice(0, 10)
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 750, size: "xl", children: s.available && s.metrics.missingNet === 0 && s.metrics.missingDate === 0 ? tonnes(s.metrics.selectedKg) : "Non comparable" })
              ] }, s.contextId)) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { mt: "xs", fw: 700, children: [
                "\xC9volution : ",
                result.data.evolution == null ? "Non comparable" : signed(result.data.evolution)
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { children: "Comparaison \xE0 dur\xE9e \xE9coul\xE9e \xE9quivalente depuis le d\xE9but de campagne ; borne courante limit\xE9e \xE0 aujourd'hui. Les s\xE9ries ci-dessous portent leurs dates r\xE9elles et sont align\xE9es par jours \xE9coul\xE9s dans le tableau comparatif." }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CampaignComparison, { current, prior }) : null,
            prior.map((s) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { fw: 700, children: [
                s.station,
                " \xB7 ",
                s.campaign?.label,
                " \xB7",
                " ",
                s.available ? "Archive charg\xE9e" : "Archive indisponible"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                Chart,
                {
                  title: "Archive \xB7 \xE9volution quotidienne",
                  rows: s.daily,
                  crates: !receipts
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                Chart,
                {
                  title: "Archive \xB7 semaines ISO",
                  rows: s.weekly,
                  crates: !receipts
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.SimpleGrid, { cols: { base: 1, md: 2 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  Chart,
                  {
                    title: "Archive \xB7 vari\xE9t\xE9s",
                    rows: s.varieties,
                    crates: !receipts
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  Chart,
                  {
                    title: "Archive \xB7 producteurs",
                    rows: s.producers,
                    crates: !receipts
                  }
                )
              ] })
            ] }, s.contextId))
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "gray", children: "S\xE9lectionnez une archive r\xE9ellement configur\xE9e pour comparer deux campagnes. Aucune donn\xE9e historique n'est g\xE9n\xE9r\xE9e." })
        ] }) }),
        receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Tabs.Panel, { value: "estimates", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Stack, { children: [
          !result.data.estimateConsolidationAvailable ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "orange", children: "Pas d'estimation consolid\xE9e : l'identit\xE9 interstation des parcelles n'est pas d\xE9montr\xE9e. Les valeurs ci-dessous restent s\xE9par\xE9es par source et ne doivent pas \xEAtre additionn\xE9es." }) : null,
          currentAvailable.map((s) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Estimates, { source: s }, s.contextId)),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Alert, { color: "orange", children: [
            "Les estimations ne sont pas rattach\xE9es \xE0 une campagne par le sch\xE9ma. Tonnage r\xE9el dans la p\xE9riode : ",
            tonnes(result.data.observedKg),
            ". Aucun \xE9cart ni taux de r\xE9alisation n'est calcul\xE9 sur ces p\xE9rim\xE8tres non comparables."
          ] })
        ] }) }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", id: "analytics-details", className: "analytics-detail-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", mb: "md", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: receipts ? "D\xE9tail des r\xE9ceptions" : "Historique des mouvements" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { size: "sm", c: "dimmed", children: [
              format(result.data.total, 0),
              " lignes \xB7 pagination et tri c\xF4t\xE9 serveur"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Select,
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
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_core3.Button,
              {
                variant: "light",
                onClick: () => {
                  setAsc((v) => !v);
                  setPage(1);
                },
                children: asc ? "Croissant" : "D\xE9croissant"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              import_core3.Button,
              {
                variant: "light",
                loading: busy,
                disabled: !current.every((s) => s.available),
                onClick: () => void download(),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconFileSpreadsheet, { size: 16 }),
                  " Exporter Excel"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.ScrollContainer, { minWidth: 1e3, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { striped: true, highlightOnHover: true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Station / n\xB0" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Date" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Producteur" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Verger" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Cat\xE9gorie / produit" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Vari\xE9t\xE9" }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Poids net" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Type caisse" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Mvt." }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Quantit\xE9" })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: (fullDetails ? result.data.rows : result.data.rows.slice(0, 5)).map((r) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
              r.station,
              " \xB7 ",
              r.number
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: r.date ?? "Date manquante" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
              r.producer,
              " [",
              r.producerId ?? "?",
              "]"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
              r.orchard,
              " [",
              r.orchardId ?? "?",
              "]"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
              r.category,
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("br", {}),
              r.product
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: r.variety }),
            receipts ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
              tonnes(r.netKg),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { size: "xs", c: "dimmed", children: [
                format(r.netKg, 2),
                " kg"
              ] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: r.crate }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Badge, { variant: "light", children: r.movement ?? "?" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: format(r.quantity, 0) })
            ] })
          ] }, `${r.contextId}:${r.number}`)) })
        ] }) }),
        result.data.rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { c: "dimmed", py: "md", children: "Aucune ligne sur ce p\xE9rim\xE8tre." }) : null,
        result.data.rows.length > 5 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "subtle", size: "xs", mt: "sm", onClick: () => setFullDetails((v) => !v), children: fullDetails ? "R\xE9duire \xE0 5 lignes" : `Voir les ${result.data.rows.length} lignes de cette page` }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_core3.Pagination,
          {
            mt: "md",
            value: page,
            total: Math.max(1, Math.min(400, Math.ceil(result.data.total / 25))),
            onChange: setPage,
            "aria-label": "Pages des d\xE9tails"
          }
        ),
        result.data.total > 1e4 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", children: "Affinez la p\xE9riode pour acc\xE9der au-del\xE0 des 10 000 premi\xE8res lignes. Export jusqu'\xE0 20 000 lignes." }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: "Sources, calculs et limites des donn\xE9es" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Stack, { gap: "xs", mt: "sm", children: [
          .../* @__PURE__ */ new Set([
            ...result.data.warnings,
            ...result.data.sources.flatMap((s) => s.warnings)
          ])
        ].map((w) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", children: w }, w)) })
      ] })
    ] }) : null })
  ] });
}
function WeeklyComparison({ sources, crates, movementOnly = false }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", className: "analytics-week-table-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", mb: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "D\xE9tail par semaine ISO" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { className: "analytics-muted-note", children: "Variations calcul\xE9es uniquement entre semaines cons\xE9cutives observ\xE9es." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.ScrollArea, { h: Math.min(300, Math.max(76, sources.reduce((n, s) => n + s.weekly.length, 0) * 36 + 42)), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { className: "analytics-week-table", striped: true, highlightOnHover: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Station" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Semaine ISO" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: movementOnly ? "Mouvements" : crates ? "Quantit\xE9 d\xE9plac\xE9e" : "Tonnage net" }),
        !movementOnly ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: crates ? "Mouvements" : "Lots" }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: "Variation" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: sources.flatMap((s) => s.weekly.map((w, i) => {
        const prior = s.weekly[i - 1];
        const adjacent = prior && Math.round((isoMonday(w.key).getTime() - isoMonday(prior.key).getTime()) / 864e5) === 7;
        const before = adjacent ? crates ? prior.quantity : prior.kg : null;
        const now = crates ? w.quantity : w.kg;
        const change = before != null && before > 0 && now != null ? signed((now - before) / before * 100) : "Non comparable";
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: s.station }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: w.label }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: crates ? format(now, 0) : tonnes(now) }),
          !movementOnly ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: format(w.count, 0) }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: change })
        ] }, `${s.contextId}:${w.key}`);
      })) })
    ] }) })
  ] });
}
function ProducerSituationTable({ data, loading, error, search, onSearch, sort, onSort, asc, onDirection, page, onPage, onExport, busy, exportError, onOpen }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", className: "analytics-producer-situation", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { justify: "space-between", mb: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "Situation de la caisserie par producteur" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", c: "dimmed", children: "Balance des mouvements par producteur et type \xB7 sorties \u2212 entr\xE9es ; aucune dette ni stock station d\xE9duits." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { size: "xs", leftSection: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconFileSpreadsheet, { size: 15 }), onClick: onExport, loading: busy, disabled: !data?.total, children: "Exporter Excel" })
    ] }),
    !data?.complete && data ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Alert, { color: "yellow", mb: "sm", children: [
      "Une source est indisponible : les totaux consolid\xE9s sont incomplets. ",
      data.warnings.join(" ")
    ] }) : null,
    error ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "red", mb: "sm", children: error }) : null,
    exportError ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Alert, { color: "red", mb: "sm", children: exportError }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Group, { mb: "sm", align: "end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.TextInput, { label: "Rechercher un producteur", placeholder: "Nom ou r\xE9f\xE9rence", value: search, onChange: (e) => onSearch(e.currentTarget.value) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Select, { label: "Classement", value: sort, onChange: (v) => v && onSort(v), data: [{ value: "exits", label: "Sorties caisses" }, { value: "entries", label: "Entr\xE9es caisses" }, { value: "balance", label: "Solde caisses" }, { value: "palletExits", label: "Sorties palettes" }, { value: "palletEntries", label: "Entr\xE9es palettes" }, { value: "palletBalance", label: "Solde palettes" }, { value: "producer", label: "Producteur" }] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Button, { variant: "default", onClick: onDirection, children: asc ? "Croissant" : "D\xE9croissant" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.ScrollContainer, { minWidth: 1040, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { striped: true, highlightOnHover: true, className: "analytics-producer-table", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Station" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Producteur" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Type de caisse" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: "Entr\xE9es caisses" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: "Sorties caisses" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: "Solde caisses" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: "Entr\xE9es palettes" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: "Sorties palettes" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { ta: "right", children: "Solde palettes" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: data?.rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: r.station }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Button, { variant: "subtle", size: "compact-sm", onClick: () => onOpen(r), disabled: r.producerId == null, children: [
            r.producer,
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "analytics-code", children: [
              "[",
              r.producerId ?? "?",
              "]"
            ] })
          ] }),
          r.invalid || r.invalidPallets || r.incoherent ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Badge, { ml: "xs", color: "orange", variant: "light", children: "\xC0 v\xE9rifier" }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
          r.crate,
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "analytics-code", children: [
            "#",
            r.crateType ?? "?"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: r.invalid ? "\xC0 v\xE9rifier" : format(r.entries, 0) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: r.invalid ? "\xC0 v\xE9rifier" : format(r.exits, 0) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", c: r.crateBalance == null ? "dimmed" : r.crateBalance < 0 ? "orange" : "forest", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: r.crateBalance == null ? "\xC0 v\xE9rifier" : format(r.crateBalance, 0) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: r.invalidPallets ? "\xC0 v\xE9rifier" : format(r.entriesPallets, 0) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: r.invalidPallets ? "\xC0 v\xE9rifier" : format(r.exitsPallets, 0) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", c: r.palletBalance == null ? "dimmed" : r.palletBalance < 0 ? "orange" : "forest", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: r.palletBalance == null ? "\xC0 v\xE9rifier" : format(r.palletBalance, 0) }) })
      ] }, `${r.contextId}:${r.producerId}:${r.crateType}:${i}`)) })
    ] }) }),
    loading ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", c: "dimmed", mt: "sm", children: "Chargement des situations\u2026" }) : data?.total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "sm", c: "dimmed", mt: "sm", children: "Aucun mouvement attribu\xE9 \xE0 un producteur sur ce p\xE9rim\xE8tre." }) : null,
    (data?.totals?.length ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.ScrollContainer, { minWidth: 1040, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table, { className: "analytics-situation-totals", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: data.totals.map((t) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: t.station }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("strong", { children: [
        "TOTAL \xB7 ",
        t.crate,
        " #",
        t.crateType ?? "?"
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, {}),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: t.invalid ? "\xC0 v\xE9rifier" : format(t.entries, 0) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: t.invalid ? "\xC0 v\xE9rifier" : format(t.exits, 0) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: t.crateBalance == null ? "\xC0 v\xE9rifier" : format(t.crateBalance, 0) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: t.invalidPallets ? "\xC0 v\xE9rifier" : format(t.entriesPallets, 0) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: t.invalidPallets ? "\xC0 v\xE9rifier" : format(t.exitsPallets, 0) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { ta: "right", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: t.palletBalance == null ? "\xC0 v\xE9rifier" : format(t.palletBalance, 0) }) })
    ] }, `${t.contextId}:${t.crateType}`)) }) }) }) : null,
    data && data.total > data.pageSize ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Pagination, { mt: "sm", value: page, onChange: onPage, total: Math.ceil(data.total / data.pageSize) }) : null
  ] });
}
function isoMonday(key) {
  const d = new Date(Date.UTC(Number(key.slice(0, 4)), 0, 4));
  d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7 + (Number(key.slice(4)) - 1) * 7);
  return d;
}
function CampaignComparison({ current, prior }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: "Alignement depuis le d\xE9but de campagne" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.ScrollContainer, { minWidth: 600, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Station" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Jour campagne" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Actuel" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Archive" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Actuel t" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Archive t" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Cumul actuel t" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Cumul archive t" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: current.flatMap((s, i) => {
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
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: s.station }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
              "J",
              day + 1
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: d?.key ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: v?.key ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: tonnes(d?.kg ?? 0) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: tonnes(v?.kg ?? 0) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: tonnes(cumul) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: tonnes(oldCumul) })
          ] }, `${s.contextId}:${day}`);
        });
      }) })
    ] }) })
  ] });
}
function Estimates({ source }) {
  const e = source.estimates;
  if (!e)
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Alert, { color: "gray", children: [
      source.station,
      " : estimation non disponible dans ce sch\xE9ma."
    ] });
  const coverage = e.summary.parcels ? e.summary.usable / e.summary.parcels * 100 : 0;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { fw: 700, children: [
      source.station,
      " \xB7 r\xE9f\xE9rentiel de parcelles"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.SimpleGrid, { cols: { base: 2, md: 4 }, mt: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", children: "Estimation partielle exploitable" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: tonnes(e.summary.estimatedKg) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", children: "Parcelles renseign\xE9es et non ambigu\xEBs" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { fw: 700, children: [
          e.summary.usable,
          " / ",
          e.summary.parcels
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", children: "Incompl\xE8tes ou ambigu\xEBs" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { fw: 700, children: e.summary.parcels - e.summary.usable })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", children: "Couverture indicative" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Text, { fw: 700, children: [
          format(coverage, 1),
          " %"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Progress, { value: coverage, "aria-label": "Couverture des estimations" })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Text, { size: "xs", c: "dimmed", mt: "md", children: "P\xE9rim\xE8tre du r\xE9f\xE9rentiel : filtres produit, vari\xE9t\xE9, producteur et verger uniquement. Dates, type de caisse et mouvement ne d\xE9crivent pas une parcelle. Aucun rattachement campagne prouv\xE9." }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: "Parcelles \xE0 compl\xE9ter \xB7 100 premi\xE8res lignes" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.ScrollContainer, { minWidth: 600, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Identit\xE9 m\xE9tier" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "Verger" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Th, { children: "\xC0 v\xE9rifier" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Tbody, { children: e.incomplete.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Tr, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_core3.Table.Td, { children: [
            p.refver,
            " / ",
            p.refpar,
            " / ",
            p.numcul
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: p.orchard }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_core3.Table.Td, { children: p.reason })
        ] }, `${p.idparcelle}:${i}`)) })
      ] }) })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnalyticsDashboard,
  ProducerSituationTable
});
/*! Bundled license information:

@tabler/icons-react/dist/esm/defaultAttributes.mjs:
@tabler/icons-react/dist/esm/createReactComponent.mjs:
@tabler/icons-react/dist/esm/icons/IconAlertCircle.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabaseOff.mjs:
@tabler/icons-react/dist/esm/icons/IconHistory.mjs:
@tabler/icons-react/dist/esm/icons/IconLeaf.mjs:
@tabler/icons-react/dist/esm/icons/IconLock.mjs:
@tabler/icons-react/dist/esm/icons/IconSwitchHorizontal.mjs:
@tabler/icons-react/dist/esm/icons/IconTrees.mjs:
@tabler/icons-react/dist/esm/icons/IconUsers.mjs:
@tabler/icons-react/dist/esm/icons/IconFilter.mjs:
@tabler/icons-react/dist/esm/icons/IconFileSpreadsheet.mjs:
@tabler/icons-react/dist/esm/icons/IconPackage.mjs:
  (**
   * @license @tabler/icons-react v3.35.0 - MIT
   *
   * This source code is licensed under the MIT license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

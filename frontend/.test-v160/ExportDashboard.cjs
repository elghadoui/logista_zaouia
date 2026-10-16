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

// frontend/src/ExportDashboard.tsx
var ExportDashboard_exports = {};
__export(ExportDashboard_exports, {
  ExportDashboard: () => ExportDashboard
});
module.exports = __toCommonJS(ExportDashboard_exports);
var import_react3 = require("react");
var import_core2 = require("@mantine/core");
var import_hooks = require("@mantine/hooks");

// frontend/src/api.ts
var useApi = () => ({ data: globalThis.__exportData, loading: false, error: "", refresh: () => {
} });

// frontend/src/AnalyticsVisuals.tsx
var import_react2 = require("react");
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

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconDatabaseOff.mjs
var __iconNode = [["path", { "d": "M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74", "key": "svg-0" }], ["path", { "d": "M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6", "key": "svg-1" }], ["path", { "d": "M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4", "key": "svg-2" }], ["path", { "d": "M3 3l18 18", "key": "svg-3" }]];
var IconDatabaseOff = createReactComponent("outline", "database-off", "DatabaseOff", __iconNode);

// frontend/src/AnalyticsVisuals.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var number = (n) => new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 3 }).format(n);
var value = (r, crates) => crates ? r.quantity : r.kg == null ? null : r.kg / 1e3;
var color = (station) => station === "DIAF" ? "#dc8b42" : "#43875b";
function TemporalChart({ title, rows, crates = false, onChoose, variant = "line", unitLabel, countLabel }) {
  const [selected, setSelected] = (0, import_react2.useState)(null);
  const [containerWidth, setContainerWidth] = (0, import_react2.useState)(0);
  const plotRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Paper, { withBorder: true, p: "md", className: `analytics-chart-card ${variant === "combo" ? "analytics-chart-combo" : ""}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "space-between", mb: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 700, children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { gap: "md", className: "analytics-chart-legend", children: [
        stations.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: variant === "combo" ? "analytics-legend-column" : "", style: { background: variant === "combo" ? barColor(s) : color(s) } }),
          s,
          variant === "combo" ? ` \xB7 ${unit}` : ""
        ] }, `${s}:bar`)),
        variant === "combo" && stations.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "analytics-legend-line", style: { background: lineColor(s) } }),
          s,
          " \xB7 ",
          countUnit
        ] }, `${s}:line`))
      ] })
    ] }),
    rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "analytics-chart-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "analytics-empty-mark", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconDatabaseOff, { size: 22 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 600, children: "Aucune donn\xE9e sur cette p\xE9riode" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "xs", c: "dimmed", children: "Le graphique appara\xEEtra d\xE8s qu\u2019une observation sera disponible pour ces filtres." })
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: plotRef, className: "analytics-plot-scroll", tabIndex: 0, "aria-label": "Graphique d\xE9filant ; chaque observation est accessible au clavier", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: `0 0 ${width} ${height + 38}`, style: { width, minWidth: "100%" }, role: "group", "aria-label": title, children: [
        [0, 1, 2, 3, 4].map((i) => {
          const yy = plotBottom - plotHeight * i / 4;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: side, x2: width - side, y1: yy, y2: yy, className: "analytics-gridline" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: side - 10, y: yy + 4, textAnchor: "end", className: "analytics-axis", children: number(min + span * i / 4) }),
            variant === "combo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: width - side + 10, y: yy + 4, textAnchor: "start", className: "analytics-axis", children: new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(countMax * i / 4) }) : null
          ] }, i);
        }),
        variant === "combo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: side, y: "17", className: "analytics-axis analytics-axis-title", children: unit }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: width - side, y: "17", textAnchor: "end", className: "analytics-axis analytics-axis-title", children: countLabel ?? (crates ? "Mouvements" : "Lots") })
        ] }) : null,
        variant === "bars" ? keys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
          stations.map((station, j) => {
            const r = byIdentity.get(`${station}:${key}`);
            if (!r || value(r, crates) == null) return null;
            const n = value(r, crates), h = Math.abs(y(n ?? 0) - y(0));
            const fill = color(station);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-column", "aria-label": `${r.label} \xB7 ${station} \xB7 ${n == null ? "indisponible" : number(n)} ${unit}`, onMouseEnter: () => setSelected(r), onFocus: () => setSelected(r), onClick: () => onChoose?.(r), onKeyDown: (e) => {
              if (onChoose && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChoose(r);
              }
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${r.label} \xB7 ${station} : ${n == null ? "Indisponible" : number(n)} ${unit} \xB7 ${r.count} ${countUnit}` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: side + i * cell + j * (bar + 4), y: Math.min(y(0), y(n ?? 0)) - (h === 0 ? 1 : 0), width: Math.max(3, bar), height: Math.max(2, h), rx: "4", fill, opacity: n == null ? 0.3 : 0.9 })
            ] }, station);
          }),
          (i % Math.max(1, Math.ceil(keys.length / 12)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: pointX(i), y: height + 19, textAnchor: "middle", className: "analytics-axis", children: displayedKey(key) })
        ] }, key)) : variant === "combo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          keys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
            stations.map((station, j) => {
              const r = byIdentity.get(`${station}:${key}`);
              if (!r || value(r, crates) == null) return null;
              const n = value(r, crates), h = Math.abs(y(n ?? 0) - y(0));
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-column", "aria-label": `${r.label} \xB7 ${station} \xB7 ${n == null ? "indisponible" : number(n)} ${unit} \xB7 ${r.count} ${countUnit}`, onMouseEnter: () => setSelected(r), onFocus: () => setSelected(r), onClick: () => onChoose?.(r), onKeyDown: (e) => {
                if (onChoose && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChoose(r);
                }
              }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${r.label} \xB7 ${station} : ${n == null ? "Indisponible" : number(n)} ${unit} \xB7 ${r.count} ${countUnit}` }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: side + i * cell + j * (bar + 4), y: Math.min(y(0), y(n ?? 0)), width: Math.max(3, bar), height: Math.max(2, h), rx: "4", fill: barColor(station), opacity: n == null ? 0.35 : 0.88 })
              ] }, station);
            }),
            (i % Math.max(1, Math.ceil(keys.length / 16)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: pointX(i), y: height + 19, textAnchor: "middle", className: "analytics-axis", children: displayedKey(key) })
          ] }, key)),
          stations.map((station) => seriesSegments(station, true).map((segment, j) => {
            const d = segment.map((p, i) => `${i ? "L" : "M"} ${pointX(p.index)} ${yCount(p.row.count)}`).join(" ");
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: "analytics-combo-line", children: [
              segment.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d, fill: "none", stroke: lineColor(station), strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }) : null,
              segment.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-line-point", "aria-label": `${p.row.label} \xB7 ${station} \xB7 ${p.row.count} ${countUnit}`, onMouseEnter: () => setSelected(p.row), onFocus: () => setSelected(p.row), onClick: () => onChoose?.(p.row), onKeyDown: (e) => {
                if (onChoose && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChoose(p.row);
                }
              }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${p.row.label} \xB7 ${station} : ${p.row.count} ${countUnit}` }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: pointX(p.index), cy: yCount(p.row.count), r: "5", fill: lineColor(station), stroke: "white", strokeWidth: "2" })
              ] }, `${p.row.key}:${station}`))
            ] }, `count:${station}:${j}`);
          }))
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          stations.map((station) => seriesSegments(station).map((segment, j) => {
            const d = segment.map((p, i) => `${i ? "L" : "M"} ${pointX(p.index)} ${y(p.n)}`).join(" ");
            const fill = `${d} L ${pointX(segment[segment.length - 1].index)} ${y(0)} L ${pointX(segment[0].index)} ${y(0)} Z`;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
              segment.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: fill, fill: color(station), opacity: ".08" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d, fill: "none", stroke: color(station), strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" })
              ] }) : null,
              segment.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-line-point", "aria-label": `${p.row.label} \xB7 ${station} \xB7 ${number(p.n)} ${crates ? "unit\xE9s" : "tonnes"}`, onMouseEnter: () => setSelected(p.row), onFocus: () => setSelected(p.row), onClick: () => onChoose?.(p.row), onKeyDown: (e) => {
                if (onChoose && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onChoose(p.row);
                }
              }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${p.row.label} \xB7 ${station} : ${number(p.n)} ${crates ? "unit\xE9s" : "t"} \xB7 ${p.row.count} ${countUnit}` }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: pointX(p.index), cy: y(p.n), r: "4", fill: color(station), stroke: "white", strokeWidth: "2" })
              ] }, `${p.row.key}:${station}`))
            ] }, `${station}:${j}`);
          })),
          keys.map((key, i) => (i % Math.max(1, Math.ceil(keys.length / 12)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: pointX(i), y: height + 19, textAnchor: "middle", className: "analytics-axis", children: displayedKey(key) }, key))
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "xs", c: "dimmed", className: "analytics-chart-caption", children: selected ? `${selected.station} \xB7 ${selected.label} : ${value(selected, crates) == null ? "Indisponible" : number(value(selected, crates))} ${unit}${variant === "combo" ? ` \xB7 ${selected.count} ${countUnit}` : ""}` : `Observations r\xE9elles${variant !== "bars" ? " \xB7 segments interrompus aux semaines ou dates absentes" : ""}${onChoose ? " \xB7 Entr\xE9e ouvre le d\xE9tail" : ""}.` })
    ] })
  ] });
}
function VarietyRing({ rows, onChoose }) {
  if (rows.some((r) => r.kg != null && r.kg < 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 700, children: "R\xE9partition du tonnage observ\xE9" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "sm", c: "dimmed", mt: "md", children: "R\xE9partition indisponible : des valeurs n\xE9gatives n\xE9cessitent une v\xE9rification. Consultez les classements et les d\xE9tails." })
  ] });
  const sorted = rows.filter((r) => (r.kg ?? 0) > 0).sort((a, b) => b.kg - a.kg);
  const total = sorted.reduce((s, r) => s + r.kg, 0);
  const palette = ["#286044", "#559256", "#93b76c", "#d9bb68", "#cf8c4b"];
  let offset = 0;
  const segments = sorted.slice(0, 4).map((r, i) => ({ row: r, label: r.label, kg: r.kg, color: palette[i] }));
  if (sorted.length > 4) segments.push({ row: sorted[4], label: "Autres vari\xE9t\xE9s", kg: sorted.slice(4).reduce((s, r) => s + r.kg, 0), color: palette[4] });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Paper, { withBorder: true, p: "md", className: "analytics-ring-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 700, children: "R\xE9partition du tonnage observ\xE9" }),
    total <= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { c: "dimmed", py: "xl", children: "Aucune r\xE9partition positive disponible." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "analytics-ring-layout", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 160 160", role: "img", "aria-label": `R\xE9partition des vari\xE9t\xE9s, ${number(total / 1e3)} tonnes observ\xE9es`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "80", cy: "80", r: "58", fill: "none", stroke: "var(--mantine-color-default-hover)", strokeWidth: "20" }),
        segments.map((s, i) => {
          const part = s.kg / total * 100, start = offset;
          offset += part;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "80", cy: "80", r: "58", pathLength: "100", fill: "none", stroke: s.color, strokeWidth: "20", strokeDasharray: `${part} ${100 - part}`, strokeDashoffset: -start, transform: "rotate(-90 80 80)", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${s.label} : ${number(part)} %` }) }, i);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "80", y: "78", textAnchor: "middle", className: "analytics-ring-total", children: number(total / 1e3) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: "80", y: "98", textAnchor: "middle", className: "analytics-axis", children: "tonnes" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: segments.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "analytics-ring-label", disabled: s.label === "Autres vari\xE9t\xE9s", onClick: () => onChoose(s.row), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: s.color } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
          s.label,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: s.label === "Autres vari\xE9t\xE9s" ? `${sorted.length - 4} vari\xE9t\xE9s` : s.row.station })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
          number(s.kg / total * 100),
          " %"
        ] })
      ] }, i)) })
    ] })
  ] });
}

// frontend/src/ExportDashboard.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var num = (n, d = 0) => n == null ? "Non disponible" : new Intl.NumberFormat("fr-MA", { maximumFractionDigits: d }).format(n);
var tonnes = (n) => n == null ? "Non disponible" : num(n / 1e3, 3) + " t";
var defaults = { period: "campaign", from: "", to: "", destination: "", variety: "", calibre: "", packaging: "", otherContext: "", previousContext: "", previousOtherContext: "", status: "" };
var query = (values) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== "") params.set(k, v);
  });
  return params.toString();
};
function visual(rows, palettes = false) {
  return rows.map((r) => ({ station: r.station, key: r.key.replace(/-S(\d\d)$/, "$1"), label: r.label, kg: r.netKg, quantity: r.packages, count: palettes ? r.pallets ?? 0 : r.shipments }));
}
function ExportDashboard({ context, contexts, onContextChange }) {
  const [filters, setFilters] = (0, import_react3.useState)(defaults), [expanded, setExpanded] = (0, import_react3.useState)(false), [page, setPage] = (0, import_react3.useState)(1), [search, setSearch] = (0, import_react3.useState)(""), [sort, setSort] = (0, import_react3.useState)("date"), [asc, setAsc] = (0, import_react3.useState)(false), [selected, setSelected] = (0, import_react3.useState)(null), [busy, setBusy] = (0, import_react3.useState)(false), [exportError, setExportError] = (0, import_react3.useState)("");
  const [debounced] = (0, import_hooks.useDebouncedValue)(search, 250);
  const [graphUnit, setGraphUnit] = (0, import_react3.useState)("net");
  const qs = query({ ...filters, page: String(page), search: debounced, sort, asc: String(asc) });
  const path = `/contexts/${context.id}/analytics/export`;
  const response = useApi(path + "?" + qs), data = response.data;
  function change(key, value2) {
    setPage(1);
    setFilters((old) => ({ ...old, [key]: value2 ?? "", ...key === "otherContext" || key === "previousContext" ? { previousOtherContext: "" } : {} }));
  }
  function reset() {
    setFilters(defaults);
    setSearch("");
    setPage(1);
  }
  const options = (name) => Array.from(new Map((data?.sources.filter((s) => !s.archive).flatMap((s) => s.options[name] ?? []) ?? []).map((o) => [o.value, o])).values());
  const other = contexts.filter((c) => c.id !== context.id && c.station !== context.station);
  const archives = contexts.filter((c) => c.id !== context.id && c.station === context.station && !!c.readOnly);
  const selectedOther = contexts.find((c) => String(c.id) === filters.otherContext);
  const secondaryArchives = contexts.filter((c) => c.id !== selectedOther?.id && c.station === selectedOther?.station && !!c.readOnly);
  const contextOptions = (list) => list.map((c) => ({ value: String(c.id), label: c.station + " \xB7 " + c.label }));
  const selectedPeriod = data?.sources[0]?.period;
  function drillDate(date) {
    setFilters((old) => ({ ...old, period: "custom", from: date, to: date }));
    setPage(1);
  }
  async function download() {
    setBusy(true);
    setExportError("");
    try {
      const res = await fetch("/api" + path + "/export?" + qs, { credentials: "same-origin" });
      if (!res.ok) {
        const e = await res.json().catch(() => null);
        throw Error(e?.title ?? "Export Excel indisponible");
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "VITASOUSS-Export-dossiers.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export indisponible");
    } finally {
      setBusy(false);
    }
  }
  const hasPalletSeries = !!data?.weekly.length && data.weekly.every((r) => r.pallets != null);
  const temporalRows = (rows, palettes = false) => visual(rows, palettes).map((r, i) => ({ ...r, quantity: graphUnit === "pallets" ? rows[i].pallets : rows[i].packages }));
  const graphLabel = graphUnit === "net" ? "t commercial officiel" : graphUnit === "pallets" ? "palettes exp\xE9di\xE9es" : "colis enregistr\xE9s";
  const hasNet = data?.daily.some((r) => r.netKg != null);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { className: "analytics-dashboard export-dashboard", gap: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { className: "analytics-eyebrow", children: "PILOTAGE DES STATIONS \xB7 LECTURE SEULE" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Title, { order: 2, children: "Pilotage Export" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { c: "dimmed", children: [
          context.station,
          " \xB7 ",
          context.label
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Badge, { color: "forest", variant: "light", children: "VITASOUSS 1.6.0 \xB7 candidat" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", className: "analytics-filter-panel", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
            filters.otherContext ? "ZAOUIA + DIAF" : context.station,
            " \xB7 ",
            context.label
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", c: "dimmed", children: [
            selectedPeriod ? `${selectedPeriod.from.slice(0, 10)} \u2192 ${selectedPeriod.to.slice(0, 10)}` : "Campagne / p\xE9riode s\xE9lectionn\xE9e",
            " \xB7 dossiers et bons de quai enregistr\xE9s"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Button, { variant: "light", onClick: () => setExpanded((v) => !v), "aria-expanded": expanded, "aria-controls": "export-filters", children: [
            "Filtres",
            Object.entries(filters).filter(([k, v]) => v !== defaults[k]).length ? " \xB7 actifs" : ""
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { variant: "subtle", onClick: reset, children: "R\xE9initialiser" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Collapse, { in: expanded, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { id: "export-filters", cols: { base: 1, sm: 2, lg: 4 }, mt: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Station / exercice", searchable: true, value: String(context.id), data: contextOptions(contexts), onChange: (v) => {
          const c = contexts.find((x) => String(x.id) === v);
          if (c) onContextChange(c.id);
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Consolider avec", clearable: true, searchable: true, value: filters.otherContext || null, data: contextOptions(other), onChange: (v) => change("otherContext", v) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Campagne pr\xE9c\xE9dente", clearable: true, searchable: true, value: filters.previousContext || null, data: contextOptions(archives), onChange: (v) => change("previousContext", v) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Archive de l'autre station", clearable: true, searchable: true, disabled: !filters.otherContext || !filters.previousContext, value: filters.previousOtherContext || null, data: contextOptions(secondaryArchives), onChange: (v) => change("previousOtherContext", v) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "P\xE9riode", value: filters.period, data: [{ value: "campaign", label: "Campagne compl\xE8te" }, { value: "today", label: "Aujourd'hui" }, { value: "yesterday", label: "Hier" }, { value: "seven", label: "7 derniers jours" }, { value: "week", label: "Semaine en cours" }, { value: "month", label: "Mois en cours" }, { value: "custom", label: "Personnalis\xE9e" }], onChange: (v) => change("period", v) }),
        filters.period === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.TextInput, { label: "Du", type: "date", value: filters.from, onChange: (e) => change("from", e.currentTarget.value) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.TextInput, { label: "Au", type: "date", value: filters.to, onChange: (e) => change("to", e.currentTarget.value) })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Client", clearable: true, searchable: true, value: filters.destination || null, data: options("destinations"), onChange: (v) => change("destination", v) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Vari\xE9t\xE9", clearable: true, searchable: true, value: filters.variety || null, data: options("varieties"), onChange: (v) => change("variety", v) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Emballage / type palette", clearable: true, searchable: true, value: filters.packaging || null, data: options("packaging"), onChange: (v) => change("packaging", v) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Calibre", clearable: true, searchable: true, value: filters.calibre || null, data: options("calibres"), onChange: (v) => change("calibre", v) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Statut des dossiers consult\xE9s", clearable: true, value: filters.status || null, data: [{ value: "0", label: "En cours" }, { value: "1", label: "Charg\xE9" }, { value: "2", label: "Exp\xE9di\xE9 et cl\xF4tur\xE9" }, { value: "-1", label: "Statut inconnu" }], placeholder: "Tous les statuts", onChange: (v) => change("status", v) })
      ] }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "forest", title: "Export officiel \xB7 dossiers exp\xE9di\xE9s et cl\xF4tur\xE9s", children: data?.definition ?? "codmaj = 2 uniquement \xB7 poids commercial bdq.pdscom \xB7 client destination.vildes." }),
    response.error ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Alert, { color: "red", title: "Tableau de bord Export indisponible", children: [
      response.error,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { ml: "sm", variant: "subtle", onClick: response.refresh, children: "R\xE9essayer" })
    ] }) : null,
    data && !data.complete ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "orange", title: "Donn\xE9es incompl\xE8tes", children: "Au moins une source est indisponible. Aucun total consolid\xE9 garanti; Excel d\xE9sactiv\xE9." }) : null,
    response.loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Loader, { size: "sm" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: "Lecture des dossiers autoris\xE9s\u2026" })
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.SimpleGrid, { cols: { base: 1, xs: 2, lg: 4 }, children: [["Tonnage officiellement export\xE9", tonnes(data?.complete ? data.official?.commercialKg : null), "bdq.pdscom \xB7 kg / 1 000 \xB7 codmaj = 2"], ["Palettes exp\xE9di\xE9es", num(data?.complete ? data.official?.pallets : null), "Bons de quai des dossiers codmaj = 2"], ["Colis exp\xE9di\xE9s", num(data?.complete ? data.official?.packages : null), "Dossiers exp\xE9di\xE9s et cl\xF4tur\xE9s uniquement"], ["Dossiers exp\xE9di\xE9s et cl\xF4tur\xE9s", num(data?.complete ? data.official?.shipments : null), "Identit\xE9 distincte par station et exercice"]].map(([label, value2, note]) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", className: "analytics-kpi-primary", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", size: "sm", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { className: "export-kpi-value", children: value2 }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", size: "xs", children: note })
    ] }, label)) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", c: "dimmed", children: "Compteurs En cours/Charg\xE9/Inconnu : tous les statuts, avec les autres filtres. Graphiques et KPI export\xE9s : codmaj = 2 uniquement." }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Paper, { withBorder: true, p: "sm", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", className: "export-secondary", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
        "Dossiers en cours : ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: num(data?.complete ? data.statusCounts.inProgress : null) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
        "Dossiers charg\xE9s : ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: num(data?.complete ? data.statusCounts.loaded : null) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
        "Statuts inconnus : ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: num(data?.complete ? data.statusCounts.unknown : null) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
        "Clients export : ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: num(data?.complete ? data.official?.destinations : null) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
        "Brut officiel : ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: "Non disponible" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", children: [
        "Poids pes\xE9 enregistr\xE9 : ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: tonnes(data?.complete ? data.official?.weighedKg : null) })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Group, { justify: "flex-end", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { label: "Mesure des graphiques temporels", value: graphUnit, onChange: (v) => setGraphUnit(v ?? "net"), data: [{ value: "net", label: "Tonnes officiellement export\xE9es" }, { value: "pallets", label: "Palettes exp\xE9di\xE9es" }, { value: "packages", label: "Colis enregistr\xE9s" }], w: 290 }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Tabs, { defaultValue: "daily", keepMounted: false, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Tabs.List, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "daily", children: "Quotidien" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "weekly", children: "Semaines ISO" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "distribution", children: "R\xE9partitions" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Tab, { value: "comparison", children: "Stations & campagnes" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Panel, { value: "daily", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
        graphUnit === "net" && data?.daily.length && !hasNet ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: "Poids officiel non disponible sur ce p\xE9rim\xE8tre" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: "Le poids commercial officiel est manquant ou non ventil\xE9 par calibre. Choisissez les palettes ou les colis pour visualiser les quantit\xE9s disponibles." })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TemporalChart, { title: "Exportations cl\xF4tur\xE9es par date de dossier", rows: temporalRows(data?.daily ?? []), crates: graphUnit !== "net", variant: graphUnit === "net" ? "line" : "bars", countLabel: "dossiers", unitLabel: graphLabel, onChoose: (r) => drillDate(r.key) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(VarietyRing, { rows: visual(data?.varieties ?? []), onChoose: (r) => change("variety", r.key) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Tabs.Panel, { value: "weekly", pt: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", size: "sm", mb: "xs", children: "Semaines ISO lundi\u2013dimanche, dates de dossier; aucune semaine absente interpol\xE9e. Les palettes sont d\xE9clar\xE9es sur les bons de quai." }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TemporalChart, { title: "Exportations cl\xF4tur\xE9es par semaine ISO", rows: temporalRows(data?.weekly ?? [], graphUnit === "net" && hasPalletSeries), crates: graphUnit !== "net", variant: graphUnit === "net" && hasPalletSeries ? "combo" : "bars", countLabel: graphUnit === "net" && hasPalletSeries ? "palettes exp\xE9di\xE9es" : "dossiers", unitLabel: graphLabel })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Tabs.Panel, { value: "distribution", pt: "md", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.SimpleGrid, { cols: { base: 1, lg: 2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExportRanking, { title: "Vari\xE9t\xE9s \xB7 tonnes officiellement export\xE9es", rows: data?.varieties ?? [], unit: "t", onChoose: (r) => change("variety", r.key) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExportRanking, { title: "Clients \xB7 tonnes officiellement export\xE9es", rows: data?.destinations ?? [], unit: "t", onChoose: (r) => change("destination", r.key) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExportRanking, { title: "Emballages \xB7 tonnes officiellement export\xE9es", rows: data?.packaging ?? [], unit: "t", onChoose: (r) => change("packaging", r.key) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExportRanking, { title: "Calibres \xB7 colis du d\xE9tail palette", rows: data?.calibres ?? [], unit: "colis", onChoose: (r) => r.key !== "?" && change("calibre", r.key) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExportRanking, { title: "Pays \xB7 tonnes officiellement export\xE9es", rows: data?.countries ?? [], unit: "t" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Tabs.Panel, { value: "comparison", pt: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.SimpleGrid, { cols: { base: 1, sm: 2 }, children: data?.sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Badge, { variant: "light", children: [
            s.archive ? "Archive \xE0 dur\xE9e \xE9quivalente" : "Campagne courante",
            " \xB7 ",
            s.station
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, mt: "sm", children: s.campaign?.label ?? "Campagne indisponible" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xl", children: s.available ? tonnes(s.metrics.commercialKg) : "Source indisponible" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: s.available ? `${num(s.metrics.pallets)} palettes exp\xE9di\xE9es \xB7 ${num(s.metrics.shipments)} dossiers` : s.warnings.join(" ") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", c: "dimmed", children: s.period ? `${s.period.from.slice(0, 10)} \u2192 ${s.period.to.slice(0, 10)}` : "" })
        ] }, s.contextId)) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", c: "dimmed", mt: "sm", children: "Archives align\xE9es par jours \xE9coul\xE9s depuis le d\xE9but de campagne. Les dates et semaines ISO restent celles de chaque campagne; seuls les m\xEAmes champs enregistr\xE9s sont compar\xE9s." }),
        data?.sources.filter((s) => s.archive && s.available).map((previous) => {
          const current = data.sources.find((s) => !s.archive && s.station === previous.station && s.available);
          const a = current?.metrics.commercialKg, b = previous.metrics.commercialKg;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", mt: "sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
              previous.station,
              " \xB7 \xE9volution du poids commercial export\xE9 : ",
              a != null && b != null && b > 0 ? num((a - b) / b * 100, 1) + " %" : "Non comparable"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TemporalChart, { title: "Archives \xB7 observations quotidiennes aux dates r\xE9elles", rows: visual(previous.daily), countLabel: "dossiers", unitLabel: "t commercial officiel" })
          ] }, previous.contextId);
        })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { justify: "space-between", mb: "md", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, children: "D\xE9tail des dossiers et bons de quai" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "sm", c: "dimmed", children: [
            num(data?.count),
            " lignes \xB7 pagination serveur \xB7 statuts filtr\xE9s \xB7 KPI et graphiques : codmaj = 2 exclusivement"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Group, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.TextInput, { "aria-label": "Rechercher les dossiers Export", placeholder: "Dossier, client, vari\xE9t\xE9\u2026", value: search, onChange: (e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          } }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Select, { "aria-label": "Trier les dossiers Export", value: sort, data: [{ value: "date", label: "Date" }, { value: "shipment", label: "Dossier" }, { value: "net", label: "Commercial kg" }, { value: "pallets", label: "Palettes" }, { value: "packages", label: "Colis" }, { value: "destination", label: "Client" }, { value: "variety", label: "Vari\xE9t\xE9" }], onChange: (v) => {
            setSort(v ?? "date");
            setPage(1);
          } }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { variant: "light", onClick: () => setAsc((v) => !v), children: asc ? "Croissant" : "D\xE9croissant" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Button, { onClick: download, loading: busy, disabled: !data?.complete || !data?.count, children: "Exporter Excel" })
        ] })
      ] }),
      exportError ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "red", children: exportError }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExportTable, { rows: data?.rows ?? [], onOpen: setSelected }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Pagination, { mt: "md", value: page, total: Math.max(1, Math.ceil((data?.count ?? 0) / 25)), onChange: setPage })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("details", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("summary", { children: "Sources, d\xE9finitions et limites" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { gap: "xs", mt: "sm", children: [
        data?.warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: w }, w)),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: "Les palettes sans bon de quai ne sont pas ajout\xE9es aux dossiers. Aucun montant, r\xE8glement ou r\xE9clamation n'est trait\xE9 ici." })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Drawer, { opened: !!selected, onClose: () => setSelected(null), title: selected ? `Dossier ${selected.shipment} \xB7 ${selected.station}` : "Dossier", position: "right", size: "xl", children: selected ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ShipmentDetail, { row: selected, filters }, `${selected.contextId}:${selected.shipment}`) : null })
  ] });
}
function ExportTable({ rows, onOpen }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.ScrollContainer, { minWidth: 1300, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table, { striped: true, highlightOnHover: true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Thead, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tr, { children: ["Date Logista", "Dossier / quai", "Station", "Client", "Pays / exportateur", "Produit / vari\xE9t\xE9", "Emballage / calibre", "Palettes", "Colis", "Commercial kg", "Net secondaire kg"].map((h) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Th, { children: h }, h)) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tbody, { children: [
      rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Tr, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: r.date ?? "Non disponible" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
          onOpen ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Button, { size: "compact-sm", variant: "subtle", onClick: () => onOpen(r), children: [
            r.shipment,
            " / ",
            r.dock
          ] }) : `${r.shipment} / ${r.dock}`,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { size: "xs", c: "dimmed", children: [
            r.statusLabel,
            " \xB7 ",
            r.status ?? "?"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: r.station }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { children: r.destination }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
          r.country,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", size: "xs", children: r.exporter })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
          r.product,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "sm", children: r.variety })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Table.Td, { children: [
          r.packaging,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { size: "xs", c: "dimmed", children: r.calibre == null ? "Tous calibres" : "Calibre " + r.calibre })
        ] }),
        [r.pallets, r.packages, r.commercialKg, r.netKg].map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { ta: "right", children: num(n, 2) }, i))
      ] }, `${r.contextId}:${r.shipment}:${r.dock}`)),
      !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Tr, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Table.Td, { colSpan: 11, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", py: "xl", children: "Aucune ligne disponible pour ce p\xE9rim\xE8tre." }) }) }) : null
    ] })
  ] }) });
}
function ShipmentDetail({ row, filters }) {
  const [page, setPage] = (0, import_react3.useState)(1);
  const q = query({ ...filters, otherContext: "", previousContext: "", previousOtherContext: "", shipment: String(row.shipment), page: String(page) });
  const response = useApi(`/contexts/${row.contextId}/analytics/export?${q}`);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Stack, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { fw: 700, children: [
      row.statusLabel,
      " \xB7 Client : ",
      row.destination
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
      "Transporteur : ",
      row.carrier ?? "Non disponible",
      " \xB7 Transitaire : ",
      row.forwarder ?? "Non disponible"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Text, { children: [
      "Conteneur/remorque : ",
      row.trailer || "Non disponible",
      " \xB7 Navire/r\xE9f\xE9rence : ",
      row.transportReference || "Non disponible"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: "Date dtedep enregistr\xE9e dans Logista, sans preuve de d\xE9part physique. Consultation du dossier enregistr\xE9, sans modification. Les lignes respectent les filtres actifs et les droits du contexte." }),
    response.error ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Alert, { color: "red", children: response.error }) : null,
    response.loading ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Loader, {}) : null,
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExportTable, { rows: response.data?.rows ?? [] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Pagination, { value: page, total: Math.max(1, Math.ceil((response.data?.count ?? 0) / 25)), onChange: setPage })
  ] });
}
function ExportRanking({ title, rows, unit, onChoose }) {
  const val = (r) => unit === "t" ? r.netKg == null ? null : r.netKg / 1e3 : r.packages;
  const ordered = [...rows].sort((a, b) => (val(b) ?? -1) - (val(a) ?? -1));
  const max = Math.max(1, ...ordered.flatMap((r) => val(r) == null ? [] : [val(r)]));
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_core2.Paper, { withBorder: true, p: "md", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { fw: 700, mb: "md", children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "export-ranking", children: !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_core2.Text, { c: "dimmed", children: "Aucune observation disponible." }) : ordered.map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { className: "export-rank-row", onClick: () => onChoose?.(r), disabled: !onChoose, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
        r.label,
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: r.station })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "export-rank-track", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { style: { width: `${Math.max(0, (val(r) ?? 0) / max * 100)}%` } }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("strong", { children: [
        num(val(r), unit === "t" ? 3 : 0),
        " ",
        unit
      ] })
    ] }, `${r.station}:${r.key}`)) })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExportDashboard
});
/*! Bundled license information:

@tabler/icons-react/dist/esm/defaultAttributes.mjs:
@tabler/icons-react/dist/esm/createReactComponent.mjs:
@tabler/icons-react/dist/esm/icons/IconDatabaseOff.mjs:
  (**
   * @license @tabler/icons-react v3.35.0 - MIT
   *
   * This source code is licensed under the MIT license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

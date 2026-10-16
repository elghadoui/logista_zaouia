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

// frontend/src/AnalyticsVisuals.tsx
var AnalyticsVisuals_exports = {};
__export(AnalyticsVisuals_exports, {
  CaisserieFlowChart: () => CaisserieFlowChart,
  Sparkline: () => Sparkline,
  TemporalChart: () => TemporalChart,
  VarietyRing: () => VarietyRing
});
module.exports = __toCommonJS(AnalyticsVisuals_exports);
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
function Sparkline({ points, label }) {
  const id = (0, import_react2.useId)().replace(/:/g, "");
  if (points.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "analytics-spark-empty", children: "Courbe indisponible" });
  const min = Math.min(0, ...points), span = Math.max(1, Math.max(...points) - min);
  const path = points.map((n, i) => `${i * 156 / (points.length - 1)},${34 - (n - min) / span * 30}`).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { className: "analytics-spark", viewBox: "0 0 156 40", role: "img", "aria-label": label, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id, x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { stopColor: "#68a76c", stopOpacity: ".22" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "1", stopColor: "#68a76c", stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", { points: `0,40 ${path} 156,40`, fill: `url(#${id})` }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", { points: path, fill: "none", stroke: "#43875b", strokeWidth: "1.8" })
  ] });
}
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
function CaisserieFlowChart({ title, rows, unitLabel, unavailableMessage, onChoose }) {
  const plotRef = (0, import_react2.useRef)(null);
  const [containerWidth, setContainerWidth] = (0, import_react2.useState)(0);
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Paper, { withBorder: true, p: "md", className: "analytics-chart-card analytics-flow-chart", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { justify: "space-between", mb: "xs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 700, children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { gap: "md", className: "analytics-chart-legend", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: "#2f8054" } }),
          "Entr\xE9es \xB7 ",
          unitLabel
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "analytics-legend", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: "#8b67ad" } }),
          "Sorties \xB7 ",
          unitLabel
        ] })
      ] })
    ] }),
    keys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "analytics-chart-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "analytics-empty-mark", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconDatabaseOff, { size: 22 }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 600, children: unavailableMessage ?? "Aucune quantit\xE9 fiable sur cette p\xE9riode" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "xs", c: "dimmed", children: "Les valeurs absentes ou invalides restent indisponibles. Aucun mouvement n\u2019est remplac\xE9 par un compte de lignes." })
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: plotRef, className: "analytics-plot-scroll", tabIndex: 0, "aria-label": "Graphique des entr\xE9es et sorties par p\xE9riode", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: `0 0 ${width} ${height}`, style: { width, minWidth: "100%" }, role: "group", "aria-label": title, children: [
        [0, 1, 2, 3, 4, 5].map((i) => {
          const v = tickMax * i, yy = y(v);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: side, x2: width - side, y1: yy, y2: yy, className: "analytics-gridline" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: side - 10, y: yy + 4, textAnchor: "end", className: "analytics-axis", children: formatAxis(v) })
          ] }, i);
        }),
        keys.map((key, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
          stations.map((station, j) => {
            const row = byIdentity.get(`${station}:${key}`);
            if (!row) return null;
            const base = pointX(i) - groupWidth / 2 + j * stationWidth;
            const values = [{ name: "Entr\xE9es", value: row.entries, x: base + stationWidth * 0.12, color: colorFor(station, "entry") }, { name: "Sorties", value: row.exits, x: base + stationWidth * 0.53, color: colorFor(station, "exit") }];
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: values.map((item, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { role: onChoose ? "button" : "img", tabIndex: 0, className: "analytics-column", "aria-label": `${row.label} \xB7 ${station} \xB7 ${item.name} ${formatAxis(item.value)} ${unitLabel}`, onClick: () => onChoose?.(row), onKeyDown: (e) => {
              if (onChoose && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChoose(row);
              }
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: `${row.label} \xB7 ${station} \xB7 ${item.name} ${formatAxis(item.value)} ${unitLabel} \xB7 variation sorties \u2212 entr\xE9es : ${formatAxis((row.exits ?? 0) - (row.entries ?? 0))} ${unitLabel}` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: item.x, y: y(item.value), width: barWidth, height: Math.max(1, bottom - y(item.value)), rx: "3", fill: item.color })
            ] }, k)) }, station);
          }),
          (i % Math.max(1, Math.ceil(keys.length / 14)) === 0 || i === keys.length - 1) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { x: pointX(i), y: height - 20, textAnchor: "middle", className: "analytics-axis", children: rows.find((r) => r.key === key)?.label ?? key })
        ] }, key))
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "xs", c: "dimmed", className: "analytics-chart-caption", children: "Infobulle : entr\xE9es, sorties et variation (sorties \u2212 entr\xE9es). Les types de caisse restent s\xE9par\xE9s." })
    ] })
  ] });
}
function formatAxis(n) {
  return new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(n);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CaisserieFlowChart,
  Sparkline,
  TemporalChart,
  VarietyRing
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

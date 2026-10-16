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

// frontend/src/contextChoices.ts
var contextChoices_exports = {};
__export(contextChoices_exports, {
  coherentContextFilters: () => coherentContextFilters,
  initialContextLoading: () => initialContextLoading,
  selectedVisibleTarget: () => selectedVisibleTarget,
  useContextList: () => useContextList,
  useContextTargets: () => useContextTargets,
  visibleTargets: () => visibleTargets
});
module.exports = __toCommonJS(contextChoices_exports);
var import_react = require("react");

// frontend/src/api.ts
var api = async () => ({});

// frontend/src/contextChoices.ts
function visibleTargets(targets, contexts) {
  const visible = new Set((contexts ?? []).map((c) => c.id));
  return (targets ?? []).filter((t) => visible.has(t.id));
}
function selectedVisibleTarget(targets, selected) {
  return targets.find((t) => String(t.id) === selected)?.id ?? targets[0]?.id;
}
function coherentContextFilters(filters) {
  return filters.otherContext && filters.previousContext ? filters : { ...filters, previousOtherContext: "" };
}
var initialContextLoading = (data) => data === null;
function useContextList() {
  const [data, setData] = (0, import_react.useState)(null);
  const saved = (0, import_react.useRef)(null);
  const [error, setError] = (0, import_react.useState)(""), [warning, setWarning] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(true), [version, setVersion] = (0, import_react.useState)(0);
  const refresh = (0, import_react.useCallback)(() => setVersion((v) => v + 1), []);
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    setLoading(initialContextLoading(saved.current));
    setError("");
    setWarning("");
    void api("/contexts", "GET", void 0, controller.signal).then((next) => {
      if (controller.signal.aborted) return;
      if (JSON.stringify(saved.current) !== JSON.stringify(next)) {
        saved.current = next;
        setData(next);
      }
    }).catch((e) => {
      if (!controller.signal.aborted) {
        const message = e instanceof Error ? e.message : "Actualisation des contextes indisponible.";
        if (saved.current === null) setError(message);
        else setWarning(message);
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [version]);
  (0, import_react.useEffect)(() => {
    const focus = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [refresh]);
  return { data, error, warning, loading, refresh };
}
function useContextTargets(routes) {
  const contexts = useContextList();
  return {
    data: visibleTargets(routes.data, contexts.data),
    loading: routes.loading || contexts.loading,
    error: routes.error || contexts.error,
    refresh: () => {
      routes.refresh();
      contexts.refresh();
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  coherentContextFilters,
  initialContextLoading,
  selectedVisibleTarget,
  useContextList,
  useContextTargets,
  visibleTargets
});

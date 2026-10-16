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

// frontend/src/drencherDocumentClient.ts
var drencherDocumentClient_exports = {};
__export(drencherDocumentClient_exports, {
  fetchDrencherPdf: () => fetchDrencherPdf
});
module.exports = __toCommonJS(drencherDocumentClient_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fetchDrencherPdf
});

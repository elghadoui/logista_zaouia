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

// frontend/src/Sidebar.tsx
var Sidebar_exports = {};
__export(Sidebar_exports, {
  Sidebar: () => Sidebar
});
module.exports = __toCommonJS(Sidebar_exports);
var import_core = require("@mantine/core");
var import_react2 = require("react");

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

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconArrowLeft.mjs
var __iconNode = [["path", { "d": "M5 12l14 0", "key": "svg-0" }], ["path", { "d": "M5 12l6 6", "key": "svg-1" }], ["path", { "d": "M5 12l6 -6", "key": "svg-2" }]];
var IconArrowLeft = createReactComponent("outline", "arrow-left", "ArrowLeft", __iconNode);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs
var __iconNode2 = [["path", { "d": "M9 6l6 6l-6 6", "key": "svg-0" }]];
var IconChevronRight = createReactComponent("outline", "chevron-right", "ChevronRight", __iconNode2);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconDashboard.mjs
var __iconNode3 = [["path", { "d": "M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", "key": "svg-0" }], ["path", { "d": "M13.45 11.55l2.05 -2.05", "key": "svg-1" }], ["path", { "d": "M6.4 20a9 9 0 1 1 11.2 0z", "key": "svg-2" }]];
var IconDashboard = createReactComponent("outline", "dashboard", "Dashboard", __iconNode3);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconHistory.mjs
var __iconNode4 = [["path", { "d": "M12 8l0 4l2 2", "key": "svg-0" }], ["path", { "d": "M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5", "key": "svg-1" }]];
var IconHistory = createReactComponent("outline", "history", "History", __iconNode4);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconLeaf.mjs
var __iconNode5 = [["path", { "d": "M5 21c.5 -4.5 2.5 -8 7 -10", "key": "svg-0" }], ["path", { "d": "M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z", "key": "svg-1" }]];
var IconLeaf = createReactComponent("outline", "leaf", "Leaf", __iconNode5);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconLock.mjs
var __iconNode6 = [["path", { "d": "M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z", "key": "svg-0" }], ["path", { "d": "M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0", "key": "svg-1" }], ["path", { "d": "M8 11v-4a4 4 0 1 1 8 0v4", "key": "svg-2" }]];
var IconLock = createReactComponent("outline", "lock", "Lock", __iconNode6);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconLogout.mjs
var __iconNode7 = [["path", { "d": "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2", "key": "svg-0" }], ["path", { "d": "M9 12h12l-3 -3", "key": "svg-1" }], ["path", { "d": "M18 15l3 -3", "key": "svg-2" }]];
var IconLogout = createReactComponent("outline", "logout", "Logout", __iconNode7);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconMap2.mjs
var __iconNode8 = [["path", { "d": "M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5", "key": "svg-0" }], ["path", { "d": "M9 4v13", "key": "svg-1" }], ["path", { "d": "M15 7v5.5", "key": "svg-2" }], ["path", { "d": "M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879z", "key": "svg-3" }], ["path", { "d": "M19 18v.01", "key": "svg-4" }]];
var IconMap2 = createReactComponent("outline", "map-2", "Map2", __iconNode8);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconPlant2.mjs
var __iconNode9 = [["path", { "d": "M2 9a10 10 0 1 0 20 0", "key": "svg-0" }], ["path", { "d": "M12 19a10 10 0 0 1 10 -10", "key": "svg-1" }], ["path", { "d": "M2 9a10 10 0 0 1 10 10", "key": "svg-2" }], ["path", { "d": "M12 4a9.7 9.7 0 0 1 2.99 7.5", "key": "svg-3" }], ["path", { "d": "M9.01 11.5a9.7 9.7 0 0 1 2.99 -7.5", "key": "svg-4" }]];
var IconPlant2 = createReactComponent("outline", "plant-2", "Plant2", __iconNode9);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconSettings.mjs
var __iconNode10 = [["path", { "d": "M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z", "key": "svg-0" }], ["path", { "d": "M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0", "key": "svg-1" }]];
var IconSettings = createReactComponent("outline", "settings", "Settings", __iconNode10);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconShieldLock.mjs
var __iconNode11 = [["path", { "d": "M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3", "key": "svg-0" }], ["path", { "d": "M12 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", "key": "svg-1" }], ["path", { "d": "M12 12l0 2.5", "key": "svg-2" }]];
var IconShieldLock = createReactComponent("outline", "shield-lock", "ShieldLock", __iconNode11);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconSwitchHorizontal.mjs
var __iconNode12 = [["path", { "d": "M16 3l4 4l-4 4", "key": "svg-0" }], ["path", { "d": "M10 7l10 0", "key": "svg-1" }], ["path", { "d": "M8 13l-4 4l4 4", "key": "svg-2" }], ["path", { "d": "M4 17l9 0", "key": "svg-3" }]];
var IconSwitchHorizontal = createReactComponent("outline", "switch-horizontal", "SwitchHorizontal", __iconNode12);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconTrees.mjs
var __iconNode13 = [["path", { "d": "M16 5l3 3l-2 1l4 4l-3 1l4 4h-9", "key": "svg-0" }], ["path", { "d": "M15 21l0 -3", "key": "svg-1" }], ["path", { "d": "M8 13l-2 -2", "key": "svg-2" }], ["path", { "d": "M8 12l2 -2", "key": "svg-3" }], ["path", { "d": "M8 21v-13", "key": "svg-4" }], ["path", { "d": "M5.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4z", "key": "svg-5" }]];
var IconTrees = createReactComponent("outline", "trees", "Trees", __iconNode13);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconUsers.mjs
var __iconNode14 = [["path", { "d": "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "key": "svg-0" }], ["path", { "d": "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2", "key": "svg-1" }], ["path", { "d": "M16 3.13a4 4 0 0 1 0 7.75", "key": "svg-2" }], ["path", { "d": "M21 21v-2a4 4 0 0 0 -3 -3.85", "key": "svg-3" }]];
var IconUsers = createReactComponent("outline", "users", "Users", __iconNode14);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconSun.mjs
var __iconNode15 = [["path", { "d": "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "key": "svg-0" }], ["path", { "d": "M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7", "key": "svg-1" }]];
var IconSun = createReactComponent("outline", "sun", "Sun", __iconNode15);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconMoon.mjs
var __iconNode16 = [["path", { "d": "M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z", "key": "svg-0" }]];
var IconMoon = createReactComponent("outline", "moon", "Moon", __iconNode16);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconWorld.mjs
var __iconNode17 = [["path", { "d": "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "key": "svg-0" }], ["path", { "d": "M3.6 9h16.8", "key": "svg-1" }], ["path", { "d": "M3.6 15h16.8", "key": "svg-2" }], ["path", { "d": "M11.5 3a17 17 0 0 0 0 18", "key": "svg-3" }], ["path", { "d": "M12.5 3a17 17 0 0 1 0 18", "key": "svg-4" }]];
var IconWorld = createReactComponent("outline", "world", "World", __iconNode17);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconBox.mjs
var __iconNode18 = [["path", { "d": "M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5", "key": "svg-0" }], ["path", { "d": "M12 12l8 -4.5", "key": "svg-1" }], ["path", { "d": "M12 12l0 9", "key": "svg-2" }], ["path", { "d": "M12 12l-8 -4.5", "key": "svg-3" }]];
var IconBox = createReactComponent("outline", "box", "Box", __iconNode18);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconRosetteDiscountCheck.mjs
var __iconNode19 = [["path", { "d": "M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1", "key": "svg-0" }], ["path", { "d": "M9 12l2 2l4 -4", "key": "svg-1" }]];
var IconRosetteDiscountCheck = createReactComponent("outline", "rosette-discount-check", "RosetteDiscountCheck", __iconNode19);

// frontend/node_modules/@tabler/icons-react/dist/esm/icons/IconSparkles.mjs
var __iconNode20 = [["path", { "d": "M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z", "key": "svg-0" }]];
var IconSparkles = createReactComponent("outline", "sparkles", "Sparkles", __iconNode20);

// frontend/src/navigation.ts
var navigation = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: IconDashboard,
    direct: true,
    items: [{ key: "dashboard", label: "Vue g\xE9n\xE9rale", icon: IconDashboard }]
  },
  {
    id: "analytics",
    label: "Tableaux de bord",
    icon: IconDashboard,
    items: [
      { key: "analytics:receptions", label: "R\xE9ceptions", icon: IconDashboard, readOnly: true },
      { key: "analytics:caisserie", label: "Caisserie", icon: IconBox, readOnly: true },
      { key: "analytics:export", label: "Export", icon: IconWorld, readOnly: true }
    ]
  },
  {
    id: "agriculture",
    label: "R\xE9f\xE9rentiels agricoles",
    icon: IconTrees,
    items: [
      { key: "adherent", label: "Adh\xE9rents", icon: IconUsers },
      { key: "verger", label: "Vergers", icon: IconTrees },
      { key: "parcelle", label: "Parcelles", icon: IconMap2 },
      { key: "hierarchy", label: "Explorer la hi\xE9rarchie", icon: IconLeaf },
      { key: "culture", label: "Cultures", icon: IconLeaf },
      { key: "grpvar", label: "Groupes de vari\xE9t\xE9s", icon: IconLeaf },
      { key: "variete", label: "Vari\xE9t\xE9s", icon: IconLeaf },
      { key: "souvar", label: "Sous-vari\xE9t\xE9s", icon: IconLeaf }
    ]
  },
  {
    id: "commerce",
    label: "Commerce & Export",
    icon: IconWorld,
    items: [
      { key: "pilot:partenaire", label: "Partenaires", icon: IconUsers },
      { key: "pilot:destination", label: "Destinations", icon: IconMap2 },
      { key: "pilot:pays", label: "Pays", icon: IconWorld },
      { key: "pilot:marche", label: "March\xE9s", icon: IconWorld }
    ]
  },
  {
    id: "conditioning",
    label: "Conditionnement",
    icon: IconBox,
    items: [
      { key: "pilot:grpemb", label: "Groupes d\u2019emballages", icon: IconBox },
      { key: "pilot:groupart", label: "Groupes articles", icon: IconBox }
    ]
  },
  {
    id: "quality",
    label: "Qualit\xE9",
    icon: IconRosetteDiscountCheck,
    items: [
      { key: "pilot:defaut", label: "D\xE9fauts", icon: IconRosetteDiscountCheck },
      { key: "pilot:typeecart", label: "Types d\u2019\xE9carts", icon: IconRosetteDiscountCheck },
      { key: "pilot:declaration_verger", label: "D\xE9clarations verger", icon: IconTrees }
    ]
  },
  {
    id: "operations",
    label: "Op\xE9rations",
    icon: IconSwitchHorizontal,
    items: [
      { key: "board:receptions", label: "R\xE9ceptions", icon: IconDashboard, readOnly: true },
      { key: "board:caisserie", label: "Caisserie", icon: IconBox, readOnly: true },
      { key: "board:versements", label: "Versements", icon: IconDashboard, readOnly: true },
      { key: "board:export", label: "Export", icon: IconWorld, readOnly: true },
      { key: "board:ecarts", label: "\xC9carts", icon: IconDashboard, readOnly: true }
    ]
  },
  {
    id: "drencher",
    label: "Drencher",
    icon: IconPlant2,
    items: [{ key: "drencher", label: "Cycles, qualit\xE9 & stock", icon: IconPlant2 }]
  },
  {
    id: "assistant",
    label: "Assistant IA",
    icon: IconSparkles,
    direct: true,
    items: [{ key: "assistant", label: "Assistant IA", icon: IconSparkles, readOnly: true }]
  },
  {
    id: "administration",
    label: "Administration",
    icon: IconSettings,
    items: [
      { key: "admin:users", label: "Utilisateurs", icon: IconUsers, admin: true },
      { key: "admin:permissions", label: "Droits par module", icon: IconShieldLock, admin: true },
      { key: "admin:contexts", label: "Serveurs et contextes", icon: IconSettings, admin: true },
      { key: "sync", label: "Synchronisation", icon: IconSwitchHorizontal },
      {
        key: "compare",
        label: "Comparer ZAOUIA / DIAF",
        icon: IconSwitchHorizontal,
        readOnly: true
      },
      { key: "journal", label: "Journal", icon: IconHistory, readOnly: true }
    ]
  }
];
function visibleNavigation(role, allowed) {
  return navigation.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.admin ? role === "Admin" : allowed(i.key))
  })).filter((g) => g.items.length > 0);
}

// frontend/src/Sidebar.module.css
var Sidebar_default = {
  root: "Sidebar_root",
  brand: "Sidebar_brand",
  mark: "Sidebar_mark",
  scroll: "Sidebar_scroll",
  group: "Sidebar_group",
  children: "Sidebar_children",
  item: "Sidebar_item",
  compact: "Sidebar_compact",
  compactButton: "Sidebar_compactButton",
  footer: "Sidebar_footer",
  section: "Sidebar_section",
  popover: "Sidebar_popover"
};

// frontend/src/Sidebar.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var storageKey = "vitasouss.navigation.v141";
function initialClosed() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (Array.isArray(value) && value.every((v) => typeof v === "string"))
      return value.filter((v) => navigation.some((g) => g.id === v));
  } catch {
  }
  return navigation.filter((g) => !g.direct && g.id !== "agriculture").map((g) => g.id);
}
function GroupLinks({
  group,
  active,
  navigate
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    group.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.NavLink,
      {
        component: "button",
        label: item.label,
        leftSection: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { size: 16 }),
        active: active === item.key,
        "aria-current": active === item.key ? "page" : void 0,
        rightSection: item.readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Tooltip, { label: "Lecture seule", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconLock, { size: 12, "aria-label": "Lecture seule" }) }) : void 0,
        className: Sidebar_default.item,
        onClick: () => navigate(item.key)
      },
      item.key
    )),
    group.future ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Text, { size: "xs", c: "dimmed", p: "sm", children: [
      group.future,
      " \xB7 aucun module suppl\xE9mentaire activ\xE9"
    ] }) : null
  ] });
}
function CompactGroup({
  group,
  active,
  navigate
}) {
  const [opened, setOpened] = (0, import_react2.useState)(false);
  const selected = group.items.some((i) => i.key === active);
  const trigger = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    import_core.ActionIcon,
    {
      className: Sidebar_default.compactButton,
      variant: "subtle",
      color: selected ? "forest" : "gray",
      "data-active": selected || void 0,
      "aria-label": group.label,
      "aria-expanded": group.direct ? void 0 : opened,
      onClick: () => group.direct ? navigate(group.items[0].key) : setOpened((v) => !v),
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(group.icon, { size: 22 })
    }
  );
  if (group.direct)
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Tooltip, { label: group.label, position: "right", children: trigger });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_core.Popover,
    {
      opened,
      onChange: setOpened,
      position: "right-start",
      offset: 14,
      shadow: "md",
      trapFocus: true,
      returnFocus: true,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Popover.Target, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Tooltip, { label: group.label, position: "right", disabled: opened, children: trigger }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Popover.Dropdown, { className: Sidebar_default.popover, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 700, size: "sm", p: "xs", children: group.label }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            GroupLinks,
            {
              group,
              active,
              navigate: (key) => {
                setOpened(false);
                navigate(key);
              }
            }
          )
        ] })
      ]
    }
  );
}
function NavigationBody({
  props,
  groups,
  closed,
  toggle,
  mobile = false
}) {
  const compact = props.compact && !mobile;
  const scheme = (0, import_core.useComputedColorScheme)("light");
  const { setColorScheme } = (0, import_core.useMantineColorScheme)();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: Sidebar_default.root, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      import_core.Group,
      {
        className: Sidebar_default.brand,
        gap: "sm",
        wrap: "nowrap",
        justify: compact ? "center" : "space-between",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { gap: "sm", wrap: "nowrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: Sidebar_default.mark, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconLeaf, { size: 24 }) }),
            !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Box, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { fw: 850, size: "lg", children: "VITASOUSS" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "8px", c: "dimmed", tt: "uppercase", style: { letterSpacing: 1.2 }, children: "Cultiver la confiance" })
            ] }) : null
          ] }),
          !mobile && !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Tooltip, { label: "R\xE9duire la navigation", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_core.ActionIcon,
            {
              variant: "subtle",
              color: "gray",
              "aria-label": "R\xE9duire la navigation",
              onClick: props.onToggle,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconArrowLeft, { size: 16 })
            }
          ) }) : null
        ]
      }
    ),
    compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Group, { justify: "center", mb: "sm", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Tooltip, { label: "D\xE9velopper la navigation", position: "right", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.ActionIcon,
      {
        variant: "subtle",
        "aria-label": "D\xE9velopper la navigation",
        onClick: props.onToggle,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronRight, { size: 18 })
      }
    ) }) }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.ScrollArea, { className: Sidebar_default.scroll, type: "auto", offsetScrollbars: true, scrollbars: "y", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "nav",
      {
        "aria-label": mobile ? "Navigation mobile" : "Navigation principale",
        className: compact ? Sidebar_default.compact : void 0,
        children: [
          !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { className: Sidebar_default.section, children: "ESPACE DE TRAVAIL" }) : null,
          groups.map((group) => {
            if (compact)
              return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                CompactGroup,
                {
                  group,
                  active: props.active,
                  navigate: props.navigate
                },
                group.id
              );
            const selected = group.items.some((item) => item.key === props.active);
            const open = selected || !closed.includes(group.id);
            const id = `navigation-${mobile ? "mobile" : "desktop"}-${group.id}`;
            if (group.direct)
              return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.NavLink,
                {
                  component: "button",
                  label: group.label,
                  leftSection: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(group.icon, { size: 20 }),
                  active: selected,
                  "aria-current": selected ? "page" : void 0,
                  className: Sidebar_default.group,
                  onClick: () => props.navigate(group.items[0].key)
                },
                group.id
              );
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Box, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                import_core.NavLink,
                {
                  component: "button",
                  className: Sidebar_default.group,
                  label: group.label,
                  leftSection: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(group.icon, { size: 20 }),
                  active: selected,
                  "aria-expanded": open,
                  "aria-controls": id,
                  onClick: () => toggle(group.id),
                  rightSection: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    IconChevronRight,
                    {
                      size: 15,
                      style: {
                        transform: open ? "rotate(90deg)" : void 0,
                        transition: "transform 150ms"
                      }
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Collapse, { in: open, transitionDuration: 150, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { id, className: Sidebar_default.children, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupLinks, { group, active: props.active, navigate: props.navigate }) }) })
            ] }, group.id);
          })
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: Sidebar_default.footer, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { gap: "xs", justify: compact ? "center" : "space-between", wrap: "nowrap", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_core.Tooltip,
          {
            label: `${props.user.name} \xB7 ${props.user.role}`,
            disabled: !compact,
            position: "right",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Avatar, { radius: "xl", color: "forest", size: 32, children: props.user.name.slice(0, 2).toUpperCase() })
          }
        ),
        !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Box, { flex: 1, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Text, { size: "xs", fw: 650, lineClamp: 1, children: props.user.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Text, { size: "10px", c: "dimmed", lineClamp: 1, children: [
            props.context?.station,
            " \xB7 ",
            props.context?.label
          ] })
        ] }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_core.Group, { mt: "sm", justify: "center", gap: "xs", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Tooltip, { label: scheme === "dark" ? "Passer au th\xE8me clair" : "Passer au th\xE8me sombre", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_core.ActionIcon,
          {
            variant: "subtle",
            color: "gray",
            "aria-label": scheme === "dark" ? "Passer au th\xE8me clair" : "Passer au th\xE8me sombre",
            onClick: () => setColorScheme(scheme === "dark" ? "light" : "dark"),
            children: scheme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconSun, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconMoon, { size: 18 })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Tooltip, { label: "Se d\xE9connecter", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_core.ActionIcon,
          {
            variant: "subtle",
            color: "gray",
            "aria-label": "Se d\xE9connecter",
            onClick: props.onLogout,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconLogout, { size: 18 })
          }
        ) }),
        !compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_core.Badge, { variant: "light", color: "forest", size: "xs", children: "V1.5.1" }) : null
      ] })
    ] })
  ] });
}
function Sidebar(props) {
  const [closed, setClosed] = (0, import_react2.useState)(initialClosed);
  const groups = visibleNavigation(props.user.role, props.allowed);
  function toggle(id) {
    setClosed((previous) => {
      const next = previous.includes(id) ? previous.filter((v) => v !== id) : [...previous, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationBody, { props, groups, closed, toggle }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_core.Drawer,
      {
        opened: props.mobileOpened,
        onClose: props.onMobileClose,
        title: "Navigation",
        size: 290,
        padding: "sm",
        styles: { body: { height: "calc(100dvh - 64px)", padding: 0 } },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          NavigationBody,
          {
            props: {
              ...props,
              navigate: (key) => {
                props.navigate(key);
                props.onMobileClose();
              }
            },
            groups,
            closed,
            toggle,
            mobile: true
          }
        )
      }
    )
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Sidebar
});
/*! Bundled license information:

@tabler/icons-react/dist/esm/defaultAttributes.mjs:
@tabler/icons-react/dist/esm/createReactComponent.mjs:
@tabler/icons-react/dist/esm/icons/IconArrowLeft.mjs:
@tabler/icons-react/dist/esm/icons/IconChevronRight.mjs:
@tabler/icons-react/dist/esm/icons/IconDashboard.mjs:
@tabler/icons-react/dist/esm/icons/IconHistory.mjs:
@tabler/icons-react/dist/esm/icons/IconLeaf.mjs:
@tabler/icons-react/dist/esm/icons/IconLock.mjs:
@tabler/icons-react/dist/esm/icons/IconLogout.mjs:
@tabler/icons-react/dist/esm/icons/IconMap2.mjs:
@tabler/icons-react/dist/esm/icons/IconPlant2.mjs:
@tabler/icons-react/dist/esm/icons/IconSettings.mjs:
@tabler/icons-react/dist/esm/icons/IconShieldLock.mjs:
@tabler/icons-react/dist/esm/icons/IconSwitchHorizontal.mjs:
@tabler/icons-react/dist/esm/icons/IconTrees.mjs:
@tabler/icons-react/dist/esm/icons/IconUsers.mjs:
@tabler/icons-react/dist/esm/icons/IconSun.mjs:
@tabler/icons-react/dist/esm/icons/IconMoon.mjs:
@tabler/icons-react/dist/esm/icons/IconWorld.mjs:
@tabler/icons-react/dist/esm/icons/IconBox.mjs:
@tabler/icons-react/dist/esm/icons/IconRosetteDiscountCheck.mjs:
@tabler/icons-react/dist/esm/icons/IconSparkles.mjs:
  (**
   * @license @tabler/icons-react v3.35.0 - MIT
   *
   * This source code is licensed under the MIT license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

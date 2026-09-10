const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.join(__dirname, "..");
const moduleCache = new Map();

function resolveTsPath(specifier) {
  if (!specifier.startsWith("@/")) return null;

  const base = path.join(root, specifier.slice(2));
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`Cannot resolve ${specifier}`);
}

function loadTsModule(filename) {
  const fullPath = path.resolve(filename);
  if (moduleCache.has(fullPath)) return moduleCache.get(fullPath).exports;

  const source = fs.readFileSync(fullPath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  moduleCache.set(fullPath, loadedModule);

  function localRequire(specifier) {
    const resolved = resolveTsPath(specifier);
    if (resolved) return loadTsModule(resolved);
    if (specifier.startsWith(".")) {
      const base = path.resolve(path.dirname(fullPath), specifier);
      for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, "index.ts")]) {
        if (fs.existsSync(candidate)) return loadTsModule(candidate);
      }
    }
    return require(specifier);
  }

  const execute = new Function("require", "module", "exports", output);
  execute(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const contract = loadTsModule(path.join(root, "lib/family/print/tree-print-dom-contract.ts"));
const workspace = read("components/tree-print/tree-print-workspace.tsx");
const svg = read("components/tree-print/tree-print-svg.tsx");
const page = read("app/(admin)/admin/tree/print/page.tsx");
const globals = read("app/globals.css");
const pageStyle = read("lib/family/print/tree-print-page-style.ts");
const svgExport = read("lib/family/print/tree-print-svg-export.ts");
const scale = read("lib/family/print/tree-print-scale.ts");
const runtime = [workspace, svg, page, globals, pageStyle, svgExport, scale].join("\n");
const printRuntime = [workspace, svg, globals, pageStyle, svgExport, scale].join("\n");

assert.equal(contract.isTreePrintSurfaceVisible("screen", "screen-preview"), true);
assert.equal(contract.isTreePrintSurfaceVisible("screen", "print-document"), false);
assert.equal(contract.isTreePrintSurfaceVisible("print", "screen-preview"), false);
assert.equal(contract.isTreePrintSurfaceVisible("print", "print-document"), true);
assert.deepEqual(Object.values(contract.TREE_PRINT_DOM_SELECTORS), Array.from(new Set(Object.values(contract.TREE_PRINT_DOM_SELECTORS))));

assert.equal(count(workspace, "data-tree-print-root="), 1);
assert.equal(count(workspace, "data-tree-print-document-root="), 1);
assert.equal(count(workspace, "data-tree-print-document="), 1);
assert.equal(count(workspace, "className=\"tree-print-print-svg\""), 1);
assert.equal(count(workspace, "window.print()"), 1);
assert.equal(count(workspace, "data-tree-print-page-style="), 1);
assert.equal(count(page, "data-tree-print-page="), 1);
assert.ok(count(page, "data-tree-print-screen-preview=") >= 1);
assert.ok(count(workspace, "data-tree-print-screen-preview=") >= 1);
assert.ok(svg.includes("data-tree-print-primary-content"));

assert.ok(globals.includes("@media screen"));
assert.ok(globals.includes("[data-tree-print-document]"));
assert.ok(globals.includes("@media print"));
assert.ok(globals.includes("[data-tree-print-screen-preview]"));
assert.ok(globals.includes("display: none !important"));
assert.ok(globals.includes("body:has([data-tree-print-page]) aside"));
assert.ok(globals.includes("body:has([data-tree-print-page]) header:not(.tree-print-print-header)"));
assert.ok(globals.includes("[data-tree-print-route-content]"));
assert.ok(!/\.tree-print-print-root\s*\{[^}]*position:\s*fixed/i.test(globals));
assert.equal(contract.hasForcedTreePrintPageBreak(globals), false);
assert.equal(globals.includes(".tree-print-print-page-last"), false);

assert.equal(count(runtime, "beforeprint"), 0);
assert.equal(count(runtime, "afterprint"), 0);
assert.equal(count(runtime, "matchMedia"), 0);
assert.equal(count(runtime, "createPortal"), 0);
assert.ok(Object.values(contract.TREE_PRINT_DOM_SELECTORS).includes("[data-tree-print-temporary-root]"));
assert.equal(count(runtime, "data-tree-print-temporary-root"), 0);
assert.equal(count(workspace, "appendChild"), 0);
assert.equal(count(workspace, "cloneNode"), 0);
assert.equal(count(pageStyle, "@page"), 1);
assert.ok(pageStyle.includes(".tree-print-print-sheet"));
assert.ok(!pageStyle.includes("appendChild"));

assert.ok(svgExport.includes("cloneNode"));
assert.ok(svgExport.includes("data-tree-print-diagnostics"));
assert.ok(svgExport.includes("data-tree-print-export-exclude"));
assert.ok(scale.includes("readabilityMessage"));
assert.ok(scale.includes("unreadable"));
assert.ok(workspace.includes("Trang 1/1"));
assert.ok(count(workspace, "tree-print-print-header") >= 1);
assert.ok(count(workspace, "tree-print-print-footer") >= 1);
assert.ok(count(workspace, "tree-print-print-legend") >= 1);
assert.equal(workspace.includes("data-tree-print-planned-page-count"), false);

for (const banned of ["app/auth/", "components/auth/", "lib/auth/", "lib/supabase/", "lib/permissions/", "_guard/"]) {
  assert.equal(printRuntime.includes(banned), false, `A17P1R print runtime must not import forbidden scope: ${banned}`);
}

console.log("[A17P1R Print Singleton Contracts] PASS");

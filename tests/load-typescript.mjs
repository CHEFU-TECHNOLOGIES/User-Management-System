import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

export function loadTypeScript(url, globals = {}, modules = new Map()) {
  if (modules.has(url.href)) return modules.get(url.href).exports;
  const module = { exports: {} };
  modules.set(url.href, module);
  const code = ts.transpileModule(fs.readFileSync(url, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    AbortController,
    DOMException,
    URL,
    URLSearchParams,
    require: (name) =>
      loadTypeScript(new URL(`${name}.ts`, url), globals, modules),
    ...globals,
  });
  return module.exports;
}

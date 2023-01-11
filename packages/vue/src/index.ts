// vue 出口
export * from "@my-vue/runtime-dom";
import { baseCompile } from "@my-vue/compiler-core";
import * as runtimeDom from "@my-vue/runtime-dom";
import { registerRuntimeCompiler } from "@my-vue/runtime-dom";

function compileToFunction(template) {
  const { code } = baseCompile(template);
  const render = new Function("Vue", code)(runtimeDom);
  return render;
}

registerRuntimeCompiler(compileToFunction);

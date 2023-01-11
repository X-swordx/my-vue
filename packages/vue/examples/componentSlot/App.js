import { h, createTextVNode } from "../../dist/my-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    // object key
    const foo = h(
      Foo,
      {},
      {
        header: ({ age }) => [
          h("p", {}, "header" + age),
          createTextVNode("数组插槽的文本节点"),
        ],
        footer: () => h("p", {}, "footer"),
      }
    );
    // 数组 vnode
    // const foo = h(Foo, {}, h("p", {}, "123"));
    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};

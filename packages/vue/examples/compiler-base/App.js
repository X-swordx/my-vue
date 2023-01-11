import { ref } from "../../dist/my-vue.esm.js";

export const App = {
  name: "App",
  template: `<div>hi,{{msg}}{{count}}</div>`,
  setup() {
    const msg = ref("终于实现完了vue核心模块")
    const count = (window.count = ref(1));
    return {
      msg,
      count,
    };
  },
};

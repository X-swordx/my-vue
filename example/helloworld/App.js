import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    // ui
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
      },
      // "hi, " + this.msg
      // string类型
      // "hi, my-vue"
      // Array类型
      [h("p", { class:"red"}, "hi"), h("p", {class:"blue"}, "my-vue")]
    );
  },

  setup() {
    return {
      msg: "my-vue",
    };
  },
};

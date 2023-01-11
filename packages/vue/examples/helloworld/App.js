import { h } from "../../dist/my-vue.esm.js";
import { Foo } from "./Foo.js"

window.self = null;
export const App = {
  name: "App",
  render () {
    window.self = this;
    // ui
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        onClick () {
          console.log("click");
        }
      },
      [
        h("div", {}, "hi," + this.msg),
        h(Foo, {
          count: 1,
        }),
      ]
      // "hi, " + this.msg
      // string类型
      // "hi, my-vue"
      // Array类型
      // [h("p", { class:"red"}, "hi"), h("p", {class:"blue"}, "my-vue")]
    );
  },

  setup () {
    return {
      msg: "my-vue",
    };
  },
};

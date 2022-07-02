import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../lib/my-vue.esm.js";

export default {
  name: "App",
  setup() {
    const count = ref(1);
    const instance = getCurrentInstance();

    function onClick() {
      for (let i = 0; i < 100; i++) {
        console.log("update");
        count.value = i;
      }

      debugger;
      console.log(instance);
      nextTick(() => {
        console.log(instance);
      });

      // await nextTick()
      // console.log(instance)
    }

    return {
      onClick,
      count,
    };
  },
  render() {
    const text = h("p", {}, "实现 nextTick");
    const button = h("button", { onClick: this.onClick }, "update");
    const p = h("p", {}, "count:" + this.count);

    return h("div", {}, [text, button, p]);
  },
};

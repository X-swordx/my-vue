import { ShapeFlags } from "../shared/ShapeFlags";

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export { createVNode as createElementVNode };

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
    el: null,
    component: null
  };
  // 初始化 children 的 shapeFlag
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  // 给插槽打上 shapeFlag
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
    if(typeof children === "object"){
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode;
}
// 处理 type 的 shapeFlag
function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}
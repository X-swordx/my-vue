/*
 * @Author: zhengchengxuan 534370078@qq.com
 * @Date: 2023-01-11 19:44:22
 * @LastEditors: zhengchengxuan 534370078@qq.com
 * @LastEditTime: 2023-02-09 23:21:25
 * @FilePath: \my-vue\packages\runtime-core\src\vnode.ts
 * @Description:
 */
import { ShapeFlags } from '@my-vue/shared';

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export { createVNode as createElementVNode };

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
    el: null,
    component: null,
  };
  // 初始化 children 的 shapeFlag
  if (typeof children === 'string') {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  // 给插槽打上 shapeFlag
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}
// 处理 type 的 shapeFlag
function getShapeFlag(type) {
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text);
}

// 标准化 vnode 的格式
// 其目的是为了让 child 支持多种格式
export function normalizeVNode(child) {
  // 暂时只支持处理 child 为 string 和 number 的情况
  if (typeof child === 'string' || typeof child === 'number') {
    return createVNode(Text, null, String(child));
  } else {
    return child;
  }
}

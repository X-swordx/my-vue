/*
 * @Author: zhengchengxuan 534370078@qq.com
 * @Date: 2023-01-11 19:44:22
 * @LastEditors: zhengchengxuan 534370078@qq.com
 * @LastEditTime: 2023-02-14 00:29:51
 * @FilePath: \my-vue\packages\runtime-core\src\vnode.ts
 * @Description:
 */
import { ShapeFlags } from '@my-vue/shared';

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');
export const Teleport = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    // 通过 internals 参数取得渲染器的内部方法
    const { patch, patchChildren } = internals;
    // 如果旧 VNode n1 不存在，则是全新的挂载，否则执行更新
    if (!n1) {
      // 挂载
      // 获取挂载容器
      const target =
        typeof n2.props.to === 'string'
          ? document.querySelector(n2.props.to)
          : n2.props.to;
      // 将 n2.children 渲染到指定挂载点
      n2.children.forEach((c) => {
        patch(null, c, target, anchor);
      });
    } else {
      // 更新
      patchChildren(n1, n2, container);
      // 如果新旧 to 参数的值不同， 则需要对内容进行移动
      if (n2.props.to !== n1.props.to) {
        const newTarget =
          typeof n2.props.to === 'string'
            ? document.querySelector(n2.props.to)
            : n2.props.to;
        // 移动到新容器上
        n2.children.forEach((c) => {
          patch(null, c, newTarget, anchor);
        });
      }
    }
  },
};

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
    // 给 Teleport 打上 shapeFlag
    if (typeof type === 'object' && type.__isTeleport) {
      vnode.shapeFlag = ShapeFlags.TELEPORT;
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

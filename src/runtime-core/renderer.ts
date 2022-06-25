import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  // 判断 vnode 是 element 还是 component 类型
  const { shapeFlag, type } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode, container, parentComponent);
}

function mountElement(vnode: any, container, parentComponent) {
  const { type, props, children, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type));

  if (props) {
    for (const key in props) {
      const value = props[key]
      const isOn = (key: string) => /^on[A-Z]/.test(key)
      const event = key.slice(2).toLowerCase()
      if (isOn(key)) {
        el.addEventListener(event, value)
      } else {
        el.setAttribute(key, value);
      }

    }
  }

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, parentComponent)
  }

  container.append(el)
}

function mountChildren(children: any, container, parentComponent) {
  children.forEach(v => {
    patch(v, container, parentComponent)
  });
}

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVnode: any, container, parentComponent) {
  const instance = createComponentInstance(initialVnode, parentComponent);

  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance: any, initialVnode, container) {
  const { proxy } = instance
  // 执行h函数也就是createVNode返回一个vnode
  const subTree = instance.render.call(proxy);

  patch(subTree, container, instance);
  // 挂载 $el
  initialVnode.el = subTree.el
}
function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode.children, container, parentComponent);
}

function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children));

  container.append(textNode)
}


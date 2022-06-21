import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断 vnode 是 element 还是 component 类型
  if(typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if(isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container) {
  const {type, props, children} = vnode;
  const el = (vnode.el = document.createElement(type));

  if(props) {
    for (const key in props) {
      el.setAttribute(key, props[key]);
    }
  }

  if(typeof children === "string") {
    el.textContent = children;
  } else if(Array.isArray(children)) {
    mountChildren(children, el)
  }

  container.append(el)
}

function mountChildren(children: any, container) {
  children.forEach(v => {
    patch(v, container)
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVnode: any, container) {
  const instance = createComponentInstance(initialVnode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVnode, container);
}

function setupRenderEffect(instance: any, initialVnode, container) {
  const { proxy } = instance
  // 执行h函数也就是createVNode返回一个vnode
  const subTree = instance.render.call(proxy); 

  patch(subTree, container);
  // 挂载 $el
  initialVnode.el = subTree.el
}

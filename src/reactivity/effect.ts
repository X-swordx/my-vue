import { extend } from "./shared";

let activeEffect;
class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    return this._fn()
  }
  stop() {
    // 防止重复调用 stop，重复清空操作
    if(this.active) {
      clearUpEffect(this)
      this.active = false
      if(this.onStop) {
        this.onStop()
      }
    }
  }
}

function clearUpEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

const targetMap = new Map()
export function track(target, key) {
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, dep = new Set())
  }
  
  if (!activeEffect) return
  // 存在 activeEffect 才执行下面的代码，避免 activeEffect 为 undefined 报错
  dep.add(activeEffect)
  // 反向收集 dep 依赖
  activeEffect.deps.push(dep)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // Object.assign(_effect, option)
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect) // 解决 this 指向 effect 函数
  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
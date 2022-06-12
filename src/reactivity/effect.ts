let activeEffect;
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn
  }
  run() {
    activeEffect = this
    return this._fn()
  }
}

const targetMap = new Map()
export function track(target, key) {
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target, depsMap = new Map())
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key, dep = new Set())
  }
  dep.add(activeEffect)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)

  for (const effect of dep) {
    effect.run()
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()

  return _effect.run.bind(_effect) // 解决 this 指向 effect 函数
}
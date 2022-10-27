// effect 和 watchEffect 的区别：
// effect 是在变化后立即执行的，和组件渲染无关
// watchEffect 默认是在组件渲染之前执行的
import { ReactiveEffect } from '../reactivity/effect';
import { queuePreFlushCb } from './scheduler';

export function watchEffect(source) {
  function job() {
    effect.run();
  }

  let cleanup;
  const onCleanup = function (fn) {
    cleanup = effect.onStop = () => {
      fn()
    }
    
  };
  function getters () {
    if (cleanup) {
      cleanup();
    }
    source(onCleanup);
  };
  const effect = new ReactiveEffect(getters, () => {
    queuePreFlushCb(job);
  });
  effect.run();

  return () => {
    effect.stop();
  };
}

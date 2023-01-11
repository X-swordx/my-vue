const queue: any[] = []
const activePreFlushCbs: any[] = []

// 优先用微任务，vue中采用了优雅降级，如果微任务都不支持，就用宏任务兜底
const p = Promise.resolve()
let isFlushPending = false

export function nextTick(fn?) {
  return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }
  queueFlush()
}

export function queuePreFlushCb(job) {
  activePreFlushCbs.push(job)
  queueFlush()
} 

function queueFlush() {
  if(isFlushPending) return
  isFlushPending = true

  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false

  // 组件渲染之前
  flushPreFlushCbs()
  // 组件渲染
  let job
  while (job = queue.shift()) {
    job && job()
  }
}

function flushPreFlushCbs() {
  for (let i = 0; i < activePreFlushCbs.length; i++) {
    activePreFlushCbs[i]()
  }
}

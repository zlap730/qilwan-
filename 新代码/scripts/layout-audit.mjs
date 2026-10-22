/**
 * PC 布局审计脚本
 *
 * 在 1024 / 1152 / 1280 / 1440 / 1600 / 1920 / 2560 七个宽度下依次打开 5 个页面，
 * 检查有没有元素超出视口（会表现为横向滚动条，或者表格列被裁切）。
 *
 * 用法（先启动服务）：
 *   npm run dev
 *   node scripts/layout-audit.mjs                                  # 审计开发服务器 5173
 *   BASE_URL=http://localhost:4173 node scripts/layout-audit.mjs    # 审计构建产物
 *
 * 可选环境变量：
 *   SHOT_DIR  指定目录时，同时保存每个「页面 × 宽度」的截图
 *   CDP_PORT  DevTools 调试端口，默认 9555（同时跑多个实例时改一下）
 *
 * 依赖：本机安装 Edge（路径见 EDGE 常量）；不需要额外 npm 包。
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = Number(process.env.CDP_PORT || 9555)
const profile = `${process.env.TEMP}\\dsh-edge-resp`
const BASE = process.env.BASE_URL || 'http://localhost:5173'
const SHOT_DIR = process.env.SHOT_DIR || ''

const ROUTES = [
  { path: '/', name: '首页' },
  { path: '/forum', name: '讨论区' },
  { path: '/calculator', name: '装配清单' },
  { path: '/shifters', name: '变速器大全' },
  { path: '/login', name: '登录' }
]
const WIDTHS = [1024, 1152, 1280, 1440, 1600, 1920, 2560]
const HEIGHT = 900
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank'
  ],
  { stdio: 'ignore' }
)

async function findTarget() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((t) => t.type === 'page')
      if (page) return page
    } catch {
      /* devtools 还没起来 */
    }
    await sleep(300)
  }
  throw new Error('找不到调试目标')
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    const pending = new Map()
    let nextId = 0
    ws.addEventListener('open', () =>
      resolve({
        send(method, params = {}) {
          const id = ++nextId
          return new Promise((res, rej) => {
            pending.set(id, (msg) => (msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)))
            ws.send(JSON.stringify({ id, method, params }))
          })
        },
        close: () => ws.close()
      })
    )
    ws.addEventListener('error', reject)
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && pending.has(msg.id)) {
        const fn = pending.get(msg.id)
        pending.delete(msg.id)
        fn(msg)
      }
    })
  })
}

const MEASURE = `(() => {
  const de = document.documentElement;
  const vw = de.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.right > vw + 1.5) {
      bad.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 28), id: el.id || '', right: Math.round(r.right) });
    }
  }
  bad.sort((a, b) => b.right - a.right);
  return { vw, scrollWidth: de.scrollWidth, overflow: de.scrollWidth - vw, count: bad.length, worst: bad.slice(0, 4) };
})()`

let client
try {
  const target = await findTarget()
  client = await connect(target.webSocketDebuggerUrl)
  await client.send('Page.enable')
  await client.send('Runtime.enable')

  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await client.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    })
    if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails))
    return result.value
  }

  const rows = []
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height: HEIGHT,
        deviceScaleFactor: 1,
        mobile: false
      })
      await client.send('Page.navigate', { url: BASE + route.path })
      await sleep(900)
      const m = await evaluate(MEASURE)
      rows.push({ route: route.name, width, ...m })

      if (SHOT_DIR) {
        const shot = await client.send('Page.captureScreenshot', { format: 'png' })
        fs.writeFileSync(`${SHOT_DIR}/${route.name}-${width}.png`, Buffer.from(shot.data, 'base64'))
      }
    }
  }

  console.log('页面'.padEnd(8), '宽度'.padEnd(6), '视口'.padEnd(6), 'scrollW'.padEnd(8), '结果', ' 最宽元素')
  let problems = 0
  for (const r of rows) {
    if (r.overflow > 1 || r.count > 0) problems += 1
    const worst = (r.worst || [])
      .map((w) => `${w.tag}${w.id ? '#' + w.id : ''}.${w.cls}(${w.right})`)
      .slice(0, 2)
      .join('  ')
    console.log(
      r.route.padEnd(8),
      String(r.width).padEnd(6),
      String(r.vw).padEnd(6),
      String(r.scrollWidth).padEnd(8),
      (r.overflow > 1 || r.count > 0 ? 'FAIL' : 'OK').padEnd(5),
      worst
    )
  }
  console.log(`\n有问题的组合：${problems} / ${rows.length}`)
} finally {
  client?.close()
  edge.kill()
}

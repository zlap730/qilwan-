/**
 * 从 src/data/shifterBrands.js 里把 8 个品牌的表格抽成结构化 JSON，
 * 生成 src/data/calculatorRefs.js 的「变速器参考」部分。
 *
 * 为什么要抽：计算清单的「参考」面板要按「列」复用这些表，
 * 直接塞 HTML 字符串既不能控制列宽，也没法保证不横向溢出。
 * 抽成 { title, head: [...], rows: [[...], ...] } 之后可以自己画表格。
 *
 * 用法：node scripts/extract-calc-refs.mjs（可重复执行）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, '..')
const srcFile = path.join(projectRoot, 'src', 'data', 'shifterBrands.js')
const outFile = path.join(projectRoot, 'src', 'data', 'shifterTables.json')

const text = fs.readFileSync(srcFile, 'utf8')

const KEYS = ['蓝图', '顺泰', '速瑞达', '微转', '博力为', '禧玛诺SHIMANO', '速联SRAM', 'Campagnolo']

// 去掉标签、压缩空白、保留换行语义
function cleanHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' / ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

function splitBrands(source) {
  const result = {}
  for (let i = 0; i < KEYS.length; i += 1) {
    const key = KEYS[i]
    const startMark = `\n        ${key}: \``
    const start = source.indexOf(startMark)
    if (start < 0) continue

    const nextKey = KEYS[i + 1]
    let end
    if (nextKey) {
      const nextMark = `\n        ${nextKey}: \``
      end = source.indexOf(nextMark, start + startMark.length)
    } else {
      end = source.indexOf('\n    };', start)
    }
    result[key] = source.slice(start + startMark.length, end < 0 ? undefined : end)
  }
  return result
}

function parseTwigs(inner) {
  // 把 <tr>...</tr> 拆开，跳过表头行
  const trs = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1])
  const rows = []
  for (const tr of trs) {
    // 表头行（th）跳过，单独用 head 记录
    if (/<th/i.test(tr)) continue

    // 注意 colspan：原表里有 colspan="2" 的单元格，抽成数组时要展开成两格，
    // 否则行会比列少，前端渲染会错位（速瑞达「山地系列」就是这种情况）
    const cells = []
    for (const m of tr.matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)) {
      const span = Number((m[1].match(/colspan\s*=\s*["']?(\d+)/i) || [])[1] || 1)
      const value = cleanHtml(m[2])
      for (let k = 0; k < span; k += 1) cells.push(k === 0 ? value : '')
    }
    if (cells.length === 0) continue
    rows.push(cells)
  }
  return rows
}

function parseBrand(segment) {
  // 表格前面的 h3 作为表格标题（按出现顺序）
  const tables = [...segment.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)]

  // 收集 all <h2>/<h3> 及其位置，用于给表格配标题
  const headings = [...segment.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    pos: m.index,
    level: Number(m[1]),
    text: cleanHtml(m[2])
  }))

  const result = []
  for (const match of tables) {
    const pos = match.index
    const inner = match[1]

    const headCells = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
      .filter((m) => /<th/i.test(m[1]))
      .map((m) => [...m[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((c) => cleanHtml(c[1])))

    const head = headCells.length ? headCells[0] : []
    const rows = parseTwigs(inner)

    // 标题优先取「这个表格与上一个表格之间」最近的 h2/h3。
    // 这样速瑞达那种「<h2>速瑞达</h2> <h2>公路系列…</h2> <table>」也能拿到系列名。
    const prevTableEnd = result.length
      ? tables[result.length - 1].index + tables[result.length - 1][0].length
      : 0
    const between = headings.filter((h) => h.pos > prevTableEnd && h.pos < pos)
    const title = between.length ? between[between.length - 1].text : (headings.length ? '' : '')

    result.push({ title, head, rows })
  }

  return result
}

const brands = splitBrands(text)
const output = {}

for (const key of KEYS) {
  const segment = brands[key]
  if (!segment) {
    console.log(`跳过（未找到）：${key}`)
    continue
  }
  const tables = parseBrand(segment)
  output[key] = tables
  const rowTotal = tables.reduce((sum, t) => sum + t.rows.length, 0)
  console.log(`${key.padEnd(14)} 表格 ${tables.length} 个 / 合计 ${rowTotal} 行`)
  for (const t of tables) {
    console.log(`    - ${(t.title || '(无标题)').slice(0, 28)}  列 ${t.head.length} 行 ${t.rows.length}`)
  }
}

fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf8')
console.log(`\n已写入 ${path.relative(projectRoot, outFile)}`)

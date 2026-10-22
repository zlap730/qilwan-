/**
 * 从 旧代码/JS文件/变速器大全-选项框.js 里把 brandContents 数据原样抽出来，
 * 生成 src/data/shifterBrands.js（内容零改动，只做 4 处必要的路径/笔误修正）。
 *
 * 用法：node scripts/extract-shifter-data.mjs
 * 原文件内容改动后可以重复跑，保证数据永远和老代码一致。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
// 旧代码整体在项目根的 旧代码/ 目录下（2026-10 目录重组）
const projectRoot = path.resolve(here, '..', '..')
const srcPath = path.join(projectRoot, '旧代码', 'JS文件', '变速器大全-选项框.js')
const outPath = path.join(here, '..', 'src', 'data', 'shifterBrands.js')

const source = fs.readFileSync(srcPath, 'utf8')
const lines = source.split(/\r?\n/)

const start = lines.findIndex((line) => line.includes('const brandContents = {'))
const end = lines.findIndex((line, index) => index > start && line.trim() === '};')

if (start < 0 || end < 0) {
  throw new Error('没找到 brandContents 对象的边界，原文件结构可能变了')
}

let block = lines.slice(start, end + 1).join('\n')
block = block.replace('const brandContents = {', 'export const brandContents = {')

// —— 修正 1：数据里的相对路径改成 SPA 的公开目录路径 ——
block = block.replaceAll('"../video/', '"/video/').replaceAll("'../video/", "'/video/")

// —— 修正 2：原来这条链接指向老的多页文件，SPA 里没有对应路由，先降级成不可点的提示 ——
block = block.replace(
  '<a href="../HTML/变速器调试.html" target="_blank">变速器调试.html</a>',
  '<span class="todo-link" title="原页面 变速器调试.html 尚未迁移到 Vue">变速器调试.html（待迁移）</span>'
)

// —— 修正 3：<li 少了右尖括号，浏览器会把整段文字吞掉 ——
block = block.replace(
  '<li由于禧玛诺的低端产品整合成cues系列，因此在这里没有列出。</li>',
  '<li>由于禧玛诺的低端产品整合成 CUES 系列，因此在这里没有列出。</li>'
)

// —— 修正 4：去掉 Windows 换行，避免混进 HTML 文本节点 ——
block = block.replaceAll('\r', '')

const header = `/**
 * 变速器品牌资料。
 *
 * 内容原样抽自原项目 JS文件/变速器大全-选项框.js 的 brandContents 对象，
 * 一个字都没有改写（只修了 4 处：视频路径、一个失效链接、一处 <li 笔误、换行符）。
 * 想改文案或表格，直接改下面的 HTML 片段即可；想改样式，改 assets/legacy/变速器大全.css。
 *
 * 由 scripts/extract-shifter-data.mjs 生成，可重复执行。
 */
`

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, header + block + '\n', 'utf8')

// —— 自检报告 ——
const brands = [...block.matchAll(/^ {8}([^\s<][^:]{0,20}):\s*`/gm)].map((m) => m[1])
const leftovers = [...block.matchAll(/\.\.\//g)].length
const interpolations = [...block.matchAll(/\$\{/g)].length

console.log('品牌数量:', brands.length)
console.log('品牌列表:', brands.join(' / '))
console.log('残留 ../ 相对路径:', leftovers)
console.log('残留 ${} 插值:', interpolations)
console.log('输出:', path.relative(projectRoot, outPath))

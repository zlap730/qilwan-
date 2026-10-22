/**
 * 变速器大全的分类 / 品牌元数据。
 *
 * 对应原来 selectCategory() 里硬编码在 innerHTML 字符串中的两组品牌卡
 * （连 onclick="selectBrand(this, 'xxx')" 的参数都写死在里面）。
 *
 * 现在新增一个品牌只要两步：
 *   1. 这里 brands 数组里加一行；
 *   2. src/data/shifterBrands.js 里加一个同名 key（可跑 scripts/extract-shifter-data.mjs 重新生成）。
 * 品牌 id 必须和 shifterBrands.js 的 key 完全一致。
 */
export const shifterCategories = [
  {
    id: 'domestic',
    label: '国产',
    brands: [
      { id: '蓝图', label: '蓝图' },
      { id: '顺泰', label: '顺泰' },
      { id: '速瑞达', label: '速瑞达' },
      { id: '微转', label: '微转' },
      { id: '博力为', label: '博力为' }
    ]
  },
  {
    id: 'imported',
    label: '进口',
    brands: [
      { id: '禧玛诺SHIMANO', label: '禧玛诺SHIMANO' },
      { id: '速联SRAM', label: '速联SRAM' },
      { id: 'Campagnolo', label: 'Campagnolo(CP)' }
    ]
  }
]

/** 品牌对应的 CSV 参数表（原代码只给蓝图挂了一张表，路径是 ../csv/蓝图变速器.csv） */
export const brandCsvMap = {
  蓝图: '/csv/蓝图变速器.csv'
}

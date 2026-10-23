<!--
  MapView.vue —— 车店 / 骑行地图
  路由：/map

  用高德地图 JS API 显示一张地图（中心沿用旧站设置的北京坐标），进入页面时才加载脚本。
  高德 key 可以放在 .env 的 VITE_AMAP_KEY；加载失败会显示可读提示而不是空白。
  对应旧站：地图.html。

  数据来源：高德 JS API（webapi.amap.com/maps）
-->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

/*
 * 地图页：原 HTML/地图.html
 * 原实现：两行 <script> 直接引高德 JS API，然后在 window.onload 里 new AMap.Map。
 * 迁移后：改成按需动态加载（进入页面才请求高德），并处理加载失败的情况
 * —— 没网 / key 失效时给出可读的提示，而不是留一块空白。
 *
 * key 建议放在 .env 里：VITE_AMAP_KEY=xxxx
 * 不填则使用旧站里那个 key（f2ead4...，可能已过期或额度用完）。
 */

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || 'f2ead4484673098b8bbe222a067977be'

const mapEl = ref(null)
const loading = ref(true)
const failed = ref(false)
let mapInstance = null

// 动态插入 <script>，同一个地址只加载一次
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === '1') resolve()
      else {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', () => reject(new Error('高德脚本加载失败')), { once: true })
      }
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.src = src
    script.addEventListener('load', () => {
      script.dataset.loaded = '1'
      resolve()
    })
    script.addEventListener('error', () => reject(new Error('高德脚本加载失败')), { once: true })
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  try {
    await loadScript(`https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`)
    if (!window.AMap) throw new Error('AMap 未就绪')

    // 中心点沿用旧站设置（北京），缩放 13
    mapInstance = new window.AMap.Map(mapEl.value, {
      center: [116.397428, 39.90923],
      zoom: 13
    })
    // 加一个标记，方便看出地图确实初始化成功
    new window.AMap.Marker({ position: [116.397428, 39.90923], map: mapInstance })
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  // 离开页面时销毁地图实例，避免切回来看不到地图
  mapInstance?.destroy?.()
  mapInstance = null
})
</script>

<template>
  <main class="page-map">
    <section class="card">
      <header class="head">
        <h1>车店 / 骑行地图</h1>
        <p class="hint">地图中心沿用旧站设置（北京），可以拖动、缩放查看周边。</p>
      </header>

      <div class="map-wrap">
        <div ref="mapEl" class="map" />
        <p v-if="loading" class="overlay">地图加载中…</p>
        <p v-else-if="failed" class="overlay error">
          地图没能加载成功：可能是没有联网、高德 key 失效或额度用完。<br />
          可以在 <code>新代码/.env</code> 里配置自己的 <code>VITE_AMAP_KEY</code> 后重试。
        </p>
      </div>

      <p class="note">
        旧站用的是高德 JS API 2.0，这里保持一致；区别只是把「页面一打开就加载」改成「进入这个路由才加载」，
        并且加了加载失败的提示。
      </p>
    </section>
  </main>
</template>

<style scoped>
.page-map {
  min-height: 100vh;
  padding: 96px 0 60px;
  background: linear-gradient(180deg, #f8fbff 0%, #fdf4e6 55%, #f9ead8 100%);
  box-sizing: border-box;
}

.card {
  width: min(1000px, 92vw);
  margin: 0 auto;
  padding: clamp(18px, 2.2vw, 30px);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 14px 38px rgba(150, 115, 70, 0.14);
}

.head h1 {
  margin: 0 0 8px;
  font-family: '幼圆', 'YouYuan', '微软雅黑', sans-serif;
  font-size: clamp(22px, 2vw, 30px);
  color: #33261a;
}

.hint {
  margin: 0 0 16px;
  color: #7a6248;
  font-size: 14px;
}

.map-wrap {
  position: relative;
  width: 100%;
  height: clamp(320px, 46vw, 560px);
  border-radius: 12px;
  overflow: hidden;
  background: #f2f3f5;
}

.map {
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 20px;
  text-align: center;
  color: #6b5a45;
  font-size: 14px;
  line-height: 1.9;
  background: rgba(255, 255, 255, 0.88);
}

.overlay.error {
  color: #c0392b;
}

.overlay code {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  font-size: 13px;
}

.note {
  margin: 16px 0 0;
  color: #8a7761;
  font-size: 13px;
  line-height: 1.9;
}
</style>

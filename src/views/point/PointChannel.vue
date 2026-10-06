<template>
  <div class="gis-layout">
    <div id="ol-map" ref="mapElement"></div>
    <section class="toolbar-card">
      <div class="tool-group">
        <span class="tool-label">🗺️ 地图图层</span>
        <div class="layer-buttons">
          <button :class="{ active: currentBaseLayer === 'amap' }" @click="switchBaseLayer('amap')">
            高德
          </button>
          <button
            :class="{ active: currentBaseLayer === 'satellite' }"
            @click="switchBaseLayer('satellite')"
          >
            卫星
          </button>
          <button
            :class="{ active: currentBaseLayer === 'terrain3d' }"
            class="terrain-3d-btn"
            @click="switchBaseLayer('terrain3d')"
          >
            3D 地形
          </button>
        </div>
      </div>
      <div class="tool-group">
        <label class="tool-label" for="level-filter">📊 适宜等级</label>
        <select id="level-filter" v-model="currentFilter" @change="applyLevelFilter">
          <option value="全部">显示全部网格</option>
          <option value="高适宜">高适宜</option>
          <option value="适宜">适宜</option>
          <option value="不适宜">不适宜</option>
        </select>
      </div>
      <div class="tool-group">
        <span class="tool-label">🔥 空间分析</span>
        <label class="heatmap-toggle">
          <input type="checkbox" @change="toggleHeatmap($event.target.checked)" />
          <span>适宜度热力图</span>
        </label>
      </div>
      <hr class="tool-divider" />
      <form class="search-group" @submit.prevent="searchByNodeId">
        <label class="search-label" for="node-search">🔎 网格编号</label>
        <div class="search-input-wrap">
          <input
            id="node-search"
            v-model="searchNodeId"
            type="text"
            placeholder="输入编号，例如 001"
          />
          <button type="submit">搜索</button>
        </div>
      </form>
      <form class="search-group" @submit.prevent="searchByAddress">
        <label class="search-label" for="address-search">📍 地名定位</label>
        <div class="search-input-wrap">
          <input
            id="address-search"
            v-model="searchAddressKeyword"
            type="text"
            placeholder="地名、村庄或水库"
          />
          <button type="submit">定位</button>
        </div>
      </form>
      <form class="coordinate-group" @submit.prevent="createNodeByCoordinates">
        <label class="search-label" for="longitude-input">输入经纬度新增点位</label>
        <div class="coordinate-inputs">
          <input
            id="longitude-input"
            v-model="inputLongitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="经度"
          />
          <input
            id="latitude-input"
            v-model="inputLatitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="纬度"
          />
          <button type="submit">新增</button>
        </div>
        <span class="coordinate-hint">也可以在地图上右键直接新增</span>
      </form>
    </section>

    <aside class="hud-card">
      <h3>🌱 茶树种植适宜性</h3>
      <p class="status">
        <span class="pulse-dot" :class="{ offline: connectionStatus === 'offline' }"></span>
        <span v-if="connectionStatus === 'connected'"
          >MongoDB 实时数据 · {{ nodeCount }} 个网格</span
        >
        <span v-else-if="connectionStatus === 'offline'">后端暂不可用，正在重试连接…</span>
        <span v-else>正在连接实时数据…</span>
      </p>
      <hr />
      <div v-if="!selectedNode" class="placeholder">
        <p><b>四维生态交互说明</b></p>
        <p>1. 点击地图网格，查看土壤、高程、降水和气温等适宜性指标。</p>
        <p>2. 右键地图或输入经纬度可添加网格点；系统会尝试获取真实高程并保存到 MongoDB。</p>
        <p>3. 使用左侧工具切换底图、筛选等级、搜索网格或查看适宜度热力图。</p>
      </div>
      <div v-else>
        <div class="data-header">
          <div class="data-grid">
            <p>
              <b>创建用户</b><span>{{ selectedNode.name }}</span>
            </p>
            <p>
              <b>网格编号</b><span>{{ selectedNode.id }}</span>
            </p>
            <p>
              <b>适宜等级</b
              ><span :class="['badge', levelClass(selectedNode.level)]">{{
                selectedNode.level
              }}</span>
            </p>
            <p>
              <b>综合评分</b><span class="score-num">{{ selectedNode.score }} 分</span>
            </p>
          </div>
          <button class="delete-btn" @click="deleteCurrentNode(selectedNode.id)">删除网格</button>
        </div>
        <div class="amap-address-box">
          📍 <b>地理位置</b>
          <p class="address-text">{{ selectedNode.amapAddress || '正在解析地名…' }}</p>
        </div>
        <hr />
        <h4>📈 生态因子匹配度</h4>
        <div id="factor-chart"></div>
        <div class="factor-details">
          <p>
            <span>土壤 pH</span><b>{{ selectedNode.ph }}</b>
          </p>
          <p>
            <span>高程</span><b>{{ selectedNode.elevation }} m</b>
          </p>
          <p>
            <span>年降水量</span><b>{{ selectedNode.rainfall }} mm</b>
          </p>
          <p>
            <span>传感器气温</span><b>{{ selectedNode.temperature }} °C</b>
          </p>
        </div>
        <div v-if="selectedNode.amapWeather" class="weather-panel">
          <h5>高德实时天气</h5>
          <div class="weather-grid">
            <p>
              天气 <b>{{ selectedNode.amapWeather.weather }}</b>
            </p>
            <p>
              气温 <b>{{ selectedNode.amapWeather.temperature }} °C</b>
            </p>
            <p>
              湿度 <b>{{ selectedNode.amapWeather.humidity }}%</b>
            </p>
            <p>
              风向 <b>{{ selectedNode.amapWeather.winddirection }} 风</b>
            </p>
          </div>
        </div>
        <div v-if="selectedNode.amapPois.length" class="poi-panel">
          <h5>周边 3 km 水源与生态设施</h5>
          <ul>
            <li
              v-for="(poi, index) in selectedNode.amapPois"
              :key="index"
              class="poi-clickable-item"
              title="点击定位并高亮此地点"
              @click="zoomAndHighlightPoi(poi.location)"
            >
              📌 {{ poi.text }}
            </li>
          </ul>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import 'ol/ol.css'
import { Feature, Map as OlMap, View } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import Point from 'ol/geom/Point'
import HeatmapLayer from 'ol/layer/Heatmap'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import * as echarts from 'echarts'
import { addTeaNode, deleteTeaNode, fetchTeaSuitability } from '@/api/teaSuitability.js'
import {
  AMAP_KEY,
  fetchAmapEcoData,
  fetchRealElevation,
  searchAmapAddress,
} from '@/api/mapServices.js'
import { useUserStore } from '@/stores/token.js'

const mapElement = ref(null)
const selectedNode = ref(null)
const currentBaseLayer = ref('amap')
const currentFilter = ref('全部')
const searchNodeId = ref('')
const searchAddressKeyword = ref('')
const inputLongitude = ref('')
const inputLatitude = ref('')
const connectionStatus = ref('connecting')
const nodeCount = ref(0)
const userStore = useUserStore()

let map = null
let amapLayer = null
let satelliteLayer = null
let terrain3dLayer = null
let vectorSource = null
let vectorLayer = null
let heatmapLayer = null
let highlightSource = null
let highlightLayer = null
let pollingTimer = null
let chart = null
let contextMenuHandler = null
let resizeHandler = null
let isProgrammaticMove = false

const levelClass = (level) =>
  ({ 高适宜: 'badge-high', 适宜: 'badge-suitable', 不适宜: 'badge-unsuitable' })[level] || ''

const getFeatureStyle = (feature) => {
  const score = Number(feature.get('score')) || 0
  const color = score >= 80 ? '#52c41a' : score >= 50 ? '#faad14' : '#ff4d4f'
  return new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: '#fff', width: 2 }),
    }),
  })
}

const featureToNode = (feature) => ({
  name: feature.get('name'),
  id: feature.get('id'),
  score: feature.get('score'),
  level: feature.get('level'),
  ph: feature.get('ph'),
  elevation: feature.get('elevation'),
  rainfall: feature.get('rainfall'),
  temperature: feature.get('temperature'),
  amapAddress: '',
  amapWeather: null,
  amapPois: [],
})

const disposeChart = () => {
  if (chart) {
    chart.dispose()
    chart = null
  }
}

const initOrUpdateChart = (node) => {
  if (!node) return
  nextTick(() => {
    const chartElement = document.getElementById('factor-chart')
    if (!chartElement) return
    if (!chart) chart = echarts.init(chartElement)
    chart.setOption({
      tooltip: {},
      radar: {
        indicator: [
          { name: '土壤酸碱度', max: 100 },
          { name: '地形高程', max: 100 },
          { name: '气候降水', max: 100 },
          { name: '传感器气温', max: 100 },
        ],
        radius: '62%',
        splitArea: { show: false },
        axisLine: { lineStyle: { color: '#ccd3dc' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                node.ph >= 4.5 && node.ph <= 5.5 ? 95 : 40,
                node.elevation >= 300 && node.elevation <= 600 ? 95 : 35,
                node.rainfall >= 1200 ? 95 : 45,
                node.temperature >= 18 && node.temperature <= 25 ? 95 : 40,
              ],
              name: '环境因子匹配度',
              areaStyle: { color: 'rgba(82, 196, 26, 0.25)' },
              lineStyle: { color: '#52c41a', width: 2 },
              itemStyle: { color: '#52c41a' },
            },
          ],
        },
      ],
    })
  })
}

const applyLevelFilter = () => {
  if (!vectorSource) return
  vectorSource.getFeatures().forEach((feature) => {
    feature.setStyle(
      currentFilter.value === '全部' || feature.get('level') === currentFilter.value
        ? undefined
        : new Style({}),
    )
  })
  vectorSource.changed()
}

const pullStreamData = async () => {
  try {
    const geojson = await fetchTeaSuitability()
    const features = new GeoJSON().readFeatures(geojson)
    vectorSource.clear()
    vectorSource.addFeatures(features)
    nodeCount.value = features.length
    connectionStatus.value = 'connected'
    applyLevelFilter()

    if (selectedNode.value) {
      const selectedFeature = features.find(
        (feature) => String(feature.get('id')) === String(selectedNode.value.id),
      )
      if (selectedFeature) {
        const externalData = {
          amapAddress: selectedNode.value.amapAddress,
          amapWeather: selectedNode.value.amapWeather,
          amapPois: selectedNode.value.amapPois,
        }
        selectedNode.value = { ...featureToNode(selectedFeature), ...externalData }
        initOrUpdateChart(selectedNode.value)
      } else {
        selectedNode.value = null
        disposeChart()
      }
    }
  } catch (error) {
    connectionStatus.value = 'offline'
    console.error('获取茶树适宜性数据失败:', error)
  }
}

const loadExternalDetails = async (node, coordinates) => {
  const data = await fetchAmapEcoData(coordinates[0], coordinates[1], AMAP_KEY)
  if (selectedNode.value && String(selectedNode.value.id) === String(node.id)) {
    selectedNode.value = {
      ...selectedNode.value,
      amapAddress: data.address,
      amapWeather: data.weatherInfo,
      amapPois: data.poiList,
    }
  }
}

const selectFeature = (feature) => {
  const coordinates = feature.getGeometry().getCoordinates()
  const node = featureToNode(feature)
  selectedNode.value = node
  highlightSource.clear()
  initOrUpdateChart(node)
  void loadExternalDetails(node, coordinates)
}

const zoomAndHighlightPoi = (location) => {
  if (!location || !map) return
  const coordinates = location.split(',').map(Number)
  if (coordinates.length !== 2 || coordinates.some((value) => !Number.isFinite(value))) return
  highlightSource.clear()
  highlightSource.addFeature(new Feature({ geometry: new Point(coordinates) }))
  isProgrammaticMove = true
  map.getView().animate({ center: coordinates, zoom: 16, duration: 800 }, () => {
    window.setTimeout(() => {
      isProgrammaticMove = false
    }, 150)
  })
}

const searchByNodeId = () => {
  const query = searchNodeId.value.trim().toLowerCase()
  if (!query) {
    window.alert('请输入要搜索的网格编号。')
    return
  }
  const feature = vectorSource
    .getFeatures()
    .find((item) => String(item.get('id')).trim().toLowerCase() === query)
  if (!feature) {
    window.alert('未找到网格点：' + searchNodeId.value.trim())
    return
  }
  selectFeature(feature)
  zoomAndHighlightPoi(feature.getGeometry().getCoordinates().join(','))
}

const searchByAddress = async () => {
  const keyword = searchAddressKeyword.value.trim()
  if (!keyword) {
    window.alert('请输入要查询的地名。')
    return
  }
  try {
    const location = await searchAmapAddress(keyword, AMAP_KEY)
    if (location) zoomAndHighlightPoi(location)
    else window.alert('没有找到该地点，请尝试更具体的地名。')
  } catch (error) {
    window.alert('地名搜索失败，请检查网络或高德地图 Key。')
    console.error(error)
  }
}

const deleteCurrentNode = async (id) => {
  if (!window.confirm('确定删除网格点 ' + id + ' 吗？')) return
  try {
    const result = await deleteTeaNode(id)
    if (!result.success) throw new Error(result.error || '删除失败')
    selectedNode.value = null
    disposeChart()
    await pullStreamData()
  } catch (error) {
    window.alert('删除网格失败：' + error.message)
  }
}

const switchBaseLayer = (type) => {
  currentBaseLayer.value = type
  if (amapLayer) amapLayer.setVisible(type === 'amap')
  if (satelliteLayer) satelliteLayer.setVisible(type === 'satellite')
  if (terrain3dLayer) terrain3dLayer.setVisible(type === 'terrain3d')
}

const toggleHeatmap = (visible) => {
  if (heatmapLayer) heatmapLayer.setVisible(visible)
}

const getCurrentUsername = () => {
  const storedName = String(userStore.username || '').trim()
  if (storedName) return storedName
  const tokenMatch = String(userStore.token || '').match(/^token_\d+_(.+)$/)
  return tokenMatch ? tokenMatch[1].trim() : ''
}

const createDeviceId = () => `NODE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const addNodeAtCoordinate = async (coordinate) => {
  const username = getCurrentUsername()
  if (!username) {
    window.alert('请先登录后再新增点位')
    return false
  }
  const longitude = Number(coordinate[0].toFixed(5))
  const latitude = Number(coordinate[1].toFixed(5))
  const previousCursor = document.body.style.cursor
  document.body.style.cursor = 'progress'
  try {
    const elevation = await fetchRealElevation(longitude, latitude)
    await addTeaNode({
      name: username,
      deviceId: createDeviceId(),
      lng: longitude,
      lat: latitude,
      ph: 5.2,
      elevation,
      rainfall: 1350,
      temperature: 20.8,
    })
    await pullStreamData()
    return true
  } catch (error) {
    window.alert('新增网格失败：' + error.message)
    return false
  } finally {
    document.body.style.cursor = previousCursor
  }
}

const createNodeByCoordinates = async () => {
  const longitudeText = String(inputLongitude.value).trim()
  const latitudeText = String(inputLatitude.value).trim()
  const longitude = Number(longitudeText)
  const latitude = Number(latitudeText)
  if (
    !longitudeText ||
    !latitudeText ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    window.alert('请输入有效的经度（-180 到 180）和纬度（-90 到 90）')
    return
  }
  if (await addNodeAtCoordinate([longitude, latitude])) {
    inputLongitude.value = ''
    inputLatitude.value = ''
  }
}

onMounted(async () => {
  amapLayer = new TileLayer({
    source: new XYZ({
      url:
        'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}&key=' +
        AMAP_KEY,
      crossOrigin: 'anonymous',
    }),
    visible: true,
  })
  satelliteLayer = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    }),
    visible: false,
  })
  terrain3dLayer = new TileLayer({
    source: new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
      crossOrigin: 'anonymous',
    }),
    visible: false,
  })

  vectorSource = new VectorSource()
  vectorLayer = new VectorLayer({ source: vectorSource, style: getFeatureStyle })
  heatmapLayer = new HeatmapLayer({
    source: vectorSource,
    blur: 20,
    radius: 20,
    weight: (feature) => {
      if (currentFilter.value !== '全部' && feature.get('level') !== currentFilter.value) return 0
      return (Number(feature.get('score')) || 0) / 100
    },
    visible: false,
  })
  highlightSource = new VectorSource()
  highlightLayer = new VectorLayer({
    source: highlightSource,
    style: [
      new Style({
        image: new CircleStyle({
          radius: 17,
          fill: new Fill({ color: 'rgba(255, 77, 79, 0.22)' }),
          stroke: new Stroke({ color: '#ff4d4f', width: 3 }),
        }),
      }),
      new Style({
        image: new CircleStyle({ radius: 5, fill: new Fill({ color: '#ff4d4f' }) }),
      }),
    ],
    zIndex: 999,
  })

  map = new OlMap({
    target: mapElement.value,
    layers: [amapLayer, satelliteLayer, terrain3dLayer, heatmapLayer, vectorLayer, highlightLayer],
    view: new View({ center: [118.58, 29.53], projection: 'EPSG:4326', zoom: 11 }),
  })
  map.on('movestart', () => {
    if (!isProgrammaticMove) highlightSource.clear()
  })
  map.on('click', (event) => {
    const feature = map.forEachFeatureAtPixel(event.pixel, (candidate, layer) =>
      layer === vectorLayer ? candidate : undefined,
    )
    if (feature) {
      selectFeature(feature)
    } else {
      selectedNode.value = null
      disposeChart()
    }
  })
  map.on('pointermove', (event) => {
    map.getTargetElement().style.cursor = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : ''
  })

  contextMenuHandler = (event) => {
    event.preventDefault()
    const pixel = map.getEventPixel(event)
    void addNodeAtCoordinate(map.getCoordinateFromPixel(pixel))
  }
  map.getViewport().addEventListener('contextmenu', contextMenuHandler)
  resizeHandler = () => {
    if (chart) chart.resize()
    if (map) map.updateSize()
  }
  window.addEventListener('resize', resizeHandler)

  await nextTick()
  map.updateSize()
  await pullStreamData()
  pollingTimer = window.setInterval(pullStreamData, 3000)
})

onUnmounted(() => {
  if (pollingTimer) window.clearInterval(pollingTimer)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (map && contextMenuHandler)
    map.getViewport().removeEventListener('contextmenu', contextMenuHandler)
  disposeChart()
  if (map) {
    map.setTarget(undefined)
    map = null
  }
})
</script>

<style scoped>
.gis-layout {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  background: #edf2f5;
}
#ol-map {
  width: 100%;
  height: 100%;
}
.toolbar-card,
.hud-card {
  position: absolute;
  z-index: 10;
  border: 1px solid rgba(28, 47, 66, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 5px 20px rgba(22, 40, 58, 0.16);
  font-family: Arial, 'Microsoft YaHei', sans-serif;
}
.toolbar-card {
  top: 16px;
  left: 16px;
  width: 330px;
  padding: 14px;
}
.tool-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.tool-label {
  flex: 0 0 82px;
  color: #43505e;
  font-size: 12px;
  font-weight: 700;
}
.layer-buttons {
  display: flex;
  flex: 1;
  justify-content: flex-end;
  gap: 5px;
}
.layer-buttons button,
.search-input-wrap button {
  border: 1px solid #d8e0e7;
  border-radius: 5px;
  padding: 6px 9px;
  background: #fff;
  color: #43505e;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}
.layer-buttons button.active,
.search-input-wrap button {
  border-color: #238b57;
  background: #238b57;
  color: #fff;
}
.layer-buttons button:hover,
.search-input-wrap button:hover {
  filter: brightness(1.06);
}
.layer-buttons .terrain-3d-btn {
  border-color: #f4d28a;
  background: #fff9e9;
  color: #ad6911;
}
.layer-buttons .terrain-3d-btn.active {
  border-color: #e39a28;
  background: #e39a28;
  color: #fff;
}
.tool-group select {
  width: 190px;
  border: 1px solid #d8e0e7;
  border-radius: 5px;
  padding: 6px 8px;
  color: #3d4955;
  background: #fff;
  font-size: 12px;
}
.heatmap-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 190px;
  color: #56616b;
  font-size: 12px;
  cursor: pointer;
}
.heatmap-toggle input {
  accent-color: #238b57;
}
.tool-divider,
.hud-card hr {
  border: 0;
  border-top: 1px solid #e6ebef;
  margin: 11px 0;
}
.search-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
}
.search-label {
  color: #3f4b56;
  font-size: 12px;
  font-weight: 700;
}
.search-input-wrap {
  display: flex;
  gap: 6px;
}
.search-input-wrap input {
  min-width: 0;
  flex: 1;
  border: 1px solid #d8e0e7;
  border-radius: 5px;
  padding: 7px 9px;
  outline: none;
  font-size: 12px;
}
.search-input-wrap input:focus {
  border-color: #238b57;
  box-shadow: 0 0 0 2px rgba(35, 139, 87, 0.12);
}
.coordinate-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
}
.coordinate-inputs {
  display: flex;
  gap: 6px;
}
.coordinate-inputs input {
  min-width: 0;
  width: 0;
  flex: 1;
  border: 1px solid #d8e0e7;
  border-radius: 5px;
  padding: 7px 8px;
  outline: none;
  font-size: 12px;
}
.coordinate-inputs input:focus {
  border-color: #238b57;
  box-shadow: 0 0 0 2px rgba(35, 139, 87, 0.12);
}
.coordinate-inputs button {
  flex: 0 0 auto;
  border: 1px solid #238b57;
  border-radius: 5px;
  padding: 6px 9px;
  background: #238b57;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}
.coordinate-hint {
  color: #8a969e;
  font-size: 11px;
}
.hud-card {
  top: 16px;
  right: 16px;
  width: min(360px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  overflow-y: auto;
  padding: 17px;
}
.hud-card h3 {
  margin: 0 0 5px;
  color: #24333f;
  font-size: 17px;
}
.hud-card h4,
.hud-card h5 {
  margin: 10px 0 6px;
  color: #3c4d5a;
  font-size: 13px;
}
.hud-card h5 {
  color: #226b9a;
}
.status {
  display: flex;
  align-items: center;
  margin: 0;
  color: #71808c;
  font-size: 11px;
}
.pulse-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  margin-right: 7px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.12);
}
.pulse-dot.offline {
  background: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.12);
}
.placeholder {
  color: #667581;
  font-size: 12px;
  line-height: 1.75;
}
.placeholder p {
  margin: 7px 0;
}
.placeholder b {
  color: #334451;
}
.data-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.data-grid {
  flex: 1;
}
.data-grid p,
.factor-details p {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 7px 0;
  color: #4d5a64;
  font-size: 12px;
}
.data-grid p b {
  color: #596773;
}
.score-num {
  color: #238b57;
  font-size: 17px;
  font-weight: 700;
}
.badge {
  border-radius: 4px;
  padding: 2px 7px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.badge-high {
  background: #52a86b;
}
.badge-suitable {
  background: #3188c5;
}
.badge-unsuitable {
  background: #e56c68;
}
.delete-btn {
  flex: 0 0 auto;
  margin-top: 4px;
  border: 1px solid #ffc9c5;
  border-radius: 5px;
  padding: 6px 8px;
  background: #fff3f1;
  color: #d84d4d;
  font-size: 11px;
  cursor: pointer;
}
.delete-btn:hover {
  background: #e35e58;
  color: #fff;
}
.amap-address-box {
  margin-top: 9px;
  border-radius: 6px;
  padding: 9px 10px;
  background: #f2f5f6;
  color: #53616b;
  font-size: 12px;
}
.address-text {
  margin: 5px 0 0;
  color: #283641;
  line-height: 1.45;
}
#factor-chart {
  width: 100%;
  height: 170px;
}
.factor-details {
  border: 1px solid #edf0f2;
  border-radius: 6px;
  padding: 5px 10px;
  background: #fafbfb;
}
.factor-details b {
  color: #35434d;
}
.weather-panel,
.poi-panel {
  margin-top: 10px;
  border: 1px solid #d4e8f3;
  border-radius: 7px;
  padding: 8px 10px;
  background: #f1f9fd;
}
.poi-panel {
  border-color: #d7ebd0;
  background: #f5fbf2;
}
.weather-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}
.weather-grid p {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  margin: 2px 0;
  color: #536b7c;
  font-size: 11px;
}
.weather-grid b {
  color: #31556e;
}
.poi-panel ul {
  margin: 3px 0 0;
  padding: 0;
  list-style: none;
}
.poi-clickable-item {
  margin: 3px 0;
  border-radius: 4px;
  padding: 5px 6px;
  color: #438044;
  font-size: 11px;
  cursor: pointer;
}
.poi-clickable-item:hover {
  background: rgba(67, 128, 68, 0.1);
}
@media (max-width: 760px) {
  .toolbar-card {
    top: 10px;
    left: 10px;
    width: min(330px, calc(100% - 20px));
  }
  .hud-card {
    top: auto;
    right: 10px;
    bottom: 10px;
    width: min(360px, calc(100% - 20px));
    max-height: 44%;
  }
}
</style>

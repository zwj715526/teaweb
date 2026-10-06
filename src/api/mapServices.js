export const AMAP_KEY =
  import.meta.env.VITE_AMAP_KEY || 'd9343b39443c43a68013ed8782d09c91'

const readJson = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('外部地图服务请求失败')
  return response.json()
}

export const fetchAmapEcoData = async (longitude, latitude, key = AMAP_KEY) => {
  const fallback = {
    address: '无法识别的无人区坐标',
    weatherInfo: null,
    poiList: [],
  }
  if (!key) return fallback

  try {
    const regeoParams = new URLSearchParams({
      key,
      location: longitude + ',' + latitude,
    })
    const regeoData = await readJson(
      'https://restapi.amap.com/v3/geocode/regeo?' + regeoParams.toString(),
    )
    const address = regeoData.regeocode?.formatted_address || fallback.address
    const adcode = regeoData.regeocode?.addressComponent?.adcode

    let weatherInfo = null
    if (adcode) {
      const weatherParams = new URLSearchParams({
        key,
        city: adcode,
        extensions: 'base',
      })
      const weatherData = await readJson(
        'https://restapi.amap.com/v3/weather/weatherInfo?' + weatherParams.toString(),
      )
      weatherInfo = weatherData.lives?.[0] || null
    }

    const poiParams = new URLSearchParams({
      key,
      location: longitude + ',' + latitude,
      keywords: '水库|河流|湖泊|村委会|农业',
      radius: '3000',
      page: '1',
      offset: '3',
    })
    const poiData = await readJson(
      'https://restapi.amap.com/v3/place/around?' + poiParams.toString(),
    )
    const poiList = (poiData.pois || []).map((poi) => ({
      text: poi.name + '（直线距离 ' + poi.distance + ' 米）',
      location: poi.location,
    }))
    return { address, weatherInfo, poiList }
  } catch (error) {
    console.error('高德地图信息查询失败:', error)
    return { address: '高德地图信息暂不可用', weatherInfo: null, poiList: [] }
  }
}

export const searchAmapAddress = async (keyword, key = AMAP_KEY) => {
  if (!key) throw new Error('缺少高德地图 Key')
  const params = new URLSearchParams({ key, keywords: keyword, offset: '1', page: '1' })
  const data = await readJson('https://restapi.amap.com/v3/place/text?' + params.toString())
  return data.pois?.[0]?.location || null
}

export const fetchRealElevation = async (longitude, latitude) => {
  try {
    const params = new URLSearchParams({ locations: latitude + ',' + longitude })
    const data = await readJson('https://api.open-elevation.com/v1/lookup?' + params.toString())
    const elevation = data.results?.[0]?.elevation
    if (Number.isFinite(Number(elevation))) return Math.round(Number(elevation))
  } catch (error) {
    console.warn('高程服务暂不可用，使用估算值:', error)
  }

  const distanceSquared =
    Math.pow(longitude - 118.55, 2) + Math.pow(latitude - 29.5, 2)
  return Math.round(180 + 550 * Math.exp(-distanceSquared / 0.04))
}

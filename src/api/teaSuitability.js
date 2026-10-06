const API_BASE_URL = (
  import.meta.env.VITE_TEA_API_BASE_URL || 'http://localhost:3000/api'
).replace(/\/+$/, '')

const request = async (path, options = {}) => {
  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }
  if (!response.ok) {
    throw new Error(data?.error || '后端请求失败（HTTP ' + response.status + '）')
  }
  return data
}

export const fetchTeaSuitability = () => request('/tea-suitability')

export const addTeaNode = (node) =>
  request('/add-node', {
    method: 'POST',
    body: JSON.stringify(node),
  })

export const deleteTeaNode = (id) =>
  request('/delete-node/' + encodeURIComponent(id), { method: 'DELETE' })

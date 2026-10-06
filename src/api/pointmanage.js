import request from '@/utils/request'

export const getPointList = () => {
  return request.get('/api/tea-suitability/getPointList')
}

export const getPointlabel = () => {
  return request.get('/api/tea-suitability/getPointlabel')
}

export const getPointpage = (currentPage, pageSize) => {
  return request.get('/api/tea-suitability/page', {
    params: {
      currentPage,
      pageSize,
    },
  })
}

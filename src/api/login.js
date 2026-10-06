import request from '@/utils/request.js'

//注册
export const register = (username, password) => {
  return request.post('/api/register', {
    name: username,
    password,
  })
}

//登录
export const login = (username, password) => {
  return request.post('/api/login', {
    name: username,
    password,
  })
}

//获取用户信息
export const userInfo = (username) => {
  return request.get('/api/getUserInfo', {
    params: { name: username },
  })
}

//更新用户信息
export const updateUserInfo = (username, password, avatar) => {
  return request.post('/api/update', {
    name: username,
    password,
    avatar,
  })
}

//删除用户
export const deleteUser = (username) => {
  return request.delete('/api/delete', {
    data: { name: username },
  })
}

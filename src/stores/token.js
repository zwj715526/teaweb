import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户模块
export const useUserStore = defineStore(
  'big-user',
  () => {
    const token = ref('') // 定义 token
    const username = ref('')
    const setToken = (t) => (token.value = t) // 设置 token
    const setUsername = (name) => (username.value = name)

    return { token, username, setToken, setUsername }
  },
  {
    persist: true, // 持久化
  },
)

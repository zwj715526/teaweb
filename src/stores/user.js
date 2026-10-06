import { defineStore } from 'pinia'
import { ref } from 'vue'
export const UserStore = defineStore(
  'user',
  () => {
    const username = ref('')

    function setUser(username) {
      this.username = username
    }
    return { username, setUser }
  },
  {
    persist: true, // 持久化
  },
)

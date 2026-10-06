<script setup>
import { ref } from 'vue'
import 'element-plus/dist/index.css'
import { UserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { userInfo } from '@/api/login'

const userStore = UserStore()

const { username } = storeToRefs(userStore)
let password = ref('')
const getpassword = async () => {
  const res = await userInfo(username.value)
  password.value = res.data.data[0].password
}
getpassword()
</script>

<template>
  <el-card class="container">
    <template #header>
      <span textsiz="medium">用户信息:</span>
    </template>
    <el-form ref="form" :model="formdata" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="username" :placeholder="username" disabled></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="password" :placeholder="password" disabled></el-input>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.container {
  min-height: 80vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.el-form {
  margin: 0 auto;
  padding: 0;
}
.el-form-item {
  margin: 15px 0;
  margin-bottom: 40px;
}

.el-input {
  width: 250px;
}
</style>

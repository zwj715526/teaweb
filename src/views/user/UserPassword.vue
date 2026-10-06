<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { UserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { userInfo, updateUserInfo } from '@/api/login'

const userStore = UserStore()

const { username } = storeToRefs(userStore)
const password = ref('')
const avatarurl = ref('')
const getpassword = async () => {
  const res = await userInfo(username.value)
  password.value = res.data.data[0].password
  avatarurl.value = res.data.data[0].avatar
}
getpassword()
const newPassword = ref('')
const rePassword = ref('')
const rePasswordInput = ref(null)
const formdata = ref({
  password,
  newPassword,
  rePassword,
})
const focusRePassword = () => {
  rePasswordInput.value.focus()
}

const validatePass2 = (rule, value, callback) => {
  if (value !== newPassword.value) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
const rules = {
  newPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
  ],
  rePassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
    { validator: validatePass2, trigger: 'blur' },
  ],
}
const updatePassword = async () => {
  await updateUserInfo(userStore.username, newPassword.value, avatarurl.value)
  ElMessage.success('修改密码成功')
  getpassword()
  newPassword.value = ''
  rePassword.value = ''
}
</script>

<template>
  <el-card class="container">
    <template #header>
      <span textsiz="large">用户密码:</span>
    </template>
    <el-form ref="form" :model="formdata" label-width="80px" :rules="rules">
      <el-form-item label="密码" label-width="120px" prop="password">
        <el-input v-model="password" :placeholder="password" disabled></el-input>
      </el-form-item>
      <el-form-item label="新密码" label-width="120px" prop="newPassword">
        <el-input
          v-model="newPassword"
          placeholder="请输入新密码"
          ref="newPasswordInput"
          @keydown.enter="focusRePassword"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" label-width="120px" prop="rePassword">
        <el-input
          v-model="rePassword"
          placeholder="请再次输入新密码"
          ref="rePasswordInput"
          @keydown.enter="updatePassword"
        ></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="updatePassword">确认修改密码</el-button>
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
  width: 800px;
  margin: 15px 0;
  margin-bottom: 40px;
}
.el-input {
  width: 250px;
}
</style>

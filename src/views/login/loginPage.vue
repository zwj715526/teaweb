<script setup>
// oxlint-disable no-unused-expressions
import { ref, watch } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { register, login } from '@/api/login.js'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { useUserStore } from '@/stores/token.js'
import { UserStore } from '@/stores/user.js'
import { useRouter } from 'vue-router'
const isRegister = ref(false)
const loginFormRef = ref()
const registerFormRef = ref()
const formModel = ref({
  username: '',
  password: '',
  repassword: '', // 注册时的确认密码
})
const preregisterRules = async () => {
  await registerFormRef.value.validate()
  try {
    const res = await register(formModel.value.username, formModel.value.password)
    ElMessage.success(res.data.message || '注册成功')
    isRegister.value = false
  } catch (e) {
    // 错误提示已由 request 拦截器统一弹出
    console.log(e)
  }
}
const useStore = useUserStore()
const userStore = UserStore()
const router = useRouter()
const preloginRules = async () => {
  await loginFormRef.value.validate()
  try {
    const res = await login(formModel.value.username, formModel.value.password)
    ElMessage.success(res.data.message || '登录成功')
    useStore.setToken(res.data.token)
    useStore.setUsername(res.data.name || formModel.value.username)
    userStore.setUser(res.data.name || formModel.value.username, formModel.value.password, '')
    console.log('跳转前token：', useStore.token)
    router.push('/')
    console.log('执行了router.push')
  } catch (e) {
    // 错误提示已由 request 拦截器统一弹出
    console.log(e)
  }
}
const validatePass2 = (rule, value, callback) => {
  if (value !== formModel.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
  ],
  repassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
    { validator: validatePass2, trigger: 'blur' },
  ],
})
watch(isRegister, () => {
  formModel.value = {
    username: '',
    password: '',
    repassword: '',
  }
})
const passwordref = ref(null)
const repasswordref = ref(null)
const nameref = () => {
  passwordref.value.focus()
}
const repassword = () => {
  if (isRegister.value) {
    repasswordref.value.focus()
  } else {
    preloginRules()
  }
}
const submit = () => {
  preregisterRules()
}
</script>

<template>
  <div>
    <el-container>
      <el-row class="login-page">
        <el-col :span="12" class="bg"> </el-col>
        <el-col :span="6" :offset="3" class="form">
          <el-form
            :model="formModel"
            :rules="rules"
            ref="registerFormRef"
            size="large"
            autocomplete="off"
            v-if="isRegister"
          >
            <el-form-item>
              <h1>注册</h1>
            </el-form-item>
            <el-form-item prop="username">
              <el-input
                v-model="formModel.username"
                :prefix-icon="User"
                placeholder="请输入用户名"
                @keydown.enter="nameref"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="formModel.password"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入密码"
                ref="passwordref"
                @keydown.enter="repassword"
              ></el-input>
            </el-form-item>
            <el-form-item prop="repassword">
              <el-input
                v-model="formModel.repassword"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入再次密码"
                ref="repasswordref"
                @keydown.enter="submit"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button class="button" type="primary" @click="preregisterRules" auto-insert-space>
                注册
              </el-button>
            </el-form-item>
            <el-form-item class="flex">
              <el-link type="info" :underline="false" @click="isRegister = false"> ← 返回 </el-link>
            </el-form-item>
          </el-form>
          <el-form
            :model="formModel"
            :rules="rules"
            ref="loginFormRef"
            size="large"
            autocomplete="off"
            v-else
          >
            <el-form-item>
              <h1>登录</h1>
            </el-form-item>
            <el-form-item prop="username">
              <el-input
                v-model="formModel.username"
                :prefix-icon="User"
                placeholder="请输入用户名"
                @keydown.enter="nameref"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="formModel.password"
                name="password"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入密码"
                ref="passwordref"
                @keydown.enter="repassword"
              ></el-input>
            </el-form-item>
            <el-form-item class="flex">
              <div class="flex">
                <el-checkbox>记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button class="button" type="primary" @click="preloginRules" auto-insert-space
                >登录</el-button
              >
            </el-form-item>
            <el-form-item class="flex">
              <el-link type="info" :underline="false" @click="isRegister = true"> 注册 → </el-link>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-container>
    <router-view></router-view>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  width: 100%;
  background-color: #fff;
  .bg {
    background: linear-gradient(135deg, #409eff, #001529);
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    justify-content: center;
    flex-direction: column;
    user-select: none;
    /* padding: 0 30px; */
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>

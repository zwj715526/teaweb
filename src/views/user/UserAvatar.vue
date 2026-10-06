<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { UserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { userInfo, updateUserInfo } from '@/api/login'
import { Plus } from '@element-plus/icons-vue'

const userStore = UserStore()

const { username } = storeToRefs(userStore)
const avatarurl = ref('')
const password = ref('')
const getAvatar = async () => {
  const res = await userInfo(username.value)
  avatarurl.value = res.data.data[0].avatar
  password.value = res.data.data[0].password
}
getAvatar()

const AvatarChange = (file) => {
  const reader = new FileReader()
  reader.readAsDataURL(file.raw) // raw 是原文件对象
  reader.onload = () => {
    avatarurl.value = reader.result // 得到 data:image/xxx;base64,.... 字符串
  }
}
const updateAvatar = async () => {
  await updateUserInfo(username.value, password.value, avatarurl.value)
  ElMessage.success('修改成功')
  getAvatar()
  location.reload()
}
</script>

<template>
  <el-card class="container">
    <template #header>
      <span textsiz="large">用户头像:</span>
    </template>
    <el-upload
      class="avatar-uploader"
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="AvatarChange"
    >
      <img v-if="avatarurl" :src="avatarurl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <el-button type="primary" @click="updateAvatar">确认修改头像</el-button>
  </el-card>
</template>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>

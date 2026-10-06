<script setup>
import {
  Management,
  Promotion,
  UserFilled,
  User,
  Crop,
  EditPen,
  SwitchButton,
  CaretBottom,
} from '@element-plus/icons-vue'
import { ref } from 'vue'
import { UserStore } from '@/stores/user'
import { useUserStore } from '@/stores/token.js'
import { storeToRefs } from 'pinia'
import { userInfo } from '@/api/login'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DeleteFilled } from '@element-plus/icons-vue'
import { deleteUser } from '@/api/login.js'
const router = useRouter()

const userStore = UserStore()
const useuserStore = useUserStore()
const { username } = storeToRefs(userStore)
const avatarurl = ref('')
const getAvatar = async () => {
  const res = await userInfo(username.value)
  avatarurl.value = res.data.data[0].avatar
}
getAvatar()

const handleCommand = async (command) => {
  const routeMap = {
    profile: '/user/userprofile',
    avatar: '/user/useravatar',
    password: '/user/userpassword',
    logout: '/login',
    delete: '/login',
  }
  if (command === 'logout') {
    useuserStore.setToken('')
    useuserStore.setUsername('')
    userStore.setUser('')
    ElMessage.success('退出成功')
    router.push('/login')
    return
  }
  if (command === 'delete') {
    try {
      await ElMessageBox.confirm('注销后账户将被删除且不可恢复，确定继续吗？', '警告', {
        type: 'warning',
        confirmButtonText: '确认注销',
        cancelButtonText: '取消',
      })
      await deleteUser(username.value)
      useuserStore.setToken('')
      useuserStore.setUsername('')
      userStore.setUser('')
      ElMessage.success('注销成功')
      router.push('/login')
    } catch (e) {
      if (e !== 'cancel' && e !== 'close') {
        ElMessage.error('注销失败，请重试')
      }
    }
    return
  }
  router.push(routeMap[command])
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="el-aside__logo"></div>
      <el-menu
        active-text-color="#ffd04b"
        background-color="rgb(155, 216, 155)"
        :default-active="$route.path"
        text-color="black"
        router
      >
        <el-menu-item index="/point/pointchannel">
          <el-icon><Management /></el-icon>
          <span>点位展示</span>
        </el-menu-item>
        <el-menu-item index="/point/pointmanage">
          <el-icon><Promotion /></el-icon>
          <span>点位管理</span>
        </el-menu-item>
        <el-sub-menu index="/user">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>个人中心</span>
          </template>
          <el-menu-item index="/user/UserProfile">
            <el-icon><User /></el-icon>
            <span>基本资料</span>
          </el-menu-item>
          <el-menu-item index="/user/UserAvatar">
            <el-icon><Crop /></el-icon>
            <span>更换头像</span>
          </el-menu-item>
          <el-menu-item index="/user/UserPassword">
            <el-icon><EditPen /></el-icon>
            <span>重置密码</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div>
          用户：<strong>{{ userStore.username || '未登录' }}</strong>
        </div>
        <el-dropdown placement="bottom-end" @command="handleCommand">
          <span class="el-dropdown__box">
            <el-avatar :src="avatarurl || avatar" />
            <el-icon><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile" :icon="User">基本资料</el-dropdown-item>
              <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
              <el-dropdown-item command="password" :icon="EditPen">重置密码</el-dropdown-item>
              <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
              <el-dropdown-item command="delete" :icon="DeleteFilled">注销账户</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>茶树分析管理</el-footer>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  .el-aside {
    background-color: white;
    &__logo {
      height: 120px;
      background: url('../../assets/logo.jpg') no-repeat center / 120px auto;
    }
    .el-menu {
      border-right: none;
    }
  }
  .el-header {
    background-color: rgb(155, 216, 155);
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-dropdown__box {
      display: flex;
      align-items: center;
      .el-icon {
        color: #999;
        margin-left: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }
  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
  }
}
</style>

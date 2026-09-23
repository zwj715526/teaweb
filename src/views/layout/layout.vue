<template>
  <el-container class="layout">
    <el-aside width="200px" class="aside">
      <div class="logo">test 管理后台</div>
      <el-menu router :default-active="$route.path">
        <el-menu-item index="/user/userName">用户管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">欢迎使用</el-header>
      <el-main>
        <!-- 子页面渲染位置 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
// 布局页：侧边栏 + 顶栏 + 内容区
</script>

<style scoped>
.layout {
  height: 100vh;
}
.aside {
  background-color: #001529;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-weight: bold;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  line-height: 60px;
}
</style>

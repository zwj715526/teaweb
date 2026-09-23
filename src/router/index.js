import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/layout/layout.vue'),
      children: [
        // 子路由path不加 /（以下user页面尚未创建，创建后取消注释）
        // {
        //   path: 'user/userName',
        //   name: 'userName',
        //   component: () => import('@/views/user/userName.vue'),
        // },
        // {
        //   path: 'user/userPassword',
        //   name: 'userPassword',
        //   component: () => import('@/views/user/userPassword.vue'),
        // },
        // {
        //   path: 'user/userAvatar',
        //   name: 'userAvatar',
        //   component: () => import('@/views/user/userAvatar.vue'),
        // },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/loginPage.vue'),
    },
  ],
})
export default router

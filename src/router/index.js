import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/layout/layoutPage.vue'),
      redirect: '/point/pointchannel',
      children: [
        {
          path: '/point/pointchannel',
          name: 'pointchannel',
          component: () => import('@/views/point/PointChannel.vue'),
        },
        {
          path: '/point/pointmanage',
          name: 'pointmanage',
          component: () => import('@/views/point/PointManage.vue'),
        },
        {
          path: '/user/useravatar',
          name: 'useravatar',
          component: () => import('@/views/user/UserAvatar.vue'),
        },
        {
          path: '/user/userpassword',
          name: 'userpassword',
          component: () => import('@/views/user/UserPassword.vue'),
        },
        {
          path: '/user/userprofile',
          name: 'userprofile',
          component: () => import('@/views/user/UserProfile.vue'),
        },
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

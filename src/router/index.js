import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/HomePage.vue'), redirect: '/template/1', children: [
      { path: 'template/:id', component: () => import('@/pages/Wheel.vue') }
    ]},
    { path: '/test', component: () => import('@/pages/test.vue') }
  ],
})

export default router

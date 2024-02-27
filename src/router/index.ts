import { createRouter, createWebHistory } from 'vue-router'
import ViewerView from '../views/ViewerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'viewer',
      component: ViewerView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/ping',
      name: 'ping',
      component:  () => import('../views/PingView.vue')
    }
  ]
})

export default router

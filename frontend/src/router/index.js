import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/booking',
    name: 'Booking',
    component: () => import('@/views/Booking.vue'),
    meta: { title: '在线预约' }
  },
  {
    path: '/booking/success/:id',
    name: 'BookingSuccess',
    component: () => import('@/views/BookingSuccess.vue'),
    meta: { title: '预约成功' }
  },
  {
    path: '/my',
    name: 'MyAppointments',
    component: () => import('@/views/MyAppointments.vue'),
    meta: { title: '我的预约' }
  },
  {
    path: '/review/:id',
    name: 'Review',
    component: () => import('@/views/Review.vue'),
    meta: { title: '服务评价' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { title: '管理后台' },
    redirect: '/admin/schedule',
    children: [
      {
        path: 'schedule',
        name: 'Schedule',
        component: () => import('@/views/admin/Schedule.vue'),
        meta: { title: '排期管理' }
      },
      {
        path: 'appointments',
        name: 'AdminAppointments',
        component: () => import('@/views/admin/Appointments.vue'),
        meta: { title: '预约管理' }
      },
      {
        path: 'reviews',
        name: 'AdminReviews',
        component: () => import('@/views/admin/Reviews.vue'),
        meta: { title: '评价管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 殡仪馆告别仪式预约管理平台` : '殡仪馆告别仪式预约管理平台'
  next()
})

export default router

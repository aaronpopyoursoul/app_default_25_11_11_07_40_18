import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import ChatView from '@/views/ChatView.vue'
import CsrResumeView from '@/views/CsrResumeView.vue'
import BlankView from '@/views/BlankView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/chat' },
      { path: 'chat', name: 'chat', component: ChatView, meta: { title: '客戶財力智能分析' } },
      { path: 'csr', name: 'csr', component: CsrResumeView, meta: { title: 'CSR 智能履歷評估' } },
      { path: 'blank', name: 'blank', component: BlankView, meta: { title: 'blank page' } }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })
export default router

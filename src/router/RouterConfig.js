import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import SalaryComposition from '@/views/salaryComposition/SalaryComposition.vue'
import { path } from '@/utils/path'
import SalarycompositionSystem from '@/views/salaryCompositionSystem/SalarycompositionSystem.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: path.salarycomposition,
    children: [
      {
        path: path.salarycomposition,
        component: SalaryComposition,
      },
      {
        path: path.systemCategory,
        component: SalarycompositionSystem,
      },
      // {
      //   path: '/:pathMatch(.*)*',
      //   component: NotFoundView,
      // },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})

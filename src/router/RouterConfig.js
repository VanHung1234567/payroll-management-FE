import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import SalaryComposition from '@/views/salaryComposition/SalaryComposition.vue'
import { path } from '@/utils/path'
import SalarycompositionSystem from '@/views/salaryCompositionSystem/SalarycompositionSystem.vue'
import DashBoard from '@/views/dashboard/DashBoard.vue'
import SalaryTemplate from '@/views/salaryTemplate/SalaryTemplate.vue'
import FormSalaryComposition from '@/views/salaryComposition/FormSalaryComposition.vue'
import NotFoundView from '@/views/NotFoundView.vue'

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
      {
        path: path.dashboard,
        component: DashBoard,
      },
      {
        path: path.salaryTemplate,
        component: SalaryTemplate,
      },
      {
        path: path.add,
        component: FormSalaryComposition,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundView,
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})

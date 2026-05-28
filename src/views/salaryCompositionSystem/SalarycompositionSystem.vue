<template>
  <div class="content-header">
    <RouterLink :to="path.salarycomposition" style="text-decoration: none">
      <MsTooltip
        content="Quay lại"
        hover-background="#dadce3"
        placement="bottom"
        hover-size="36px"
        font-size="12px"
        line-height="16px"
        offset="4px"
        class="header-action"
      >
        <div class="navbar-action">
          <div class="mi-arrow-left"></div>
        </div>
      </MsTooltip>
    </RouterLink>
    <h2 class="content-header__title">Danh mục thành phần lương của hệ thống</h2>
  </div>

  <GridOptions v-model:search="searchKeyword">
    <template #options>
      <MsSelect
        v-model="selectedSalaryCompositionTypeId"
        label="Loại thành phần"
        :options="salaryCompositionTypeOptions"
        label-key="typeName"
        value-key="salaryCompositionTypeID"
        :menu-width="210"
      />
    </template>
  </GridOptions>
  <GridTable
    gridKey="salary_composition_system"
    :data-api="SalaryCompositionSystemAPI"
    key-expr="salaryCompositionSystemID"
    :search="debouncedSearchKeyword"
    search-fields="SalaryCompositionCode,SalaryCompositionName"
    :filters="salaryCompositionSystemFilters"
  />
</template>

<script setup>
import GridOptions from '@/components/GridOptions.vue'
import GridTable from '@/components/GridTable.vue'
import MsTooltip from '@/components/MsTooltip.vue'
import { path } from '@/utils/path'
import SalaryCompositionSystemAPI from '@/apis/components/salaryCompositionSystem/SalaryCompositionSystem'
import SalaryCompositionTypeAPI from '@/apis/components/salaryCompositionType/SalaryCompositionType'
import { useQuery } from '@tanstack/vue-query'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import MsSelect from '@/components/MsSelect.vue'

const selectedSalaryCompositionTypeId = ref(null)
const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
let searchDebounceTimer = null

const { data: salaryCompositionTypeResponse } = useQuery({
  queryKey: ['salaryCompositionTypes'],
  queryFn: () => SalaryCompositionTypeAPI.getAll(),
})

const salaryCompositionTypeOptions = computed(() => [
  {
    typeName: 'Tất cả',
    salaryCompositionTypeID: null,
  },

  ...(salaryCompositionTypeResponse.value?.data?.data ?? []),
])

watch(searchKeyword, (value) => {
  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = window.setTimeout(() => {
    debouncedSearchKeyword.value = value
  }, 300)
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }
})

const salaryCompositionSystemFilters = computed(() => {
  if (!selectedSalaryCompositionTypeId.value) return {}

  return {
    salaryCompositionTypeID: selectedSalaryCompositionTypeId.value,
  }
})
</script>

<style scoped>
.content-header {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.content-header__title {
  letter-spacing: 0.6px;
  font-size: 20px;
  font-weight: 700;
  line-height: 30px;
  margin-left: 8px;
}

.header-action {
  width: 36px;
  height: 36px;
}

.navbar-action {
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mi-arrow-left {
  width: 14px;
  display: inline-block;
  flex-shrink: 0;
  height: 12px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -203px -4px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}
</style>

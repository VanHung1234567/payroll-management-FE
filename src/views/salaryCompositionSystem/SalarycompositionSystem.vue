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

  <GridOptions v-model:search="searchKeyword" :bulk-mode="hasSelectedRows">
    <template #options>
      <MsSelect
        v-model="selectedSalaryCompositionTypeId"
        label="Loại thành phần"
        :options="salaryCompositionTypeOptions"
        label-key="typeName"
        value-key="salaryCompositionTypeID"
        :menu-width="166.21"
      />
    </template>
    <template #bulk-actions>
      <div class="bulk-actions">
        <div class="bulk-actions__count">
          <span>Đã chọn</span>
          <strong>{{ selectedRows.length }}</strong>
        </div>
        <button type="button" class="bulk-actions__clear" @click="clearSelectedRows">
          Bỏ chọn
        </button>
        <MsButton
          background-color="#FFFFFF"
          border-color="#D5D7DA"
          color="#101828"
          hover-background-color="#E9EAEB"
          hover-border-color="#D5D7DA"
          active-background-color="#D5D7DA"
          active-border-color="#D5D7DA"
          padding="0 12px"
          gap="4px"
        >
          <span class="mi-plus"></span>
          <span class="button-action-text">Đưa vào danh sách sử dụng</span>
        </MsButton>
      </div>
    </template>
  </GridOptions>
  <GridTable
    gridKey="salary_composition_system"
    :data-api="SalaryCompositionSystemAPI"
    key-expr="salaryCompositionSystemID"
    :search="debouncedSearchKeyword"
    :filters="salaryCompositionSystemFilters"
    :clear-selection-signal="clearSelectionSignal"
    :show-active-action="false"
    :show-add-action="true"
    :show-copy-action="false"
    :show-edit-action="false"
    :show-delete-action="false"
    @selection-change="selectedRows = $event"
  />
</template>

<script setup>
import GridOptions from '@/components/GridOptions.vue'
import GridTable from '@/components/GridTable.vue'
import MsButton from '@/components/MsButton.vue'
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
const selectedRows = ref([])
const clearSelectionSignal = ref(0)
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
const hasSelectedRows = computed(() => selectedRows.value.length > 0)

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

function clearSelectedRows() {
  clearSelectionSignal.value += 1
}
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

.ms-trash-red {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -100px -21px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #ff6161;
}

.ms-circle-orange {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -180px -40px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #f90 !important;
}

.ms-circle-check-green {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -141px -41px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #25b973 !important;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
}

.bulk-actions__count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-actions__count strong {
  font-weight: 700;
}

.bulk-actions__clear {
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #34b057;
  font: inherit;
  cursor: pointer;
  margin: 0 8px;
}

.button-action-text {
  white-space: nowrap;
  font-weight: 500;
}

.mi-plus {
  width: 20px;
  height: 14px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -240px -3px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}
</style>

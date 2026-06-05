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

  <MsGridOptions
    v-model:search="searchKeyword"
    grid-key="salary_composition_system"
    :bulk-mode="hasSelectedRows"
  >
    <template #options>
      <MsSelect
        v-model="selectedSalaryCompositionTypeId"
        label="Loại thành phần"
        :options="salaryCompositionTypeOptions"
        label-key="label"
        value-key="value"
        :menu-width="172"
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
          @click="openCopyFromSystemModal(selectedRows)"
        >
          <span class="mi-plus"></span>
          <span class="button-action-text">Đưa vào danh sách sử dụng</span>
        </MsButton>
      </div>
    </template>
  </MsGridOptions>
  <MsGridTable
    grid-key="salary_composition_system"
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
    @row-add="openCopyFromSystemModal([$event])"
  />

  <MsModal
    v-model="isCopyConfirmModalOpen"
    title="Thông báo"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    @confirm="confirmCopyFromSystem"
  >
    <span v-if="isSingleCopyRow">
      Bạn có chắc chắn muốn đưa thành phần lương mặc định
      <strong>{{ copyTargetName }}</strong>
      vào danh sách sử dụng không?
    </span>
    <span v-else>
      Bạn có chắc chắn muốn đưa các thành phần lương mặc định đã chọn vào danh sách sử dụng không?
    </span>
  </MsModal>
  <MsToast v-model="toast.visible" type="success" :message="toast.message" />
</template>

<script setup>
import MsButton from '@/components/MsButton.vue'
import MsModal from '@/components/MsModal.vue'
import MsTooltip from '@/components/MsTooltip.vue'
import { path } from '@/utils/path'
import SalaryCompositionAPI from '@/apis/components/salaryComposition/SalaryCompositionAPI'
import SalaryCompositionSystemAPI from '@/apis/components/salaryCompositionSystem/SalaryCompositionSystem'
import { SALARY_COMPOSITION_TYPE_OPTIONS } from '@/utils/constants'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import MsSelect from '@/components/MsSelect.vue'
import MsToast from '@/components/MsToast.vue'
import MsGridTable from '@/components/MsGridTable.vue'
import MsGridOptions from '@/components/MsGridOptions.vue'

const selectedSalaryCompositionTypeId = ref(null)
const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
const selectedRows = ref([])
const clearSelectionSignal = ref(0)
const copyRows = ref([])
const isCopyConfirmModalOpen = ref(false)
const toast = ref({
  visible: false,
  message: 'Thêm thành công',
})
const queryClient = useQueryClient()
let searchDebounceTimer = null

const salaryCompositionTypeOptions = computed(() => [
  {
    label: 'Tất cả',
    value: null,
  },

  ...SALARY_COMPOSITION_TYPE_OPTIONS,
])
const hasSelectedRows = computed(() => selectedRows.value.length > 0)
const isSingleCopyRow = computed(() => copyRows.value.length === 1)
const copyTargetName = computed(() => getSalaryCompositionSystemName(copyRows.value[0]))

const copyFromSystemMutation = useMutation({
  mutationFn: (rows) =>
    SalaryCompositionAPI.copyFromSystem({
      salaryCompositionSystemIDs: rows.map(getSalaryCompositionSystemId).filter(Boolean),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    clearSelectedRows()
    copyRows.value = []
    showToast('Thêm thành công')
  },
})

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
    salaryCompositionType: selectedSalaryCompositionTypeId.value,
  }
})

/// Bo chon cac dong dang chon tren grid.
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function clearSelectedRows() {
  clearSelectionSignal.value += 1
}

/// Mo modal xac nhan dua thanh phan he thong vao danh sach su dung.
/// <param name="rows">Danh sach dong du lieu can xu ly.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function openCopyFromSystemModal(rows) {
  const sourceRows = Array.isArray(rows) ? rows : (rows?.value ?? [rows])
  const nextRows = sourceRows.filter((row) => Boolean(row && getSalaryCompositionSystemId(row)))
  if (!nextRows.length) return
  copyRows.value = nextRows
  isCopyConfirmModalOpen.value = true
}

/// Xac nhan dua thanh phan he thong da chon vao danh sach su dung.
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function confirmCopyFromSystem() {
  if (!copyRows.value.length) return
  copyFromSystemMutation.mutate(copyRows.value)
}

/// Hien thi thong bao toast voi noi dung truyen vao.
/// <param name="message">Noi dung thong bao.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function showToast(message) {
  toast.value.visible = false
  toast.value.message = message
  nextTick(() => {
    toast.value.visible = true
  })
}

/// Lay Id thanh phan luong he thong tu dong du lieu.
/// <param name="row">Dong du lieu can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getSalaryCompositionSystemId(row) {
  return row?.salaryCompositionSystemID ?? row?.SalaryCompositionSystemID
}

/// Lay ten thanh phan luong he thong tu dong du lieu.
/// <param name="row">Dong du lieu can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getSalaryCompositionSystemName(row) {
  return (
    row?.salaryCompositionSystemName ??
    row?.SalaryCompositionSystemName ??
    row?.salaryCompositionName ??
    row?.SalaryCompositionName ??
    ''
  )
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

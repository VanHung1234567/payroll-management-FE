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

  <div class="salary-grid-layout">
    <div class="salary-grid-main">
      <MsGridOptions
        v-model:search="searchKeyword"
        grid-key="salary_composition_system"
        :bulk-mode="hasSelectedRows"
        :filter-active="hasAppliedAdvancedFilters"
        :filter-open="isAdvancedFilterOpen"
        @toggle-filter="toggleAdvancedFilter"
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

      <div v-if="appliedAdvancedFilterTags.length" class="advanced-filter-tags">
        <span
          v-for="tag in appliedAdvancedFilterTags"
          :key="tag.fieldName"
          class="advanced-filter-tag"
        >
          <span class="advanced-filter-tag__field">{{ tag.label }}</span>
          <span class="advanced-filter-tag__operator">{{ tag.operatorLabel }}</span>
          <span v-if="tag.valueLabel" class="advanced-filter-tag__value">{{ tag.valueLabel }}</span>
          <button
            type="button"
            class="advanced-filter-tag__close"
            @click="removeAdvancedFilter(tag.fieldName)"
          >
            <span class="mi-tag-close"></span>
          </button>
        </span>
      </div>

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
    </div>

    <MsGridAdvancedFilter
      v-model="isAdvancedFilterOpen"
      :fields="advancedFilterFields"
      :filters="advancedFilters"
      @apply="applyAdvancedFilters"
      @clear="clearAdvancedFilters"
    />
  </div>

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
import {
  SALARY_COMPOSITION_NATURE_OPTIONS,
  SALARY_COMPOSITION_TYPE_OPTIONS,
  SALARY_COMPOSITION_VALUE_TYPE_OPTIONS,
} from '@/utils/constants'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import MsSelect from '@/components/MsSelect.vue'
import MsToast from '@/components/MsToast.vue'
import MsGridTable from '@/components/MsGridTable.vue'
import MsGridOptions from '@/components/MsGridOptions.vue'
import MsGridAdvancedFilter from '@/components/MsGridAdvancedFilter.vue'

const selectedSalaryCompositionTypeId = ref(null)
const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
const selectedRows = ref([])
const clearSelectionSignal = ref(0)
const isAdvancedFilterOpen = ref(false)
const advancedFilters = ref([])
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
const hasAppliedAdvancedFilters = computed(() => advancedFilters.value.length > 0)
const taxTypeOptions = [
  { value: 1, label: 'Chịu thuế' },
  { value: 2, label: 'Miễn thuế toàn phần' },
  { value: 3, label: 'Miễn thuế một phần' },
]
const booleanOptions = [
  { value: 1, label: 'Có' },
  { value: 0, label: 'Không' },
]
const payslipDisplayTypeOptions = [
  { value: 1, label: 'Có' },
  { value: 2, label: 'Không' },
  { value: 3, label: 'Chỉ hiển thị nếu giá trị khác 0' },
]
const toAdvancedFilterOptions = (options) =>
  options.map((option) => ({
    ...option,
    value: option.value === null || option.value === undefined ? '' : String(option.value),
  }))
const advancedFilterFields = computed(() => [
  { fieldName: 'SalaryCompositionCode', label: 'Mã thành phần', type: 'text' },
  { fieldName: 'SalaryCompositionName', label: 'Tên thành phần', type: 'text' },
  {
    fieldName: 'SalaryCompositionType',
    label: 'Loại thành phần',
    type: 'enum',
    options: toAdvancedFilterOptions(SALARY_COMPOSITION_TYPE_OPTIONS),
  },
  {
    fieldName: 'Nature',
    label: 'Tính chất',
    type: 'enum',
    options: toAdvancedFilterOptions(SALARY_COMPOSITION_NATURE_OPTIONS),
  },
  { fieldName: 'TaxType', label: 'Chịu thuế', type: 'enum', options: toAdvancedFilterOptions(taxTypeOptions) },
  {
    fieldName: 'IsTaxReduction',
    label: 'Giảm trừ khi tính thuế',
    type: 'enum',
    options: toAdvancedFilterOptions(booleanOptions),
  },
  { fieldName: 'NormFormula', label: 'Định mức', type: 'text' },
  {
    fieldName: 'ValueType',
    label: 'Kiểu giá trị',
    type: 'enum',
    options: toAdvancedFilterOptions(SALARY_COMPOSITION_VALUE_TYPE_OPTIONS),
  },
  { fieldName: 'ValueFormula', label: 'Giá trị', type: 'text' },
  { fieldName: 'Description', label: 'Mô tả', type: 'text' },
  {
    fieldName: 'PayslipDisplayType',
    label: 'Hiển thị trên phiếu lương',
    type: 'enum',
    options: toAdvancedFilterOptions(payslipDisplayTypeOptions),
  },
])
const operatorLabelMap = {
  contains: 'Chứa',
  notContains: 'Không chứa',
  equals: 'Bằng',
  notEquals: 'Khác',
  startsWith: 'Bắt đầu bằng',
  endsWith: 'Kết thúc bằng',
  empty: 'Trống',
  notEmpty: 'Không trống',
}
const appliedAdvancedFilterTags = computed(() =>
  advancedFilters.value.map((filter) => {
    const field = advancedFilterFields.value.find((item) => item.fieldName === filter.fieldName)
    const valueOption = field?.options?.find((option) => option.value === filter.value)

    return {
      fieldName: filter.fieldName,
      label: field?.label || filter.fieldName,
      operatorLabel: operatorLabelMap[filter.operator] || filter.operator,
      valueLabel: valueOption?.label ?? (filter.value === '' ? '' : String(filter.value)),
    }
  }),
)

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
  const filters = {}

  if (selectedSalaryCompositionTypeId.value) {
    filters.salaryCompositionType = selectedSalaryCompositionTypeId.value
  }

  if (advancedFilters.value.length) {
    filters.advancedFilters = advancedFilters.value
  }

  return filters
})

/// Bo chon cac dong dang chon tren grid.
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function clearSelectedRows() {
  clearSelectionSignal.value += 1
}

/// Mo hoac dong panel bo loc nang cao.
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function toggleAdvancedFilter() {
  isAdvancedFilterOpen.value = !isAdvancedFilterOpen.value
}

/// Ap dung danh sach dieu kien bo loc nang cao vao grid.
/// <param name="filters">Danh sach dieu kien da chon.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function applyAdvancedFilters(filters) {
  advancedFilters.value = filters
  clearSelectedRows()
}

/// Xoa toan bo bo loc nang cao.
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function clearAdvancedFilters() {
  advancedFilters.value = []
  clearSelectedRows()
}

/// Xoa mot dieu kien bo loc nang cao theo field.
/// <param name="fieldName">Ten field can xoa bo loc.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function removeAdvancedFilter(fieldName) {
  advancedFilters.value = advancedFilters.value.filter((filter) => filter.fieldName !== fieldName)
  clearSelectedRows()
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

.salary-grid-layout {
  height: calc(100vh - 154px);
  min-height: 520px;
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.salary-grid-main {
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.salary-grid-main :deep(.ms-table-container) {
  flex: 1;
  min-height: 0;
}

.advanced-filter-tags {
  min-height: 36px;
  padding: 0px 16px 12px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  background: #fff;
  scrollbar-width: thin;
}

.advanced-filter-tags::-webkit-scrollbar {
  height: 6px;
}

.advanced-filter-tags::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #d5d7da;
}

.advanced-filter-tag {
  height: 24px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  background: #fafafa;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
  cursor: default;
  white-space: nowrap;
  flex-shrink: 0;
}

.advanced-filter-tag__field {
  color: #717680;
}

.advanced-filter-tag__operator {
  color: #0e9a62;
  font-weight: 600;
}

.advanced-filter-tag__value {
  color: #101828;
}

.advanced-filter-tag__close {
  width: 16px;
  height: 16px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
}

.mi-tag-close {
  width: 10px;
  height: 10px;
  display: inline-block;
  flex-shrink: 0;
  background-color: #717680;
  -webkit-mask-image: url('../../assets/images/ICON_4.svg');
  mask-image: url('../../assets/images/ICON_4.svg');
  -webkit-mask-position: -442px -56px;
  mask-position: -442px -56px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
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

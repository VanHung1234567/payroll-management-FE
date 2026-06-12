<template>
  <FormSalaryComposition
    v-if="isFormOpen"
    :key="formKey"
    :mode="formMode"
    :salary-composition-id="editingSalaryCompositionId"
    :initial-title="editingSalaryCompositionTitle"
    @close="closeForm"
    @saved="handleFormSaved"
    @deleted="handleFormDeleted"
  />
  <template v-else>
    <div class="content-header">
      <h2 class="content-header__title">Thành phần lương</h2>
      <div class="content-header__actions">
        <RouterLink :to="path.systemCategory" style="text-decoration: none">
          <MsButton
            background-color="#FFFFFF"
            border-color="#D5D7DA"
            color="#101828"
            gap="4px"
            hover-background-color="#E9EAEB"
            hover-border-color="#D5D7DA"
            active-background-color="#D5D7DA"
            active-border-color="#D5D7DA"
          >
            <div class="mi-rule"></div>
            <div class="system-category-text">Danh mục của hệ thống</div>
          </MsButton>
        </RouterLink>
        <div ref="addActionRef" class="container-action-add">
          <MsButton border-radius="8px 0 0 8px" width="88px" gap="6px" @click="openAddForm">
            <div class="mi-plus-white"></div>
            <div class="action-add-text">Thêm</div>
          </MsButton>
          <div class="div-division"><div class="div-division-child"></div></div>
          <MsButton
            width="32px"
            height="32px"
            min-width="32px"
            padding="0"
            border-radius="0 8px 8px 0"
            @click.stop="toggleAddMenu"
          >
            <div class="mi-chevron-down-white"></div>
          </MsButton>
          <div v-if="isAddMenuOpen" class="ms-menu__body">
            <button type="button" class="ms-menu-item" @click="openSystemPicker">
              Chọn từ danh mục của hệ thống
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="salary-grid-layout" :class="{ 'has-filter-panel': isAdvancedFilterOpen }">
      <div class="salary-grid-main">
        <MsGridOptions
          v-model:search="searchKeyword"
          grid-key="salary_composition"
          :bulk-mode="hasSelectedRows"
          :filter-active="hasAppliedAdvancedFilters"
          :filter-open="isAdvancedFilterOpen"
          @toggle-filter="toggleAdvancedFilter"
        >
          <template #options>
            <MsSelect v-model="selectedStatus" label="Trạng thái" :options="statusOptions" />

            <MsTreeSelect
              v-model="selectedOrganizationIds"
              :options="organizations"
              id-key="organizationID"
              parent-key="parentID"
              label-key="organizationName"
              placeholder="Tất cả đơn vị"
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
                v-if="selectedHasActive"
                background-color="#ffffff"
                border-color="#FF9900"
                color="#FF9900"
                hover-background-color="#FEF0C7"
                hover-border-color="#DC6803"
                active-background-color="#FEDF89"
                active-border-color="#B54708"
                gap="4px"
                padding="0 12px"
                @click="openBulkStatusModal(0)"
              >
                <span class="mi-circle-orange"></span>
                <span class="button-action-text">Ngừng theo dõi</span>
              </MsButton>
              <MsButton
                v-if="selectedHasInactive"
                background-color="#ffffff"
                border-color="#34B057"
                color="#34B057"
                hover-background-color="#A8D9C8"
                hover-border-color="#0A724B"
                active-background-color="#7CC7AE"
                active-border-color="#0B5A3D"
                gap="4px"
                padding="0 12px"
                @click="openBulkStatusModal(1)"
              >
                <span class="mi-circle-check-green"></span>
                <span class="button-action-text">Đang theo dõi</span>
              </MsButton>
              <MsButton
                background-color="#ffffff"
                border-color="#F04438"
                color="#F04438"
                hover-background-color="#FEE4E2"
                hover-border-color="#D92D20"
                active-background-color="#FECDCA"
                active-border-color="#B42318"
                gap="4px"
                padding="0 12px"
                @click="openBulkDeleteModal"
              >
                <span class="mi-trash-red"></span>
                <span class="button-action-text">Xóa</span>
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
            <span v-if="tag.valueLabel" class="advanced-filter-tag__value">{{
              tag.valueLabel
            }}</span>
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
          grid-key="salary_composition"
          :search="debouncedSearchKeyword"
          :filters="salaryCompositionFilters"
          :organization-options="organizations"
          :clear-selection-signal="clearSelectionSignal"
          @row-edit="openEditForm"
          @row-active="openStatusModal"
          @row-copy="openDuplicateForm"
          @row-delete="openDeleteModal"
          @selection-change="selectedRows = $event"
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

    <Teleport to="body">
      <div v-if="isSystemPickerOpen" class="ms-popup-overlay">
        <div class="ms-popup-container" @click.stop>
          <div class="ms-popup__header">
            <h3>Thêm từ danh mục của hệ thống</h3>
            <button type="button" class="ms-popup__close" @click="requestCloseSystemPicker">
              <span class="mi-close"></span>
            </button>
          </div>

          <div class="ms-popup__body">
            <div class="system-picker-options">
              <div class="system-picker-search">
                <MsInput
                  ref="systemPickerSearchInputRef"
                  v-model="systemPickerSearchKeyword"
                  placeholder="Tìm kiếm"
                >
                  <template #prefix>
                    <div class="mi-search"></div>
                  </template>
                </MsInput>
              </div>
              <MsSelect
                v-model="selectedSystemPickerTypeId"
                label="Loại thành phần"
                :options="normalizedSalaryCompositionTypeOptions"
                label-key="label"
                value-key="value"
                :menu-width="210"
              />
            </div>

            <div class="system-picker-grid">
              <MsGridTable
                grid-key="salary_composition_system_picker"
                config-grid-key="salary_composition_system"
                :data-api="SalaryCompositionSystemAPI"
                key-expr="salaryCompositionSystemID"
                :page-size="25"
                :search="debouncedSystemPickerSearchKeyword"
                :filters="systemPickerFilters"
                :clear-selection-signal="systemPickerClearSelectionSignal"
                :show-active-action="false"
                :show-copy-action="false"
                :show-edit-action="false"
                :show-delete-action="false"
                :show-add-action="false"
                @selection-change="systemPickerSelectedRows = $event"
              />
            </div>
          </div>

          <div class="ms-popup__footer">
            <MsButton
              background-color="#FFFFFF"
              border-color="#D5D7DA"
              color="#101828"
              hover-background-color="#E9EAEB"
              hover-border-color="#D5D7DA"
              active-background-color="#D5D7DA"
              active-border-color="#D5D7DA"
              padding="0 12px"
              width="80px"
              margin="0 8px 0 0"
              @click="requestCloseSystemPicker"
            >
              Hủy bỏ
            </MsButton>
            <MsButton
              width="80px"
              :disabled="!hasSystemPickerSelection || isCopyingFromSystem"
              @click="confirmSystemPicker"
            >
              Đồng ý
            </MsButton>
          </div>
        </div>
      </div>
    </Teleport>
  </template>
  <MsModal
    v-model="isStatusConfirmModalOpen"
    title="Chuyển trạng thái"
    confirm-text="Đồng ý"
    cancel-text="Hủy bỏ"
    @confirm="confirmChangeStatus"
  >
    <template v-if="statusTargetRows.length === 1">
      Bạn có chắc chắn muốn chuyển trạng thái thành phần lương
      <strong>{{ statusTargetName }}</strong>
      sang {{ nextStatusText }} không?
    </template>

    <template v-else>
      Bạn có chắc chắn muốn chuyển trạng thái các thành phần lương đã chọn sang
      {{ nextStatusText }} không?
    </template>
  </MsModal>
  <MsModal
    v-model="isBulkDeleteConfirmModalOpen"
    title="Xóa thành phần lương"
    width="960px"
    confirm-text="Xóa"
    cancel-text="Đóng"
    confirm-variant="danger"
    cancel-variant="primary-outline"
    :show-confirm="hasBulkDeletableRows"
    @confirm="confirmBulkDeleteSalaryCompositions"
  >
    <div class="bulk-delete-message">
      <template v-if="bulkDefaultNames.length">
        <strong>{{ bulkDefaultNames.join(', ') }}</strong>
        là giá trị mặc định của hệ thống nên không thể xóa.
      </template>
      <template v-if="bulkDefaultNames.length && hasBulkDeletableRows">
        Bạn có muốn xóa các thành phần lương còn lại không?
      </template>
      <template v-else-if="hasBulkDeletableRows">
        Bạn có chắc chắn muốn xóa các thành phần lương đã chọn không?
      </template>
    </div>
  </MsModal>
  <MsModal
    v-model="isDeleteConfirmModalOpen"
    title="Thông báo"
    confirm-text="Xóa"
    cancel-text="Hủy"
    confirm-variant="danger"
    @confirm="confirmDeleteSalaryComposition"
  >
    <span>
      Bạn có chắc chắn muốn xóa thành phần lương
      <strong>{{ deleteSalaryCompositionName }}</strong>
      không?
    </span>
  </MsModal>
  <MsModal
    v-model="isDefaultDeleteModalOpen"
    title="Thông báo"
    confirm-text="Đóng"
    :show-cancel="false"
  >
    Đây là thành phần lương mặc định của hệ thống nên không thể xóa. Vui lòng kiểm tra lại.
  </MsModal>
  <MsModal
    v-model="isSystemPickerDiscardModalOpen"
    title="Thoát và không lưu?"
    confirm-text="Thoát, không lưu"
    cancel-text="Ở lại"
    @confirm="confirmDiscardSystemPicker"
  >
    Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại.
  </MsModal>
  <MsToast v-model="toast.visible" type="success" :message="toast.message" />
</template>

<script setup lang="ts">
import FormSalaryComposition from '@/views/salaryComposition/FormSalaryComposition.vue'
import MsButton from '@/components/MsButton.vue'
import { path } from '@/utils/path'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import OrganizationAPI from '@/apis/components/organization/Organization.js'
import SalaryCompositionAPI from '@/apis/components/salaryComposition/SalaryCompositionAPI'
import SalaryCompositionSystemAPI from '@/apis/components/salaryCompositionSystem/SalaryCompositionSystem'
import {
  SALARY_COMPOSITION_NATURE_OPTIONS,
  SALARY_COMPOSITION_STATUS_OPTIONS,
  SALARY_COMPOSITION_TYPE_OPTIONS,
  SALARY_COMPOSITION_VALUE_TYPE_OPTIONS,
} from '@/utils/constants'
import MsInput from '@/components/MsInput.vue'
import MsModal from '@/components/MsModal.vue'
import MsSelect from '@/components/MsSelect.vue'
import MsToast from '@/components/MsToast.vue'
import MsTreeSelect from '@/components/MsTreeSelect.vue'
import MsGridAdvancedFilter from '@/components/MsGridAdvancedFilter.vue'
import MsGridTable from '@/components/MsGridTable.vue'
import MsGridOptions from '@/components/MsGridOptions.vue'

const selectedStatus = ref<number | string | null>(null)
const selectedOrganizationIds = ref<string[]>([])
const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
const selectedRows = ref<any[]>([])
const clearSelectionSignal = ref(0)
const isAdvancedFilterOpen = ref(false)
const ADVANCED_FILTER_STORAGE_KEY = 'salary_composition_advanced_filters'
const advancedFilters = ref<any[]>(readStoredAdvancedFilters(ADVANCED_FILTER_STORAGE_KEY))
const isAddMenuOpen = ref(false)
const addActionRef = ref<HTMLElement | null>(null)
const isSystemPickerOpen = ref(false)
const selectedSystemPickerTypeId = ref<number | string | null>(null)
const systemPickerSearchKeyword = ref('')
const systemPickerSearchInputRef = ref<InstanceType<typeof MsInput> | null>(null)
const debouncedSystemPickerSearchKeyword = ref('')
const systemPickerSelectedRows = ref<any[]>([])
const systemPickerClearSelectionSignal = ref(0)
const isSystemPickerDiscardModalOpen = ref(false)
const toast = ref({
  visible: false,
  message: 'Thêm thành công',
})
const isFormOpen = ref(false)
const formMode = ref<'add' | 'edit' | 'duplicate'>('add')
const editingSalaryCompositionId = ref<string | number | null>('')
const editingSalaryCompositionTitle = ref('')
const formKey = computed(() => `${formMode.value}-${editingSalaryCompositionId.value ?? 'new'}`)
const deleteTargetRow = ref<any | null>(null)
const isDeleteConfirmModalOpen = ref(false)
const isDefaultDeleteModalOpen = ref(false)
const isBulkDeleteConfirmModalOpen = ref(false)
const bulkDeleteRows = ref<any[]>([])
const statusTargetRows = ref<any[]>([])
const targetStatus = ref<number | null>(null)
const isStatusConfirmModalOpen = ref(false)
const queryClient = useQueryClient()
let searchDebounceTimer: number | null = null
let systemPickerSearchDebounceTimer: number | null = null

const { data: organizationResponse } = useQuery({
  queryKey: ['organizations'],
  queryFn: () => OrganizationAPI.getAll(),
})

/// Khởi tạo mutation xóa một thành phần lương và làm mới danh sách sau khi xóa.
/// CREATED BY: VVHung (11/6/2026)
const deleteSalaryCompositionMutation = useMutation({
  mutationFn: (id: string | number) => SalaryCompositionAPI.delete(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    clearSelectedRows()
    showToast('Xóa thành công')
  },
})

/// Khởi tạo mutation xóa nhiều thành phần lương đã chọn trên grid.
/// CREATED BY: VVHung (11/6/2026)
const bulkDeleteSalaryCompositionMutation = useMutation({
  mutationFn: (ids: Array<string | number>) => SalaryCompositionAPI.bulkDelete({ ids }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    clearSelectedRows()
    bulkDeleteRows.value = []
    showToast('Xóa thành công')
  },
})

/// Khởi tạo mutation cập nhật trạng thái theo dõi/ngừng theo dõi cho các bản ghi.
/// CREATED BY: VVHung (11/6/2026)
const changeStatusMutation = useMutation({
  mutationFn: ({ rows, status }: { rows: any[]; status: number }) =>
    SalaryCompositionAPI.updateBulkStatus({
      ids: rows.map(getSalaryCompositionId).filter(Boolean),
      status,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    clearSelectedRows()
    showToast('Cập nhật trạng thái thành công')
  },
})

/// Khởi tạo mutation đưa thành phần lương hệ thống vào danh sách sử dụng.
/// CREATED BY: VVHung (11/6/2026)
const copyFromSystemMutation = useMutation({
  mutationFn: (rows: any[]) =>
    SalaryCompositionAPI.copyFromSystem({
      salaryCompositionSystemIDs: rows.map(getSalaryCompositionSystemId).filter(Boolean),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    closeSystemPicker()
    showToast('Thêm thành công')
  },
})

const organizations = computed(() => organizationResponse.value?.data?.data ?? [])
const statusOptions = computed(() => [
  { label: 'Tất cả', value: null },
  ...SALARY_COMPOSITION_STATUS_OPTIONS,
])
const salaryCompositionTypeOptions = computed(() => [
  {
    label: 'Tất cả',
    value: null,
  },

  ...SALARY_COMPOSITION_TYPE_OPTIONS,
])
const normalizedSalaryCompositionTypeOptions = computed(() =>
  salaryCompositionTypeOptions.value.map((option) => ({
    ...option,
    label: option.label,
    value: option.value,
  })),
)
const hasSelectedRows = computed(() => selectedRows.value.length > 0)
const selectedHasActive = computed(() => selectedRows.value.some((row) => isActiveStatus(row)))
const selectedHasInactive = computed(() => selectedRows.value.some((row) => !isActiveStatus(row)))
const hasSystemPickerSelection = computed(() => systemPickerSelectedRows.value.length > 0)
const isCopyingFromSystem = computed(() => copyFromSystemMutation.isPending.value)
const hasAppliedAdvancedFilters = computed(() => advancedFilters.value.length > 0)
const effectiveAdvancedFilters = computed(() =>
  advancedFilters.value
    .filter(isEffectiveAdvancedFilter)
    .map((filter) => ({
      ...filter,
      operator: normalizeAdvancedFilterOperator(filter.operator),
    })),
)
const taxTypeOptions = [
  { value: 1, label: 'Chịu thuế' },
  { value: 2, label: 'Miễn thuế toàn phần' },
  { value: 3, label: 'Miễn thuế một phần' },
]
const booleanOptions = [
  { value: 1, label: 'Có' },
  { value: 0, label: 'Không' },
]
const createdSourceOptions = [
  { value: 1, label: 'Tự thêm' },
  { value: 2, label: 'Mặc định' },
]
const payslipDisplayTypeOptions = [
  { value: 1, label: 'Có' },
  { value: 2, label: 'Không' },
  { value: 3, label: 'Chỉ hiển thị nếu giá trị khác 0' },
]
const toAdvancedFilterOptions = (options: any[]) =>
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
  { fieldName: 'CreatedSource', label: 'Nguồn tạo', type: 'enum', options: toAdvancedFilterOptions(createdSourceOptions) },
  {
    fieldName: 'PayslipDisplayType',
    label: 'Hiển thị trên phiếu lương',
    type: 'enum',
    options: toAdvancedFilterOptions(payslipDisplayTypeOptions),
  },
])
const operatorLabelMap: Record<string, string> = {
  '1': 'Chứa',
  '2': 'Không chứa',
  '3': 'Bằng',
  '4': 'Khác',
  '5': 'Bắt đầu bằng',
  '6': 'Kết thúc bằng',
  '7': 'Trống',
  '8': 'Không trống',
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
      operatorLabel: operatorLabelMap[String(filter.operator)] || filter.operator,
      valueLabel: getAdvancedFilterTagValue(filter, valueOption),
    }
  }),
)

/// Lấy giá trị hiển thị trên tag của bộ lọc nâng cao.
/// <param name="filter">Điều kiện lọc đang áp dụng.</param>
/// <param name="valueOption">Option tương ứng với giá trị lọc.</param>
/// <returns>Chuỗi giá trị hiển thị trên tag.</returns>
/// CREATED BY: VVHung (11/6/2026)
function getAdvancedFilterTagValue(filter: any, valueOption: any) {
  const operator = normalizeAdvancedFilterOperator(filter.operator)
  if (operator === 7 || operator === 8) return ''
  return valueOption?.label ?? (filter.value === '' ? '"Rỗng"' : String(filter.value))
}

/// Kiểm tra điều kiện lọc có đủ dữ liệu để gửi lên API hay không.
/// <param name="filter">Điều kiện lọc cần kiểm tra.</param>
/// <returns>true nếu điều kiện lọc có hiệu lực.</returns>
/// CREATED BY: VVHung (11/6/2026)
function isEffectiveAdvancedFilter(filter: any) {
  const operator = normalizeAdvancedFilterOperator(filter.operator)
  if (operator === 7 || operator === 8) return true
  return filter.value !== null && filter.value !== undefined && filter.value !== ''
}

/// Chuẩn hóa operator của bộ lọc nâng cao sang enum backend.
/// <param name="operator">Toán tử cần chuẩn hóa.</param>
/// <returns>Giá trị enum operator.</returns>
/// CREATED BY: VVHung (12/6/2026)
function normalizeAdvancedFilterOperator(operator: string | number) {
  if (typeof operator === 'number') return operator

  const legacyOperatorMap: Record<string, number> = {
    contains: 1,
    notContains: 2,
    equals: 3,
    notEquals: 4,
    startsWith: 5,
    endsWith: 6,
    empty: 7,
    notEmpty: 8,
  }

  const numericOperator = Number(operator)
  if (Number.isNaN(numericOperator)) return legacyOperatorMap[operator] ?? 1
  return numericOperator
}

watch(searchKeyword, (value) => {
  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = window.setTimeout(() => {
    debouncedSearchKeyword.value = value
  }, 300)
})

watch(
  advancedFilters,
  (filters) => {
    writeStoredAdvancedFilters(ADVANCED_FILTER_STORAGE_KEY, filters)
  },
  { deep: true },
)

watch(systemPickerSearchKeyword, (value) => {
  if (systemPickerSearchDebounceTimer) {
    window.clearTimeout(systemPickerSearchDebounceTimer)
  }

  systemPickerSearchDebounceTimer = window.setTimeout(() => {
    debouncedSystemPickerSearchKeyword.value = value
  }, 300)
})

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentMouseDown)
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }

  if (systemPickerSearchDebounceTimer) {
    window.clearTimeout(systemPickerSearchDebounceTimer)
  }

  document.removeEventListener('mousedown', handleDocumentMouseDown)
})

const salaryCompositionFilters = computed(() => {
  const filters: Record<string, any> = {}

  if (selectedStatus.value !== null && selectedStatus.value !== '') {
    filters.status = Number(selectedStatus.value)
  }

  if (selectedOrganizationIds.value.length) {
    filters.organizationIDs = selectedOrganizationIds.value.join(';')
  }

  if (effectiveAdvancedFilters.value.length) {
    filters.advancedFilters = effectiveAdvancedFilters.value
  }

  return filters
})

const systemPickerFilters = computed(() => {
  if (!selectedSystemPickerTypeId.value) return {}

  return {
    salaryCompositionType: selectedSystemPickerTypeId.value,
  }
})

/// Lấy giá trị trạng thái của bản ghi.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getStatusValue(row: any) {
  return row?.status ?? row?.Status ?? row?.statusName ?? row?.StatusName
}

/// Kiểm tra bản ghi đang ở trạng thái theo dõi hay không.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function isActiveStatus(row: any) {
  const value = getStatusValue(row)
  if (typeof value === 'string') return !value.toLowerCase().includes('ngừng')
  return Number(value) === 1
}

/// Bỏ chọn các dòng đang chọn trên grid.
/// CREATED BY: VVHung (03/06/2026)
function clearSelectedRows() {
  clearSelectionSignal.value += 1
}

/// Mở hoặc đóng panel bộ lọc nâng cao.
/// CREATED BY: VVHung (03/06/2026)
function toggleAdvancedFilter() {
  isAdvancedFilterOpen.value = !isAdvancedFilterOpen.value
}

/// Áp dụng danh sách điều kiện bộ lọc nâng cao vào grid.
/// <param name="filters">Danh sách điều kiện đã chọn.</param>
/// CREATED BY: VVHung (03/06/2026)
function applyAdvancedFilters(filters: any[]) {
  advancedFilters.value = filters
  clearSelectedRows()
}

/// Xóa toàn bộ bộ lọc nâng cao.
/// CREATED BY: VVHung (03/06/2026)
function clearAdvancedFilters() {
  advancedFilters.value = []
  clearSelectedRows()
}

/// Xóa một điều kiện bộ lọc nâng cao theo field.
/// <param name="fieldName">Tên field cần xóa bộ lọc.</param>
/// CREATED BY: VVHung (03/06/2026)
function removeAdvancedFilter(fieldName: string) {
  advancedFilters.value = advancedFilters.value.filter((filter) => filter.fieldName !== fieldName)
  clearSelectedRows()
}

/// Đọc bộ lọc nâng cao đã lưu trong localStorage.
/// <param name="storageKey">Key localStorage cần đọc.</param>
/// <returns>Danh sách bộ lọc nâng cao.</returns>
/// CREATED BY: VVHung (09/06/2026)
function readStoredAdvancedFilters(storageKey: string) {
  try {
    const value = window.localStorage.getItem(storageKey)
    if (!value) return []
    const filters = JSON.parse(value)
    return Array.isArray(filters) ? filters : []
  } catch {
    return []
  }
}

/// Lưu bộ lọc nâng cao vào localStorage.
/// <param name="storageKey">Key localStorage cần lưu.</param>
/// <param name="filters">Danh sách bộ lọc nâng cao.</param>
/// CREATED BY: VVHung (09/06/2026)
function writeStoredAdvancedFilters(storageKey: string, filters: any[]) {
  if (!filters.length) {
    window.localStorage.removeItem(storageKey)
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(filters))
}

/// Lấy Id thành phần lương từ dòng dữ liệu.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getSalaryCompositionId(row: any) {
  return row?.salaryCompositionID ?? row?.SalaryCompositionID
}

/// Lấy tên thành phần lương từ dòng dữ liệu.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getSalaryCompositionName(row: any) {
  return row?.salaryCompositionName ?? row?.SalaryCompositionName ?? ''
}

/// Lấy Id thành phần lương hệ thống từ dòng dữ liệu.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getSalaryCompositionSystemId(row: any) {
  return row?.salaryCompositionSystemID ?? row?.SalaryCompositionSystemID
}

/// Lấy nguồn tạo của thành phần lương.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>Dữ liệu sau khi xử lý.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getCreatedSource(row: any) {
  return (
    row?.createdSource ?? row?.CreatedSource ?? row?.createdSourceName ?? row?.CreatedSourceName
  )
}

/// Kiểm tra thành phần lương có phải dữ liệu mặc định của hệ thống không.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// <returns>true nếu thỏa điều kiện, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
function isDefaultSourceRow(row: any) {
  const source = getCreatedSource(row)
  if (source === null || source === undefined || source === '') return false
  if (typeof source === 'string') {
    const normalizedSource = source
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    return normalizedSource.includes('mac dinh')
  }

  return Number(source) !== 1
}

const deleteSalaryCompositionName = computed(
  () => getSalaryCompositionName(deleteTargetRow.value) || 'thành phần lương',
)
const statusTargetName = computed(() => {
  if (statusTargetRows.value.length !== 1) return 'các thành phần lương đã chọn'
  return getSalaryCompositionName(statusTargetRows.value[0]) || 'thành phần lương'
})
const nextStatusText = computed(() =>
  Number(targetStatus.value) === 1 ? 'đang theo dõi' : 'ngừng theo dõi',
)
const bulkDefaultRows = computed(() => bulkDeleteRows.value.filter(isDefaultSourceRow))
const bulkDeletableRows = computed(() =>
  bulkDeleteRows.value.filter((row) => !isDefaultSourceRow(row)),
)
const bulkDefaultNames = computed(() =>
  bulkDefaultRows.value.map(getSalaryCompositionName).filter(Boolean),
)
const hasBulkDeletableRows = computed(() => bulkDeletableRows.value.length > 0)

/// Mở form thêm mới thành phần lương.
/// CREATED BY: VVHung (03/06/2026)
function openAddForm() {
  formMode.value = 'add'
  editingSalaryCompositionId.value = null
  editingSalaryCompositionTitle.value = ''
  isFormOpen.value = true
}

/// Mở form chi tiết để sửa thành phần lương.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function openEditForm(row: any) {
  const id = getSalaryCompositionId(row)
  if (!id) return
  formMode.value = 'edit'
  editingSalaryCompositionId.value = id
  editingSalaryCompositionTitle.value = getSalaryCompositionName(row)
  isFormOpen.value = true
}

/// Mở form nhân bản thành phần lương từ dòng đang chọn.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function openDuplicateForm(row: any) {
  const id = getSalaryCompositionId(row)
  if (!id) return
  formMode.value = 'duplicate'
  editingSalaryCompositionId.value = id
  editingSalaryCompositionTitle.value = getSalaryCompositionName(row)
  isFormOpen.value = true
}

/// Đóng form thành phần lương và quay lại danh sách.
/// CREATED BY: VVHung (03/06/2026)
function closeForm() {
  isFormOpen.value = false
  formMode.value = 'add'
  editingSalaryCompositionId.value = null
  editingSalaryCompositionTitle.value = ''
}

/// Xử lý sau khi form thêm, sửa hoặc nhân bản lưu thành công.
/// <param name="action">Loại hành động vừa lưu.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleFormSaved(action = 'create') {
  showToast(action === 'update' ? 'Cập nhật thành phần lương thành công' : 'Thêm thành công')
}

/// Xử lý sau khi xóa thành phần lương từ form chi tiết.
/// CREATED BY: VVHung (03/06/2026)
function handleFormDeleted() {
  showToast('Xóa thành công')
}

/// Hiển thị thông báo toast với nội dung truyền vào.
/// <param name="message">Nội dung thông báo.</param>
/// CREATED BY: VVHung (03/06/2026)
function showToast(message: string) {
  toast.value.visible = false
  toast.value.message = message
  nextTick(() => {
    toast.value.visible = true
  })
}

/// Mở modal xác nhận xóa thành phần lương.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function openDeleteModal(row: any) {
  deleteTargetRow.value = row
  if (isDefaultSourceRow(row)) {
    isDefaultDeleteModalOpen.value = true
    return
  }

  isDeleteConfirmModalOpen.value = true
}

/// Xác nhận xóa thành phần lương đang chọn.
/// CREATED BY: VVHung (03/06/2026)
function confirmDeleteSalaryComposition() {
  const id = getSalaryCompositionId(deleteTargetRow.value)
  if (!id) return
  deleteSalaryCompositionMutation.mutate(id)
}

/// Mở modal xác nhận xóa nhiều thành phần lương.
/// CREATED BY: VVHung (03/06/2026)
function openBulkDeleteModal() {
  if (!selectedRows.value.length) return
  bulkDeleteRows.value = [...selectedRows.value]
  isBulkDeleteConfirmModalOpen.value = true
}

/// Xác nhận xóa các thành phần lương đã chọn.
/// CREATED BY: VVHung (03/06/2026)
function confirmBulkDeleteSalaryCompositions() {
  const ids = bulkDeletableRows.value.map(getSalaryCompositionId).filter(Boolean)
  if (!ids.length) return
  bulkDeleteSalaryCompositionMutation.mutate(ids)
}

/// Mở modal xác nhận chuyển trạng thái một thành phần lương.
/// <param name="row">Dòng dữ liệu cần xử lý.</param>
/// CREATED BY: VVHung (03/06/2026)
function openStatusModal(row: any) {
  statusTargetRows.value = [row]
  targetStatus.value = isActiveStatus(row) ? 0 : 1
  isStatusConfirmModalOpen.value = true
}

/// Mở modal xác nhận chuyển trạng thái các thành phần lương đã chọn.
/// <param name="status">Trạng thái cần chuyển.</param>
/// CREATED BY: VVHung (03/06/2026)
function openBulkStatusModal(status: number) {
  const rows = selectedRows.value.filter((row) =>
    status === 1 ? !isActiveStatus(row) : isActiveStatus(row),
  )
  if (!rows.length) return
  statusTargetRows.value = rows
  targetStatus.value = status
  isStatusConfirmModalOpen.value = true
}

/// Xác nhận chuyển trạng thái các thành phần lương đang chọn.
/// CREATED BY: VVHung (03/06/2026)
function confirmChangeStatus() {
  if (targetStatus.value === null || !statusTargetRows.value.length) return
  changeStatusMutation.mutate({
    rows: statusTargetRows.value,
    status: targetStatus.value,
  })
}

/// Mở hoặc đóng menu thêm thành phần lương.
/// CREATED BY: VVHung (03/06/2026)
function toggleAddMenu() {
  isAddMenuOpen.value = !isAddMenuOpen.value
}

/// Mở popup chọn thành phần lương mặc định của hệ thống.
/// CREATED BY: VVHung (03/06/2026)
async function openSystemPicker() {
  isAddMenuOpen.value = false
  isSystemPickerOpen.value = true
  isSystemPickerDiscardModalOpen.value = false
  await nextTick()
  systemPickerSearchInputRef.value?.focus()
}

/// Yêu cầu đóng popup chọn thành phần hệ thống và kiểm tra dữ liệu đang chọn.
/// CREATED BY: VVHung (03/06/2026)
function requestCloseSystemPicker() {
  if (hasSystemPickerSelection.value) {
    isSystemPickerDiscardModalOpen.value = true
    return
  }

  closeSystemPicker()
}

/// Đóng popup chọn thành phần hệ thống và đặt lại trạng thái chọn.
/// CREATED BY: VVHung (03/06/2026)
function closeSystemPicker() {
  isSystemPickerOpen.value = false
  isSystemPickerDiscardModalOpen.value = false
  selectedSystemPickerTypeId.value = null
  systemPickerSearchKeyword.value = ''
  debouncedSystemPickerSearchKeyword.value = ''
  systemPickerClearSelectionSignal.value += 1
  systemPickerSelectedRows.value = []
}

/// Xác nhận thoát popup chọn thành phần hệ thống mà không lưu lựa chọn.
/// CREATED BY: VVHung (03/06/2026)
function confirmDiscardSystemPicker() {
  closeSystemPicker()
}

/// Xác nhận đưa các thành phần hệ thống đã chọn vào danh sách sử dụng.
/// CREATED BY: VVHung (03/06/2026)
function confirmSystemPicker() {
  if (!hasSystemPickerSelection.value) return
  copyFromSystemMutation.mutate([...systemPickerSelectedRows.value])
}

/// Xử lý click bên ngoài để đóng menu đang mở.
/// <param name="event">Sự kiện phát sinh từ giao diện.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleDocumentMouseDown(event: MouseEvent) {
  const target = event.target as Node
  if (addActionRef.value && !addActionRef.value.contains(target)) {
    isAddMenuOpen.value = false
  }
}
</script>

<style scoped>
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.content-header__title {
  letter-spacing: 0.6px;
  font-size: 20px;
  font-weight: 700;
  line-height: 30px;
}

.content-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.salary-grid-layout {
  height: 100vh;
  min-height: 0;
  display: flex;
  gap: 20px;
  align-items: stretch;
  overflow: hidden;
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
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
}

.mi-tag-close {
  width: 12px;
  height: 12px;
  display: inline-block;
  flex-shrink: 0;
  background-color: #5e5e5e;
  -webkit-mask-image: url('../../assets/images/ICON_4.svg');
  mask-image: url('../../assets/images/ICON_4.svg');
  -webkit-mask-position: -442px -56px;
  mask-position: -442px -56px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.system-category-text {
  font-size: 13px;
  line-height: 18px;
  white-space: nowrap;
  font-weight: 500;
}

.container-action-add {
  position: relative;
  display: flex;
  align-items: center;
}
.action-add-text {
  font-size: 13px;
  line-height: 18px;
  white-space: nowrap;
  font-weight: 500;
}

.div-division {
  display: flex;
  align-items: center;
  width: 1px;
  height: 32px;
  background-color: #0e9a62;
}

.div-division-child {
  width: 1px;
  height: 20px;
  background-color: #fff;
}

.button-action-text {
  white-space: nowrap;
  font-weight: 500;
}

.mi-rule {
  width: 17px;
  display: inline-block;
  flex-shrink: 0;
  height: 17px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -82px -101px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-plus-white {
  width: 16px;
  display: inline-block;
  flex-shrink: 0;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -240px -1px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff;
}

.mi-chevron-down-white {
  width: 12px;
  display: inline-block;
  flex-shrink: 0;
  height: 8px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -124px -6px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff;
}

.ms-menu__body {
  position: absolute;
  top: calc(100% + 4px);
  right: -8px;
  z-index: 300;
  width: 224px;
  padding: 8px 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px #0000001f;
}

.ms-menu-item {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: none;
  background: #fff;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
}

.ms-menu-item:hover {
  background: #e9eaeb;
}

.ms-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}

.ms-popup-container {
  position: fixed;
  top: 24px;
  right: 192px;
  left: 192px;
  height: calc(100vh - 48px);
  min-width: 960px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 12px 32px #0000002e;
}

.ms-popup__header {
  height: 62px;
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.ms-popup__header h3 {
  margin: 0;
  font-weight: 700;
  line-height: 19.2px;
  font-size: 16px;
  color: rgb(33, 33, 33);
  letter-spacing: 0.576px;
}

.ms-popup__close {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
}

.ms-popup__close:hover {
  background: #e9eaeb;
}

.mi-close {
  width: 20px;
  height: 20px;
  display: inline-block;
  background-color: #6e737a;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -300px 0px;
  -webkit-mask-repeat: no-repeat;
}

.ms-popup__body {
  min-height: 0;
  padding: 0 24px 16px;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.system-picker-options {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.system-picker-search {
  width: 300px;
}

.mi-search {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: 0px 0px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.system-picker-grid {
  min-height: 0;
  flex: 1;
}

.ms-popup__footer {
  height: 52.8px;
  padding: 10px 24px;
  border-top: 1px solid #d5d7da;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
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
  gap: 7px;
}

.bulk-actions__count strong {
  font-weight: 700;
  letter-spacing: 0.5px;
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

.bulk-delete-message {
  color: #101828;
  font-size: 13px;
  line-height: 20px;
}

.bulk-delete-message strong {
  font-weight: 700;
}

.mi-circle-orange,
.mi-circle-check-green,
.mi-trash-red {
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.mi-circle-orange {
  width: 20px;
  height: 20px;
  -webkit-mask-position: -180px -40px;
  background-color: #ff9900;
}

.mi-circle-check-green {
  width: 20px;
  height: 20px;
  -webkit-mask-position: -141px -41px;
  background-color: #34b057;
}

.mi-trash-red {
  width: 20px;
  height: 20px;
  -webkit-mask-position: -100px -21px;
  background-color: #f04438;
}
</style>

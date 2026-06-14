<template>
  <aside v-if="modelValue" class="ms-grid-filter">
    <div class="ms-grid-filter__header">
      <div class="ms-grid-filter__title-row">
        <h3>Bộ lọc</h3>
        <button type="button" class="ms-grid-filter__close" @click="closePanel">
          <span class="mi-close"></span>
        </button>
      </div>

      <MsInput ref="filterSearchInputRef" v-model="searchKeyword" placeholder="Tìm kiếm">
        <template #prefix>
          <span class="mi-search"></span>
        </template>
      </MsInput>
    </div>

    <div class="ms-grid-filter__body">
      <div
        v-for="field in visibleFields"
        :key="field.fieldName"
        :data-filter-field="field.fieldName"
        class="ms-grid-filter__condition"
        :class="{ 'is-checked': isFieldChecked(field.fieldName) }"
      >
        <div class="ms-grid-filter__field-row">
          <button
            type="button"
            class="ms-filter-checkbox"
            :class="{ 'is-checked': isFieldChecked(field.fieldName) }"
            @click="toggleField(field)"
          >
            <svg
              v-if="isFieldChecked(field.fieldName)"
              viewBox="0 0 16 16"
              class="ms-filter-checkbox__mark"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8L6 11L13 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button type="button" class="ms-grid-filter__label" @click="toggleField(field)">
            {{ field.label }}
          </button>
        </div>

        <template v-if="isFieldChecked(field.fieldName)">
          <MsSelect
            :model-value="getDraft(field.fieldName).operator"
            :options="getOperatorOptions(field)"
            variant="form"
            width="100%"
            menu-width="100%"
            @update:model-value="setDraftOperator(field, $event)"
          />

          <MsSelect
            v-if="field.type === 'enum' && shouldShowValueControl(field.fieldName)"
            class="ms-grid-filter__value-control"
            :model-value="getDraft(field.fieldName).value"
            :options="field.options || []"
            variant="form"
            width="100%"
            menu-width="100%"
            :placement="getValueSelectPlacement(field.fieldName)"
            @update:model-value="setDraftValue(field.fieldName, $event)"
          />

          <MsInput
            v-else-if="shouldShowValueControl(field.fieldName)"
            class="ms-grid-filter__value-control"
            :model-value="getDraft(field.fieldName).value"
            width="100%"
            @update:model-value="setDraftValue(field.fieldName, $event)"
          />
        </template>
      </div>

      <div v-if="!visibleFields.length" class="ms-grid-filter__empty">
        <div class="mi-empty-state-sheets"></div>
        <span>Không có dữ liệu</span>
      </div>
    </div>

    <div class="ms-grid-filter__footer">
      <MsButton
        width="80px"
        background-color="#FFFFFF"
        border-color="#D5D7DA"
        color="#101828"
        hover-background-color="#E9EAEB"
        hover-border-color="#D5D7DA"
        active-background-color="#D5D7DA"
        active-border-color="#D5D7DA"
        padding="0 12px"
        @click="clearFilters"
      >
        Bỏ lọc
      </MsButton>
      <MsButton width="80px" padding="0 12px" @click="applyFilters">Áp dụng</MsButton>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import MsButton from './MsButton.vue'
import MsInput from './MsInput.vue'
import MsSelect from './MsSelect.vue'

type FilterField = {
  fieldName: string
  label: string
  type?: 'text' | 'enum'
  options?: Array<{ label: string; value: string | number | boolean }>
}

type AdvancedFilter = {
  fieldName: string
  operator: string | number
  value: string | number | boolean
}

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (08/06/2026)
const props = defineProps<{
  modelValue: boolean
  fields: FilterField[]
  filters: AdvancedFilter[]
}>()

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (07/06/2026)
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  apply: [filters: AdvancedFilter[]]
  clear: []
}>()

/// Từ khóa người dùng nhập trong ô tìm kiếm.
/// CREATED BY: VVHung (09/06/2026)
const searchKeyword = ref('')
/// Từ khóa tìm kiếm sau khi debounce.
/// CREATED BY: VVHung (10/06/2026)
const debouncedSearchKeyword = ref('')
/// Bộ lọc nháp đang chỉnh trong panel trước khi áp dụng.
/// CREATED BY: VVHung (06/06/2026)
const draftFilters = reactive<Record<string, AdvancedFilter>>({})
/// Ref tới ô tìm kiếm trong panel bộ lọc nâng cao.
/// CREATED BY: VVHung (13/06/2026)
const filterSearchInputRef = ref<InstanceType<typeof MsInput> | null>(null)
/// Timer debounce thao tác nhập tìm kiếm.
/// CREATED BY: VVHung (12/06/2026)
let searchDebounceTimer: number | null = null

/// Danh sách operator filter phía FE khớp giá trị enum backend.
/// CREATED BY: VVHung (11/06/2026)
const FILTER_OPERATOR: Record<string, number> = {
  contains: 1,
  notContains: 2,
  equals: 3,
  notEquals: 4,
  startsWith: 5,
  endsWith: 6,
  empty: 7,
  notEmpty: 8,
}

/// Tập field dùng nhóm operator text đầy đủ.
/// CREATED BY: VVHung (10/06/2026)
const FULL_TEXT_OPERATOR_FIELDS = new Set([
  'SalaryCompositionCode',
  'SalaryCompositionName',
  'NormFormula',
])

/// Danh sách operator dành cho field text.
/// CREATED BY: VVHung (13/06/2026)
const FULL_TEXT_OPERATORS = [
  { value: FILTER_OPERATOR.contains, label: 'Chứa' },
  { value: FILTER_OPERATOR.notContains, label: 'Không chứa' },
  { value: FILTER_OPERATOR.equals, label: 'Bằng' },
  { value: FILTER_OPERATOR.startsWith, label: 'Bắt đầu bằng' },
  { value: FILTER_OPERATOR.endsWith, label: 'Kết thúc bằng' },
  { value: FILTER_OPERATOR.empty, label: 'Trống' },
  { value: FILTER_OPERATOR.notEmpty, label: 'Không trống' },
]

/// Danh sách operator rút gọn dành cho field select/boolean.
/// CREATED BY: VVHung (06/06/2026)
const SIMPLE_OPERATORS = [
  { value: FILTER_OPERATOR.equals, label: 'Bằng' },
  { value: FILTER_OPERATOR.notEquals, label: 'Khác' },
  { value: FILTER_OPERATOR.empty, label: 'Trống' },
  { value: FILTER_OPERATOR.notEmpty, label: 'Không trống' },
]

/// Tập operator không cần nhập giá trị lọc.
/// CREATED BY: VVHung (13/06/2026)
const EMPTY_OPERATORS = new Set([FILTER_OPERATOR.empty, FILTER_OPERATOR.notEmpty])

/// Danh sách field filter sau khi lọc theo ô tìm kiếm.
/// CREATED BY: VVHung (11/06/2026)
const visibleFields = computed(() => {
  const keyword = debouncedSearchKeyword.value.trim().toLowerCase()
  if (!keyword) return props.fields

  return props.fields.filter(
    (field) =>
      field.label.toLowerCase().includes(keyword) ||
      field.fieldName.toLowerCase().includes(keyword),
  )
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      syncDraftFromApplied()
      nextTick(() => {
        filterSearchInputRef.value?.focus?.()
      })
      return
    }

    searchKeyword.value = ''
    debouncedSearchKeyword.value = ''
  },
)

watch(
  () => props.filters,
  () => {
    if (props.modelValue) syncDraftFromApplied()
  },
  { deep: true },
)

watch(searchKeyword, (value) => {
  if (searchDebounceTimer) window.clearTimeout(searchDebounceTimer)
  searchDebounceTimer = window.setTimeout(() => {
    debouncedSearchKeyword.value = value
  }, 300)
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) window.clearTimeout(searchDebounceTimer)
})

/// Đồng bộ bộ lọc nháp từ danh sách bộ lọc đang áp dụng.
/// CREATED BY: VVHung (11/6/2026)
function syncDraftFromApplied() {
  Object.keys(draftFilters).forEach((key) => {
    delete draftFilters[key]
  })

  props.filters.forEach((filter) => {
    draftFilters[filter.fieldName] = {
      fieldName: filter.fieldName,
      operator: normalizeOperator(filter.operator),
      value: filter.value ?? '',
    }
  })
}

/// Kiểm tra một trường lọc đã được chọn hay chưa.
/// <param name="fieldName">Tên field cần kiểm tra.</param>
/// <returns>true nếu field đang được chọn.</returns>
/// CREATED BY: VVHung (11/6/2026)
function isFieldChecked(fieldName: string) {
  return Boolean(draftFilters[fieldName])
}

/// Lấy danh sách toán tử phù hợp với kiểu dữ liệu của trường lọc.
/// <param name="field">Cấu hình trường lọc.</param>
/// <returns>Danh sách toán tử có thể chọn.</returns>
/// CREATED BY: VVHung (11/6/2026)
function getOperatorOptions(field: FilterField) {
  return FULL_TEXT_OPERATOR_FIELDS.has(field.fieldName) ? FULL_TEXT_OPERATORS : SIMPLE_OPERATORS
}

/// Lấy toán tử mặc định khi người dùng chọn một trường lọc.
/// <param name="field">Cấu hình trường lọc.</param>
/// <returns>Toán tử mặc định của trường lọc.</returns>
/// CREATED BY: VVHung (11/6/2026)
function getDefaultOperator(field: FilterField) {
  return FULL_TEXT_OPERATOR_FIELDS.has(field.fieldName)
    ? FILTER_OPERATOR.contains
    : FILTER_OPERATOR.equals
}

/// Lấy điều kiện lọc nháp của một field.
/// <param name="fieldName">Tên field cần lấy điều kiện.</param>
/// <returns>Điều kiện lọc nháp của field.</returns>
/// CREATED BY: VVHung (11/6/2026)
function getDraft(fieldName: string) {
  return draftFilters[fieldName] || { fieldName, operator: FILTER_OPERATOR.contains, value: '' }
}

/// Bật hoặc tắt một trường trong bộ lọc nâng cao.
/// <param name="field">Cấu hình trường lọc cần xử lý.</param>
/// CREATED BY: VVHung (11/6/2026)
function toggleField(field: FilterField) {
  if (draftFilters[field.fieldName]) {
    delete draftFilters[field.fieldName]
    return
  }

  draftFilters[field.fieldName] = {
    fieldName: field.fieldName,
    operator: getDefaultOperator(field),
    value: '',
  }
  focusFieldValueControl(field.fieldName)
}

/// Cập nhật toán tử của điều kiện lọc đang chọn.
/// <param name="field">Cấu hình trường lọc.</param>
/// <param name="operator">Toán tử mới.</param>
/// CREATED BY: VVHung (11/6/2026)
function setDraftOperator(field: FilterField, operator: string | number) {
  const draft = draftFilters[field.fieldName]
  if (!draft) return

  draft.operator = normalizeOperator(operator)
  if (EMPTY_OPERATORS.has(draft.operator)) {
    draft.value = ''
    applyFilters()
    return
  }

  if (field.type === 'enum') draft.value = ''
  focusFieldValueControl(field.fieldName)
}

/// Cập nhật giá trị của điều kiện lọc nháp.
/// <param name="fieldName">Tên field cần cập nhật.</param>
/// <param name="value">Giá trị lọc mới.</param>
/// CREATED BY: VVHung (11/6/2026)
function setDraftValue(fieldName: string, value: string | number | boolean | null) {
  const draft = draftFilters[fieldName]
  if (!draft) return
  draft.value = normalizeFilterValue(value)
}

/// Kiểm tra điều kiện lọc có cần hiển thị control nhập giá trị hay không.
/// <param name="fieldName">Tên field cần kiểm tra.</param>
/// <returns>true nếu cần hiển thị input hoặc select giá trị.</returns>
/// CREATED BY: VVHung (11/6/2026)
function shouldShowValueControl(fieldName: string) {
  return !EMPTY_OPERATORS.has(normalizeOperator(getDraft(fieldName).operator))
}

/// Áp dụng danh sách bộ lọc nháp ra component cha.
/// CREATED BY: VVHung (11/6/2026)
function applyFilters() {
  const nextFilters = Object.values(draftFilters)
    .map((filter) => ({
      fieldName: filter.fieldName,
      operator: normalizeOperator(filter.operator),
      value: normalizeFilterValue(filter.value),
    }))

  emit('apply', nextFilters)
}

/// Focus vào input hoặc select của trường lọc vừa được chọn.
/// <param name="fieldName">Tên field cần focus control giá trị.</param>
/// CREATED BY: VVHung (11/6/2026)
async function focusFieldValueControl(fieldName: string) {
  await nextTick()

  const fieldElement = document.querySelector(`[data-filter-field="${fieldName}"]`)
  const focusTarget =
    fieldElement?.querySelector('.ms-grid-filter__value-control input') ||
    fieldElement?.querySelector('.ms-grid-filter__value-control button')
  ;(focusTarget as HTMLElement | null)?.focus?.()
}

/// Chuẩn hóa giá trị lọc trước khi lưu hoặc gửi lên API.
/// <param name="value">Giá trị lọc cần chuẩn hóa.</param>
/// <returns>Giá trị lọc dạng chuỗi.</returns>
/// CREATED BY: VVHung (11/6/2026)
function normalizeFilterValue(value: string | number | boolean | null) {
  if (value === null || value === undefined) return ''
  return String(value)
}

/// Chuẩn hóa operator từ dữ liệu cũ dạng chuỗi sang enum backend.
/// <param name="operator">Toán tử cần chuẩn hóa.</param>
/// <returns>Giá trị enum operator gửi backend.</returns>
/// CREATED BY: VVHung (12/6/2026)
function normalizeOperator(operator: string | number) {
  if (typeof operator === 'number') return operator
  return FILTER_OPERATOR[operator] ?? FILTER_OPERATOR.contains
}

/// Xác định hướng mở dropdown của select giá trị trong bộ lọc.
/// <param name="fieldName">Tên field cần xác định vị trí dropdown.</param>
/// <returns>Vị trí mở dropdown.</returns>
/// CREATED BY: VVHung (11/6/2026)
function getValueSelectPlacement(fieldName: string) {
  return ['CreatedSource', 'PayslipDisplayType'].includes(fieldName) ? 'top' : 'bottom'
}

/// Xóa toàn bộ điều kiện lọc và đóng panel bộ lọc.
/// CREATED BY: VVHung (11/6/2026)
function clearFilters() {
  Object.keys(draftFilters).forEach((key) => {
    delete draftFilters[key]
  })
  searchKeyword.value = ''
  debouncedSearchKeyword.value = ''
  emit('clear')
  emit('update:modelValue', false)
}

/// Đóng panel bộ lọc nâng cao.
/// CREATED BY: VVHung (11/6/2026)
function closePanel() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.ms-grid-filter {
  width: 250px;
  min-width: 250px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  color: #101828;
}

.ms-grid-filter__header {
  padding: 14px 16px 0;
  flex-shrink: 0;
}

.ms-grid-filter__title-row {
  height: 32px;
  padding: 4px 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ms-grid-filter__title-row h3 {
  margin: 0;
  color: #101828;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.ms-grid-filter__close {
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.ms-grid-filter__close:hover {
  background: #0000001a;
}

.mi-close {
  width: 12px;
  height: 12px;
  display: inline-block;
  background-color: #5d5d5d;
  -webkit-mask-image: url('../assets/images/ICON_4.svg');
  mask-image: url('../assets/images/ICON_4.svg');
  -webkit-mask-position: -442px -56px;
  mask-position: -442px -56px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.mi-search {
  width: 20px;
  height: 20px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: 0 0;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.ms-grid-filter__body {
  min-height: 0;
  max-height: calc(100% - 145px);
  padding: 8px 8px 12px;
  flex: 1;
  overflow-y: auto;
}

.ms-grid-filter__condition {
  padding: 8px 12px 0;
  margin-bottom: 2px;
  border-radius: 8px;
}

.ms-grid-filter__condition.is-checked {
  padding-bottom: 8px;
  margin-bottom: 12px;
  background: #eafbF2;
}

.ms-grid-filter__condition :deep(.ms-select),
.ms-grid-filter__condition :deep(.ms-input) {
  margin-top: 8px;
}

.ms-grid-filter :deep(.ms-select__value) {
  font-weight: 400;
}

.ms-grid-filter__field-row {
  min-height: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ms-filter-checkbox {
  width: 16px;
  height: 16px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #d5d7da;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  box-sizing: border-box;
}

.ms-filter-checkbox.is-checked {
  border-color: #0e9a62;
  background: #0e9a62;
}

.ms-filter-checkbox__mark {
  width: 11px;
  height: 11px;
}

.ms-grid-filter__label {
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
}

.ms-grid-filter__footer {
  width: 250px;
  height: 56px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-top: 1px solid #d5d7da;
  border-radius: 0 0 8px 8px;
  background: #fafafa;
  font-weight: 500;
}

.ms-grid-filter__empty {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #b3b8c2;
  font-style: italic;
}

.mi-empty-state-sheets {
  width: 96px;
  height: 96px;
  display: inline-block;
  background-image: url('../assets/images/Empty.svg');
  background-repeat: no-repeat;
  background-size: 252px auto;
  opacity: 0.7;
}
</style>

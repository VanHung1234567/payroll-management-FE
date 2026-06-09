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
  operator: string
  value: string | number | boolean
}

const props = defineProps<{
  modelValue: boolean
  fields: FilterField[]
  filters: AdvancedFilter[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  apply: [filters: AdvancedFilter[]]
  clear: []
}>()

const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
const draftFilters = reactive<Record<string, AdvancedFilter>>({})
const filterSearchInputRef = ref<InstanceType<typeof MsInput> | null>(null)
let searchDebounceTimer: number | null = null

const TEXT_OPERATORS = [
  { value: 'contains', label: 'Chứa' },
  { value: 'notContains', label: 'Không chứa' },
  { value: 'equals', label: 'Bằng' },
  { value: 'notEquals', label: 'Không bằng' },
  { value: 'startsWith', label: 'Bắt đầu bằng' },
  { value: 'endsWith', label: 'Kết thúc bằng' },
  { value: 'empty', label: 'Trống' },
  { value: 'notEmpty', label: 'Không trống' },
]

const ENUM_OPERATORS = [
  { value: 'equals', label: 'Bằng' },
  { value: 'notEquals', label: 'Khác' },
  { value: 'empty', label: 'Trống' },
  { value: 'notEmpty', label: 'Không trống' },
]

const EMPTY_OPERATORS = new Set(['empty', 'notEmpty'])

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

function syncDraftFromApplied() {
  Object.keys(draftFilters).forEach((key) => {
    delete draftFilters[key]
  })

  props.filters.forEach((filter) => {
    draftFilters[filter.fieldName] = {
      fieldName: filter.fieldName,
      operator: filter.operator,
      value: filter.value ?? '',
    }
  })
}

function isFieldChecked(fieldName: string) {
  return Boolean(draftFilters[fieldName])
}

function getOperatorOptions(field: FilterField) {
  return field.type === 'enum' ? ENUM_OPERATORS : TEXT_OPERATORS
}

function getDefaultOperator(field: FilterField) {
  return field.type === 'enum' ? 'equals' : 'contains'
}

function getDefaultValue(field: FilterField) {
  return ''
}

function getDraft(fieldName: string) {
  return draftFilters[fieldName] || { fieldName, operator: 'contains', value: '' }
}

function toggleField(field: FilterField) {
  if (draftFilters[field.fieldName]) {
    delete draftFilters[field.fieldName]
    return
  }

  draftFilters[field.fieldName] = {
    fieldName: field.fieldName,
    operator: getDefaultOperator(field),
    value: getDefaultValue(field),
  }
  focusFieldValueControl(field.fieldName)
}

function setDraftOperator(field: FilterField, operator: string) {
  const draft = draftFilters[field.fieldName]
  if (!draft) return

  draft.operator = operator
  if (EMPTY_OPERATORS.has(operator)) {
    draft.value = ''
    applyFilters()
    return
  }

  if (field.type === 'enum') draft.value = ''
  focusFieldValueControl(field.fieldName)
}

function setDraftValue(fieldName: string, value: string | number | boolean | null) {
  const draft = draftFilters[fieldName]
  if (!draft) return
  draft.value = normalizeFilterValue(value)
}

function shouldShowValueControl(fieldName: string) {
  return !EMPTY_OPERATORS.has(getDraft(fieldName).operator)
}

function applyFilters() {
  const nextFilters = Object.values(draftFilters)
    .map((filter) => ({
      fieldName: filter.fieldName,
      operator: filter.operator,
      value: normalizeFilterValue(filter.value),
    }))

  emit('apply', nextFilters)
}

async function focusFieldValueControl(fieldName: string) {
  await nextTick()

  const fieldElement = document.querySelector(`[data-filter-field="${fieldName}"]`)
  const inputTarget = fieldElement?.querySelector('.ms-grid-filter__value-control input')
  if (inputTarget) {
    ;(inputTarget as HTMLElement).focus?.()
    return
  }

  const selectTrigger = fieldElement?.querySelector('.ms-grid-filter__value-control button')
  if (selectTrigger) {
    ;(selectTrigger as HTMLElement).focus?.()
    return
  }

  const focusTarget = fieldElement?.querySelector('.ms-grid-filter__value-control input')
  ;(focusTarget as HTMLElement | null)?.focus?.()
}

function normalizeFilterValue(value: string | number | boolean | null) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function getValueSelectPlacement(fieldName: string) {
  return ['CreatedSource', 'PayslipDisplayType'].includes(fieldName) ? 'top' : 'bottom'
}

function clearFilters() {
  Object.keys(draftFilters).forEach((key) => {
    delete draftFilters[key]
  })
  searchKeyword.value = ''
  debouncedSearchKeyword.value = ''
  emit('clear')
  emit('update:modelValue', false)
}

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

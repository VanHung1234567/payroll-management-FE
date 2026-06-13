<template>
  <div v-if="modelValue" ref="popupRef" class="ms-column-settings__popup" @click.stop>
    <div class="ms-column-settings__header">
      <div class="ms-column-settings__title">Tùy chỉnh cột</div>
      <MsTooltip content="Lấy lại mặc định" placement="bottom" align="center">
        <button type="button" class="ms-column-settings__reset" @click="resetDefaultColumns">
          <span class="mi-update"></span>
        </button>
      </MsTooltip>
    </div>

    <MsInput
      ref="searchInputRef"
      v-model="keyword"
      class="ms-column-settings__search"
      placeholder="Tìm kiếm"
    >
      <template #prefix>
        <span class="mi-search"></span>
      </template>
    </MsInput>

    <div class="ms-column-settings__list-wrap">
      <div v-if="filteredColumns.length" class="ms-column-settings__list">
        <VueDraggableNext
          v-if="!debouncedKeyword"
          :list="draftColumns"
          item-key="fieldName"
          handle=".ms-column-settings__drag-handle"
          :animation="150"
          @change="syncSortOrder"
        >
            <div
              v-for="column in draftColumns"
              :key="column.fieldName"
              class="ms-column-settings__item"
              @click="toggleColumn(column)"
            >
              <button
                type="button"
                class="ms-column-settings__checkbox"
                :class="{ 'is-checked': column.visible }"
                :disabled="isLastVisibleColumn(column)"
                @click.stop="toggleColumn(column)"
            >
              <svg
                v-if="column.visible"
                viewBox="0 0 16 16"
                class="ms-column-settings__check-mark"
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
              <span class="ms-column-settings__caption">{{ column.caption }}</span>
              <span class="ms-column-settings__drag-handle" @click.stop>
                <span class="mi-drag"></span>
              </span>
          </div>
        </VueDraggableNext>

        <div v-else>
            <div
              v-for="column in filteredColumns"
              :key="column.fieldName"
              class="ms-column-settings__item"
              @click="toggleColumn(column)"
            >
              <button
                type="button"
                class="ms-column-settings__checkbox"
                :class="{ 'is-checked': column.visible }"
                :disabled="isLastVisibleColumn(column)"
                @click.stop="toggleColumn(column)"
            >
              <svg
                v-if="column.visible"
                viewBox="0 0 16 16"
                class="ms-column-settings__check-mark"
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
            <span class="ms-column-settings__caption">{{ column.caption }}</span>
          </div>
        </div>
      </div>

      <div v-else class="ms-column-settings__empty">
        <div class="mi-empty-state-sheets"></div>
        <div>Không có dữ liệu</div>
      </div>
    </div>

    <div class="ms-column-settings__footer">
      <MsButton width="80px" :disabled="!canSaveColumns" @click="saveColumns">Lưu</MsButton>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import MsButton from './MsButton.vue'
import MsInput from './MsInput.vue'
import MsTooltip from './MsTooltip.vue'

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (07/06/2026)
const props = defineProps({
  // Trang thai mo/dong popup, dung voi v-model.
  modelValue: {
    type: Boolean,
    default: false,
  },
  // Danh sach cot da lay tu API grid config.
  columns: {
    type: Array,
    default: () => [],
  },
  // Trang thai dang luu de disable nut Luu.
  saving: {
    type: Boolean,
    default: false,
  },
  // Cac field se bi an khi bam lay lai mac dinh.
  defaultHiddenFields: {
    type: Array,
    default: () => [
      'TaxType',
      'IsTaxReduction',
      'NormFormula',
      'Description',
      'PayslipDisplayType',
    ],
  },
})

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (08/06/2026)
const emit = defineEmits(['update:modelValue', 'save'])
/// Từ khóa tìm kiếm trong popup tùy chỉnh cột.
/// CREATED BY: VVHung (08/06/2026)
const keyword = ref('')
/// Từ khóa tìm kiếm cột sau khi debounce.
/// CREATED BY: VVHung (11/06/2026)
const debouncedKeyword = ref('')
/// Danh sách cột nháp đang chỉnh trong popup tùy chỉnh cột.
/// CREATED BY: VVHung (09/06/2026)
const draftColumns = ref([])
/// Ref tới input tìm kiếm trong popup tùy chỉnh cột.
/// CREATED BY: VVHung (06/06/2026)
const searchInputRef = ref(null)
/// Timer debounce tìm kiếm cột.
/// CREATED BY: VVHung (12/06/2026)
let searchTimer = null
/// Thứ tự cột mặc định dùng khi người dùng bấm lấy lại mặc định.
/// CREATED BY: VVHung (08/06/2026)
const DEFAULT_COLUMN_ORDER = [
  'SalaryCompositionCode',
  'SalaryCompositionName',
  'OrganizationNames',
  'OrganizationIDs',
  'SalaryCompositionType',
  'SalaryCompositionTypeID',
  'Nature',
  'TaxType',
  'IsTaxReduction',
  'NormFormula',
  'AllowOverNorm',
  'ValueType',
  'ValueFormula',
  'Description',
  'PayslipDisplayType',
  'CreatedSource',
  'Status',
]

/// Tập giá trị dùng để kiểm tra default hidden field set.
/// CREATED BY: VVHung (10/06/2026)
const defaultHiddenFieldSet = computed(
  () => new Set(props.defaultHiddenFields.map((fieldName) => normalizeFieldName(fieldName))),
)
/// Map sortOrder mặc định theo fieldName.
/// CREATED BY: VVHung (06/06/2026)
const defaultOrderMap = computed(
  () =>
    new Map(
      DEFAULT_COLUMN_ORDER.map((fieldName, index) => [normalizeFieldName(fieldName), index + 1]),
    ),
)
/// Danh sách cột hiển thị sau khi search trong popup.
/// CREATED BY: VVHung (13/06/2026)
const filteredColumns = computed(() => {
  const keywordText = debouncedKeyword.value.trim().toLowerCase()
  if (!keywordText) return draftColumns.value

  return draftColumns.value.filter((column) => {
    return (
      column.caption?.toLowerCase().includes(keywordText) ||
      column.fieldName?.toLowerCase().includes(keywordText) ||
      column.apiFieldName?.toLowerCase().includes(keywordText)
    )
  })
})
/// Số cột nháp đang được bật hiển thị.
/// CREATED BY: VVHung (09/06/2026)
const visibleDraftColumnCount = computed(
  () => draftColumns.value.filter((column) => column.visible).length,
)
/// Cờ xác định có thể save columns.
/// CREATED BY: VVHung (13/06/2026)
const canSaveColumns = computed(() => !props.saving && visibleDraftColumnCount.value > 0)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      syncDraftColumns()
      resetSearch()
      await nextTick()
      searchInputRef.value?.focus?.()
      return
    }

    resetSearch()
    syncDraftColumns()
  },
)

watch(
  () => props.columns,
  () => {
    if (!props.modelValue) {
      syncDraftColumns()
    }
  },
  { immediate: true, deep: true },
)

watch(keyword, (value) => {
  if (searchTimer) {
    window.clearTimeout(searchTimer)
  }

  searchTimer = window.setTimeout(() => {
    debouncedKeyword.value = value
  }, 300)
})

onBeforeUnmount(() => {
  if (searchTimer) {
    window.clearTimeout(searchTimer)
  }
})

/// Đồng bộ danh sách cột nháp từ props để người dùng chỉnh sửa trước khi lưu.
/// CREATED BY: VVHung (11/6/2026)
function syncDraftColumns() {
  draftColumns.value = props.columns
    .map((column) => ({
      ...column,
      visible: normalizeBoolean(column.visible),
      sortOrder: Number(column.sortOrder || 0),
    }))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
}

/// Đặt lại ô tìm kiếm cấu hình cột về trạng thái rỗng.
/// CREATED BY: VVHung (11/6/2026)
function resetSearch() {
  keyword.value = ''
  debouncedKeyword.value = ''
  if (searchTimer) {
    window.clearTimeout(searchTimer)
    searchTimer = null
  }
}

/// Bật hoặc tắt hiển thị một cột trong danh sách cấu hình.
/// <param name="column">Cột cần thay đổi trạng thái hiển thị.</param>
/// CREATED BY: VVHung (11/6/2026)
function toggleColumn(column) {
  if (column.visible && visibleDraftColumnCount.value <= 1) return
  column.visible = !column.visible
}

/// Kiểm tra cột hiện tại có phải cột hiển thị cuối cùng hay không.
/// <param name="column">Cột cần kiểm tra.</param>
/// <returns>true nếu đây là cột hiển thị cuối cùng.</returns>
/// CREATED BY: VVHung (11/6/2026)
function isLastVisibleColumn(column) {
  return column.visible && visibleDraftColumnCount.value <= 1
}

/// Khôi phục cấu hình cột về trạng thái mặc định và lưu ngay.
/// CREATED BY: VVHung (11/6/2026)
function resetDefaultColumns() {
  draftColumns.value = draftColumns.value
    .map((column) => ({
      ...column,
      visible: !defaultHiddenFieldSet.value.has(
        normalizeFieldName(column.apiFieldName || column.fieldName),
      ),
    }))
    .sort((left, right) => getDefaultSortOrder(left) - getDefaultSortOrder(right))
  syncSortOrder()
  emit('save', draftColumns.value)
}

/// Cập nhật lại sortOrder theo thứ tự đang hiển thị trong popup.
/// CREATED BY: VVHung (11/6/2026)
function syncSortOrder() {
  draftColumns.value.forEach((column, index) => {
    column.sortOrder = index + 1
  })
}

/// Lưu cấu hình cột nếu còn ít nhất một cột được hiển thị.
/// CREATED BY: VVHung (11/6/2026)
function saveColumns() {
  if (!canSaveColumns.value) return
  syncSortOrder()
  emit('save', draftColumns.value)
}

/// Chuẩn hóa tên field về chữ thường để so sánh ổn định.
/// <param name="fieldName">Tên field cần chuẩn hóa.</param>
/// <returns>Tên field sau khi chuẩn hóa.</returns>
/// CREATED BY: VVHung (11/6/2026)
function normalizeFieldName(fieldName) {
  return String(fieldName || '').toLowerCase()
}

/// Lấy thứ tự mặc định của cột theo danh sách cấu hình chuẩn.
/// <param name="column">Cột cần lấy thứ tự mặc định.</param>
/// <returns>Thứ tự mặc định của cột.</returns>
/// CREATED BY: VVHung (11/6/2026)
function getDefaultSortOrder(column) {
  const fieldName = normalizeFieldName(column.apiFieldName || column.fieldName)
  return defaultOrderMap.value.get(fieldName) ?? Number(column.sortOrder || 999)
}

/// Chuẩn hóa giá trị boolean từ dữ liệu API hoặc props.
/// <param name="value">Giá trị cần chuẩn hóa.</param>
/// <returns>Giá trị boolean sau khi chuẩn hóa.</returns>
/// CREATED BY: VVHung (11/6/2026)
function normalizeBoolean(value) {
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1'
  return Boolean(value)
}
</script>

<style scoped>
.ms-column-settings__popup {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 310;
  width: 415px;
  padding: 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
  color: #101828;
}

.ms-column-settings__header {
  height: 48px;
  padding: 0 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ms-column-settings__title {
  color: #212121;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}

.ms-column-settings__reset {
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

.ms-column-settings__reset:hover {
  background: #0000001a;
}

.ms-column-settings__search {
  margin-bottom: 12px;
}

.ms-column-settings__list-wrap {
  height: calc(100vh - 400px);
  max-height: calc(100vh - 400px);
  min-height: 260px;
  overflow-y: auto;
  border-bottom: 1px solid #e3e5ee;
}

.ms-column-settings__list {
  padding-bottom: 8px;
}

.ms-column-settings__item {
  height: 36px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
  cursor: pointer;
}

.ms-column-settings__item:hover {
  background: #eafbf2;
}

.ms-column-settings__caption {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.ms-column-settings__drag-handle {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0;
  cursor: all-scroll;
}

.ms-column-settings__item:hover .ms-column-settings__drag-handle {
  opacity: 1;
}

.ms-column-settings__drag-handle:active {
  cursor: all-scroll;
}

.ms-column-settings__checkbox {
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
  outline: none;
}

.ms-column-settings__checkbox.is-checked {
  border-color: #0e9a62;
  background: #0e9a62;
}

.ms-column-settings__checkbox:disabled {
  cursor: not-allowed;
}

.ms-column-settings__check-mark {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.ms-column-settings__empty {
  height: 100%;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #d5d7da;
  font-size: 13px;
  font-style: italic;
  line-height: 18px;
}

.ms-column-settings__footer {
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.mi-search {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: 0px 0px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-update {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -260px -60px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-drag {
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -106px -82px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-empty-state-sheets {
  width: 195px;
  height: 125px;
  background: url('../assets/images/EmptyState.svg') -1156px -1316px no-repeat;
}
</style>

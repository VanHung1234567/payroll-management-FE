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
      <MsButton width="80px" :disabled="saving" @click="saveColumns">Lưu</MsButton>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import MsButton from './MsButton.vue'
import MsInput from './MsInput.vue'
import MsTooltip from './MsTooltip.vue'

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

const emit = defineEmits(['update:modelValue', 'save'])
const keyword = ref('')
const debouncedKeyword = ref('')
const draftColumns = ref([])
const searchInputRef = ref(null)
let searchTimer = null

const defaultHiddenFieldSet = computed(
  () => new Set(props.defaultHiddenFields.map((fieldName) => normalizeFieldName(fieldName))),
)
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

function syncDraftColumns() {
  draftColumns.value = props.columns
    .map((column) => ({
      ...column,
      visible: normalizeBoolean(column.visible),
      sortOrder: Number(column.sortOrder || 0),
    }))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
}

function resetSearch() {
  keyword.value = ''
  debouncedKeyword.value = ''
  if (searchTimer) {
    window.clearTimeout(searchTimer)
    searchTimer = null
  }
}

function toggleColumn(column) {
  column.visible = !column.visible
}

function resetDefaultColumns() {
  draftColumns.value.forEach((column) => {
    column.visible = !defaultHiddenFieldSet.value.has(
      normalizeFieldName(column.apiFieldName || column.fieldName),
    )
  })
  syncSortOrder()
  emit('save', draftColumns.value)
}

function syncSortOrder() {
  draftColumns.value.forEach((column, index) => {
    column.sortOrder = index + 1
  })
}

function saveColumns() {
  syncSortOrder()
  emit('save', draftColumns.value)
}

function normalizeFieldName(fieldName) {
  return String(fieldName || '').toLowerCase()
}

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

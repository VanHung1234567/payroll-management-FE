<template>
  <div class="grid-options">
    <div class="flex items-center justify-between w-full h-full">
      <div class="flex items-center gap-8">
        <div class="w-300">
          <MsInput
            :model-value="search"
            placeholder="Tìm kiếm"
            @update:model-value="emit('update:search', $event)"
          >
            <template #prefix>
              <div class="mi-search"></div>
            </template>
          </MsInput>
        </div>

        <slot v-if="bulkMode" name="bulk-actions" />
        <slot v-else name="options" />
      </div>

      <div v-if="!bulkMode" class="flex items-center gap-8">
        <MsTooltip content="Bộ lọc">
          <MsButton
            width="32px"
            height="32px"
            min-width="32px"
            padding="0"
            background-color="#ffffff"
            border-color="#D5D7DA"
            color="#101828"
            hover-background-color="#E9EAEB"
            hover-border-color="#D5D7DA"
            active-background-color="#D5D7DA"
            active-border-color="#D5D7DA"
            @click.stop="emit('toggle-filter')"
          >
            <div :class="filterButtonActive ? 'ms-icon-filter-fill' : 'mi-filter'"></div>
          </MsButton>
        </MsTooltip>

        <div ref="settingRef" class="grid-options__setting">
          <MsTooltip
            content="Thiết lập"
            placement="bottom"
            align="center"
            :disabled="isColumnSettingsOpen"
          >
            <MsButton
              width="32px"
              height="32px"
              min-width="32px"
              padding="0"
              background-color="#ffffff"
              border-color="#D5D7DA"
              color="#101828"
              hover-background-color="#E9EAEB"
              hover-border-color="#D5D7DA"
              active-background-color="#D5D7DA"
              active-border-color="#D5D7DA"
              @click.stop="toggleColumnSettings"
            >
              <span class="mi-setting" :class="{ 'is-active': isColumnSettingsOpen }"></span>
            </MsButton>
          </MsTooltip>

          <MsGridColumnSettings
            v-model="isColumnSettingsOpen"
            :columns="gridConfigColumns"
            :saving="isSavingColumnSettings"
            @save="saveColumnSettings"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import GridConfigAPI from '@/apis/components/gridConfig/GridConfig.js'
import MsButton from './MsButton.vue'
import MsGridColumnSettings from './MsGridColumnSettings.vue'
import MsInput from './MsInput.vue'
import MsTooltip from './MsTooltip.vue'

const props = defineProps({
  // Key cau hinh cot can hien thi trong popup tuy chinh cot.
  gridKey: {
    type: String,
    default: 'salary_composition',
  },
  // Gia tri o tim kiem cua toolbar.
  search: {
    type: String,
    default: '',
  },
  // Khi true thi an filter thuong va hien thi slot bulk-actions.
  bulkMode: {
    type: Boolean,
    default: false,
  },
  // True khi bo loc nang cao dang co dieu kien ap dung.
  filterActive: {
    type: Boolean,
    default: false,
  },
  // True khi panel bo loc dang mo.
  filterOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:search', 'toggle-filter'])
const queryClient = useQueryClient()
const isColumnSettingsOpen = ref(false)
const settingRef = ref<HTMLElement | null>(null)
const gridConfigQueryKey = computed(() => ['grid-config', props.gridKey])
const filterButtonActive = computed(() => props.filterActive)

const { data: gridConfigResponse } = useQuery({
  queryKey: gridConfigQueryKey,
  queryFn: () => GridConfigAPI.getGridKey(props.gridKey),
})

const gridConfigColumns = computed(() => {
  const payload = normalizeResponseData(gridConfigResponse.value)
  const columns = Array.isArray(payload) ? payload : payload.data || []

  return columns
    .map(normalizeColumn)
    .sort((a: { sortOrder: any }, b: { sortOrder: any }) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
})

const saveColumnSettingsMutation = useMutation({
  mutationFn: (columns: any[]) =>
    GridConfigAPI.saveConfig({
      gridKey: props.gridKey,
      columns: columns.map((column) => ({
        fieldName: column.apiFieldName || column.fieldName,
        visible: column.visible !== false,
        sortOrder: column.sortOrder,
      })),
    }),
  onSuccess: async (_response, columns) => {
    updateGridConfigCache(columns)
    await queryClient.refetchQueries({ queryKey: gridConfigQueryKey.value, exact: true })
  },
})
const isSavingColumnSettings = computed(() => saveColumnSettingsMutation.isPending.value)

watch(isColumnSettingsOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('mousedown', handleDocumentMouseDown)
    return
  }

  document.removeEventListener('mousedown', handleDocumentMouseDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentMouseDown)
})

function toggleColumnSettings() {
  isColumnSettingsOpen.value = !isColumnSettingsOpen.value
}

function handleDocumentMouseDown(event: MouseEvent) {
  if (!isColumnSettingsOpen.value) return
  if (settingRef.value?.contains(event.target as Node)) return
  isColumnSettingsOpen.value = false
}

function saveColumnSettings(columns: any[]) {
  isColumnSettingsOpen.value = false
  updateGridConfigCache(columns)
  saveColumnSettingsMutation.mutate(columns)
}

function normalizeResponseData(response: any) {
  return response?.data?.data ?? response?.data ?? {}
}

function normalizeColumn(column: any) {
  const rawFieldName = column.fieldName || column.FieldName

  return {
    ...column,
    apiFieldName: rawFieldName,
    fieldName: rawFieldName,
    caption: column.caption || column.Caption || rawFieldName,
    visible: normalizeBoolean(column.visible ?? column.Visible ?? true),
    sortOrder: column.sortOrder ?? column.SortOrder,
  }
}

function updateGridConfigCache(columns: any[]) {
  const nextColumnMap = new Map(
    columns.map((column, index) => [
      column.apiFieldName || column.fieldName,
      {
        visible: column.visible !== false,
        sortOrder: Number(column.sortOrder || index + 1),
      },
    ]),
  )

  queryClient.setQueryData(gridConfigQueryKey.value, (oldData: any) => {
    const payload = normalizeResponseData(oldData)
    const currentColumns = getGridConfigColumns(payload)

    const nextColumns = currentColumns.map((column: any) => {
      const fieldName = column.fieldName || column.FieldName
      const nextColumn = nextColumnMap.get(fieldName)
      if (!nextColumn) return column

      return {
        ...column,
        visible: nextColumn.visible,
        Visible: nextColumn.visible,
        sortOrder: nextColumn.sortOrder,
        SortOrder: nextColumn.sortOrder,
      }
    })

    return replaceGridConfigColumns(oldData, nextColumns)
  })
}

function getGridConfigColumns(payload: any) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function replaceGridConfigColumns(oldData: any, nextColumns: any[]) {
  if (Array.isArray(oldData)) return nextColumns
  if (Array.isArray(oldData?.data)) return { ...oldData, data: nextColumns }
  if (Array.isArray(oldData?.data?.data)) {
    return {
      ...oldData,
      data: {
        ...oldData.data,
        data: nextColumns,
      },
    }
  }

  return {
    ...oldData,
    data: {
      ...oldData?.data,
      data: nextColumns,
    },
  }
}

function normalizeBoolean(value: any) {
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1'
  return Boolean(value)
}
</script>

<style scoped>
.grid-options {
  padding: 12px 16px;
  background-color: #fff;
  position: relative;
  z-index: 260;
  height: 56px;
  border-radius: 8px 8px 0 0;
}

.grid-options__setting {
  position: relative;
  display: inline-flex;
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

.mi-filter {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -20px 0px;
  mask-position: -20px 0px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  background-color: #6e737a;
}

.ms-icon-filter-fill {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/Filter_fill.svg');
  mask-image: url('../assets/images/Filter_fill.svg');
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  background-color: #0e9a62;
}

.ms-icon-filter-fill {
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/Filter_fill.svg');
  mask-image: url('../assets/images/Filter_fill.svg');
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  background-color: #0e9a62;
}

.mi-setting {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -321px -81px;
  -webkit-mask-repeat: no-repeat;
  background-color: #666;
}

.mi-setting.is-active {
  background-color: #0e9a62;
}
</style>

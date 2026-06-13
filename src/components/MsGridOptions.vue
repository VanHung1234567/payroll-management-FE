<template>
  <div class="grid-options" :class="{ 'is-filter-open': filterOpen }">
    <div class="grid-options__inner">
      <div class="grid-options__left">
        <div class="grid-options__search">
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

      <div v-if="!bulkMode" class="grid-options__actions">
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
            <div :class="props.filterActive ? 'ms-icon-filter-fill' : 'mi-filter'"></div>
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

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (08/06/2026)
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

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (07/06/2026)
const emit = defineEmits(['update:search', 'toggle-filter'])
/// Đối tượng Vue Query dùng để đọc, cập nhật và refetch cache.
/// CREATED BY: VVHung (11/06/2026)
const queryClient = useQueryClient()
/// Cờ mở hoặc đóng popup tùy chỉnh cột.
/// CREATED BY: VVHung (09/06/2026)
const isColumnSettingsOpen = ref(false)
/// DOM ref bọc nút thiết lập và popup tùy chỉnh cột.
/// CREATED BY: VVHung (07/06/2026)
const settingRef = ref<HTMLElement | null>(null)
/// Query key lấy cấu hình cột của grid.
/// CREATED BY: VVHung (11/06/2026)
const gridConfigQueryKey = computed(() => ['grid-config', props.gridKey])

/// Response cấu hình cột nhận từ API GridConfig.
/// CREATED BY: VVHung (08/06/2026)
const { data: gridConfigResponse } = useQuery({
  queryKey: gridConfigQueryKey,
  queryFn: () => GridConfigAPI.getGridKey(props.gridKey),
})

/// Danh sách cột đưa vào popup tùy chỉnh cột.
/// CREATED BY: VVHung (13/06/2026)
const gridConfigColumns = computed(() => {
  const payload = normalizeResponseData(gridConfigResponse.value)
  const columns = Array.isArray(payload) ? payload : payload.data || []

  return columns
    .map(normalizeColumn)
    .sort((a: { sortOrder: any }, b: { sortOrder: any }) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
})

/// Mutation lưu cấu hình ẩn hiện và sortOrder cột.
/// CREATED BY: VVHung (11/06/2026)
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
/// Cờ loading khi đang lưu cấu hình cột.
/// CREATED BY: VVHung (09/06/2026)
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

/// Mở hoặc đóng popup tùy chỉnh cột của grid.
/// CREATED BY: VVHung (11/6/2026)
function toggleColumnSettings() {
  isColumnSettingsOpen.value = !isColumnSettingsOpen.value
}

/// Đóng popup tùy chỉnh cột khi người dùng click ra ngoài.
/// <param name="event">Sự kiện mousedown trên document.</param>
/// CREATED BY: VVHung (11/6/2026)
function handleDocumentMouseDown(event: MouseEvent) {
  if (!isColumnSettingsOpen.value) return
  if (settingRef.value?.contains(event.target as Node)) return
  isColumnSettingsOpen.value = false
}

/// Lưu cấu hình cột mới và cập nhật cache để grid hiển thị ngay.
/// <param name="columns">Danh sách cột sau khi người dùng tùy chỉnh.</param>
/// CREATED BY: VVHung (11/6/2026)
function saveColumnSettings(columns: any[]) {
  isColumnSettingsOpen.value = false
  updateGridConfigCache(columns)
  saveColumnSettingsMutation.mutate(columns)
}

/// Chuẩn hóa response cấu hình grid về payload sử dụng trong component.
/// <param name="response">Response trả về từ API hoặc cache Vue Query.</param>
/// <returns>Payload cấu hình grid.</returns>
/// CREATED BY: VVHung (11/6/2026)
function normalizeResponseData(response: any) {
  return response?.data?.data ?? response?.data ?? {}
}

/// Chuẩn hóa một cột cấu hình từ backend về format frontend.
/// <param name="column">Cấu hình cột cần chuẩn hóa.</param>
/// <returns>Cấu hình cột sau khi chuẩn hóa.</returns>
/// CREATED BY: VVHung (11/6/2026)
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

/// Cập nhật cache cấu hình cột để popup và grid dùng cùng thứ tự mới.
/// <param name="columns">Danh sách cột mới cần ghi vào cache.</param>
/// CREATED BY: VVHung (11/6/2026)
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

/// Lấy danh sách cột từ payload cấu hình grid.
/// <param name="payload">Payload cấu hình grid.</param>
/// <returns>Danh sách cột cấu hình.</returns>
/// CREATED BY: VVHung (11/6/2026)
function getGridConfigColumns(payload: any) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

/// Thay danh sách cột trong cache nhưng vẫn giữ nguyên cấu trúc response cũ.
/// <param name="oldData">Dữ liệu cache hiện tại.</param>
/// <param name="nextColumns">Danh sách cột mới.</param>
/// <returns>Dữ liệu cache sau khi thay danh sách cột.</returns>
/// CREATED BY: VVHung (11/6/2026)
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

/// Chuẩn hóa giá trị boolean từ backend hoặc form.
/// <param name="value">Giá trị cần chuẩn hóa.</param>
/// <returns>Giá trị boolean sau khi chuẩn hóa.</returns>
/// CREATED BY: VVHung (11/6/2026)
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
  min-height: 56px;
  border-radius: 8px 8px 0 0;
}

.grid-options__inner {
  width: 100%;
  min-width: 0;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.grid-options__left {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.grid-options__search {
  width: 300px;
  min-width: 180px;
  flex: 0 1 300px;
}

.grid-options__actions {
  min-width: 72px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.grid-options.is-filter-open .grid-options__inner {
  align-items: flex-start;
}

.grid-options.is-filter-open .grid-options__left {
  flex-wrap: wrap;
  row-gap: 8px;
}

.grid-options.is-filter-open .grid-options__search {
  width: 210px;
  flex-basis: 210px;
}

.grid-options.is-filter-open :deep(.ms-tree-select) {
  max-width: min(330px, 100%);
}

@media (max-width: 1366px) {
  .grid-options {
    padding: 12px;
  }

  .grid-options__search {
    width: 200px;
    flex-basis: 200px;
  }

  .grid-options.is-filter-open .grid-options__search {
    width: 200px;
    flex-basis: 200px;
  }

  .grid-options.is-filter-open :deep(.ms-tree-select) {
    max-width: 270px;
  }
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

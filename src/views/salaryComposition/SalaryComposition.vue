<template>
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
        <RouterLink :to="path.add" style="text-decoration: none">
          <MsButton border-radius="8px 0 0 8px" gap="4px">
            <div class="mi-plus-white"></div>
            <div class="action-add-text">Thêm</div>
          </MsButton>
        </RouterLink>
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

  <GridOptions v-model:search="searchKeyword" :bulk-mode="hasSelectedRows">
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
        >
          <span class="mi-trash-red"></span>
          <span class="button-action-text">Xóa</span>
        </MsButton>
      </div>
    </template>
  </GridOptions>
  <GridTable
    :search="debouncedSearchKeyword"
    :filters="salaryCompositionFilters"
    :clear-selection-signal="clearSelectionSignal"
    @selection-change="selectedRows = $event"
  />

  <Teleport to="body">
    <div v-if="isSystemPickerOpen" class="ms-popup-overlay">
      <div class="ms-popup-container" @click.stop>
        <div class="ms-popup__header">
          <h3>Thêm từ danh mục của hệ thống</h3>
          <button type="button" class="ms-popup__close" @click="closeSystemPicker">
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
              :options="salaryCompositionTypeOptions"
              label-key="typeName"
              value-key="salaryCompositionTypeID"
              :menu-width="210"
            />
          </div>

          <div class="system-picker-grid">
            <GridTable
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
            @click="closeSystemPicker"
          >
            Hủy bỏ
          </MsButton>
          <MsButton width="80px" :disabled="!hasSystemPickerSelection" @click="confirmSystemPicker">
            Đồng ý
          </MsButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import GridOptions from '@/components/GridOptions.vue'
import GridTable from '@/components/GridTable.vue'
import MsButton from '@/components/MsButton.vue'
import { path } from '@/utils/path'
import { useQuery } from '@tanstack/vue-query'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import OrganizationAPI from '@/apis/components/organization/Organization.js'
import SalaryCompositionAPI from '@/apis/components/salaryComposition/SalaryCompositionAPI'
import SalaryCompositionSystemAPI from '@/apis/components/salaryCompositionSystem/SalaryCompositionSystem'
import SalaryCompositionTypeAPI from '@/apis/components/salaryCompositionType/SalaryCompositionType'
import MsInput from '@/components/MsInput.vue'
import MsSelect from '@/components/MsSelect.vue'
import MsTreeSelect from '@/components/MsTreeSelect.vue'

const selectedStatus = ref<number | string | null>(null)
const selectedOrganizationIds = ref<string[]>([])
const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
const selectedRows = ref<any[]>([])
const clearSelectionSignal = ref(0)
const isAddMenuOpen = ref(false)
const addActionRef = ref<HTMLElement | null>(null)
const isSystemPickerOpen = ref(false)
const selectedSystemPickerTypeId = ref<number | string | null>(null)
const systemPickerSearchKeyword = ref('')
const systemPickerSearchInputRef = ref<InstanceType<typeof MsInput> | null>(null)
const debouncedSystemPickerSearchKeyword = ref('')
const systemPickerSelectedRows = ref<any[]>([])
const systemPickerClearSelectionSignal = ref(0)
let searchDebounceTimer: ReturnType<typeof window.setTimeout> | null = null
let systemPickerSearchDebounceTimer: ReturnType<typeof window.setTimeout> | null = null

const { data: organizationResponse } = useQuery({
  queryKey: ['organizations'],
  queryFn: () => OrganizationAPI.getAll(),
})

const { data: salaryCompositionEnumResponse } = useQuery({
  queryKey: ['salaryCompositionEnum'],
  queryFn: () => SalaryCompositionAPI.enum(),
})

const { data: salaryCompositionTypeResponse } = useQuery({
  queryKey: ['salaryCompositionTypes'],
  queryFn: () => SalaryCompositionTypeAPI.getAll(),
})

const organizations = computed(() => organizationResponse.value?.data?.data ?? [])
const salaryCompositionEnum = computed(
  () => salaryCompositionEnumResponse.value?.data?.data ?? salaryCompositionEnumResponse.value?.data ?? {},
)
const statusOptions = computed(() => [
  { label: 'Tất cả', value: null },
  ...(salaryCompositionEnum.value.statuses ?? []),
])
const salaryCompositionTypeOptions = computed(() => [
  {
    typeName: 'Tất cả',
    salaryCompositionTypeID: null,
  },

  ...(salaryCompositionTypeResponse.value?.data?.data ?? []),
])
const hasSelectedRows = computed(() => selectedRows.value.length > 0)
const selectedHasActive = computed(() => selectedRows.value.some((row) => isActiveStatus(row)))
const selectedHasInactive = computed(() => selectedRows.value.some((row) => !isActiveStatus(row)))
const hasSystemPickerSelection = computed(() => systemPickerSelectedRows.value.length > 0)

watch(searchKeyword, (value) => {
  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = window.setTimeout(() => {
    debouncedSearchKeyword.value = value
  }, 300)
})

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
  const filters: Record<string, string | number> = {}

  if (selectedStatus.value !== null && selectedStatus.value !== '') {
    filters.status = Number(selectedStatus.value)
  }

  if (selectedOrganizationIds.value.length) {
    filters.organizationIDs = selectedOrganizationIds.value.join(';')
  }

  return filters
})

const systemPickerFilters = computed(() => {
  if (!selectedSystemPickerTypeId.value) return {}

  return {
    salaryCompositionTypeID: selectedSystemPickerTypeId.value,
  }
})

function getStatusValue(row: any) {
  return row?.status ?? row?.Status ?? row?.statusName ?? row?.StatusName
}

function isActiveStatus(row: any) {
  const value = getStatusValue(row)
  if (typeof value === 'string') return !value.toLowerCase().includes('ngừng')
  return Number(value) === 1
}

function clearSelectedRows() {
  clearSelectionSignal.value += 1
}

function toggleAddMenu() {
  isAddMenuOpen.value = !isAddMenuOpen.value
}

async function openSystemPicker() {
  isAddMenuOpen.value = false
  isSystemPickerOpen.value = true
  await nextTick()
  systemPickerSearchInputRef.value?.focus()
}

function closeSystemPicker() {
  isSystemPickerOpen.value = false
  selectedSystemPickerTypeId.value = null
  systemPickerSearchKeyword.value = ''
  debouncedSystemPickerSearchKeyword.value = ''
  systemPickerClearSelectionSignal.value += 1
  systemPickerSelectedRows.value = []
}

function confirmSystemPicker() {
  if (!hasSystemPickerSelection.value) return
  closeSystemPicker()
}

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
  right: 0;
  z-index: 100;
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

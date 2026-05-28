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
      <div class="container-action-add">
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
        >
          <div class="mi-chevron-down-white"></div>
        </MsButton>
      </div>
    </div>
  </div>

  <GridOptions v-model:search="searchKeyword">
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
  </GridOptions>
  <GridTable
    :search="debouncedSearchKeyword"
    search-fields="SalaryCompositionCode,SalaryCompositionName"
    :filters="salaryCompositionFilters"
  />
</template>

<script setup lang="ts">
import GridOptions from '@/components/GridOptions.vue'
import GridTable from '@/components/GridTable.vue'
import MsButton from '@/components/MsButton.vue'
import { path } from '@/utils/path'
import { useQuery } from '@tanstack/vue-query'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import OrganizationAPI from '@/apis/components/organization/Organization.js'
import MsSelect from '@/components/MsSelect.vue'
import MsTreeSelect from '@/components/MsTreeSelect.vue'

const selectedStatus = ref<number | string>('')
const selectedOrganizationIds = ref<string[]>([])
const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')
let searchDebounceTimer: ReturnType<typeof window.setTimeout> | null = null

const statusOptions = [
  { label: 'Tất cả', value: null },
  { label: 'Đang theo dõi', value: 1 },
  { label: 'Ngừng theo dõi', value: 0 },
]

const { data: organizationResponse } = useQuery({
  queryKey: ['organizations'],
  queryFn: () => OrganizationAPI.getAll(),
})

const organizations = computed(() => organizationResponse.value?.data?.data ?? [])

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
</style>

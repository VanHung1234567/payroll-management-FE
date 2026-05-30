<template>
  <div class="ms-pagination">
    <div class="ms-pagination__total">
      Tổng số: <b>{{ total }}</b>
    </div>

    <div v-if="total > 0" class="ms-pagination__right">
      <label class="ms-pagination__page-size">
        <span>Số dòng/trang</span>
      </label>
      <MsSelect
        :model-value="pageSize"
        :options="pageSizeSelectOptions"
        width="80px"
        menu-width="80px"
        placement="top"
        variant="form"
        @update:model-value="selectPageSize"
      />

      <div class="ms-pagination__range">{{ pageFrom }} - {{ pageTo }}</div>

      <div class="ms-pagination__buttons">
        <button type="button" :disabled="isFirstPage" @click="goToPage(1)">
          <svg class="ms-pagination__svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M4 4V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <button type="button" :disabled="isFirstPage" @click="goToPage(pageIndex - 1)">
          <svg class="ms-pagination__svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button type="button" :disabled="isLastPage" @click="goToPage(pageIndex + 1)">
          <svg class="ms-pagination__svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button type="button" :disabled="isLastPage" @click="goToPage(totalPages)">
          <svg class="ms-pagination__svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M12 4V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MsSelect from '@/components/MsSelect.vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
  pageIndex: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 15,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [15, 25, 50, 100],
  },
})

const emit = defineEmits(['update:pageIndex', 'update:pageSize'])

const totalPages = computed(() => Math.max(Math.ceil(props.total / props.pageSize), 1))
const isFirstPage = computed(() => props.pageIndex <= 1)
const isLastPage = computed(() => props.pageIndex >= totalPages.value)
const pageFrom = computed(() => (props.total ? (props.pageIndex - 1) * props.pageSize + 1 : 0))
const pageTo = computed(() => Math.min(props.pageIndex * props.pageSize, props.total))
const pageSizeSelectOptions = computed(() =>
  props.pageSizeOptions.map((size) => ({
    label: String(size),
    value: Number(size),
  })),
)

function goToPage(page) {
  const nextPage = Math.min(Math.max(page, 1), totalPages.value)
  emit('update:pageIndex', nextPage)
}

function selectPageSize(size) {
  emit('update:pageSize', Number(size))
  emit('update:pageIndex', 1)
}
</script>

<style scoped>
.ms-pagination {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #d5d7da;
  background: #fff;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
}

.ms-pagination__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ms-pagination__page-size {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ms-pagination__range {
  min-width: 52px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 1px;
}

.ms-pagination__buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ms-pagination__buttons button {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #717680;
  cursor: pointer;
}

.ms-pagination__buttons button:hover:not(:disabled) {
  background: #e9eaeb;
}

.ms-pagination__buttons button:disabled {
  color: #d5d7da;
  cursor: not-allowed;
}

.ms-pagination__svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>

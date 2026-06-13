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
        <button type="button" title="Trang đầu" :disabled="isFirstPage" @click="goToPage(1)">
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
        <button type="button" title="Trang trước" :disabled="isFirstPage" @click="goToPage(pageIndex - 1)">
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
        <button type="button" title="Trang sau" :disabled="isLastPage" @click="goToPage(pageIndex + 1)">
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
        <button type="button" title="Trang cuối" :disabled="isLastPage" @click="goToPage(totalPages)">
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

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (10/06/2026)
const props = defineProps({
  // Tổng số bản ghi từ API.
  total: {
    type: Number,
    default: 0,
  },
  // Trang hiện tại, dùng với v-model:page-index.
  pageIndex: {
    type: Number,
    default: 1,
  },
  // Số dòng/trang, dùng với v-model:page-size.
  pageSize: {
    type: Number,
    default: 15,
  },
  // Danh sách lựa chọn số dòng/trang.
  pageSizeOptions: {
    type: Array,
    default: () => [15, 25, 50, 100],
  },
})

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (13/06/2026)
const emit = defineEmits(['update:pageIndex', 'update:pageSize'])

/// Tổng số trang tính từ total và pageSize.
/// CREATED BY: VVHung (10/06/2026)
const totalPages = computed(() => Math.max(Math.ceil(props.total / props.pageSize), 1))
/// Biến xác định đang ở trang đầu tiên.
/// CREATED BY: VVHung (07/06/2026)
const isFirstPage = computed(() => props.pageIndex <= 1)
/// Biến xác định đang ở trang cuối cùng.
/// CREATED BY: VVHung (09/06/2026)
const isLastPage = computed(() => props.pageIndex >= totalPages.value)
/// Số thứ tự bản ghi đầu tiên của trang hiện tại.
/// CREATED BY: VVHung (11/06/2026)
const pageFrom = computed(() => (props.total ? (props.pageIndex - 1) * props.pageSize + 1 : 0))
/// Số thứ tự bản ghi cuối cùng của trang hiện tại.
/// CREATED BY: VVHung (12/06/2026)
const pageTo = computed(() => Math.min(props.pageIndex * props.pageSize, props.total))
/// Danh sách option phục vụ page size select options.
/// CREATED BY: VVHung (12/06/2026)
const pageSizeSelectOptions = computed(() =>
  props.pageSizeOptions.map((size) => ({
    label: String(size),
    value: Number(size),
  })),
)

/// Chuyển đến trang được yêu cầu và giới hạn trong khoảng hợp lệ.
/// <param name="page">Số trang cần chuyển đến.</param>
/// CREATED BY: VVHung (03/06/2026)
function goToPage(page) {
  const nextPage = Math.min(Math.max(page, 1), totalPages.value)
  emit('update:pageIndex', nextPage)
}

/// Đổi số dòng mỗi trang và đưa về trang đầu tiên.
/// <param name="size">Số dòng mỗi trang được chọn.</param>
/// CREATED BY: VVHung (03/06/2026)
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

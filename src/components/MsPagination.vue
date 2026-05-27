<template>
  <div class="ms-pagination">
    <div class="ms-pagination__total">
      Tổng số: <b>{{ total }}</b>
    </div>

    <div class="ms-pagination__right">
      <label class="ms-pagination__page-size">
        <span>Số dòng/trang</span>
        <div ref="pageSizeSelectRef" class="ms-pagination__select">
          <button
            type="button"
            class="ms-pagination__select-button"
            :class="{ 'is-open': isPageSizeOpen }"
            @click="togglePageSizeDropdown"
          >
            <span>{{ pageSize }}</span>
            <span class="mi-chevron-down-black"></span>
          </button>

          <div v-if="isPageSizeOpen" class="ms-pagination__select-menu">
            <button
              v-for="size in pageSizeOptions"
              :key="size"
              type="button"
              class="ms-select__option"
              :class="{ 'ms-select__option--selected': Number(pageSize) === Number(size) }"
              @click="selectPageSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>
      </label>

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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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

const isPageSizeOpen = ref(false)
const pageSizeSelectRef = ref(null)

const totalPages = computed(() => Math.max(Math.ceil(props.total / props.pageSize), 1))
const isFirstPage = computed(() => props.pageIndex <= 1)
const isLastPage = computed(() => props.pageIndex >= totalPages.value)
const pageFrom = computed(() => (props.total ? (props.pageIndex - 1) * props.pageSize + 1 : 0))
const pageTo = computed(() => Math.min(props.pageIndex * props.pageSize, props.total))

function goToPage(page) {
  const nextPage = Math.min(Math.max(page, 1), totalPages.value)
  emit('update:pageIndex', nextPage)
}

function togglePageSizeDropdown() {
  isPageSizeOpen.value = !isPageSizeOpen.value
}

function selectPageSize(size) {
  emit('update:pageSize', Number(size))
  emit('update:pageIndex', 1)
  isPageSizeOpen.value = false
}

function handleDocumentClick(event) {
  if (!pageSizeSelectRef.value?.contains(event.target)) {
    isPageSizeOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
})
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
  gap: 24px;
}

.ms-pagination__page-size {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ms-pagination__select {
  position: relative;
  width: 80px;
}

.ms-pagination__select-button {
  width: 80px;
  height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #fff;
  color: #101828;
  font: inherit;
  line-height: 18px;
  cursor: pointer;
  outline: none;
  letter-spacing: 1px;
}

.ms-pagination__select-button:hover,
.ms-pagination__select-button.is-open {
  border-color: #0e9a62;
}

.ms-pagination__select-button.is-open .mi-chevron-down-black {
  transform: rotate(180deg);
}

.ms-pagination__select-menu {
  position: absolute;
  left: 0;
  bottom: calc(100% + 4px);
  z-index: 50;
  width: 80px;
  padding: 4px 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px #0000001f;
  overflow: hidden;
}

.ms-select__option {
  width: 100%;
  height: 34px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  border: none;
  background: #fff;
  color: #101828;
  font: inherit;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
}

.ms-select__option:hover {
  background: #e9eaeb;
}

.ms-select__option--selected,
.ms-select__option--selected:hover {
  color: #0e9a62;
  background: #cdeadf;
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
  cursor: default;
}

.ms-pagination__svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.mi-chevron-down-black {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../assets/images/ICON_3.svg');
  -webkit-mask-position: -32px -224px;
  -webkit-mask-size: 752px 400px;
  -webkit-mask-repeat: no-repeat;
  background-image: none;
  background-color: #717680;
  transition: transform 0.12s ease;
}
</style>

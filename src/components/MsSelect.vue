<template>
  <div
    ref="selectRef"
    class="ms-select"
    :class="[`ms-select--${variant}`, { 'is-error': isInvalid, 'is-full-width': fullWidth }]"
    :style="selectStyle"
  >
    <button
      ref="triggerRef"
      type="button"
      class="ms-select__trigger"
      :class="{ 'is-open': isOpen, 'is-chevron-rotated': isOpen && placement === 'top' }"
      :style="triggerStyle"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <template v-if="searchable && isOpen">
        <input
          ref="searchInputRef"
          v-model="searchText"
          class="ms-select__search-input"
          :placeholder="searchPlaceholder || placeholder"
          @click.stop
          @keydown.stop
        />
      </template>
      <template v-else>
        <span v-if="label" class="ms-select__label">{{ label }}:</span>
        <span class="ms-select__value" :class="{ 'is-placeholder': !selectedOption }">
          <template v-if="selectedOption && hasOptionCode(selectedOption)">
            <span>{{ getOptionLabel(selectedOption) }} (</span>
            <span class="ms-select__code">{{ getOptionCode(selectedOption) }}</span>
            <span>)</span>
          </template>
          <template v-else>{{ selectedLabel }}</template>
        </span>
      </template>
      <span :class="variant === 'form' ? 'chevron-down-form' : 'mi-chevron-down'"></span>
    </button>

    <div v-if="isOpen" class="ms-select__menu" :class="menuClass" :style="menuStyle">
      <button
        v-for="option in filteredOptions"
        :key="getOptionValue(option) ?? 'all'"
        type="button"
        class="ms-select__item"
        :class="{ 'is-active': isSelected(option) }"
        @click="selectOption(option)"
      >
        <span class="ms-select__item-label">
          <template v-if="hasOptionCode(option)">
            <span>{{ getOptionLabel(option) }} (</span>
            <span class="ms-select__code">{{ getOptionCode(option) }}</span>
            <span>)</span>
          </template>
          <template v-else>{{ getOptionLabel(option) }}</template>
        </span>
        <span v-if="isSelected(option) && variant !== 'form'" class="mi-check"></span>
      </button>

      <div v-if="!filteredOptions.length" class="ms-select__empty">Không có dữ liệu</div>
    </div>

    <div v-if="isInvalid && errorMessage" class="ms-select__error text-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  // Giá trị đang chọn, dùng với v-model.
  modelValue: {
    type: [String, Number, Boolean],
    default: null,
  },
  // Danh sách option nguồn.
  options: {
    type: Array,
    default: () => [],
  },
  // Nhãn đứng trước giá trị, ví dụ "Trạng thái".
  label: {
    type: String,
    default: '',
  },
  // Text hiển thị khi chưa chọn.
  placeholder: {
    type: String,
    default: '',
  },
  // Tên field lấy label từ option.
  labelKey: {
    type: String,
    default: 'label',
  },
  // Tên field lấy value từ option.
  valueKey: {
    type: String,
    default: 'value',
  },
  // Tên field mã/code để hiển thị dạng Label (CODE).
  codeKey: {
    type: String,
    default: '',
  },
  // Chiều rộng trigger.
  width: {
    type: [Number, String],
    default: 'auto',
  },
  // Padding riêng cho trigger.
  triggerPadding: {
    type: String,
    default: '',
  },
  // Letter spacing riêng cho trigger.
  letterSpacing: {
    type: [Number, String],
    default: '',
  },
  // Chiều rộng dropdown menu.
  menuWidth: {
    type: [Number, String],
    default: 160,
  },
  // Disable select.
  disabled: {
    type: Boolean,
    default: false,
  },
  // Cho phép gõ tìm trong dropdown.
  searchable: {
    type: Boolean,
    default: false,
  },
  // Placeholder của ô search khi searchable.
  searchPlaceholder: {
    type: String,
    default: '',
  },
  // Hướng mở menu.
  placement: {
    type: String,
    default: 'bottom',
    validator: (value) => ['bottom', 'top'].includes(value),
  },
  // Ép select chiếm 100% width.
  fullWidth: {
    type: Boolean,
    default: false,
  },
  // Biến thể style: filter hoặc form.
  variant: {
    type: String,
    default: 'filter',
    validator: (value) => ['filter', 'form'].includes(value),
  },
  // Message lỗi.
  errorMessage: {
    type: String,
    default: '',
  },
  // Metadata validate, thường dùng meta.touched.
  meta: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'blur'])

const selectRef = ref(null)
const triggerRef = ref(null)
const searchInputRef = ref(null)
const isOpen = ref(false)
const searchText = ref('')
const shouldFilterSearch = ref(false)
const suppressNextSearchWatch = ref(false)

/// Chuẩn hóa giá trị kích thước CSS sang đơn vị px khi nhận vào dạng number.
/// <param name="value">Giá trị kích thước cần chuẩn hóa.</param>
/// <returns>Giá trị kích thước hợp lệ cho CSS.</returns>
/// CREATED BY: VVHung (03/06/2026)
const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

const selectStyle = computed(() => ({
  width: normalizeCssSize(props.width),
}))

const triggerStyle = computed(() => {
  const style = {}
  if (props.triggerPadding) style.padding = props.triggerPadding
  if (props.letterSpacing !== '') style.letterSpacing = normalizeCssSize(props.letterSpacing)
  return style
})

const menuStyle = computed(() => ({
  width: normalizeCssSize(props.menuWidth),
}))

const menuClass = computed(() => ({
  'ms-select__menu--top': props.placement === 'top',
}))

/// Lấy label hiển thị của một option.
/// <param name="option">Option cần lấy label.</param>
/// <returns>Label của option.</returns>
/// CREATED BY: VVHung (03/06/2026)
const getOptionLabel = (option) => option?.[props.labelKey] ?? ''

/// Lấy giá trị model của một option.
/// <param name="option">Option cần lấy giá trị.</param>
/// <returns>Giá trị của option.</returns>
/// CREATED BY: VVHung (03/06/2026)
const getOptionValue = (option) => option?.[props.valueKey] ?? null

/// Lấy mã code của option nếu component được cấu hình codeKey.
/// <param name="option">Option cần lấy code.</param>
/// <returns>Code của option hoặc chuỗi rỗng.</returns>
/// CREATED BY: VVHung (03/06/2026)
const getOptionCode = (option) => (props.codeKey ? (option?.[props.codeKey] ?? '') : '')

/// Kiểm tra option có code để hiển thị dạng Label (CODE) hay không.
/// <param name="option">Option cần kiểm tra.</param>
/// <returns>true nếu option có code, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
const hasOptionCode = (option) => Boolean(getOptionCode(option))

/// Tạo chuỗi tìm kiếm từ label và code của option.
/// <param name="option">Option cần tạo chuỗi tìm kiếm.</param>
/// <returns>Chuỗi tìm kiếm đã chuẩn hóa.</returns>
/// CREATED BY: VVHung (03/06/2026)
const getOptionSearchText = (option) =>
  `${getOptionLabel(option)} ${getOptionCode(option)}`.trim().toLowerCase()

const selectedOption = computed(() =>
  props.options.find((option) => getOptionValue(option) === props.modelValue),
)

const selectedLabel = computed(() =>
  selectedOption.value ? getOptionLabel(selectedOption.value) : props.placeholder,
)

const filteredOptions = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!props.searchable || !keyword || !shouldFilterSearch.value) return props.options

  return props.options.filter((option) => getOptionSearchText(option).includes(keyword))
})

const isInvalid = computed(() => Boolean(props.errorMessage && (!props.meta || props.meta.touched)))

/// Kiểm tra option có đang được chọn hay không.
/// <param name="option">Option cần kiểm tra.</param>
/// <returns>true nếu option đang được chọn, ngược lại false.</returns>
/// CREATED BY: VVHung (03/06/2026)
const isSelected = (option) => getOptionValue(option) === props.modelValue

/// Mở hoặc đóng dropdown khi click trigger.
/// CREATED BY: VVHung (03/06/2026)
const toggleDropdown = () => {
  if (!props.disabled) isOpen.value = !isOpen.value
}

/// Chọn option, cập nhật v-model và phát sự kiện change.
/// <param name="option">Option được chọn.</param>
/// CREATED BY: VVHung (03/06/2026)
const selectOption = (option) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', option)
  closeDropdown()
}

/// Đóng dropdown và reset trạng thái tìm kiếm.
/// CREATED BY: VVHung (03/06/2026)
const closeDropdown = () => {
  isOpen.value = false
  searchText.value = ''
  shouldFilterSearch.value = false
}

/// Xử lý click bên ngoài select để đóng dropdown và phát blur.
/// <param name="event">Sự kiện click trên document.</param>
/// CREATED BY: VVHung (03/06/2026)
const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    const wasOpen = isOpen.value
    closeDropdown()
    if (wasOpen) {
      emit('blur', event)
    }
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(isOpen, async (value) => {
  if (!value) {
    searchText.value = ''
    shouldFilterSearch.value = false
    return
  }

  if (props.searchable) {
    shouldFilterSearch.value = false
    suppressNextSearchWatch.value = true
    searchText.value = selectedOption.value ? getOptionLabel(selectedOption.value) : ''
    await nextTick()
    searchInputRef.value?.focus?.()
    searchInputRef.value?.setSelectionRange?.(searchText.value.length, searchText.value.length)
  }
})

watch(searchText, () => {
  if (suppressNextSearchWatch.value) {
    suppressNextSearchWatch.value = false
    return
  }

  if (isOpen.value && props.searchable) {
    shouldFilterSearch.value = true
  }
})

defineExpose({
  focus: async () => {
    if (props.disabled) return

    if (props.searchable) {
      isOpen.value = true
      await nextTick()
      searchInputRef.value?.focus?.()
      return
    }

    triggerRef.value?.focus?.()
  },
})
</script>

<style scoped>
.ms-select {
  position: relative;
  display: inline-flex;
  flex-direction: column;
}

.ms-select.is-full-width {
  width: 100%;
}

.ms-select__trigger {
  width: 100%;
  height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #fff;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
}

.ms-select--form .ms-select__trigger {
  gap: 12px;
  padding: 0 8px 0 12px;
  letter-spacing: 0;
}

.ms-select:not(.is-error) .ms-select__trigger:hover:not(:disabled),
.ms-select:not(.is-error) .ms-select__trigger.is-open {
  background-color: #e9eaeb;
  border-color: #d5d7da;
}

.ms-select--form:not(.is-error) .ms-select__trigger:hover:not(:disabled),
.ms-select--form:not(.is-error) .ms-select__trigger.is-open {
  background-color: #fff;
  border-color: #0e9a62;
  box-shadow: 0 0 0 2px #2563eb1a;
}

.ms-select__trigger:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.ms-select__label {
  color: #667085;
}

.ms-select__value {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #101828;
  font-weight: 500;
  text-align: left;
}

.ms-select__value.is-placeholder {
  color: #98a2b3;
  font-weight: 400;
}

.ms-select--form .ms-select__value {
  font-weight: 400;
}

.ms-select__code {
  font-weight: 500;
}

.ms-select__search-input {
  min-width: 0;
  width: 100%;
  height: 30px;
  flex: 1;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #101828;
  caret-color: #0e9a62;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  text-align: left;
}

.ms-select__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 30;
  padding: 8px 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px #0000001f;
  box-sizing: border-box;
  max-height: 336px;
  overflow: auto;
}

.ms-select--form .ms-select__menu {
  padding: 4px 0;
}

.ms-select__menu--top {
  top: auto;
  bottom: calc(100% + 4px);
}

.ms-select.is-error .ms-select__menu:not(.ms-select__menu--top) {
  top: calc(100% - 18px);
}

.ms-select__item {
  width: 100%;
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: none;
  background: transparent;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 4px;
}

.ms-select--form .ms-select__item {
  min-height: 34px;
  height: auto;
  padding: 8px 12px;
}

.ms-select__item:hover {
  background: #e9eaeb;
}

.ms-select__item.is-active {
  background: #cdeadf;
  color: #0e9a62;
  font-weight: 500;
}

.ms-select--form .ms-select__item.is-active {
  background: #edfcf4;
}

.ms-select__item-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-select__empty {
  padding: 8px 12px;
  color: #717680;
  font-size: 13px;
  line-height: 18px;
}

.ms-select.is-error .ms-select__trigger {
  border-color: #f04438;
}

.ms-select__error {
  margin-top: 4px;
  color: #f04438;
  font-size: 12px;
  height: auto;
  line-height: 20px;
}

.text-error {
  color: #f7453b !important;
  font-size: 12px !important;
  height: auto;
  line-height: 20px;
  margin-top: 8px !important;
}

.mi-check {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 11px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -103px -65px;
  -webkit-mask-repeat: no-repeat;
  background-color: #0e9a62;
}

.mi-chevron-down {
  display: inline-block;
  flex-shrink: 0;
  width: 12px;
  height: 8px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -124px -6px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
  margin-left: 4px;
  margin-right: 0;
  transition: transform 0.12s ease;
}

.chevron-down-form {
  display: inline-block;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../assets/images/ICON_3.svg');
  -webkit-mask-position: -32px -224px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 752px 400px;
  flex-shrink: 0;
  background-image: none;
  background-color: #717680;
  margin-left: auto;
  transition: transform 0.12s ease;
}

.ms-select__trigger.is-chevron-rotated .mi-chevron-down,
.ms-select__trigger.is-chevron-rotated .chevron-down-form {
  transform: rotate(180deg);
}
</style>

<template>
  <div
    ref="selectRef"
    class="ms-select"
    :class="[`ms-select--${variant}`, { 'is-error': isInvalid, 'is-full-width': fullWidth }]"
    :style="selectStyle"
  >
    <button
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
        <span class="ms-select__value">{{ selectedLabel }}</span>
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
        <span class="ms-select__item-label">{{ getOptionLabel(option) }}</span>
        <span v-if="isSelected(option) && variant !== 'form'" class="mi-check"></span>
      </button>

      <div v-if="!filteredOptions.length" class="ms-select__empty">Không có dữ liệu</div>
    </div>

    <div v-if="isInvalid && errorMessage" class="ms-select__error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  width: {
    type: [Number, String],
    default: 'auto',
  },
  triggerPadding: {
    type: String,
    default: '',
  },
  letterSpacing: {
    type: [Number, String],
    default: '',
  },
  menuWidth: {
    type: [Number, String],
    default: 160,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: '',
  },
  placement: {
    type: String,
    default: 'bottom',
    validator: (value) => ['bottom', 'top'].includes(value),
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'filter',
    validator: (value) => ['filter', 'form'].includes(value),
  },
  errorMessage: {
    type: String,
    default: '',
  },
  meta: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectRef = ref(null)
const searchInputRef = ref(null)
const isOpen = ref(false)
const searchText = ref('')
const shouldFilterSearch = ref(false)
const suppressNextSearchWatch = ref(false)

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

const getOptionLabel = (option) => option?.[props.labelKey] ?? ''
const getOptionValue = (option) => option?.[props.valueKey] ?? null

const selectedOption = computed(() =>
  props.options.find((option) => getOptionValue(option) === props.modelValue),
)

const selectedLabel = computed(() =>
  selectedOption.value ? getOptionLabel(selectedOption.value) : props.placeholder,
)

const filteredOptions = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!props.searchable || !keyword || !shouldFilterSearch.value) return props.options

  return props.options.filter((option) => getOptionLabel(option).toLowerCase().includes(keyword))
})

const isInvalid = computed(() => Boolean(props.errorMessage && (!props.meta || props.meta.touched)))

const isSelected = (option) => getOptionValue(option) === props.modelValue

const toggleDropdown = () => {
  if (!props.disabled) isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', option)
  closeDropdown()
}

const closeDropdown = () => {
  isOpen.value = false
  searchText.value = ''
  shouldFilterSearch.value = false
}

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    closeDropdown()
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

.ms-select__trigger:hover,
.ms-select__trigger.is-open {
  background-color: #e9eaeb;
  border-color: #d5d7da;
}

.ms-select--form .ms-select__trigger:hover,
.ms-select--form .ms-select__trigger.is-open {
  background-color: #fff;
  border-color: #0e9a62;
  box-shadow: 0 0 0 2px #2563eb1a;
}

.ms-select__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.ms-select--form .ms-select__value {
  font-weight: 400;
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
  line-height: 16px;
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

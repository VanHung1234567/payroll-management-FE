<template>
  <div ref="selectRef" class="ms-select" :style="selectStyle">
    <button
      type="button"
      class="ms-select__trigger"
      :class="{ 'is-open': isOpen }"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <span v-if="label" class="ms-select__label">{{ label }}:</span>
      <span class="ms-select__value">{{ selectedLabel }}</span>
      <span class="mi-chevron-down"></span>
    </button>

    <div v-if="isOpen" class="ms-select__menu" :style="menuStyle">
      <button
        v-for="option in options"
        :key="getOptionValue(option) ?? 'all'"
        type="button"
        class="ms-select__item"
        :class="{ 'is-active': isSelected(option) }"
        @click="selectOption(option)"
      >
        <span class="ms-select__item-label">{{ getOptionLabel(option) }}</span>
        <span v-if="isSelected(option)" class="mi-check"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
    default: 'Chọn',
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
  menuWidth: {
    type: [Number, String],
    default: 160,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectRef = ref(null)
const isOpen = ref(false)

const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

const selectStyle = computed(() => ({
  width: normalizeCssSize(props.width),
}))

const menuStyle = computed(() => ({
  width: normalizeCssSize(props.menuWidth),
}))

const getOptionLabel = (option) => option?.[props.labelKey] ?? ''
const getOptionValue = (option) => option?.[props.valueKey] ?? null

const selectedOption = computed(() =>
  props.options.find((option) => getOptionValue(option) === props.modelValue),
)

const selectedLabel = computed(() =>
  selectedOption.value ? getOptionLabel(selectedOption.value) : props.placeholder,
)

const isSelected = (option) => getOptionValue(option) === props.modelValue

const toggleDropdown = () => {
  if (!props.disabled) isOpen.value = !isOpen.value
}

const selectOption = (option) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', option)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.ms-select {
  position: relative;
  display: inline-flex;
}

.ms-select__trigger {
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

.ms-select__trigger:hover,
.ms-select__trigger.is-open {
  background-color: #e9eaeb;
  border-color: #d5d7da;
}

.ms-select__trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ms-select__label {
  color: #667085;
}

.ms-select__value {
  color: #101828;
  font-weight: 500;
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
}
</style>

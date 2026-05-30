<template>
  <div class="ms-input" :class="{ 'is-error': isInvalid, 'is-disabled': disabled }">
    <label v-if="label" class="ms-input__label" :for="inputId">
      <span>{{ label }}</span>
      <span v-if="required" class="ms-input__required">*</span>
    </label>

    <div class="ms-input__control">
      <span title="Tìm kiếm" v-if="$slots.prefix" class="ms-input__icon ms-input__prefix">
        <slot name="prefix" />
      </span>

      <input
        ref="inputRef"
        :id="inputId"
        class="ms-input__field"
        :name="name"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :aria-invalid="isInvalid"
        :aria-describedby="errorId"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <span v-if="$slots.suffix" class="ms-input__icon ms-input__suffix">
        <slot name="suffix" />
      </span>
    </div>

    <div v-if="isInvalid && errorMessage" :id="errorId" class="ms-input__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: 'off',
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

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

const fallbackId = useId()
const inputRef = ref(null)
const inputId = computed(() => props.id || props.name || fallbackId)
const errorId = computed(() => (props.errorMessage ? `${inputId.value}-error` : undefined))
const isInvalid = computed(() => Boolean(props.errorMessage && (!props.meta || props.meta.touched)))

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

defineExpose({
  focus: () => inputRef.value?.focus?.(),
})
</script>

<style scoped>
.ms-input {
  width: 100%;
}

.ms-input__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  color: #101828;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
}

.ms-input__required {
  color: #f04438;
}

.ms-input__control {
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #fff;
  transition:
    border-color 0.12s ease,
    box-shadow 0.12s ease,
    background-color 0.12s ease;
}

.ms-input__control:hover,
.ms-input__control:focus-within {
  border-color: #0e9a62;
}

.ms-input.is-error .ms-input__control {
  border-color: #f04438;
}

.ms-input.is-disabled .ms-input__control {
  background: #f5f5f5;
  cursor: not-allowed;
}

.ms-input__field {
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
  font-size: 13px;
  line-height: 18px;
}

.ms-input__field::placeholder {
  color: #9da4b0;
}

.ms-input__field:disabled {
  cursor: not-allowed;
}

.ms-input__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ms-input__error {
  margin-top: 4px;
  color: #f04438;
  font-size: 12px;
  line-height: 16px;
}
</style>

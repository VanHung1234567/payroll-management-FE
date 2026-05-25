<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  backgroundColor: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  borderColor: {
    type: String,
    default: '',
  },
  borderRadius: {
    type: [Number, String],
    default: '',
  },
  hoverBackgroundColor: {
    type: String,
    default: '#0A724B',
  },
  hoverColor: {
    type: String,
    default: '',
  },
  hoverBorderColor: {
    type: String,
    default: '#0A724B',
  },
  activeBackgroundColor: {
    type: String,
    default: '#0B5A3D',
  },
  activeColor: {
    type: String,
    default: '',
  },
  activeBorderColor: {
    type: String,
    default: '#0B5A3D',
  },
  width: {
    type: String,
    default: 'auto',
  },
  height: {
    type: String,
    default: '32px',
  },
  justifyContent: {
    type: String,
    default: 'center',
  },
  buttonClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

const buttonStyle = computed(() => {
  const style = {}

  if (props.backgroundColor) style['--ms-button-bg'] = props.backgroundColor
  if (props.color) style['--ms-button-color'] = props.color
  if (props.borderColor) style['--ms-button-border-color'] = props.borderColor
  if (props.borderRadius) style['--ms-button-radius'] = normalizeCssSize(props.borderRadius)
  if (props.hoverBackgroundColor) style['--ms-button-hover-bg'] = props.hoverBackgroundColor
  if (props.hoverColor) style['--ms-button-hover-color'] = props.hoverColor
  if (props.hoverBorderColor) style['--ms-button-hover-border-color'] = props.hoverBorderColor
  if (props.activeBackgroundColor) style['--ms-button-active-bg'] = props.activeBackgroundColor
  if (props.activeColor) style['--ms-button-active-color'] = props.activeColor
  if (props.activeBorderColor) style['--ms-button-active-border-color'] = props.activeBorderColor
  if (props.width) style.width = normalizeCssSize(props.width)
  if (props.height) style.height = normalizeCssSize(props.height)
  if (props.justifyContent) {
    style.justifyContent = props.justifyContent
  }

  return style
})
</script>

<template>
  <button
    class="ms-button"
    :class="buttonClass"
    :type="type"
    :disabled="disabled"
    :style="buttonStyle"
  >
    <slot />
  </button>
</template>

<style scoped>
.ms-button {
  --ms-button-bg: #0e9a62;
  --ms-button-color: #ffffff;
  --ms-button-border-color: #0e9a62;
  --ms-button-radius: 8px;
  min-width: 0;
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--ms-button-border-color);
  border-radius: var(--ms-button-radius);
  background: var(--ms-button-bg);
  color: var(--ms-button-color);
  font: inherit;
  line-height: 30px;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  user-select: none;
  transition:
    background-color 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease;
}

.ms-button:hover:not(:disabled) {
  background: var(--ms-button-hover-bg, var(--ms-button-bg));
  color: var(--ms-button-hover-color, var(--ms-button-color));
  border-color: var(--ms-button-hover-border-color, var(--ms-button-border-color));
}

.ms-button:active:not(:disabled) {
  background: var(--ms-button-active-bg, var(--ms-button-hover-bg, var(--ms-button-bg)));
  color: var(--ms-button-active-color, var(--ms-button-hover-color, var(--ms-button-color)));
  border-color: var(
    --ms-button-active-border-color,
    var(--ms-button-hover-border-color, var(--ms-button-border-color))
  );
}

.ms-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>

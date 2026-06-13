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
<script setup>
import { computed } from 'vue'

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (10/06/2026)
const props = defineProps({
  // Loại button HTML.
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  // Disable button và chặn hover/active.
  disabled: {
    type: Boolean,
    default: false,
  },
  // Màu nền mặc định.
  backgroundColor: {
    type: String,
    default: '',
  },
  // Màu chữ mặc định.
  color: {
    type: String,
    default: '',
  },
  // Màu border mặc định.
  borderColor: {
    type: String,
    default: '',
  },
  // Bo góc button.
  borderRadius: {
    type: [Number, String],
    default: '',
  },
  // Màu nền khi hover.
  hoverBackgroundColor: {
    type: String,
    default: '#0A724B',
  },
  // Màu chữ khi hover.
  hoverColor: {
    type: String,
    default: '',
  },
  // Màu border khi hover.
  hoverBorderColor: {
    type: String,
    default: '#0A724B',
  },
  // Màu nền khi nhấn.
  activeBackgroundColor: {
    type: String,
    default: '#0B5A3D',
  },
  // Màu chữ khi nhấn.
  activeColor: {
    type: String,
    default: '',
  },
  // Màu border khi nhấn.
  activeBorderColor: {
    type: String,
    default: '#0B5A3D',
  },
  // Chiều rộng button.
  width: {
    type: [Number, String],
    default: 'auto',
  },
  // Chiều cao button.
  height: {
    type: [Number, String],
    default: 32,
  },
  // Cách căn nội dung theo trục ngang.
  justifyContent: {
    type: String,
    default: 'center',
  },
  // Class bổ sung truyền từ ngoài vào.
  buttonClass: {
    type: [String, Array, Object],
    default: '',
  },
  // Padding inline hoặc shorthand CSS.
  padding: {
    type: [Number, String],
    default: '0 12px',
  },
  // Margin inline hoặc shorthand CSS.
  margin: {
    type: [Number, String],
    default: '',
  },
  // Khoảng cách giữa icon/text trong slot.
  gap: {
    type: [Number, String],
    default: '',
  },
  // Chiều rộng tối thiểu.
  minWidth: {
    type: [Number, String],
    default: '',
  },
})

/// Hàm chuẩn hóa số thành đơn vị px cho style button.
/// CREATED BY: VVHung (09/06/2026)
const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

/// Style động của button theo props truyền vào.
/// CREATED BY: VVHung (09/06/2026)
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
  if (props.padding) style.padding = normalizeCssSize(props.padding)
  if (props.margin) style.margin = normalizeCssSize(props.margin)
  if (props.gap) style.gap = normalizeCssSize(props.gap)
  if (props.minWidth) style.minWidth = normalizeCssSize(props.minWidth)
  return style
})
</script>

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

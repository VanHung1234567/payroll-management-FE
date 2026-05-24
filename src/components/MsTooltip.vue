<script setup>
import { computed } from 'vue'

// content          // nội dung tooltip
// placement        // top | right | bottom | left
// align            // start | center | end
// hoverBackground  // màu vòng tròn hover, ví dụ #eff1f654 hoặc #0000001a
// hoverSize        // mặc định 36px
// offset           // khoảng cách tooltip với icon
// tooltipClass     // truyền class custom cho tooltip
// hoverClass       // truyền class custom cho wrapper hover
// fontSize         // cỡ chữ tooltip, ví dụ 13px
// fontWeight       // độ đậm tooltip
// lineHeight       // chiều cao dòng tooltip
// fontFamily       // font chữ tooltip
// disabled
// showArrow

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  placement: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value),
  },
  align: {
    type: String,
    default: 'center',
    validator: (value) => ['start', 'center', 'end'].includes(value),
  },
  hoverBackground: {
    type: String,
    default: '#eff1f654',
  },
  hoverSize: {
    type: [Number, String],
    default: 36,
  },
  offset: {
    type: [Number, String],
    default: 8,
  },
  showDelay: {
    type: [Number, String],
    default: 300,
  },
  hideDelay: {
    type: [Number, String],
    default: 0,
  },
  arrowWidth: {
    type: [Number, String],
    default: 6,
  },
  arrowHeight: {
    type: [Number, String],
    default: 8,
  },
  arrowPosition: {
    type: String,
    default: '50%',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  tooltipClass: {
    type: [String, Array, Object],
    default: '',
  },
  hoverClass: {
    type: [String, Array, Object],
    default: '',
  },
  fontSize: {
    type: [Number, String],
    default: 13,
  },
  lineHeight: {
    type: [Number, String],
    default: 18,
  },
  fontWeight: {
    type: [Number, String],
    default: 400,
  },
  fontFamily: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['show', 'hide'])

const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

const rootClass = computed(() => [
  `ms-tooltip-wrapper--${props.placement}`,
  `ms-tooltip-wrapper--align-${props.align}`,
  {
    'is-disabled': props.disabled,
    'is-no-arrow': !props.showArrow,
  },
  props.hoverClass,
])

const rootStyle = computed(() => ({
  '--ms-tooltip-hover-bg': props.hoverBackground,
  '--ms-tooltip-hover-size': normalizeCssSize(props.hoverSize),
  '--ms-tooltip-offset': normalizeCssSize(props.offset),
  '--ms-tooltip-show-delay': normalizeCssSize(props.showDelay),
  '--ms-tooltip-hide-delay': normalizeCssSize(props.hideDelay),
  '--ms-tooltip-arrow-width': normalizeCssSize(props.arrowWidth),
  '--ms-tooltip-arrow-height': normalizeCssSize(props.arrowHeight),
  '--ms-tooltip-arrow-position': props.arrowPosition,
  '--ms-tooltip-font-size': normalizeCssSize(props.fontSize),
  '--ms-tooltip-font-weight': props.fontWeight,
  '--ms-tooltip-font-family': props.fontFamily || 'inherit',
  "--ms-tooltip-line-height": normalizeCssSize(props.lineHeight),
}))

const handleShow = () => {
  if (!props.disabled) emit('show')
}

const handleHide = () => {
  if (!props.disabled) emit('hide')
}
</script>

<template>
  <span
    class="ms-tooltip-wrapper"
    :class="rootClass"
    :style="rootStyle"
    tabindex="0"
    @mouseenter="handleShow"
    @mouseleave="handleHide"
    @focusin="handleShow"
    @focusout="handleHide"
  >
    <span class="ms-tooltip-wrapper__trigger">
      <slot />
    </span>

    <span
      v-if="!disabled && (content || $slots.tooltip)"
      class="ms-tooltip-wrapper__bubble"
      :class="tooltipClass"
      role="tooltip"
    >
      <slot name="tooltip">{{ content }}</slot>
    </span>
  </span>
</template>

<style scoped>
.ms-tooltip-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  outline: none;
}

.ms-tooltip-wrapper::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 0;
  width: var(--ms-tooltip-hover-size);
  height: var(--ms-tooltip-hover-size);
  border-radius: 50%;
  background-color: var(--ms-tooltip-hover-bg);
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity 0.12s ease;
  pointer-events: none;
}

.ms-tooltip-wrapper:not(.is-disabled):hover::before,
.ms-tooltip-wrapper:not(.is-disabled):focus-visible::before,
.ms-tooltip-wrapper:not(.is-disabled):focus-within::before {
  opacity: 1;
}

.ms-tooltip-wrapper__trigger {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ms-tooltip-wrapper__bubble {
  position: absolute;
  z-index: 20;
  width: max-content;
  max-width: 420px;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--color-text-inverse);
  font-size: var(--ms-tooltip-font-size);
  font-weight: var(--ms-tooltip-font-weight);
  font-family: var(--ms-tooltip-font-family);
  line-height: var(--ms-tooltip-line-height);
  white-space: nowrap;
  background: #414651;
  box-shadow: var(--shadow-dropdown);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.12s ease,
    visibility 0.12s ease,
    transform 0.12s ease;
  transition-delay: var(--ms-tooltip-hide-delay);
}

.ms-tooltip-wrapper__bubble::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-color: transparent;
  background: transparent;
}

.ms-tooltip-wrapper.is-no-arrow .ms-tooltip-wrapper__bubble::before {
  display: none;
}

.ms-tooltip-wrapper:not(.is-disabled):hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper:not(.is-disabled):focus-within .ms-tooltip-wrapper__bubble {
  opacity: 1;
  visibility: visible;
  transition-delay: var(--ms-tooltip-show-delay);
}

.ms-tooltip-wrapper--bottom .ms-tooltip-wrapper__bubble {
  top: calc(100% + var(--ms-tooltip-offset));
  left: 50%;
  transform: translate(-50%, -4px);
}

.ms-tooltip-wrapper--bottom:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--bottom:focus-within .ms-tooltip-wrapper__bubble {
  transform: translate(-50%, 0);
}

.ms-tooltip-wrapper--bottom .ms-tooltip-wrapper__bubble::before {
  top: calc(var(--ms-tooltip-arrow-height) * -1);
  left: var(--ms-tooltip-arrow-position);
  border-width: 0 var(--ms-tooltip-arrow-width) var(--ms-tooltip-arrow-height)
    var(--ms-tooltip-arrow-width);
  border-color: transparent transparent #414651 transparent;
  transform: translateX(-50%);
}

.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble {
  bottom: calc(100% + var(--ms-tooltip-offset));
  left: 50%;
  transform: translate(-50%, 4px);
}

.ms-tooltip-wrapper--top:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--top:focus-within .ms-tooltip-wrapper__bubble {
  transform: translate(-50%, 0);
}

.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble::before {
  bottom: calc(var(--ms-tooltip-arrow-height) * -1);
  left: var(--ms-tooltip-arrow-position);
  border-width: var(--ms-tooltip-arrow-height) var(--ms-tooltip-arrow-width) 0
    var(--ms-tooltip-arrow-width);
  border-color: #414651 transparent transparent transparent;
  transform: translateX(-50%);
}

.ms-tooltip-wrapper--right .ms-tooltip-wrapper__bubble {
  top: 50%;
  left: calc(100% + var(--ms-tooltip-offset));
  transform: translate(-4px, -50%);
}

.ms-tooltip-wrapper--right:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--right:focus-within .ms-tooltip-wrapper__bubble {
  transform: translate(0, -50%);
}

.ms-tooltip-wrapper--right .ms-tooltip-wrapper__bubble::before {
  left: calc(var(--ms-tooltip-arrow-height) * -1);
  top: var(--ms-tooltip-arrow-position);
  border-width: var(--ms-tooltip-arrow-width) var(--ms-tooltip-arrow-height)
    var(--ms-tooltip-arrow-width) 0;
  border-color: transparent #414651 transparent transparent;
  transform: translateY(-50%);
}

.ms-tooltip-wrapper--left .ms-tooltip-wrapper__bubble {
  top: 50%;
  right: calc(100% + var(--ms-tooltip-offset));
  transform: translate(4px, -50%);
}

.ms-tooltip-wrapper--left:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--left:focus-within .ms-tooltip-wrapper__bubble {
  transform: translate(0, -50%);
}

.ms-tooltip-wrapper--left .ms-tooltip-wrapper__bubble::before {
  right: calc(var(--ms-tooltip-arrow-height) * -1);
  top: var(--ms-tooltip-arrow-position);
  border-width: var(--ms-tooltip-arrow-width) 0 var(--ms-tooltip-arrow-width)
    var(--ms-tooltip-arrow-height);
  border-color: transparent transparent transparent #414651;
  transform: translateY(-50%);
}

.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--bottom .ms-tooltip-wrapper__bubble {
  left: 0;
  transform: translate(0, -4px);
}

.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble {
  transform: translate(0, 4px);
}

.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--top:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--top:focus-within .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--bottom:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--bottom:focus-within
  .ms-tooltip-wrapper__bubble {
  transform: translate(0, 0);
}

.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble::before,
.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--bottom .ms-tooltip-wrapper__bubble::before {
  left: var(--ms-tooltip-arrow-position);
}

.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--bottom .ms-tooltip-wrapper__bubble {
  left: auto;
  right: 0;
  transform: translate(0, -4px);
}

.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble {
  transform: translate(0, 4px);
}

.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--top:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--top:focus-within .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--bottom:hover .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--bottom:focus-within .ms-tooltip-wrapper__bubble {
  transform: translate(0, 0);
}

.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--top .ms-tooltip-wrapper__bubble::before,
.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--bottom .ms-tooltip-wrapper__bubble::before {
  left: auto;
  right: var(--ms-tooltip-arrow-position);
  transform: translateX(50%);
}

.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--left .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--right .ms-tooltip-wrapper__bubble {
  top: 0;
}

.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--left .ms-tooltip-wrapper__bubble::before,
.ms-tooltip-wrapper--align-start.ms-tooltip-wrapper--right .ms-tooltip-wrapper__bubble::before {
  top: var(--ms-tooltip-arrow-position);
}

.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--left .ms-tooltip-wrapper__bubble,
.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--right .ms-tooltip-wrapper__bubble {
  top: auto;
  bottom: 0;
}

.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--left .ms-tooltip-wrapper__bubble::before,
.ms-tooltip-wrapper--align-end.ms-tooltip-wrapper--right .ms-tooltip-wrapper__bubble::before {
  top: auto;
  bottom: var(--ms-tooltip-arrow-position);
  transform: translateY(50%);
}
</style>

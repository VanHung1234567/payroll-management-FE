<template>
  <Teleport to="body">
    <Transition name="ms-modal-fade">
      <div
        v-if="modelValue"
        class="ms-modal__overlay"
        role="presentation"
        @mousedown.self="handleOverlayMouseDown"
      >
        <div class="ms-popup" :style="popupStyle" role="dialog" aria-modal="true">
          <div class="ms-popup__header ms-popup__header--draggable">
            <h3 class="ms-popup__title">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              v-if="showClose"
              type="button"
              class="ms-popup__close"
              aria-label="Đóng"
              @click="handleClose"
            >
              <span class="mi-close"></span>
            </button>
          </div>

          <div class="ms-popup__body ms-popup-legacy__body">
            <slot>{{ message }}</slot>
          </div>

          <div v-if="showFooter" class="ms-popup__footer ms-popup__footer--right">
            <slot name="footer">
              <MsButton
                v-if="showCancel"
                type="button"
                class="ms-popup__button ms-popup__button--secondary"
                v-bind="cancelButtonProps"
                @click="handleCancel"
              >
                {{ cancelText }}
              </MsButton>
              <MsButton
                v-if="showConfirm"
                type="button"
                class="ms-popup__button"
                :class="confirmButtonClass"
                v-bind="confirmButtonProps"
                @click="handleConfirm"
              >
                {{ confirmText }}
              </MsButton>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import MsButton from '@/components/MsButton.vue'
import { computed, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Thông báo',
  },
  message: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: 520,
  },
  confirmText: {
    type: String,
    default: 'Đồng ý',
  },
  cancelText: {
    type: String,
    default: 'Hủy bỏ',
  },
  confirmVariant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'danger'].includes(value),
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  showConfirm: {
    type: Boolean,
    default: true,
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  closeOnOverlay: {
    type: Boolean,
    default: false,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

const popupStyle = computed(() => ({
  width: normalizeCssSize(props.width),
}))

const confirmButtonClass = computed(() => ({
  'ms-popup__button--primary': props.confirmVariant === 'primary',
  'ms-popup__button--danger': props.confirmVariant === 'danger',
}))

const sharedButtonProps = {
  height: 40,
  minWidth: 80,
  padding: '0 16px',
  borderRadius: 8,
}

const cancelButtonProps = computed(() => ({
  ...sharedButtonProps,
  backgroundColor: '#FFFFFF',
  borderColor: '#D0D5DD',
  color: '#101828',
  hoverBackgroundColor: '#F5F5F5',
  hoverBorderColor: '#D0D5DD',
  activeBackgroundColor: '#E9EAEB',
  activeBorderColor: '#D0D5DD',
}))

const confirmButtonProps = computed(() => {
  if (props.confirmVariant === 'danger') {
    return {
      ...sharedButtonProps,
      backgroundColor: '#F04438',
      borderColor: '#F04438',
      color: '#FFFFFF',
      hoverBackgroundColor: '#D92D20',
      hoverBorderColor: '#D92D20',
      activeBackgroundColor: '#B42318',
      activeBorderColor: '#B42318',
    }
  }

  return {
    ...sharedButtonProps,
    backgroundColor: '#0E9A62',
    borderColor: '#0E9A62',
    color: '#FFFFFF',
    hoverBackgroundColor: '#0A724B',
    hoverBorderColor: '#0A724B',
    activeBackgroundColor: '#0B5A3D',
    activeBorderColor: '#0B5A3D',
  }
})

function closeModal() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm')
  closeModal()
}

function handleCancel() {
  emit('cancel')
  closeModal()
}

function handleClose() {
  emit('close')
  closeModal()
}

function handleOverlayMouseDown() {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.modelValue && props.closeOnEsc) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.ms-modal__overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.55);
}

.ms-popup {
  max-width: calc(100vw - 48px);
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px #0000002e;
  color: #101828;
}

.ms-popup__header {
  min-height: 62px;
  padding: 24px 24px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;
}

.ms-popup__title {
  margin: 0;
  color: #101828;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
}

.ms-popup__close {
  width: 32px;
  height: 32px;
  margin: -8px -8px 0 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.ms-popup__close:hover {
  background: #e9eaeb;
}

.mi-close {
  width: 12px;
  height: 12px;
  display: inline-block;
  background-color: #5d5d5d;
  -webkit-mask-image: url('../assets/images/ICON_4.svg');
  mask-image: url('../assets/images/ICON_4.svg');
  -webkit-mask-position: -442px -56px;
  mask-position: -442px -56px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.ms-popup__body {
  padding: 0 24px 16px;
  color: #101828;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  box-sizing: border-box;
}

.ms-popup__footer {
  padding: 0 24px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
}

.ms-popup__footer--right {
  justify-content: flex-end;
}

.ms-popup__button {
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
}

.ms-modal-fade-enter-active,
.ms-modal-fade-leave-active {
  transition: opacity 0.12s ease;
}

.ms-modal-fade-enter-from,
.ms-modal-fade-leave-to {
  opacity: 0;
}
</style>

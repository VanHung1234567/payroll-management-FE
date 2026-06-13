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

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (13/06/2026)
const props = defineProps({
  // Trạng thái mở/đóng modal, dùng với v-model.
  modelValue: {
    type: Boolean,
    default: false,
  },
  // Tiêu đề mặc định nếu không truyền slot title.
  title: {
    type: String,
    default: 'Thông báo',
  },
  // Nội dung mặc định nếu không truyền slot default.
  message: {
    type: String,
    default: '',
  },
  // Chiều rộng popup.
  width: {
    type: [Number, String],
    default: 415,
  },
  // Text nút xác nhận.
  confirmText: {
    type: String,
    default: 'Đồng ý',
  },
  // Text nút hủy.
  cancelText: {
    type: String,
    default: 'Hủy bỏ',
  },
  // Kiểu nút xác nhận.
  confirmVariant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'danger'].includes(value),
  },
  // Kiểu nút hủy.
  cancelVariant: {
    type: String,
    default: 'secondary',
    validator: (value) => ['secondary', 'primary-outline'].includes(value),
  },
  // Ẩn/hiện nút hủy.
  showCancel: {
    type: Boolean,
    default: true,
  },
  // Ẩn/hiện nút xác nhận.
  showConfirm: {
    type: Boolean,
    default: true,
  },
  // Ẩn/hiện icon đóng trên header.
  showClose: {
    type: Boolean,
    default: true,
  },
  // Ẩn/hiện footer button.
  showFooter: {
    type: Boolean,
    default: true,
  },
  // Cho phép click overlay để đóng.
  closeOnOverlay: {
    type: Boolean,
    default: false,
  },
  // Cho phép nhấn Escape để đóng.
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
})

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (10/06/2026)
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

/// Hàm chuẩn hóa số thành đơn vị px cho style button.
/// CREATED BY: VVHung (06/06/2026)
const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)

/// Style động áp dụng cho popup style.
/// CREATED BY: VVHung (12/06/2026)
const popupStyle = computed(() => ({
  width: normalizeCssSize(props.width),
}))

/// Class động áp dụng cho confirm button class.
/// CREATED BY: VVHung (13/06/2026)
const confirmButtonClass = computed(() => ({
  'ms-popup__button--primary': props.confirmVariant === 'primary',
  'ms-popup__button--danger': props.confirmVariant === 'danger',
}))

/// Nhóm props dùng chung cho các button trong modal.
/// CREATED BY: VVHung (06/06/2026)
const sharedButtonProps = {
  height: 32,
  minWidth: 80,
}

/// Cờ xác định có thể cancel button props.
/// CREATED BY: VVHung (09/06/2026)
const cancelButtonProps = computed(() => ({
  ...sharedButtonProps,
  ...(props.cancelVariant === 'primary-outline'
    ? {
        backgroundColor: '#0E9A62',
        borderColor: '#0E9A62',
        color: '#FFFFFF',
        hoverBackgroundColor: '#0A724B',
        hoverBorderColor: '#0A724B',
        activeBackgroundColor: '#0B5A3D',
        activeBorderColor: '#0B5A3D',
      }
    : {
        backgroundColor: '#FFFFFF',
        borderColor: '#D5D7DA',
        color: '#101828',
        hoverBackgroundColor: '#E9EAEB',
        hoverBorderColor: '#D5D7DA',
        activeBackgroundColor: '#D5D7DA',
        activeBorderColor: '#D5D7DA',
      }),
}))

/// Props riêng cho nút xác nhận của modal.
/// CREATED BY: VVHung (13/06/2026)
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

/// Đóng modal bằng cách cập nhật v-model về false.
/// CREATED BY: VVHung (11/6/2026)
function closeModal() {
  emit('update:modelValue', false)
}

/// Xử lý nút xác nhận trong modal.
/// CREATED BY: VVHung (11/6/2026)
function handleConfirm() {
  emit('confirm')
  closeModal()
}

/// Xử lý nút hủy trong modal.
/// CREATED BY: VVHung (11/6/2026)
function handleCancel() {
  emit('cancel')
  closeModal()
}

/// Xử lý thao tác đóng modal bằng icon hoặc phím tắt.
/// CREATED BY: VVHung (11/6/2026)
function handleClose() {
  emit('close')
  closeModal()
}

/// Đóng modal khi click overlay nếu component cho phép.
/// CREATED BY: VVHung (11/6/2026)
function handleOverlayMouseDown() {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

/// Lắng nghe phím Escape để đóng modal nếu được cấu hình.
/// <param name="event">Sự kiện keydown trên window.</param>
/// CREATED BY: VVHung (11/6/2026)
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
  background: rgba(0, 0, 0, 0.5);
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
  height: 62px;
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ms-popup__title {
  margin: 0;
  color: #212121;
  letter-spacing: 0.576px;
  font-size: 16px;
  font-weight: 700;
}

.ms-popup__close {
  width: 32px;
  height: 32px;
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
  line-height: 18px;
}

.ms-popup__footer {
  padding: 0 24px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ms-popup__footer--right {
  justify-content: flex-end;
  font-weight: 500;
}

.ms-popup__button {
  font: inherit;
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

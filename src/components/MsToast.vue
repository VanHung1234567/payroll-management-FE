<template>
  <Teleport to="body">
    <div v-if="isVisible" class="ms-toast-container" :class="containerClass">
      <div class="ms-toast-wrapper">
        <div class="ms-toast-message" :class="messageClass" role="status" aria-live="polite">
          <span class="ms-toast-message__icon" :class="iconClass"></span>
          <span class="ms-toast-message__text">{{ message }}</span>
          <button
            v-if="closable"
            type="button"
            class="ms-toast-message__button ms-toast-message__button--close"
            aria-label="Đóng"
            @click="close"
          >
            <span class="mi-icon-close"></span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (07/06/2026)
const props = defineProps({
  // Trạng thái hiển thị toast, dùng với v-model.
  modelValue: {
    type: Boolean,
    default: false,
  },
  // Loại toast để đổi màu/icon.
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'danger', 'error', 'warning'].includes(value),
  },
  // Nội dung toast.
  message: {
    type: String,
    default: '',
  },
  // Thời gian tự đóng, tính bằng ms.
  duration: {
    type: Number,
    default: 6000,
  },
  // Bật/tắt tự đóng.
  autoClose: {
    type: Boolean,
    default: true,
  },
  // Ẩn/hiện nút đóng.
  closable: {
    type: Boolean,
    default: true,
  },
  // Vị trí toast trên màn hình.
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom'].includes(value),
  },
})

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (08/06/2026)
const emit = defineEmits(['update:modelValue', 'close'])

/// Timer tự động đóng toast.
/// CREATED BY: VVHung (12/06/2026)
const timer = ref(null)
/// Loại toast đã chuẩn hóa để chọn icon và màu.
/// CREATED BY: VVHung (06/06/2026)
const normalizedType = computed(() => (props.type === 'error' ? 'danger' : props.type))
/// Cờ hiển thị toast theo modelValue và nội dung message.
/// CREATED BY: VVHung (07/06/2026)
const isVisible = computed(() => props.modelValue && Boolean(props.message))
/// Class động áp dụng cho container class.
/// CREATED BY: VVHung (12/06/2026)
const containerClass = computed(() => `ms-toast-container--${props.position}`)
/// Class động áp dụng cho message class.
/// CREATED BY: VVHung (06/06/2026)
const messageClass = computed(() => `ms-toast-message--${normalizedType.value}`)
/// Class động áp dụng cho icon class.
/// CREATED BY: VVHung (06/06/2026)
const iconClass = computed(() => `ms-icon-${normalizedType.value}-circle`)

/// Xóa timer tự động đóng toast đang chạy.
/// CREATED BY: VVHung (03/06/2026)
function clearTimer() {
  if (!timer.value) return
  window.clearTimeout(timer.value)
  timer.value = null
}

/// Khởi tạo timer tự động đóng toast theo thời gian cấu hình.
/// CREATED BY: VVHung (03/06/2026)
function startTimer() {
  clearTimer()
  if (!props.autoClose || props.duration <= 0) return

  timer.value = window.setTimeout(() => {
    close()
  }, props.duration)
}

/// Đóng toast và phát sự kiện close cho component cha.
/// CREATED BY: VVHung (03/06/2026)
function close() {
  clearTimer()
  emit('update:modelValue', false)
  emit('close')
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      startTimer()
      return
    }

    clearTimer()
  },
  { immediate: true },
)

watch(
  () => props.message,
  () => {
    if (isVisible.value) startTimer()
  },
)

onBeforeUnmount(clearTimer)
</script>

<style scoped>
.ms-toast-container {
  position: fixed;
  left: 50%;
  z-index: 10000;
  width: 100%;
  max-width: 400px;
  min-width: 300px;
  transform: translateX(-50%);
  pointer-events: none;
}

.ms-toast-container--top {
  top: 20px;
}

.ms-toast-container--bottom {
  bottom: 20px;
}

.ms-toast-wrapper {
  display: flex;
  justify-content: center;
  animation: ms-toast-slide-in-center 0.3s ease forwards;
}

.ms-toast-message {
  min-width: 300px;
  max-width: 400px;
  height: 48px;
  padding: 8px 0;
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  color: #fff;
  pointer-events: auto;
  font-weight: 500;
  transition: box-shadow 0.12s ease;
}

.ms-toast-message:hover {
  box-shadow: 0 6px 16px #00000040;
}

.ms-toast-message--success {
  background: #12b76a;
}

.ms-toast-message--danger {
  background: #f04438;
}

.ms-toast-message--warning {
  background: #ff9900;
}

.ms-toast-message__icon {
  margin-left: 12px;
}

.ms-toast-message__text {
  min-width: 0;
  flex: 1;
  padding: 0 12px 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-toast-message__button {
  width: 32px;
  height: 32px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.ms-icon-danger-circle,
.ms-icon-success-circle {
  width: 20px;
  height: 20px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../assets/images/ICON_4.svg');
  -webkit-mask-repeat: no-repeat;
  background-color: #ffffff;
}

.ms-icon-danger-circle {
  -webkit-mask-position: -60px -88px;
}

.ms-icon-success-circle {
  -webkit-mask-position: -80px -88px;
}

.ms-icon-warning-circle {
  position: relative;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  box-sizing: border-box;
}

.ms-icon-warning-circle::before {
  content: '!';
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.mi-icon-close {
  width: 16px;
  height: 16px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../assets/images/ICON_4.svg');
  -webkit-mask-position: -440px -55px;
  -webkit-mask-repeat: no-repeat;
  background-color: #ffffff;
}

@keyframes ms-toast-slide-in-center {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

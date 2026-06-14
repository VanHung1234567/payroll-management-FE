<template>
  <div ref="formulaRef" class="ms-formula" :style="{ width: normalizedWidth }">
    <div class="ms-formula__editor-wrap" :class="{ 'is-focused': isFocused }">
      <PrismEditor
        v-model="formulaValue"
        class="ms-formula__editor"
        :class="{ 'has-agent-button': showAgentButton }"
        :highlight="highlightFormula"
        :placeholder="placeholder"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <button
        v-if="showAgentButton"
        type="button"
        class="btn-ava create-composition-formula-agent-btn"
        :aria-label="agentButtonText"
        :title="agentButtonText"
        @mousedown.prevent
        @click="emit('agent-click')"
      >
        <span class="create-composition-formula-agent-btn__icon"></span>
        <span class="create-composition-formula-agent-btn__text">{{ agentButtonText }}</span>
      </button>
    </div>

    <div v-if="isPanelOpen" class="ms-formula__panel">
      <div class="ms-formula__tabs">
        <button
          type="button"
          class="ms-formula__tab"
          :class="{ 'is-active': activeTab === 'functions' }"
          @mousedown.prevent="activeTab = 'functions'"
        >
          Công thức
        </button>
        <button
          type="button"
          class="ms-formula__tab"
          :class="{ 'is-active': activeTab === 'parameters' }"
          @mousedown.prevent="activeTab = 'parameters'"
        >
          Tham số
        </button>
      </div>

      <div v-if="activeTab === 'functions'" class="ms-formula__list">
        <button
          v-for="formula in filteredFunctions"
          :key="formula.name"
          type="button"
          class="ms-formula__item"
          @mousedown.prevent="insertFunction(formula)"
        >
          <span class="ms-formula__fx">ƒ×</span>
          <span class="ms-formula__item-content">
            <span class="ms-formula__item-title">
              <strong>{{ formula.name }}</strong
              >{{ formula.signature }}
            </span>
          </span>
        </button>
      </div>

      <div v-else class="ms-formula__list">
        <button
          v-for="parameter in filteredParameters"
          :key="getParameterCode(parameter)"
          type="button"
          class="ms-formula__item"
          @mousedown.prevent="insertParameter(parameter)"
        >
          <span class="ms-formula__database"></span>
          <span class="ms-formula__item-content">
            <span class="ms-formula__item-title">
              <strong>{{ getParameterName(parameter) }}</strong
              >({{ getParameterCode(parameter) }})
            </span>
            <span v-if="getParameterDescription(parameter)" class="ms-formula__item-desc">
              {{ getParameterDescription(parameter) }}
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core'

languages.formula = {
  function:
    /\b(?:SUM|IF|IFS|AND|OR|ROUND|ROUNDUP|ROUNDDOWN|DATE|DATEDIF|MONTH|TODAY|INT|DINHMUC|CHINHTHUC|THUVIEC|HOCVIEC)\b/,
  number: /-?\b\d+(?:[.,]\d+)?\b/,
  boolean: /\b(?:TRUE|FALSE)\b/i,
  operator: /[+\-*/<>=!&|]+/,
  punctuation: /[()[\],;]/,
  parameter: /\b[A-Z_][A-Z0-9_]*\b/,
}

/// Khai báo toàn bộ dữ liệu component nhận từ component cha.
/// CREATED BY: VVHung (06/06/2026)
const props = defineProps({
  // Chuỗi công thức, dùng với v-model.
  modelValue: {
    type: String,
    default: '',
  },
  // Chiều rộng vùng nhập công thức.
  width: {
    type: [Number, String],
    default: 838,
  },
  // Placeholder khi chưa nhập công thức.
  placeholder: {
    type: String,
    default: 'Tự động gợi ý công thức và tham số khi gõ',
  },
  // Danh sách tham số/thành phần lương để gợi ý trong formula.
  parameters: {
    type: Array,
    default: () => [],
  },
  // Hiển thị nút tạo công thức bằng agent.
  showAgentButton: {
    type: Boolean,
    default: false,
  },
  // Text của nút agent.
  agentButtonText: {
    type: String,
    default: 'Tạo công thức với AVA Tiền lương',
  },
})

/// Khai báo các sự kiện component bắn ra ngoài.
/// CREATED BY: VVHung (09/06/2026)
const emit = defineEmits(['update:modelValue', 'agent-click'])

/// Ref tới editor công thức trong template.
/// CREATED BY: VVHung (11/06/2026)
const formulaRef = ref(null)
/// Cờ xác định input đang được focus.
/// CREATED BY: VVHung (11/06/2026)
const isFocused = ref(false)
/// Tab đang được chọn trong popup công thức.
/// CREATED BY: VVHung (13/06/2026)
const activeTab = ref('functions')

/// Hàm chuẩn hóa số thành đơn vị px cho style button.
/// CREATED BY: VVHung (13/06/2026)
const normalizeCssSize = (value) => (typeof value === 'number' ? `${value}px` : value)
/// Chiều rộng đã chuẩn hóa để gắn vào style.
/// CREATED BY: VVHung (13/06/2026)
const normalizedWidth = computed(() => normalizeCssSize(props.width))

/// Giá trị công thức đang nhập trong editor.
/// CREATED BY: VVHung (09/06/2026)
const formulaValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

/// Danh sách hàm công thức có thể chèn vào editor.
/// CREATED BY: VVHung (11/06/2026)
const formulaFunctions = [
  {
    name: 'SUM',
    signature: '(X1, X2, ...)',
    insertText: 'SUM(',
  },
  {
    name: 'IF',
    signature: '(logical_test, [value_if_true], [value_if_false])',
    insertText: 'IF(',
  },
  {
    name: 'IFS',
    signature: '(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)',
    insertText: 'IFS(',
  },
  {
    name: 'AND',
    signature: '(X1, X2)',
    insertText: 'AND(',
  },
  {
    name: 'OR',
    signature: '(X1, X2)',
    insertText: 'OR(',
  },
  {
    name: 'ROUND',
    signature: '(number, num_digits)',
    insertText: 'ROUND(',
  },
  {
    name: 'ROUNDUP',
    signature: '(number, num_digits)',
    insertText: 'ROUNDUP(',
  },
  {
    name: 'ROUNDDOWN',
    signature: '(number, num_digits)',
    insertText: 'ROUNDDOWN(',
  },
  {
    name: 'DATE',
    signature: '(year, month, day)',
    insertText: 'DATE(',
  },
  {
    name: 'DATEDIF',
    signature: '(start_date, end_date, unit)',
    insertText: 'DATEDIF(',
  },
  {
    name: 'MONTH',
    signature: '(serial_number)',
    insertText: 'MONTH(',
  },
  {
    name: 'TODAY',
    signature: '()',
    insertText: 'TODAY(',
  },
  {
    name: 'INT',
    signature: '(number)',
    insertText: 'INT(',
  },
  {
    name: 'DINHMUC',
    signature: '(X)',
    insertText: 'DINHMUC(',
  },
  {
    name: 'CHINHTHUC',
    signature: '(X)',
    insertText: 'CHINHTHUC(',
  },
  {
    name: 'THUVIEC',
    signature: '(X)',
    insertText: 'THUVIEC(',
  },
  {
    name: 'HOCVIEC',
    signature: '(X)',
    insertText: 'HOCVIEC(',
  },
]

/// Token ngay trước con trỏ dùng để gợi ý tham số.
/// CREATED BY: VVHung (07/06/2026)
const searchToken = computed(() => {
  const value = formulaValue.value || ''
  const match = value.match(/[A-Za-z0-9_À-ỹ]+$/)
  return normalizeText(match?.[0] ?? '')
})

/// Danh sách hàm công thức sau khi lọc theo từ khóa.
/// CREATED BY: VVHung (10/06/2026)
const filteredFunctions = computed(() => {
  if (!searchToken.value) return formulaFunctions
  return formulaFunctions.filter((item) =>
    normalizeText(`${item.name} ${item.description}`).includes(searchToken.value),
  )
})

/// Danh sách tham số sau khi lọc theo từ khóa.
/// CREATED BY: VVHung (07/06/2026)
const filteredParameters = computed(() => {
  if (!searchToken.value) return props.parameters
  return props.parameters.filter((item) =>
    normalizeText(
      `${getParameterName(item)} ${getParameterCode(item)} ${getParameterDescription(item)}`,
    ).includes(searchToken.value),
  )
})

/// Cờ xác định trạng thái panel open.
/// CREATED BY: VVHung (10/06/2026)
const isPanelOpen = computed(
  () =>
    isFocused.value &&
    formulaValue.value.trim().startsWith('=') &&
    (activeTab.value === 'functions'
      ? filteredFunctions.value.length
      : filteredParameters.value.length),
)

function highlightFormula(code) {
  return highlight(code, languages.formula, 'formula')
}

function handleFocus() {
  isFocused.value = true
}

function handleBlur() {
  window.setTimeout(() => {
    isFocused.value = false
  }, 120)
}

defineExpose({
  focus: () => {
    formulaRef.value?.querySelector?.('.prism-editor__textarea')?.focus?.()
  },
})

function insertFunction(formula) {
  insertText(formula.insertText)
}

function insertParameter(parameter) {
  insertText(`${getParameterCode(parameter)},`)
}

function insertText(text) {
  const currentValue = formulaValue.value || ''
  formulaValue.value = `${currentValue.replace(/[A-Za-z0-9_À-ỹ]+$/, '')}${text}`
}

function getParameterName(parameter) {
  return parameter?.salaryCompositionName ?? ''
}

function getParameterCode(parameter) {
  return parameter?.salaryCompositionCode ?? ''
}

function getParameterDescription(parameter) {
  return parameter?.description ?? ''
}

function normalizeText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}
</script>

<style scoped>
.ms-formula {
  position: relative;
  max-width: 100%;
}

.ms-formula__editor-wrap {
  position: relative;
  min-height: 80px;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}

.ms-formula__editor-wrap:hover,
.ms-formula__editor-wrap.is-focused {
  border-color: #0e9a62;
}

.ms-formula__editor-wrap::selection{
  background: #0d905d;
}

.ms-formula__equals {
  position: absolute;
  top: 12px;
  left: 16px;
  z-index: 2;
  color: #f04438;
  font-weight: 700;
  line-height: 18px;
  pointer-events: none;
}

.ms-formula__editor {
  min-height: 78px;
  padding: 8px 12px;
  color: #1570ef;
  font-family: inherit;
  font-size: 13px;
  line-height: 18px;
  background: transparent;
  caret-color: #1570ef;
}

.ms-formula__editor.has-agent-button {
  padding-right: 56px;
}

.ms-formula__editor :deep(.prism-editor__textarea),
.ms-formula__editor :deep(.prism-editor__editor) {
  outline: none;
}

.ms-formula__editor :deep(.prism-editor__textarea::placeholder) {
  color: #d5dae5;
}

.ms-formula__editor :deep(.token.number),
.ms-formula__editor :deep(.token.parameter) {
  color: #1570ef;
}

.ms-formula__editor :deep(.token.function) {
  color: #000;
}

.ms-formula__editor :deep(.token.operator),
.ms-formula__editor :deep(.token.punctuation) {
  color: #f04438;
}

.btn-ava.create-composition-formula-agent-btn {
  position: absolute;
  right: 4px;
  bottom: 4px;
  display: inline-flex;
  height: 32px;
  width: 43px;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  overflow: hidden;
  padding: 6px 12px 6px 6px;
  border: 1px solid #fff;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 0 12px #0003;
  cursor: pointer;
  color: #101828;
  font: inherit;
  font-weight: 500;
  white-space: nowrap;
  background: linear-gradient(
    270deg,
    #efe9ff 7.74%,
    #f0f8ff 40.17%,
    #dff8ff 64.73%,
    #f3f3ff 84.04%
  );
  transition:
    width 0.2s ease,
    padding 0.2s ease,
    border-radius 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-ava.create-composition-formula-agent-btn:hover,
.btn-ava.create-composition-formula-agent-btn:focus-visible {
  width: auto;
  padding: 4px 12px 4px 4px;
  border: 1px solid #dae5ff;
  border-radius: 14px;
  background: linear-gradient(
    270deg,
    #efe9ff 7.74%,
    #f0f8ff 40.17%,
    #dff8ff 64.73%,
    #f3f3ff 84.04%
  );
  box-shadow: none;
}

.create-composition-formula-agent-btn__icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  background: url('../assets/images/payroll_agent-d_2srbQV.webp') center / cover no-repeat;
}

.create-composition-formula-agent-btn__text {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-width 0.2s ease,
    opacity 0.2s ease;
}

.btn-ava.create-composition-formula-agent-btn:hover .create-composition-formula-agent-btn__text,
.btn-ava.create-composition-formula-agent-btn:focus-visible
  .create-composition-formula-agent-btn__text {
  max-width: 220px;
  opacity: 1;
}

.ms-formula__panel {
  position: absolute;
  top: calc(100% - 2px);
  left: 0;
  z-index: 60;
  width: 100%;
  max-height: 270px;
  padding: 18px 38px 20px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 22px #0000001f;
  box-sizing: border-box;
}

.ms-formula__tabs {
  height: 34px;
  display: flex;
  align-items: flex-start;
  gap: 28px;
  border-bottom: 1px solid #d5d7da;
}

.ms-formula__tab {
  height: 34px;
  padding: 0;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 28px;
  cursor: pointer;
}

.ms-formula__tab.is-active {
  color: #0e9a62;
  border-bottom-color: #0e9a62;
  font-weight: 700;
}

.ms-formula__list {
  max-height: 176px;
  padding-top: 6px;
  overflow: auto;
}

.ms-formula__item {
  width: 100%;
  min-height: 56px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: none;
  background: #fff;
  color: #101828;
  text-align: left;
  cursor: pointer;
}

.ms-formula__item:hover {
  background: #e6f5ef;
  color: #0e9a62;
}

.ms-formula__fx {
  width: 18px;
  flex-shrink: 0;
  color: #6e737a;
  font-size: 18px;
  line-height: 18px;
}

.ms-formula__database {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  background-color: #6e737a;
  -webkit-mask-image: url('../assets/images/ICON_2.svg');
  -webkit-mask-position: -178px -357px;
  -webkit-mask-repeat: no-repeat;
}

.ms-formula__item-content {
  min-width: 0;
  display: flex;
  flex: 1;
  align-self: stretch;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid #e9eaeb;
}

.ms-formula__item-title {
  color: inherit;
  font-size: 13px;
  line-height: 18px;
  white-space: nowrap;
}

.ms-formula__item-title strong {
  font-weight: 700;
}

.ms-formula__item-desc {
  color: #101828;
  font-size: 13px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

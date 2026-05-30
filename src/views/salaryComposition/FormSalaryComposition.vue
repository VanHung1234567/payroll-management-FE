<template>
  <div class="content-header">
    <div class="content-header_left">
      <RouterLink :to="path.salarycomposition" style="text-decoration: none">
        <MsTooltip
          content="Quay lại"
          hover-background="#dadce3"
          placement="bottom"
          hover-size="36px"
          font-size="12px"
          line-height="16px"
          offset="4px"
          class="header-action"
        >
          <div class="navbar-action">
            <div class="mi-arrow-left"></div>
          </div>
        </MsTooltip>
      </RouterLink>
      <div class="content-header__title">Thêm thành phần</div>
    </div>
  </div>
  <div class="w-full h-full">
    <div class="salarycomposition-form">
      <div class="salarycomposition-form-scroll">
        <div class="salarycomposition-container">
          <div class="w-full">
            <div class="ms-row">
              <MsInput label="Tên thành phần" required width="838px" />
            </div>
            <div class="ms-row">
              <MsInput
                label="Mã thành phần"
                placeholder="Nhập mã viết liền"
                required
                width="838px"
                :show-inactive-option="false"
                :error-message="organizationErrorMessage"
              />
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Đơn vị áp dụng</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <MsTreeSelect
                v-model="selectedOrganizationIds"
                :options="organizations"
                id-key="organizationID"
                parent-key="parentID"
                label-key="organizationName"
                placeholder="Chọn đơn vị"
                width="838px"
                :show-inactive-option="false"
              />
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Loại thành phần</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <MsSelect
                v-model="selectedSalaryCompositionTypeId"
                :options="salaryCompositionTypeOptions"
                searchable
                label=""
                variant="form"
                width="315px"
                menu-width="315px"
                trigger-padding="4px 8px 4px 4px"
                :letter-spacing="0"
                label-key="typeName"
                value-key="salaryCompositionTypeID"
              />
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Tính chất</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <div class="flex">
                <MsSelect
                  v-model="selectedNature"
                  searchable
                  variant="form"
                  width="315px"
                  menu-width="315px"
                  trigger-padding="4px 8px 4px 4px"
                  :letter-spacing="0"
                  :options="natureOptions"
                />
                <div v-if="isIncomeNature" class="flex ml-16">
                  <label
                    v-for="option in taxTypeOptions"
                    :key="option.value"
                    class="ms-radio-wrapper"
                  >
                    <span class="ms-radio-item" @click="selectedTaxType = option.value">
                      <span
                        class="ms-radio-item__icon"
                        :class="{
                          'ms-radio-item__icon--checked': selectedTaxType === option.value,
                        }"
                      >
                        <svg
                          v-if="selectedTaxType === option.value"
                          viewBox="0 0 16 16"
                          class="ms-radio-item__circle"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="6" fill="currentColor"></circle>
                        </svg>
                      </span>
                      <span class="ms-radio-item__label">{{ option.label }}</span>
                    </span>
                  </label>
                </div>
                <label v-else-if="isDeductionNature" class="ms-check-wrapper ml-16">
                  <button
                    type="button"
                    class="ms-check-item__icon"
                    :class="{ 'is-checked': isTaxReduction }"
                    @click="isTaxReduction = !isTaxReduction"
                  >
                    <svg
                      v-if="isTaxReduction"
                      viewBox="0 0 16 16"
                      class="ms-check-item__mark"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 8L6 11L13 4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                  <span class="ms-check-item__label">Giảm trừ khi tính thuế</span>
                </label>
              </div>
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Định mức</p>
                </label>
              </div>
              <MsFormula
                v-model="normFormula"
                width="838px"
                :parameters="salaryCompositionParameters"
              />
              <div v-if="false" class="prism-editor__container">
                <textarea
                  class="prism-editor__textarea"
                  spellcheck="false"
                  autocapitalize="off"
                  autocomplete="off"
                  autocorrect="off"
                  data-gramm="false"
                  placeholder="Tự động gợi ý công thức và tham số khi gõ"
                  data-testid="textarea"
                  value=""
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="insert-action-footer">
        <MsButton
          background-color="#FFFFFF"
          border-color="#D5D7DA"
          color="#101828"
          hover-background-color="#E9EAEB"
          hover-border-color="#D5D7DA"
          active-background-color="#D5D7DA"
          active-border-color="#D5D7DA"
          width="80px"
          margin="0 8px 0 0"
        >
          Hủy bỏ
        </MsButton>
        <MsButton
          background-color="#FFFFFF"
          border-color="#0E9A62"
          color="#0E9A62"
          hover-background-color="#A8D9C8"
          active-background-color="#7CC7AE"
          width="106px"
          margin="0 8px 0 0"
        >
          Lưu và thêm
        </MsButton>
        <MsButton width="80px">Lưu </MsButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import MsInput from '@/components/MsInput.vue'
import MsTooltip from '@/components/MsTooltip.vue'
import MsTreeSelect from '@/components/MsTreeSelect.vue'
import OrganizationAPI from '@/apis/components/organization/Organization.js'
import { path } from '@/utils/path'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref, watch } from 'vue'
import MsButton from '@/components/MsButton.vue'
import MsFormula from '@/components/MsFormula.vue'
import MsSelect from '@/components/MsSelect.vue'
import SalaryCompositionAPI from '@/apis/components/salaryComposition/SalaryCompositionAPI'
import SalaryCompositionTypeAPI from '@/apis/components/salaryCompositionType/SalaryCompositionType'

const selectedNature = ref(1)
const selectedSalaryCompositionTypeId = ref(null)
const selectedOrganizationIds = ref([])
const organizationErrorMessage = ref('')
const normFormula = ref('')
const selectedTaxType = ref(1)
const isTaxReduction = ref(false)
const taxTypeOptions = [
  { label: 'Chịu thuế', value: 1 },
  { label: 'Miễn thuế toàn phần', value: 2 },
  { label: 'Miễn thuế một phần', value: 3 },
]

const { data: organizationResponse } = useQuery({
  queryKey: ['organizations'],
  queryFn: () => OrganizationAPI.getAll(),
})

const { data: salaryCompositionEnumResponse } = useQuery({
  queryKey: ['salaryCompositionEnum'],
  queryFn: () => SalaryCompositionAPI.enum(),
})

const { data: salaryCompositionTypeResponse } = useQuery({
  queryKey: ['salaryCompositionTypes'],
  queryFn: () => SalaryCompositionTypeAPI.getAll(),
})

const { data: salaryCompositionParameterResponse } = useQuery({
  queryKey: ['salaryCompositionParameters'],
  queryFn: () =>
    SalaryCompositionAPI.paging({
      pageIndex: 1,
      pageSize: 1000,
      status: 1,
    }),
})

const organizations = computed(() => organizationResponse.value?.data?.data ?? [])
const salaryCompositionEnum = computed(
  () =>
    salaryCompositionEnumResponse.value?.data?.data ??
    salaryCompositionEnumResponse.value?.data ??
    {},
)
const salaryCompositionTypeOptions = computed(
  () => salaryCompositionTypeResponse.value?.data?.data ?? [],
)
const salaryCompositionParameterPayload = computed(
  () =>
    salaryCompositionParameterResponse.value?.data?.data ??
    salaryCompositionParameterResponse.value?.data ??
    {},
)
const salaryCompositionParameters = computed(() => {
  const payload = salaryCompositionParameterPayload.value
  if (Array.isArray(payload)) return payload
  return payload.data ?? []
})
const natureOptions = computed(() => [...(salaryCompositionEnum.value.natures ?? [])])
const selectedSalaryCompositionType = computed(() =>
  salaryCompositionTypeOptions.value.find(
    (option) => option.salaryCompositionTypeID === selectedSalaryCompositionTypeId.value,
  ),
)
const normalizedSelectedTypeName = computed(() =>
  normalizeText(selectedSalaryCompositionType.value?.typeName ?? ''),
)
const isAutoOtherNatureType = computed(() =>
  ['cham cong', 'kpi', 'san pham'].some((keyword) =>
    normalizedSelectedTypeName.value.includes(keyword),
  ),
)
const isIncomeNature = computed(() => Number(selectedNature.value) === 1)
const isDeductionNature = computed(() => Number(selectedNature.value) === 2)

function normalizeText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

watch(
  [selectedSalaryCompositionTypeId, salaryCompositionTypeOptions],
  () => {
    if (!selectedSalaryCompositionTypeId.value) return
    selectedNature.value = isAutoOtherNatureType.value ? 3 : 1
  },
  { immediate: true },
)

watch(selectedNature, () => {
  if (!isIncomeNature.value) selectedTaxType.value = 1
  if (!isDeductionNature.value) isTaxReduction.value = false
})
</script>

<style scoped>
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.content-header_left {
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-header__title {
  letter-spacing: 0.6px;
  font-size: 20px;
  font-weight: 700;
  line-height: 30px;
  margin-left: 8px;
}

.header-action {
  width: 36px;
  height: 36px;
}

.navbar-action {
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.salarycomposition-form {
  inset: 0;
  display: flex;
  flex-direction: column;
}

.salarycomposition-form-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.salarycomposition-container {
  width: 100%;
  min-height: 100%;
  padding: 40px;
  display: flex;
  background-color: #ffffff;
}

.insert-action-footer {
  flex-shrink: 0;
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: 500;
}

.ms-row {
  display: flex;
  width: 100%;
  line-height: 35px;
  text-indent: 0px;
  padding: 0px;
  margin-bottom: 16px;
  /* clear: both;
  flex-flow: wrap; */
}

label {
  text-align: left;
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.requied {
  color: red;
  padding-left: 2px;
}

.ms-radio-wrapper {
  width: fit-content;
  padding-right: 0;
  margin-bottom: 0;
  display: flex;
}

.ms-radio-wrapper + .ms-radio-wrapper {
  margin-left: 32px;
}

.ms-radio-item {
  color: #101828;
  -webkit-font-smoothing: antialiased;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.ms-radio-item__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #d5d7da;
  background: #ffffff;
  transition: all 0.2s ease;
}

.ms-radio-item:hover .ms-radio-item__icon {
  border-color: #0a724b;
}

.ms-radio-item__icon--checked {
  border-color: #0e9a62;
  background: #ffffff;
}

.ms-radio-item__circle {
  color: #0e9a62;
  width: 16px;
  height: 16px;
}

.ms-radio-item__label {
  font-size: 14px;
  line-height: 18px;
  color: #101828;
}

.ms-check-wrapper {
  height: 32px;
  padding-right: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.ms-check-item__icon {
  width: 16px;
  height: 16px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d5d7da;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
}

.ms-check-item__icon:focus,
.ms-check-item__icon:focus-visible,
.ms-check-item__icon:active {
  outline: none;
  box-shadow: none;
}

.ms-check-item__icon.is-checked {
  border-color: #0e9a62;
  background: #0e9a62;
}

.ms-check-item__mark {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.ms-check-item__label {
  color: #101828;
  font-size: 14px;
  line-height: 18px;
}

.prism-editor__container {
  width: 838px;
  height: 87.6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fff;
  min-height: 28px;
  align-items: center;
  line-height: 18px;
}

.prism-editor__container:hover,
.prism-editor__textarea:focus-within .prism-editor__container {
  border: 1px solid #0e9a62;
}

.prism-editor__textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  color: #1570ef;
  -webkit-font-smoothing: antialiased;
  resize: none;
}

.prism-editor__textarea::placeholder {
  color: #d8d8da;
}

.mi-arrow-left {
  width: 14px;
  display: inline-block;
  flex-shrink: 0;
  height: 12px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -203px -4px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}
</style>

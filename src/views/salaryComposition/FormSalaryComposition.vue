<template>
  <div class="content-header">
    <div class="content-header_left">
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
        <button type="button" class="navbar-action" @click="openExitConfirmModal">
          <div class="mi-arrow-left"></div>
        </button>
      </MsTooltip>
      <div class="content-header__title">Thêm thành phần</div>
    </div>
  </div>
  <div class="w-full salarycomposition-page">
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
            <div v-if="isNormVisible" class="ms-row">
              <div class="w-200 flex items-center">
                <label>
                  <p>Định mức</p>
                </label>
              </div>
              <MsFormula
                v-model="normFormula"
                width="838px"
                :parameters="salaryCompositionParameters"
              />
            </div>
            <div v-if="isNormVisible" class="ms-row">
              <div class="w-200"></div>
              <div class="flex items-center formula-limit-row">
                <label class="ms-check-wrapper">
                  <button
                    type="button"
                    class="ms-check-item__icon"
                    :class="{ 'is-checked': isAllowOverNormValue }"
                    @click="isAllowOverNormValue = !isAllowOverNormValue"
                  >
                    <svg
                      v-if="isAllowOverNormValue"
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
                  <span class="ms-check-item__label">Cho phép giá trị tính vượt quá định mức</span>
                </label>
                <MsTooltip
                  placement="bottom"
                  align="center"
                  offset="8px"
                  hover-size="36px"
                  hover-background="#0000001a"
                  tooltip-class="formula-limit-tooltip"
                >
                  <div class="container-icon"><span class="mi-circle-infor"></span></div>
                  <template #tooltip>
                    Nếu không tích chọn thì khi tính giá trị của thành phần lương này mà số tiền
                    vượt quá định mức thì chương trình sẽ tự động lấy tối đa bằng định mức đã nhập
                  </template>
                </MsTooltip>
              </div>
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Kiểu giá trị</p>
                </label>
              </div>
              <MsSelect
                v-model="selectedValueType"
                searchable
                variant="form"
                width="315px"
                menu-width="315px"
                trigger-padding="4px 8px 4px 4px"
                :letter-spacing="0"
                :options="valueTypeOptions"
                :disabled="isValueTypeLocked"
              />
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Giá trị</p>
                </label>
              </div>
              <div ref="valueConfigRef" class="value-config">
                <template v-if="isAutoValueConfigVisible">
                  <label class="ms-radio-wrapper value-config__radio">
                    <span class="ms-radio-item" @click="selectedValueMode = 'auto'">
                      <span
                        class="ms-radio-item__icon"
                        :class="{ 'ms-radio-item__icon--checked': selectedValueMode === 'auto' }"
                      >
                        <svg
                          v-if="selectedValueMode === 'auto'"
                          viewBox="0 0 16 16"
                          class="ms-radio-item__circle"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="6" fill="currentColor"></circle>
                        </svg>
                      </span>
                      <span class="ms-radio-item__label">
                        Tự động cộng tổng giá trị của các nhân viên
                      </span>
                    </span>
                  </label>

                  <div class="value-config__selects">
                    <div
                      class="value-combobox"
                      :class="{ 'is-open': openedValueSelect === 'scope' }"
                    >
                      <button
                        type="button"
                        class="value-combobox__trigger"
                        :disabled="selectedValueMode === 'formula'"
                        @click="toggleValueSelect('scope')"
                      >
                        <span class="value-combobox__value">{{
                          selectedAggregationScope.label
                        }}</span>
                        <MsTooltip
                          placement="top"
                          align="center"
                          offset="8px"
                          hover-size="24px"
                          hover-background="#00000000"
                          tooltip-class="value-config-tooltip"
                        >
                          <span class="mi-circle-infor-blue"></span>
                          <template #tooltip>
                            <span v-if="selectedAggregationScope.value === 'subordinate'">
                              Tự động tính bằng tổng giá trị
                              <b></b>
                              của tất cả nhân viên dưới quyền (thuộc quyền quản lý trực tiếp hoặc
                              gián tiếp)<br />
                              Ví dụ: Quản lý kinh doanh A là quản lý trực tiếp của 3 nhân viên B, C,
                              D. Giám đốc kinh doanh E là quản lý trực tiếp của A. Khi thiết lập:<br />
                              Doanh số nhóm bằng tổng giá trị Doanh số cá nhân của tất cả nhân viên
                              dưới quyền<br />
                              + Doanh số nhóm của Quản lý kinh doanh A = Doanh số cá nhân của B +
                              Doanh số cá nhân của C + Doanh số cá nhân của D<br />
                              + Doanh số nhóm của Giám đốc kinh doanh E = Doanh số cá nhân của A +
                              Doanh số cá nhân của B + Doanh số cá nhân của C + Doanh số cá nhân của
                              D
                            </span>
                            <span v-else>{{ selectedAggregationScope.tooltip }}</span>
                          </template>
                        </MsTooltip>
                        <span class="value-combobox__chevron"></span>
                      </button>
                      <div v-if="openedValueSelect === 'scope'" class="value-combobox__menu">
                        <button
                          v-for="option in aggregationScopeOptions"
                          :key="option.value"
                          type="button"
                          class="value-combobox__item"
                          :class="{ 'is-active': selectedAggregationScopeValue === option.value }"
                          @click="selectAggregationScope(option.value)"
                        >
                          <span class="value-combobox__item-label">{{ option.label }}</span>
                          <MsTooltip
                            placement="top"
                            align="center"
                            offset="8px"
                            hover-size="24px"
                            hover-background="#00000000"
                            tooltip-class="value-config-tooltip"
                          >
                            <span class="mi-circle-infor-blue"></span>
                            <template #tooltip>
                              <span v-if="option.value === 'subordinate'">
                                Tự động tính bằng tổng giá trị của tất cả nhân viên dưới quyền
                                (thuộc quyền quản lý trực tiếp hoặc gián tiếp)<br />
                                Ví dụ: Quản lý kinh doanh A là quản lý trực tiếp của 3 nhân viên B,
                                C, D. Giám đốc kinh doanh E là quản lý trực tiếp của A. Khi thiết
                                lập:<br />
                                Doanh số nhóm bằng tổng giá trị Doanh số cá nhân của tất cả nhân
                                viên dưới quyền<br />
                                + Doanh số nhóm của Quản lý kinh doanh A = Doanh số cá nhân của B +
                                Doanh số cá nhân của C + Doanh số cá nhân của D<br />
                                + Doanh số nhóm của Giám đốc kinh doanh E = Doanh số cá nhân của A +
                                Doanh số cá nhân của B + Doanh số cá nhân của C + Doanh số cá nhân
                                của D
                              </span>
                              <span v-else>{{ option.tooltip }}</span>
                            </template>
                          </MsTooltip>
                        </button>
                      </div>
                    </div>

                    <MsSelect
                      v-if="isOrganizationStructureScope"
                      v-model="selectedOrganizationLevel"
                      variant="form"
                      width="150px"
                      menu-width="150px"
                      trigger-padding="4px 8px 4px 4px"
                      :letter-spacing="0"
                      :options="organizationLevelOptions"
                      :disabled="selectedValueMode === 'formula'"
                    />

                    <MsSelect
                      v-if="selectedValueMode === 'auto'"
                      v-model="selectedAggregateSalaryCompositionCode"
                      searchable
                      variant="form"
                      width="490px"
                      menu-width="490px"
                      placeholder="Chọn thành phần lương để cộng giá trị"
                      trigger-padding="4px 8px 4px 4px"
                      :letter-spacing="0"
                      :options="salaryCompositionValueOptions"
                      label-key="name"
                      value-key="code"
                      code-key="code"
                    />
                  </div>

                  <label class="ms-radio-wrapper value-config__radio">
                    <span class="ms-radio-item" @click="selectedValueMode = 'formula'">
                      <span
                        class="ms-radio-item__icon"
                        :class="{ 'ms-radio-item__icon--checked': selectedValueMode === 'formula' }"
                      >
                        <svg
                          v-if="selectedValueMode === 'formula'"
                          viewBox="0 0 16 16"
                          class="ms-radio-item__circle"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="6" fill="currentColor"></circle>
                        </svg>
                      </span>
                      <span class="ms-radio-item__label">Tính theo công thức tự đặt</span>
                    </span>
                  </label>
                </template>

                <MsFormula
                  v-if="isValueFormulaVisible"
                  v-model="valueFormula"
                  width="100%"
                  :parameters="salaryCompositionParameters"
                  show-agent-button
                />
              </div>
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Mô tả</p>
                </label>
              </div>
              <div class="prism-editor__container">
                <textarea
                  class="prism-editor__textarea"
                  spellcheck="false"
                  autocapitalize="off"
                  autocomplete="off"
                  autocorrect="off"
                  data-gramm="false"
                  data-testid="textarea"
                  value=""
                ></textarea>
              </div>
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Hiển thị trên phiếu lương</p>
                </label>
              </div>
              <div class="flex items-center">
                <label
                  v-for="option in displayOnPayslipOptions"
                  :key="option.value"
                  class="ms-radio-wrapper"
                >
                  <span class="ms-radio-item" @click="selectedDisplayOnPayslip = option.value">
                    <span
                      class="ms-radio-item__icon"
                      :class="{
                        'ms-radio-item__icon--checked': selectedDisplayOnPayslip === option.value,
                      }"
                    >
                      <svg
                        v-if="selectedDisplayOnPayslip === option.value"
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
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Nguồn tạo</p>
                </label>
              </div>
              <MsInput v-model="sourceName" disabled width="315px" />
              <input type="hidden" :value="sourceValue" />
            </div>
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Trạng thái</p>
                </label>
              </div>
              <div class="flex items-center">
                <label v-for="option in statusOptions" :key="option.value" class="ms-radio-wrapper">
                  <span class="ms-radio-item" @click="selectedStatus = option.value">
                    <span
                      class="ms-radio-item__icon"
                      :class="{ 'ms-radio-item__icon--checked': selectedStatus === option.value }"
                    >
                      <svg
                        v-if="selectedStatus === option.value"
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
          @click="openExitConfirmModal"
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
  <MsModal
    v-model="isExitConfirmModalOpen"
    title="Thoát và không lưu?"
    message="Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại."
    cancel-text="Ở lại"
    confirm-text="Thoát, không lưu"
    @confirm="goToSalaryCompositionList"
  />
</template>

<script setup>
import MsInput from '@/components/MsInput.vue'
import MsTooltip from '@/components/MsTooltip.vue'
import MsTreeSelect from '@/components/MsTreeSelect.vue'
import OrganizationAPI from '@/apis/components/organization/Organization.js'
import { path } from '@/utils/path'
import { useQuery } from '@tanstack/vue-query'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MsButton from '@/components/MsButton.vue'
import MsFormula from '@/components/MsFormula.vue'
import MsModal from '@/components/MsModal.vue'
import MsSelect from '@/components/MsSelect.vue'
import SalaryCompositionAPI from '@/apis/components/salaryComposition/SalaryCompositionAPI'
import SalaryCompositionTypeAPI from '@/apis/components/salaryCompositionType/SalaryCompositionType'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedNature = ref(1)
const selectedSalaryCompositionTypeId = ref(null)
const selectedOrganizationIds = ref([])
const organizationErrorMessage = ref('')
const normFormula = ref('')
const valueFormula = ref('')
const selectedTaxType = ref(1)
const selectedValueType = ref(null)
const selectedValueMode = ref('auto')
const selectedAggregationScopeValue = ref('sameOrganization')
const selectedOrganizationLevel = ref(1)
const selectedAggregateSalaryCompositionCode = ref(null)
const selectedDisplayOnPayslip = ref(1)
const sourceValue = ref(1)
const sourceName = ref('Tự thêm')
const selectedStatus = ref(1)
const openedValueSelect = ref('')
const valueConfigRef = ref(null)
const isExitConfirmModalOpen = ref(false)
const isTaxReduction = ref(false)
const isAllowOverNormValue = ref(false)
const taxTypeOptions = [
  { label: 'Chịu thuế', value: 1 },
  { label: 'Miễn thuế toàn phần', value: 2 },
  { label: 'Miễn thuế một phần', value: 3 },
]

const aggregationScopeOptions = [
  {
    value: 'sameOrganization',
    label: 'Trong cùng đơn vị công tác',
    tooltip: 'Tự động tính bằng tổng giá trị của các nhân viên trong cùng đơn vị công tác',
  },
  {
    value: 'subordinate',
    label: 'Dưới quyền',
    tooltip:
      'Tự động tính bằng tổng giá trị của tất cả nhân viên dưới quyền (thuộc quyền quản lý trực tiếp hoặc gián tiếp)',
  },
  {
    value: 'organizationStructure',
    label: 'Thuộc cơ cấu tổ chức',
    tooltip:
      'Tự động tính bằng tổng giá trị của các nhân viên thuộc cơ cấu tổ chức (theo cấp thiết lập)',
  },
]
const organizationLevelOptions = [
  { value: 1, label: 'Cấp 1' },
  { value: 2, label: 'Cấp 2' },
  { value: 3, label: 'Cấp 3' },
  { value: 4, label: 'Cấp 4' },
]

const displayOnPayslipOptions = [
  { value: 1, label: 'Có' },
  { value: 2, label: 'Không' },
  { value: 3, label: 'Chỉ hiển thị nếu giá trị khác 0' },
]
const statusOptions = [
  { value: 1, label: 'Đang theo dõi' },
  { value: 0, label: 'Ngừng theo dõi' },
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
const natureOptions = computed(() => getEnumOptions('natures'))
const valueTypeOptions = computed(() => getEnumOptions('valueTypes'))
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
const isNormVisible = computed(() => isIncomeNature.value || isDeductionNature.value)
const isValueTypeLocked = computed(() => isNormVisible.value)
const selectedValueTypeLabel = computed(() =>
  getOptionLabel(valueTypeOptions.value.find((option) => option.value === selectedValueType.value)),
)
const isAutoValueConfigVisible = computed(() => {
  const label = normalizeText(selectedValueTypeLabel.value)
  return label.includes('tien te') || label === 'so' || label.includes(' so')
})
const isValueFormulaVisible = computed(
  () => !isAutoValueConfigVisible.value || selectedValueMode.value === 'formula',
)
const selectedAggregationScope = computed(
  () =>
    aggregationScopeOptions.find(
      (option) => option.value === selectedAggregationScopeValue.value,
    ) ?? aggregationScopeOptions[0],
)
const isOrganizationStructureScope = computed(
  () => selectedAggregationScopeValue.value === 'organizationStructure',
)
const salaryCompositionValueOptions = computed(() =>
  salaryCompositionParameters.value.map((item) => {
    const name = getParameterName(item)
    const code = getParameterCode(item)
    return {
      name,
      code,
    }
  }),
)
const currencyValueType = computed(
  () =>
    valueTypeOptions.value.find((option) =>
      normalizeText(getOptionLabel(option)).includes('tien te'),
    )?.value ??
    valueTypeOptions.value.find((option) => Number(option?.value) === 1)?.value ??
    null,
)

function getEnumOptions(key) {
  const enumData = salaryCompositionEnum.value ?? {}
  return enumData[key] ?? enumData[capitalizeFirstLetter(key)] ?? []
}

function getOptionLabel(option) {
  return option?.label ?? option?.Label ?? option?.name ?? option?.Name ?? ''
}

function getOrganizationId(organization) {
  return organization?.organizationID ?? organization?.OrganizationID ?? organization?.id ?? null
}

function getOrganizationParentId(organization) {
  return organization?.parentID ?? organization?.ParentID ?? organization?.parentId ?? null
}

function getNearestOrganizationId(options) {
  const rootOrganization = options.find((option) => !getOrganizationParentId(option))
  return getOrganizationId(rootOrganization ?? options[0])
}

function getParameterName(parameter) {
  return (
    parameter?.salaryCompositionName ??
    parameter?.SalaryCompositionName ??
    parameter?.name ??
    parameter?.Name ??
    ''
  )
}

function getParameterCode(parameter) {
  return (
    parameter?.salaryCompositionCode ??
    parameter?.SalaryCompositionCode ??
    parameter?.code ??
    parameter?.Code ??
    ''
  )
}

function capitalizeFirstLetter(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function toggleValueSelect(name) {
  if (selectedValueMode.value === 'formula') return
  openedValueSelect.value = openedValueSelect.value === name ? '' : name
}

function selectAggregationScope(value) {
  selectedAggregationScopeValue.value = value
  openedValueSelect.value = ''
}

function handleClickOutsideValueConfig(event) {
  if (!valueConfigRef.value?.contains(event.target)) {
    openedValueSelect.value = ''
  }
}

function openExitConfirmModal() {
  isExitConfirmModalOpen.value = true
}

function goToSalaryCompositionList() {
  router.push(path.salarycomposition)
}

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
  if (!isNormVisible.value) {
    isAllowOverNormValue.value = false
    return
  }
  selectedValueType.value = currencyValueType.value
})

watch(
  [valueTypeOptions, isNormVisible],
  () => {
    if (isNormVisible.value) {
      selectedValueType.value = currencyValueType.value
      return
    }

    if (
      selectedValueType.value === null &&
      valueTypeOptions.value.length &&
      valueTypeOptions.value[0]?.value !== undefined
    ) {
      selectedValueType.value = valueTypeOptions.value[0].value
    }
  },
  { immediate: true },
)

watch(
  natureOptions,
  (options) => {
    if (!options.length || options.some((option) => option.value === selectedNature.value)) return
    selectedNature.value = options[0].value
  },
  { immediate: true },
)

watch(
  organizations,
  (options) => {
    if (!options.length || selectedOrganizationIds.value.length) return
    const nearestOrganizationId = getNearestOrganizationId(options)
    if (nearestOrganizationId !== null && nearestOrganizationId !== undefined) {
      selectedOrganizationIds.value = [nearestOrganizationId]
    }
  },
  { immediate: true },
)

watch(isNormVisible, (visible) => {
  if (visible) return
  normFormula.value = ''
})

watch(isAutoValueConfigVisible, (visible) => {
  selectedValueMode.value = visible ? 'auto' : 'formula'
  openedValueSelect.value = ''
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutsideValueConfig)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutsideValueConfig)
})
</script>

<style scoped>
.content-header {
  flex-shrink: 0;
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
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.salarycomposition-page {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.salarycomposition-form {
  height: 100%;
  min-height: 0;
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
  padding: 12px 0 0;
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

.formula-limit-row {
  width: 838px;
  height: 36px;
}

.formula-limit-row .ms-check-wrapper {
  height: 36px;
}

.formula-limit-row :deep(.ms-tooltip-wrapper) {
  margin-left: 4px;
}

.formula-limit-row :deep(.formula-limit-tooltip) {
  width: 600px;
  max-width: 750px;
  height: 48px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 16px;
  border-radius: 8px;
  white-space: normal;
  text-align: center;
}

.container-icon {
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.value-config {
  width: 838px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.value-config__radio {
  height: 24px;
}

.value-config__selects {
  display: flex;
  align-items: center;
  gap: 10px;
}

.value-config :deep(.value-config-tooltip) {
  max-width: 630px;
  padding: 8px 12px;
  border-radius: 8px;
  white-space: normal;
  z-index: 80;
}

.value-combobox {
  position: relative;
  width: 315px;
}

.value-combobox__trigger {
  width: 315px;
  height: 32px;
  padding: 4px 32px 4px 4px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #fff;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  cursor: pointer;
  box-sizing: border-box;
}

.value-combobox__trigger:hover:not(:disabled),
.value-combobox.is-open .value-combobox__trigger {
  border-color: #0e9a62;
  box-shadow: 0 0 0 2px #2563eb1a;
}

.value-combobox__trigger:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.value-combobox__value,
.value-combobox__item-label {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.value-combobox__chevron {
  position: absolute;
  top: 50%;
  right: 12px;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON_3.svg');
  -webkit-mask-position: -32px -224px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 752px 400px;
  background-color: #717680;
  transform: translateY(-50%);
  transition: transform 0.12s ease;
}

.value-combobox.is-open .value-combobox__chevron {
  transform: translateY(-50%) rotate(180deg);
}

.value-combobox__menu {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  z-index: 40;
  width: 100%;
  padding: 4px 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px #0000001f;
  overflow: visible;
  box-sizing: border-box;
}

.value-combobox__item {
  width: 100%;
  min-height: 34px;
  padding: 4px 32px 4px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
}

.value-combobox__item:hover {
  background: #e9eaeb;
}

.value-combobox__item.is-active {
  background: #edfcf4;
  color: #0e9a62;
  font-weight: 500;
}

.value-combobox__item-label {
  flex: 0 1 auto;
}

.prism-editor__container {
  width: 838px;
}

.prism-editor__textarea:hover,
.prism-editor__textarea:focus {
  border: 1px solid #0e9a62;
}

.prism-editor__textarea {
  width: 100%;
  height: 87.6px;
  min-height: 78px;
  padding: 6px 8px 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #1570ef;
  -webkit-font-smoothing: antialiased;
  line-height: 18px;
  resize: vertical;
  box-sizing: border-box;
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

.mi-circle-infor {
  width: 20px;
  height: 20px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -220px -40px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-circle-infor-blue {
  width: 14px;
  height: 14px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -129px -377px;
  -webkit-mask-repeat: no-repeat;
  background-color: #3a94ff;
}
</style>

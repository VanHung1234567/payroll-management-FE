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
        <button type="button" class="navbar-action" @click="handleBack">
          <div class="mi-arrow-left"></div>
        </button>
      </MsTooltip>
      <div class="content-header__title">{{ formTitle }}</div>
    </div>
    <div v-if="isEditMode" class="form-header-actions flex items-center font-weight-500">
      <MsButton
        v-if="!isQuickEditMode"
        background-color="#FFFFFF"
        border-color="#D5D7DA"
        color="#101828"
        hover-background-color="#E9EAEB"
        hover-border-color="#D5D7DA"
        active-background-color="#D5D7DA"
        active-border-color="#D5D7DA"
        width="80px"
        margin="0 8px 0 0"
        @click="goToSalaryCompositionList"
      >
        Hủy bỏ
      </MsButton>
      <MsButton
        v-if="!isQuickEditMode"
        width="80px"
        margin="0 8px 0 0"
        :disabled="isSaving"
        @click="handleSave"
      >
        Lưu
      </MsButton>
      <MsButton
        v-if="isQuickEditMode"
        background-color="#FFFFFF"
        border-color="#D5D7DA"
        color="#101828"
        hover-background-color="#E9EAEB"
        hover-border-color="#D5D7DA"
        active-background-color="#D5D7DA"
        active-border-color="#D5D7DA"
        width="80px"
        margin="0 8px 0 0"
        gap="6px"
        @click="enterFullEditMode"
      >
        <span class="mi-edit"></span>
        Sửa
      </MsButton>
      <div ref="headerMenuRef" class="form-more-action">
        <MsTooltip
          content="Chức năng khác"
          placement="bottom"
          align="end"
          arrow-position="16px"
          hover-background="#e9eaeb"
        >
          <MsButton
            background-color="#FFFFFF"
            border-color="#D5D7DA"
            color="#101828"
            hover-background-color="#E9EAEB"
            hover-border-color="#D5D7DA"
            active-background-color="#D5D7DA"
            active-border-color="#D5D7DA"
            width="32px"
            padding="0"
            gap="4px"
            @click.stop="toggleHeaderMenu"
          >
            <span class="mi-threedot"></span>
          </MsButton>
        </MsTooltip>
        <div v-if="isHeaderMenuOpen" class="form-more-menu">
          <button type="button" class="form-more-menu__item" @click="handleDuplicate">
            <span class="mi-copy"></span>
            <span>Nhân bản</span>
          </button>
          <button type="button" class="form-more-menu__item" @click="handleDelete">
            <span class="mi-trash-red"></span>
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="w-full salarycomposition-page">
    <div class="salarycomposition-form">
      <div class="salarycomposition-form-scroll">
        <div class="salarycomposition-container">
          <div v-if="!isQuickEditMode" class="w-full">
            <div class="ms-row">
              <MsInput
                ref="salaryCompositionNameInputRef"
                v-model="salaryCompositionName"
                label="Tên thành phần"
                required
                width="838px"
                :error-message="formErrors.salaryCompositionName"
                @input="handleSalaryCompositionNameInput"
                @blur="validateField('salaryCompositionName')"
              />
            </div>
            <div class="ms-row">
              <MsInput
                ref="salaryCompositionCodeInputRef"
                label="Mã thành phần"
                placeholder="Nhập mã viết liền"
                required
                width="838px"
                :show-inactive-option="false"
                :model-value="salaryCompositionCode"
                :disabled="isCodeDisabled"
                :error-message="formErrors.salaryCompositionCode"
                @input="handleSalaryCompositionCodeInput"
                @blur="validateField('salaryCompositionCode')"
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
                ref="organizationTreeRef"
                v-model="selectedOrganizationIds"
                :options="organizations"
                id-key="organizationID"
                parent-key="parentID"
                label-key="organizationName"
                placeholder="Chọn đơn vị"
                width="838px"
                :show-inactive-option="false"
                :error-message="formErrors.organizationIDs"
                @change="handleOrganizationChange"
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
                ref="salaryCompositionTypeSelectRef"
                v-model="selectedSalaryCompositionTypeId"
                :options="salaryCompositionTypeOptions"
                searchable
                label=""
                variant="form"
                width="315px"
                menu-width="315px"
                trigger-padding="4px 8px 4px 4px"
                :letter-spacing="0"
                label-key="label"
                value-key="value"
                :disabled="isSourceDefault"
                :error-message="formErrors.salaryCompositionType"
                @change="validateField('salaryCompositionType')"
                @blur="validateField('salaryCompositionType')"
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
                  ref="natureSelectRef"
                  v-model="selectedNature"
                  searchable
                  variant="form"
                  width="315px"
                  menu-width="315px"
                  trigger-padding="4px 8px 4px 4px"
                  :letter-spacing="0"
                  :options="natureOptions"
                  :disabled="isSourceDefault"
                  :error-message="formErrors.nature"
                  @change="validateField('nature')"
                  @blur="validateField('nature')"
                />
                <div v-if="isIncomeNature" class="flex ml-16">
                  <label
                    v-for="option in taxTypeOptions"
                    :key="option.value"
                    class="ms-radio-wrapper"
                  >
                    <span class="ms-radio-item" @click="selectTaxType(option.value)">
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
                    :disabled="isNatureOptionDisabled"
                    @click="toggleTaxReduction"
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
                  v-model="description"
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
            <div v-if="isEditMode" class="ms-row">
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
          <div v-else class="w-full quick-edit-form">
            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Tên thành phần</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <div
                class="quick-field quick-field--large"
                :class="{ 'is-editing': quickEditingField === 'salaryCompositionName' }"
              >
                <template v-if="quickEditingField === 'salaryCompositionName'">
                  <MsInput
                    ref="quickSalaryCompositionNameInputRef"
                    v-model="salaryCompositionName"
                    width="766px"
                    :error-message="formErrors.salaryCompositionName"
                    @input="handleSalaryCompositionNameInput"
                    @blur="validateField('salaryCompositionName')"
                  />
                  <div class="quick-field__actions">
                    <MsTooltip content="Lưu" placement="bottom" offset="4px" hover-size="32px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--save"
                        :disabled="isSaving"
                        @click="saveQuickField('salaryCompositionName')"
                      >
                        <span class="mi-circle-check-2-green"></span>
                      </button>
                    </MsTooltip>
                    <MsTooltip content="Hủy bỏ" placement="bottom" offset="4px" hover-size="36px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--cancel"
                        :disabled="isSaving"
                        @click="cancelQuickEdit"
                      >
                        <span class="mi-circle-close"></span>
                      </button>
                    </MsTooltip>
                  </div>
                </template>
                <template v-else>
                  <p class="quick-field__text">{{ salaryCompositionName }}</p>
                  <MsTooltip content="Sửa" placement="bottom" offset="4px" hover-size="36px">
                    <button
                      type="button"
                      class="quick-field__edit"
                      @click="startQuickEdit('salaryCompositionName')"
                    >
                      <span class="mi-edit"></span>
                    </button>
                  </MsTooltip>
                </template>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Mã thành phần</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <div class="quick-field quick-field--large quick-field--lock-hover">
                <p class="quick-field__text">{{ salaryCompositionCode }}</p>
                <span class="quick-field__lock"><span class="mi-lock"></span></span>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Đơn vị áp dụng</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <div
                class="quick-field quick-field--large"
                :class="{ 'is-editing': quickEditingField === 'organizationIDs' }"
              >
                <template v-if="quickEditingField === 'organizationIDs'">
                  <MsTreeSelect
                    ref="quickOrganizationTreeRef"
                    v-model="selectedOrganizationIds"
                    :options="organizations"
                    id-key="organizationID"
                    parent-key="parentID"
                    label-key="organizationName"
                    placeholder="Chọn đơn vị"
                    width="766px"
                    :show-inactive-option="false"
                    :error-message="formErrors.organizationIDs"
                    @change="handleOrganizationChange"
                    @blur="validateField('organizationIDs')"
                  />
                  <div class="quick-field__actions">
                    <MsTooltip content="Lưu" placement="bottom" offset="4px" hover-size="32px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--save"
                        :disabled="isSaving"
                        @click="saveQuickField('organizationIDs')"
                      >
                        <span class="mi-circle-check-2-green"></span>
                      </button>
                    </MsTooltip>
                    <MsTooltip content="Hủy bỏ" placement="bottom" offset="4px" hover-size="36px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--cancel"
                        :disabled="isSaving"
                        @click="cancelQuickEdit"
                      >
                        <span class="mi-circle-close"></span>
                      </button>
                    </MsTooltip>
                  </div>
                </template>
                <template v-else>
                  <p class="quick-field__text">{{ selectedOrganizationLabel }}</p>
                  <MsTooltip content="Sửa" placement="bottom" offset="4px" hover-size="36px">
                    <button
                      type="button"
                      class="quick-field__edit"
                      @click="startQuickEdit('organizationIDs')"
                    >
                      <span class="mi-edit"></span>
                    </button>
                  </MsTooltip>
                </template>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Loại thành phần</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <div
                class="quick-field quick-field--compact"
                :class="{
                  'is-editing': quickEditingField === 'salaryCompositionType',
                  'is-locked': isSourceDefault,
                }"
              >
                <template v-if="quickEditingField === 'salaryCompositionType'">
                  <MsSelect
                    ref="quickSalaryCompositionTypeSelectRef"
                    v-model="selectedSalaryCompositionTypeId"
                    :options="salaryCompositionTypeOptions"
                    searchable
                    variant="form"
                    width="243px"
                    menu-width="243px"
                    trigger-padding="4px 8px 4px 8px"
                    :letter-spacing="0"
                    label-key="label"
                    value-key="value"
                    :error-message="formErrors.salaryCompositionType"
                    @change="validateField('salaryCompositionType')"
                    @blur="validateField('salaryCompositionType')"
                  />
                  <div class="quick-field__actions">
                    <MsTooltip content="Lưu" placement="bottom" hover-size="32px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--save"
                        :disabled="isSaving"
                        @click="saveQuickField('salaryCompositionType')"
                      >
                        <span class="mi-circle-check-2-green"></span>
                      </button>
                    </MsTooltip>
                    <MsTooltip content="Hủy bỏ" placement="bottom" hover-size="36px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--cancel"
                        :disabled="isSaving"
                        @click="cancelQuickEdit"
                      >
                        <span class="mi-circle-close"></span>
                      </button>
                    </MsTooltip>
                  </div>
                </template>
                <template v-else>
                  <p class="quick-field__text">{{ selectedSalaryCompositionTypeLabel }}</p>
                  <MsTooltip
                    v-if="!isSourceDefault"
                    content="Sửa"
                    placement="bottom"
                    hover-size="36px"
                  >
                    <button
                      type="button"
                      class="quick-field__edit"
                      @click="startQuickEdit('salaryCompositionType')"
                    >
                      <span class="mi-edit"></span>
                    </button>
                  </MsTooltip>
                </template>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Tính chất</p>
                  <span class="requied">*</span>
                </label>
              </div>
              <div class="quick-nature-line">
                <div
                  class="quick-field quick-field--compact"
                  :class="{
                    'is-editing': quickEditingField === 'nature',
                    'is-locked': isSourceDefault,
                  }"
                >
                  <template v-if="quickEditingField === 'nature'">
                    <MsSelect
                      ref="quickNatureSelectRef"
                      v-model="selectedNature"
                      searchable
                      variant="form"
                      width="243px"
                      menu-width="243px"
                      trigger-padding="4px 8px 4px 8px"
                      :letter-spacing="0"
                      :options="natureOptions"
                      :error-message="formErrors.nature"
                      @change="validateField('nature')"
                      @blur="validateField('nature')"
                    />
                    <div class="quick-field__actions">
                      <MsTooltip content="Lưu" placement="bottom" hover-size="32px">
                        <button
                          type="button"
                          class="quick-icon-button quick-icon-button--save"
                          :disabled="isSaving"
                          @click="saveQuickField('nature')"
                        >
                          <span class="mi-circle-check-2-green"></span>
                        </button>
                      </MsTooltip>
                      <MsTooltip content="Hủy bỏ" placement="bottom" hover-size="36px">
                        <button
                          type="button"
                          class="quick-icon-button quick-icon-button--cancel"
                          :disabled="isSaving"
                          @click="cancelQuickEdit"
                        >
                          <span class="mi-circle-close"></span>
                        </button>
                      </MsTooltip>
                    </div>
                  </template>
                  <template v-else>
                    <p class="quick-field__text">{{ selectedNatureLabel }}</p>
                    <MsTooltip
                      v-if="!isSourceDefault"
                      content="Sửa"
                      placement="bottom"
                      hover-size="36px"
                    >
                      <button
                        type="button"
                        class="quick-field__edit"
                        @click="startQuickEdit('nature')"
                      >
                        <span class="mi-edit"></span>
                      </button>
                    </MsTooltip>
                  </template>
                </div>
                <div v-if="isIncomeNature" class="flex ml-16">
                  <label
                    v-for="option in taxTypeOptions"
                    :key="option.value"
                    class="ms-radio-wrapper"
                  >
                    <span class="ms-radio-item" @click="selectTaxTypeQuick(option.value)">
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
                    @click="toggleTaxReductionQuick"
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
              <div class="w-200">
                <label>
                  <p>Định mức</p>
                </label>
              </div>
              <div
                class="quick-field quick-field--large"
                :class="{ 'is-editing': quickEditingField === 'normFormula' }"
              >
                <template v-if="quickEditingField === 'normFormula'">
                  <MsFormula
                    ref="quickNormFormulaRef"
                    v-model="normFormula"
                    width="766px"
                    :parameters="salaryCompositionParameters"
                  />
                  <div class="quick-field__actions">
                    <MsTooltip content="Lưu" placement="bottom" hover-size="32px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--save"
                        :disabled="isSaving"
                        @click="saveQuickField('normFormula')"
                      >
                        <span class="mi-circle-check-2-green"></span>
                      </button>
                    </MsTooltip>
                    <MsTooltip content="Hủy bỏ" placement="bottom" hover-size="36px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--cancel"
                        :disabled="isSaving"
                        @click="cancelQuickEdit"
                      >
                        <span class="mi-circle-close"></span>
                      </button>
                    </MsTooltip>
                  </div>
                </template>
                <template v-else>
                  <p class="quick-field__text">{{ normFormula }}</p>
                  <MsTooltip content="Sửa" placement="bottom" hover-size="36px">
                    <button
                      type="button"
                      class="quick-field__edit"
                      @click="startQuickEdit('normFormula')"
                    >
                      <span class="mi-edit"></span>
                    </button>
                  </MsTooltip>
                </template>
              </div>
            </div>

            <div v-if="isNormVisible" class="ms-row">
              <div class="w-200"></div>
              <div class="flex items-center formula-limit-row">
                <label class="ms-check-wrapper">
                  <button
                    type="button"
                    class="ms-check-item__icon"
                    :class="{ 'is-checked': isAllowOverNormValue }"
                    @click="toggleAllowOverNormQuick"
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
              <div
                class="quick-field quick-field--compact"
                :class="{
                  'is-editing': quickEditingField === 'valueType',
                  'is-locked': isSourceDefault,
                  'quick-field--lock-hover': showQuickValueTypeLock,
                }"
              >
                <template v-if="quickEditingField === 'valueType'">
                  <MsSelect
                    ref="quickValueTypeSelectRef"
                    v-model="selectedValueType"
                    searchable
                    variant="form"
                    width="243px"
                    menu-width="243px"
                    trigger-padding="4px 8px 4px 8px"
                    :letter-spacing="0"
                    :options="valueTypeOptions"
                  />
                  <div class="quick-field__actions">
                    <MsTooltip content="Lưu" placement="bottom" hover-size="32px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--save"
                        :disabled="isSaving"
                        @click="saveQuickField('valueType')"
                      >
                        <span class="mi-circle-check-2-green"></span>
                      </button>
                    </MsTooltip>
                    <MsTooltip content="Hủy bỏ" placement="bottom" hover-size="36px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--cancel"
                        :disabled="isSaving"
                        @click="cancelQuickEdit"
                      >
                        <span class="mi-circle-close"></span>
                      </button>
                    </MsTooltip>
                  </div>
                </template>
                <template v-else>
                  <p class="quick-field__text">{{ selectedValueTypeLabel }}</p>
                  <MsTooltip
                    v-if="canQuickEditValueType"
                    content="Sửa"
                    placement="bottom"
                    hover-size="36px"
                  >
                    <button
                      type="button"
                      class="quick-field__edit"
                      @click="startQuickEdit('valueType')"
                    >
                      <span class="mi-edit"></span>
                    </button>
                  </MsTooltip>
                  <span v-else-if="showQuickValueTypeLock" class="quick-field__lock">
                    <span class="mi-lock"></span>
                  </span>
                </template>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Giá trị</p>
                </label>
              </div>
              <div
                ref="valueConfigRef"
                class="quick-value"
                :class="{
                  'is-editing': isQuickValueConfigEditing || isQuickValueFormulaEditing,
                }"
              >
                <div class="quick-value__content">
                  <div v-if="isAutoValueConfigVisible" class="quick-value__config">
                    <label
                      class="ms-radio-wrapper value-config__radio"
                      :class="{ 'is-disabled': isQuickValueConfigDisabled }"
                    >
                      <span class="ms-radio-item" @click="selectValueModeQuick('auto')">
                        <span
                          class="ms-radio-item__icon"
                          :class="{
                            'ms-radio-item__icon--checked': selectedValueMode === 'auto',
                          }"
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
                          :disabled="isQuickValueConfigDisabled || selectedValueMode === 'formula'"
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
                              <span
                                v-html="getAggregationScopeTooltipHtml(selectedAggregationScope)"
                              ></span>
                              <template v-if="false">
                                <span v-if="selectedAggregationScope.value === 'subordinate'">
                                  Tự động tính bằng tổng giá trị
                                  <b></b>
                                  của tất cả nhân viên dưới quyền (thuộc quyền quản lý trực tiếp
                                  hoặc gián tiếp)<br />
                                  Ví dụ: Quản lý kinh doanh A là quản lý trực tiếp của 3 nhân viên
                                  B, C, D. Giám đốc kinh doanh E là quản lý trực tiếp của A. Khi
                                  thiết lập:<br />
                                  Doanh số nhóm bằng tổng giá trị Doanh số cá nhân của tất cả nhân
                                  viên dưới quyền<br />
                                  + Doanh số nhóm của Quản lý kinh doanh A = Doanh số cá nhân của B
                                  + Doanh số cá nhân của C + Doanh số cá nhân của D<br />
                                  + Doanh số nhóm của Giám đốc kinh doanh E = Doanh số cá nhân của A
                                  + Doanh số cá nhân của B + Doanh số cá nhân của C + Doanh số cá
                                  nhân của D
                                </span>
                                <span v-else>{{ selectedAggregationScope.tooltip }}</span>
                              </template>
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
                                <span v-html="getAggregationScopeTooltipHtml(option)"></span>
                                <template v-if="false">
                                  <span v-if="option.value === 'subordinate'">
                                    Tự động tính bằng tổng giá trị
                                    <b></b>
                                    của tất cả nhân viên dưới quyền (thuộc quyền quản lý trực tiếp
                                    hoặc gián tiếp)<br />
                                    Ví dụ: Quản lý kinh doanh A là quản lý trực tiếp của 3 nhân viên
                                    B, C, D. Giám đốc kinh doanh E là quản lý trực tiếp của A. Khi
                                    thiết lập:<br />
                                    Doanh số nhóm bằng tổng giá trị Doanh số cá nhân của tất cả nhân
                                    viên dưới quyền<br />
                                    + Doanh số nhóm của Quản lý kinh doanh A = Doanh số cá nhân của
                                    B + Doanh số cá nhân của C + Doanh số cá nhân của D<br />
                                    + Doanh số nhóm của Giám đốc kinh doanh E = Doanh số cá nhân của
                                    A + Doanh số cá nhân của B + Doanh số cá nhân của C + Doanh số
                                    cá nhân của D
                                  </span>
                                  <span v-else>{{ option.tooltip }}</span>
                                </template>
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
                        trigger-padding="4px 8px 4px 8px"
                        :letter-spacing="0"
                        :options="organizationLevelOptions"
                        :disabled="isQuickValueConfigDisabled || selectedValueMode === 'formula'"
                      />
                      <MsSelect
                        v-if="shouldShowQuickAggregateSelect"
                        v-model="selectedAggregateSalaryCompositionCode"
                        searchable
                        variant="form"
                        width="490px"
                        menu-width="490px"
                        placeholder="Chọn thành phần lương để cộng giá trị"
                        trigger-padding="4px 8px 4px 8px"
                        :letter-spacing="0"
                        :options="salaryCompositionValueOptions"
                        label-key="name"
                        value-key="code"
                        code-key="code"
                        :disabled="isQuickValueConfigDisabled || selectedValueMode === 'formula'"
                      />
                    </div>

                    <label
                      class="ms-radio-wrapper value-config__radio"
                      :class="{ 'is-disabled': isQuickValueConfigDisabled }"
                    >
                      <span class="ms-radio-item" @click="selectValueModeQuick('formula')">
                        <span
                          class="ms-radio-item__icon"
                          :class="{
                            'ms-radio-item__icon--checked': selectedValueMode === 'formula',
                          }"
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
                  </div>

                  <div v-if="isValueFormulaVisible" class="quick-value__formula-row">
                    <template v-if="isQuickValueFormulaEditing">
                      <MsFormula
                        ref="quickValueFormulaRef"
                        v-model="valueFormula"
                        width="766px"
                        :parameters="salaryCompositionParameters"
                        show-agent-button
                      />
                      <div class="quick-value__actions">
                        <MsTooltip content="Lưu" placement="bottom" hover-size="32px">
                          <button
                            type="button"
                            class="quick-icon-button quick-icon-button--save"
                            :disabled="isSaving"
                            @click="saveQuickField('valueFormula')"
                          >
                            <span class="mi-circle-check-2-green"></span>
                          </button>
                        </MsTooltip>
                        <MsTooltip content="Hủy bỏ" placement="bottom" hover-size="36px">
                          <button
                            type="button"
                            class="quick-icon-button quick-icon-button--cancel"
                            :disabled="isSaving"
                            @click="cancelQuickEdit"
                          >
                            <span class="mi-circle-close"></span>
                          </button>
                        </MsTooltip>
                      </div>
                    </template>
                    <template v-else>
                      <div class="quick-value__formula">
                        <span
                          v-for="(token, index) in getFormulaDisplayTokens(valueFormula)"
                          :key="`${token.text}-${index}`"
                          :class="`quick-value__formula-token quick-value__formula-token--${token.type}`"
                        >
                          {{ token.text }}
                        </span>
                      </div>
                      <MsTooltip content="Sửa" placement="bottom" hover-size="36px">
                        <button
                          type="button"
                          class="quick-value__edit quick-value__edit--formula"
                          @click="startQuickEdit('valueFormula')"
                        >
                          <span class="mi-edit"></span>
                        </button>
                      </MsTooltip>
                    </template>
                  </div>
                </div>
                <div v-if="isQuickValueConfigEditing" class="quick-value__actions">
                  <MsTooltip content="Lưu" placement="bottom" hover-size="32px">
                    <button
                      type="button"
                      class="quick-icon-button quick-icon-button--save"
                      :disabled="isSaving"
                      @click="saveQuickField('valueConfig')"
                    >
                      <span class="mi-circle-check-2-green"></span>
                    </button>
                  </MsTooltip>
                  <MsTooltip content="Hủy bỏ" placement="bottom" hover-size="36px">
                    <button
                      type="button"
                      class="quick-icon-button quick-icon-button--cancel"
                      :disabled="isSaving"
                      @click="cancelQuickEdit"
                    >
                      <span class="mi-circle-close"></span>
                    </button>
                  </MsTooltip>
                </div>
                <MsTooltip
                  v-else-if="isAutoValueConfigVisible && !isQuickValueFormulaEditing"
                  content="Sửa"
                  placement="bottom"
                  hover-size="36px"
                >
                  <button
                    type="button"
                    class="quick-value__edit"
                    @click="startQuickEdit('valueConfig')"
                  >
                    <span class="mi-edit"></span>
                  </button>
                </MsTooltip>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Mô tả</p>
                </label>
              </div>
              <div
                class="quick-field quick-field--large quick-field--textarea"
                :class="{ 'is-editing': quickEditingField === 'description' }"
              >
                <template v-if="quickEditingField === 'description'">
                  <textarea
                    ref="quickDescriptionTextareaRef"
                    v-model="description"
                    class="quick-textarea"
                  ></textarea>
                  <div class="quick-field__actions">
                    <MsTooltip content="Lưu" placement="bottom" hover-size="32px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--save"
                        :disabled="isSaving"
                        @click="saveQuickField('description')"
                      >
                        <span class="mi-circle-check-2-green"></span>
                      </button>
                    </MsTooltip>
                    <MsTooltip content="Hủy bỏ" placement="bottom" hover-size="36px">
                      <button
                        type="button"
                        class="quick-icon-button quick-icon-button--cancel"
                        :disabled="isSaving"
                        @click="cancelQuickEdit"
                      >
                        <span class="mi-circle-close"></span>
                      </button>
                    </MsTooltip>
                  </div>
                </template>
                <template v-else>
                  <p class="quick-field__text">{{ description }}</p>
                  <MsTooltip content="Sửa" placement="bottom" hover-size="36px">
                    <button
                      type="button"
                      class="quick-field__edit"
                      @click="startQuickEdit('description')"
                    >
                      <span class="mi-edit"></span>
                    </button>
                  </MsTooltip>
                </template>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Hiển thị trên phiếu lương</p>
                </label>
              </div>
              <div class="flex items-center quick-payslip">
                <label
                  v-for="option in displayOnPayslipOptions"
                  :key="option.value"
                  class="ms-radio-wrapper"
                >
                  <span class="ms-radio-item" @click="selectDisplayOnPayslipQuick(option.value)">
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
              <div class="quick-field quick-field--compact quick-field--readonly">
                <p class="quick-field__text">{{ sourceName }}</p>
              </div>
            </div>

            <div class="ms-row">
              <div class="w-200">
                <label>
                  <p>Trạng thái</p>
                </label>
              </div>
              <div class="quick-field quick-field--compact quick-field--readonly">
                <p class="quick-field__text">{{ selectedStatusLabel }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!isEditMode" class="insert-action-footer">
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
          :disabled="isSaving"
          @click="handleSaveAndAdd"
        >
          Lưu và thêm
        </MsButton>
        <MsButton width="80px" :disabled="isSaving" @click="handleSave">Lưu </MsButton>
      </div>
    </div>
  </div>
  <MsModal
    v-model="isExitConfirmModalOpen"
    title="Thoát và không lưu?"
    message="Nếu bạn thoát, các dữ liệu đang nhập liệu sẽ không được lưu lại."
    cancel-text="Ở lại"
    confirm-text="Thoát, không lưu"
    @confirm="confirmExitWithoutSave"
  />
  <MsModal
    v-model="isDeleteConfirmModalOpen"
    title="Thông báo"
    confirm-text="Xóa"
    cancel-text="Hủy"
    confirm-variant="danger"
    @confirm="confirmDeleteSalaryComposition"
  >
    <span>
      Bạn có chắc chắn muốn xóa thành phần lương
      <strong>{{ deleteSalaryCompositionName }}</strong>
      không?
    </span>
  </MsModal>
  <MsModal
    v-model="isDefaultDeleteModalOpen"
    title="Thông báo"
    confirm-text="Đóng"
    :show-cancel="false"
  >
    Đây là thành phần lương mặc định của hệ thống nên không thể xóa. Vui lòng kiểm tra lại.
  </MsModal>
  <MsToast v-model="toast.visible" type="success" :message="toast.message" />
</template>

<script setup>
import MsInput from '@/components/MsInput.vue'
import MsTooltip from '@/components/MsTooltip.vue'
import MsTreeSelect from '@/components/MsTreeSelect.vue'
import OrganizationAPI from '@/apis/components/organization/Organization.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import MsButton from '@/components/MsButton.vue'
import MsFormula from '@/components/MsFormula.vue'
import MsModal from '@/components/MsModal.vue'
import MsSelect from '@/components/MsSelect.vue'
import MsToast from '@/components/MsToast.vue'
import SalaryCompositionAPI from '@/apis/components/salaryComposition/SalaryCompositionAPI'
import {
  SALARY_COMPOSITION_NATURE_OPTIONS,
  SALARY_COMPOSITION_TYPE_OPTIONS,
  SALARY_COMPOSITION_VALUE_TYPE_OPTIONS,
} from '@/utils/constants'
import { salaryCompositionSchema } from '@/validations/salaryCompositionSchema'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit', 'duplicate'].includes(value),
  },
  salaryCompositionId: {
    type: [String, Number],
    default: '',
  },
  initialTitle: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'saved', 'deleted'])
const queryClient = useQueryClient()
const salaryCompositionNameInputRef = ref(null)
const salaryCompositionCodeInputRef = ref(null)
const organizationTreeRef = ref(null)
const salaryCompositionTypeSelectRef = ref(null)
const natureSelectRef = ref(null)
const quickSalaryCompositionNameInputRef = ref(null)
const quickDescriptionTextareaRef = ref(null)
const quickOrganizationTreeRef = ref(null)
const quickSalaryCompositionTypeSelectRef = ref(null)
const quickNatureSelectRef = ref(null)
const quickValueTypeSelectRef = ref(null)
const quickNormFormulaRef = ref(null)
const quickValueFormulaRef = ref(null)
const headerMenuRef = ref(null)
const salaryCompositionName = ref('')
const salaryCompositionCode = ref('')
const selectedNature = ref(1)
const selectedSalaryCompositionTypeId = ref(null)
const selectedOrganizationIds = ref([])
const isSalaryCompositionCodeManual = ref(false)
const formErrors = reactive({})
const normFormula = ref('')
const valueFormula = ref('')
const description = ref('')
const selectedTaxType = ref(1)
const selectedValueType = ref(null)
const selectedValueMode = ref('formula')
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
const isDeleteConfirmModalOpen = ref(false)
const isDefaultDeleteModalOpen = ref(false)
const isHeaderMenuOpen = ref(false)
const isDuplicateMode = ref(false)
const isQuickEditModeValue = ref(false)
const quickEditingField = ref('')
const quickEditSnapshot = ref('')
const initialFormSnapshot = ref('')
const formLoadedTitle = ref('')
const isTaxReduction = ref(false)
const isAllowOverNormValue = ref(false)
const isSaveAndAddMode = ref(false)
const toast = reactive({
  visible: false,
  message: 'Thêm thành công',
})
const currentId = computed(() => props.salaryCompositionId ?? null)
const isDetailSourceMode = computed(
  () => ['edit', 'duplicate'].includes(props.mode) && Boolean(currentId.value),
)
const isEditMode = computed(() => isDetailSourceMode.value && !isDuplicateMode.value)
const isQuickEditMode = computed(() => isEditMode.value && isQuickEditModeValue.value)
const validationCurrentId = computed(() => (isEditMode.value ? currentId.value : null))
const isFormDirty = computed(
  () => Boolean(initialFormSnapshot.value) && getFormSnapshot() !== initialFormSnapshot.value,
)
const formTitle = computed(() =>
  isEditMode.value
    ? formLoadedTitle.value || props.initialTitle || 'Chi tiết thành phần'
    : 'Thêm thành phần',
)
const deleteSalaryCompositionName = computed(
  () => props.initialTitle || salaryCompositionName.value || 'thành phần lương',
)
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

/// Lay noi dung tooltip cua combobox pham vi cong tong gia tri.
/// <param name="option">Option pham vi can hien thi tooltip.</param>
/// <returns>Noi dung tooltip dang HTML.</returns>
/// CREATED BY: VVHung (07/06/2026)
function getAggregationScopeTooltipHtml(option) {
  if (option?.value !== 'subordinate') {
    return option?.tooltip ?? ''
  }

  return [
    'Tự động tính bằng tổng giá trị của tất cả nhân viên dưới quyền (thuộc quyền quản lý trực tiếp hoặc gián tiếp)',
    'Ví dụ: Quản lý kinh doanh A là quản lý trực tiếp của 3 nhân viên B, C, D. Giám đốc kinh doanh E là quản lý trực tiếp của A. Khi thiết lập:',
    'Doanh số nhóm bằng tổng giá trị Doanh số cá nhân của tất cả nhân viên dưới quyền',
    '+ Doanh số nhóm của Quản lý kinh doanh A = Doanh số cá nhân của B + Doanh số cá nhân của C + Doanh số cá nhân của D',
    '+ Doanh số nhóm của Giám đốc kinh doanh E = Doanh số cá nhân của A + Doanh số cá nhân của B + Doanh số cá nhân của C + Doanh số cá nhân của D',
  ].join('<br />')
}

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

const { data: salaryCompositionParameterResponse } = useQuery({
  queryKey: ['salaryCompositionParameters'],
  queryFn: () =>
    SalaryCompositionAPI.paging({
      pageIndex: 1,
      pageSize: 1000,
      status: 1,
    }),
})

const { data: salaryCompositionDetailResponse } = useQuery({
  queryKey: computed(() => ['salaryCompositionDetail', currentId.value]),
  queryFn: () => SalaryCompositionAPI.detail(currentId.value),
  enabled: computed(() => isDetailSourceMode.value),
})

const createSalaryCompositionMutation = useMutation({
  mutationFn: (payload) => SalaryCompositionAPI.post(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    if (isSaveAndAddMode.value) {
      showSuccessToast()
      resetForm()
      return
    }
    emit('saved', 'create')
    emit('close')
  },
})

const updateSalaryCompositionMutation = useMutation({
  mutationFn: (payload) => SalaryCompositionAPI.put(currentId.value, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    emit('saved', 'update')
    emit('close')
  },
})

const quickUpdateSalaryCompositionMutation = useMutation({
  mutationFn: (payload) => SalaryCompositionAPI.patch(currentId.value, payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionDetail', currentId.value] })
    quickEditingField.value = ''
    setInitialFormSnapshot()
    showSuccessToast('Cập nhật thành phần lương thành công')
  },
})

const deleteSalaryCompositionMutation = useMutation({
  mutationFn: () => SalaryCompositionAPI.delete(currentId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['grid-table-paging', 'salary_composition'] })
    queryClient.invalidateQueries({ queryKey: ['salaryCompositionParameters'] })
    emit('deleted')
    emit('close')
  },
})

const organizations = computed(() => organizationResponse.value?.data?.data ?? [])
const salaryCompositionTypeOptions = computed(() => SALARY_COMPOSITION_TYPE_OPTIONS)
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
const natureOptions = computed(() => SALARY_COMPOSITION_NATURE_OPTIONS)
const valueTypeOptions = computed(() => SALARY_COMPOSITION_VALUE_TYPE_OPTIONS)
const selectedSalaryCompositionType = computed(() =>
  salaryCompositionTypeOptions.value.find(
    (option) => Number(option.value) === Number(selectedSalaryCompositionTypeId.value),
  ),
)
const normalizedSelectedTypeName = computed(() =>
  normalizeText(selectedSalaryCompositionType.value?.label ?? ''),
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
const isSourceDefault = computed(() => isEditMode.value && Number(sourceValue.value) !== 1)
const isCodeDisabled = computed(
  () => isEditMode.value && (Number(selectedStatus.value) === 1 || isSourceDefault.value),
)
const isNatureOptionDisabled = computed(() => isSourceDefault.value)
const isQuickFieldLocked = computed(() => Boolean(quickEditingField.value))
const canQuickEditValueType = computed(() => !isSourceDefault.value && !isValueTypeLocked.value)
const showQuickValueTypeLock = computed(() => !isSourceDefault.value && isValueTypeLocked.value)
const isQuickValueConfigEditing = computed(() => quickEditingField.value === 'valueConfig')
const isQuickValueFormulaEditing = computed(() => quickEditingField.value === 'valueFormula')
const isQuickValueConfigDisabled = computed(
  () => !isQuickValueConfigEditing.value || isSourceDefault.value,
)
const selectedValueTypeLabel = computed(() =>
  getOptionLabel(valueTypeOptions.value.find((option) => option.value === selectedValueType.value)),
)
const selectedSalaryCompositionTypeLabel = computed(() =>
  getOptionLabel(
    salaryCompositionTypeOptions.value.find(
      (option) => Number(option.value) === Number(selectedSalaryCompositionTypeId.value),
    ),
  ),
)
const selectedNatureLabel = computed(() =>
  getOptionLabel(
    natureOptions.value.find((option) => Number(option.value) === Number(selectedNature.value)),
  ),
)
const selectedOrganizationLabel = computed(() => {
  const selectedIdSet = new Set(selectedOrganizationIds.value.map((id) => String(id)))
  return organizations.value
    .filter((organization) => {
      const id = String(getOrganizationId(organization))
      return selectedIdSet.has(id) && !hasSelectedOrganizationAncestor(id, selectedIdSet)
    })
    .map((organization) => getOrganizationLabel(organization))
    .filter(Boolean)
    .join(', ')
})
const selectedStatusLabel = computed(
  () =>
    statusOptions.find((option) => Number(option.value) === Number(selectedStatus.value))?.label ??
    '',
)

isDuplicateMode.value = props.mode === 'duplicate'
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
const shouldShowQuickAggregateSelect = computed(
  () =>
    selectedValueMode.value === 'auto' &&
    (isOrganizationStructureScope.value ||
      isQuickValueConfigEditing.value ||
      Boolean(selectedAggregateSalaryCompositionCode.value)),
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
const isSaving = computed(
  () =>
    createSalaryCompositionMutation.isPending.value ||
    updateSalaryCompositionMutation.isPending.value ||
    quickUpdateSalaryCompositionMutation.isPending.value,
)

/// Lay nhan hien thi cua option.
/// <param name="option">Option can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getOptionLabel(option) {
  return option?.label ?? option?.Label ?? option?.name ?? option?.Name ?? ''
}

/// Lay Id don vi tu du lieu don vi.
/// <param name="organization">Du lieu don vi can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getOrganizationId(organization) {
  return organization?.organizationID ?? organization?.OrganizationID ?? organization?.id ?? null
}

/// Lay Id don vi cha tu du lieu don vi.
/// <param name="organization">Du lieu don vi can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getOrganizationParentId(organization) {
  return organization?.parentID ?? organization?.ParentID ?? organization?.parentId ?? null
}

/// Lay ten hien thi cua don vi.
/// <param name="organization">Du lieu don vi can xu ly.</param>
/// <returns>Ten don vi.</returns>
/// CREATED BY: VVHung (06/06/2026)
function getOrganizationLabel(organization) {
  return organization?.organizationName ?? organization?.OrganizationName ?? ''
}

/// Kiem tra don vi co cha dang duoc chon khong de khong hien lap lai ten con.
/// <param name="id">Id don vi can kiem tra.</param>
/// <param name="selectedIdSet">Tap id dang chon.</param>
/// <returns>true neu co cha dang duoc chon.</returns>
/// CREATED BY: VVHung (06/06/2026)
function hasSelectedOrganizationAncestor(id, selectedIdSet) {
  const organizationMap = new Map(
    organizations.value.map((organization) => [
      String(getOrganizationId(organization)),
      organization,
    ]),
  )
  let parentId = getOrganizationParentId(organizationMap.get(String(id)))

  while (parentId !== null && parentId !== undefined && parentId !== '') {
    const normalizedParentId = String(parentId)
    if (selectedIdSet.has(normalizedParentId)) return true
    parentId = getOrganizationParentId(organizationMap.get(normalizedParentId))
  }

  return false
}

/// Lay Id don vi goc gan nhat de tu chon khi mo form.
/// <param name="options">Danh sach option can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getNearestOrganizationId(options) {
  const rootOrganization = options.find((option) => !getOrganizationParentId(option))
  return getOrganizationId(rootOrganization ?? options[0])
}

/// Lay ten tham so thanh phan luong.
/// <param name="parameter">Tham so thanh phan luong can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getParameterName(parameter) {
  return (
    parameter?.salaryCompositionName ??
    parameter?.SalaryCompositionName ??
    parameter?.name ??
    parameter?.Name ??
    ''
  )
}

/// Lay ma tham so thanh phan luong.
/// <param name="parameter">Tham so thanh phan luong can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getParameterCode(parameter) {
  return (
    parameter?.salaryCompositionCode ??
    parameter?.SalaryCompositionCode ??
    parameter?.code ??
    parameter?.Code ??
    ''
  )
}

/// Lay du lieu form dung cho validate.
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getFormData() {
  return {
    salaryCompositionName: salaryCompositionName.value,
    salaryCompositionCode: salaryCompositionCode.value,
    salaryCompositionType: selectedSalaryCompositionTypeId.value,
    nature: selectedNature.value,
    organizationIDs: selectedOrganizationIds.value,
  }
}

/// Lay snapshot du lieu form de kiem tra thay doi.
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getFormSnapshot() {
  return JSON.stringify({
    salaryCompositionName: salaryCompositionName.value,
    salaryCompositionCode: salaryCompositionCode.value,
    selectedNature: selectedNature.value,
    selectedSalaryCompositionTypeId: selectedSalaryCompositionTypeId.value,
    selectedOrganizationIds: selectedOrganizationIds.value,
    normFormula: normFormula.value,
    valueFormula: valueFormula.value,
    description: description.value,
    selectedTaxType: selectedTaxType.value,
    selectedValueType: selectedValueType.value,
    selectedValueMode: selectedValueMode.value,
    selectedAggregationScopeValue: selectedAggregationScopeValue.value,
    selectedOrganizationLevel: selectedOrganizationLevel.value,
    selectedAggregateSalaryCompositionCode: selectedAggregateSalaryCompositionCode.value,
    selectedDisplayOnPayslip: selectedDisplayOnPayslip.value,
    selectedStatus: selectedStatus.value,
    isTaxReduction: isTaxReduction.value,
    isAllowOverNormValue: isAllowOverNormValue.value,
  })
}

/// Khoi phuc du lieu form tu snapshot.
/// <param name="snapshot">Snapshot dang JSON cua form.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (06/06/2026)
function restoreFormSnapshot(snapshot) {
  if (!snapshot) return

  try {
    const data = JSON.parse(snapshot)
    salaryCompositionName.value = data.salaryCompositionName ?? ''
    salaryCompositionCode.value = data.salaryCompositionCode ?? ''
    selectedNature.value = data.selectedNature ?? 1
    selectedSalaryCompositionTypeId.value = data.selectedSalaryCompositionTypeId ?? null
    selectedOrganizationIds.value = data.selectedOrganizationIds ?? []
    normFormula.value = data.normFormula ?? ''
    valueFormula.value = data.valueFormula ?? ''
    description.value = data.description ?? ''
    selectedTaxType.value = data.selectedTaxType ?? 1
    selectedValueType.value = data.selectedValueType ?? null
    selectedValueMode.value = data.selectedValueMode ?? 'formula'
    selectedAggregationScopeValue.value = data.selectedAggregationScopeValue ?? 'sameOrganization'
    selectedOrganizationLevel.value = data.selectedOrganizationLevel ?? 1
    selectedAggregateSalaryCompositionCode.value =
      data.selectedAggregateSalaryCompositionCode ?? null
    selectedDisplayOnPayslip.value = data.selectedDisplayOnPayslip ?? 1
    selectedStatus.value = data.selectedStatus ?? 1
    isTaxReduction.value = Boolean(data.isTaxReduction)
    isAllowOverNormValue.value = Boolean(data.isAllowOverNormValue)
  } catch {
    // Snapshot loi thi bo qua de tranh lam hong form dang hien thi.
  }
}

/// Thiet lap snapshot ban dau cua form.
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function setInitialFormSnapshot() {
  nextTick(() => {
    initialFormSnapshot.value = getFormSnapshot()
  })
}

/// Lay ma pham vi tu dong cong tong de gui backend.
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getAutoValueScope() {
  const scopeMap = {
    sameOrganization: 'same_organization',
    subordinate: 'subordinate',
    organizationStructure: 'organization_level',
  }

  return scopeMap[selectedAggregationScopeValue.value] ?? scopeMap.sameOrganization
}

/// Tao gia tri cong thuc gui backend theo che do dang chon.
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getValueFormulaPayload() {
  if (isAutoValueConfigVisible.value && selectedValueMode.value === 'auto') {
    const autoValueConfig = {
      mode: 'auto_sum',
      scope: getAutoValueScope(),
    }

    if (selectedAggregationScopeValue.value === 'organizationStructure') {
      autoValueConfig.level = Number(selectedOrganizationLevel.value)
    }

    autoValueConfig.salaryCode = selectedAggregateSalaryCompositionCode.value ?? ''

    return JSON.stringify(autoValueConfig)
  }

  return valueFormula.value ?? ''
}

/// Tach cong thuc thanh cac token de hien thi mau trong sua nhanh.
/// <param name="value">Chuoi cong thuc can xu ly.</param>
/// <returns>Danh sach token hien thi.</returns>
/// CREATED BY: VVHung (06/06/2026)
function getFormulaDisplayTokens(value) {
  const parts = String(value ?? '')
    .split(/([=+\-*/(),])/)
    .filter((part) => part !== '')

  return parts.map((text, index) => {
    if (/^[=+\-*/(),]$/.test(text)) {
      return { text, type: 'operator' }
    }

    const nextToken = parts[index + 1] ?? ''
    if (/^[A-Z][A-Z0-9_]*$/.test(text) && nextToken === '(' && !text.includes('_')) {
      return { text, type: 'function' }
    }

    return { text, type: 'parameter' }
  })
}

/// Tao payload thanh phan luong de them hoac cap nhat.
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function buildSalaryCompositionPayload() {
  return {
    salaryCompositionCode: salaryCompositionCode.value,
    salaryCompositionName: salaryCompositionName.value,
    organizationIDs: selectedOrganizationIds.value.join(';'),
    salaryCompositionType: selectedSalaryCompositionTypeId.value,
    nature: selectedNature.value,
    taxType: isIncomeNature.value ? selectedTaxType.value : null,
    isTaxReduction: isDeductionNature.value ? isTaxReduction.value : null,
    normFormula: isNormVisible.value ? normFormula.value : '',
    allowOverNorm: isNormVisible.value ? isAllowOverNormValue.value : false,
    valueType: selectedValueType.value,
    valueFormula: getValueFormulaPayload(),
    description: description.value,
    payslipDisplayType: selectedDisplayOnPayslip.value,
    createdSource: sourceValue.value,
    status: isEditMode.value ? selectedStatus.value : 1,
  }
}

/// Dat lai form ve trang thai them moi ban dau.
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function resetForm() {
  salaryCompositionName.value = ''
  salaryCompositionCode.value = ''
  selectedSalaryCompositionTypeId.value = null
  selectedNature.value = 1
  selectedTaxType.value = 1
  isTaxReduction.value = false
  normFormula.value = ''
  isAllowOverNormValue.value = false
  selectedValueMode.value = 'formula'
  selectedAggregationScopeValue.value = 'sameOrganization'
  selectedOrganizationLevel.value = 1
  selectedAggregateSalaryCompositionCode.value = null
  valueFormula.value = ''
  description.value = ''
  selectedDisplayOnPayslip.value = 1
  isSalaryCompositionCodeManual.value = false
  setFormErrors({ inner: [] })

  const nearestOrganizationId = getNearestOrganizationId(organizations.value)
  selectedOrganizationIds.value =
    nearestOrganizationId !== null && nearestOrganizationId !== undefined
      ? [nearestOrganizationId]
      : []
  setInitialFormSnapshot()
}

/// Chuan hoa du lieu tra ve tu API ve payload su dung trong man hinh.
/// <param name="response">Response tra ve tu API.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function normalizeResponseData(response) {
  return response?.data?.data ?? response?.data ?? {}
}

/// Gan du lieu chi tiet thanh phan luong len form.
/// <param name="detail">Du lieu chi tiet thanh phan luong.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function setFormValueFromDetail(detail) {
  if (!detail || !Object.keys(detail).length) return

  salaryCompositionName.value = detail.salaryCompositionName ?? detail.SalaryCompositionName ?? ''
  formLoadedTitle.value = salaryCompositionName.value || props.initialTitle
  salaryCompositionCode.value = detail.salaryCompositionCode ?? detail.SalaryCompositionCode ?? ''
  selectedOrganizationIds.value = String(detail.organizationIDs ?? detail.OrganizationIDs ?? '')
    .split(';')
    .map((id) => id.trim())
    .filter(Boolean)
  selectedSalaryCompositionTypeId.value =
    detail.salaryCompositionType ?? detail.SalaryCompositionType ?? null
  selectedNature.value = detail.nature ?? detail.Nature ?? 1
  selectedTaxType.value = detail.taxType ?? detail.TaxType ?? 1
  isTaxReduction.value = Boolean(detail.isTaxReduction ?? detail.IsTaxReduction ?? false)
  normFormula.value = detail.normFormula ?? detail.NormFormula ?? ''
  isAllowOverNormValue.value = Boolean(detail.allowOverNorm ?? detail.AllowOverNorm ?? false)
  selectedValueType.value = detail.valueType ?? detail.ValueType ?? null
  description.value = detail.description ?? detail.Description ?? ''
  selectedDisplayOnPayslip.value = detail.payslipDisplayType ?? detail.PayslipDisplayType ?? 1
  sourceValue.value = detail.createdSource ?? detail.CreatedSource ?? 1
  sourceName.value =
    detail.createdSourceName ??
    detail.CreatedSourceName ??
    (Number(sourceValue.value) === 1 ? 'Tự thêm' : 'Mặc định')
  selectedStatus.value = detail.status ?? detail.Status ?? 1
  isSalaryCompositionCodeManual.value = true

  setValueFormulaFromDetail(detail.valueFormula ?? detail.ValueFormula ?? '')
  setFormErrors({ inner: [] })
  setInitialFormSnapshot()
}

/// Gan cau hinh cong thuc gia tri tu du lieu chi tiet len form.
/// <param name="rawValueFormula">Chuoi cong thuc gia tri tu backend.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function setValueFormulaFromDetail(rawValueFormula) {
  const rawFormula = rawValueFormula ?? ''

  try {
    const config = typeof rawFormula === 'string' ? JSON.parse(rawFormula) : rawFormula
    if (config?.mode === 'auto_sum') {
      selectedValueMode.value = 'auto'
      selectedAggregationScopeValue.value = getAggregationScopeFromPayload(config.scope)
      selectedOrganizationLevel.value = Number(config.level ?? 1)
      selectedAggregateSalaryCompositionCode.value = config.salaryCode ?? ''
      valueFormula.value = ''
      return
    }
  } catch {
    // Công thức tự đặt không phải JSON auto_sum.
  }

  selectedValueMode.value = 'formula'
  valueFormula.value = rawFormula
}

/// Chuyen ma pham vi backend sang gia tri chon tren form.
/// <param name="scope">Ma pham vi tu dong cong tong.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function getAggregationScopeFromPayload(scope) {
  const scopeMap = {
    same_organization: 'sameOrganization',
    subordinate: 'subordinate',
    organization_level: 'organizationStructure',
  }

  return scopeMap[scope] ?? 'sameOrganization'
}

/// Sinh ma thanh phan luong tu ten thanh phan.
/// <param name="value">Gia tri can xu ly.</param>
/// <returns>Du lieu sau khi xu ly.</returns>
/// CREATED BY: VVHung (03/06/2026)
function generateSalaryCompositionCode(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
}

/// Gan danh sach loi validate len form.
/// <param name="errors">Danh sach loi validate.</param>
/// <returns>Khong tra ve du lieu.</returns>
/// CREATED BY: VVHung (03/06/2026)
function setFormErrors(errors) {
  Object.keys(formErrors).forEach((key) => {
    delete formErrors[key]
  })

  errors.inner?.forEach((error) => {
    if (error.path && !formErrors[error.path]) {
      formErrors[error.path] = error.message
    }
  })
}

const errorFieldRefs = {
  salaryCompositionName: salaryCompositionNameInputRef,
  salaryCompositionCode: salaryCompositionCodeInputRef,
  organizationIDs: organizationTreeRef,
  salaryCompositionType: salaryCompositionTypeSelectRef,
  nature: natureSelectRef,
}

/// Focus vao truong loi dau tien tren form.
/// CREATED BY: VVHung (03/06/2026)
function focusFirstError() {
  const firstErrorField = [
    'salaryCompositionName',
    'salaryCompositionCode',
    'organizationIDs',
    'salaryCompositionType',
    'nature',
  ].find((field) => Boolean(formErrors[field]))

  if (!firstErrorField) return

  nextTick(() => {
    errorFieldRefs[firstErrorField]?.value?.focus?.()
  })
}

/// Hien thi toast thong bao thanh cong.
/// <param name="message">Noi dung toast.</param>
/// CREATED BY: VVHung (03/06/2026)
function showSuccessToast(message = 'Thêm thành công') {
  toast.visible = false
  toast.message = message
  nextTick(() => {
    toast.visible = true
  })
}

/// Xoa loi validate cua mot truong.
/// <param name="field">Ten truong can xu ly.</param>
/// CREATED BY: VVHung (03/06/2026)
function clearFormError(field) {
  delete formErrors[field]
}

/// Gan hoac xoa loi validate cua mot truong.
/// <param name="field">Ten truong can xu ly.</param>
/// <param name="message">Noi dung thong bao.</param>
/// CREATED BY: VVHung (03/06/2026)
function setFieldError(field, message) {
  if (message) {
    formErrors[field] = message
    return
  }

  clearFormError(field)
}

/// Validate mot truong du lieu tren form.
/// <param name="field">Ten truong can xu ly.</param>
/// CREATED BY: VVHung (03/06/2026)
async function validateField(field) {
  try {
    await salaryCompositionSchema(
      salaryCompositionParameters.value,
      validationCurrentId.value,
    ).validateAt(field, getFormData())
    clearFormError(field)
    return true
  } catch (error) {
    setFieldError(field, error.message)
    return false
  }
}

/// Validate toan bo du lieu form truoc khi luu.
/// <returns>true neu form hop le, nguoc lai false.</returns>
/// CREATED BY: VVHung (03/06/2026)
async function validateForm() {
  try {
    await salaryCompositionSchema(
      salaryCompositionParameters.value,
      validationCurrentId.value,
    ).validate(getFormData(), {
      abortEarly: false,
    })
    setFormErrors({ inner: [] })
    return true
  } catch (error) {
    setFormErrors(error)
    focusFirstError()
    return false
  }
}

/// Xu ly nhap ten thanh phan va tu sinh ma khi chua sua thu cong.
/// <param name="event">Su kien phat sinh tu giao dien.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleSalaryCompositionNameInput(event) {
  const value = event.target.value
  salaryCompositionName.value = value
  if (formErrors.salaryCompositionName) {
    validateField('salaryCompositionName')
  }

  if (!isSalaryCompositionCodeManual.value) {
    salaryCompositionCode.value = generateSalaryCompositionCode(value)
    validateField('salaryCompositionCode')
  }
}

/// Xu ly nhap ma thanh phan va ngat lien ket tu sinh ma.
/// <param name="event">Su kien phat sinh tu giao dien.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleSalaryCompositionCodeInput(event) {
  isSalaryCompositionCodeManual.value = true
  salaryCompositionCode.value = generateSalaryCompositionCode(event.target.value)
  if (formErrors.salaryCompositionCode) {
    validateField('salaryCompositionCode')
  }
}

/// Validate don vi ap dung khi nguoi dung thay doi lua chon.
/// CREATED BY: VVHung (03/06/2026)
function handleOrganizationChange() {
  validateField('organizationIDs')
}

/// Validate va luu thanh phan luong.
/// CREATED BY: VVHung (03/06/2026)
async function handleSave() {
  isSaveAndAddMode.value = false
  if (!(await validateForm())) return
  const payload = buildSalaryCompositionPayload()
  if (isEditMode.value) {
    updateSalaryCompositionMutation.mutate(payload)
    return
  }
  createSalaryCompositionMutation.mutate(payload)
}

/// Validate, luu thanh phan luong va mo lai form them moi.
/// CREATED BY: VVHung (03/06/2026)
async function handleSaveAndAdd() {
  isSaveAndAddMode.value = true
  if (!(await validateForm())) return
  createSalaryCompositionMutation.mutate(buildSalaryCompositionPayload())
}

/// Chuyen form sang che do sua nhanh.
/// CREATED BY: VVHung (06/06/2026)
function enterQuickEditMode() {
  if (!isEditMode.value) return
  restoreFormSnapshot(initialFormSnapshot.value)
  setFormErrors({ inner: [] })
  quickEditingField.value = ''
  quickEditSnapshot.value = ''
  isQuickEditModeValue.value = true
  setInitialFormSnapshot()
}

/// Chuyen tu sua nhanh ve che do sua day du.
/// CREATED BY: VVHung (06/06/2026)
function enterFullEditMode() {
  if (!isEditMode.value) return
  if (quickEditingField.value) {
    restoreFormSnapshot(quickEditSnapshot.value)
  }
  quickEditingField.value = ''
  quickEditSnapshot.value = ''
  isQuickEditModeValue.value = false
}

/// Bat dau sua nhanh mot truong.
/// <param name="field">Ten truong can sua nhanh.</param>
/// CREATED BY: VVHung (06/06/2026)
function startQuickEdit(field) {
  if (!isQuickEditMode.value || isSaving.value) return
  if (quickEditingField.value && quickEditingField.value !== field) return
  if (field === 'valueType' && !canQuickEditValueType.value) return
  quickEditingField.value = field
  quickEditSnapshot.value = getFormSnapshot()

  nextTick(() => {
    if (field === 'salaryCompositionName') {
      quickSalaryCompositionNameInputRef.value?.focus?.()
    }
    if (field === 'organizationIDs') {
      quickOrganizationTreeRef.value?.focus?.()
    }
    if (field === 'salaryCompositionType') {
      quickSalaryCompositionTypeSelectRef.value?.focus?.()
    }
    if (field === 'nature') {
      quickNatureSelectRef.value?.focus?.()
    }
    if (field === 'valueType') {
      quickValueTypeSelectRef.value?.focus?.()
    }
    if (field === 'normFormula') {
      quickNormFormulaRef.value?.focus?.()
    }
    if (field === 'valueFormula') {
      quickValueFormulaRef.value?.focus?.()
    }
    if (field === 'description') {
      quickDescriptionTextareaRef.value?.focus?.()
    }
  })
}

/// Huy thay doi cua truong dang sua nhanh.
/// CREATED BY: VVHung (06/06/2026)
function cancelQuickEdit() {
  restoreFormSnapshot(quickEditSnapshot.value)
  quickEditingField.value = ''
  quickEditSnapshot.value = ''
}

/// Lay payload PATCH theo truong dang sua nhanh.
/// <param name="field">Ten truong can tao payload.</param>
/// <returns>Payload gui len API.</returns>
/// CREATED BY: VVHung (06/06/2026)
function buildQuickPatchPayload(field) {
  const payloadMap = {
    salaryCompositionName: () => ({ salaryCompositionName: salaryCompositionName.value }),
    organizationIDs: () => ({ organizationIDs: selectedOrganizationIds.value.join(';') }),
    salaryCompositionType: () => ({
      salaryCompositionType: selectedSalaryCompositionTypeId.value,
    }),
    nature: () => ({
      nature: selectedNature.value,
      taxType: isIncomeNature.value ? selectedTaxType.value : null,
      isTaxReduction: isDeductionNature.value ? isTaxReduction.value : null,
    }),
    valueType: () => ({ valueType: selectedValueType.value }),
    valueConfig: () => ({ valueFormula: getValueFormulaPayload() }),
    normFormula: () => ({
      normFormula: isNormVisible.value ? normFormula.value : '',
      allowOverNorm: isNormVisible.value ? isAllowOverNormValue.value : false,
    }),
    valueFormula: () => ({ valueFormula: getValueFormulaPayload() }),
    description: () => ({ description: description.value }),
    payslipDisplayType: () => ({ payslipDisplayType: selectedDisplayOnPayslip.value }),
  }

  return payloadMap[field]?.() ?? {}
}

/// Validate truong dang sua nhanh neu can.
/// <param name="field">Ten truong can validate.</param>
/// <returns>true neu hop le.</returns>
/// CREATED BY: VVHung (06/06/2026)
async function validateQuickField(field) {
  const validateFieldMap = {
    salaryCompositionName: 'salaryCompositionName',
    organizationIDs: 'organizationIDs',
    salaryCompositionType: 'salaryCompositionType',
    nature: 'nature',
  }
  const formField = validateFieldMap[field]
  if (!formField) return true

  return validateField(formField)
}

/// Luu nhanh mot truong bang API PATCH.
/// <param name="field">Ten truong can luu nhanh.</param>
/// CREATED BY: VVHung (06/06/2026)
async function saveQuickField(field = quickEditingField.value) {
  if (!field || isSaving.value || !currentId.value) return
  if (!(await validateQuickField(field))) return

  quickUpdateSalaryCompositionMutation.mutate(buildQuickPatchPayload(field))
}

/// Chon va tu dong luu cau hinh hien thi tren phieu luong trong sua nhanh.
/// <param name="value">Gia tri lua chon.</param>
/// CREATED BY: VVHung (06/06/2026)
function selectDisplayOnPayslipQuick(value) {
  if (selectedDisplayOnPayslip.value === value || isSaving.value) return
  selectedDisplayOnPayslip.value = value
  saveQuickField('payslipDisplayType')
}

/// Chon kieu tinh thue va tu dong luu trong che do sua nhanh.
/// <param name="value">Gia tri lua chon.</param>
/// CREATED BY: VVHung (06/06/2026)
function selectTaxTypeQuick(value) {
  if (selectedTaxType.value === value || isSaving.value) return
  selectedTaxType.value = value
  saveQuickField('nature')
}

/// Bat/tat giam tru tinh thue va tu dong luu trong che do sua nhanh.
/// CREATED BY: VVHung (06/06/2026)
function toggleTaxReductionQuick() {
  if (isSaving.value) return
  isTaxReduction.value = !isTaxReduction.value
  saveQuickField('nature')
}

/// Bat/tat cho phep vuot dinh muc va tu dong luu trong che do sua nhanh.
/// CREATED BY: VVHung (06/06/2026)
function toggleAllowOverNormQuick() {
  if (isSaving.value) return
  isAllowOverNormValue.value = !isAllowOverNormValue.value
  saveQuickField('normFormula')
}

/// Chon che do gia tri trong sua nhanh neu cum gia tri dang mo sua.
/// <param name="value">Che do gia tri.</param>
/// CREATED BY: VVHung (06/06/2026)
function selectValueModeQuick(value) {
  if (isQuickValueConfigDisabled.value) return
  selectedValueMode.value = value
}

/// Mo hoac dong dropdown cau hinh gia tri tu dong.
/// <param name="name">Ten dropdown can xu ly.</param>
/// CREATED BY: VVHung (03/06/2026)
function toggleValueSelect(name) {
  if (selectedValueMode.value === 'formula') return
  if (isQuickEditMode.value && isQuickValueConfigDisabled.value) return
  openedValueSelect.value = openedValueSelect.value === name ? '' : name
}

/// Chon pham vi tu dong cong tong gia tri.
/// <param name="value">Gia tri can xu ly.</param>
/// CREATED BY: VVHung (03/06/2026)
function selectAggregationScope(value) {
  if (isQuickEditMode.value && isQuickValueConfigDisabled.value) return
  selectedAggregationScopeValue.value = value
  openedValueSelect.value = ''
}

/// Chon kieu tinh thue cua thanh phan thu nhap.
/// <param name="value">Gia tri can xu ly.</param>
/// CREATED BY: VVHung (03/06/2026)
function selectTaxType(value) {
  if (isNatureOptionDisabled.value) return
  selectedTaxType.value = value
}

/// Bat hoac tat lua chon giam tru khi tinh thue.
/// CREATED BY: VVHung (03/06/2026)
function toggleTaxReduction() {
  if (isNatureOptionDisabled.value) return
  isTaxReduction.value = !isTaxReduction.value
}

/// Mo hoac dong menu chuc nang tren header form.
/// CREATED BY: VVHung (03/06/2026)
function toggleHeaderMenu() {
  isHeaderMenuOpen.value = !isHeaderMenuOpen.value
}

/// Chuyen form chi tiet sang che do nhan ban.
/// CREATED BY: VVHung (03/06/2026)
function handleDuplicate() {
  isHeaderMenuOpen.value = false
  enterDuplicateMode()
}

/// Thiet lap form sang che do nhan ban va xoa ten, ma.
/// CREATED BY: VVHung (03/06/2026)
function enterDuplicateMode() {
  isDuplicateMode.value = true
  salaryCompositionName.value = ''
  salaryCompositionCode.value = ''
  sourceValue.value = 1
  sourceName.value = 'Tự thêm'
  selectedStatus.value = 1
  isSalaryCompositionCodeManual.value = false
  setFormErrors({ inner: [] })
  setInitialFormSnapshot()

  nextTick(() => {
    salaryCompositionNameInputRef.value?.focus?.()
  })
}

/// Mo luong xoa thanh phan luong tu form chi tiet.
/// CREATED BY: VVHung (03/06/2026)
function handleDelete() {
  isHeaderMenuOpen.value = false
  if (isSourceDefault.value) {
    isDefaultDeleteModalOpen.value = true
    return
  }

  isDeleteConfirmModalOpen.value = true
}

/// Xac nhan xoa thanh phan luong dang chon.
/// CREATED BY: VVHung (03/06/2026)
function confirmDeleteSalaryComposition() {
  if (!currentId.value) return
  deleteSalaryCompositionMutation.mutate()
}

/// Dong dropdown cau hinh khi click ra ngoai.
/// <param name="event">Su kien phat sinh tu giao dien.</param>
/// CREATED BY: VVHung (03/06/2026)
function handleClickOutsideValueConfig(event) {
  if (!valueConfigRef.value?.contains(event.target)) {
    openedValueSelect.value = ''
  }

  if (headerMenuRef.value && !headerMenuRef.value.contains(event.target)) {
    isHeaderMenuOpen.value = false
  }
}

/// Mo modal xac nhan thoat form khi co du lieu chua luu.
/// CREATED BY: VVHung (03/06/2026)
function openExitConfirmModal() {
  isExitConfirmModalOpen.value = true
}

/// Xu ly nut quay lai khoi form thanh phan luong.
/// CREATED BY: VVHung (03/06/2026)
function handleBack() {
  if (isFormDirty.value || !isEditMode.value) {
    openExitConfirmModal()
    return
  }

  confirmExitWithoutSave()
}

/// Xu ly nut huy bo tren form thanh phan luong.
/// CREATED BY: VVHung (03/06/2026)
function goToSalaryCompositionList() {
  if (isEditMode.value) {
    enterQuickEditMode()
    return
  }

  if (isFormDirty.value) {
    openExitConfirmModal()
    return
  }

  confirmExitWithoutSave()
}

/// Xac nhan thoat form ma khong luu du lieu.
/// CREATED BY: VVHung (03/06/2026)
function confirmExitWithoutSave() {
  emit('close')
}

/// Chuan hoa chuoi tieng Viet de so sanh khong dau.
/// <param name="value">Gia tri can xu ly.</param>
/// CREATED BY: VVHung (03/06/2026)
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
    if (isEditMode.value) return
    if (!selectedSalaryCompositionTypeId.value) return
    selectedNature.value = isAutoOtherNatureType.value ? 3 : 1
  },
  { immediate: true },
)

watch(
  salaryCompositionDetailResponse,
  (response) => {
    if (!isDetailSourceMode.value) return
    setFormValueFromDetail(normalizeResponseData(response))
    if (props.mode === 'duplicate') {
      enterDuplicateMode()
    }
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
      if (!isDetailSourceMode.value) {
        setInitialFormSnapshot()
      }
    }
  },
  { immediate: true },
)

watch(isNormVisible, (visible) => {
  if (visible) return
  normFormula.value = ''
})

watch(isAutoValueConfigVisible, (visible) => {
  if (!visible) {
    selectedValueMode.value = 'formula'
  }
  openedValueSelect.value = ''
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutsideValueConfig)
  if (isEditMode.value) return
  nextTick(() => {
    salaryCompositionNameInputRef.value?.focus?.()
    if (!isDetailSourceMode.value) {
      setInitialFormSnapshot()
    }
  })
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

.form-header-actions {
  position: relative;
}

.form-more-action {
  position: relative;
}

.form-more-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: -8px;
  z-index: 60;
  min-width: 160px;
  padding: 8px 0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1000000015);
}

.form-more-menu__item {
  width: 100%;
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: #101828;
  font: inherit;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
}

.form-more-menu__item:hover {
  background: #e9eaeb;
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

.ms-radio-wrapper.is-disabled,
.ms-check-wrapper.is-disabled {
  cursor: not-allowed;
}

.ms-radio-wrapper.is-disabled .ms-radio-item,
.ms-check-wrapper.is-disabled,
.ms-check-wrapper.is-disabled .ms-check-item__icon {
  cursor: not-allowed;
}

.ms-radio-wrapper.is-disabled .ms-radio-item:hover .ms-radio-item__icon {
  border-color: #d5d7da;
}

.ms-radio-wrapper.is-disabled .ms-radio-item__icon,
.ms-check-wrapper.is-disabled .ms-check-item__icon {
  opacity: 0.5;
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

.value-config :deep(.value-config-tooltip),
.quick-value :deep(.value-config-tooltip) {
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
  color: #101828;
  caret-color: #0e9a62;
  -webkit-font-smoothing: antialiased;
  line-height: 18px;
  resize: vertical;
  box-sizing: border-box;
}

.prism-editor__textarea::placeholder {
  color: #d8d8da;
}

.quick-edit-form .ms-row {
  min-height: 36px;
}

.quick-header-edit-tooltip {
  margin-right: 8px;
}

.quick-field {
  position: relative;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #101828;
  border-bottom: 1px solid #e3e5ee;
  box-sizing: border-box;
}

.quick-field--large {
  width: 838px;
}

.quick-field--compact {
  width: 315px;
}

.quick-field.is-locked {
  background: #e8eaef;
}

.quick-field.is-editing {
  align-items: flex-start;
  gap: 4px;
  border-bottom-color: transparent;
}

.quick-field__text {
  min-width: 0;
  width: 100%;
  min-height: 35px;
  margin: 0;
  padding-left: 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
}

.quick-field--textarea .quick-field__text {
  min-height: 36px;
  white-space: normal;
}

.quick-field__edit,
.quick-value__edit {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0;
  cursor: pointer;
}

.quick-field:hover .quick-field__edit,
.quick-value:hover .quick-value__edit {
  opacity: 1;
}

.quick-field__edit:hover,
.quick-value__edit:hover,
.quick-icon-button--cancel:hover {
  background: #0000001a;
}

.quick-field__lock {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-field--lock-hover .quick-field__lock {
  opacity: 0;
}

.quick-field--lock-hover:hover .quick-field__lock {
  opacity: 1;
}

.quick-nature-line {
  display: flex;
  align-items: center;
  min-height: 36px;
}

.quick-field__actions,
.quick-value__actions {
  height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.quick-icon-button {
  padding: 0;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.quick-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.quick-icon-button--save {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.quick-icon-button--save:hover {
  background: #0000001a;
}

.quick-icon-button--cancel {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.quick-edit-form :deep(.ms-tooltip-wrapper:has(.quick-icon-button)),
.quick-edit-form :deep(.ms-tooltip-wrapper:has(.quick-field__edit)),
.quick-edit-form :deep(.ms-tooltip-wrapper:has(.quick-value__edit)) {
  --ms-tooltip-offset: 4px !important;
}

.quick-field :deep(.ms-input),
.quick-field :deep(.ms-input__field-wrap) {
  flex-shrink: 0;
}

.quick-field :deep(.ms-input__control) {
  height: 36px;
}

.quick-field :deep(.ms-tree-select) {
  flex-shrink: 0;
}

.quick-edit-form :deep(.ms-select__trigger) {
  padding-left: 8px;
}

.quick-textarea {
  width: 766px;
  height: 78px;
  min-height: 78px;
  padding: 6px 8px 8px 12px;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  caret-color: #0e9a62;
}

.quick-textarea:hover,
.quick-textarea:focus {
  border-color: #0e9a62;
}

.quick-value {
  position: relative;
  width: 838px;
  min-height: 36px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.quick-value__content {
  width: 838px;
  min-height: 36px;
}

.quick-value.is-editing .quick-value__content {
  border-bottom-color: transparent;
}

.quick-value__config {
  min-height: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  color: #101828;
  font-size: 13px;
  line-height: 18px;
}

.quick-value__formula-row {
  width: 838px;
  min-height: 36px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e3e5ee;
  box-sizing: border-box;
}

.quick-value__formula-row:has(.dx-widget),
.quick-value__formula-row:has(.quick-value__actions) {
  border-bottom-color: transparent;
}

.quick-value__formula {
  min-height: 36px;
  min-width: 0;
  flex: 1;
  padding-left: 8px;
  display: flex;
  align-items: center;
  color: #0075ff;
  box-sizing: border-box;
}

.quick-value__formula-token--parameter {
  color: #1570ef;
}

.quick-value__formula-token--function {
  color: #000;
}

.quick-value__formula-token--operator {
  color: #f04438;
}

.quick-value__edit--formula {
  opacity: 0;
}

.quick-value__formula-row:hover .quick-value__edit--formula {
  opacity: 1;
}

.quick-value__disabled-select {
  position: relative;
  width: 315px;
  height: 32px;
  padding: 4px 32px 4px 8px;
  display: inline-flex;
  align-items: center;
  border: 1px solid #d5d7da;
  border-radius: 8px;
  background: #f5f5f5;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 18px;
  cursor: not-allowed;
  box-sizing: border-box;
}

.quick-payslip {
  min-height: 36px;
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

.mi-threedot {
  width: 16px;
  height: 10px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -122px -44px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-copy {
  width: 22px;
  height: 18px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -100px 0;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-trash-red {
  width: 20px;
  height: 20px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -100px -21px;
  -webkit-mask-repeat: no-repeat;
  background-color: #ff6161;
}

.mi-edit {
  width: 15px;
  height: 15px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -82px -3px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-lock {
  width: 14px;
  height: 18px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -3px -21px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-circle-check-2-green {
  width: 16px;
  height: 16px;
  background: url('../../assets/images/ICON.svg') -302px -62px no-repeat;
}

.mi-circle-close {
  width: 20px;
  height: 20px;
  display: inline-block;
  flex-shrink: 0;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -201px -41px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}
</style>

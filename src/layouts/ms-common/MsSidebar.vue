<template>
  <div class="sidebar_container" :class="{ 'is-collapsed': isCollapsed }">
    <div class="sidebar_menu">
      <RouterLink :to="path.dashboard" class="text-decoration-none">
        <MsTooltip
          content="Tổng quan"
          placement="right"
          align="center"
          :offset="8"
          :hover-size="0"
          font-size="12px"
          line-height="16px"
        >
          <MsButton
            width="100%"
            active-background-color="#D5D7DA"
            hover-background-color="#E9EAEB"
            :background-color="activeKey === 'overview' ? '#E6F5EF' : 'transparent'"
            :color="activeKey === 'overview' ? '#0e9a62' : '#101828'"
            border-color="none"
            justify-content="left"
            :button-class="['sidebar_menu_button', { active: activeKey === 'overview' }]"
            height="36px"
            @click="setActive('overview')"
          >
            <div class="mi-sidebar-home"></div>
            <div class="sidebar_menu_item_text">Tổng quan</div>
          </MsButton>
        </MsTooltip>
      </RouterLink>
      <RouterLink :to="path.salarycomposition" class="text-decoration-none">
        <MsTooltip
          content="Thành phần lương"
          placement="right"
          align="center"
          :offset="8"
          :hover-size="0"
          font-size="12px"
          line-height="16px"
        >
          <MsButton
            width="100%"
            active-background-color="#E6F5EF"
            hover-background-color="#E6F5EF"
            :background-color="activeKey === 'salary-composition' ? '#E6F5EF' : 'transparent'"
            :color="activeKey === 'salary-composition' ? '#0e9a62' : '#101828'"
            border-color="none"
            justify-content="left"
            height="36px"
            :button-class="['sidebar_menu_button', { active: activeKey === 'salary-composition' }]"
            @click="setActive('salary-composition')"
          >
            <div class="mi-sidebar-salary-composition"></div>
            <div class="sidebar_menu_item_text">Thành phần lương</div>
          </MsButton>
        </MsTooltip>
      </RouterLink>
      <RouterLink :to="path.salaryTemplate" class="text-decoration-none">
        <MsTooltip
          content="Mẫu bảng lương"
          placement="right"
          align="center"
          :offset="8"
          :hover-size="0"
          font-size="12px"
          line-height="16px"
        >
          <MsButton
            width="100%"
            active-background-color="#D5D7DA"
            hover-background-color="#E9EAEB"
            :background-color="activeKey === 'salary-template' ? '#E6F5EF' : 'transparent'"
            :color="activeKey === 'salary-template' ? '#0e9a62' : '#101828'"
            border-color="none"
            justify-content="left"
            height="36px"
            :button-class="['sidebar_menu_button', { active: activeKey === 'salary-template' }]"
            @click="setActive('salary-template')"
          >
            <div class="mi-sidebar-salary-template"></div>
            <div class="sidebar_menu_item_text">Mẫu bảng lương</div>
          </MsButton>
        </MsTooltip>
      </RouterLink>
      <div class="sidebar-menu-item-with-panel">
        <MsButton
          width="100%"
          active-background-color="#D5D7DA"
          hover-background-color="#E9EAEB"
          :background-color="activeKey === 'salary-data' ? '#E6F5EF' : 'transparent'"
          :color="activeKey === 'salary-data' ? '#0e9a62' : '#101828'"
          border-color="none"
          justify-content="left"
          height="36px"
          :button-class="['sidebar_menu_button', { active: activeKey === 'salary-data' }]"
          @click="setActive('salary-data')"
        >
          <div class="mi-sidebar-salary-data"></div>
          <div class="sidebar_menu_item_text">Dữ liệu tính lương</div>
          <div class="mi-icon-chevron-right"></div>
        </MsButton>
        <div class="ms-sidebar-submenu">
          <button
            v-for="item in salaryDataSubmenus"
            :key="item"
            type="button"
            class="ms-sidebar-submenu__item"
          >
            {{ item }}
          </button>
        </div>
      </div>
      <div class="sidebar-menu-item-with-panel">
        <MsButton
          width="100%"
          active-background-color="#D5D7DA"
          hover-background-color="#E9EAEB"
          :background-color="activeKey === 'salary-calculate' ? '#E6F5EF' : 'transparent'"
          :color="activeKey === 'salary-calculate' ? '#0e9a62' : '#101828'"
          border-color="none"
          justify-content="left"
          height="36px"
          :button-class="['sidebar_menu_button', { active: activeKey === 'salary-calculate' }]"
          @click="setActive('salary-calculate')"
        >
          <div class="mi-sidebar-salary-table"></div>
          <div class="sidebar_menu_item_text">Tính lương</div>
          <div class="mi-icon-chevron-right"></div>
        </MsButton>
        <div class="ms-sidebar-submenu ms-sidebar-submenu--salary-calculate">
          <button
            v-for="item in salaryCalculateSubmenus"
            :key="item"
            type="button"
            class="ms-sidebar-submenu__item"
          >
            {{ item }}
          </button>
        </div>
      </div>
      <div class="sidebar-menu-item-with-panel">
        <MsButton
          width="100%"
          active-background-color="#D5D7DA"
          hover-background-color="#E9EAEB"
          :background-color="activeKey === 'payment' ? '#E6F5EF' : 'transparent'"
          :color="activeKey === 'payment' ? '#0e9a62' : '#101828'"
          border-color="none"
          justify-content="left"
          height="36px"
          :button-class="['sidebar_menu_button', { active: activeKey === 'payment' }]"
          @click="setActive('payment')"
        >
          <div class="mi-sidebar-payment"></div>
          <div class="sidebar_menu_item_text">Chi trả</div>
          <div class="mi-icon-chevron-right"></div>
        </MsButton>
        <div class="ms-sidebar-submenu ms-sidebar-submenu--payment">
          <button
            v-for="item in paymentSubmenus"
            :key="item"
            type="button"
            class="ms-sidebar-submenu__item"
          >
            {{ item }}
          </button>
        </div>
      </div>
      <MsTooltip
        content="Báo cáo"
        placement="right"
        align="center"
        :offset="8"
        :hover-size="0"
        font-size="12px"
        line-height="16px"
      >
        <MsButton
          width="100%"
          active-background-color="#D5D7DA"
          hover-background-color="#E9EAEB"
          :background-color="activeKey === 'report' ? '#E6F5EF' : 'transparent'"
          :color="activeKey === 'report' ? '#0e9a62' : '#101828'"
          border-color="none"
          justify-content="left"
          height="36px"
          :button-class="['sidebar_menu_button', { active: activeKey === 'report' }]"
          @click="setActive('report')"
        >
          <div class="mi-sidebar-report"></div>
          <div class="sidebar_menu_item_text">Báo cáo</div>
        </MsButton>
      </MsTooltip>
    </div>
    <MsTooltip
      :content="isCollapsed ? 'Mở rộng' : 'Thu gọn'"
      placement="right"
      align="center"
      :offset="8"
      :hover-size="0"
      font-size="12px"
      line-height="16px"
      hover-class="sidebar-toggle-tooltip"
    >
      <div class="sidebar_toggle" @click="toggleSidebar">
        <div class="mi-sidebar-toggle-icon"></div>
      </div>
    </MsTooltip>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MsButton from '@/components/MsButton.vue'
import MsTooltip from '@/components/MsTooltip.vue'
import { path } from '@/utils/path'

const activeKey = ref('salary-composition')
const isCollapsed = ref(false)
const salaryDataSubmenus = [
  'Chấm công',
  'Doanh số',
  'KPI',
  'Sản phẩm',
  'Thu nhập khác',
  'Khấu trừ khác',
]
const salaryCalculateSubmenus = [
  'Bảng lương',
  'Tạm ứng',
  'Tổng hợp lương',
  'Phân bổ lương',
  'Ngân sách lương',
  'Bảng thuế',
  'Quyết toán thuế',
]
const paymentSubmenus = ['Bảng chi trả', 'Tổng hợp chi trả']

const setActive = (key: string) => {
  activeKey.value = key
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar_container {
  position: relative;
  width: 235px;
  height: 100%;
  background: var(--color-surface);
  padding: 15px;
  box-sizing: border-box;
  transition: width 0.2s ease;
}

.sidebar_container.is-collapsed {
  width: 60px;
}

.sidebar_menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding-bottom: 40px;
}

.text-decoration-none {
  text-decoration: none;
}

.sidebar_menu :deep(.ms-tooltip-wrapper),
.sidebar_menu :deep(.ms-tooltip-wrapper__trigger) {
  width: 100%;
}

.sidebar_menu_button {
  width: 100%;
}

.sidebar-menu-item-with-panel {
  position: relative;
  width: 100%;
}

.sidebar-menu-item-with-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 100%;
  width: 15px;
  height: 100%;
}

.sidebar-menu-item-with-panel:hover :deep(.sidebar_menu_button),
.sidebar-menu-item-with-panel:focus-within :deep(.sidebar_menu_button) {
  background: #e9eaeb !important;
  border-color: transparent !important;
}

.ms-sidebar-submenu {
  position: absolute;
  top: 0;
  left: calc(100% + 15px);
  z-index: 1000;
  width: 200px;
  padding: 16px;
  display: none;
  flex-direction: column;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 16px #0000001f;
  box-sizing: border-box;
  gap: 4px;
}

.sidebar-menu-item-with-panel:hover .ms-sidebar-submenu,
.sidebar-menu-item-with-panel:focus-within .ms-sidebar-submenu {
  display: flex;
}

.ms-sidebar-submenu__item {
  width: 100%;
  height: 36px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #101828;
  text-align: left;
  cursor: pointer;
}

.ms-sidebar-submenu__item:hover,
.ms-sidebar-submenu__item:focus-visible {
  outline: none;
  background: #e9eaeb;
  color: #101828;
}

.sidebar_container.is-collapsed .sidebar_menu_button {
  padding: 0;
  justify-content: center !important;
}

.sidebar_container.is-collapsed .sidebar_menu_item_text,
.sidebar_container.is-collapsed .mi-icon-chevron-right {
  display: none;
}

.sidebar_menu .mi-icon-chevron-right {
  margin-left: auto;
}

.sidebar_menu_item_text {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  transition:
    opacity 0.2s ease,
    width 0.2s ease;
  color: #101828;
  line-height: 18px;
}

.active {
  color: #0e9a62;
}

.active .sidebar_menu_item_text {
  color: #0e9a62;
}

.active .mi-sidebar-home,
.active .mi-sidebar-salary-composition,
.active .mi-sidebar-salary-template,
.active .mi-sidebar-salary-data,
.active .mi-sidebar-salary-table,
.active .mi-sidebar-payment,
.active .mi-sidebar-report {
  background-color: #0e9a62;
}

.sidebar_container :deep(.sidebar-toggle-tooltip) {
  position: absolute;
  left: auto;
  right: 0;
  bottom: 0;
  width: 40px;
}

.sidebar_container.is-collapsed :deep(.sidebar-toggle-tooltip) {
  left: 0;
  right: 0;
  width: 100%;
}

.sidebar_container :deep(.sidebar-toggle-tooltip .ms-tooltip-wrapper__trigger) {
  width: 100%;
}

.sidebar_toggle {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    width 0.2s ease;
  flex-shrink: 0;
  border-radius: 8px 0 0;
  border-top: 1px solid #e9eaeb;
  border-left: 1px solid #e9eaeb;
  border-right: none;
  border-bottom: none;
  pointer-events: auto;
  z-index: 10;
  background: #fafafa;
  color: #101828;
}

.sidebar_container.is-collapsed .sidebar_toggle {
  width: 100%;
}

.sidebar_toggle:hover {
  background: #e9eaeb;
}

.sidebar_container.is-collapsed .mi-sidebar-toggle-icon {
  transform: rotate(180deg);
}

.mi-sidebar-home {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -157px -357px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
}

.mi-sidebar-salary-composition {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -277px -357px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
}

.mi-sidebar-salary-template {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -258px -357px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
}

.mi-sidebar-salary-data {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -178px -357px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
}

.mi-sidebar-salary-table {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -197px -357px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
}

.mi-sidebar-payment {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -218px -357px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
}

.mi-sidebar-report {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -238px -357px;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
}

.mi-icon-chevron-right {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../../assets/images/ICON_3.svg');
  -webkit-mask-position: -96px -224px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 752px 400px;
  background-color: #717680;
}
.mi-sidebar-toggle-icon {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../../assets/images/ICON_Collapse.svg');
  -webkit-mask-size: contain;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  background-color: #717680;
  transition: transform 0.2s ease;
}
</style>

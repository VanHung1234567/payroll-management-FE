<template>
  <div class="navbar">
    <div class="navbar__left">
      <MsTooltip
        content="Tất cả ứng dụng"
        placement="bottom"
        align="start"
        arrow-position="12px"
        class="app-menu-tooltip"
      >
        <div class="box-app-menu">
          <div class="mi-icon-ninedot"></div>
        </div>
      </MsTooltip>
      <img src="../../assets/icons/icon-payroll-logo.svg" alt="logo" class="logo-payroll" />
      <span class="logo-text">Tiền lương</span>
    </div>
    <div class="navbar__right">
      <div class="navbar__right__search">
        <div title="Tìm kiếm" class="mi-icon-search-white"></div>
        <input type="text" placeholder="Tìm kiếm" class="search-input" />
      </div>

      <template v-for="action in headerActions" :key="action.content">
        <div v-if="action.noTooltip" class="navbar-action header-action-no-tooltip">
          <div :class="action.icon"></div>
        </div>

        <MsTooltip
          v-else
          :content="action.content"
          hover-background="#0000001a"
          placement="bottom"
          hover-size="32px"
          font-size="12px"
          line-height="16px"
          offset="4px"
          class="header-action-tooltip"
        >
          <div class="navbar-action">
            <div :class="action.icon"></div>
          </div>
        </MsTooltip>
      </template>

      <div class="header-action-tooltip">
        <div class="container__avatar">
          <div class="container__avatar__border">
            <div class="container__avatar__background"><div class="mi-avatar"></div></div>
          </div>
          <div class="avatar-notification">2</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import MsTooltip from '@/components/MsTooltip.vue'

const headerActions = [
  {
    content: 'Thiết lập',
    icon: 'mi-setting-white',
  },
  {
    content: 'Tổng đài hỗ trợ',
    icon: 'agent-box-message',
    noTooltip: true,
  },
  {
    content: 'Tính năng mới',
    icon: 'mi-new-feature-white',
  },
  {
    content: 'Tin nhắn',
    icon: 'mi-messbox-icon-message-light',
  },
  {
    content: 'Thông báo',
    icon: 'mi-notification',
  },
  {
    content: 'Trợ giúp',
    icon: 'mi-help-menu',
  },
  {
    content: 'Tính năng khác',
    icon: 'mi-more-menu',
  },
  {
    content: 'Kiến thức hữu ích',
    icon: 'mi-knowledge',
  },
]
</script>

<style scoped>
.navbar {
  width: 100%;
  min-width: 0;
  height: 48px;
  position: relative;
  z-index: 1000;
  gap: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  background: #0e9a62;
  box-shadow: 0 1px 3px #0000001a;
  overflow: visible;
}

.navbar__left {
  min-width: 0;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-app-menu {
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-menu-tooltip {
  margin: 0 12px;
}

.logo-payroll {
  cursor: pointer;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  cursor: pointer;
}

.navbar__right {
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 1;
  margin-right: 16px;
}

.navbar__right__search {
  display: flex;
  align-items: center;
  background: #fff3;
  width: clamp(220px, 28vw, 300px);
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: none;
  margin-right: 8px;
  flex-shrink: 1;
}

.search-input {
  width: 100%;
  border: none;
  line-height: 18px;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #fff;
  flex: 1;
  caret-color: #0e9a62;
  margin-left: 8px;
}

.search-input::placeholder {
  color: #bfe4d5;
}

.header-action-tooltip {
  width: 32px;
  height: 32px;
  margin-left: 12px;
  flex-shrink: 0;
}

.navbar-action {
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-action-no-tooltip {
  margin-left: 12px;
  flex-shrink: 0;
}

@media (max-width: 1366px) {
  .app-menu-tooltip {
    margin: 0 10px;
  }

  .logo-text {
    margin-left: 8px;
  }

  .navbar__right {
    margin-right: 10px;
  }

  .navbar__right__search {
    width: 220px;
    margin-right: 4px;
  }

  .header-action-tooltip,
  .header-action-no-tooltip {
    margin-left: 6px;
  }
}

.container__avatar {
  position: relative;
  width: 32px;
  height: 32px;
  cursor: pointer;
  overflow: visible;
}

.container__avatar__border {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(rgb(65, 146, 255) 60%, rgb(245, 34, 45) 60%);
  border-radius: 50%;
  box-sizing: border-box;
  overflow: hidden;
}

.container__avatar__background {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 50%;
}

.avatar-notification {
  position: absolute;
  top: -1px;
  right: -1px;
  z-index: 1;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f5222d;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  box-sizing: border-box;
}

.mi-icon-ninedot {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: -62px -82px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff;
}

.mi-icon-search-white {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../../assets/images/ICON.svg');
  -webkit-mask-position: 0px 0px;
  -webkit-mask-repeat: no-repeat;
  background-color: #ffffffb3 !important;
}

.mi-setting-white {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -362px -434px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff !important;
  color: #afb3c1;
  font-size: 16px;
}

.agent-box-message {
  background: url('../../assets/images/payroll_agent-d_2srbQV.webp');
  background-size: cover;
  width: 25px;
  height: 25px;
}

.mi-new-feature-white {
  width: 21px;
  height: 19px;
  -webkit-mask-image: url('../../assets/images/ICON_2.svg');
  -webkit-mask-position: -338px -435px;
  -webkit-mask-repeat: no-repeat;
  background-color: #fff;
  color: #afb3c1;
  font-size: 16px;
}

.mi-messbox-icon-message-light {
  width: 32px;
  height: 32px;
  background-image: url('../../assets/images/MESSAGE.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 24px;
  color: #afb3c1;
  font-size: 16px;
}

.mi-notification {
  width: 32px;
  height: 32px;
  background-image: url('../../assets/images/NOTIFICATION.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 24px;
  color: #afb3c1;
  font-size: 16px;
}

.mi-help-menu {
  width: 32px;
  height: 32px;
  background-image: url('../../assets/images/HELPMENU.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 24px;
  color: #afb3c1;
  font-size: 16px;
}

.mi-more-menu {
  width: 32px;
  height: 32px;
  background-image: url('../../assets/images/MORE.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 24px;
  color: #afb3c1;
  font-size: 16px;
}

.mi-knowledge {
  width: 32px;
  height: 32px;
  background-image: url('../../assets/images/KNOW.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 24px;
  color: #afb3c1;
  font-size: 16px;
}

.mi-avatar {
  width: 24px;
  height: 24px;
  background-image: url('../../assets/images/Avatar.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
}
</style>
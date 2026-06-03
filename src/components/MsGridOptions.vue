<template>
  <div class="grid-options">
    <div class="flex items-center justify-between w-full h-full">
      <div class="flex items-center gap-8">
        <div class="w-300">
          <MsInput
            :model-value="search"
            placeholder="Tìm kiếm"
            @update:model-value="emit('update:search', $event)"
          >
            <template #prefix>
              <div class="mi-search"></div>
            </template>
          </MsInput>
        </div>

        <slot v-if="bulkMode" name="bulk-actions" />
        <slot v-else name="options" />
      </div>

      <div v-if="!bulkMode" class="flex items-center gap-8">
        <MsTooltip content="Bộ lọc">
          <MsButton
            width="32px"
            height="32px"
            min-width="32px"
            padding="0"
            background-color="#ffffff"
            border-color="#D5D7DA"
            color="#101828"
            hover-background-color="#E9EAEB"
            hover-border-color="#D5D7DA"
            active-background-color="#D5D7DA"
            active-border-color="#D5D7DA"
          >
            <div class="mi-filter"></div>
          </MsButton>
        </MsTooltip>

        <MsTooltip content="Cài đặt">
          <MsButton
            width="32px"
            height="32px"
            min-width="32px"
            padding="0"
            background-color="#ffffff"
            border-color="#D5D7DA"
            color="#101828"
            hover-background-color="#E9EAEB"
            hover-border-color="#D5D7DA"
            active-background-color="#D5D7DA"
            active-border-color="#D5D7DA"
          >
            <div class="mi-setting"></div>
          </MsButton>
        </MsTooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MsButton from './MsButton.vue'
import MsInput from './MsInput.vue'
import MsTooltip from './MsTooltip.vue'

defineProps({
  // Giá trị ô tìm kiếm của toolbar.
  search: {
    type: String,
    default: '',
  },
  // Khi true thì ẩn filter thường và hiển thị slot bulk-actions.
  bulkMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:search'])
</script>

<style scoped>
.grid-options {
  padding: 12px 16px;
  background-color: #fff;
  position: relative;
  z-index: 6;
  height: 56px;
  border-radius: 8px 8px 0 0;
}

.mi-search {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: 0px 0px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-filter {
  display: inline-block;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -20px 0px;
  -webkit-mask-repeat: no-repeat;
  background-color: #6e737a;
}

.mi-setting {
  display: inline-block;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  -webkit-mask-image: url('../assets/images/ICON.svg');
  -webkit-mask-position: -321px -81px;
  -webkit-mask-repeat: no-repeat;
  background-color: #666;
}
</style>

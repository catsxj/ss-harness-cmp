<template>
  <a-menu-item class="czhj-menu-item" :key="path" ref="menuItemRef">
    <template #icon v-if="meta.icon || defaultIcon">
      <span>
        <svg-icon :class="meta.icon && 'animated czhj-icon'" :icon-name="meta.icon || defaultIcon"></svg-icon>
      </span>
    </template>
    <span>{{ meta.title }}</span>
  </a-menu-item>
</template>

<script>
export default {
  props: {
    path: {
      type: String,
    },
    meta: {
      type: Object,
    },
    defaultIcon: {
      type: String,
      default: '',
    },
  },
}
</script>
<style lang="scss" scoped>
.czhj-menu-item {
  color: var(--czhj-color-text) !important;
  .czhj-icon {
    font-size: 16px;
  }
  &:hover {
    .czhj-icon {
      animation-name: swing;
    }
    color: var(--czhj-color-text-selected) !important;
  }
  &::v-deep(.ant-menu-item-selected) {
    background-color: var(--czhj-color-background-selected) !important;
    color: var(--czhj-color-text-selected) !important;
  }
}
</style>
<style lang="scss">
.czhj-menu-item {
  color: var(--czhj-color-text) !important;
  .czhj-icon {
    font-size: 16px;
  }
  &:hover {
    .czhj-icon {
      animation-name: swing;
    }
    color: var(--czhj-color-text-selected) !important;
  }
  &.ant-menu-item-selected {
    background-color: var(--czhj-color-background-selected) !important;
    color: var(--czhj-color-text-selected) !important;
  }
}
.czhj-menu,
.czhj-sub-menu {
  .ant-menu-item:active,
  .ant-menu-submenu-title:active {
    background: var(--czhj-color-background);
  }
}
</style>

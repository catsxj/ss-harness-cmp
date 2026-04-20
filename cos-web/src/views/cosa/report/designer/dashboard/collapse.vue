<template>
  <section class="collapse-wrapper">
    <header @click="ifDisplay = !ifDisplay">
      <h4>{{ title }}</h4>
      <i class="el-icon-arrow-up" :class="ifDisplay ? 'up' : 'down'" />
    </header>
    <div class="collapse-content" v-show="ifDisplay">
      <slot></slot>
    </div>
  </section>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ifDisplay: true
    }
  }
}
</script>
<style lang="scss" scoped>
.collapse-wrapper {
  width: 100%;
  & > header {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 5px;
    cursor: pointer;
    background: rgb(8, 17, 38, 0.5);
    color: rgba(255, 255, 255, 0.75);
    i.up {
      transition: all 0.2s;
    }
    i.down {
      transform: rotate(180deg);
      transition: all 0.2s;
    }
  }
  .collapse-content {
    padding: 10px;
  }
}
</style>

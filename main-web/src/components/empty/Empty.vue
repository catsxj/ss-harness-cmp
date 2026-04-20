<template>
  <div class="no-result">
    <img v-if="image" class="image" :src="image" alt="" />
    <i v-else class="icon el-icon-tickets"></i>
    <span>
      <slot>{{ description }}</slot>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
    },
    icon: {
      type: String,
      default: 'el-icon-tickets',
    },
    description: {
      type: String,
      default: '暂无数据',
    },
  },
}
</script>

<style scoped lang="scss">
.no-result {
  color: #909399;
  margin: 32px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  line-height: normal;
  .image {
    height: 80px;
  }
  .icon {
    font-size: 40px;
    margin-bottom: 10px;
  }
  span {
    font-size: 14px;
  }
}
</style>

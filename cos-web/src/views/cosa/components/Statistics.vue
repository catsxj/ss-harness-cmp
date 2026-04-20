<template>
  <div class="card">
    <div class="title">
      <span> {{ title }}</span>
      <span v-if="trend" class="trend-icon">
        <i :class="trend === 'up' ? 'el-icon-caret-top danger' : 'el-icon-caret-bottom success'"></i>
      </span>
    </div>
    <div class="card-count" :class="{ success: trend === 'down', danger: trend === 'up' }">
      <span class="count"
        ><span class="count-prefix">{{ prefix }}</span
        >{{ count }}</span
      >
      <span class="time">{{ time }}</span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String
    },
    count: {
      type: [String, Number]
    },
    trend: {
      type: String
    },
    time: {
      type: String
    },
    prefix: {
      type: String
    }
  }
}
</script>
<style scoped lang="scss">
.card {
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  .trend-icon {
    float: right;
    font-size: 28px;
    margin-top: -10px;
  }
  .success {
    color: #5cbd68 !important;
  }
  .danger {
    color: #ff0000 !important;
  }
  .title {
    color: #1e1e1e;
    margin-bottom: 5px;
  }
  .card-count {
    width: 100%;
    display: flex;
    align-items: flex-end;
    font-size: 32px;
    color: #2d8cf0;
    .count {
      flex: 1;
    }
    .count-prefix {
      font-size: 20px;
    }
    .time {
      font-size: 12px;
      color: #999999;
    }
  }
}
</style>

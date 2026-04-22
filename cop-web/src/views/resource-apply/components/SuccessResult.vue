/**
* Created by HaijunZhang on 2019/4/28.
*/
<template>
  <div class="card">
    <div class="card-title">
      <span>{{title}}</span>
      <router-link to="/order">
        <span class="pull-right text-info order-back">返回订单列表</span>
      </router-link>
    </div>
    <div class="content">
      <i class="el-icon-success text-success success-icon"></i>
      <slot name="content">
        <span>订单已生成，等待付款</span>
      </slot>
    </div>
    <div class="operate">
      <slot name="operate">
      </slot>
    </div>

  </div>
</template>

<script>

export default {
  props: {
    title: {
      type: String,
      default: '订单详情'
    }
  },
  methods: {
  }
}
</script>
<style scoped lang="scss">
@import '../index.scss';
.content {
  display: flex;
  justify-content: center;
  font-size: 20px;
  text-align: center;
  line-height: 40px;
  margin: 40px 0;
  .success-icon {
    font-size: 40px;
    margin-right: 10px;
  }
}
.operate {
  text-align: center;
  margin-bottom: 30px;
}
.order-back {
  font-size: 12px;
}
</style>

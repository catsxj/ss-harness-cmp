<template>
  <div class="cell">
    <div class="card-icon" :style="{ 'border-color': color  }">
      <i class="icon el-icon-tickets" :style="{ color }"></i>
    </div>
    <div>
      <span class="title">{{title}}</span>
      <span class="count">{{value}}</span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: '云主机总数'
    },
    icon: {
      type: String,
      default: '/static/img/sip/vm.png'
    },
    value: {
      type: Number,
      default: 0
    },
    color: {}
  },
  setup(props) {
    return {
    }
  }
}
</script>
<style lang="scss" scoped>
.cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
  background: url("/static/img/outside/dc_bg.png");
  background-size: 100% 100%;
  .title {
    font-size: 20px;
    color: #fff;
    margin-right: 10px;
  }
  .count {
    margin-right: 5px;
    font-weight: bold;
    color: #fff;
    font-size: 32px;
  }
  .card-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid  #1a2a91;
    margin-bottom: 5px;
    .icon {
      color: #1a2a91;
      font-size: 28px;
      font-weight: bold;
    }
  }
}
</style>

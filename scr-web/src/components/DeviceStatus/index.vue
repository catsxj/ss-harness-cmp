<template>
  <div class="cell">
    <img :src="icon" alt="" class="title-icon">
    <div>
      <div class="icon-container" v-for="(item, index) in data" :key="index">
        <span class="icon" :style="{background: item.color}"></span>
        <span class="text">{{item.text}}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { computed } from '@vue/composition-api'
export default {
  props: {
    icon: {
      type: String,
      default: '/scr-web/static/img/business_network/switch.png'
    },
    data: {
      type: Array
    }
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
  margin-top: 20px;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
  .title-icon{
    width: 60px;
    height: 80px;
    margin-right: 10px;
  }
  span{
    display: inline-block;
  }
  .icon-container{
    margin-bottom: 5px;
  }
  .icon {
    width: 14px;
    height: 14px;
    background: #19BE6B;
    margin-right: 10px ;
  }
}
</style>

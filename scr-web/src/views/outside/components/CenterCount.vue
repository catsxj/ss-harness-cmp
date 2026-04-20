<template>
  <div class="cell">
    <div class="title">{{title}}</div>
    <div>
      <span class="count">
        <countTo :startVal='0' :endVal='value' :duration='1000'></countTo>
      </span>
      <span class="unit">{{unit}}</span>
    </div>
  </div>
</template>
<script>
import { computed } from '@vue/composition-api'
import countTo from 'vue-count-to'
export default {
  components: { countTo },
  props: {
    title: {
      type: String,
      default: '云主机总数'
    },
    unit: {
      type: String,
      default: '台'
    },
    value: {
      type: Number,
      default: 0
    },
    color: {}
  },
  setup(props) {
    return {}
  }
}
</script>
<style lang="scss" scoped>
.cell {
  padding: 20px 15px;
  box-sizing: border-box;
  background: url('/static/img/sip/card_bg.png');
  background-size: 100% 100%;
  font-size: 18px;
  color: #ffffff;
  .title {
    font-weight: bold;
    margin-bottom: 10px;
  }
  .count {
    font-family: Haettenschweiler;
    font-weight: bold;
    color: #6ffbff;
    font-size: 60px;
    letter-spacing: 7px;
  }
  .unit {
    margin-left: 5px;
    color: #ffffff;
  }
}
</style>

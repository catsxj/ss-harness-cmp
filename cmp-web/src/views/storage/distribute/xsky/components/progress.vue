<template>
  <div>
    <el-progress :percentage="percentage" :show-text="false"></el-progress>
    <div class="pull-left"><slot name="used"></slot></div>
    <div class="pull-right"><slot name="total"></slot></div>
  </div>
</template>
<script>
export default {
  props: {
    total: {
      type: Number
    },
    used: {
      type: Number
    }
  },
  data() {
    return {}
  },
  computed: {
    percentage() {
      if (this.total === 0) return 0
      return (this.used / this.total).toFixed(2) / 1
    }
  },
  methods: {}
}
</script>

<style></style>

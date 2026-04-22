<template>
  <basic-form :model="itemData" ref="form">
  </basic-form>
</template>
<script>
import node from '../mixins/index';

export default {
  mixins: [node],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
        }
      }
    }
  },
  data () {
    return {
    }
  },
  created () {
  },
  methods: {
  }
}
</script>
<style>
</style>

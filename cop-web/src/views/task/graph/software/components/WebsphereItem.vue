<template>
  <basic-form :model="itemData" ref="form">
  </basic-form>
</template>
<script>
import node from '../../mixins/index';
import show from '../../mixins/show'

export default {
  mixins: [node, show],
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

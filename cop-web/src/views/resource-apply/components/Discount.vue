<template>
  <span>
    <basic-form-item v-if="name" :label="`${name}：`" :label-width="labelWidth">{{showText}}</basic-form-item>
    <span v-else>{{showText}}</span>
  </span>
</template>
<script>

export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
    discount: {
      type: [String, Number]
    }
  },
  computed: {
    showText () {
      let text = ''
      switch (this.discount / 1) {
        case 0:
          text = '免费'
          break;
        case 1:
          text = '无折扣'
          break;
        default:
          text = `${this.discount * 10} 折`
      }
      return text;
    }
  },
  methods: {
  }
}
</script>

<template>
  <div>
    <el-button type="text" @click="modify">编辑</el-button>
    {{ tagAry.join(',') }}
    <tag :add-data="modifyData" v-if="modifyData.dialog" @back="$emit('back')"></tag>
  </div>
</template>

<script>
/* global $ */
import tag from './tag.vue'
export default {
  components: {
    tag
  },
  props: {
    detail: {
      type: Object
    },
    type: {
      type: String
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  data() {
    return {
      tagAry: [],
      modifyData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    modify() {
      this.modifyData = {
        dialog: true,
        data: {
          resourceLabel: this.detail.resourceLabel ? JSON.parse(this.detail.resourceLabel) : [],
          serverIds: [this.detail.id],
          vendorId: this.detail.vendorId,
          type: this.type
        }
      }
    },
    setTag() {
      this.tagAry = []
      if (this.detail.resourceLabel) {
        const ary = JSON.parse(this.detail.resourceLabel)
        ary.forEach(item => {
          this.tagAry.push(item.key + ':' + item.value)
        })
      }
    }
  },
  created() {
    this.setTag()
  },
  watch: {
    detail() {
      this.setTag()
    }
  }
}
</script>

<style scoped></style>

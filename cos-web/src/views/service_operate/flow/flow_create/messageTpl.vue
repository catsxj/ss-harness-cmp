<template>
  <basic-form-item :label="label" label-width="200px" maxlength="1048576">
    <el-tag class="m-r cur-point" @click="selectTag(item.value)" v-for="(item, index) in tags" :key="index">{{ item.name }}</el-tag>
    <el-input ref="textarea" v-model="currentNode[value]" type="textarea" :rows="4"></el-input>
  </basic-form-item>
</template>
<script>
import { commonVar } from './data'
export default {
  props: {
    label: {
      type: String
    },
    value: {
      type: String
    },
    currentNode: {
      type: Object
    },
    varList: {}
  },
  data() {
    return {}
  },
  computed: {
    tags() {
      return [...commonVar, ...this.varList]
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      if (this.currentNode[this.value]) return
      const map = {
        // eslint-disable-next-line no-template-curly-in-string
        msgTemplateReceive: '${creatorName}发起的申请【${instanceNo}】《${ApplyTheme!}》需要您审批，当前审批环节：${currentNode!}。如已审批，请忽略。',
        // eslint-disable-next-line no-template-curly-in-string
        msgTemplateApproved: '${operatorName}(${currentNode})审批通过了申请【${instanceNo}】《${ApplyTheme!}》，备注：${remark!}',
        // eslint-disable-next-line no-template-curly-in-string
        msgTemplateUnratified: '${operatorName}(${currentNode})审批拒绝了申请【${instanceNo}】《${ApplyTheme!}》，备注：${remark!}'
      }
      this.$set(this.currentNode, this.value, map[this.value])
    },
    selectTag(value) {
      const textareaRef = this.$refs.textarea
      const textarea = textareaRef.$el.getElementsByTagName('textarea')[0]
      const startPos = textarea.selectionStart
      const message = this.currentNode[this.value]
      const result = `${message.substring(0, startPos)}${value}${message.substring(startPos)}`
      this.currentNode[this.value] = result
      setTimeout(() => {
        textarea.focus()
        textarea.selectionStart = startPos + value.length
        textarea.selectionEnd = startPos + value.length
      })
    }
  }
}
</script>
<style></style>

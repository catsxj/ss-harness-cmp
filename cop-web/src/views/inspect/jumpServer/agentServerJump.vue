<template>
  <div>
    <basic-form ref="form" labelWidth="120px" :model="itemData" :disabled="disable">
      <basic-form-item label="账号：" validate="required" required-message="请输入账号" prop="account">
        <el-input v-model="itemData.jumpServer.account" placeholder="请输入账号"></el-input>
      </basic-form-item>
      <select-agent :itemData="itemData"></select-agent>
    </basic-form>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import SelectAgent from './selectAgent.vue'
export default {
  components: {
    SelectAgent
  },
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          hostList: [],
          account: ''
        }
      }
    },
    whoUse: {
      type: String,
      default: function () {
        return ''
      }
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getPostData () {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          data = cloneDeep(this.itemData)
        }
      })
      return data
    }
  }
}
</script>

<template>
  <div>
    <basic-form ref="form" labelWidth="120px" :model="itemData" :disabled="disable">
      <basic-form-item label="账号：" validate="required" required-message="请输入账号" prop="account">
        <el-input v-model="itemData.account" placeholder="请输入账号"></el-input>
      </basic-form-item>
      <select-server :itemData="itemData" :agentType="agentType"></select-server>
    </basic-form>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import SelectServer from './selectAgent.vue'
export default {
  components: {
    SelectServer
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
    disable: {
      type: Boolean,
      default: false
    },
    agentType: {
      type: String,
      required: true
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

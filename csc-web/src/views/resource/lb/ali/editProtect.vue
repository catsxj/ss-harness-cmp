<template>
  <el-dialog title="配置修改保护" :visible.sync="addData.dialog">
    <basic-form :model="addData.data" ref="data" label-width="180px">
      <basic-form-item label="设置保护状态模式: " prop="modificationProtection" validate="required">
        <el-select v-model="addData.data.modificationProtection">
          <el-option v-for="(item, index) in mpList" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </basic-form-item>
      <template v-if="addData.data.modificationProtection === 'ConsoleProtection'">
        <basic-form-item label="设置修改保护状态的原因: " prop="modificationProtectionReason" validate="alimpName">
          <el-input v-model="addData.data.modificationProtectionReason"></el-input>
        </basic-form-item>
      </template>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="ok">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { modifyLb } from 'services/platform/index'
const mpList = [
  {
    name: '不限制修改保护',
    value: 'NonProtection'
  },
  {
    name: '实例控制台修改保护状态',
    value: 'ConsoleProtection'
  }
]
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      mpList
    }
  },
  created() {},
  mounted() {},
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (!valid) {
          return false
        }
        modifyLb({
          id: this.addData.id,
          action: 'modificationProtection',
          balancer: {
            ...this.addData.data
          }
        }).then(data => {
          const type = data.success ? 'success' : 'error'
          if (data.success) {
            this.$refs.data.resetFields()
            this.addData.dialog = false
            this.$emit('back')
          }
        })
      })
    }
  }
}
</script>

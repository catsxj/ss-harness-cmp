<template>
  <div>
    <el-dialog title="创建快照" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="110px">
          <basic-form-item label="创建方式：">
            <el-radio-group v-model="addData.data.way">
              <el-radio label="immediately">立即创建</el-radio>
              <el-radio label="cron">定时创建</el-radio>
            </el-radio-group>
          </basic-form-item>
          <basic-form-item label="快照名称：" prop="name" validate="required" required-message="该字段为必填字段" v-if="addData.data.way == 'immediately'" key="name">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
          <SelectCorn v-if="addData.data.way === 'cron'" ref="selectCron" :data="addData.data.cron"></SelectCorn>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import SelectCorn from 'views/task/components/selectCron.vue'
import { vmSnapshot } from 'services/platform/index'

export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  components: { SelectCorn },
  data() {
    return {}
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const { name, serverId, way } = this.addData.data
          vmSnapshot({ name, serverId, cron: way === 'cron' ? this.$refs.selectCron.cron : null }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>

<template>
  <div>
    <el-dialog title="新增快照" append-to-body width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
        <el-row :gutter="10">
          <el-col :span="24">
            <cmp-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.data.name" :maxlength="32"></el-input>
            </cmp-form-item>
            <cmp-form-item label="描述：" prop="remark">
              <el-input v-model="addData.data.remark"></el-input>
            </cmp-form-item>
            <cmp-form-item label="创建方式：">
              <el-radio-group v-model="addData.data.way">
                <el-radio label="immediately">立即创建</el-radio>
                <el-radio label="cron">定时创建</el-radio>
              </el-radio-group>
            </cmp-form-item>
            <SelectCron v-if="addData.data.way === 'cron'" ref="selectCron" :data="addData.data.cron"></SelectCron>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { vmSnapshot } from 'services/platform/index'
import SelectCron from '../SelectCron.vue'

export default {
  components: { SelectCron },
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
  data() {
    return {}
  },
  methods: {
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          const { id, name, remark, serverId, way } = this.addData.data
          vmSnapshot({ id, name, remark, serverId, cron: way === 'cron' ? this.$refs.selectCron.cron : null }).then((data) => {
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

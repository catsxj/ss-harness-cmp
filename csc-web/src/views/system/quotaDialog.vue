<template>
  <el-dialog title="配额设置" width="600px" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <basic-form :model="quotaData" ref="quotaData">
      <el-row :gutter="10">
        <el-col :span="24">
          <basic-form-item label="磁盘：" prop="disk.quota" validate="required">
            <el-input-number v-model="quotaData.disk.quota" :min="quotaData.disk.min" :max="quotaData.disk.max"></el-input-number>
            <span class="m-l">GB</span>
            <span class="text-info m-l">* 可分配范围为：{{ quotaData.disk.min }}-{{ quotaData.disk.max }}</span>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="内存：" prop="mem.quota" validate="required">
            <el-input-number v-model="quotaData.mem.quota" :min="quotaData.mem.min" :max="quotaData.mem.max"></el-input-number>
            <span class="m-l">GB</span>
            <span class="text-info m-l">* 可分配范围为：{{ quotaData.mem.min }}-{{ quotaData.mem.max }}</span>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="CPU：" prop="cpu.quota" validate="required">
            <el-input-number v-model="quotaData.cpu.quota" :min="quotaData.cpu.min" :max="quotaData.cpu.max"></el-input-number>
            <span class="m-l">C</span>
            <span class="text-info m-l">* 可分配范围为：{{ quotaData.cpu.min }}-{{ quotaData.cpu.max }}</span>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="实例数：" prop="inst.quota" validate="required">
            <el-input-number v-model="quotaData.inst.quota" :min="quotaData.inst.min" :max="quotaData.inst.max"></el-input-number>
            <span class="m-l">个</span>
            <span class="text-info m-l">* 可分配范围为：{{ quotaData.inst.min }}-{{ quotaData.inst.max }}</span>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="浮动IP：" prop="fip.quota" validate="required">
            <el-input-number v-model="quotaData.fip.quota" :min="quotaData.fip.min" :max="quotaData.fip.max"></el-input-number>
            <span class="m-l">个</span>
            <span class="text-info m-l">* 可分配范围为：{{ quotaData.fip.min }}-{{ quotaData.fip.max }}</span>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="quotaSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
// import { getCscQuotaTenant, createQuotaTenant } from 'services/platform/apic'
export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      quotaData: {
        disk: {},
        mem: {},
        cpu: {},
        inst: {},
        fip: {}
      }
    }
  },
  created() {
    this.handleQuota()
  },
  methods: {
    handleQuota() {
      // getCscQuotaTenant({ target: this.dialog.id, catalog: this.dialog.type }).then(data => {
      //   if (data.success) {
      //     data.data.forEach(item => {
      //       this.quotaData[`${item.category.toLowerCase()}`] = item
      //     });
      //   }
      // })
    },
    quotaSubmit() {
      this.$refs.quotaData.validate(valid => {
        if (valid) {
          // 生成参数
          const arr = ['DISK', 'CPU', 'MEM', 'INST', 'FIP']
          const params = []
          arr.forEach(_ => {
            params.push({
              target: this.dialog.id,
              category: _,
              quota: this.quotaData[`${_.toLowerCase()}`].quota,
              catalog: this.dialog.type
            })
          })
          // createQuotaTenant(this.dialog.id, params).then(data => {
          //   if (data.success) {
          //     this.$message({
          //       message: data.message,
          //       type: 'success'
          //     })
          //     this.dialog.visible = false
          //   }
          // })
        }
      })
    }
  }
}
</script>

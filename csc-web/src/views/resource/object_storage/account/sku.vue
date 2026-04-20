<template>
  <div>
    <el-dialog title="复制级别" :visible.sync="addData.dialog" width="50%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
          <el-col :span="24">
            <basic-form-item label="复制级别：" prop="sku" validate="required" required-message="该字段为必选字段">
              <el-select v-model="addData.data.sku">
                <el-option v-for="(item, index) in skuList" :label="kindFliter[item]" :value="item" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { modifyAccount } from 'services/platform/azure'
/* global $ */
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      skuList: ['Standard_LRS', 'Standard_GRS', 'Standard_RAGRS'],
      kindFliter: {
        Standard_LRS: '本地冗余存储(LRS)',
        Standard_GRS: '异地冗余存储(GRS)',
        Standard_RAGRS: '读取访问异地冗余存储(RA-GRS)'
      }
    }
  },
  created() {},
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          modifyAccount(this.addData.data).then(data => {
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
  }
}
</script>

<style></style>

<template>
  <div>
    <el-dialog title="自定义域名" :visible.sync="addData.dialog" width="50%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
          <el-col :span="24" class="m-b">
            <el-alert
              type="warning"
              show-icon
              :closable="false"
              description="配置自定义域以访问存储帐户中的 blob 数据，如 www.contoso.com。有两种方法可用来设置自定义域。
使用由域(如 www.contoso.com)指向 lzp04.blob.core.windows.net 或 lzp04.z23.web.core.windows.net 的 DNS 提供程序创建 CNAME 记录，然后在下方输入你的域。此方法更简单，但可在验证域注册时产生较短的停机时间。
使用由 'asverify' 子域(如 asverify.www.contoso.com)指向 asverify.lzp04.blob.core.windows.net 或 asverify.lzp04.z23.web.core.windows.net 的 DNS 提供程序创建 CNAME 记录。此步骤完成后，请在下方输入你的域(排除 'asverify' 子域)。此方法不会产生任何停机时间。要使用此方法，请选中“使用间接 CNAME 验证”复选框。"
            ></el-alert>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="域名：" prop="customDomain" validate="required,domain">
              <el-input v-model="addData.data.customDomain"></el-input>
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
import { putAccountDomain } from 'services/platform/azure'
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
    return {}
  },
  created() {},
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          putAccountDomain(this.addData.data).then(data => {
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

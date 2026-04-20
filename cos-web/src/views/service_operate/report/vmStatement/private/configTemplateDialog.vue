<template>
  <el-dialog title="配置模板" :close-on-click-modal="false" :visible.sync="config.dialog" width="600px" :before-close="handleClose">
    <cmp-form :model="configData" ref="configData" label-width="160px">
      <cmp-form-item label="是否启动模板：" prop="status" validate="required" required-message="请选择">
        <el-radio-group v-model="configData.status">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </cmp-form-item>
      <cmp-form-item label="是否开启发送策略：" prop="sendStatus" validate="required" required-message="请选择">
        <el-radio-group v-model="configData.sendStatus" @change="changeSendStatus">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </cmp-form-item>
      <cmp-form-item v-if="configData.sendStatus == true" label="接收人：" prop="receiveds" validate="required" required-message="请选择">
        <el-select multiple v-model="configData.receiveds">
          <el-option v-for="item in diskTypes" :key="item.value" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </cmp-form-item>
    </cmp-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click.native="configSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { configTemplates, configTemplateDetail } from 'services/platform/index'
import { getUser } from 'services/system/user'
export default {
  props: {
    config: {
      type: Object,
      default: function () {
        return {
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      diskTypes: [],
      configData: {
        receiveds: [],
        status: false,
        sendStatus: false
      },
      tenantParams: {
        page: 1,
        rows: 99999
      }
    }
  },
  created() {
    this.getTenantData()
    if (this.config.vmId.length == 1) {
      this.detail()
    }
  },
  methods: {
    changeSendStatus() {
      this.configData.receiveds = []
    },
    handleClose() {
      this.config.dialog = false
      this.configData = {
        receiveds: [],
        status: false,
        sendStatus: false
      }
    },
    detail() {
      const params = {
        type: 'standard',
        isPublic: false
      }
      configTemplateDetail(this.config.vmId.join(), params).then((data) => {
        if (data.success && data.data) {
          this.configData = Object.assign({}, data.data)
          this.configData.receiveds = JSON.parse(data.data.receiveds)
        }
      })
    },
    configSubmit() {
      this.$refs.configData.validate((valid) => {
        if (valid) {
          const params = {
            status: this.configData.status,
            vmIds: this.config.vmId,
            type: 'standard',
            sendStatus: this.configData.sendStatus,
            receiveds: this.configData.receiveds,
            isPublic: false
          }
          configTemplates(params).then((data) => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.config.dialog = false
              this.$parent.$parent.handleSearch()
            }
          })
        }
      })
    },
    getTenantData() {
      const params = JSON.stringify([{ param: { tenantId: 0 }, sign: 'GT' }])
      this.tenantParams.params = params
      getUser(this.tenantParams).then((data) => {
        if (data.success) {
          this.diskTypes = data.data.rows
        }
      })
    }
  }
}
</script>

<style></style>

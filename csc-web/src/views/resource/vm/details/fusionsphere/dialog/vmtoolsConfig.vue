<template>
  <div>
    <el-dialog append-to-body title="VMware Tools配置" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <basic-form :model="addData.data" ref="data">
          <el-card :body-style="{ padding: '2px 10px' }">
            <div slot="header">电源控制</div>
            <div class="search-content">
              <el-row :gutter="20">
                <el-form-item label="关机类型">
                  <el-select v-model="addData.data.powerOffType" :disabled="addData.data.status">
                    <el-option label="关闭电源" value="hard"></el-option>
                    <el-option label="关闭客户机" value="soft"></el-option>
                    <el-option label="系统默认值(关闭客户机)" value="preset"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="挂起类型">
                  <el-select v-model="addData.data.suspendType" :disabled="addData.data.status">
                    <el-option label="挂起" value="hard"></el-option>
                    <el-option label="挂起客户机" value="soft"></el-option>
                    <el-option label="系统默认值(挂起)" value="preset"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="重置类型">
                  <el-select v-model="addData.data.resetType" :disabled="addData.data.status">
                    <el-option label="重置" value="hard"></el-option>
                    <el-option label="重新启动客户机" value="soft"></el-option>
                    <el-option label="系统默认值(重新启动客户机)" value="preset"></el-option>
                  </el-select>
                </el-form-item>
              </el-row>
            </div>
          </el-card>
          <el-card class="m-t" :body-style="{ padding: '2px 10px' }">
            <div slot="header">运行 VMware Tools 脚本</div>
            <div class="search-content">
              <el-row :gutter="20">
                <el-col :span="6">
                  <basic-form-item prop="afterPowerOn" validate="required" label-width="20px">
                    <el-checkbox v-model="addData.data.afterPowerOn" :disabled="addData.data.status"></el-checkbox>
                    开机后
                  </basic-form-item>
                </el-col>
                <el-col :span="6">
                  <basic-form-item prop="afterResume" validate="required" label-width="20px">
                    <el-checkbox v-model="addData.data.afterResume" :disabled="addData.data.status"></el-checkbox>
                    恢复后
                  </basic-form-item>
                </el-col>
                <el-col :span="6">
                  <basic-form-item prop="beforeGuestStandby" validate="required" label-width="20px">
                    <el-checkbox v-model="addData.data.beforeGuestStandby" :disabled="addData.data.status"></el-checkbox>
                    挂起前
                  </basic-form-item>
                </el-col>
                <el-col :span="6">
                  <basic-form-item prop="beforeGuestShutdown" validate="required" label-width="20px">
                    <el-checkbox v-model="addData.data.beforeGuestShutdown" :disabled="addData.data.status"></el-checkbox>
                    关机后
                  </basic-form-item>
                </el-col>
              </el-row>
            </div>
          </el-card>
          <el-card class="m-t" :body-style="{ padding: '2px 10px' }">
            <div slot="header">高级</div>
            <div class="search-content">
              <el-alert title="Windows云主机自动升级Vmware Tools需要重启云主机，请谨慎操作" type="warning" class="m-t m-b-md"> </el-alert>
              <el-row :gutter="20">
                <basic-form-item prop="toolsUpgradePolicy" validate="required" label-width="20px" style="margin-bottom: 10px">
                  <el-checkbox v-model="addData.data.toolsUpgradePolicy"></el-checkbox>
                  在关闭再打开过程中检查并升级工具
                </basic-form-item>
                <basic-form-item prop="syncTimeWithHost" validate="required" label-width="20px" style="margin-bottom: 10px">
                  <el-checkbox v-model="addData.data.syncTimeWithHost"></el-checkbox>
                  同步客户机时间和主机时间
                </basic-form-item>
              </el-row>
            </div>
          </el-card>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { vmVmtools } from 'services/platform/index'
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
    }
  },
  data() {
    return {}
  },
  methods: {
    ok() {
      vmVmtools('vmToolsConfig', {
        id: this.addData.data.id,
        toolsConfig: {
          power: {
            powerOffType: this.addData.data.powerOffType,
            resetType: this.addData.data.resetType,
            suspendType: this.addData.data.suspendType
          },
          tools: {
            afterPowerOn: this.addData.data.afterPowerOn,
            afterResume: this.addData.data.afterResume,
            beforeGuestShutdown: this.addData.data.beforeGuestShutdown,
            beforeGuestStandby: this.addData.data.beforeGuestStandby,
            syncTimeWithHost: this.addData.data.syncTimeWithHost,
            toolsUpgradePolicy: this.addData.data.toolsUpgradePolicy ? 'upgradeAtPowerCycle' : 'manual'
          }
        }
      }).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.addData.dialog = false
          this.$parent.$parent.getData()
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>

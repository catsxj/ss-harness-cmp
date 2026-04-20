<template>
  <el-dialog :title="title" :close-on-click-modal="false" :visible.sync="self.dialog" width="60%" :before-close="handleClose">
    <cmp-form :model="selfData" ref="selfData" label-width="160px">
      <cmp-form-item label="是否启动模板：" prop="status" validate="required" required-message="请选择">
        <el-radio-group v-model="selfData.status">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </cmp-form-item>
      <cmp-form-item label="名称：" prop="name" validate="required" required-message="请输入">
        <el-input style="width: 300px" v-model="selfData.name"></el-input>
      </cmp-form-item>
      <cmp-form-item label="周期：" prop="period" validate="required" required-message="请选择">
        <el-checkbox-group v-model="selfData.period">
          <el-checkbox :label="item.value" v-for="(item, key) in period" :key="key">{{ item.name }}</el-checkbox>
        </el-checkbox-group>
      </cmp-form-item>
      <cmp-form-item label="云主机资源：">
        <el-transfer style="text-align: left; display: inline-block" v-model="vmList" filterable :props="{ key: 'id', label: 'name' }" :titles="['云主机', '已选云主机']" :data="list"> </el-transfer>
      </cmp-form-item>
      <cmp-form-item label="是否开启发送策略：" prop="sendStatus" validate="required" required-message="请选择">
        <el-radio-group v-model="selfData.sendStatus" @change="changeSendStatus">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </cmp-form-item>
      <cmp-form-item v-if="selfData.sendStatus == true" label="接收人：" prop="receiveds" validate="required" required-message="请选择">
        <el-select multiple v-model="selfData.receiveds">
          <el-option v-for="item in diskTypes" :key="item.value" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </cmp-form-item>
    </cmp-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click.native="selfSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { selfTemplates, statementList, configTemplates } from 'services/platform/index'
import { getUser } from 'services/system/user'
export default {
  props: {
    self: {
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
      vmList: [],
      list: [],
      diskTypes: [],
      selfData: {
        status: false,
        sendStatus: false,
        period: [],
        receiveds: []
      },
      tenantParams: {
        page: 1,
        rows: 99999
      },
      params: {
        page: 1,
        rows: 99999
      },
      title: '新增模板',
      period: [
        {
          name: '日',
          value: 'ByDay'
        },
        {
          name: '周',
          value: 'ByWeek'
        },
        {
          name: '月',
          value: 'ByMonth'
        }
      ]
    }
  },
  created() {
    this.getList()
    this.getTenantData()
    if (this.self.type == 'edit') {
      this.title = '编辑模板'
      this.selfData = Object.assign({}, this.self.data)
      this.selfData.period = JSON.parse(this.self.data.period)
    } else {
      this.selfData = {
        status: false,
        sendStatus: false,
        period: [],
        receiveds: []
      }
      this.vmList = []
      this.title = '新增模板'
    }
  },
  methods: {
    changeSendStatus() {
      this.selfData.receiveds = []
    },
    handleClose() {
      this.self.dialog = false
      this.selfData = {
        status: false,
        sendStatus: false,
        period: [],
        receiveds: []
      }
      this.vmList = []
    },
    getTenantData() {
      const params = JSON.stringify([{ param: { tenantId: 0 }, sign: 'GT' }])
      this.tenantParams.params = params
      getUser(this.tenantParams).then((data) => {
        if (data.success) {
          this.diskTypes = data.data.rows
          if (this.self.type == 'edit') {
            this.vmList = JSON.parse(this.self.data.vmIds)
          }
        }
      })
    },
    getList() {
      this.params.params = this.$tools.formatSearchParam({
        eqParam: {
          isPublic: true
        }
      })
      statementList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          if (this.self.data.receiveds) {
            this.selfData.receiveds = JSON.parse(this.self.data.receiveds)
          }
        }
      })
    },
    selfSubmit() {
      this.$refs.selfData.validate((valid) => {
        if (valid) {
          const params = {
            name: this.selfData.name,
            period: this.selfData.period,
            sendStatus: this.selfData.sendStatus,
            type: 'definition',
            vmIds: this.vmList,
            receiveds: this.selfData.receiveds,
            status: this.selfData.status,
            isPublic: true
          }
          if (this.self.type == 'edit') {
            params.id = this.self.data.id
            configTemplates(params).then((data) => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.self.dialog = false
                this.$parent.$parent.handleSelfSearch()
              }
            })
          } else {
            selfTemplates(params).then((data) => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.self.dialog = false
                this.$parent.$parent.handleSelfSearch()
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style></style>

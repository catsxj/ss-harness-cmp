<template>
  <div>
    <el-dialog append-to-body :title="addData.title" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <basic-form-item label="网卡类型：" prop="type" v-if="addData.title == '新增网卡'">
            <el-select v-model="addData.data.type" filterable>
              <el-option v-for="(item, index) in typeData" :label="item.name" :value="item.value" :key="index"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="交换机：" prop="switcherId" validate="required">
            <el-select v-model="addData.data.switcherId" filterable @change="changeSwitcher">
              <el-option v-for="(item, index) in switcherData" :label="item.name" :value="item.id" :key="index"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="端口组：" prop="portGroupId" validate="required">
            <el-select v-model="addData.data.portGroupId" filterable>
              <el-option v-for="(item, index) in portGroupData" :label="item.name" :value="item.id" :key="index"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="IO环大小：" prop="vringbuf" validate="required">
            <el-select v-model="addData.data.vringbuf">
              <el-option label="256" :value="256"></el-option>
              <el-option label="512" :value="512"></el-option>
              <el-option label="1024" :value="1024"></el-option>
              <el-option label="2048" :value="2048"></el-option>
              <el-option label="4096" :value="4096"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="队列数：" prop="queues" validate="required">
            <el-input-number v-model="addData.data.queues" :min="1" :max="addData.cpu"> </el-input-number>
          </basic-form-item>
          <basic-form-item label="开启安全组：" prop="enableSecurityGroup" validate="required">
            <el-switch v-model="addData.data.enableSecurityGroup" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <basic-form-item label="安全组：" prop="securityGroupId" validate="required" v-if="addData.data.enableSecurityGroup">
            <el-select v-model="addData.data.securityGroupId">
              <el-option :key="index" v-for="(d, index) in sgroupData" :label="d.name" :value="d.id"></el-option>
            </el-select>
          </basic-form-item>
        </basic-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getGroup } from 'services/platform/index'
import { getSwitchers, getPortGroup, createNics } from 'services/platform/fc'

export default {
  props: {
    addData: {
      type: Object
    },
    vendorId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [
        {
          name: 'virtio',
          value: '1'
        }
      ],
      switcherData: [],
      portGroupData: [],
      sgroupData: []
    }
  },
  methods: {
    getSwitcher() {
      getSwitchers({
        page: 1,
        rows: 9999999,
        params: this.$tools.handleSearchParam({
          vendorId: this.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.switcherData = data.data.rows
          if (this.switcherData.length) {
            this.addData.data.switcherId = this.switcherData[0].id
            this.changeSwitcher()
          }
        }
      })
    },
    changeSwitcher() {
      this.addData.data.portGroupId = ''
      this.getPortGroup()
    },
    getPortGroup() {
      getPortGroup({
        page: 1,
        rows: 9999999,
        params: this.$tools.handleSearchParam({
          vendorId: this.vendorId,
          switcherId: this.addData.data.switcherId
        })
      }).then(data => {
        if (data.success) {
          this.portGroupData = data.data.rows
          if (this.portGroupData.length) {
            this.addData.data.portGroupId = this.portGroupData[0].id
          }
        }
      })
    },
    // 获取安全组
    getSGroup() {
      getGroup({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          vendorId: this.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.sgroupData = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const data = this.addData.data
          createNics(data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.$emit('back')
              this.addData.dialog = false
            }
          })
        }
      })
    }
  },
  created() {
    this.getSwitcher()
    this.getSGroup()
  }
}
</script>

<style></style>

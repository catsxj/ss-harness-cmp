<template>
  <div>
    <el-dialog title="新增网卡" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog" append-to-body>
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
          <basic-form-item label="网络：" prop="id" validate="required">
            <el-select v-model="addData.data.id" @change="getIp">
              <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="子网：" prop="id" validate="required">
            <el-select v-model="addData.data.subnetId" @change="setVersion">
              <el-option :disabled="nowList.indexOf(item.id) > -1" v-for="(item, index) in subnetList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="指定IP：" v-if="addData.data.subnetId">
            <el-switch v-model="addData.data.switch" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="addData.data.subnetId && (version == 'V4' || version == '4') && addData.data.switch" prop="ip" validate="required,ip">
            <el-input v-model="addData.data.ip" placeholder="1.1.1.1"></el-input>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="addData.data.subnetId && version == 'V6' && addData.data.switch" prop="ip" validate="required,ipV6">
            <el-input v-model="addData.data.ip" placeholder="2222::"></el-input>
          </basic-form-item>
          <basic-form-item label="IP范围：" v-if="addData.data.subnetId && addData.data.switch && ippools">
            <div v-for="(item, index) in ippools" :key="index">
              {{ item }}
            </div>
          </basic-form-item>
        </el-form>
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
import { modifyNetwork } from 'services/platform/index'
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
    networkList: {
      type: Array
    },
    nowList: {
      type: Array
    }
  },
  data() {
    return {
      version: 'V4',
      ippools: [],
      subnetList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          this.subnetList.forEach((item) => {
            if (item.id == this.addData.data.subnetId) {
              const obj = this.addData.data
              obj.detail = item
              this.$emit('ok', obj)
              this.addData.dialog = false
            }
          })
        }
      })
    },
    setVersion() {
      this.subnetList.forEach((item) => {
        if (item.id == this.addData.data.subnetId) {
          this.$set(this.addData.data, 'subnetName', item.name)
          this.$set(this.addData.data, 'ip', '')
          this.version = item.ipVersion
          this.ippools = item.ipPools ? JSON.parse(item.ipPools) : []
          this.$set(this.addData.data, 'switch', false)
        }
      })
    },
    getIp() {
      this.networkList.forEach((item) => {
        if (item.id == this.addData.data.id) {
          this.$set(this.addData.data, 'subnetId', '')
          this.$set(this.addData.data, 'networkName', item.name)
          this.subnetList = item.subnets
          // if (item.subnetFlag) {
          //   this.addData.data.subnetId = false
          // } else {
          //   this.version = item.ipData.ipVersion
          //   this.addData.data.subnetId = true
          //   this.ippools = item.ipData.ipPools ? JSON.parse(item.ipData.ipPools) : []
          //   this.$set(this.addData.data, 'switch', false)
          // }
        }
      })
    }
  }
}
</script>

<style></style>

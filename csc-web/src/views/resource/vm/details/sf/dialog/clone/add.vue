<template>
  <div>
    <el-dialog :title="addData.title" :visible.sync="addData.dialog" width="60%" v-if="addData.dialog" append-to-body>
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <el-row>
            <el-col :span="24">
              <basic-form-item label="IP池(V4)：" prop="ipv4PoolId" validate="required">
                <el-select v-model="addData.data.ipv4PoolId" @change="$set(addData.data, 'address', [])" filterable>
                  <el-option v-for="(item, index) in ipv4List" :label="item.name" :value="item.id" :key="index"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="指定IP：" prop="address">
                {{ addData.data.address ? addData.data.address.join(',') : '若不指定IP则默认从IP池随机选择一个IP' }}
                <span class="m-l-md">
                  <el-button type="text" @click="openIp('address')" :disabled="!addData.data.ipv4PoolId">{{ addData.data.address ? '切换IP' : '选择IP' }}</el-button>
                  <el-button type="text" @click="addData.data.address = []" v-if="addData.data.address">清除IP</el-button>
                </span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否使用IPV6：">
                <el-switch @change="getIpPool('V6', 'ipv6List')" v-model="addData.data.ipv6Enabled" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="addData.data.ipv6Enabled">
              <basic-form-item label="IP池(V6)：" prop="ipv6PoolId" validate="required">
                <el-select v-model="addData.data.ipv6PoolId" @change="$set(addData.data, 'ipv6Address', [])" filterable>
                  <el-option v-for="(item, index) in ipv6List" :label="item.name" :value="item.id" :key="index"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="24" v-if="addData.data.ipv6Enabled">
              <el-form-item label="指定IP：">
                {{ addData.data.ipv6Address ? addData.data.ipv6Address.join(',') : '若不指定IP则默认从IP池随机选择一个IP' }}
                <span class="m-l-md">
                  <el-button type="text" @click="openIp('ipv6Address')" :disabled="!addData.data.ipv6PoolId">{{ addData.data.address ? '切换IP' : '选择IP' }}</el-button>
                  <el-button type="text" @click="addData.data.ipv6Address = []" v-if="addData.data.ipv6Address">清除IP</el-button>
                </span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
    <ip :add-data="ipData" v-if="ipData.dialog" :parent-data="parentData" :lists="list"></ip>
  </div>
</template>

<script>
/* global $ */
import { getIpPool, getIp } from 'services/platform/index'

import ip from './ip.vue'
export default {
  components: { ip },
  props: {
    addData: {
      type: Object
    },
    parentData: {
      type: Object
    },
    list: {
      type: Array
    }
  },
  data() {
    return {
      ipv4List: [],
      v4IpList: [],
      ipv6List: [],
      v6IpList: [],
      ipData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    openIp(key) {
      this.ipData = {
        dialog: true,
        key: key,
        index: this.addData.index,
        data: this.addData.data
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.$emit('back', this.addData.data)
          this.addData.dialog = false
        }
      })
    },
    getIpPool(version, list) {
      getIpPool({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { version: version }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this[list] = data.data.rows
        }
      })
    },
    getIp(id, list) {
      getIp({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { poolId: id, status: 'free' }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this[list] = data.data.rows
        }
      })
    }
  },
  created() {
    this.getIpPool('V4', 'ipv4List')
    if (this.addData.data.address) this.getIp(this.addData.data.ipv4PoolId, 'v4IpList')
  }
}
</script>

<style></style>

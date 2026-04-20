<template>
  <div>
    <basic-form :model="addData" ref="addData" label-position="left">
      <basic-form-item label="属性规格：" prop="customization">
        <el-radio-group v-model="addData.customization" @change="changeType">
          <el-radio :label="false">不使用自定义</el-radio>
          <el-radio :label="true">自定义向导创建</el-radio>
        </el-radio-group>
      </basic-form-item>
      <el-row v-if="addData.customization">
        <el-col :span="24">
          <el-col :span="12">
            <basic-form-item label="主机名称：" prop="vmHostName" validate="required" required-message="该字段为必填字段">
              <el-input v-model="addData.vmHostName"> </el-input>
            </basic-form-item>
          </el-col>
        </el-col>
        <el-col :span="12" v-if="addData.customization">
          <basic-form-item label="密码：" prop="password" validate="required">
            <el-tooltip
              class="item"
              effect="dark"
              content="密码长度大于等于8位，不超过26
  至少两种字符的组合：小写字母、大写字母、数字和特殊符号，但是不含中文，不包含用户名或者用户名的倒写"
              placement="top"
            >
              <el-input type="password" v-model="addData.password"></el-input>
            </el-tooltip>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="addData.customization">
          <basic-form-item label="确认密码：" prop="confirm_password" validate="required">
            <el-input type="password" v-model="addData.confirm_password"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-for="(item, index) in addData.operations" :key="index">
          <basic-form-item :label="`网卡${index + 1}：`">
            <el-col :span="12">
              <basic-form-item label="IP池(V4)：" :prop="'operations.' + index + '.ipv4PoolId'" validate="required" style="width: calc(100% - 70px)">
                <el-select v-model="item.ipv4PoolId" @change="$set(item, 'address', [])" filterable>
                  <el-option v-for="(item, index) in item.ipv4List" :label="item.ipPoolName" :value="item.ipPoolId" :key="index"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="指定IP：" prop="address">
                {{ item.address.length ? item.address.join(',') : '若不指定IP则默认从IP池随机选择一个IP' }}
                <span class="m-l-md">
                  <el-button type="text" @click="openIp('address', item)" :disabled="!item.ipv4PoolId">{{ item.address.length ? '切换IP' : '选择IP' }}</el-button>
                  <el-button type="text" @click="item.address = []" v-if="item.address">清除IP</el-button>
                </span>
              </el-form-item>
            </el-col>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <ip :add-data="ipData" v-if="ipData.dialog" :parent-data="addData" :count="count" :lists="networkCardConfigs"></ip>
  </div>
</template>
<script>
import { getIpPool } from 'services/platform/index'
import ip from './ip.vue'
export default {
  components: {
    ip
  },
  props: {
    addData: {
      type: Object
    },
    disabled: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    count: {
      type: Number
    },
    networkCardConfigs: {
      type: Array
    },
    networkRelations: {
      type: Array
    }
  },
  data() {
    return {
      ipv4List: [],
      ipData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    changeType(value) {
      if (!value) {
        this.$set(this.addData, 'vmHostName', '')
        this.$set(this.addData, 'password', '')
        this.$set(this.addData, 'endPassword', '')
        this.$set(this.addData, 'operations', [])
      } else {
        this.addData.operations = []
        this.networkCardConfigs.forEach((element, index) => {
          const list = this.getIpPools(element.portGroupId)
          const obj = {
            sequenceNum: index + 1,
            ipv4PoolId: '',
            address: [],
            ipv4List: list
          }
          this.addData.operations.push(obj)
        })
      }
    },
    getIpPools(portGroupId) {
      const list = []
      console.log(this.networkRelations)
      this.networkRelations.forEach(item => {
        if (item.portGroupId == portGroupId) {
          list.push(item)
        }
      })
      return list
    },
    openIp(key, item) {
      this.ipData = {
        dialog: true,
        key: key,
        index: this.addData.index,
        data: item
      }
    }
  },
  created() {
    if (!this.disabled) {
      this.changeType(false)
    }
  },
  mounted() {},
  watch: {}
}
</script>

<style></style>

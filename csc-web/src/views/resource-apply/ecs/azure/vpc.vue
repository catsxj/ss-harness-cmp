<template>
  <div>
    <el-dialog title="新增VPC" :visible.sync="dialog.dialog" width="60%">
      <el-form label-width="100px" :model="addData" ref="data">
        <cmp-form-item label="名称：" prop="configs.name" validate="required">
          <el-input v-model="addData.configs.name"></el-input>
        </cmp-form-item>
        <cmp-form-item label="地址空间：" prop="configs.cidr" validate="required,cidr">
          <el-alert title="虚拟网络的地址空间，采用 CIDR 表示法(例如 192.168.1.0/24)指定为一个或多个地址前缀。" :closable="false" style="padding: 0px" type="warning"> </el-alert>
          <el-input v-model="addData.configs.cidr" class="m-t-xs"></el-input>
        </cmp-form-item>
        <el-form-item label="子网：" required>
          <el-row>
            <el-alert title="子网的地址范围采用 CIDR 表示法(例如 192.168.1.0/24)。它必须包含在虚拟网络的地址空间中。" :closable="false" style="padding: 0px" type="warning"> </el-alert>
            <el-col :span="24" v-for="(item, index) in subnetModels" :key="index" class="m-t-xs">
              <el-col :span="8">
                <el-input v-model="item.name" placeholder="名称"></el-input>
              </el-col>
              <el-col :span="8" :offset="1">
                <el-input v-model="item.cidr" placeholder="192.168.1.0/24"></el-input>
              </el-col>
              <el-col :span="5" :offset="1">
                <el-button type="danger" @click="removeSubnet(index)">删除</el-button>
              </el-col>
            </el-col>
            <el-col :span="24" class="m-t-md">
              <el-button type="primary" @click="addSubnet">添加子网</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="dialog.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createGroup, createKey } from 'services/platform/index'
import { createSet } from 'services/platform/azure'
import { downloadFile } from 'utils'
import { applyResource, getSlaDetail } from 'services/services/product'
import { add, element } from './../../data/publicInit'
/* global $ */
export default {
  props: {
    dialog: {
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
    return {
      loading: false,
      addData: {
        ...this._.cloneDeep(add),
        service: 'azure.standard.vpc',
        configs: {
          name: '',
          resourceGroupId: '',
          cidr: ''
        }
      },
      elements: [
        {
          name: '子网',
          serviceCode: 'azure.standard.vpc',
          ...element
        }
      ],
      subnetModels: []
    }
  },
  created() {},
  methods: {
    addSubnet() {
      this.subnetModels.push({ name: '', value: '' })
    },
    removeSubnet(index) {
      if (this.subnetModels.length == 1) return this.$message.error('最少输入一个子网')
      this.subnetModels.splice(index, 1)
    },
    getConfigs() {
      const { configs } = this.addData
      let flag = false
      this.subnetModels.forEach(item => {
        if (!item.name || !item.cidr) flag = true
      })
      if (flag) return this.$message.error('请认真输入子网信息')
      return {
        ...configs,
        subnetModels: this.subnetModels
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const postData = this.handlePostData()
          this.loading = true
          applyResource(postData)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.$emit('back')
                this.dialog.dialog = false
              }
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        }
      })
    },
    getSkuParams(data) {
      const params = []
      data.forEach(item => {
        // 忽略此elements
        if (item.ignore) return
        const { serviceCode, elements } = item
        // 如果存在子节点对子节点进行处理
        if (elements) {
          const returnData = this.getSkuParams(elements)
          params.push(...returnData)
          return
        }
        const result = {
          serviceCode
        }
        params.push(result)
      })
      return params
    },
    handlePostData() {
      const config = this.getConfigs()
      // 校验不通过
      if (!config) return false
      this.addData.configs = {
        ...this.addData.configs,
        ...config,
        resourceGroupId: this.dialog.data.resourceGroupId
      }
      const {
        emption,
        configs,
        serviceItem: { sla },
        service
      } = this.addData
      const elements = this.getSkuParams(this.elements)
      const { location } = this.dialog.data
      return {
        location,
        emption,
        configs,
        elements,
        sla,
        service
      }
    }
  }
}
</script>

<style></style>

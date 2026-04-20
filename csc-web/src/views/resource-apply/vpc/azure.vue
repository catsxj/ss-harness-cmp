/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :show-az="false" :add-data="addData" @vendorId="getResource" ref="common" :elements="elements" :showCount="false" :getParams="getConfigs">
    <basic-form-item label="名称：" prop="configs.name" validate="required">
      <el-input v-model="addData.configs.name"></el-input>
    </basic-form-item>
    <basic-form-item label="资源组：" prop="configs.resourceGroupId" validate="required" required-message="该字段为必填字段">
      <el-select v-model="addData.configs.resourceGroupId">
        <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="地址空间：" prop="configs.cidr" validate="required,cidr">
      <el-alert title="虚拟网络的地址空间，采用 CIDR 表示法(例如 192.168.1.0/24)指定为一个或多个地址前缀。" :closable="false" style="padding: 0px" type="warning"> </el-alert>
      <el-input v-model="addData.configs.cidr" class="m-t-xs"></el-input>
    </basic-form-item>
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
    <div slot="preview-card">
      <basic-form-item label="VPC名称：">{{ addData.configs.name }}</basic-form-item>
      <basic-form-item label="子网名称：">
        <div v-for="(item, index) in subnetModels" :key="index">
          {{ item.name + (item.cidr ? '(' + item.cidr + ')' : '') }}
        </div>
      </basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from './../components/PublicCommonWrapper.vue'
import { add, element } from './../data/publicInit'
import { getResource } from 'services/platform/azure'
import { cloneDeep } from 'lodash-es'

export default {
  components: { CommonWrapper },
  data() {
    return {
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'azure.standard.vpc',
        configs: {
          resourceLabel: [],
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
      subnetModels: [],
      resourceData: []
    }
  },
  computed: {},
  created() {},
  methods: {
    addSubnet() {
      this.subnetModels.push({ name: '', value: '' })
    },
    removeSubnet(index) {
      if (this.subnetModels.length == 1) return this.$message.error('最少输入一个子网')
      this.subnetModels.splice(index, 1)
    },
    getResource() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          this.resourceData = data.data.rows
        }
      })
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
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>

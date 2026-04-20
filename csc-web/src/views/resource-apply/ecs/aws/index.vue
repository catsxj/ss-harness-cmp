/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="compute" :show-count="!vmData.hasEip" :add-data="addData" @vendorId="getList" @backZone="getSubnet" ref="common" :elements="elements" :get-params="getParams" :modify-element="modifyElement" :item-data="retention" :disabled="disabled">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <el-col :span="15" v-if="addData.location.region">
        <flavor :add-data="addData"></flavor>
      </el-col>
      <images v-if="addData.location.vendorId" :add-data="addData.configs" :vendor-id="addData.location.vendorId" :location="addData.location" vendorType="aws" :item-data="retention" ref="image"></images>
    </div>
    <div style="clear: both"></div>
    <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>网络信息</h5>
        <el-col :span="4">
          <basic-form-item prop="terminationProtected" label="启动终止保护：">
            <el-checkbox v-model="vmData.terminationProtected"></el-checkbox>
          </basic-form-item>
        </el-col>
        <el-col :span="4">
          <basic-form-item prop="hasIpv6" label="设置IPV6：">
            <el-checkbox v-model="vmData.hasIpv6" @change="changeHasIpv6"></el-checkbox>
          </basic-form-item>
        </el-col>
        <el-col :span="4">
          <basic-form-item prop="hasEip" label="设置EIP：">
            <el-checkbox v-model="vmData.hasEip" @change="changeHasEip"></el-checkbox>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="vmData.hasEip">
          <basic-form-item label="弹性IP：" prop="eipId" validate="required">
            <el-select v-model="vmData.eipId" filterable clearable @change="changeE">
              <el-option v-for="(item, index) in eipList" :key="index" :label="item.name" :value="item.id"> {{ item.name }}({{ item.publicIp }}) </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <basic-form-item label="所属网络：" prop="networkId" validate="required" required-message="请选择所属网络">
              <el-select v-model="vmData.networkId" @change="changeVPC" class="basic-cmp">
                <el-option v-for="item in vpcData" :label="`${item.name}(${item.vpcId})`" :value="item.id" :key="item.vpcId"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="所属子网：" prop="subnetId" validate="required" required-message="请选择子网">
              <el-select v-model="vmData.subnetId" filterable placeholder="请先选择交换机" class="basic-cmp">
                <el-option v-for="(item, index) in subnets" :label="item.name" :value="item.id" :key="index">{{ item.name }}({{ item.subnetId }} - {{ item.cidr }})</el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="addData.emption.count == 1">
            <el-col :span="24">
              <el-col :span="6">
                <basic-form-item label="手动指定IP: ">
                  <el-checkbox v-model="vmData.manualIp"></el-checkbox>
                </basic-form-item>
              </el-col>
              <el-col :span="18" v-if="vmData.manualIp">
                <basic-form-item label="IP：" prop="managerIp" validate="required,ip" required-message="请指定ip">
                  <el-input v-model="vmData.managerIp" placeholder="请输入192.168.1.1类型格式" class="basic-cmp"></el-input>
                </basic-form-item>
              </el-col>
            </el-col>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="安全组：" prop="groups" :rules="[{ required: true, message: '请选择安全组', trigger: 'blur' }]">
              <el-select v-model="vmData.groups" multiple class="basic-cmp">
                <el-option v-for="(item, index) in groupsData" :key="index" :label="`${item.name}(${item.value})`" :value="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-col>
        <div style="clear: both"></div>
        <!-- <el-divider></el-divider> -->
      </div>
      <div class="item-block">
        <h5>云主机信息</h5>
        <rule :add-data="vmData"></rule>
        <el-col :span="12">
          <basic-form-item label="密钥：" prop="keypairId" validate="required" required-message="该字段为必填字段">
            <el-select v-model="vmData.keypairId" class="basic-cmp">
              <el-option v-for="item in keypairList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </div>
    </basic-form>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import { add } from '../../data/publicInit'
import { getKey, getGroup, getVpc, getSubnet, getListEip } from 'services/platform/index'
import images from './image.vue'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import flavor from './flavor.vue'
import rule from '../namerule.vue'

export default {
  components: { CommonWrapper, images, flavor, rule },
  props: {
    type: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      elements: [
        {
          name: '云主机',
          serviceCode: 'aws.standard.server',
          main: true,
          cpu: 0,
          memory: 0
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'aws.standard.server',
        configs: {
          resourceLabel: [],
          imageId: '',
          imageType: 'PUBLIC',
          imageName: ''
        }
      },
      vmData: {
        networkId: '',
        subnetId: '',
        groups: [],
        terminationProtected: false,
        hasIpv6: false,
        hasEip: false,
        keypairId: ''
      },
      vpcData: [],
      subnets: [],
      groupsData: [],
      eipList: [],
      keypairList: [],
      retention: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then(data => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.handleShowData()
        }
      })
    } else {
      this.addData = {
        ...add,
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'aws.standard.server',
        configs: {
          resourceLabel: [],
          imageId: '',
          imageType: 'PUBLIC',
          imageName: ''
        }
      }
    }
  },
  methods: {
    handleShowData() {
      this.addData = cloneDeep(this.retention)
      const { name, hasIpv6, networkId, subnetId, groups, manualIp, managerIp, terminationProtected, hasEip, keypairId, eipId, nameruleId } = this.addData.configs
      this.vmData = {
        nameruleId,
        name: name,
        networkId: networkId,
        subnetId: subnetId,
        groups: groups,
        manualIp: manualIp,
        managerIp: managerIp,
        terminationProtected: terminationProtected,
        hasIpv6: hasIpv6,
        hasEip: hasEip,
        keypairId: keypairId,
        eipId
      }
      this.getVPCList()
      if (hasEip) this.getListEips()
    },
    changeHasIpv6(val) {
      this.getVPCList()
      if (val) {
        this.vmData.networkId = ''
        this.vmData.subnetId = ''
      }
    },
    changeHasEip(val) {
      this.getVPCList()
      if (val) {
        this.vmData.networkId = ''
        this.vmData.subnetId = ''
        this.getListEips()
      }
    },
    getListEips() {
      getListEip({
        vendorId: this.addData.location.vendorId,
        regionId: this.addData.location.region
      }).then(data => {
        if (data.success) {
          this.eipList = data.data
        }
      })
    },
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getVPCList() {
      if (this.retention && this.retention.location.region == this.addData.location.region) {
        this.subnets = []
        this.groupsData = []
      } else {
        this.$set(this.vmData, 'networkId', '')
        this.$set(this.vmData, 'subnetId', '')
        this.$set(this.vmData, 'groups', [])
        this.subnets = []
        this.groupsData = []
      }
      this.groupsData = []
      const params = {
        page: 1,
        rows: 9999
      }
      params.params = this.$tools.handleSearchParam({
        vendorId: this.addData.location.vendorId,
        regionId: this.addData.location.region,
        hasIpv6: this.vmData.hasIpv6
      })
      getVpc(params).then(data => {
        if (data.success) {
          this.vpcData = data.data.rows
          if (this.vmData.networkId) {
            this.changeVPC()
          }
        }
      })
    },
    changeVPC() {
      this.getSubnet()
      this.getGroupData()
    },
    // 获取子网
    getSubnet() {
      const params = JSON.stringify([
        {
          param: {
            networkId: this.vmData.networkId,
            zone: this.addData.location.az,
            vendorId: this.addData.location.vendorId,
            regionId: this.addData.location.region,
            hasIpv6: this.vmData.hasIpv6
          },
          sign: 'EQ'
        }
      ])
      getSubnet({
        page: 1,
        rows: 999999,
        params
      }).then(data => {
        if (data.success) {
          this.subnets = data.data.rows
        }
      })
    },
    getGroupData() {
      getGroup({
        simple: true,
        params: JSON.stringify([
          {
            param: {
              vendorId: this.addData.location.vendorId,
              vpcId: this.vmData.networkId
            },
            sign: 'EQ'
          }
        ])
      }).then(data => {
        if (data.success) {
          this.groupsData = data.data.rows
        }
      })
    },
    getList() {
      this.getVPCList(true)
      this.getKeypair()
    },
    getKeypair() {
      getKey({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.keypairList = data.data.rows
        }
      })
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.vmData.diskDevices = this.$refs.image.$refs.disk.ok()
          let flag = false
          this.vmData.diskDevices.forEach((item, index) => {
            if (index == 0) item.deleteWithInstance = 'true'
            else item.deleteWithInstance = 'false'
            if (!item.size) flag = true
          })
          if (this.vmData.diskDevices.length == 0) return this.$message.error('请添加磁盘')
          if (flag) return this.$message.error('磁盘数据不完善')
          const { ...other } = this.vmData
          const result = {
            ...other,
            regionId: this.addData.location.region,
            zoneId: this.addData.location.az
          }
          if (this.vmData.hasEip) this.addData.emption.count = 1
          data = result
        }
      })
      return data
    },
    modifyElement() {
      this.currentElement.cpu = this.addData.configs.cpu
      this.currentElement.memory = this.addData.configs.memory
      this.vmData.diskDevices.forEach(item => {
        this.elements.push({
          serviceCode: 'aws.standard.volume',
          insAmount: item.size
        })
      })
    }
  },
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.location.vendorType)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../index.scss';
.remark_title {
  font-size: 12px;
  color: #979797;
}
</style>

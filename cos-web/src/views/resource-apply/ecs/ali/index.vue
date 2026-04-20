/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="compute" :add-data="addData" @vendorId="getList" @backZone="getSubnet" ref="common" :elements="elements" :get-params="getParams" :modify-element="modifyElement" :item-data="retention" :disabled="disabled">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <el-col :span="15" v-if="addData.location.az">
        <flavor :add-data="addData"></flavor>
      </el-col>
      <images :add-data="addData.configs" :vendor-id="addData.location.vendorId" :location="addData.location" vendorType="ALIYUN" :item-data="retention"></images>
      <el-col :span="8">
        <basic-form-item label="系统盘：" prop="configs.systemDiskCategory" validate="required" required-message="请选择系统盘类别">
          <el-select v-model="addData.configs.systemDiskCategory" placeholder="请先选择系统盘类别" class="fix-select">
            <el-option v-for="item in categoryData" :label="item.name" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="6" :offset="1">
        <basic-form-item label=" " prop="configs.systemDiskSize" label-width="25px" validate="required"> <el-input-number v-model="addData.configs.systemDiskSize" :min="40" :max="500" class="m-r"> </el-input-number>GB </basic-form-item>
      </el-col>
      <el-col :span="24">
        <DataDisk :add-data="addData" :category-data="categoryData"></DataDisk>
      </el-col>
    </div>
    <div style="clear: both"></div>
    <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>网络信息</h5>
        <el-col :span="24">
          <el-col :span="12">
            <basic-form-item label="所属网络：" prop="networkId" validate="required" required-message="请选择所属网络">
              <el-select v-model="vmData.networkId" @change="changeVPC" class="basic-cmp">
                <el-option v-for="item in vpcData" :label="`${item.name}(${item.vpcId})`" :value="item.id" :key="item.vpcId"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="所属子网：" prop="subnetUuid" validate="required" required-message="请选择子网">
              <el-select v-model="vmData.subnetUuid" placeholder="请先选择交换机" class="basic-cmp">
                <el-option v-for="(item, index) in subnets" :label="`${item.name}(${item.subnetUuid} - ${item.cidr})`" :value="item.subnetUuid" :key="index"></el-option>
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
          <basic-form-item label="密码设置：" validate="required,aliPassword" prop="password">
            <el-input v-model="vmData.password" placeholder="请输入密码" show-password class="basic-cmp"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="确认密码：" validate="required" prop="confirm_password">
            <el-input v-model="vmData.confirm_password" placeholder="请确认密码" show-password class="basic-cmp"></el-input>
          </basic-form-item>
        </el-col>
      </div>
    </basic-form>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import { add } from '../../data/publicInit'
import { getGroup, getVpc, getSubnet } from 'services/platform/index'
import crypto from 'utils/crypto'
import images from './image.vue'
import DataDisk from './DataDisk.vue'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import rule from '../namerule.vue'
import flavor from './flavor.vue'
export default {
  components: { CommonWrapper, images, DataDisk, flavor, rule },
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
          serviceCode: 'aliyun.standard.server',
          main: true,
          cpu: 0,
          memory: 0
        },
        {
          name: '云硬盘',
          serviceCode: 'aliyun.standard.volume',
          main: true,
          insAmount: 50
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'aliyun.standard.server',
        configs: {
          resourceLabel: [],
          systemDiskSize: 50,
          imageId: '',
          systemDiskCategory: '',
          imageType: 'PUBLIC',
          imageName: '',
          dataDisk: []
        }
      },
      vmData: {
        hasIpv6: false,
        networkId: '',
        subnetUuid: '',
        groups: []
      },
      categoryData: [],
      vpcData: [],
      subnets: [],
      groupsData: [],
      retention: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    },
    currentElement1() {
      return this.elements[1]
    }
  },
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then((data) => {
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
        service: 'aliyun.standard.server',
        configs: {
          resourceLabel: [],
          systemDiskSize: 50,
          imageId: '',
          systemDiskCategory: '',
          imageType: 'PUBLIC',
          imageName: '',
          dataDisk: []
        }
      }
    }
  },
  methods: {
    handleShowData() {
      this.addData = cloneDeep(this.retention)
      const { name, password, hasIpv6, networkId, subnetUuid, groups, manualIp, managerIp, nameruleId } = this.addData.configs
      this.vmData = {
        nameruleId,
        name: name,
        hasIpv6: hasIpv6,
        networkId: networkId,
        subnetUuid: subnetUuid,
        groups: groups,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password),
        manualIp: manualIp,
        managerIp: managerIp
      }
      this.getVPCList()
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
        this.$set(this.vmData, 'subnetUuid', '')
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
      getVpc(params).then((data) => {
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
      }).then((data) => {
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
      }).then((data) => {
        if (data.success) {
          this.groupsData = data.data.rows
        }
      })
    },
    getList() {
      this.getVPCList(true)
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          const { password, confirm_password, ...other } = this.vmData
          if (password !== confirm_password) return this.$message.error('两次密码输入不一致')
          const result = {
            ...other,
            password: crypto.encrypt(password),
            regionId: this.addData.location.region,
            zoneId: this.addData.location.az
          }
          data = result
        }
      })
      return data
    },
    modifyElement() {
      this.currentElement.cpu = this.addData.configs.cpu
      this.currentElement.memory = this.addData.configs.memory
      this.currentElement1.insAmount = this.addData.configs.systemDiskSize
      this.addData.configs.dataDisk.forEach((item) => {
        this.elements.push({
          serviceCode: 'aliyun.standard.volume',
          insAmount: item.dataDiskSize
        })
      })
    }
  },
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.location.vendorType)
    },
    'addData.location.diskCategory'() {
      if (!this.addData.location.diskCategory) return
      if (this.retention && this.addData.location.az == this.retention.location.az) {
        this.addData.configs.systemDiskCategory = this.retention.configs.systemDiskCategory
      } else {
        this.addData.configs.systemDiskCategory = ''
      }
      this.categoryData = []
      if (this.addData.location.diskCategory.indexOf('CLOUD') != -1) {
        this.categoryData.push({ name: '普通云盘', value: 'CLOUD' })
      }
      if (this.addData.location.diskCategory.indexOf('EFFICIENCY') != -1) {
        this.categoryData.push({ name: '高效云盘', value: 'EFFICIENCY' })
      }
      if (this.addData.location.diskCategory.indexOf('SSD') != -1) {
        this.categoryData.push({ name: 'SSD云盘', value: 'SSD' })
      }
      if (this.addData.location.diskCategory.indexOf('ESSD') != -1) {
        this.categoryData.push({ name: 'ESSD云盘', value: 'ESSD' })
      }
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

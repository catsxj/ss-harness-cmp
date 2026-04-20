/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="compute" :add-data="addData" @vendorId="getList" @backZone="getSubnet" ref="common" :elements="elements" :modify-element="modifyElement" :get-params="getParams" :item-data="retention" :disabled="disabled">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <el-col :span="15" v-if="addData.location.az">
        <flavor :add-data="addData"></flavor>
      </el-col>
      <images :add-data="addData.configs" :vendor-id="addData.location.vendorId" :location="addData.location" vendorType="TENCENT" :item-data="retention" v-if="addData.location.vendorId"></images>
      <el-col :span="8">
        <basic-form-item label="系统盘：" prop="configs.rootVolumeType" validate="required" required-message="请选择系统盘类别">
          <el-select v-model="addData.configs.rootVolumeType" placeholder="请先选择系统盘类别" class="fix-select">
            <el-option v-for="item in categoryData" :label="item.name" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="6" :offset="1">
        <basic-form-item label=" " prop="configs.rootSize" label-width="25px" validate="required"> <el-input-number v-model="addData.configs.rootSize" :min="40" :max="500" class="m-r"></el-input-number>GB </basic-form-item>
      </el-col>
    </div>
    <div style="clear: both"></div>
    <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>网络信息</h5>
        <el-col :span="24">
          <el-col :span="12">
            <basic-form-item label="所属网络：" prop="vpcUuid" validate="required" required-message="请选择所属网络">
              <el-select v-model="vmData.vpcUuid" @change="getSubnet" class="basic-cmp">
                <el-option v-for="item in vpcData" :label="`${item.name}(${item.vpcId})`" :value="item.vpcId" :key="item.vpcId"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="所属子网：" prop="subnetUuid" validate="required" required-message="请选择子网">
              <el-select v-model="vmData.subnetUuid" placeholder="请先选择所属网络" class="basic-cmp">
                <el-option v-for="(item, index) in subnets" :label="`${item.name}(${item.subnetUuid} - ${item.cidr})`" :value="item.subnetUuid" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-col>
        <div style="clear: both"></div>
        <!-- <el-divider></el-divider> -->
      </div>
      <div class="item-block">
        <h5>云主机信息</h5>
        <el-col :span="24">
          <basic-form-item label="登录方式：">
            <el-radio-group v-model="vmData.loginType" @change="chooseLoginWay">
              <el-radio :label="item.name" :key="index" v-for="(item, index) in loginWays" border> {{ item.name }}</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="24" v-if="vmData.loginType == '密钥'">
          <basic-form-item label="密钥：" prop="keypairName" validate="required" required-message="该字段为必填字段">
            <el-select v-model="vmData.keypairName" class="basic-cmp">
              <el-option v-for="item in keypairList" :key="item.id" :label="item.name" :value="item.name"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24" v-else-if="vmData.loginType == '密码'">
          <el-col :span="12">
            <basic-form-item label="密码设置：" validate="required" prop="password">
              <el-input v-model="vmData.password" placeholder="请输入密码" show-password></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="确认密码：" validate="required" prop="confirm_password">
              <el-input v-model="vmData.confirm_password" placeholder="请确认密码" show-password></el-input>
            </basic-form-item>
          </el-col>
        </el-col>
        <rule :add-data="vmData"></rule>
        <el-col :span="12">
          <basic-form-item label="安全组：" prop="groups" validate="required" required-message="该字段为必填字段">
            <el-select v-model="vmData.groups" multiple placeholder="请选择" class="basic-cmp">
              <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.groupUuid"> </el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </div>
    </basic-form>
    <div slot="preview-card">
      <basic-form-item label="规格：" v-if="addData.configs.flavorId">{{ currentElement.cpu + 'C/' + currentElement.memory + 'GB/' + addData.configs.rootSize + 'GB' }}</basic-form-item>
      <basic-form-item label="密钥：" v-if="vmData.keypairName">{{ vmData.keypairName }}</basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import { add } from '../../data/publicInit'
import { getKey, getGroup, getVpc, getSubnet } from 'services/platform/index'
import crypto from 'utils/crypto'
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
          serviceCode: 'tencent.standard.server',
          main: true,
          cpu: 0,
          memory: 0
        },
        {
          name: '云硬盘',
          serviceCode: 'tencent.standard.volume',
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
        service: 'tencent.standard.server',
        configs: {
          resourceLabel: [],
          rootSize: 50,
          imageId: '',
          rootVolumeType: '',
          imageType: 'PUBLIC',
          imageName: ''
        }
      },
      vmData: {
        vpcUuid: '',
        subnetUuid: '',
        groups: [],
        loginType: '密钥',
        password: '',
        keypairName: ''
      },
      categoryData: [
        { name: '普通云盘', value: 'CLOUD_BASIC', size: 20 },
        { name: '高效云盘', value: 'CLOUD_PREMIUM', size: 10 },
        { name: 'SSD云盘', value: 'CLOUD_SSD', size: 100 }
      ],
      vpcData: [],
      subnets: [],
      groupList: [],
      keypairList: [],
      loginWays: [{ name: '密钥' }, { name: '密码' }],
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
        service: 'tencent.standard.server',
        configs: {
          resourceLabel: [],
          rootSize: 50,
          imageId: '',
          rootVolumeType: '',
          imageType: 'PUBLIC',
          imageName: ''
        }
      }
    }
  },
  methods: {
    chooseLoginWay(item) {
      if (this.vmData.loginType == '密钥') {
        this.addData.password = ''
      } else if (this.vmData.loginType == '密码') {
        this.vmData.keypairName = ''
      } else {
        this.addData.password = ''
        delete this.addData.endPassword
      }
    },
    handleShowData() {
      this.addData = cloneDeep(this.retention)
      const { name, password, vpcUuid, subnetUuid, groups, loginType, keypairName, nameruleId } = this.addData.configs
      this.vmData = {
        name: name,
        vpcUuid: vpcUuid,
        subnetUuid: subnetUuid,
        groups: groups,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password),
        loginType: loginType,
        keypairName: keypairName,
        nameruleId
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
      } else {
        this.$set(this.vmData, 'vpcUuid', '')
        this.$set(this.vmData, 'subnetUuid', '')
        this.subnets = []
      }
      const params = {
        page: 1,
        rows: 9999
      }
      params.params = this.$tools.handleSearchParam({
        vendorId: this.addData.location.vendorId,
        regionId: this.addData.location.region
      })
      getVpc(params).then(data => {
        if (data.success) {
          this.vpcData = data.data.rows
          if (this.vmData.networkUuid) {
            this.getSubnet()
          }
        }
      })
    },
    // 获取子网
    getSubnet() {
      const params = JSON.stringify([
        {
          param: {
            vpcUuid: this.vmData.vpcUuid,
            vendorId: this.addData.location.vendorId,
            regionId: this.addData.location.region,
            zone: this.addData.location.az
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
    getList() {
      this.getVPCList(true)
      this.getKeypair()
      this.getGroupData()
    },
    getGroupData() {
      getGroup({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.groupList = data.data.rows
        }
      })
    },
    getKeypair() {
      getKey({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
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
          const { password, confirm_password, ...other } = this.vmData
          if (password !== confirm_password && this.vmData.loginType == '密码') return this.$message.error('两次密码输入不一致')
          const result = {
            ...other,
            password: crypto.encrypt(password),
            regionId: this.addData.location.region,
            zoneId: this.addData.location.az
          }
          this.currentElement.cpu = this.addData.configs.cpu
          this.currentElement.memory = this.addData.configs.memory
          data = result
        }
      })
      return data
    },
    modifyElement() {
      this.currentElement.cpu = this.addData.configs.cpu
      this.currentElement.memory = this.addData.configs.memory
      this.currentElement1.insAmount = this.addData.configs.rootSize
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

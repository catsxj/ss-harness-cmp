<template>
  <div>
    <el-col :span="24">
      <el-form-item label="镜像类型：" required>
        <el-radio-group v-model="type" @change="chooseWay">
          <el-radio :label="item.value" :key="index" v-for="(item, index) in typeList" border> {{ item.name }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-col>
    <el-col :span="12" v-if="type == '1'">
      <el-form-item label="系统类型：" required>
        <el-select filterable v-model="imageTypeName" @change="setImage" class="fix-select" style="width: 280px">
          <el-option v-for="(item, index) in imageTypeList" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="12" v-if="type == '1' && imageTypeName == 'LINUX'">
      <cmp-form-item label="" label-width="10px" prop="popularLinuxImage" validate="required">
        <el-select filterable v-model="addData.popularLinuxImage" @change="setSize('popularLinuxImage')" style="width: 280px">
          <el-option v-for="(item, index) in imageData[imageTypeName]" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </cmp-form-item>
    </el-col>
    <el-col :span="12" v-if="type == '1' && imageTypeName == 'WINDOWS'">
      <cmp-form-item label="" label-width="10px" prop="PopularWindowsImage" validate="required">
        <el-select filterable v-model="addData.PopularWindowsImage" @change="setSize('PopularWindowsImage')" style="width: 280px">
          <el-option v-for="(item, index) in imageData[imageTypeName]" :key="index" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </cmp-form-item>
    </el-col>
    <el-col :span="20" v-if="type == '2' || type == '3'">
      <cmp-form-item label="镜像：" prop="imageId">
        <basic-table :data="imageList" :params="params" :get-list="getImageData" :total="imageTotal">
          <el-table-column label="名称" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-radio @change="setOtherSize(scope.row)" v-model="addData.imageId" :label="scope.row.id">{{ scope.row.osCategory + ' ' + scope.row.name }}</el-radio>
            </template>
          </el-table-column>
        </basic-table>
      </cmp-form-item>
    </el-col>
  </div>
</template>

<script>
import { getImage } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {
          rootSize: '',
          name: '',
          password: '',
          endPassword: '',
          keypairName: '',
          groups: [],
          account: '',
          count: 1,
          networks: [],
          bootFromVolume: false
        }
      }
    },
    vendorId: {
      type: [Number, String]
    },
    regionId: {
      type: [Number, String]
    }
  },
  data() {
    return {
      type: '1',
      typeList: [
        { name: '通用镜像', value: '1' },
        { name: '私有镜像', value: '2' },
        { name: '公共镜像', value: '3' }
      ],
      imageTypeList: [
        { name: 'Linux', value: 'LINUX' },
        { name: 'Windows', value: 'WINDOWS' }
      ],
      imageData: {
        LINUX: [
          { name: 'UBUNTU_SERVER_14_04_LTS', value: 'UBUNTU_SERVER_14_04_LTS', size: 30 },
          { name: 'UBUNTU_SERVER_16_04_LTS', value: 'UBUNTU_SERVER_16_04_LTS', size: 30 },
          { name: 'UBUNTU_SERVER_18_04_LTS', value: 'UBUNTU_SERVER_18_04_LTS', size: 30 },
          { name: 'DEBIAN_9', value: 'DEBIAN_9', size: 30 },
          { name: 'DEBIAN_10', value: 'DEBIAN_10', size: 30 },
          { name: 'CENTOS_8_1', value: 'CENTOS_8_1', size: 30 },
          // { name: 'OPENSUSE_LEAP_15_1', value: 'OPENSUSE_LEAP_15_1', size: 30 },
          { name: 'SLES_15_SP1', value: 'SLES_15_SP1', size: 30 },
          { name: 'REDHAT_RHEL_8_2', value: 'REDHAT_RHEL_8_2', size: 64 },
          { name: 'ORACLE_LINUX_8_1', value: 'ORACLE_LINUX_8_1', size: 30 }
        ],
        WINDOWS: [
          { name: 'WINDOWS_DESKTOP_10_20H1_PRO', value: 'WINDOWS_DESKTOP_10_20H1_PRO', size: 127 },
          { name: 'WINDOWS_SERVER_2019_DATACENTER', value: 'WINDOWS_SERVER_2019_DATACENTER', size: 127 },
          { name: 'WINDOWS_SERVER_2019_DATACENTER_WITH_CONTAINERS', value: 'WINDOWS_SERVER_2019_DATACENTER_WITH_CONTAINERS', size: 127 },
          { name: 'WINDOWS_SERVER_2016_DATACENTER', value: 'WINDOWS_SERVER_2016_DATACENTER', size: 127 },
          { name: 'WINDOWS_SERVER_2012_R2_DATACENTER', value: 'WINDOWS_SERVER_2012_R2_DATACENTER', size: 127 }
        ]
      },
      imageList: [],
      imageTypeName: '',
      imageType: '',
      params: {
        page: 1,
        rows: 10
      },
      imageTotal: 0
    }
  },
  methods: {
    setOtherSize(data) {
      this.$emit('backSize', data.size)
    },
    setSize(value) {
      if (value == 'popularLinuxImage') {
        const obj = this.imageData.LINUX.find((item) => item.value == this.addData.popularLinuxImage)
        this.$emit('backSize', obj.size)
      } else {
        const obj = this.imageData.WINDOWS.find((item) => item.value == this.addData.PopularWindowsImage)
        this.$emit('backSize', obj.size)
      }
    },
    setImage() {
      if (this.imageTypeName == 'LINUX') {
        this.$set(this.addData, 'popularLinuxImage', '')
        delete this.addData.PopularWindowsImage
      } else {
        this.$set(this.addData, 'PopularWindowsImage', '')
        delete this.addData.popularLinuxImage
      }
    },
    chooseWay() {
      if (this.type == '1') {
        this.imageTypeName = ''
        this.$set(this.addData, 'popularLinuxImage', '')
        this.$set(this.addData, 'PopularWindowsImage', '')
        delete this.addData.imageId
      } else if (this.type == '2') {
        this.imageType = 'PRIVATE'
        this.getImageData()
        this.$set(this.addData, 'imageId', '')
        delete this.addData.popularLinuxImage
        delete this.addData.PopularWindowsImage
      } else if (this.type == '3') {
        this.imageType = 'PUBLISHER'
        this.getImageData()
        this.$set(this.addData, 'imageId', '')
        delete this.addData.popularLinuxImage
        delete this.addData.PopularWindowsImage
      }
    },
    getImageData() {
      const searchParam = [{ param: { vendorId: this.vendorId, regionId: this.regionId, imageType: this.imageType }, sign: 'EQ' }]
      this.params.params = JSON.stringify(searchParam)
      getImage(this.params).then((data) => {
        if (data.success) {
          this.imageList = data.data.rows
          this.imageTotal = data.data.total
        }
      })
    }
  },
  watch: {
    regionId: {
      handler(newVal) {
        this.chooseWay()
      },
      deep: true
    },
    vendorId: {
      handler(newVal) {
        this.chooseWay()
      },
      deep: true
    }
  }
}
</script>

<style>
.powerLine {
  background-color: #d4d4d4;
  padding: 5px;
  margin-bottom: 10px;
  border-color: #cbcbcb;
  position: relative;
}
.powerLine .powerLineLeft {
  font-weight: bold;
}
.powerLine .powerLineRight {
  position: absolute;
  right: 10px;
  top: 5px;
  cursor: pointer;
}
::v-deep .el-select,
::v-deep .el-input {
  width: 280px;
}
</style>

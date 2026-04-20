<template>
  <el-col :span="24">
    <el-col :span="12">
      <el-form-item label="镜像类型：">
        <el-radio-group v-model="addData.imageType" @change="chooseWay">
          <el-radio :disabled="!location.region" :label="item.value" :key="index" v-for="(item, index) in typeList" border> {{ item.name }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="系统类型：" required>
        <el-select filterable v-model="addData.imageName" @change="setImageId" class="fix-select">
          <el-option v-for="(value, name, index) in imageList" :key="index" :label="name" :value="name"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <basic-form-item label-width="10px" label="" prop="configs.imageId" validate="required" required-message="该字段为必填字段">
        <el-select filterable v-model="addData.imageId" @change="setOsCategory">
          <el-option v-for="(item, index) in imageList[addData.imageName]" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
    </el-col>
  </el-col>
</template>

<script>
import { conditionImage } from 'services/platform/index'
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
    vendorType: {
      type: [Number, String],
      default: ''
    },
    location: {
      type: Object
    },
    itemData: {
      type: [Object, Boolean]
    }
  },
  data() {
    return {
      type: 'PUBLIC',
      typeList: [
        { name: '公共镜像', value: 'PUBLIC' },
        { name: '私有镜像', value: 'PRIVATE' }
      ],
      imageList: [],
      imageName: ''
    }
  },
  methods: {
    setOsCategory() {
      this.imageList[this.addData.imageName].forEach((item) => {
        if (item.id == this.addData.imageId) {
          this.$emit('setOsCategory', item)
        }
      })
    },
    chooseWay() {
      if (this.itemData && this.itemData.location.region == this.location.region) {
        this.getImageData()
      } else {
        this.addData.imageName = ''
        this.addData.imageId = ''
        this.getImageData()
      }
    },
    setImageId() {
      this.addData.imageId = ''
    },
    getImageData() {
      conditionImage({
        condition: 'listByImageType',
        vendorId: this.vendorId,
        status: 'ACTIVE',
        tenantId: 0,
        regionId: this.location.region,
        imageType: this.addData.imageType
      }).then((data) => {
        if (data.success) {
          this.imageList = data.data
        }
      })
    }
  },
  watch: {
    'location.region': {
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
</style>

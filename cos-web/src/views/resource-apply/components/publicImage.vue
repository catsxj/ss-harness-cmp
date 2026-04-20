<template>
  <el-row>
    <el-col :span="24">
      <el-col :span="8">
        <el-form-item label="镜像：" required>
          <el-select filterable v-model="imageName" @change="setImageId">
            <el-option v-for="(value, name, index) in imageList" :key="index" :label="name" :value="name"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <basic-form-item label-width="10px" label="" prop="imageId" validate="required" required-message="该字段为必填字段">
          <el-select filterable v-model="addData.imageId" @change="setOsCategory">
            <el-option v-for="(item, index) in imageList[imageName]" :key="index" :label="item.name + '(大小：' + item.size + 'GB)'" :value="item.id"></el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-col>
  </el-row>
</template>

<script>
import { getImage } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    vendorId: {
      type: [Number, String]
    },
    vendorType: {
      type: [Number, String],
      default: ''
    },
    regionId: {
      type: [Number, String]
    }
  },
  data() {
    return {
      type: 'PUBLIC',
      imageList: [],
      imageName: ''
    }
  },
  created() {
    this.chooseWay()
  },
  methods: {
    setOsCategory() {
      this.imageList[this.imageName].forEach((item) => {
        if (item.id == this.addData.imageId) {
          this.$emit('setOsCategory', item)
          this.addData.imageSize = item.size
        }
      })
    },
    chooseWay() {
      this.imageName = ''
      this.addData.imageId = ''
      this.getImageData()
    },
    setImageId() {
      this.addData.imageId = ''
      if (this.vendorType == 'TENCENT') {
        this.addData.imageId = this.imageList[this.imageName].length ? this.imageList[this.imageName][0].id : ''
        this.setOsCategory()
      }
    },
    getImageData() {
      const params = {
        page: 1,
        rows: 10000,
        condition: JSON.stringify({ condition: 'listByImageType' })
      }
      const searchParam = [{ param: { vendorId: this.vendorId, status: 'ACTIVE', regionId: this.regionId, imageType: this.type }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getImage(params).then((data) => {
        if (data.success) {
          this.imageList = data.data
        }
      })
    }
  },
  watch: {
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
</style>

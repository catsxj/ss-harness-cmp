<template>
  <div>
    <basic-form-item label="镜像名称：" prop="name" validate="required,noChinese" required-message="请输入名称">
      <el-input v-model="addData.name"></el-input>
    </basic-form-item>
    <basic-form-item label="镜像格式：" prop="osType" validate="required">
      <el-select v-model="addData.osType">
        <el-option :label="item.name" :value="item.value" v-for="item in imageTypeList" :key="item.id"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="已装QEMU-GA：" prop="qgaInstalled" validate="required">
      <el-select v-model="addData.qgaInstalled">
        <el-option label="是" :value="true"></el-option>
        <el-option label="否" :value="false"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item label="最小磁盘：" prop="minDisk" validate="required">
      <el-input v-model.number="addData.minDisk"></el-input>
    </basic-form-item>
    <basic-form-item label="默认用户：" prop="defaultUser" validate="required">
      <el-input v-model.number="addData.defaultUser"></el-input>
    </basic-form-item>
    <WsUploadFile ref="modelUpload"></WsUploadFile>
    <basic-form-item label="描述：">
      <el-input type="textarea" v-model="addData.remark"></el-input>
    </basic-form-item>
  </div>
</template>

<script>
import { getDictChildren } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          name: ''
        }
      }
    },
    vendorId: {
      type: [String, Number]
    },
    title: {
      type: String
    },
    regionId: {
      type: [String, Number]
    }
  },
  data() {
    return {
      imageTypeList: [],
      vmList: []
    }
  },
  methods: {
    getPostData() {
      let data = false
      if (this.$refs.modelUpload.file && this.$refs.modelUpload.uploadSuccess) {
        this.addData.filePath = this.$refs.modelUpload.file.filePath
      } else {
        this.$message.error('请先上传模板！')
        data = true
      }
      return data
    }
  },
  created() {
    getDictChildren({ value: 'IMAGE_FILE_TYPE' }).then(data => {
      if (data.success) {
        this.imageTypeList = data.data
        this.$set(this.addData, 'osType', data.data[0].value)
      }
    })
  }
}
</script>

<style scoped></style>

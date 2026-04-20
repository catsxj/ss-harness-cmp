<template>
  <div>
    <el-form-item label="创建方式">
      <el-radio-group v-model="way" size="small" @change="chooseRegion1">
        <el-radio :label="item.value" border v-for="(item, index) in createWays" :key="index">{{ item.name }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <basic-form-item label="名称" prop="name" validate="required,hicNoChinese" required-message="请输入名称">
      <el-input v-model="addData.name"></el-input>
    </basic-form-item>
    <basic-form-item label="公钥" v-if="way == 'daoru'" prop="publicKey" validate="required" required-message="请输入公钥" :maxlength="10000">
      <el-input type="textarea" v-model="addData.publicKey"></el-input>
    </basic-form-item>
  </div>
</template>

<script>
/* global $ */
import { getRegion } from 'services/platform/index'
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
    }
  },
  data() {
    return {
      regionData: [],
      createWays: [
        { name: '创建密钥', value: 'create', isRegionActive: true },
        {
          name: '导入密钥',
          value: 'daoru',
          isRegionActive: false
        }
      ],
      way: 'create'
    }
  },
  methods: {
    getRegion() {
      getRegion({ condition: 'listRegionByBusiness', vendorId: this.addData.vendorId }).then(data => {
        if (data.success) {
          this.regionData = data.data
        }
      })
    },
    chooseRegion1(item) {
      this.addData.name = ''
      this.addData.publicKey = ''
    },
    // 导入密钥
    change() {
      const that = this
      const data = $('.file')[0].files[0]
      // 对文件大小和类型进行过滤
      const arr = data.name.split('.')
      if (['pem', 'pub'].indexOf(arr[arr.length - 1]) == -1) {
        this.$notify({
          title: '提示',
          message: '请上传此类型的文件，【.pem，.pub】',
          type: 'error'
        })
        return
      }
      if (data.size > 1024 * 1024) {
        this.$notify({
          title: '提示',
          message: '文件大小超过1M',
          type: 'error'
        })
        return
      }
      if (data) {
        // 将文件进行转码，转换为text
        const reader = new FileReader()
        reader.readAsText(data)
        reader.onload = function (f) {
          const data = this.result
          that.$set(that.addData, 'publicKey', data)
        }
      }
    }
  },
  created() {
    this.getRegion()
  }
}
</script>

<style scoped></style>

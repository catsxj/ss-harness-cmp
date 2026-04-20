<template>
  <el-dialog :title="addData.data.id ? '编辑配件规格' : '新增配件规格'" :close-on-click-modal="false" :visible.sync="addData.visible" width="800px">
    <basic-form :model="addData.data" ref="addData" inline label-width="140px">
      <basic-form-item label="名称：" prop="name" validate="required">
        <el-input class="w" v-model="addData.data.name"></el-input>
      </basic-form-item>
      <basic-form-item label="配件类型：" prop="partType" validate="required">
        <el-input class="w" v-model="addData.data.partType"></el-input>
      </basic-form-item>
      <basic-form-item label="品牌：" prop="brandId" validate="required">
        <el-select class="w" v-model="addData.data.brandId" placeholder="请选择品牌">
          <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="配件号：" prop="partNumber" validate="required">
        <el-input class="w" v-model="addData.data.partNumber"></el-input>
      </basic-form-item>
      <basic-form-item label="规格：" prop="spec" validate="required">
        <el-input class="w" v-model="addData.data.spec"></el-input>
      </basic-form-item>
      <basic-form-item label="适配机型：" prop="compatibleModels">
        <el-select class="w" v-model="addData.data.compatibleModels" placeholder="从服务器规格中选择型号关联">
          <el-option v-for="item in serverModelsList" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="性能指标：" prop="performanceMetrics" validate="required">
        <el-input class="w" v-model="addData.data.performanceMetrics"></el-input>
      </basic-form-item>
      <basic-form-item label="通道数量：" prop="channelCount" validate="required">
        <el-input-number class="w" v-model="addData.data.channelCount" :min="0" :precision="0"> </el-input-number>
      </basic-form-item>
      <basic-form-item label="接口数量：" prop="interfaceCount" validate="required">
        <el-input-number class="w" v-model="addData.data.interfaceCount" :min="0" :precision="0"> </el-input-number>
      </basic-form-item>
      <basic-form-item label="单价(元/天）：" prop="price" validate="required">
        <el-input-number class="w" v-model="addData.data.price" :min="0" :precision="5"> </el-input-number>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.visible = false">取消</el-button>
      <el-button type="primary" @click.native="handleSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createParts, modifyParts, getBrand, getServerModels } from 'services/services/physicalSpec.js'
export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false,
      brandList: [],
      serverModelsList: []
    }
  },
  created() {
    this.getBrandList()
    this.getServerModels()
  },
  methods: {
    async getBrandList() {
      const data = await getBrand({
        page: 1,
        rows: 999
      })
      if (!data.success) return
      this.brandList = data.data.rows
    },
    async getServerModels() {
      const data = await getServerModels({
        page: 1,
        rows: 999
      })
      if (!data.success) return
      this.serverModelsList = data.data
    },
    handleSubmit() {
      this.$refs.addData.validate(async (valid) => {
        if (valid) {
          const http = this.addData.data.id ? modifyParts : createParts
          this.loading = true
          const data = await http(this.addData.data).finally(() => (this.loading = false))
          if (!data.success) return
          this.$message.success(data.message)
          this.addData.visible = false
          this.$emit('success')
        }
      })
    }
  }
}
</script>

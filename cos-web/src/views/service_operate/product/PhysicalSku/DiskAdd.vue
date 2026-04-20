<template>
  <el-dialog :title="addData.data.id ? '编辑硬盘规格' : '新增硬盘规格'" :close-on-click-modal="false" :visible.sync="addData.visible" width="800px">
    <basic-form :model="addData.data" ref="addData" inline label-width="140px">
      <basic-form-item label="名称：" prop="name" validate="required">
        <el-input class="w" v-model="addData.data.name"></el-input>
      </basic-form-item>
      <basic-form-item label="品牌：" prop="brandId" validate="required">
        <el-select class="w" v-model="addData.data.brandId" placeholder="请选择品牌">
          <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="配件号：" prop="partNumber" validate="required">
        <el-input class="w" v-model="addData.data.partNumber"></el-input>
      </basic-form-item>
      <basic-form-item label="硬盘类型：" prop="diskType" validate="required">
        <el-input class="w" v-model="addData.data.diskType" placeholder="请选择类型"> </el-input>
      </basic-form-item>
      <basic-form-item label="容量(TB）：" prop="capacity" validate="required">
        <el-input-number class="w" v-model="addData.data.capacity" :min="0" :precision="1"> </el-input-number>
      </basic-form-item>
      <basic-form-item label="尺寸(英寸）：" prop="sizeInch" validate="required">
        <el-input-number class="w" v-model="addData.data.sizeInch" :min="0" :precision="1"> </el-input-number>
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
import { createDisk, modifyDisk, getBrand } from 'services/services/physicalSpec.js'
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
      brandList: []
    }
  },
  created() {
    this.getBrandList()
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
    handleSubmit() {
      this.$refs.addData.validate(async (valid) => {
        if (valid) {
          const http = this.addData.data.id ? modifyDisk : createDisk
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

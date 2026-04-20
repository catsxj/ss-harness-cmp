<template>
  <div>
    <basic-form-item label="数据盘：" class="m-b-lg">
      <el-row>
        <el-col :span="24">
          <el-button type="text" @click.native="addItem()">添加数据盘</el-button>
          <span style="font-size: 12px; margin-left: 32px">您已选择{{ addData.configs.dataDisk.length || 0 }}块盘，还可以选择{{ 4 - (addData.configs.dataDisk.length || 0) }}块盘</span>
        </el-col>
        <el-col :span="24" v-for="(cell, index) in addData.configs.dataDisk" :key="index" class="m-t disk-cell">
          <el-select v-model="cell.dataDiskCategory" class="w m-r-xs">
            <el-option :label="item.name" v-for="(item, index) in categoryData" :key="index" :value="item.value"></el-option>
          </el-select>
          <el-input-number type="number" class="w" v-model="cell.dataDiskSize" :min="cell.min || 0" :max="cell.max" :precision="0" :step="10"> </el-input-number>
          <!-- <el-button class="m-l-sm" type="danger" icon="el-icon-minus" @click="removeItem(index)"></el-button> -->
          <i class="el-icon-close" @click="removeItem(index)"></i>
        </el-col>
      </el-row>
    </basic-form-item>
  </div>
</template>
<script>
export default {
  props: {
    addData: {
      type: Object
    },
    categoryData: {
      type: Array
    }
  },
  data() {
    return {
      disks: []
    }
  },
  created() {},
  watch: {
    categoryData() {
      this.addData.configs.dataDisk.forEach(item => {
        item.dataDiskCategory = this.categoryData[0].value
      })
    }
  },
  methods: {
    setDevice(value) {
      let flag = false
      // 数字不能开头
      // 不能是纯/ 也不能以/dev或者/boot开头
      const reg = /^[/a-zA-Z][a-zA-Z0-9_-]*$/
      if ((value == '/' || new RegExp('^/dev').test(value) || new RegExp('^/boot').test(value) || !reg.test(value)) && value) {
        flag = true
      }
      return flag
    },
    removeItem(index) {
      this.addData.configs.dataDisk.splice(index, 1)
    },
    addItem() {
      if (this.addData.configs.dataDisk.length === 4) return this.$message.error('数据盘最多可增加四个')
      const result = {
        dataDiskCategory: this.categoryData[0].value,
        dataDiskSize: 10
      }
      this.addData.configs.dataDisk.push(result)
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 200px !important;
}
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
.disk-cell {
  padding: 20px;
  background-color: #f5f7fb;
  position: relative;
  .el-icon-close {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 20px;
    cursor: pointer;
  }
}
</style>

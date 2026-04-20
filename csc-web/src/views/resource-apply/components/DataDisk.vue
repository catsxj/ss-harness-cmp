<template>
  <div>
    <basic-form-item label="磁盘类型：" required>
      <el-radio-group v-model="item.categoryId" @change="getSku(item)">
        <el-radio-button :label="item.id" v-for="(item, index) in item.categoryList" :key="index">{{ item.name }}</el-radio-button>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="数据盘：" validate="required" class="m-b-lg">
      <el-select v-model="item.skuId" class="w">
        <el-option :label="generateSpec(cell.spec)" v-for="cell in item.skuList" :key="cell.id" :value="cell.id"></el-option>
      </el-select>
    </basic-form-item>
  </div>
</template>
<script>
import { generateSpec } from 'views/resource-apply/utils/index'
export default {
  props: {
    item: {
      type: Object
    },
    getSku: {
      type: Function
    }
  },
  setup() {
    return {
      generateSpec
    }
  }
}
</script>

<template>
  <CardLayout title="成功条件">
    <basic-form :model="itemData" label-width="0" ref="form">
      <basic-table :data="itemData.conditions" class="target-table">
        <el-table-column label="节点名称" prop="name" width="80px" show-overflow-tooltip=""> </el-table-column>
        <!--<el-table-column label="数据来源">-->
        <!--<template slot-scope="scope">-->
        <!--<el-select filterable v-model="scope.row.source" :disabled="isPreview" @change="selectSource(scope.row, scope.$index)">-->
        <!--<el-option label="执行结果" value="result"></el-option>-->
        <!--<el-option label="执行数据" value="data"></el-option>-->
        <!--</el-select>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column label="输入字段">-->
        <!--<template slot-scope="scope">-->
        <!--<basic-form-item class="m-b-none" :prop="'conditions.'+scope.$index+'.key'" validate="required"-->
        <!--required-message="请填写输入字段">-->
        <!--<el-input v-model="scope.row.key" :disabled="isPreview || scope.row.source ===  'result'"></el-input>-->
        <!--</basic-form-item>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column label="比较关系">-->
        <!--<template slot-scope="scope">-->
        <!--<basic-form-item class="m-b-none">-->
        <!--<el-select filterable v-model="scope.row.relation" :disabled="isPreview || scope.row.source ===  'result'">-->
        <!--<el-option v-for="item in relationList" :key="item.value" :label="item.name"-->
        <!--:value="item.value"></el-option>-->
        <!--</el-select>-->
        <!--</basic-form-item>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column label="执行结果">
          <template slot-scope="scope">
            <basic-form-item class="m-b-none" :prop="'conditions.' + scope.$index + '.value'" validate="required">
              <el-select filterable v-model="scope.row.value" :disabled="isPreview">
                <el-option label="成功" :value="true"></el-option>
                <el-option label="失败" :value="false"></el-option>
              </el-select>
            </basic-form-item>
          </template>
        </el-table-column>
        <el-table-column label="运算关系">
          <template slot-scope="scope">
            <basic-form-item class="m-b-none">
              <el-select filterable v-model="scope.row.link" :disabled="isPreview">
                <el-option label="或者" value="OR"></el-option>
                <el-option label="并且" value="AND"></el-option>
              </el-select>
            </basic-form-item>
          </template>
        </el-table-column>
        <el-table-column label="操作" v-if="!isPreview">
          <template slot-scope="scope">
            <el-button type="text" :disabled="scope.$index === 0" @click="moveItem(scope.$index, 'up')">上移</el-button>
            <el-button type="text" :disabled="scope.$index === itemData.conditions.length - 1" @click="moveItem(scope.$index, 'down')">下移</el-button>
          </template>
        </el-table-column>
        <div slot="pagination"></div>
      </basic-table>
    </basic-form>
  </CardLayout>
</template>
<script>
import show from '../mixins/show'
import index from '../mixins/index'

export default {
  mixins: [index, show],
  props: {
    currentNode: {
      type: Object
    }
  },
  data() {
    return {}
  },
  computed: {
    itemData() {
      return this.currentNode.input.fronts || { conditions: [] }
    }
  },
  created() {},
  methods: {
    moveItem(index, type) {
      const item = this.itemData.conditions.splice(index, 1)
      const operateType = {
        up: index - 1,
        down: index + 1
      }
      this.itemData.conditions.splice(operateType[type], 0, ...item)
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          data = { fronts: this.itemData }
        }
      })
      return data
    }
  }
}
</script>
<style></style>

<template>
  <div>
    <el-row>
      <el-transfer filterable v-model="data.value" :props="data.props" :data="data.list" :titles="['未选择', '已选择']"> </el-transfer>
    </el-row>
    <el-row style="margin: 30px 0 0">
      <el-col :span="12">
        <basic-form :model="formData" ref="addData">
          <el-form-item :label="$store.getters.systemConfig.projectConfigLabel + '经理:'">
            <el-select v-model="formData.value" multiple placeholder="请选择" collapse-tags clearable>
              <el-option v-for="item in getProjectManger()" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
        </basic-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    formData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    getProjectManger() {
      return function () {
        const arr = []
        this.data.value.forEach(item => {
          this.data.list.forEach(it => {
            if (item === it.id) {
              const obj = {
                name: it.name,
                id: it.id,
                checked: it.projectManager
              }
              arr.push(obj)
            }
          })
        })
        return arr
      }
    }
  },
  methods: {
    getPostData() {
      const managerIds = this.formData.value
      const list = this.getProjectManger().map(item => item.id)
      list.forEach((item, index) => {
        managerIds.forEach(it => {
          if (item === it) {
            list.splice(index, 1)
          }
        })
      })
      return {
        userIds: list,
        managerIds
      }
    }
  }
}
</script>

<style scoped lang="scss">
.el-transfer {
  margin-left: 20px;
  ::v-deep .el-transfer-panel {
    width: 276px;
    height: 340px;
    .el-checkbox-group {
      height: 240px;
    }
  }
  ::v-deep .el-transfer__buttons {
    width: 45px;
    .el-button {
      margin-left: 0;
    }
  }
}
</style>

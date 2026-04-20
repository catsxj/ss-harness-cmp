<template>
  <div>
    <basic-form>
      <!-- <el-select style="width: 300px;" v-model="apiGrantData.module" placeholder="请选择服务" :loading="loading" @change="changeModule">
          <el-option v-for="item in modulesData" :key="item.value" :label="item.name" :value="item.value">
          </el-option>
        </el-select> -->
      <!-- <el-button class="m-l" type="primary" @click="apiGrantSubmit()"><i class="el-icon-plus"></i>提交</el-button> -->
      <el-row class="m-t" :gutter="10" v-loading="loading">
        <el-col :span="12">
          <!-- <el-checkbox v-model="apiGrantData.selectAll" @change="selectAll">全选</el-checkbox> -->
          <el-tree ref="apitree" :expand-on-click-node="false" :data="modulesData" node-key="pattern" :props="{ label: 'label', children: 'value' }" @check-change="changeCheckApi">
            <span slot-scope="{ node }">
              <span :class="node.label.indexOf(':') > -1 ? 'custom-tree-node' : ''">{{ node.label.split(':')[0] }}</span
              ><span>: {{ node.label.split(':')[1] }}</span>
            </span>
          </el-tree>
        </el-col>
      </el-row>
    </basic-form>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { getModules, getModulesByName, getApiById, updateApi } from 'services/system/role'

export default {
  data() {
    return {
      loading: false,
      apiGrantData: {
        apis: []
      },
      modulesData: [], // 服务列表
      modulesList: [], // 服务下api列表
      apisById: [] // 当前角色已授权api
    }
  },
  computed: {
    ...mapState({
      userData: (state) => state.app.userData
    })
  },
  created() {
    this.handleApi()
  },
  methods: {
    handleApi() {
      this.apiGrantData = {
        apis: [],
        selectAll: false
      }
      this.modulesList = []
      this.getModules()
    },
    async getModules() {
      this.loading = true
      const data = await getModules()
      if (data.success) {
        this.loading = false
        this.modulesData = data.data
        this.modulesData.forEach((item) => {
          item.label = item.name
          item.value.forEach((a) => {
            a.label = a.name
            a.value.forEach((b) => {
              b.label = `${b.method}: ${b.operation} (${b.url})`
            })
          })
        })
        // if (this.modulesData.length) {
        //   this.$set(this.apiGrantData, 'module', this.modulesData[0].value)
        //   this.changeModule(this.apiGrantData.module)
        // }
      }
    },
    async changeModule(value) {
      this.modulesList = []
      this.apiGrantData.selectAll = false
      this.apiGrantData.apis = []
      this.loading = true
      getModulesByName(value).then((data) => {
        if (data.success) {
          this.loading = false
          this.modulesList = data.data
          this.modulesList.forEach((item) => {
            // item.disabled = true
            item.label = item.name
            item.value.forEach((target) => {
              target.label = `${target.method}: ${target.operation} (${target.url})`
            })
          })
        }
      })
    },
    changeCheckApi(obj, isChecked, data3) {
      if (isChecked) {
        this.apiGrantData.apis.push(obj)
      } else {
        const index = this.apiGrantData.apis.indexOf(obj.pattern)
        if (index != -1) {
          this.apiGrantData.apis.splice(index, 1)
        }
      }
    },
    selectAll(value) {
      const arr = []
      if (value) {
        this.modulesList.forEach((item) => {
          item.value.forEach((target) => {
            arr.push(target.pattern)
          })
        })
      }
      this.$refs.apitree.setCheckedKeys(arr)
    },
    apiGrantSubmit() {
      const that = this
      const nodes = this.$refs.apitree.getCheckedNodes()
      const { id, module } = that.apiGrantData
      const apis = []
      nodes.forEach((item) => {
        if (!item.value) {
          apis.push(item)
        }
      })
      this.loading = true
      updateApi(id, { apis, module: module }).then((data) => {
        if (data.success) {
          this.$message({
            message: data.message,
            type: 'success'
          })
          // 更新路由
          this.$store.dispatch('permission/ChangeRoutes')
          this.getList()
        }
        this.loading = false
      })
    }
  }
}
</script>

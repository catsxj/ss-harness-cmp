<template>
  <div>
    <el-row>
      <el-transfer v-loading="loadLoading" v-model="addData.value" :props="props" :data="addData.data" :titles="['未选择', '已选择']">
        <div slot="left-footer">
          <el-input v-model="name" placeholder="请输入用户名进行搜索">
            <el-button slot="append" icon="el-icon-search" @click="getLeft"></el-button>
          </el-input>
        </div>
      </el-transfer>
    </el-row>
    <el-row style="margin: 30px 0 0">
      <el-col :span="12">
        <basic-form :model="addData" ref="addData">
          <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '经理: '" validate="required" prop="mangerIds">
            <el-select v-model="addData.mangerIds" multiple placeholder="请选择" collapse-tags clearable>
              <el-option v-for="item in getProjectManger" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
        </basic-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getUser } from 'services/system/user'
import { settingProjectUser } from 'services/system/project'

const mergeAndDeduplicate = (arr1, arr2) => {
  const combined = [...arr1, ...arr2]
  const unique = combined.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
  return unique
}
export default {
  props: {
    config: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      props: {
        key: 'id',
        label: 'name'
      },
      addData: {
        value: [],
        hasData: [],
        data: [],
        mangerIds: []
      },
      userParams: {
        page: 1,
        rows: 50
      },
      name: '',
      loading: false,
      loadLoading: false
    }
  },
  computed: {
    getProjectManger() {
      return this.addData.data.filter(({ id }) => this.addData.value.includes(id))
    }
  },
  created() {
    // this.getRight()
    this.getLeft()
  },
  methods: {
    // async getRight() {
    //   const res = await getProjectMemberInList(this.config.id)
    //   if (res.success) {
    //     this.addData.value = res.data.map((item) => item.id)
    //     this.addData.hasData = res.data.map(({ id, name }) => ({ id, name }))
    //     this.addData.mangerIds = res.data.filter((item) => item.projectManager).map((item) => item.id)
    //     this.addData.data = mergeAndDeduplicate(this.addData.hasData, this.addData.data)
    //   }
    // },
    async getLeft() {
      this.userParams.params = this.$tools.handleSearchParam({ 'name:LK': this.name })
      this.loadLoading = true
      const res = await getUser(this.userParams).finally(() => {
        this.loadLoading = false
      })
      if (res.success && res.data) {
        this.addData.data = mergeAndDeduplicate(
          res.data.rows.map(({ id, name }) => ({ id, name })),
          this.addData.hasData
        )
      }
    },
    getPostData() {
      let data = false
      this.$refs.addData.validate((valid) => {
        if (valid) {
          const managerIds = this.addData.mangerIds
          const userIds = this.addData.value.filter((item) => !managerIds.includes(item))
          data = {
            managerIds,
            userIds
          }
        }
      })
      return data
    },
    async handleSubmit() {
      const managerIds = this.addData.mangerIds
      // 剔除应用系统经理
      const userIds = this.addData.value.filter((item) => !managerIds.includes(item))
      this.loading = true
      const res = await settingProjectUser(this.config.id, { userIds, managerIds }).finally(() => {
        this.loading = false
      })
      if (res.success) {
        this.$message.success(res.message)
        this.$emit('success')
        this.config.visibility = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.el-transfer {
  display: flex;
  justify-content: center;
  align-items: center;
  ::v-deep .el-transfer__buttons {
    width: 50px;
    box-sizing: content-box;
    .el-button {
      margin-left: 0;
    }
  }
  ::v-deep .el-transfer-panel {
    width: 250px;
    .is-with-footer {
      padding-top: 50px;
      padding-bottom: 0;
    }
    .el-transfer-panel__item {
      z-index: 10;
    }
    .el-transfer-panel__footer {
      position: absolute;
      top: 50px;
      border: none;
      margin: 0 15px;
      width: auto;
      text-align: center;
      display: block;
      .el-input__inner {
        height: 32px;
        width: 100%;
        font-size: 12px;
        display: inline-block;
      }
    }
  }
}
</style>

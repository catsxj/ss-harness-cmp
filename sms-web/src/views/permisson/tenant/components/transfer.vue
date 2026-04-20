<template>
  <el-dialog title="用户管理" :visible.sync="config.visible" width="800px">
    <el-transfer v-loading="loadLoading" v-model="addData.value" :props="props" :data="addData.data" :titles="['未选择', '已选择']">
      <div slot="left-footer">
        <el-input v-model="name" placeholder="请输入用户名进行搜索">
          <el-button slot="append" icon="el-icon-search" @click="getLeft"></el-button>
        </el-input>
      </div>
    </el-transfer>
    <span slot="footer" class="dialog-footer">
      <el-button @click="config.visible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { tenantCongigUser, getTenantUserTrans } from 'services/system/tenant'
import { getUser } from 'services/system/user'

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
        data: []
      },
      userParams: {
        page: 1,
        rows: 50
      },
      name: '',
      loadLoading: false
    }
  },
  created() {
    this.getRight()
    this.getLeft()
  },
  methods: {
    async getRight() {
      const res = await getTenantUserTrans(this.config.id, { page: 1, rows: 99999 })
      if (res.success) {
        this.addData.value = res.data.map((item) => item.id)
        this.addData.hasData = res.data.map(({ id, name }) => ({ id, name }))
        this.addData.data = mergeAndDeduplicate(this.addData.hasData, this.addData.data)
      }
    },
    async getLeft() {
      this.userParams.params = this.$tools.handleSearchParam({ 'tenantId:EQ': 0, 'name:LK': this.name })
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
    handleSubmit() {
      const params = {
        id: this.config.id,
        ids: this.addData.value
      }
      tenantCongigUser(params).then((res) => {
        if (res.success) {
          this.$emit('success')
          this.$message.success(res.message)
          this.config.visible = false
        }
      })
    },
    getPostData() {
      return {
        groupIds: this.config.value
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

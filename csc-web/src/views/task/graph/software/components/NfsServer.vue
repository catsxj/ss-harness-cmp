<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="24">
        <basic-form-item label="共享路径：">
          <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addItem(itemData.nfs_server.nfs_exports)">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <div class="search-container" v-for="(item, index) in itemData.nfs_server.nfs_exports" :key="index">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.nfs_server.nfs_exports, index, 'required')">
        <i class="el-icon-delete" />
      </el-button>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="共享路径：" :prop="`nfs_server.nfs_exports.${index}.path`" validate="required">
            <el-input v-model="item.path"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="共享网段：" placeholder="192.168.1.1/24" :prop="`nfs_server.nfs_exports.${index}.network`" validate="required,cidr">
            <el-input v-model="item.network" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="读写权限：">
            <el-radio-group v-model="item.auth1">
              <el-radio label="rw">读写</el-radio>
              <el-radio label="ro">只读</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="同步权限：">
            <el-radio-group v-model="item.auth2">
              <el-radio label="sync">同步</el-radio>
              <el-radio label="async">异步</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="子目录权限：">
            <el-radio-group v-model="item.auth3">
              <el-radio label="no_subtree_check">子目录不检查</el-radio>
              <el-radio label="subtree_check">子目录检查</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="其他权限：">
            <el-input v-model="item.auth" placeholder="权限之间以逗号隔开"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </div>
  </basic-form>
</template>
<script>
import { trimEnd } from 'lodash-es'
import node from '../../mixins/index'
import show from '../../mixins/show'

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          nfs_server: {
            nfs_exports: [
              {
                path: '',
                network: '',
                auth: '',
                auth1: 'rw',
                auth2: 'sync',
                auth3: 'no_subtree_check'
              }
            ]
          }
        }
      }
    }
  },
  data() {
    return {
      authList: []
    }
  },
  created() {
    if (typeof this.itemData.nfs_server.nfs_exports[0] === 'string') this.readData(this.itemData.nfs_server.nfs_exports)
  },
  methods: {
    readData(data) {
      const nfsExports = []
      data.forEach(item => {
        const spaceArr = item.split(' ')
        const arr = spaceArr[1].split('(')
        const [auth1, auth2, auth3, ...auth] = trimEnd(arr[1], ')').split(',')
        const obj = {
          path: spaceArr[0],
          network: arr[0],
          auth1,
          auth2,
          auth3,
          auth: auth.join(',')
        }
        nfsExports.push(obj)
      })
      this.$set(this.itemData.nfs_server, 'nfs_exports', nfsExports)
    },
    addItem(row) {
      row.push({
        path: '',
        network: '',
        auth: '',
        auth1: 'rw',
        auth2: 'sync',
        auth3: 'no_subtree_check'
      })
    },
    removeItem(data, index, required) {
      if (required && data.length === 1) {
        this.$message.error('至少存在一个该节点')
        return
      }
      data.splice(index, 1)
    },
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          const nfsExports = []
          this.itemData.nfs_server.nfs_exports.forEach(item => {
            const auth = [item.auth1, item.auth2, item.auth3]
            if (item.auth) auth.push(...item.auth.split(','))
            nfsExports.push(`${item.path} ${item.network}(${auth.join(',')})`)
          })
          data = {
            nfs_server: {
              nfs_exports: nfsExports
            }
          }
        }
      })
      return data
    }
  }
}
</script>
<style lang="scss" scoped>
@import './index';
</style>

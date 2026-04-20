<template>
  <el-dialog title="宿主机选择" :visible.sync="dialog.visible" width="700px" append-to-body>
    <div class="right m-b">
      <el-button type="text" @click="handleOpenHostResourceDialog">点击查看宿主机资源统计</el-button>
    </div>
    <basic-form :model="{}" label-suffix="：" label-width="120px" :disabled="disabled">
      <basic-form-item :label="`云主机${index + 1}`" v-for="(item, index) in serversList" :key="index">
        <el-select class="w m-r inline-block" filterable v-model="item.hostId" @change="hostChange(item, true)" placeholder="请选择宿主机">
          <el-option v-for="i in hostList" :label="i.name" :value="i.id" :key="i.id"></el-option>
        </el-select>
        <el-select class="w m-r" filterable v-model="item.storeId" @change="storeChange(item, true)" :placeholder="dialog.row.subLocation.vendorType === 'CLOUDTOWER' ? '请选择存储策略' : '请选择数据存储'">
          <el-option v-for="i in item.storeList" :label="i.name" :value="i.id" :key="i.id"></el-option>
        </el-select>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="handleSubmit">确定</el-button>
    </div>
    <EFCHostResource :addData="hostResourceDialog" v-if="hostResourceDialog.visible" />
  </el-dialog>
</template>

<script>
import EFCHostResource from './EFCHostResource.vue'
import { conditionPoolQueryByType } from 'services/platform/pool'
import { getDatastoresByHost } from 'services/platform'
import { getVolumeTpl } from 'services/platform/smart'
import { cloneDeep } from 'lodash-es'
export default {
  name: 'EFCHost',
  components: {
    EFCHostResource
  },
  props: {
    dialog: {
      type: Object,
      default: () => ({
        visible: false,
        row: {}
      })
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      hostList: [],
      hostResourceDialog: {
        visible: false,
        poolGroupId: '',
        vendorId: ''
      },
      serversList: []
    }
  },
  created() {
    if (!this.dialog.row.preview) {
      this.dialog.row.preview = {
        hosts: []
      }
    }
    const cloneHosts = cloneDeep(this.dialog.row.preview.hosts)
    this.serversList = Array.from({ length: this.dialog.row.emption.count }, (_, index) => {
      const item = cloneHosts?.[index]
      return {
        hostId: item?.hostId || '',
        hostName: item?.hostName || '',
        storeList: item?.storeList || [],
        storeId: item?.storeId || '',
        storeName: item?.storeName || ''
      }
    })
    this.serversList.map(item => {
      if (item.hostId) {
        // 回显
        this.hostChange(item, false)
      }
    })
    this.getHostList()
  },
  methods: {
    async getHostList() {
      const res = await conditionPoolQueryByType({
        type: 'Host',
        poolGroupId: this.dialog.row.subLocation.poolGroupId
      })
      if (!res.success) return
      this.hostList = res.data
    },
    hostChange(item, manual) {
      item.hostName = this.hostList.find(i => i.id === item.hostId)?.name
      if (manual) {
        this.$set(item, 'storeId', '')
      }
      // 获取数据存储/存储策略
      this.getStoreList(item, manual)
    },
    async getStoreList(item, manual) {
      let http = getDatastoresByHost
      let params = {
        id: item.hostId
      }
      if (this.dialog.row.subLocation.vendorType === 'CLOUDTOWER') {
        http = getVolumeTpl
        params = {
          page: 1,
          rows: 9999,
          params: JSON.stringify([
            {
              param: {
                vendorId: this.dialog.row.subLocation.vendorId
              },
              sign: 'EQ'
            }
          ])
        }
      }
      const res = await http(params)
      if (!res.success) return
      if (this.dialog.row.subLocation.vendorType === 'CLOUDTOWER') {
        item.storeList = res.data.rows.map(item => {
          item.name = item.name + '(' + item.description + ')'
          return item
        })
      } else {
        item.storeList = res.data
      }
      if (manual) {
        this.$set(item, 'storeId', item.storeList[0]?.id || '')
        this.storeChange(item, manual)
      }
    },
    storeChange(item, manual) {
      if (!manual) return
      item.storeName = item.storeList.find(i => i.id === item.storeId)?.name
    },
    handleSubmit() {
      const hosts = cloneDeep(this.serversList)
      // 如果有一个选择,那么全部都要选择
      const everyHasSelect = hosts.every(i => i.hostId && i.storeId)
      const noHasSelect = hosts.every(i => !i.hostId && !i.storeId)
      if (everyHasSelect || noHasSelect) {
        this.$set(
          this.dialog.row.preview,
          'hosts',
          hosts.filter(i => i.hostId && i.storeId)
        )
        if (typeof this.dialog.cb === 'function') this.dialog.cb()
        this.dialog.visible = false
      } else {
        const msg = this.dialog.row.subLocation.vendorType === 'CLOUDTOWER' ? '请选择存储策略' : '请选择数据存储'
        this.$message.warning(msg)
      }
    },
    handleOpenHostResourceDialog() {
      this.hostResourceDialog.visible = true
      this.hostResourceDialog.poolGroupId = this.dialog.row.subLocation.poolGroupId
      this.hostResourceDialog.vendorId = this.dialog.row.subLocation.vendorId
    }
  }
}
</script>

<style lang="scss" scoped>
.right {
  text-align: right;
}
</style>

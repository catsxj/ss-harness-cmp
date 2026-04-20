<template>
  <div>
    <common-detail :setting="detailSetting" :data="data" @goBack="goBack">
      <el-tabs value="four">
        <el-tab-pane label="操作记录" name="four">
          <basic-table :data="operateList" :params="operateParams" :get-list="getOperateList" :total="operateTotal">
            <el-table-column label="操作内容" prop="content" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作结果" prop="result" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作人" prop="operator" show-overflow-tooltip> </el-table-column>
            <el-table-column label="操作时间" prop="gmtOperate" show-overflow-tooltip> </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </div>
</template>

<script>
import { openstackServerColor, openstackServer } from 'filters'
import { getRes } from 'services/platform/index'
const detailSetting = {
  type: 'vm',
  columns: [
    [
      { name: '云主机名', value: 'name' },
      { name: '当前状态', value: 'status', filter: openstackServer, icon: openstackServerColor },
      { name: '宿主机', value: 'hostName' }
    ],
    [
      { name: '所属用户', value: 'targetName' },
      { name: '所属租户', value: 'tenantName' },
      { name: '所属平台', value: 'vendorName' }
    ],
    [
      { name: '创建时间', value: 'gmtCreate' },
      { name: '过期时间', value: 'expiredTime' },
      { name: '配置', value: 'configuration' }
    ],
    [
      { name: '操作系统及版本', value: 'osConfig' },
      { name: '描述', value: 'remark' }
    ]
  ]
}
export default {
  props: {
    data: {
      type: Object
    }
  },
  data() {
    return {
      detailSetting,
      operateList: [],
      operateParams: {
        page: 1,
        rows: 10
      },
      operateTotal: 0,
      Snapshotlist: [],
      Snapshotparams: {
        page: 1,
        rows: 10
      },
      Snapshottotal: 0
    }
  },
  methods: {
    goBack() {
      this.$emit('goBack')
    },
    getOperateList() {
      this.operateParams.params = JSON.stringify([
        {
          param: {
            resourceId: this.data.id,
            vendorId: this.data.vendorId,
            object: 'VM'
          },
          sign: 'EQ'
        }
      ])
      getRes(this.operateParams).then(data => {
        if (data.success) {
          this.operateList = data.data.rows
          this.operateTotal = data.data.total
        }
      })
    }
  },
  created() {
    this.getOperateList()
  }
}
</script>

<style scoped></style>

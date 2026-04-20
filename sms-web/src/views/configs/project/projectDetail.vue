<template>
  <common-detail :title="detailData.name" @goBack="goBack">
    <template v-slot:item_container>
      <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel + '名称'">{{ detailData.name }}</common-detail-item>
      <common-detail-item label="资源属性">{{ handleVisibility(detailData.visibility) }}</common-detail-item>
      <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel + '编号'">{{ detailData.code }}</common-detail-item>
      <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel + '经理'">{{ detailData.managerName }}</common-detail-item>
      <common-detail-item :label="'所属' + $store.getters.systemConfig.serviceConfigLabel">{{ detailData.businessName }}</common-detail-item>
      <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
      <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
    </template>
    <el-tabs value="second">
      <el-tab-pane label="成员列表" name="second">
        <AdvanceTable :card-border="false" class="table" title="" :data="list" :search-configs="searchConfigs" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
          <template #status="status">
            <status-icon :type="generalStatusFilter(status, 'color')">
              {{ generalStatusFilter(status, 'status') }}
            </status-icon>
          </template>
          <template #sex="val"> {{ sexFilter(val) }} </template>
          <template #projectManager="val">
            {{ projectManager(val) }}
          </template>
        </AdvanceTable>
      </el-tab-pane>
    </el-tabs>
  </common-detail>
</template>

<script>
import { getUser } from 'services/system/user'
import { generalStatusFilter, sexFilter } from '@/filters/common'

export default {
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      total: 0,
      columns: [
        { label: '登录账号', prop: 'account' },
        { label: '用户姓名', prop: 'name' },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '角色',
          prop: 'projectManager',
          scopedSlots: { customRender: 'projectManager' }
        },
        { label: '邮箱', prop: 'email' },
        { label: '创建时间', prop: 'gmtCreate' },
        { label: '性别', prop: 'sex', scopedSlots: { customRender: 'sex' } },
        { label: '联系方式', prop: 'mobile' }
      ],
      searchConfigs: [{ type: 'Const', value: 'projectId', sign: 'EQ', initValue: this.detailData.id }],
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  computed: {
    handleVisibility() {
      return function (visibility) {
        if (visibility === 'visible') {
          return '查看权限'
        } else if (visibility === 'invisible') {
          return '无权限'
        } else if (visibility === 'manageable') {
          return '管理权限'
        }
      }
    },
    projectManager() {
      return function (val) {
        return val ? this.$store.getters.systemConfig.projectConfigLabel + '经理' : '成员'
      }
    }
  },
  methods: {
    generalStatusFilter,
    sexFilter,
    async getList() {
      this.loading = true
      const res = await getUser(this.params)
      if (res.success) {
        this.list = res.data.rows
        this.total = res.data.total
      }
      this.loading = false
    },
    goBack() {
      this.detailData.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.name-cell {
  display: flex;
  align-items: center;
  img {
    height: 20px;
  }
}
.table {
  ::v-deep .table-card {
    border-bottom: 0 !important;
    .search-row {
      height: 0;
      overflow: hidden;
    }
  }
}
</style>

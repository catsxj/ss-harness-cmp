<template>
  <div>
    <el-card v-show="!detailFlag">
      <AdvanceTable title="" :search-configs="searchConfigs" :data="tableList" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
        <template #policy="val">
          {{ policy[val] }}
        </template>
        <template #policyCategory="val">
          {{ policyCategory[val] }}
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="bindCluster(record)"> <i class="el-icon-bind"></i> 绑定集群 </el-button>
        </template>
      </AdvanceTable>
    </el-card>
    <bind :add-data="bindObj" v-if="bindObj.dialog"></bind>
  </div>
</template>

<script>
import bind from './bind.vue'
import { getSchedulerPolicy } from 'services/platform/index'
export default {
  components: {
    bind
  },
  data() {
    return {
      searchConfigs: [{ type: 'Input', label: '名称', value: 'name' }],
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '策略',
          prop: 'policy',
          scopedSlots: { customRender: 'policy' }
        },
        {
          label: '策略目标',
          prop: 'policyCategory',
          scopedSlots: { customRender: 'policyCategory' }
        },
        {
          label: '描述',
          prop: 'remark'
        },
        {
          label: '操作',
          prop: 'id',
          disabled: true,
          width: '160px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      detailFlag: false,
      detail: {},
      tableList: [],
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      total: 0,
      category: {
        Cluster: '集群',
        Host: '宿主机'
      },
      policy: {
        focus: '密集型',
        dispersion: '分散性',
        random: '随机'
      },
      bindObj: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    bindCluster(obj) {
      this.bindObj = {
        dialog: true,
        data: {
          id: obj.id,
          clusterIds: []
        }
      }
    },
    goBack() {
      this.detailFlag = false
    },
    add() {
      this.snapshotFlag = true
    },
    getData() {
      this.loading = true
      getSchedulerPolicy(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.tableList = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getData()
    }
  },
  created() {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>

<template>
  <!-- <AdvanceTable :columns="columns" :data="listData" :get-list="getList">
    <template #status="val">{{ val ? '已开启' : '已关闭' }}</template>
    <template #operate="val, record">
      <el-button type="text" @click="editStatus(record.id, record.status)">{{record.status ? '关闭' : '开启'}} </el-button>
    </template>
  </AdvanceTable> -->
  <div class="wrapper">
    <el-row :gutter="10">
      <el-col :span="6" v-for="item in currentData" :key="item.id">
        <el-card :class="item.status ? 'open' : 'close'">
          <div slot="header" class="header">
            <span :style="{ color: item.status ? '#409eff' : '#ed711f' }">{{ item.status ? '已开启' : '已关闭' }}</span>
            <el-switch v-model="item.status" active-color="#409eff" @change="editStatus(item.id, !item.status)"></el-switch>
          </div>
          <p>{{ item.name }}</p>
          <p>{{ item.code }}</p>
        </el-card>
      </el-col>
    </el-row>
    <div class="footer">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="12" :current-page="currentPage" @current-change="getPage"> </el-pagination>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from '@vue/composition-api'
import { getPluginsConfig, updateStatus } from 'services/services/plugins'
import { Message } from 'element-ui'

const columns = [
  {
    label: '插件名称',
    prop: 'name'
  },
  {
    label: '插件编码',
    prop: 'code'
  },
  {
    label: '插件平台',
    prop: 'vendorType'
  },
  {
    label: '插件状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '备注',
    prop: 'remark'
  },
  {
    label: '操作',
    disabled: true,
    width: '200px',
    scopedSlots: { customRender: 'operate' }
  }
]

export default defineComponent({
  setup() {
    const listData = ref([])
    const currentData = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    async function getList() {
      const { data, success } = await getPluginsConfig()
      if (success) {
        listData.value = data
        total.value = data.length
        getPage(currentPage.value)
      }
    }
    getList()
    const editStatus = async (id, status) => {
      const { success, message } = await updateStatus(id, !status)
      if (success) {
        Message.success(message)
        getList()
      }
    }
    const getPage = (val) => {
      currentPage.value = val
      currentData.value = listData.value.filter((item, index) => index >= (val - 1) * 12 && index < val * 12)
    }
    return {
      listData,
      columns,
      total,
      currentData,
      currentPage,
      getList,
      editStatus,
      getPage
    }
  }
})
</script>
<style lang="scss" scoped>
.wrapper {
  padding-bottom: 10px;
}
::v-deep .el-card {
  margin: 10px 0;
  height: 180px !important;
  p:first-child {
    font-weight: 600;
  }
  p:last-child {
    font-size: 14px;
    color: #555;
  }
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close {
  border: 1px solid #ed711f;
}
.open {
  border: 1px solid #409eff;
}
.footer {
  text-align: right;
}
</style>

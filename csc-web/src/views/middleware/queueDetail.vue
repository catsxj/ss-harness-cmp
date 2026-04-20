<template>
  <common-detail :title="dataDetail.name" :data="dataDetail" @goBack="goBack">
    <template #item_container>
      <common-detail-item label="State">
        <status-icon :type="stateFliter(dataDetail.state, 'color')">
          {{ stateFliter(dataDetail.state) }}
        </status-icon>
      </common-detail-item>
      <common-detail-item label="Consumers">{{ dataDetail.consumers }}</common-detail-item>
      <common-detail-item label="Policy">{{ dataDetail.policy }}</common-detail-item>
      <common-detail-item label="Consumer utilisation">{{ dataDetail.consumer_utilisation ? dataDetail.consumer_utilisation : 0 }}%</common-detail-item>
    </template>
    <div class="vm-card">
      <div class="vm-card-header">
        <span class="text-blue">Consumers</span>
        <span class="hide-down pull-right" @click="isShow('flag')">
          <i class="el-icon-arrow-down" style="font-size: 18px" />
        </span>
      </div>
      <div v-show="flag">
        <basic-table :data="dataDetail.consumer_details">
          <el-table-column label="Channel" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.channel_details.name }}
            </template>
          </el-table-column>
          <el-table-column prop="consumer_tag" label="Comsumer tag" show-overflow-tooltip></el-table-column>
          <el-table-column prop="ack_required" label="Ack required" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ JSON.stringify(scope.row.ack_required) }}
            </template>
          </el-table-column>
          <el-table-column prop="exclusive" label="Exclusive" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ JSON.stringify(scope.row.exclusive) }}
            </template>
          </el-table-column>
          <el-table-column prop="prefetch_count" label="Prefetch count" show-overflow-tooltip></el-table-column>
          <el-table-column prop="arguments" label="Arguments" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="Object.keys(scope.row.arguments).length != 0">{{ scope.row.arguments }}</span>
            </template>
          </el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </div>
    </div>
  </common-detail>
</template>
<script>
import { stateFliter } from 'filters'
export default {
  props: {
    dataDetail: {
      type: Object
    }
  },
  data() {
    return {
      flag: true
    }
  },
  methods: {
    stateFliter,
    goBack() {
      this.$emit('goBackDetail', 'queueDetailFlag')
    },
    isShow(flag) {
      this[flag] = !this[flag]
    }
  }
}
</script>
<style scoped lang="scss">
.vm-card {
  -webkit-transition: 0.3s;
  transition: 0.3s;
  border: 1px solid #dcdfe6 !important;
  margin-bottom: 10px;
  .vm-card-header {
    padding: 10px 20px !important;
    border-bottom: 1px solid #ebeef5;
  }
  .text-blue {
    color: #409eff;
  }
}
</style>

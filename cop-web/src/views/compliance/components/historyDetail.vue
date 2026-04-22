<template>
  <el-card class="patch_history">
    <common-detail @goBack="back" :title="dialog.data.name">
      <div slot="detail_header" class="pull-right">
        <el-button type="primary" @click="getRecordById('pdf')">PDF导出</el-button>
        <el-button type="primary" @click="getRecordById('excel')">EXCEL导出</el-button>
      </div>
      <template #item_container>
        <el-row class="patch_header">
          <el-col :span="6" class="left">
            <el-row :gutter="20" type="flex">
              <el-col>
                <div v-for="(item, index) in headerList" :key="index">
                  <span class="item_label">{{item.name}}:</span>
                  <span class="item_value" :title="dialog.data[item.code]">{{dialog.data[item.code]}}</span>
                </div>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="18" class="right">
            <div class="item">
              <div class="top">检查服务器数量</div>
              <div class="bottom color">{{dialog.data.hostNum || 0}}</div>
            </div>
            <el-divider direction="vertical" class="line"></el-divider>
            <div class="item">
              <div class="top">基线检查项</div>
              <div class="bottom color">{{dialog.data.itemNum || 0}}</div>
            </div>
            <el-divider direction="vertical" class="line"></el-divider>
            <div class="item">
              <div class="top">不合规服务器数</div>
              <div class="bottom failColor">{{dialog.data.noPassHostNum || 0}}</div>
            </div>
            <el-divider direction="vertical" class="line"></el-divider>
            <div class="item">
              <div class="top">不合规基线项数</div>
              <div class="bottom failColor">{{dialog.data.noPassItemNum || 0}}</div>
            </div>
            <el-divider direction="vertical" class="line"></el-divider>
            <div class="item">
              <div class="top">合规通过率</div>
              <div class="bottom" :class="getStatusColor(dialog.data.passRates)">{{dialog.data.passRates || 0}}%</div>
            </div>
          </el-col>
        </el-row>
        <el-row class="patch-content">
          <el-tabs v-model="activeName" @tab-click="resetData">
            <el-tab-pane name="itemDetail">
              <span slot="label"><i class="el-icon-tickets"></i>基线详情</span>
              <history-bottom-table ref="itemDetail" v-if="activeName === 'itemDetail'" :id="dialog.id" :type="activeName"></history-bottom-table>
            </el-tab-pane>
            <el-tab-pane name="hostDetail">
              <span slot="label"><i class="el-icon-tickets"></i>设备详情</span>
              <history-bottom-table ref="hostDetail" v-if="activeName === 'hostDetail'" @changeTab="changeTab" :id="dialog.id" :type="activeName"></history-bottom-table>
            </el-tab-pane>
            <el-tab-pane name="complianceDetail">
              <span slot="label"><i class="el-icon-tickets"></i>合规详情</span>
              <history-bottom-table ref="complianceDetail" v-if="activeName === 'complianceDetail'" :id="dialog.id" :type="activeName" :filterData="searchData"></history-bottom-table>
            </el-tab-pane>
            <el-tab-pane name="errorDetail">
              <span slot="label"><i class="el-icon-tickets"></i>错误详情</span>
              <history-bottom-table ref="errorDetail" v-if="activeName === 'errorDetail'" :id="dialog.id" :type="activeName" :filterData="searchData"></history-bottom-table>
            </el-tab-pane>
          </el-tabs>
        </el-row>
      </template>
    </common-detail>
  </el-card>
</template>

<script>
import { headerList } from '../utils/index'
import HistoryBottomTable from './historyBottomTable.vue'
import { downloadTpl } from 'services/task/compliance'
export default {
  components: {
    HistoryBottomTable
  },
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      headerList,
      activeName: 'itemDetail',
      searchData: {}
    }
  },
  created() {},
  methods: {
    back() {
      this.dialog.show = false
    },
    getStatusColor(data) {
      const parseData = parseFloat(data)
      if (parseData <= 60) {
        return 'failColor'
      } else if (parseData > 60 && parseData <= 80) {
        return 'warningColor'
      } else {
        return 'successColor'
      }
    },
    resetData(data) {
      this.searchData = {}
    },
    // 导出
    getRecordById(type) {
      const id = this.dialog.id
      downloadTpl(id, type)
    },
    changeTab(activeName, ip, type) {
      this.searchData = { ip, type }
      this.activeName = activeName
    }
  }
}
</script>

<style lang="scss" scoped>
.patch_history {
  background: #fff;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 99;

  .patch_header {
    padding: 20px;
    .left {
      .img_container {
        width: 100px;
        text-align: center;
        vertical-align: middle;
      }
      .item_label {
        display: inline-block;
        font-size: 13px;
        height: 20px;
        line-height: 20px;
        color: #999;
        width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item_value {
        font-size: 13px;
        color: #333;
        display: inline-block;
        white-space: nowrap;
        width: calc(100% - 140px);
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .right {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      .line {
        height: 60px;
      }
      .color {
        color: #409eff;
      }
      .successColor {
        color: #67c23a;
      }
      .failColor {
        color: #f56c6c;
      }
      .warningColor {
        color: #e6a23c;
      }
      .item {
        margin: 20px 0;
        height: 60px;
        text-align: center;
        .top {
          height: 30px;
        }
        .bottom {
          font-size: 24px;
        }
      }
    }
  }

  .patch-content {
    padding: 0 20px;
    height: 100%;
  }
}
</style>

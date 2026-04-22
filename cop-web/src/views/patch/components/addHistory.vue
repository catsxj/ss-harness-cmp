<template>
  <div class="patch_history">
    <common-detail @goBack="back" title="补丁历史">
      <div slot="detail_header" class="pull-right">
        <el-button type="primary" @click="down('pdf')">PDF导出</el-button>
        <el-button type="primary" @click="down('excel')">EXCEL导出</el-button>
      </div>
      <template #item_container>
        <el-row class="patch_header">
          <el-col :span="8" class="left">
            <el-row :gutter="20" type="flex">
              <el-col :offset="1">
                <div v-for="(item, index) in headerList" :key="index">
                  <span class="item_label">{{item.name}}:</span>
                  <span class="item_value" :title="list[item.code]">{{dialog.data[item.code]}}</span>
                </div>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="16" class="right">
            <div class="item">
              <div class="top">服务器数量</div>
              <div class="bottom color">{{dialog.data['serveNum']}}</div>
            </div>
            <el-divider direction="vertical" class="line"></el-divider>
            <div class="item">
              <div class="top">补丁数量</div>
              <div class="bottom color">{{dialog.data['patchNum']}}</div>
            </div>
            <el-divider direction="vertical" class="line"></el-divider>
            <div class="item">
              <div class="top">安装失败的服务器数量</div>
              <div class="bottom failColor">{{dialog.data['failNum']}}</div>
            </div>
            <el-divider direction="vertical" class="line"></el-divider>
            <div class="item">
              <div class="top">安装成功的服务器数量</div>
              <div class="bottom successColor">{{dialog.data['successNum']}}</div>
            </div>
          </el-col>
        </el-row>
        <el-row class="patch-content">
          <el-tabs v-model="activeName">
            <el-tab-pane name="detail">
              <span slot="label"><i class="el-icon-tickets"></i>安装详情</span>
              <AdvanceTable :data="list" :searchConfigs="historyDetailSearchConfigs" :params="params" :total="total" :columns="historyDetailColumns" :get-list="getData" :loading="loading" ref="table">
                <template #status="status">
                  <el-tag v-if="status === 'success'" type="success">
                    {{status | statusText}}
                  </el-tag>
                  <el-tag v-else type="danger">
                    {{status | statusText}}
                  </el-tag>
                </template>
                <template #errorInfo="errorInfo">
                  <span v-html="errorInfo"></span>
                </template>
              </AdvanceTable>
            </el-tab-pane>
          </el-tabs>
        </el-row>
      </template>
    </common-detail>
  </div>
</template>

<script>
import { headerList } from '../utils/index'
import { getPatchDetailList, downloadTpl } from 'services/task/patch'
import { historyDetailColumns } from '../config'

export default {
  components: {},
  props: {
    dialog: {
      type: Object,
      required: true
    }
  },
  filters: {
    statusText(val) {
      switch (val) {
        case 'success':
          return '成功'
        case 'fail':
          return '失败'
      }
    }
  },
  data() {
    return {
      historyDetailColumns,
      historyDetailSearchConfigs: [
        {
          label: '名称',
          value: 'hostIp',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '补丁名称',
          value: 'patchName',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '状态',
          value: 'status',
          type: 'Select',
          sign: 'EQ',
          data: [
            {
              id: 'success',
              name: '成功'
            },
            {
              id: 'fail',
              name: '失败'
            }
          ]
        },
        {
          label: '报错信息',
          value: 'errorInfo',
          type: 'Input',
          sign: 'LK'
        },
        {
          label: '',
          value: 'historyId',
          type: 'Const',
          initValue: this.dialog.id
        }
      ],
      headerList,
      activeName: 'detail',
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      loading: false,
      searchData: []
    }
  },
  computed: {
    canDelete() {
      return this.idList && this.idList.length > 0
    }
  },
  methods: {
    back() {
      this.dialog.show = false
    },
    down(type) {
      const id = this.dialog.id
      downloadTpl(id, type)
    },
    getData() {
      getPatchDetailList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
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
  }
}
</style>

<template>
  <div style="padding: 20px" class="detail">
    <common-detail @goBack="goBack" :title="detailName">
      <div slot="custom_content">
        <el-form :inline="true">
          <el-form-item v-for="(item, index) in selectList" :key="index">
            <el-select v-model="detailData[item.key.searchName]" :placeholder="'请选择' + item.key.label" clearable @change="handleSearch">
              <el-option v-for="(item, index) in item.value" :key="index" :label="item" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button type="ghost" icon="el-icon-refresh" @click="reset">重置</el-button>
            <el-button type="ghost" @click="handleExport" icon="el-icon-upload2">导出</el-button>
          </el-form-item>
        </el-form>
        <div class="pull-right">
          <el-popover ref="popover" width="360" placement="bottom" trigger="click">
            <el-row :gutter="5">
              <el-col :span="8" :key="item.id" v-for="item in columnsData">
                <el-checkbox v-model="item.show" @change="updateColumns(item)">{{ item.name }}</el-checkbox>
              </el-col>
            </el-row>
          </el-popover>
          <el-button class="m-l-sm" type="ghost" v-popover:popover icon="el-icon-s-grid"></el-button>
        </div>
        <basic-table :data="list" :params="params" :get-list="getList" :total="total" tooltip-effect="light">
          <template v-for="(row, key) in columnsData">
            <el-table-column :key="key" :label="row.name" v-if="row.show" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row[row.code] }}</span>
              </template>
            </el-table-column>
          </template>
        </basic-table>
      </div>
    </common-detail>
  </div>
</template>

<script>
import { getBillInstance, getBillingDetails } from 'services/platform/index'
import { getPublicCloudBillSelect } from 'services/services/bill'
import { downloadFile } from 'utils'
import { constant } from 'lodash'

export default {
  props: ['detailId', 'detailSource', 'detailName'],
  data() {
    return {
      user: '',
      accountData: [],
      list: [],
      total: 0,
      name: '',
      columnsData: [],
      params: {
        page: 1,
        rows: 10
      },
      detailData: {
        account: '',
        productType: '',
        product: '',
        billType: '',
        applicationSystem: '',
        resourceTag: '',
        department: ''
      },
      selectList: []
    }
  },
  created() {
    this.handleSearch()
    this.getSelect()
  },
  methods: {
    async getSelect() {
      const res = await getPublicCloudBillSelect(this.detailId)
      if (res.success) {
        const selectMap = {
          账号: 'account',
          账单类型: 'billType',
          产品: 'product',
          产品类型: 'productType',
          产品明细: 'productType'
        }
        for (const key in res.data) {
          const searchName = selectMap[key]
          const obj = {
            key: { searchName, label: key },
            value: res.data[key]
          }
          this.selectList.push(obj)
        }
      }
    },
    reset() {
      this.detailData = {
        account: '',
        productType: '',
        product: '',
        billType: '',
        applicationSystem: '',
        resourceTag: '',
        department: ''
      }
      this.handleSearch()
    },
    goBack() {
      this.$emit('goBack')
    },
    handleExport() {
      downloadFile(`/rms/v1/pc/bills/${this.detailId}/download`, this.params)
    },
    getList() {
      getBillingDetails(this.params, this.detailId).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          if (data.data.columns) {
            this.columnsData = data.data.columns
          }
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        templateId: this.detailId,
        billType: this.detailData.billType,
        product: this.detailData.product,
        productType: this.detailData.productType,
        account: this.detailData.account
      })
      this.getList()
    },
    // 更新显示列
    updateColumns(item) {
      const params = {
        propertyId: item.id,
        checked: item.show
      }
      getBillInstance(params).then((data) => {
        if (data.success) {
          if (data.success) {
            this.getList()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  padding-top: 20px;
  padding-left: 20px;
  background-color: #fff;
}
.detail {
  ::v-deep .common-detail {
    // background-color: #fff !important;
    ::v-depp .table-container {
      padding: 0 30px;
    }
  }
}

::v-deep {
  .table-container {
    padding: 0 30px;
  }
  .pull-right {
    margin-right: 30px;
  }
  .m-l-sm {
    height: 40px;
    width: 66px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 26px;
  }
}
</style>

<template>
  <div class="wrapper" v-loading="loading">
    <TimeSelect style="border: none" ref="timeSelect" :get-data="getData" @exportData="exportData"></TimeSelect>
    <el-card class="tag-select-wapper" style="border: none; box-shadow: none; padding: 0">
      <el-form inline>
        <el-form-item style="margin-top: 16px">
          <el-select v-model="label" placeholder="请选择" @change="handleSearch">
            <el-option v-for="tag in tags" :key="tag.name" :label="tag.name" :value="tag.name"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="10">
      <el-col :span="24" class="m-t">
        <rich-charts title="标签账单总额" :setting="chartSetting" :data="list[0]" default-chart="loop-charts" v-if="list"> </rich-charts>
      </el-col>
      <el-col :span="24" class="m-t">
        <rich-charts title="标签账单趋势" :data="list[1]" default-chart="line-charts" v-if="list"> </rich-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import TimeSelect from '../common/TimeSelect.vue'
import { getTags } from 'services/system/tag'
import { getBillData, exportBill } from 'services/soa/bill'

export default {
  components: { TimeSelect },
  data() {
    return {
      loading: false,
      minxiParams: {
        time: 'Months'
      },
      list: '',
      searchParams: '',
      condition: 'label',
      tags: [],
      label: '',
      params: {
        page: 1,
        rows: 9999
      },
      chartSetting: {
        richCount: 160
      }
    }
  },
  methods: {
    handleSearch(val) {
      this.label = val
      if (this.$refs.timeSelect && this.$refs.timeSelect.$data && this.$refs.timeSelect.$data.params) {
        this.$refs.timeSelect.$data.params.month = ''
      }
      const obj = {
        time: this.$refs.timeSelect && this.$refs.timeSelect.$data && this.$refs.timeSelect.$data.params && this.$refs.timeSelect.$data.params.time
      }
      this.getData(obj)
    },
    async getTagList() {
      const res = await getTags(this.params)
      if (res.success) {
        this.tags = res.data.rows
        this.label = this.tags[0].name
        this.getData()
      }
    },
    async getData(params) {
      this.loading = true
      const { time, startTime, endTime } = {
        ...this.minxiParams,
        ...params
      }
      let obj = null
      if (!startTime && !endTime) {
        obj = {
          time
        }
      } else {
        obj = {
          startTime,
          endTime
        }
      }
      this.searchParams = obj
      const res = await getBillData({ time: JSON.stringify(obj), condition: this.condition, label: this.label })
      if (res.success) {
        this.list = res.data
      }
      this.loading = false
    },
    exportData() {
      exportBill({ time: JSON.stringify(this.searchParams), condition: this.condition, label: this.label })
    }
  },
  created() {
    this.getTagList()
  }
}
</script>
<style scoped lang="scss">
.wrapper {
  width: 100%;
  overflow-x: hidden;
  .tag-select-wapper {
    ::v-deep .el-card__body {
      padding: 0 20px;
      margin-top: -15px;
    }
  }
}
</style>

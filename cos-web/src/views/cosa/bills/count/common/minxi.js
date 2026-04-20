import { getBillData, exportBill } from 'services/soa/bill'
import TimeSelect from './TimeSelect.vue'

export default {
  components: { TimeSelect },
  data() {
    return {
      loading: false,
      minxiParams: {
        time: 'Months'
      },
      list: '',
      condition: '',
      searchParams: ''
    }
  },
  methods: {
    handleSearchParam(params) {
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
    },
    async getData(params) {
      this.loading = true
      this.handleSearchParam(params)
      const res = await getBillData({ time: JSON.stringify(this.searchParams), condition: this.condition })
      if (res.success) {
        this.list = res.data
      }
      this.loading = false
    },
    exportData() {
      exportBill({ time: JSON.stringify(this.searchParams), condition: this.condition })
    }
  }
}

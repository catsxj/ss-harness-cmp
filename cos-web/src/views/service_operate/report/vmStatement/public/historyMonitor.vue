<template>
  <el-dialog title="监控详情" :close-on-click-modal="false" :visible.sync="monitor.dialog" width="600px">
    <el-card class="m-b-sm">
      <div slot="header">
        <span>云主机CPU利用率</span>
        <span class="pull-right">
          <!-- <el-button-group>
            <el-button size="mini" :type="item.measure==CpuDay.measure?'primary':''" v-for="item in intervalData"
                        :key="item.measure" @click="changeInterval(item.measure, 'Cpu', 'ByDay', '云主机cpu利用率', 'topCpu', 'CpuDay')">{{item.name}}</el-button>
          </el-button-group> -->
        </span>
      </div>
      <!-- <bar-charts ref="topCpu" height="300px" width="100%" id="topCpu" :data="topCputData"
                    v-if="Object.keys(topCputData).length !== 0"></bar-charts>
      <div v-else class="charts-data">
        <div>
          <Icon type="icon-zanwushuju"></Icon>
        </div>
        <div>
          暂无数据
        </div>
      </div> -->
    </el-card>
    <div slot="footer" class="dialog-footer">
      <el-button @click="monitor.dialog = false">取 消</el-button>
      <el-button type="primary" @click.native="configSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { historyMonitor } from 'services/platform/index'
export default {
  props: {
    monitor: {
      type: Object,
      default: function () {
        return {
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      a: ''
    }
  },
  created() {
    this.checkMonitor()
  },
  methods: {
    checkMonitor() {
      historyMonitor(this.monitor.id).then((data) => {
        if (data.success) {
          console.log('11')
        }
      })
    }
  }
}
</script>

<style></style>

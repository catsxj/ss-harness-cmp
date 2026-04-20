<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>基本信息</span>
      </div>
      <div class="basic-info">
        <el-row>
          <el-col :span="8" class="attr">
            <span class="attr-name">创建者：</span>
            <span class="attr-value">{{ detailData.basicMap.createdByName }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">容器：</span>
            <span class="attr-value">{{ detailData.basicMap.container }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">instance：</span>
            <span class="attr-value">{{ detailData.basicMap.instance }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">job：</span>
            <span class="attr-value">{{ detailData.basicMap.job }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">image：</span>
            <span class="attr-value">{{ detailData.basicMap.image }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">k8sApp：</span>
            <span class="attr-value">{{ detailData.basicMap.k8sApp }}</span>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-row :gutter="5">
      <el-col :span="8">
        <div class="rate_box">
          <p>容器创建时间(GMT+8)</p>
          <p>{{ detailData.podStartTime }}</p>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="rate_box">
          <p>容器重新启动的总次数</p>
          <p>{{ detailData.restartsTotal }}次</p>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="rate_box">
          <p>容器请求的核心数</p>
          <p>{{ detailData.requestsCpuCores }}C</p>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getPodDetail } from 'services/monitor/kubernetes'
import chartBox from 'views/components/chartBox.vue'
import { getCharts } from 'services/monitor'
export default {
  components: { chartBox },
  props: {
    detailName: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'Pod CPU usage',
          value: 'cpu',
          expr: JSON.stringify(['round(sum by (pod)( rate(container_cpu_usage_seconds_total{image!="",pod="' + this.detailName + '"}[5m] ) ),0.0001)']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: 'Pod memory usage',
          value: 'memory',
          expr: JSON.stringify(['round(sort_desc(sum(container_memory_usage_bytes{image!="",pod="' + this.detailName + '"}) by (pod, image))/1024/1024 ,0.01)']),
          name: '["$image"]',
          unit: 'MB'
        },
        {
          title: 'Pod Network i/o',
          value: 'network',
          expr: JSON.stringify([
            'round(sort_desc(sum by (pod) (rate (container_network_receive_bytes_total{name!="",pod="' + this.detailName + '"}[5m]) ))/1024 ,0.01)',
            'round(sort_desc(sum by (pod) (rate (container_network_transmit_bytes_total{name!="",pod="' + this.detailName + '"}[5m]) ))/1024 ,0.01)'
          ]),
          name: '["容器网络接收字节总数", "容器网络传输字节总数"]',
          unit: 'KB'
        },
        {
          title: 'CPU累积占用时间',
          value: 'cputime',
          expr: JSON.stringify(['round(sum(container_cpu_system_seconds_total{pod="' + this.detailName + '"})  by(pod) ,0.01)', 'round(sum(container_cpu_user_seconds_total{pod="' + this.detailName + '"})  by(pod) ,0.01)']),
          name: '["System", "User"]',
          unit: '秒'
        },
        {
          title: '容器组累积操作数据的总量',
          value: 'fsbytes',
          expr: JSON.stringify(['round(sum(container_fs_reads_bytes_total{pod="' + this.detailName + '"})  by(pod)/1024 ,0.01)', 'round(sum(container_fs_writes_bytes_total{pod="' + this.detailName + '"})  by(pod)/1024 ,0.01)']),
          name: '["reads", "writes"]',
          unit: 'KB'
        },
        {
          title: '过去10秒容器组CPU的平均负载',
          value: 'cpuload',
          expr: JSON.stringify(['round(sum(container_cpu_load_average_10s{pod="' + this.detailName + '"})  by(pod) ,0.01)']),
          name: '["平均值"]',
          unit: ''
        }
      ],
      detailData: {
        basicMap: {}
      },
      dashboradData: {
        cpu: {},
        memory: {},
        network: {},
        cputime: {},
        fsbytes: {},
        cpuload: {}
      }
    }
  },
  beforeDestroy() {},
  methods: {
    getDetail() {
      getPodDetail({
        name: this.detailName
      }).then((data) => {
        if (data.success) {
          this.detailData = data.data
        }
      })
    }
  },
  created() {
    this.getDetail()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
<style scoped>
.rate_box {
  background: #7c79b6;
  height: 140px;
  text-align: center;
  color: #fff;
}
.rate_box > p:nth-child(1) {
  height: 50px;
  line-height: 50px;
  margin-bottom: 0;
}
.rate_box > p:nth-child(2) {
  height: 60px;
  line-height: 60px;
  font-size: 32px;
  margin: 0;
}
</style>

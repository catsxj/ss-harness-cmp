<template>
  <common-detail :title="installDetail.data.instanceId" @goBack="installDetail.dialog = false">
    <div slot="custom_content" class="server-detail">
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div class="textBox">
          <div class="label_txt">唯一标识</div>
          <div class="label_val">{{ installDetail.data.instanceId }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">状态记录</div>
          <div class="label_val">{{ installDetail.data.status }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">服务器型号</div>
          <div class="label_val">{{ installDetail.data.deviceModel }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">设备类型</div>
          <div class="label_val">{{ installDetail.data.deviceType }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">机房</div>
          <div class="label_val">{{ installDetail.data.room }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">机柜</div>
          <div class="label_val">{{ installDetail.data.cabinet }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">品牌</div>
          <div class="label_val">{{ installDetail.data.brandName }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">所属租户</div>
          <div class="label_val">{{ installDetail.data.tenantName }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">所属用户</div>
          <div class="label_val">{{ installDetail.data.userName }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">部门</div>
          <div class="label_val">{{ installDetail.data.departmentName }}</div>
        </div>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">基础配置</div>
        <div class="textBox">
          <div class="label_txt">CPU架构</div>
          <div class="label_val">{{ installDetail.data.cpuArch }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">CPU主频</div>
          <div class="label_val">{{ installDetail.data.cpuFreq }}GHz</div>
        </div>
        <div class="textBox">
          <div class="label_txt">CPU核心</div>
          <div class="label_val">{{ installDetail.data.cpuCoreNum }}核</div>
        </div>
        <div class="textBox">
          <div class="label_txt">CPU配件号</div>
          <div class="label_val">{{ installDetail.data.cpuJson.partsNum }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">内存频率</div>
          <div class="label_val">{{ installDetail.data.memJson.frequency }}MHz</div>
        </div>
        <div class="textBox">
          <div class="label_txt">内存容量</div>
          <div class="label_val">{{ installDetail.data.memSize }}GB</div>
        </div>
        <div class="textBox">
          <div class="label_txt">内存配件号</div>
          <div class="label_val">{{ installDetail.data.memJson.fittingsNum }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">操作系统</div>
          <div class="label_val">{{ installDetail.data.os }}</div>
        </div>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">服务器信息</div>
        <div class="textBox">
          <div class="label_txt">出厂年份</div>
          <div class="label_val">{{ installDetail.data.factoryYear }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">维保年份</div>
          <div class="label_val">{{ installDetail.data.maintainYear }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">上架时间</div>
          <div class="label_val">{{ installDetail.data.putOnTime }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">SN</div>
          <div class="label_val">{{ installDetail.data.sn }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">PN/PID</div>
          <div class="label_val">{{ installDetail.data.pn }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">单/双电源</div>
          <div class="label_val">{{ installDetail.data.power ? '单电源' : '双电源' }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">ILO</div>
          <div class="label_val">{{ installDetail.data.ilo }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">预计使用年限</div>
          <div class="label_val">{{ installDetail.data.useYear }}</div>
        </div>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">硬盘配置</div>
        <basic-table :data="installDetail.data.disks" style="margin: 10px">
          <el-table-column type="index" label="序号" width="80px"> </el-table-column>
          <el-table-column prop="diskType" label="硬盘类型" show-overflow-tooltip></el-table-column>
          <el-table-column prop="capacity" label="硬盘容量(TB)" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="name" label="配件名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="partNumber" label="配件号" show-overflow-tooltip></el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">网络配置</div>
        <basic-table :data="installDetail.data.nics" style="margin: 10px">
          <el-table-column type="index" label="序号" width="80px"> </el-table-column>
          <el-table-column prop="ip" label="IP" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="segment" label="业务网段" show-overflow-tooltip></el-table-column>
          <el-table-column prop="mac" label="MAC地址" show-overflow-tooltip> </el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">其他配件</div>
        <basic-table :data="installDetail.data.parts" style="margin: 10px">
          <el-table-column type="index" label="序号" width="80px"> </el-table-column>
          <el-table-column prop="partType" label="配件类型" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="name" label="配件名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="partNumber" label="配件号" show-overflow-tooltip> </el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </el-card>
    </div>
  </common-detail>
</template>

<script>
import 'views/resource/vm/details/index.scss'
export default {
  props: {
    installDetail: {
      type: Object
    }
  },
  data() {
    return {}
  },
  methods: {
    goBack() {
      this.$emit('goBack')
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep .server-detail {
  .textBox {
    width: 33% !important;
  }
}
</style>

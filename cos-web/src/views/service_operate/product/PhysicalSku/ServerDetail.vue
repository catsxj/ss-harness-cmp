<template>
  <common-detail :title="installDetail.name" @goBack="goBack">
    <div slot="custom_content" class="server-detail">
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div class="textBox">
          <div class="label_txt">规格名称</div>
          <div class="label_val">{{ installDetail.name }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">品牌</div>
          <div class="label_val">{{ installDetail.brandName }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">服务器型号</div>
          <div class="label_val">{{ installDetail.model }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">Pci插槽数</div>
          <div class="label_val">{{ installDetail.pciSlotCount }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">U数</div>
          <div class="label_val">{{ installDetail.uCount }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">硬盘槽位数</div>
          <div class="label_val">{{ installDetail.diskSlotCount }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">电源接口数</div>
          <div class="label_val">{{ installDetail.powerInterfaceCount }}</div>
        </div>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">基础配置</div>
        <div class="textBox">
          <div class="label_txt">CPU配件名称</div>
          <div class="label_val">{{ installDetail.cpuSpecName }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">CPU架构</div>
          <div class="label_val">{{ installDetail.cpuFramework }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">CPU核心</div>
          <div class="label_val">{{ installDetail.cpuNum }}核</div>
        </div>
        <div class="textBox">
          <div class="label_txt">CPU主频</div>
          <div class="label_val">{{ installDetail.cpuHz }}GHz</div>
        </div>
        <div class="textBox">
          <div class="label_txt">内存配件名称</div>
          <div class="label_val">{{ installDetail.memSpecName }}</div>
        </div>
        <div class="textBox">
          <div class="label_txt">内存容量</div>
          <div class="label_val">{{ installDetail.memSize }}GB</div>
        </div>
        <div class="textBox">
          <div class="label_txt">内存频率</div>
          <div class="label_val">{{ installDetail.memHz }}MHz</div>
        </div>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">硬盘配置</div>
        <basic-table :data="installDetail.diskSpecList" style="margin: 10px">
          <el-table-column type="index" label="序号" width="80px"> </el-table-column>
          <el-table-column prop="diskType" label="硬盘类型" show-overflow-tooltip></el-table-column>
          <el-table-column prop="capacity" label="硬盘容量(TB)" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="name" label="配件名称" show-overflow-tooltip></el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </el-card>
      <el-card class="m-t detail-body-body" :body-style="{ padding: 0 }">
        <div slot="header">其他配件</div>
        <basic-table :data="installDetail.partsSpecList" style="margin: 10px">
          <el-table-column type="index" label="序号" width="80px"> </el-table-column>
          <el-table-column prop="partType" label="配件类型" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="name" label="配件名称" show-overflow-tooltip></el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </el-card>
    </div>
  </common-detail>
</template>

<script>
import './index.scss'
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

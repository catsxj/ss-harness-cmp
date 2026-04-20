<template>
  <div style="width: 100%">
    <svg-icon icon-name="svg-vm-detail" class="pull-left" />
    <div class="pull-left content_header">
      <div>
        {{ detail.name }}
        <span class="vm-status-success" v-if="detail.status == 'RUNNING'">
          <i class="el-icon-success"></i>
          {{ detail.status | openstackServer }}
        </span>
        <span class="vm-status-error" v-else>
          <i class="el-icon-error"></i>
          {{ detail.status | openstackServer }}
        </span>
      </div>
      <div class="m-t">
        <el-row>
          <el-col :span="8" v-if="ip">
            主机IP：
            <slot name="ip">{{ ip }}</slot>
          </el-col>
          <el-col :span="8">规格：{{ (detail.cpu ? detail.cpu : 0) + 'C/' + (detail.memory ? detail.memory : 0) + 'GB/' }}{{ detail.disk == null ? 0 : detail.disk + 'GB' }}</el-col>
          <el-col :span="8">操作系统：{{ (detail.osCategory ? detail.osCategory : '') + ' ' + (detail.osName ? detail.osName : '') + ' ' + (detail.osVersion ? detail.osVersion : '') }}</el-col>
        </el-row>
      </div>
    </div>
    <div style="clear: both"></div>
  </div>
</template>

<script>
import '../index.scss'
export default {
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    },
    ip: {
      type: [String, Boolean],
      default: '无法获取'
    }
  }
}
</script>
<style lang="scss"></style>

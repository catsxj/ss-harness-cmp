<template>
  <div>
    <!-- <op v-if="obj.vendorType === 'OPENSTACK'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></op> -->
    <manageone v-if="obj.vendorType === 'MANAGEONE' || obj.vendorType === 'OPENSTACK'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></manageone>
    <vc v-else-if="obj.vendorType === 'VMWARE'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></vc>
    <h3c v-else-if="obj.vendorType === 'H3C'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></h3c>
    <INSPURRAIL v-else-if="obj.vendorType === 'INSPURRAIL'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></INSPURRAIL>
    <cnware v-else-if="obj.vendorType === 'CNWARE'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></cnware>
    <zstack v-else-if="obj.vendorType === 'ZSTACK'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></zstack>
    <aliyun v-else-if="obj.vendorType === 'ALIYUN'" @time="time" :scope="obj" @getList="getList"></aliyun>
    <cecstack v-else-if="obj.vendorType === 'CECSTACK'" @time="time" :scope="obj" @getList="getList"></cecstack>
    <jdyun v-else-if="obj.vendorType === 'JDCLOUD'" @time="time" :scope="obj" @getList="getList"></jdyun>
    <tencent v-else-if="obj.vendorType === 'TENCENT'" @time="time" :scope="obj" @getList="getList"></tencent>
    <huawei v-else-if="obj.vendorType === 'HUAWEI'" @time="time" :scope="obj" @getList="getList"></huawei>
    <azure v-else-if="obj.vendorType === 'AZURE'" @time="time" :scope="obj" @getList="getList"></azure>
    <qcloud v-else-if="obj.vendorType === 'QCLOUD'" @modify="modify" @time="time" :scope="obj" @getList="getList"></qcloud>
    <tce v-else-if="obj.vendorType === 'TCE'" @time="time" :scope="obj" @getList="getList" @modify="modify"></tce>
    <aws v-else-if="obj.vendorType === 'AWS'" @modify="modify" @time="time" :scope="obj" @getList="getList"></aws>
    <smart v-else-if="obj.vendorType === 'SMARTX'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></smart>
    <cloudTower v-else-if="obj.vendorType === 'CLOUDTOWER'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></cloudTower>
    <fusion-sphere v-else-if="obj.vendorType === 'FUSIONSPHERE'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></fusion-sphere>
    <sangfor v-else-if="obj.vendorType === 'SANGFOR'" :scope="obj" @getList="getList" @modify="modify" @snapshot="snapshot" @time="time"></sangfor>
    <modify :add-data="modifyData" v-if="modifyData.dialog" @back="getList"></modify>
    <snapshot :add-data="snapshotData" v-if="snapshotData.dialog"></snapshot>
    <time-template :add-data="timeData" v-if="timeData.dialog" @back="getList"></time-template>
  </div>
</template>

<script>
import op from './op.vue'
import vc from './vc.vue'
import h3c from './h3c.vue'
import INSPURRAIL from './INSPURRAIL.vue'
import cnware from './cnware.vue'
import aliyun from './aliyun.vue'
import cecstack from './cecstack.vue'
import jdyun from './jdyun.vue'
import tencent from './tencent.vue'
import huawei from './huawei.vue'
import modify from './dialog/modify.vue'
import snapshot from './dialog/snapshot.vue'
import timeTemplate from './dialog/time.vue'
import azure from './azure.vue'
import qcloud from './qcloud.vue'
import tce from './tce.vue'
import aws from './aws.vue'
import manageone from './manageone.vue'
import smart from './smart.vue'
import fusionSphere from './fusionsphere.vue'
import sangfor from './sangfor.vue'
import cloudTower from './cloudTower.vue'
import zstack from './zstack.vue'
export default {
  props: {
    obj: {
      type: Object
    },
    vendorId: {
      type: [String, Number]
    }
  },
  components: {
    manageone,
    vc,
    h3c,
    modify,
    snapshot,
    timeTemplate,
    aliyun,
    cecstack,
    jdyun,
    tencent,
    huawei,
    azure,
    qcloud,
    tce,
    aws,
    smart,
    fusionSphere,
    sangfor,
    cloudTower,
    cnware,
    zstack,
    INSPURRAIL
  },
  data() {
    return {
      modifyData: {
        dialog: false,
        data: {}
      },
      snapshotData: {
        dialog: false,
        data: {}
      },
      timeData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    modify(data) {
      this.modifyData = {
        dialog: true,
        data: {
          id: data.id,
          name: data.name,
          remark: data.remark
        }
      }
    },
    snapshot(data) {
      this.snapshotData = {
        dialog: true,
        data: {
          id: data.vendorId,
          serverId: data.id,
          type: data.type
        }
      }
    },
    time(data) {
      this.timeData = {
        dialog: true,
        data: {
          resId: data.id
        }
      }
    },
    getList() {
      this.$emit('getList')
    }
  }
}
</script>

<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="6" class="m-b" v-for="item in vendorData" :key="item.id">
        <el-card class="server_view">
          <div slot="header" class="clearfix header-box">
            <div class="pull-left headerName" :title="item.name">
              {{ item.name }}
            </div>
            <div class="action-box">
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="开启监控" v-if="!item.isAlarm" @click="handleOperate(1, item.id)"></svg-icon>
              <svg-icon icon-name="svg-service-ops" class="m-l-sm" title="关闭监控" v-else @click="handleOperate(2, item.id)"></svg-icon>
              <svg-icon icon-name="svg-resource-ops" class="m-l-sm" style="font-size: 16px" v-if="item.type == 'OPENSTACK'" title="配置超分比" @click="handleConfigRatio(item.id)"></svg-icon>
              <svg-icon icon-name="svg-resource-ops" class="m-l-sm" style="font-size: 16px" v-if="item.type == 'FUSIONCLOUD' || item.type == 'MANAGEONE' || item.type == 'INSPURCLOUD'" title="运维认证" @click="handleOp(item.id)"></svg-icon>
            </div>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'OPENSTACK'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/op.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'EASYSTACK'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/easystack.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'VMWARE'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/vcenter.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'CNWARE'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/cnware.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'INSPURRAIL'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/inspur_rail.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'USPHERE'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/usphere.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'SANGFOR'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/sangfor.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'FUSIONSPHERE'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/fusionComputer.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'SMARTX'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/smart.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'CLOUDTOWER'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/cloudTower.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'FUSIONCLOUD' || item.type == 'MANAGEONE'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/huawei.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag" v-for="(item1, index1) in FUSIONCLOUD.value" :key="index1">
                    <el-col :span="12">{{ item1.name }}</el-col>
                    <el-col :span="7" :class="'tag' + (index1 + 1)">{{ item[item1.value] }}</el-col>
                    <el-col :span="2" :offset="1">{{ item1.unit }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'INSPURCLOUD'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img :src="item.logo" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag" v-for="(item1, index1) in FUSIONCLOUD.value" :key="index1">
                    <el-col :span="12">{{ item1.name }}</el-col>
                    <el-col :span="7" :class="'tag' + (index1 + 1)">{{ item[item1.value] }}</el-col>
                    <el-col :span="2" :offset="1">{{ item1.unit }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'HMC'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img :src="item.logo" alt="" />
                </div>
                <div class="body-left-body" :class="{ true: 'colorRed' }[item.flag]">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag" v-for="(item1, index1) in HMC.value" :key="index1">
                    <el-col :span="12">{{ item1.name }}</el-col>
                    <el-col :span="7" :class="'tag' + (index1 + 1)">{{ item[item1.value] }}</el-col>
                    <el-col :span="2" :offset="1">{{ item1.unit }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'KUBERNETES'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/k8s.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ true: 'colorRed' }[item.flag]">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">节点</el-col>
                    <el-col :span="7" class="tag2">{{ item.nodeCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">容器组</el-col>
                    <el-col :span="7" class="tag2">{{ item.podCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'TIANYI' || item.type == 'HUAWEI'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img v-if="item.type == 'TIANYI'" src="/web-common-resource/img/platform/ty.png" alt="" />
                  <img v-if="item.type == 'HUAWEI'" src="/web-common-resource/img/platform/huawei.png" alt="" />
                  <img v-if="item.type == 'ZSTACK'" src="/web-common-resource/img/platform/zstack.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'H3C'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/h3c.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">宿主机</el-col>
                    <el-col :span="7" class="tag1">{{ item.hostCount }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'ZSTACK'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/zstack.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <!-- <div class="tag">
                    <el-col :span="12">云平台</el-col>
                    <el-col :span="7" class="tag1">{{item.vendorCount || 0}}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear:both"></div>
                  </div> -->
                  <!-- <div class="tag">
                    <el-col :span="12">虚拟机</el-col>
                    <el-col :span="7" class="tag1">{{item.cloudServerCount || 0}}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear:both"></div>
                  </div> -->
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'ALIYUN' || item.type == 'APSARASTACK'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/aliyun.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'QCLOUD'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/qcloud.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'YYJQCLOUD'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/qcloud.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'AZURE'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/azure.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'CECSTACK'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/cecstack.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="server-body" @click="go(item)" v-if="item.type == 'LENOVO'">
            <el-row>
              <el-col :span="12" class="body-left">
                <div class="body-left-header">
                  <img src="/web-common-resource/img/platform/lenovo.png" alt="" />
                </div>
                <div class="body-left-body" :class="{ colorRed: item.flag, colorWarn: item.warnFlag }">
                  {{ platformStatusFilter(item.status) }}
                </div>
              </el-col>
              <el-col :span="12" class="body-right">
                <div class="tag-box">
                  <div class="tag">
                    <el-col :span="12">云主机</el-col>
                    <el-col :span="7" class="tag2">{{ item.instance }}</el-col>
                    <el-col :span="2" :offset="1">个</el-col>
                    <div style="clear: both"></div>
                  </div>
                  <div class="tag">
                    <el-col :span="12">监控</el-col>
                    <el-col :span="10" :class="item.isAlarm ? 'tag2' : 'tag3'">{{ item.isAlarm ? '已开启' : '已关闭' }}</el-col>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <empty v-if="!vendorData.length"></empty>
    </el-row>
    <el-dialog title="配置超分比" :close-on-click-modal="false" v-if="configRatioVisible" v-model:visible="configRatioVisible">
      <basic-form :model="configRatioData" label-width="130px" ref="configRatioData">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="vcpu超分比：" prop="vcpuRatio" validate="required"> <el-input-number :min="0" v-model="configRatioData.vcpuRatio"></el-input-number> 倍 </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="内存超分比：" prop="ramRatio" validate="required"> <el-input-number :min="0" v-model="configRatioData.ramRatio"></el-input-number> 倍 </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="磁盘超分比：" prop="diskRatio" validate="required"> <el-input-number :min="0" v-model="configRatioData.diskRatio"></el-input-number> 倍 </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="configRatioVisible = false">取消</el-button>
        <el-button type="primary" @click="configRatioSubmit">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="运维认证信息" :close-on-click-modal="false" v-if="opVisible" v-model:visible="opVisible">
      <basic-form :model="opData" label-width="130px" ref="opData">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="运维侧地址：" prop="address" validate="required">
              <el-input v-model="opData.address" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="用户名：" prop="username" validate="required">
              <el-input v-model="opData.username" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="密码：" prop="password" validate="required">
              <el-input type="password" v-model="opData.password" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="opVisible = false">取消</el-button>
        <el-button type="primary" @click="opSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { platformStatusFilter } from '@/filters/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import crypto from 'utils/crypto'
import { openMonitor, closeMonitor, getRatio, ratioOk, getAuthentications, authenticationsOk } from 'services/monitor'
import { conditionCloudVendor } from 'services/platform/index'
const FUSIONCLOUD = {
  btn: ['编辑', '删除', '同步', '设置'],
  value: [
    { name: '宿主机', value: 'hostCount', unit: '个' },
    { name: '云主机', value: 'instance', unit: '个' }
  ]
}
const HMC = {
  btn: ['编辑', '删除', '同步', '设置'],
  value: [
    { name: '服务器', value: 'hostCount', unit: '个' },
    { name: '逻辑分区', value: 'lparCount', unit: '个' },
    { name: 'VIOS', value: 'viosCount', unit: '个' }
  ]
}
export default {
  mixins: [webSocket],
  components: {},
  data() {
    return {
      platformStatusFilter,
      FUSIONCLOUD,
      HMC,
      vendorData: [],
      search: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10000
      },
      configRatioVisible: false,
      configRatioData: {
        targets: [],
        timeout: 1800
      },
      opVisible: false,
      opData: {}
    }
  },
  methods: {
    // 跳转
    go(item) {
      if (!item.isAlarm) {
        return this.$message.error('该平台未开启监控，请先开启监控')
      }
      switch (item.type) {
        case 'VMWARE':
          this.$router.push({
            name: 'MonitorCloudVcenter',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'FUSIONSPHERE':
          this.$router.push({
            name: 'MonitorCloudHuaweiFC',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'INSPURRAIL':
          this.$router.push({
            name: 'MonitorCloudInspurRail',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'USPHERE':
          this.$router.push({
            name: 'MonitorCloudUsphere',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'SANGFOR':
          const name = item.version.includes('6.3') ? 'MonitorCloudSangforHCI' : 'MonitorCloudSangforSCP'
          this.$router.push({
            name,
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'SMARTX':
          this.$router.push({
            name: 'MonitorCloudSmart',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'CLOUDTOWER':
          this.$router.push({
            name: 'MonitorCloudCloudTower',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'OPENSTACK':
          this.$router.push({
            name: 'MonitorCloudOpenStack',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              uuid: item.uuid,
              type: item.type
            }
          })
          break
        case 'EASYSTACK':
          this.$router.push({
            name: 'MonitorCloudEasyStack',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              uuid: item.uuid,
              type: item.type
            }
          })
          break
        case 'FUSIONCLOUD':
          this.$router.push({
            name: 'MonitorCloudFusion',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'MANAGEONE':
          this.$router.push({
            name: 'MonitorCloudManageOne',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'INSPURCLOUD':
          this.$router.push({
            name: 'MonitorCloudInspurCloud',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'HMC':
          this.$router.push({
            name: 'MonitorCloudHmc',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'KUBERNETES':
          this.$router.push({
            name: 'MonitorCloudK8s',
            query: {
              vendorId: item.id,
              vendorName: item.name
            }
          })
          break
        case 'TIANYI':
          this.$router.push({
            name: 'MonitorCloudTianyi',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type,
              isPublic: item.isPublic
            }
          })
          break
        case 'ALIYUN':
          this.$router.push({
            name: 'MonitorCloudAliyun',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'QCLOUD':
          this.$router.push({
            name: 'MonitorCloudQcloud',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'YYJQCLOUD':
          this.$router.push({
            name: 'MonitorYYJCloudQcloud',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'CECSTACK':
          this.$router.push({
            name: 'MonitorCloudCecStack',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'HUAWEI':
          this.$router.push({
            name: 'MonitorCloudHuawei',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type,
              isPublic: item.isPublic
            }
          })
          break
        case 'AZURE':
          this.$router.push({
            name: 'MonitorCloudAzure',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'H3C':
          this.$router.push({
            name: 'MonitorCloudH3C',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'ZSTACK':
          this.$router.push({
            name: 'MonitorCloudZstack',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'CNWARE':
          this.$router.push({
            name: 'MonitorCloudCNware',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'APSARASTACK':
          this.$router.push({
            name: 'MonitorApsarastack',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        case 'LENOVO':
          console.log('lenovo item', item)
          this.$router.push({
            name: 'MonitorCloudLenovo',
            query: {
              vendorId: item.id,
              vendorName: item.name,
              type: item.type
            }
          })
          break
        default:
          break
      }
    },
    onmessage(data) {
      if (data.operate.indexOf('sync') > -1) {
        this.getVendor()
      }
    },
    getVendor() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'listByTypes',
          types: [
            'OPENSTACK',
            'INSPURCLOUD',
            'EASYSTACK',
            'VMWARE',
            'INSPURRAIL',
            'FUSIONCLOUD',
            'HMC',
            'MANAGEONE',
            'KUBERNETES',
            'TIANYI',
            'HUAWEI',
            'H3C',
            'ALIYUN',
            'SMARTX',
            'CLOUDTOWER',
            'ZSTACK',
            'CECSTACK',
            'FUSIONSPHERE',
            'QCLOUD',
            'CNWARE',
            'USPHERE',
            'SANGFOR',
            'AZURE',
            'YYJQCLOUD',
            'APSARASTACK',
            'LENOVO'
          ]
        })
      }).then((data) => {
        if (data.success) {
          this.vendorData = data.data
          this.vendorData.forEach((item) => {
            item.flag = false
            item.warnFlag = false
            Object.keys(item).forEach((key) => {
              if (item[key] === null) item[key] = 0
            })
            if (item.status == 'ABNORMAL' || item.status == 'DANGER') {
              item.flag = true
            }
            if (item.status === 'WARN') item.warnFlag = true
          })
        }
      })
    },
    handleOperate(flag, id) {
      let tip
      let list = []
      if (id) {
        list.push(id)
      } else {
        this.refreshId()
        list = this.idList
      }
      switch (flag) {
        case 1:
          tip = '确定要开启监控吗？'
          this.$confirm(tip, '提示', {
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          })
            .then(() => {
              openMonitor({
                ids: list
              }).then((data) => {
                if (data.success) {
                  this.$message.success({
                    message: data.message,
                    type: 'success'
                  })
                  this.getVendor()
                }
              })
            })
            .catch(() => {})
          break
        case 2:
          tip = '确定要关闭监控吗？'
          this.$confirm(tip, '提示', {
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          })
            .then(() => {
              closeMonitor({
                ids: list
              }).then((data) => {
                if (data.success) {
                  this.$message.success({
                    message: data.message,
                    type: 'success'
                  })
                  this.getVendor()
                }
              })
            })
            .catch(() => {})
          break
      }
    },
    handleConfigRatio(id) {
      getRatio({ simple: true, params: JSON.stringify({ vendorId: id }) }).then((data) => {
        if (data.success) {
          this.configRatioData = {
            vendorId: id,
            vcpuRatio: data.data.vcpuRatio,
            ramRatio: data.data.ramRatio,
            diskRatio: data.data.diskRatio
          }
          this.configRatioVisible = true
        }
      })
    },
    configRatioSubmit() {
      this.$refs.configRatioData.validate((valid) => {
        if (valid) {
          ratioOk(this.configRatioData).then((data) => {
            if (data.success) {
              this.$message({ message: data.message, type: 'success' })
              this.configRatioVisible = false
              this.getList()
            }
          })
        }
      })
    },
    handleOp(id) {
      getAuthentications(id).then((data) => {
        if (data.success) {
          if (data.data) {
            this.opData = {
              vendorId: id,
              address: data.data.address,
              username: data.data.username,
              password: crypto.decrypt(data.data.password)
            }
          } else {
            this.opData = {
              vendorId: id
            }
          }
          this.opVisible = true
        }
      })
    },
    opSubmit() {
      this.$refs.opData.validate((valid) => {
        if (valid) {
          const opData = JSON.parse(JSON.stringify(this.opData))
          if (opData.password) {
            opData.password = crypto.encrypt(opData.password)
          }
          authenticationsOk(opData).then((data) => {
            if (data.success) {
              this.$message({ message: data.message, type: 'success' })
              this.opVisible = false
              this.getList()
            }
          })
        }
      })
    }
  },
  created() {
    this.getVendor()
  }
}
</script>

<style scoped>
.body-left {
  height: 100%;
  margin: 25px 0;
  padding: 0px 5px;
  text-align: center;
}

.body-right {
  height: 100%;
}

.tag-box {
  margin: 20px 0;
  padding: 0px 5px;
  border-left: 1px solid #ebebeb;
}

.tag1 {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.7;
  color: #2c8cf0;
}

.tag2 {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.7;
  color: #18be6a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag3 {
  text-align: right;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.7;
  color: #ff6600;
}

.colorRed {
  color: red !important;
}

.colorWarn {
  color: #fe9900 !important;
}

.body-left img {
  margin: 10px 0px 12px 0px;
  max-width: 60px;
}
.server_view {
  -webkit-transition: all 0.2s linear;
  transition: all 0.2s linear;
}

.server_view:hover {
  z-index: 2;
  -webkit-box-shadow: 0 7px 15px rgba(0, 0, 0, 0.1);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  -webkit-transform: translate3d(0, -1px, 0);
  transform: translate3d(0, -1px, 0);
}
.server-body {
  height: 160px;
  overflow: hidden;
  cursor: pointer;
}

.tag {
  width: 100%;
  padding: 5px;
}
.action-box {
  display: flex;
  flex-wrap: nowrap;
}
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.headerName {
  width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

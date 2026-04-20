<template>
  <div>
    <el-card :body-style="{ padding: 0 }">
      <div slot="header">基本信息</div>
      <div class="textBox" v-if="modify.indexOf('名称') > -1">
        <div class="label_txt">名称</div>
        <div class="label_input">
          <div :title="detail.name">
            <span class="hidden-txt">
              {{ detail.name }}
            </span>
            <span v-if="detail.vendorType !== 'INSPURRAIL'" @click="modifyName" class="cursor"><i class="el-icon-edit"></i></span>
          </div>
        </div>
      </div>
      <div class="textBox">
        <div class="label_txt">实例UUID</div>
        <div class="label_val" :title="detail.instanceId">{{ detail.instanceId }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">状态</div>
        <div class="label_val">
          <!-- <status-icon :type="detail.status | vmStatusColor">{{detail.status | openstackServer}}</status-icon> -->
          {{ detail.status | openstackServer }}
        </div>
      </div>
      <div class="textBox" v-if="detail.vendorType != 'FUSIONSPHERE'">
        <div class="label_txt">规格</div>
        <div class="label_val">{{ (detail.cpu ? detail.cpu : 0) + 'C/' + (detail.memory ? detail.memory : 0) + 'GB/' }}{{ detail.disk == null ? 0 : detail.disk + 'GB' }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">操作系统</div>
        <div class="label_val" :title="(detail.osCategory ? detail.osCategory : '') + ' ' + (detail.osName ? detail.osName : '') + ' ' + (detail.osVersion ? detail.osVersion : '')">
          {{ (detail.osCategory ? detail.osCategory : '') + ' ' + (detail.osName ? detail.osName : '') + ' ' + (detail.osVersion ? detail.osVersion : '') }}
        </div>
      </div>
      <slot></slot>
      <div class="textBox">
        <div class="label_txt">镜像名称</div>
        <div class="label_val">{{ detail.template || detail.imageName }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">镜像UUID</div>
        <div class="label_val" :title="detail.templateUuid || detail.imageUuid">{{ detail.templateUuid || detail.imageUuid }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">创建时间</div>
        <div class="label_val">{{ detail.gmtCreate }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">到期时间</div>
        <div class="label_val">{{ detail.expiredTime ? detail.expiredTime : '0000-00-00 00:00:00' }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">标签</div>
        <div class="label_input">
          <div>
            <span class="hidden-txt"> {{ tagAry.join(',') }} </span>
            <span v-if="detail.vendorType !== 'INSPURRAIL'" @click="modifyTag" class="cursor"><i class="el-icon-edit"></i></span>
          </div>
        </div>
      </div>
      <div class="textBox" v-if="modify.indexOf('备注') > -1">
        <div class="label_txt">备注</div>
        <div class="label_input">
          <div>
            <span class="hidden-txt">
              {{ detail.remark }}
            </span>
            <span v-if="detail.vendorType !== 'INSPURRAIL'" @click="modifyRemark" class="cursor"><i class="el-icon-edit"></i></span>
          </div>
        </div>
      </div>
    </el-card>
    <el-card class="m-t" :body-style="{ padding: 0 }">
      <div slot="header">组织信息</div>
      <div class="textBox">
        <div class="label_txt">地域</div>
        <div class="label_val">{{ detail.regionName || detail.region }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">可用区</div>
        <div class="label_val">{{ detail.zoneName || detail.zone }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">租户</div>
        <div class="label_val">{{ detail.tenantName }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">创建者</div>
        <div class="label_val">{{ detail.creatorName }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">所有者</div>
        <div class="label_val">{{ detail.ownerName }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">运维者</div>
        <div class="label_val">{{ detail.menderName }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">{{ $store.getters.systemConfig.serviceConfigLabel }}</div>
        <div class="label_val">{{ detail.businessName }}</div>
      </div>
      <div class="textBox">
        <div class="label_txt">{{ $store.getters.systemConfig.projectConfigLabel }}</div>
        <div class="label_val">{{ detail.projectName }}</div>
      </div>
    </el-card>
    <el-dialog append-to-body :title="'编辑' + modifyData.title" :visible.sync="modifyData.dialog">
      <basic-form ref="data" :model="modifyData.data" :status-icon="true" label-width="80px">
        <basic-form-item key="1" v-if="modifyData.title == '名称'" label="名称：" prop="name" validate="required" required-message="请输入名称">
          <el-input v-model="modifyData.data.name"></el-input>
        </basic-form-item>
        <basic-form-item v-else key="2" label="备注：" prop="remark">
          <el-input v-model="modifyData.data.remark" type="textarea"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="modifyData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
    <tag :add-data="tagData" v-if="tagData.dialog" @back="$emit('back')"></tag>
  </div>
</template>

<script>
import { modifyVm, getDictChildrenTree } from 'services/platform/index'
import '../index.scss'
import tag from './tag.vue'
export default {
  components: { tag },
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    },
    modify: {
      type: Array,
      default: function () {
        return ['名称', '备注']
      }
    }
  },
  data() {
    return {
      modifyData: {
        dialog: false,
        title: '名称',
        data: {}
      },
      tagAry: [],
      tagData: {
        dialog: false,
        data: {}
      }
    }
  },
  created() {
    this.setTag()
    this.setRegion()
  },
  watch: {
    detail() {
      this.setRegion()
      this.setTag()
    }
  },
  methods: {
    setRegion() {
      if (this.detail.props) {
        const obj = JSON.parse(this.detail.props)
        if (this.detail.vendorType == 'ZSTACK') {
          this.detail.regionName = obj.regionName
          this.detail.zoneName = obj.azName
          return
        }
        this.detail.region = obj.region
        this.detail.zone = obj.az
        if ((this.detail.vendorType == 'VMWARE' || this.detail.vendorType == 'INSPURRAIL' || this.detail.vendorType == 'OPENSTACK') && this.detail.region) {
          getDictChildrenTree({ value: 'REGION' }).then(data => {
            if (data.success) {
              const region = data.data.find(item => item.value == obj.region)
              this.detail.regionName = region.name
              const az = region.children.find(item => item.value == obj.az)
              this.detail.zoneName = az.name
            }
          })
        }
      }
    },
    modifyTag() {
      this.tagData = {
        dialog: true,
        data: {
          resourceLabel: this.detail.resourceLabel ? JSON.parse(this.detail.resourceLabel) : [],
          serverIds: [this.detail.id],
          vendorId: this.detail.vendorId,
          type: 'COMPUTER'
        }
      }
    },
    setTag() {
      if (this.detail.resourceLabel) {
        const ary = JSON.parse(this.detail.resourceLabel)
        this.tagAry = []
        ary.forEach(item => {
          this.tagAry.push(item.key + ':' + item.value)
        })
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          modifyVm(this.modifyData.data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.modifyData.dialog = false
            }
          })
        }
      })
    },
    modifyName() {
      this.modifyData = {
        dialog: true,
        title: '名称',
        data: {
          name: this.detail.name,
          id: this.detail.id
        }
      }
    },
    modifyRemark() {
      this.modifyData = {
        dialog: true,
        title: '备注',
        data: {
          remark: this.detail.remark,
          id: this.detail.id
        }
      }
    }
  }
}
</script>
<style lang="scss"></style>

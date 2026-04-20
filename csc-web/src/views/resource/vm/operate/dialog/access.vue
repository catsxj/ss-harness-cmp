<template>
  <div>
    <el-dialog title="访问" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form inline v-if="addData.privateIpsList.length > 1">
        <el-form-item label="IP:">
          <el-select v-model="ip" @change="getData">
            <el-option v-for="item in addData.privateIpsList" :key="item.address" :value="item.address" :label="item.address"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-tabs v-model="viewData.proto">
        <el-tab-pane :label="key" v-for="(item, key) in tabData" :key="key" :name="key"> </el-tab-pane>
        <basic-form ref="viewData" :model="viewData" :status-icon="true">
          <basic-form-item v-if="viewData.proto != 'vnc'" label="系统账号:" prop="account" validate="required">
            <el-select v-model="viewData.account">
              <el-option v-for="item in tabData[viewData.proto]" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item v-else label="密码:" prop="misc.vncPassword" validate="required">
            <el-input type="password" v-model="viewData.misc.vncPassword"></el-input>
          </basic-form-item>
          <basic-form-item v-if="appclientData.length" label="客户端:" prop="misc.appclient" validate="required">
            <el-radio-group v-model="viewData.misc.appclient">
              <el-radio v-for="item in appclientData" :key="item.id" :label="item.id">{{ item.name }}</el-radio>
            </el-radio-group>
          </basic-form-item>
          <basic-form-item v-if="category == 'WINDOWS'" label="屏幕大小:" prop="misc.resolution" validate="required">
            <el-select v-model="viewData.misc.resolution">
              <el-option v-for="item in resolutionData" :key="item.value" :value="item.value" :label="item.name"></el-option>
            </el-select>
          </basic-form-item>
          <div v-if="category == 'APPLICATION' || category == 'DATABASE' || category == 'WINDOWS'">
            <basic-form-item label="磁盘映射:" prop="misc.disk">
              <el-checkbox-group v-model="viewData.misc.disk">
                <el-checkbox label="c"></el-checkbox>
                <el-checkbox label="d"></el-checkbox>
                <el-checkbox label="e"></el-checkbox>
                <el-checkbox label="f"></el-checkbox>
              </el-checkbox-group>
            </basic-form-item>
            <basic-form-item label="其他盘符:" prop="misc.other">
              <el-tooltip class="item" effect="light" content="输入盘符，使用,分隔" placement="top">
                <el-input v-model="viewData.misc.other"></el-input>
              </el-tooltip>
            </basic-form-item>
          </div>
          <basic-form-item v-if="category == 'WINDOWS'" label="启用Console连接:" prop="misc.isRdpConsole" label-width="150px">
            <el-checkbox v-model="viewData.misc.isRdpConsole">启用</el-checkbox>
          </basic-form-item>
        </basic-form>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="$emit('back')">取 消</el-button>
        <el-button type="primary" @click.native="viewSubmit">启 动</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { beforeAccessResource, accessResource } from 'services/platform/index'
import { getTenant } from 'services/system/tenant'
export default {
  props: {
    platformObject: {
      type: Object
    },
    addData: {
      type: Object
    }
  },
  components: {},
  filters: {},
  data() {
    return {
      category: this.addData.osCategory.toUpperCase(),
      tabData: {},
      appclientData: [],
      viewData: {
        misc: {}
      },
      ip: '',
      resolutionData: [
        { name: '800x600', value: '800x600' },
        { name: '1024x768', value: '1024x768' },
        { name: '1280x1024', value: '1280x1024' },
        { name: '全屏', value: 'fullscreen' },
        { name: '最大化', value: 'maximize' }
      ]
    }
  },
  methods: {
    viewSubmit() {
      this.$refs.viewData.validate(valid => {
        if (valid) {
          const viewData = JSON.parse(JSON.stringify(this.viewData))
          if (this.viewData.misc.other) {
            const other = this.viewData.misc.other.split(',')
            other.forEach(element => {
              if (viewData.misc.disk.indexOf(element) == -1) {
                viewData.misc.disk.push(element)
              }
            })
            delete viewData.misc.other
          }
          viewData.account = viewData.account.replace(/(^\*)/, '')
          if (this.viewData.misc.resolution == 'maximize') {
            viewData.misc.resolution = window.screen.availWidth + 'x' + window.screen.availHeight + ':maximize'
          } else if (this.viewData.misc.resolution == 'fullscreen') {
            viewData.misc.resolution = window.screen.width + 'x' + window.screen.height + ':fullscreen'
          }
          if (this.viewData.proto == 'vnc') {
            delete viewData.account
          }
          viewData.ip = this.ip
          accessResource('access', viewData).then(data => {
            if (data.success) {
              // window.open(data.data, '_blank', 'scrollbars=yes,resizable=1,modal=false,alwaysRaised=yes')
              window.location.href = data.data
              this.addData.dialog = false
              this.$emit('back')
              this.$parent.emit()
            } else {
              this.addData.dialog = false
            }
          })
        }
      })
    },
    getData() {
      beforeAccessResource(this.addData.id, {
        ip: this.ip
      }).then(data => {
        if (data.success) {
          this.tabData = data.data.proAccsMap
          this.viewData.proto = Object.keys(this.tabData)[0]
          if (this.category == 'APPLICATION' || this.category == 'DATABASE') {
            this.appclientData = data.data.appClient
            this.$set(this.viewData.misc, 'appclient', this.appclientData[0].id || '')
            this.$set(this.viewData.misc, 'disk', [])
          }
          this.viewData.account = data.data.defaultAcc
        } else {
          this.addData.dialog = false
        }
      })
    }
  },
  created() {
    if (this.addData.privateIpsList.length) {
      this.ip = this.addData.privateIpsList[0].address
    }
    this.viewData = {
      id: this.addData.id,
      account: '',
      proto: '',
      misc: {
        isDualAuth: false,
        resolution: ''
      }
    }
    if (this.category == 'WINDOWS') {
      this.$set(this.viewData.misc, 'isRdpConsole', false)
      this.$set(this.viewData.misc, 'disk', [])
    }
    if (this.category == 'LINUX') {
      this.viewData.misc.resolution = '80x24'
    } else {
      this.viewData.misc.resolution = 'maximize'
    }
    this.getData()
  },
  mounted() {},
  watch: {}
}
</script>

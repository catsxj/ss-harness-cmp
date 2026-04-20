<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview" label-width="130px">
    <!--http-->
    <el-row>
      <el-col :span="24" class="title"> nginx http配置 </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <basic-form-item label="文件推送：" prop="nginx_http_params.sendfile" validate="required">
          <el-select filterable v-model="itemData.nginx_http_params.sendfile">
            <el-option v-for="(row, index) in booleanData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="启用服务标志：" prop="nginx_http_params.server_tokens" validate="required">
          <el-select filterable v-model="itemData.nginx_http_params.server_tokens">
            <el-option v-for="(row, index) in booleanData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <basic-form-item label="禁止推送TCP：" prop="nginx_http_params.tcp_nopush" validate="required">
          <el-select filterable class="el_input" v-model="itemData.nginx_http_params.tcp_nopush">
            <el-option v-for="(row, index) in booleanData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="禁止TCP延迟：" prop="nginx_http_params.tcp_nodelay" validate="required">
          <el-select filterable v-model="itemData.nginx_http_params.tcp_nodelay">
            <el-option v-for="(row, index) in booleanData" :key="index" :label="row.name" :value="row.value"> </el-option>
          </el-select>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <basic-form-item label="接口日志：" prop="nginx_http_params.access_log" validate="required">
          <el-input v-model="itemData.nginx_http_params.access_log"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="错误日志：" prop="nginx_http_params.error_log">
          <el-input v-model="itemData.nginx_http_params.error_log"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <basic-form-item label="自定义配置：">
          <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.nginx_http_params.options, '')">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <NginxPart :options="itemData.nginx_http_params.options" type="textarea"></NginxPart>
    <!--站点-->
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">
        nginx 站点配置
        <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addSiteItem">新增</el-button>
      </el-col>
    </el-row>
    <div v-for="(row, index) in itemData.nginx_sites" :key="'site' + index" class="search-container">
      <el-button v-if="!isPreview" type="text" class="del_operate" @click="removeItem(itemData.nginx_sites, index)">
        <i class="el-icon-delete" />
      </el-button>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="名称：" :prop="`nginx_sites.${index}.name`" validate="required">
            <el-input v-model="row.name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="监听端口：" :prop="`nginx_sites.${index}.listen`" validate="required,port">
            <el-input v-model="row.listen"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="服务名称：" :prop="`nginx_sites.${index}.server_name`" validate="required">
            <el-input v-model="row.server_name"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="索引：">
            <el-input v-model="row.index"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="目录：" :prop="`nginx_sites.${index}.root`" validate="required">
            <el-input v-model="row.root"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <basic-form-item label="location：">
            <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(row.location, '')">新增</el-button>
            <el-tooltip class="item" effect="dark" content="/ { proxy_pass http://cmc; proxy_pass http://csc; }" placement="top-start">
              <i class="el-icon-question cur-point m-l font-large text-info"></i>
            </el-tooltip>
          </basic-form-item>
        </el-col>
      </el-row>
      <NginxPart :options="row.location" type="textarea" placeholder="/ { proxy_pass http://cmc; proxy_pass http://csc; }"></NginxPart>
    </div>
    <!--nginx-->
    <el-row>
      <el-col :span="24" class="line"></el-col>
      <el-col :span="24" class="title">nginx 配置</el-col>
    </el-row>
    <!--proxy-->
    <el-row>
      <el-col :span="24">
        <basic-form-item label="proxy配置：">
          <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.nginx_configs.proxy, '')">新增</el-button>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              <div>proxy配置时只能配置附加通用的设置，针对每个站点proxy_pass需要在站点内配置，此处配置格式如下：</div>
              <div>proxy_set_header X-Real-IP $remote_addr;</div>
              <div>proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for <span class="text-danger">(注：配置末尾不能加分号)</span></div>
            </div>
            <i class="el-icon-question cur-point m-l font-large text-info"></i>
          </el-tooltip>
        </basic-form-item>
      </el-col>
    </el-row>
    <NginxPart :options="itemData.nginx_configs.proxy" type="textarea"></NginxPart>
    <!--upstream-->
    <el-row>
      <el-col :span="24">
        <basic-form-item label=" upstream 配置：">
          <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.nginx_configs.upstream, '')">新增</el-button>
          <el-tooltip class="item" effect="dark" content="upstream cmc { server 10.20.2.100:8080 weight=2; server 10.20.2.101:8080 weight=1; }" placement="top-start">
            <i class="el-icon-question cur-point m-l font-large text-info"></i>
          </el-tooltip>
        </basic-form-item>
      </el-col>
    </el-row>
    <NginxPart :options="itemData.nginx_configs.upstream" type="textarea" placeholder="upstream cmc { server 10.20.2.100:8080 weight=2; server 10.20.2.101:8080 weight=1; }"></NginxPart>
    <!--geo-->
    <el-row>
      <el-col :span="24">
        <basic-form-item label="geo 配置：">
          <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.nginx_configs.geo, '')">新增</el-button>
          <el-tooltip class="item" effect="dark" content="geo $geo { default 0; 10.20.2.1/24 csc; 10.20.12.1/24 cmc; }" placement="top-start">
            <i class="el-icon-question cur-point m-l font-large text-info"></i>
          </el-tooltip>
        </basic-form-item>
      </el-col>
    </el-row>
    <NginxPart :options="itemData.nginx_configs.geo" type="textarea" placeholder="geo $geo { default 0; 10.20.2.1/24 csc; 10.20.12.1/24 cmc; }"></NginxPart>
    <!--ssl-->
    <el-row>
      <el-col :span="24">
        <basic-form-item label="ssl配置：">
          <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.nginx_configs.ssl, '')">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <NginxPart :options="itemData.nginx_configs.ssl"></NginxPart>
    <!--gzip-->
    <el-row>
      <el-col :span="24">
        <basic-form-item label="gzip配置：">
          <el-button v-if="!isPreview" type="primary" size="mini" @click="addItem(itemData.nginx_configs.gzip, '')">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <NginxPart :options="itemData.nginx_configs.gzip"></NginxPart>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
import software from '../mixins/itemOperate'
import NginxPart from '../NginxPart.vue'

const booleanData = [
  { name: 'on', value: 'on' },
  { name: 'off', value: 'off' }
]
export default {
  components: { NginxPart },
  mixins: [node, show, software],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          nginx_http_params: {
            sendfile: 'on',
            tcp_nopush: 'on',
            tcp_nodelay: 'on',
            server_tokens: 'off',
            access_log: '/var/log/nginx/access.log',
            error_log: '/var/log/nginx/error.log error',
            options: []
          },
          nginx_sites: [],
          nginx_configs: {
            proxy: [],
            upstream: [],
            geo: [],
            ssl: [],
            gzip: []
          }
        }
      }
    }
  },
  data() {
    return {
      booleanData
    }
  },
  created() {
    if (this.itemData.nginx_sites instanceof Object) this.readData()
  },
  methods: {
    readData() {
      const nginxSites = []
      const { nginx_sites } = this.itemData
      Object.keys(nginx_sites).forEach((item) => {
        nginxSites.push({
          name: item,
          ...nginx_sites[item]
        })
      })
      this.itemData.nginx_sites = nginxSites
    },
    addSiteItem() {
      this.itemData.nginx_sites.push({
        listen: 80,
        index: 'index.html',
        location: []
      })
    },
    handlePostData() {
      const nginx_sites = {}
      const { nginx_sites: nginxSites, nginx_configs, nginx_http_params } = this.itemData
      // 对站点名称和端口做唯一性校验
      const siteKeyMap = {}
      const sitePortMap = {}
      let siteFlag = true
      for (const item of nginxSites) {
        if (siteKeyMap[item.name]) {
          this.$message.error(`站点配置中名称【${item.name}】存在重复项，请检查`)
          siteFlag = false
          break
        }
        if (sitePortMap[item.listen]) {
          this.$message.error(`站点配置中端口【${item.listen}】存在重复项，请检查`)
          siteFlag = false
          break
        }
        siteKeyMap[item.name] = true
        sitePortMap[item.listen] = true
        const { listen, server_name, root, index, location } = item
        nginx_sites[item.name] = { listen, server_name, root, index, location }
      }
      if (!siteFlag) return false
      return {
        nginx_http_params,
        nginx_configs,
        nginx_sites
      }
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          data = this.handlePostData()
        }
      })
      return data
    }
  }
}
</script>
<style scoped lang="scss">
@import 'index';
</style>

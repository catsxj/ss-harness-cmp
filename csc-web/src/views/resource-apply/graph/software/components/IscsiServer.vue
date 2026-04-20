<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="12">
        <basic-form-item label="IQN名称：" prop="iscsi_config.iqn_name" validate="required">
          <el-input v-model="itemData.iscsi_config.iqn_name"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="用户：" prop="iscsi_config.iscsi_username" validate="required">
          <el-input v-model="itemData.iscsi_config.iscsi_username"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="12">
        <basic-form-item label="密码：" prop="iscsi_config.iscsi_password" validate="required">
          <el-input type="password" v-model="itemData.iscsi_config.iscsi_password" placeholder="密码设置" show-password></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <basic-form-item label="磁盘：">
          <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addItem(server_disks)">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :span="12" v-for="(item, index) in server_disks" :key="index">
        <basic-form-item :label="`磁盘${index + 1}：`" placeholder="/dev/sdb" :prop="`iscsi_config.server_disks.${index}`" validate="required">
          <el-input v-model="server_disks[index]">
            <template slot="append">
              <i class="el-icon-delete text-danger cur-point" @click="removeItem(server_disks, index, 'required')" />
            </template>
          </el-input>
        </basic-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import node from '../../mixins/index'
import show from '../../mixins/show'
import { encrypt, decrypt } from 'utils/crypto'
import { computed } from '@vue/composition-api'
export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          iscsi_config: {
            server_disks: [''],
            iqn_name: '',
            iscsi_username: '',
            iscsi_password: ''
          }
        }
      }
    }
  },
  data() {
    return {}
  },
  created() {
    const {
      iscsi_config: { iscsi_password }
    } = this.itemData
    if (iscsi_password) {
      this.itemData.iscsi_config.iscsi_password = decrypt(iscsi_password)
    }
  },
  setup(props) {
    const server_disks = computed(() => props.itemData.iscsi_config.server_disks)
    return {
      server_disks
    }
  },
  methods: {
    addItem(row) {
      row.push('')
    },
    removeItem(data, index, required) {
      if (required && data.length === 1) {
        this.$message.error('至少存在一个该节点')
        return
      }
      data.splice(index, 1)
    },
    getPostData() {
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          const itemData = cloneDeep(this.itemData)
          const {
            iscsi_config: { iscsi_password }
          } = itemData
          if (iscsi_password) {
            itemData.iscsi_config.iscsi_password = encrypt(iscsi_password)
          }
          data = itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>

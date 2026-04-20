<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-row>
      <el-col :span="24">
        <basic-form-item label="磁盘映射：">
          <el-button v-if="!isPreview" class="m-l" type="primary" size="mini" @click="addItem(itemData.mount_pointers)">新增</el-button>
        </basic-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="10" v-for="(item, index) in itemData.mount_pointers" :key="index">
      <el-col :span="8">
        <basic-form-item label="服务端IP：" placeholder="192.168.1.1" :prop="`mount_pointers.${index}.nfs_host`" validate="required,ip">
          <el-input v-model="item.nfs_host"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="8">
        <basic-form-item label="服务端路径：" label-width="110px" :prop="`mount_pointers.${index}.nfs_path`" validate="required">
          <el-input v-model="item.nfs_path" auto-complete="off"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="7">
        <basic-form-item label="客户端路径" :prop="`mount_pointers.${index}.client_path`" validate="required">
          <el-input v-model="item.client_path"></el-input>
        </basic-form-item>
      </el-col>
      <el-col :span="1" v-if="!isPreview">
        <el-button type="text" class="del_cell" @click.native="removeItem(itemData.mount_pointers, index, 'required')">
          <i class="el-icon-delete" />
        </el-button>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          nfs_client: true,
          mount_pointers: [{}]
        }
      }
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    addItem(row) {
      row.push({})
    },
    removeItem(data, index, required) {
      if (required && data.length === 1) {
        this.$message.error('至少存在一个该节点')
        return
      }
      data.splice(index, 1)
    }
  }
}
</script>

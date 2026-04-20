<template>
  <div>
    <div>
      <template v-for="(item, index) in tagList">
        <el-tag class="m-l-xs" :key="index" v-if="item.catalog === 'root'" :disable-transitions="false" @click.stop="modify(item, index)" @close.stop="handleClose(item, index)">
          {{ item.device }}
        </el-tag>
        <el-tag class="m-l-xs" :key="index" v-else closable :disable-transitions="false" @click.stop="modify(item, index)" @close.stop="handleClose(item, index)">
          {{ item.device }}
        </el-tag>
      </template>
      <el-button size="mini" @click="add" type="primary" class="m-l-md">添加</el-button>
      <span class="mine-text m-l-md" v-if="!tagList.length">默认第一块为系统盘，其余为数据盘</span>
    </div>
    <add :add-data="addData" v-if="addData.dialog" @ok="addOk" :now-list="tagList"></add>
  </div>
</template>

<script>
import add from './add.vue'
export default {
  components: {
    add
  },
  props: {
    networkList: {
      type: Array
    },
    diskId: {
      type: [String, Number]
    },
    type: {
      type: String
    },
    imageData: {
      type: Array
    },
    source: {
      type: String
    },
    parentData: {
      type: Object
    }
  },
  watch: {
    diskId: {
      handler(newVal, oldVal) {
        this.tagList = []
        const result = this.imageData.filter(item => Number(item.id) === Number(newVal))
        if (result.length !== 0) {
          const rows = result[0]
          if (rows.blockDeviceMappings) {
            JSON.parse(rows.blockDeviceMappings).forEach((item, index) => {
              const newItem = {
                device: item.deviceName
              }
              if (item.ebs) {
                newItem.size = item.ebs.volumeSize ? item.ebs.volumeSize : 40
                newItem.category = item.ebs.volumeTypeAsString
              }
              if (item.deviceName === rows.rootDeviceName) {
                newItem.catalog = 'root'
              } else {
                newItem.catalog = 'EBS'
              }
              this.tagList.push(newItem)
              if (rows.osCategory === 'windows') {
                this.deviceList = this.deviceListWin
              } else {
                this.deviceList = this.deviceListLinux
              }
            })
          } else {
          }
        }
      }
    }
  },
  created() {
    if (this.parentData && this.parentData.diskDevices) {
      this.tagList = this.parentData.diskDevices
    }
  },
  data() {
    return {
      tagList: [],
      deviceList: [],
      deviceListLinux: [
        {
          name: '/dev/sdb',
          value: '/dev/sdb'
        },
        {
          name: '/dev/sdc',
          value: '/dev/sdc'
        },
        {
          name: '/dev/sdd',
          value: '/dev/sdd'
        },
        {
          name: '/dev/sde',
          value: '/dev/sde'
        },
        {
          name: '/dev/sdf',
          value: '/dev/sdf'
        },
        {
          name: '/dev/sdg',
          value: '/dev/sdg'
        },
        {
          name: '/dev/sdh',
          value: '/dev/sdh'
        },
        {
          name: '/dev/sdi',
          value: '/dev/sdi'
        },
        {
          name: '/dev/sdj',
          value: '/dev/sdj'
        },
        {
          name: '/dev/sdk',
          value: '/dev/sdk'
        },
        {
          name: '/dev/sdl',
          value: '/dev/sdl'
        }
      ],
      deviceListWin: [
        {
          name: 'xvdb',
          value: 'xvdb'
        },
        {
          name: 'xvdc',
          value: 'xvdc'
        },
        {
          name: 'xvdd',
          value: 'xvdd'
        },
        {
          name: 'xvde',
          value: 'xvde'
        },
        {
          name: 'xvdf',
          value: 'xvdf'
        },
        {
          name: 'xvdg',
          value: 'xvdg'
        },
        {
          name: 'xvdh',
          value: 'xvdh'
        },
        {
          name: 'xvdi',
          value: 'xvdi'
        },
        {
          name: 'xvdj',
          value: 'xvdj'
        },
        {
          name: 'xvdk',
          value: 'xvdk'
        },
        {
          name: 'xvdl',
          value: 'xvdl'
        }
      ],
      devices: [],
      addData: {
        dialog: false,
        data: {}
      },
      modifyData: {
        dialog: false,
        data: {}
      },
      nowList: []
    }
  },
  methods: {
    handleClose(data, index) {
      this.tagList.splice(index, 1)
    },
    getDevices() {
      let list = this.deviceList
      if (this.tagList.length == 0) {
        this.$message.error('请先选择系统盘！')
        return []
      }
      if (this.tagList.length > 1) {
        this.tagList.forEach((item, index) => {
          if (item.catalog === 'EBS') {
            list = list.filter(row => row.value !== item.device)
          }
        })
        return list
      } else {
        if (this.tagList[0].catalog === 'root') {
          return list
        }
      }
    },
    add() {
      const list = this.getDevices()
      if (list.length) {
        this.addData = {
          dialog: true,
          title: '新增磁盘',
          deviceList: list,
          data: {
            device: '',
            size: 0,
            catalog: 'EBS',
            category: ''
          }
        }
      }
    },
    modify(data, index) {
      const list = this.getDevices()
      const arr = [
        {
          name: data.device,
          value: data.device
        }
      ]
      const ss = data.catalog === 'EBS' ? list.concat(arr) : []
      this.addData = {
        dialog: true,
        index: index,
        title: '编辑磁盘',
        deviceList: ss,
        data: {
          catalog: data.catalog,
          device: data.device,
          size: data.size,
          category: data.category ? data.category : 'gp2',
          deleteWithInstance: data.deleteWithInstance
        }
      }
    },
    addOk(data) {
      if (data.index >= 0) {
        this.tagList[data.index] = data.data
      } else {
        this.tagList.push(data.data)
      }
    },
    ok() {
      return this.tagList
    }
  }
}
</script>

<style scoped>
.mine-text {
  font-size: 10px;
  color: #b4b4b4;
}
</style>

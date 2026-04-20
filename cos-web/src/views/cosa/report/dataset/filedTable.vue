<template>
  <div>
    <el-table border :data="data" ref="tableRef" @select="handleSelection" @select-all="handleSelection">
      <el-table-column type="selection" width="50px"></el-table-column>
      <el-table-column label="字段名" prop="alias">
        <template slot-scope="scope">
          <el-input v-model="scope.row.alias" @blur="updateItem('alias', scope.row.alias, scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="原始名" prop="name"></el-table-column>
      <el-table-column label="字段类型" prop="typeAlias">
        <template slot-scope="scope">
          <el-select :value="scope.row.typeAlias" @change="updateItem('typeAlias', $event, scope.row)">
            <el-option v-for="item in filedTypes" :key="item.value" :value="item.value" :label="item.name"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="原始类型" prop="typeName">
        <template slot-scope="scope">
          <span>{{ filterType(scope.row.typeName) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="维度/指标转换">
        <template slot-scope="scope">
          <el-button circle icon="el-icon-sort" @click="exchange(scope.row)"></el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="openReflect(scope.row)" v-if="scope.row.name != 'JS片段'">值替换</el-button>
          <el-button type="text" @click="emit('edit', scope.row)" v-if="scope.row.calc">编辑</el-button>
          <el-button type="text" @click="emit('delete', scope.row.id)" v-if="scope.row.calc">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="visible" title="值替换" :append-to-body="true">
      <el-table :data="reflectList" border>
        <el-table-column label="原始值">
          <template slot-scope="scope">
            <el-input v-model="scope.row.key"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="替换值">
          <template slot-scope="scope">
            <el-input v-model="scope.row.value"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="danger" icon="el-icon-delete" circle size="small" @click="deleteReflect(scope.$index)" :disabled="reflectList.length == 1"></el-button>
            <el-button
              type="primary"
              icon="el-icon-plus"
              circle
              size="small"
              v-if="scope.$index == reflectList.length - 1"
              :disabled="!scope.row.key.trim() || !scope.row.value.trim()"
              @click="createReflect"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="confirmReflect">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { updateFeildById, updateFeildReflect, getReflect } from '@/services/reportform/dataset'

import { defineComponent, ref, nextTick, watch } from '@vue/composition-api'
import { Message } from 'element-ui'

export default defineComponent({
  props: ['data', 'filedList', 'filedTypes'],
  setup(props, { emit }) {
    const tableRef = ref()
    watch(
      () => props.data,
      val => {
        if (val?.length) {
          nextTick(() => {
            props.data.forEach(item => {
              tableRef.value.toggleRowSelection(item, item.enable)
            })
          })
        }
      }
    )
    function filterType(val) {
      return props.filedTypes.find(item => item.value == val)?.name || val
    }
    function exchange(data) {
      const { coordinate } = data
      updateItem('coordinate', !coordinate, data)
    }
    function updateItem(key, value, data) {
      const { id } = data
      updateFiled(id, { ...data, [key]: value }).then(() => {
        data[key] = value
      })
    }
    function updateFiled(id, params) {
      return new Promise((resolve, reject) => {
        updateFeildById(params, id).then(({ success }) => {
          if (success) resolve(success)
          else reject(new Error())
        })
      })
    }
    function handleSelection(selection, row) {
      if (row) {
        const { enable } = row
        updateItem('enable', !enable, row)
      } else {
        props.data.forEach(item => {
          updateItem('enable', !!selection.length, item)
        })
      }
    }
    const itemData = ref({})
    const reflectList = ref([{}])
    const visible = ref(false)
    const reflectModel = {
      key: '',
      value: ''
    }
    async function openReflect(record) {
      itemData.value = { ...record }
      const { data, success } = await getReflect(record.id)
      if (success) {
        visible.value = true
        reflectList.value = data?.length ? data : [{ ...reflectModel }]
      }
    }
    function createReflect() {
      reflectList.value.push({ ...reflectModel })
    }
    function deleteReflect(index) {
      reflectList.value.splice(index, 1)
    }
    async function confirmReflect() {
      const { id } = itemData.value
      const { success, message } = await updateFeildReflect(
        reflectList.value.filter(item => item.key && item.value),
        id
      )
      if (success) {
        Message.success(message)
        visible.value = false
      }
    }
    return {
      tableRef,
      filterType,
      exchange,
      updateItem,
      handleSelection,
      emit,
      visible,
      itemData,
      reflectList,
      openReflect,
      createReflect,
      deleteReflect,
      confirmReflect
    }
  }
})
</script>

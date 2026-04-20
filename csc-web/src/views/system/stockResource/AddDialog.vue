<template>
  <el-dialog title="资源认领" :close-on-click-modal="false" :visible.sync="dialog.visible" width="600px">
    <basic-form ref="addFormRef" :model="addData" label-width="120px">
      <basic-form-item :label="$store.getters.systemConfig.projectConfigLabel + '列表：'" prop="projectId" validate="required">
        <el-select v-model="addData.projectId" placeholder="请选择" clearable filterable>
          <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="用户归属：" prop="userName" validate="required">
        <el-input v-model="addData.userName" disabled auto-complete="off"></el-input>
      </basic-form-item>
      <basic-form-item label="使用周期：" prop="duration" validate="required" v-if="false">
        <el-date-picker v-model="addData.duration" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" clearable value-format="yyyy-MM-dd"></el-date-picker>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { computed, ref } from '@vue/composition-api'
import { Message } from 'element-ui'
import { conditionProject } from 'services/system/project'
import { vmUsersByCmp } from 'services/platform/index'

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  setup(props, context) {
    const userData = computed(() => context.root.$store.getters.userData)
    const addData = ref({
      tenantId: userData.value.tenantId || userData.value.id,
      userId: userData.value.id,
      userName: userData.value.name,
      projectId: ''
    })

    const projectList = ref([])
    const getProjectList = () => {
      conditionProject({
        condition: JSON.stringify({
          condition: 'listApplyProjects'
        })
      }).then(data => {
        if (data.success) {
          projectList.value = data.data
        }
      })
    }
    getProjectList()

    const addFormRef = ref(null)
    const loading = ref(false)
    // 代码容错处理
    function addSubmit() {
      ;(addFormRef.value || context.refs.addFormRef).validate(async valid => {
        if (valid) {
          loading.value = true
          const data = await vmUsersByCmp({ ...addData.value, resourceCategory: 'Computer', ids: props.dialog.ids }).finally(() => {
            loading.value = false
          })
          if (data.success) {
            Message({
              message: data.message,
              type: 'success'
            })
            props.dialog.visible = false
          }
        }
      })
    }

    const createShortcuts = (list = []) =>
      list.map(([text, num]) => ({
        text,
        onClick(picker) {
          const start = new Date()
          const end = new Date()
          end.setMonth(start.getMonth() + num)
          picker.$emit('pick', [start, end])
        }
      }))
    return {
      addData,
      loading,
      pickerOptions: {
        // 1、无法选择当日之前的时间点
        // 2、时间选择器左侧提供快速填充功能，时间段包含一个月、两个月、三个月、四个月、五个月、半年、一年、两年、三年
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        },
        shortcuts: createShortcuts([
          ['一个月', 1],
          ['两个月', 2],
          ['三个月', 3],
          ['四个月', 4],
          ['五个月', 5],
          ['半年', 6],
          ['一年', 12],
          ['两年', 24],
          ['三年', 36]
        ])
      },
      addFormRef,
      addSubmit,
      projectList
    }
  }
}
</script>
<style lang="scss" scoped></style>

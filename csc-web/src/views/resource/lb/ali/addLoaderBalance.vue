<template>
  <div>
    <el-card>
      <basic-form label-width="140px">
        <el-row>
          <el-col :span="12">
            <basic-form-item label="所属地域：" validate="required" require-message="请选择地域">
              <el-select v-model="value">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="负载均衡器类型：">
              <el-radio-group v-model="radio">
                <el-radio :label="1">应用程序负载均衡器</el-radio>
                <el-radio :label="2">网络负载均衡器</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="名称：" validate="required" require-message="仅允许a-z、A-Z、0-9和连字符">
              <el-input v-model="input" placeholder="请输入名称"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="模式：">
              <el-radio-group v-model="mode" @change="changeClassification">
                <el-radio :label="1">面向Internet</el-radio>
                <el-radio :label="2">内部</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="IP地址类型：" validate="required" require-message="请选择IP地址类型">
              <el-select v-model="classification" v-if="!classificationStatus" placeholder="请选择IP地址类型">
                <el-option value="ipv4" label="ipv4"></el-option>
                <el-option value="dualstack" label="dualstack"></el-option>
              </el-select>
              <el-select v-model="classification" v-if="classificationStatus" disabled>
                <el-option value="ipv4" label="ipv4" disabled></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="侦听器：  ">
              <basic-table :data="dataList" v-if="radio === 1">
                <el-table-column label="负载均衡器协议" prop="a">
                  <template slot-scope="scope">
                    <el-select style="width: 50%" v-model="scope.row.a" @change="changeData(scope.row.a, scope.$index)">
                      <el-option value="aa" label="TCP"></el-option>
                      <el-option value="bb" label="UDP"></el-option>
                      <el-option value="cc" label="TCP_UDP"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="负载均衡器端口" prop="b">
                  <template slot-scope="scope">
                    <el-input style="width: 50%" v-model="scope.row.b"></el-input>
                  </template>
                </el-table-column>
                <el-table-column width="200">
                  <template slot-scope="scope">
                    <el-button type="text" @click.native.prevent="deleteRow(scope.$index, dataList)"><i class="el-icon-delete"></i> 删除 </el-button>
                  </template>
                </el-table-column>
                <div slot="pagination"></div>
              </basic-table>
              <basic-table :data="dataList2" v-if="radio === 2">
                <el-table-column label="负载均衡器协议" prop="a">
                  <template slot-scope="scope">
                    <el-select style="width: 50%" v-model="scope.row.a" @change="changeData(scope.row.a, scope.$index)">
                      <el-option value="aa" label="HTTP"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="负载均衡器端口" prop="b">
                  <template slot-scope="scope">
                    <el-input style="width: 50%" v-model="scope.row.b"></el-input>
                  </template>
                </el-table-column>
                <el-table-column width="200">
                  <template slot-scope="scope">
                    <el-button type="text" @click.native.prevent="deleteRow(scope.$index, dataList2)"><i class="el-icon-delete"></i> 删除 </el-button>
                  </template>
                </el-table-column>
                <div slot="pagination"></div>
              </basic-table>
              <el-button type="primary" @click="addRow">添加帧听器</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <basic-form-item label="VPC：">
              <el-select v-model="value2" clearable>
                <el-option label="test" value="test"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <basic-form-item label="可用区：">
              <el-row>
                <el-col :span="3">
                  <el-checkbox v-model="checked">cn-north-1a</el-checkbox>
                </el-col>
                <el-col :span="21">
                  <el-row>
                    <el-select v-model="value" style="width: 50%">
                      <el-option label="test" value="test"></el-option>
                    </el-select>
                  </el-row>
                  <el-row>
                    <el-col :span="3">IPv4地址</el-col>
                    <el-col :span="21"> 从CIDR分配172.31.16.0/20 </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="3">私有IPv4地址</el-col>
                    <el-col :span="21">
                      <el-select style="width: 60%" v-model="testValue"></el-select>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="3">
                  <el-checkbox v-model="checked">cn-north-1a</el-checkbox>
                </el-col>
                <el-col :span="21">
                  <el-row>
                    <el-select v-model="value" style="width: 50%">
                      <el-option label="test" value="test"></el-option>
                    </el-select>
                  </el-row>
                  <el-row>
                    <el-col :span="3">IPv4地址</el-col>
                    <el-col :span="21"> 从CIDR分配172.31.16.0/20 </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="3">私有IPv4地址</el-col>
                    <el-col :span="21">
                      <el-select style="width: 60%" v-model="testValue"></el-select>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!--              <el-row>-->
              <!--                <el-col :span="3">-->
              <!--                  <el-checkbox v-model="checked">cn-north-1b</el-checkbox>-->
              <!--                </el-col>-->
              <!--              </el-row>-->
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'addLoaderBalance',
  data() {
    return {
      testValue: '',
      value2: '',
      value: '',
      options: [
        { value: '选项1', label: '中国北京' },
        { value: '选项2', label: '中国上海' }
      ],
      radio: 1,
      input: '',
      mode: 1,
      classification: '',
      classificationStatus: false,
      dataList: [{ a: 'aa', b: 80 }],
      dataList2: [{ a: 'aa', b: 80 }],
      checked: true
    }
  },
  methods: {
    changeData(name, index) {
      switch (name) {
        case 'aa':
          this.dataList[index].b = 80
          break
        case 'bb':
          this.dataList[index].b = 53
          break
        case 'cc':
          this.dataList[index].b = 53
      }
    },
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    addRow() {
      if (this.radio === 1) {
        this.dataList.push({ a: '选择协议', b: null })
      }
      if (this.radio === 2) {
        this.dataList2.push({ a: 'HTTP', b: 80 })
      }
    },
    changeClassification() {
      if (this.mode === 2) {
        this.classification = 'ipv4'
        this.classificationStatus = true
      } else {
        this.classification = ''
        this.classificationStatus = false
      }
    },
    goBack() {
      sessionStorage.setItem('platformId', this.serverId)
      this.$router.back(-1)
    }
  }
}
</script>

<style scoped></style>

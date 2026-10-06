<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

import { getPointList, getPointlabel, getPointpage } from '@/api/pointmanage'

const leveloptions = ref([])
const pointlist = ref([])
const columns = ref([])
const total = ref(0)
const currentpage = ref(1)
const pagesize = ref(5)
const disabled = ref(false)
const background = ref(false)
// 模板中 el-form 使用的表单对象与校验规则
const form = ref({ plantLevel: '' })
const rules = ref({})

// 等级筛选项
getPointList().then((res) => {
  leveloptions.value = res.data.data
})

// 表头列配置
getPointlabel().then((res) => {
  columns.value = res.data.data.columns
})

// 分页查询
const loadPage = (currentpage, pagesize) => {
  getPointpage(currentpage, pagesize).then((res) => {
    pointlist.value = res.data.data
    total.value = res.data.total
    res.data.data.forEach((item) => {
      item.lastUpdate = new Date(item.lastUpdate).toLocaleString('zh-CN', { dateStyle: 'long' })
    })
  })
}
// 一直
const timer = setInterval(() => {
  loadPage(currentpage, pagesize)
}, 5000)
// 停止
console.log(timer)
// clearInterval(timer)

const onEditManage = (row) => {
  ElMessage.success('修改成功')
}
const onDeleteManage = (row) => {
  ElMessage.success('删除成功')
}
</script>

<template>
  <el-card class="box-card">
    <template #header>
      <el-form ref="formref" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="种植适宜等级" prop="plantLevel">
          <el-select placeholder="请选择" width="35px">
            <el-option
              v-for="item in leveloptions"
              :key="item.deviceID"
              :label="item.level"
              value="item.level"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </template>

    <el-table :data="pointlist" style="width: 100%" height="250">
      <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label" />
      <el-table-column label="操作" width="100px">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            type="primary"
            circle
            plain
            @click="onEditManage(row)"
          ></el-button>
          <el-button
            type="danger"
            plain
            circle
            :icon="Delete"
            @click="onDeleteManage(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-pagination
        v-model:current-page="currentpage"
        v-model:page-size="pagesize"
        :page-sizes="[2, 4, 5, 10]"
        :default-page-size="5"
        :disabled="disabled"
        :background="background"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @change="() => loadPage(currentpage, pagesize)"
      />
    </template>
  </el-card>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
.el-pagination {
  height: 50px;
}
.el-card {
  margin: 0;
  padding: 0;
  max-height: 110%;
  box-sizing: border-box;
}
</style>

<template>
  <div id="spaceManagePage">
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <div class="button-container">
        <a-space>
          <a-button type="primary" href="/add_space" target="blank">+ 创建空间</a-button>
        </a-space>
      </div>
    </a-flex>
    <!-- 搜索表单 -->
    <div class="search-form-container">
      <a-form :model="searchParams" @finish="doSearch" class="custom-form">
        <div class="form-row">
          <a-form-item label="空间名称" class="form-item">
            <a-input v-model:value="searchParams.spaceName" placeholder="输入空间名称" allowClear />
          </a-form-item>
          <a-form-item label="空间级别" name="spaceLevel" class="form-item">
            <a-select
              v-model:value="searchParams.spaceLevel"
              placeholder="请选择空间级别"
              :options="SPACE_LEVEL_OPTIONS"
              allowClear
            />
          </a-form-item>
          <a-form-item label="用户Id" class="form-item">
            <a-input v-model:value="searchParams.userId" placeholder="输入用户Id" allowClear />
          </a-form-item>
          <a-form-item class="form-item submit-item">
            <a-button type="primary" html-type="submit">搜索</a-button>
          </a-form-item>
        </div>
      </a-form>
    </div>

    <!-- 用户管理表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div>空间级别：{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</div>
        </template>
        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
          <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">{{
          dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
        <template v-else-if="column.dataIndex === 'editTime'">{{
          dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <router-link :to="{ path: '/add_space', query: { id: record.id } }">
              <a-button type="link">编辑</a-button>
            </router-link>
            <a-button danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { listSpaceByPageUsingPost } from '@/api/spaceController'
import { onMounted, ref, reactive, computed } from 'vue'
import dayjs from 'dayjs'
import { deleteSpaceUsingPost } from '@/api/spaceController'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { formatSize } from '@/utils/index'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<API.Space[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

//分页参数
const pagination = computed(() => ({
  current: searchParams.current,
  pageSize: searchParams.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
}))

//表格变化之后重新获取数据
const doTableChange = (paginationInfo: { current: number; pageSize: number }) => {
  searchParams.current = paginationInfo.current
  searchParams.pageSize = paginationInfo.pageSize
  fetchData()
}

//搜索函数
const doSearch = () => {
  // 搜索时，重置分页参数为第一页
  searchParams.current = 1
  fetchData()
}

//删除函数
const doDelete = async (id: number) => {
  // 确认删除
  if (!id) {
    return
  }
  const res = await deleteSpaceUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    //刷新数据
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}
</script>

<style scoped>
#spaceManagePage {
  padding: 20px;
  min-height: 100vh;
}

.button-container {
  margin-bottom: 20px;
}

.search-form-container {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.custom-form {
  width: 100%;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.form-item {
  flex: 1;
  min-width: 200px;
}

.submit-item {
  flex: 0 0 auto;
}

/* 调整表单内部间距 */
:deep(.ant-form-item) {
  margin-bottom: 0;
}

:deep(.ant-input),
:deep(.ant-select) {
  width: 100%;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  #pictureManagePage {
    padding: 12px;
  }

  .button-container {
    margin-bottom: 16px;
  }

  .search-form-container {
    padding: 16px;
    margin-bottom: 20px;
  }

  .form-row {
    gap: 12px;
  }

  .form-item {
    flex: 1 0 100%;
  }
}
</style>

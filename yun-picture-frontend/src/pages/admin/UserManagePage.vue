<template>
  <div id="userManagePage">
    <!-- 搜索表单 -->
    <div class="search-form-container">
      <a-form :model="searchParams" @finish="doSearch" class="custom-form">
        <div class="form-row">
          <a-form-item label="账号" class="form-item">
            <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allowClear />
          </a-form-item>
          <a-form-item label="用户名" class="form-item">
            <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allowClear />
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
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" width="120px" />
          <a>
            {{ record.name }}
          </a>
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">{{
          dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
        <template v-else-if="column.dataIndex === 'updateTime'">{{
          dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
        <template v-else-if="column.key === 'action'">
          <a-button danger @click="doDelete(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { message, Modal } from 'ant-design-vue'
import { listUserVoByPageUsingPost } from '@/api/userController'
import { onMounted, ref, reactive, computed } from 'vue'
import dayjs from 'dayjs'
import { deleteUserUsingPost } from '@/api/userController'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
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
  const res = await listUserVoByPageUsingPost({
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
  showTotal: (total) => `共 ${total} 条记录`,
}))

//表格变化之后重新获取数据
const doTableChange = ({ current, pageSize }) => {
  searchParams.current = current
  searchParams.pageSize = pageSize
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
  if (!id) {
    return
  }
  // 添加确认对话框
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该用户吗？此操作不可恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deleteUserUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          //刷新数据
          fetchData()
        } else {
          message.error('删除失败，' + res.data.message)
        }
      } catch (error: any) {
        message.error('删除失败，' + error.message)
      }
    },
  })
}
</script>

<style scoped>
#userManagePage {
  padding: 20px;
  min-height: 100vh;
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

:deep(.ant-input) {
  width: 100%;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  #userManagePage {
    padding: 12px;
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

<template>
  <div id="spaceUserManagePage">
    <a-flex justify="space-between">
      <h2>空间成员管理</h2>
      <div class="button-container">
        <a-space>
          <a-button type="primary" href="/add_space" target="blank">+ 创建空间</a-button>
          <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="blank"
            >分析公共图库</a-button
          >
          <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="blank"
            >分析全部空间</a-button
          >
        </a-space>
      </div>
    </a-flex>
    <!-- 添加成员表单 -->
    <a-form layout="inline" :model="formData" @finish="handleSubmit">
      <a-form-item label="用户 id" name="userId">
        <a-input v-model:value="formData.userId" placeholder="请输入用户 id" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">添加用户</a-button>
      </a-form-item>
    </a-form>

    <!-- 用户管理表格 -->
    <a-table :columns="columns" :data-source="dataList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space>
            <a-avatar :src="record.user?.userAvatar" />
            {{ record.user?.userName }}
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value) => editSpaceRole(value, record)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { addSpaceUserUsingPost } from '@/api/spaceUserController'
import { listSpaceUserUsingPost } from '@/api/spaceUserController'
import { onMounted, ref, reactive } from 'vue'
import dayjs from 'dayjs'
import { deleteSpaceUserUsingPost, editSpaceUserUsingPost } from '@/api/spaceUserController'
import { SPACE_ROLE_OPTIONS } from '@/constants/space'

interface Props {
  id: string
}

const props = defineProps<Props>()

// 表格列
const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<API.SpaceUserVO[]>([])

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await listSpaceUserUsingPost({
    spaceId,
  })
  if (res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

//添加成员表单
const formData = reactive<API.SpaceUserAddRequest>({})

//创建成员
const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await addSpaceUserUsingPost({
    spaceId,
    ...formData,
  })
  if (res.data.code === 0) {
    message.success('添加成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('添加失败，' + res.data.message)
  }
}

//编辑成员角色
const editSpaceRole = async (value, record) => {
  const res = await editSpaceUserUsingPost({
    id: record.id,
    spaceRole: value,
  })
  if (res.data.code === 0) {
    message.success('修改成功')
  } else {
    message.error('修改失败，' + res.data.message)
  }
}

//删除函数
const doDelete = async (id: number) => {
  // 确认删除
  if (!id) {
    return
  }
  const res = await deleteSpaceUserUsingPost({ id })
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
#spaceUserManagePage {
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

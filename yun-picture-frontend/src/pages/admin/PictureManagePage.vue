<template>
  <div id="pictureManagePage">
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <div class="button-container">
        <a-space>
          <a-button type="primary" href="/add_picture" target="blank">+ 创建图片</a-button>
          <a-button type="primary" href="/add_picture/batch" target="blank" ghost
            >+ 批量创建图片</a-button
          >
        </a-space>
      </div>
    </a-flex>
    <!-- 搜索表单 -->
    <div class="search-form-container">
      <a-form :model="searchParams" @finish="doSearch" class="custom-form">
        <div class="form-row">
          <a-form-item label="关键词" class="form-item">
            <a-input v-model:value="searchParams.searchText" placeholder="输入关键词" allowClear />
          </a-form-item>
          <a-form-item label="图片类型" class="form-item">
            <a-input v-model:value="searchParams.category" placeholder="输入图片类型" allowClear />
          </a-form-item>
          <a-form-item label="图片标签" class="form-item">
            <a-input v-model:value="searchParams.tags" placeholder="输入图片标签" allowClear />
          </a-form-item>
          <a-form-item label="审核状态" name="reviewStatus" class="form-item">
            <a-select
              v-model:value="searchParams.reviewStatus"
              placeholder="请选择审核状态"
              :options="PIC_REVIEW_STATUS_OPTIONS"
              allowClear
            />
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
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" width="120px" />
        </template>
        <template v-if="column.dataIndex === 'tags'">
          <a-space>
            <!-- 标签获取 -->>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">
              {{ tag }}
            </a-tag>
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }} KB</div>
        </template>
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div>审核信息：{{ record.reviewMessage }}</div>
          <div>审核人：{{ record.reviewUser }}</div>
          <div v-if="record.reviewTime">
            审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">{{
          dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
        <template v-else-if="column.dataIndex === 'editTime'">{{
          dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss')
        }}</template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <!-- 审核按钮 -->
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
              type="link"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >通过</a-button
            >
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              type="link"
              danger
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >拒绝</a-button
            >
            <router-link :to="{ path: '/add_Picture', query: { id: record.id } }">
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
import { listPictureByPageUsingPost } from '@/api/pictureController'
import { onMounted, ref, reactive, computed } from 'vue'
import dayjs from 'dayjs'
import { deletePictureUsingPost, doPictureReviewUsingPost } from '@/api/pictureController'
import {
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '审核状态',
    dataIndex: 'reviewMessage',
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
const dataList = ref<API.Picture[]>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
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
  const res = await listPictureByPageUsingPost({
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
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    //刷新数据
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

//审核函数
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  // 默认
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({ id: record.id, reviewStatus, reviewMessage })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    //刷新数据
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}
</script>

<style scoped>
#pictureManagePage {
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

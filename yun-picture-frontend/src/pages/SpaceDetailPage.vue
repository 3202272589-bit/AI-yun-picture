<template>
  <div id="spaceDetailPage" style="margin-bottom: 16px">
    <!-- 空间信息 -->
    <a-flex justify="space-between" align-items="center">
      <div style="display: flex; align-items: center; gap: 12px">
        <a-tag
          :color="SPACE_LEVEL_COLOR[space.spaceLevel]"
          style="font-size: 16px; padding: 8px 16px"
        >
          {{ SPACE_LEVEL_MAP[space.spaceLevel] }}
        </a-tag>
        <h2>{{ space.spaceName }} (个人空间)</h2>
      </div>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank"
          >+ 添加图片</a-button
        >
        <a-button :icon="h(EditOutlined)" @click="doBatchEdit">批量编辑</a-button>
        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
            :size="42"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <!-- 搜索表单 -->
    <PictureSearchForm :onSearch="onSearch" />
    <!-- 按颜色搜索 -->
    <a-form-item label="按颜色搜索">
      <color-picker format="hex" :pureColorChange="onColorChange" :loading="loading" />
    </a-form-item>
    <!-- 图片列表 -->
    <PictureList
      :data-list="dataList"
      :loading="loading"
      style="padding: 20px"
      :showOp="true"
      :onReload="fetchData"
    />
    <!-- 分页 -->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pagesize="searchParams.pageSize"
      :total="total"
      :show-total="(total: number) => `共 ${total} 张图片`"
      @change="onPageChange"
    />
    <!-- 批量编辑图片窗 -->
    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :pictureList="dataList"
      :spaceId="id"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { listPictureVoByPageUsingPost } from '@/api/pictureController'
import PictureList from '@/components/PictureList.vue'
import { formatSize } from '@/utils/index'
import { EditOutlined } from '@ant-design/icons-vue'
import { h } from 'vue'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_COLOR } from '@/constants/space'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { searchPictureByColorUsingPost } from '@/api/pictureController'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const space = ref<API.SpaceVO>({})

//获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取空间详情失败，' + error.message)
  }
}

onMounted(() => {
  fetchSpaceDetail()
})

//获取图片列表
//定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  //转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

//分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

//搜索函数
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

//按照颜色搜索
const onColorChange = async (color: string) => {
  loading.value = true
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = res.data.length
  } else {
    message.error('按颜色搜索失败' + res.data.message)
  }
  loading.value = false
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

//批量编辑图片
const batchEditPictureModalRef = ref()

//批量编辑图片成功
const onBatchEditPictureSuccess = () => {
  fetchData()
}

//编辑弹窗
const doBatchEdit = () => {
  batchEditPictureModalRef.value?.openModal()
}
</script>
<style scoped></style>

<template>
  <div id="Picture-Search-Form">
    <!-- 搜索表单 -->
    <div class="search-form-container">
      <a-form :model="searchParams" @finish="doSearch" class="custom-form">
        <div class="form-row">
          <a-form-item label="关键词" class="form-item">
            <a-input v-model:value="searchParams.searchText" placeholder="输入关键词" allowClear />
          </a-form-item>
          <a-form-item label="分类" name="category" style="min-width: 400px">
            <a-auto-complete
              v-model:value="searchParams.category"
              placeholder="输入分类"
              :options="categoryOptions"
              allowClear
            />
          </a-form-item>
          <a-form-item label="标签" name="tags" style="min-width: 400px">
            <a-select
              v-model:value="searchParams.tags"
              mode="tags"
              placeholder="输入标签"
              :options="tagOptions"
              allowClear
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="日期" class="form-item full-width" name="dataRange">
            <a-range-picker
              style="width: 100%"
              show-time
              v-model:value="dataRange"
              :placeholder="['开始时间', '结束时间']"
              format="YYYY/MM/DD HH:mm:ss"
              :presets="rangePresets"
              @change="onRangeChange"
            />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="名称" class="form-item">
            <a-input v-model:value="searchParams.name" placeholder="输入名称" allowClear />
          </a-form-item>
          <a-form-item label="简介" class="form-item">
            <a-input v-model:value="searchParams.introduction" placeholder="输入简介" allowClear />
          </a-form-item>
        </div>
        <div class="form-row">
          <a-form-item label="宽度" class="form-item small-item" name="width">
            <a-input-number v-model:value="searchParams.picWidth" />
          </a-form-item>
          <a-form-item label="高度" class="form-item small-item" name="height">
            <a-input-number v-model:value="searchParams.picHeight" />
          </a-form-item>
          <a-form-item label="格式" class="form-item small-item">
            <a-select v-model:value="searchParams.picFormat" placeholder="选择格式" allowClear>
              <a-option value=".jpg">.jpg</a-option>
              <a-option value=".png">.png</a-option>
            </a-select>
          </a-form-item>
          <a-form-item label="按颜色搜索">
            <color-picker format="hex" :pureColorChange="onColorChange" :loading="loading" />
          </a-form-item>
          <a-form-item class="form-item submit-item">
            <a-space>
              <a-button type="primary" html-type="submit" style="width: 96px" @click="doSearch"
                >搜索</a-button
              >
              <a-button html-type="reset" style="width: 96px" @click="doClear">重置</a-button>
            </a-space>
          </a-form-item>
        </div>
      </a-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import { searchPictureByColorUsingPost } from '@/api/pictureController'
const loading = ref(true)

interface Props {
  onSearch: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})

//搜索函数
const doSearch = () => {
  props.onSearch?.(searchParams)
}

const dataRange = ref<[]>([])

/**
 * 日期更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates.length >= 2) {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

// 日期范围预设
const rangePresets = ref([
  { label: '最近7天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '最近14天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '最近30天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '最近90天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

//重置函数
const doClear = () => {
  //取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  //清空日期范围
  dataRange.value = []
  //搜索
  doSearch()
}

/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  //操作成功
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签和分类失败' + res.data.message)
  }
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

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
#Picture-Search-Form {
  margin-bottom: 16px;
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
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-item {
  flex: 1;
  min-width: 200px;
}

.full-width {
  flex: 1 0 100%;
}

.small-item {
  flex: 0 0 150px;
  min-width: 150px;
}

.submit-item {
  flex: 0 0 auto;
}

/* 调整表单内部间距 */
:deep(.ant-form-item) {
  margin-bottom: 0;
}

:deep(.ant-input),
:deep(.ant-select),
:deep(.ant-input-number),
:deep(.ant-picker) {
  width: 100%;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .search-form-container {
    padding: 16px;
    margin-bottom: 20px;
  }

  .form-row {
    gap: 12px;
  }

  .form-item,
  .small-item {
    flex: 1 0 100%;
  }
}
</style>

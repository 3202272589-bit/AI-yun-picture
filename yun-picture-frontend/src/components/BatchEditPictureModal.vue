<template>
  <div class="batch-edit-picture-modal">
    <a-modal v-model:visible="visible" :footer="false" title="批量编辑图片" @cancel="closeModal">
      <a-typography-paragraph type="secondary"> * 只对当前页面的图片生效 </a-typography-paragraph>
      <!-- 批量创建表单 -->
      <a-form name="PictureForm" layout="vertical" :model="formData" @finish="handleSubmit">
        <a-form-item label="分类" name="category">
          <a-auto-complete
            v-model:value="formData.category"
            placeholder="输入分类"
            :options="categoryOptions"
            allowClear
          />
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select
            v-model:value="formData.tags"
            mode="tags"
            placeholder="输入标签"
            :options="tagOptions"
            allowClear
          />
        </a-form-item>
        <a-form-item label="命名规则" name="nameRule">
          <a-input
            v-model:value="formData.nameRule"
            placeholder="输入命名规则， 输入{序号}可以自动生成"
            allowClear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%">提交</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  editPictureByBatchUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  pictureList: API.PictureVO[]
  spaceId: number
  onSuccess: () => void
}

const props = withDefaults(defineProps<Props>(), {})

const visible = ref<boolean>(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 暴露方法
defineExpose({
  openModal,
  closeModal,
})

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

const formData = reactive<API.PictureEditByBatchRequest>({
  category: '',
  tags: [],
  nameRule: '',
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  if (!props.pictureList) {
    return
  }
  const res = await editPictureByBatchUsingPost({
    pictureIdList: props.pictureList.map((picture) => picture.id),
    spaceId: props.spaceId,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    closeModal()
    props.onSuccess?.()
  } else {
    message.error('操作失败' + res.data.message)
  }
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

onMounted(() => {
  getTagCategoryOptions()
})
</script>

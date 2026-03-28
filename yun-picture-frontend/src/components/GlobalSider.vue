<template>
  <div id="globalSider">
    <a-layout-sider
      width="200"
      v-if="loginUserStore.loginUser.id"
      breakpoint="lg"
      collapsed-width="0"
    >
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { h, ref } from 'vue'
import { PictureOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()

//未经过滤的菜单项
const menuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
    title: '公共图库',
  },
  {
    key: '/my_space',
    icon: () => h(UserOutlined),
    label: '我的空间',
    title: '我的空间',
  },
]

const router = useRouter()

//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  console.log('Navigating to:', key)
  router.push({
    path: key,
  })
}

//当前高亮的菜单栏
const current = ref<string[]>([])
//监听路由变化，更新当前高亮的菜单栏
router.afterEach((to) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalSider .title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 10px;
}

.logo {
  height: 30px;
}
</style>

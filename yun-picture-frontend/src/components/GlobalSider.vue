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
import { SPACE_TYPE_ENUM } from '@/constants/space'
import { TeamOutlined } from '@ant-design/icons-vue'
import { computed, watchEffect } from 'vue'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
import message from 'ant-design-vue/es/message'

const loginUserStore = useLoginUserStore()

//固定的的菜单项
const fixedMenuItems = [
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
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    icon: () => h(TeamOutlined),
    label: '创建团队',
    title: '创建团队',
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  //如果用户没有团队空间，就只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  //如果用户有团队空间，就同时展示固定菜单和团队空间列表
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

//加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.data && res.data.code === 0) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载团队空间列表失败' + res.data.message)
  }
}

/**
 * 监听变量变化，更新团队空间列表
 */
watchEffect(() => {
  //登录后再加载
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

const router = useRouter()

//路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  console.log('Navigating to:', key)
  router.push(key)
}

//当前高亮的菜单栏
const current = ref<string[]>([])
//监听路由变化，更新当前高亮的菜单栏
router.afterEach((to) => {
  if (to.path.startsWith('/space/')) {
    // 当访问空间详情页时，检查是否是团队空间
    const teamSpaceKey = to.path
    const isTeamSpace = teamSpaceList.value.some(
      (spaceUser) => `/space/${spaceUser.spaceId}` === teamSpaceKey,
    )
    if (isTeamSpace) {
      // 高亮对应的团队空间菜单项
      current.value = [teamSpaceKey]
    } else {
      // 高亮"我的空间"菜单项
      current.value = ['/my_space']
    }
  } else if (to.path === '/add_space') {
    // 对于创建团队页面，需要包含查询参数来匹配菜单项的key
    const fullPath = to.path + (to.query.type ? `?type=${to.query.type}` : '')
    current.value = [fullPath]
  } else {
    current.value = [to.path]
  }
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

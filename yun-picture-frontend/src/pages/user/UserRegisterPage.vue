<template>
  <div id="UserLoginPage">
    <h2 class="title">AI云图库-用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
     <a-form
    :model="formState"
    @finish="handleSubmit"
  >
    <a-form-item
      name="userAccount"
      :rules="[{ required: true, message: '请输入账号' }]"
    >
      <a-input v-model:value="formState.userAccount" placeholder="请输入账号"/>
    </a-form-item>

    <a-form-item
      name="userPassword"
      :rules="[{ required: true, message: '请输入密码' },
        { min: 6, max: 12, message: '密码长度必须在6到12位之间' },
      ]"
    >
     <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码"/>
    </a-form-item>

     <a-form-item
      name="checkPassword"
      :rules="[{ required: true, message: '请确认密码' },
        { min: 6, max: 12, message: '密码长度必须在6到12位之间' },
      ]"
    >
      <a-input-password v-model:value="formState.checkPassword" placeholder="请确认密码"/>
    </a-form-item>
    <div class="tips">
      已有账号？
      <router-link to="/user/login">去登录</router-link>
    </div>
    <a-form-item>
      <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
    </a-form-item>
  </a-form>
  </div>
  </template>
<script lang="ts" setup>
import { reactive } from 'vue';
import { userRegisterUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import router from '@/router'

//用于接收表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  userAccount: "",
  userPassword: "",
  checkPassword: "",
});

/**
 * 表单提交
 * @param values
 */

const handleSubmit = async(values: any) => {
  //校验两次输入的密码是否一致
  if(values.userPassword !== values.checkPassword) {
    message.error("两次输入的密码不一致");
    return;
  }
  const res = await userRegisterUsingPost(values)
  //注册成功，跳转到登录页
  if(res.data.code === 0 && res.data.data) {
    message.success("注册成功");
    router.push({
      path: '/user/login',
      replace: true,
    })
  }else {
    message.error("注册失败" + res.data.message);
  }
}
</script>

<style scoped>
#UserLoginPage {
  max-width: 360px;
  margin: 0 auto;
}

 .title {
  text-align: center;
  margin-bottom: 16px;
}

.desc {
  color: #bbb;
  margin-bottom: 16px;
  text-align: center;
}

.tips {
  text-align: right;
  font-size: 13px;
  color: #bbb;
  margin-bottom: 16px;
}
</style>


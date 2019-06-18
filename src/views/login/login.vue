<template>
  <div class="login-wrap">
    <div class="login-fl">
      <div class="logo">
        <img src="../../../static/img/logo.png" alt="" width="247" height="45" />
      </div>
      <div class="center-img">
        <img src="../../../static/img/img.png" alt="" width="839" height="850" />
      </div>
      <div class="footer">Copyright {{ currentYear }} Demogic.com All Rights Reserved 浙ICP备15033117号-1</div>
    </div>
    <div class="login-fr">
      <h3>登录达摩运维平台</h3>
      <div class="login-content">
        <h4>登录账号</h4>
        <div class="input-w350" :class="{ error: errorBool1, success: successBool1 }">
          <input autocomplete="on" @keyup="hasAccount('keyup')" @blur="hasAccount('blur')" @focus="successBool1 = true" v-model.trim="account" placeholder="请输入账号" />
        </div>
        <h4>登录密码</h4>
        <div class="input-w350 input-password" :class="{ error: errorBool2, success: successBool2 }">
          <input @keyup.enter="hasPassword('keyup')" @blur="hasPassword('blur')" @focus="successBool2 = true" type="password" v-model="password" placeholder="请输入密码" />
        </div>
      </div>
      <div class="login-error-tip">
        <p>{{ errorMsg }}</p>
      </div>
      <el-button @click="loginBtn" class="login-btn" type="primary">登 录</el-button>
    </div>
  </div>
</template>

<script>
// import Cookie from 'js-cookie';
import { postRequest } from '@/api/api';
import { _debounce } from '@/common/js/public';
export default {
  name: 'login',
  data() {
    return {
      requestProject: 'gic-authcenter',
      account: '',
      password: '',
      errorMsg: '',
      errorBool1: false,
      errorBool2: false,
      successBool1: false,
      successBool2: false,
      currentYear: '',
      saveFlag: true
    };
  },
  mounted() {
    this.currentYear = new Date().getFullYear();
  },
  methods: {
    // 是否输入账号的判断
    hasAccount: _debounce(function(type) {
      if (type == 'keyup') {
        if (this.account == '') {
          this.errorBool1 = true;
          this.successBool1 = false;
        } else {
          this.successBool1 = true;
          this.errorBool1 = false;
          this.errorMsg = '';
        }
      } else if (type == 'blur') {
        this.successBool1 = false;
        // if (this.account != '') {
        //   this.submitLogin();
        // }
      }
    }, 500),
    // 是否输入密码的判断
    hasPassword(type) {
      if (!this.errorBool1) {
        if (type == 'keyup') {
          if (this.password == '') {
            this.errorBool2 = true;
            this.successBool2 = false;
          } else {
            this.successBool2 = true;
            this.errorBool2 = false;
            this.errorMsg = '';
            this.loginBtn();
          }
        } else if (type == 'blur') {
          this.successBool2 = false;
        }
      }
    },
    // 登录
    loginBtn() {
      if (!this.errorBool1) {
        if (this.account == '') {
          this.errorBool1 = true;
          this.errorMsg = '请输入账号';
          this.saveFlag = false;
          return;
        } else {
          this.errorBool1 = false;
          this.saveFlag = true;
        }
        if (this.password == '') {
          this.errorBool2 = true;
          this.errorMsg = '请输入密码';
          this.saveFlag = false;
          return;
        } else {
          this.saveFlag = true;
        }
      }
      if (this.saveFlag) {
        this.submitLogin();
      }
    },
    submitLogin() {
      postRequest('/gic-authcenter/login', {
        requestProject: this.requestProject,
        username: this.account,
        password: this.password
      }).then(res => {
        let data = res.data;
        this.saveFlag = false;
        if (data.errorCode == 0) {
          // Cookie.set('AUTHCENTERSESSIONID', data.sessionId);
          this.saveFlag = true;
          this.$router.push('/index');
        } else if (data.errorCode == 4005) {
          this.errorMsg = '账号已失效';
          this.errorBool1 = true;
        } else if (data.errorCode == 4006) {
          this.errorMsg = '账号被锁定';
          this.errorBool1 = true;
        } else if (data.errorCode == 4007) {
          this.errorMsg = '账号或密码错误';
          this.errorBool2 = true;
        } else if (data.errorCode == 4008) {
          this.errorMsg = '账号不存在';
          this.errorBool1 = true;
        } else {
          this.$message.error(data.message);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.login-wrap {
  min-width: 1200px;
  min-height: 900px;
  width: 100%;
  height: 100%;
  display: flex;
  .login-fl {
    flex: 0 0 58%;
    width: 58%;
    background: url(../../../static/img/bg.png) no-repeat;
    background-size: 100% 100%;
    position: relative;
    .logo {
      margin: 20px 0 0 40px;
    }
    .center-img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .footer {
      color: rgba(255, 255, 255, 0.75);
      font-size: 13px;
      text-align: center;
      width: 100%;
      bottom: 37px;
      position: absolute;
      font-family: 'MicrosoftYaHeiLight';
    }
  }
  .login-fr {
    flex: 1;
    background: #fff;
    padding: 288px 0 0 132px;
    h3 {
      font-size: 20px;
      color: #010101;
      letter-spacing: 1px;
      font-family: 'MicrosoftYaHei';
    }
    .login-content {
      padding-top: 25px;
      h4 {
        color: #848484;
        letter-spacing: 1px;
        font-size: 13px;
        font-family: 'MicrosoftYaHei';
        margin: 30px 0 10px 0;
      }
    }
    .login-error-tip {
      color: #f56c6c;
      height: 12px;
      font-size: 12px;
      line-height: 1;
      text-align: left;
    }
    .login-btn {
      border-radius: 20px;
      height: 40px;
      margin-top: 18px;
      width: 144px;
      font-size: 16px;
    }
  }
}
.input-password {
  margin-bottom: 18px;
}
.input-w350 {
  width: 350px;
  border-bottom: 1px solid #e5e5e5;
  /deep/ .el-input__inner {
    border: none;
    border-radius: 0;
    padding: 0;
    margin-bottom: 3px;
    &:focus {
      border-bottom-color: #1890ff;
    }
  }
}
.input-w350 input {
  width: 100%;
  height: 32px;
  margin-bottom: 3px;
  font-size: 14px;
}
.error {
  border-bottom-color: #f56c6c;
}
.success {
  border-bottom-color: #40a9ff;
}
</style>

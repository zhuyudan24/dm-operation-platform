<template>
  <div class="header clearfix">
    <div @click="backIndex" class="fl logo">
      <img :src="headerImg" alt="" width="30px" height="30px" />
      <span>{{ headerName }}</span>
    </div>
    <div class="fr login-user-info">
      <div class="user-info-wrap" :class="{ 'index-user-info': isIndex }">
        <el-popover placement="bottom" title="" width="74" trigger="hover" :popper-class="isIndex ? 'user-header-pop' : 'com-user-header-pop'" style="min-width: 95px;">
          <ul class="navsuerwrap">
            <li class="useritem" @click="toModifyUser"><span class="usertext">账号信息</span></li>
            <li class="useritem" @click="toModifyPaw"><span class="usertext">修改密码</span></li>
            <li class="useritem loginout" @click="toLoginOut"><span class="usertext">退出登录</span></li>
          </ul>
          <span class="navusername" slot="reference">{{ userInfoForm.realName }}<i class="el-icon-arrow-down arrowico"></i></span>
        </el-popover>
      </div>
    </div>
    <!-- 修改用户信息 -->
    <el-dialog title="账户信息" class="user-form-dialog" :visible.sync="userFormVisible" width="425px">
      <el-form :model="userInfoForm" :rules="userFormRules" ref="userForm" label-width="100px">
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="userInfoForm.realName"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="userInfoForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="工号" prop="clerkCode">
          <el-input disabled v-model="userInfoForm.clerkCode"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phoneNumber">
          <el-input v-model="userInfoForm.phoneNumber" type="text" :maxlength="11"></el-input>
        </el-form-item>
        <el-form-item label="职位" prop="positionName">
          <el-input v-model="userInfoForm.positionName"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelModUserInfo('userForm')">取 消</el-button>
        <el-button type="primary" @click="confirmModUserInfo('userForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改密码 -->
    <el-dialog title="修改密码" :visible.sync="dialogPawVisible" width="385px">
      <el-form :model="pawForm" :rules="rules" ref="pawForm" label-width="80px">
        <el-form-item label="旧密码" prop="oldPaw">
          <el-input v-model="pawForm.oldPaw"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPaw">
          <el-input v-model="pawForm.newPaw"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="surePaw">
          <el-input v-model="pawForm.surePaw"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="toModifyPawCancel('pawForm')">取 消</el-button>
        <el-button type="primary" @click="toModifyPawSure('pawForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getRequest, postRequest, putRequest } from '@/api/api';
export default {
  name: 'ywOtherHeader',
  props: {
    headerIcon: {
      type: String,
      default: ''
    },
    headerName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      requestProject: 'gic-authcenter',
      // 修改密码
      dialogPawVisible: false,
      pawForm: {
        oldPaw: '',
        newPaw: '',
        surePaw: ''
      },
      rules: {
        oldPaw: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPaw: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
        surePaw: [{ required: true, message: '请输入确认密码', trigger: 'blur' }]
      },
      // 用户信息 form
      userFormVisible: false,
      userInfoForm: {
        realName: '',
        gender: 0, // 1男0女
        clerkCode: '',
        phoneNumber: '',
        positionName: ''
      },
      userFormRules: {
        realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        clerkCode: [{ required: true, message: '请输入员工代码', trigger: 'blur' }],
        phoneNumber: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { pattern: /^1[34578]\d{9}$/, message: '手机号码格式不正确' }],
        positionName: [{ required: true, message: '请输入职位', trigger: 'blur' }]
      },
      isIndex: false,
      entranceType: '',
      loginName: '',
      headerImg: ''
    };
  },
  watch: {
    headerIcon(newVal) {
      this.headerImg = newVal;
      this.init();
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      if (this.headerIcon != '') {
        // eslint-disable-next-line
        this.headerImg = require(`../../static/img/${this.headerImg}.png`);
      } else {
        // eslint-disable-next-line
        this.headerImg = require(`../../static/img/failed-load_img.png`);
      }
      this.getUserInfo();
    },
    // 获取用户信息
    getUserInfo() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest('/gic-authcenter/loginuser', para)
        .then(res => {
          let resData = res.data;
          if (resData.errorCode == 0) {
            let _result = resData.result;
            this.userInfoForm.realName = _result.realName;
            this.userInfoForm.gender = parseInt(_result.sex);
            this.userInfoForm.clerkCode = _result.employeeNumber;
            this.userInfoForm.phoneNumber = _result.userMobile;
            this.userInfoForm.positionName = _result.position;
            this.loginName = _result.loginName;
          } else {
            this.$message.error(resData.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 账户信息
    toModifyUser() {
      this.userFormVisible = true;
    },
    // 账户信息 取消
    cancelModUserInfo(formName) {
      this.userFormVisible = false;
      this.$refs[formName].clearValidate();
    },
    // 账户信息 确认
    confirmModUserInfo(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            requestProject: this.requestProject,
            realName: this.userInfoForm.realName,
            sex: this.userInfoForm.gender,
            userMobile: this.userInfoForm.phoneNumber,
            position: this.userInfoForm.positionName
          };
          putRequest(`/gic-authcenter/loginuser/${this.loginName}`, params)
            .then(res => {
              let resData = res.data;
              if (resData.errorCode == 0) {
                this.userFormVisible = false;
                this.$message.success('修改成功');
              } else {
                this.$message.error(resData.message);
              }
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    // 修改密码的弹框
    toModifyPaw() {
      this.dialogPawVisible = true;
      this.pawForm.oldPaw = '';
      this.pawForm.newPaw = '';
      this.pawForm.surePaw = '';
    },
    // 修改密码弹框  取消
    toModifyPawCancel(formName) {
      this.dialogPawVisible = false;
      this.$refs[formName].clearValidate();
    },
    // 修改密码弹框  确定
    toModifyPawSure(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let para = {
            oldPassword: this.pawForm.oldPaw,
            newPassword: this.pawForm.newPaw
          };
          if (!this.pawForm.oldPaw.trim() || !this.pawForm.newPaw.trim() || !this.pawForm.surePaw.trim()) {
            this.$message.error('请输入密码');
            return false;
          }
          if (this.pawForm.newPaw.trim() != this.pawForm.surePaw.trim()) {
            this.$message.error('两次密码输入不一致!');
            return false;
          }
          postRequest('/gic-authcenter/password', para)
            .then(res => {
              let data = res.data;
              if (data.errorCode == 0) {
                this.dialogPawVisible = false;
                this.$message.success('修改成功');
                getRequest('/gic-authcenter/logout', {})
                  .then(res => {
                    let resData = res.data;
                    if (resData.errorCode == 0) {
                      window.location.href = window.location.origin + '/operation-platform/#/';
                    } else {
                      this.$message.error(resData.message);
                    }
                  })
                  .catch(function(error) {
                    console.log(error);
                  });
              } else {
                this.$message.error(data.message);
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    // 退出登录
    toLoginOut() {
      this.$confirm('确认退出吗?', '提示', {
        type: 'warning'
      })
        .then(() => {
          getRequest('/gic-authcenter/logout', {})
            .then(res => {
              let resData = res.data;
              if (resData.errorCode == 0) {
                getRequest('/gic-bizdict/logout', {})
                  .then(resNew => {
                    let resNewData = resNew.data;
                    console.log(resNewData);
                    if (resNewData.errorCode == 0) {
                      this.$message.success('退出成功');
                      window.location.href = window.location.origin + '/operation-platform/#/';
                    }
                  })
                  .catch(function(error) {
                    console.log(error);
                  });
              } else {
                this.$message.error(resData.message);
              }
            })
            .catch(function(error) {
              console.log(error);
            });
        })
        .catch(() => {});
    },
    // 权限管理
    entranceAuthority(type) {
      this.entranceType = type;
      this.$router.push('/menuManage');
    },
    // 操作日志
    entranceLog(type) {
      this.entranceType = type;
      this.$router.push('/log');
    },
    // 返回首页
    backIndex() {
      this.$router.push('/index');
    }
  }
};
</script>

<style lang="less" scoped>
.header {
  height: 64px;
  background: #fff;
  box-shadow: 0px 3px 4px 0px rgba(214, 224, 240, 0.3);
  .logo {
    margin: 16px 8px 16px 44px;
    cursor: pointer;
    span {
      font-size: 16px;
      color: #303133;
      line-height: 30px;
      display: inline-block;
      vertical-align: top;
      padding-left: 6px;
    }
  }
  .login-user-info {
    margin: 17px 45px 0 0;
  }
}
.user-info-wrap {
  font-size: 0;
  color: #595959;
  display: inline-block;
  padding: 5px 0;
  .com-user-header-pop {
    width: 95px !important;
  }
  .navusername {
    font-size: 14px;
    color: #606266;
    padding-left: 14px;
    i {
      margin: 0 15px 0 12px;
    }
    &:hover .arrowico {
      transform: rotate(180deg);
    }
    .arrowico {
      transition: all 0.5s;
    }
  }
}
.navsuerwrap .useritem span {
  color: #595959;
  line-height: 30px;
  &:hover {
    color: #262626;
  }
}
// 首页的用户信息
.index-user-info {
  &.user-info-wrap {
    color: #fff;
    .navusername {
      color: #fff;
    }
  }
}
.user-header-pop .navsuerwrap .useritem span {
  color: #fff;
  &:hover {
    color: #e3e3e3;
  }
}
</style>

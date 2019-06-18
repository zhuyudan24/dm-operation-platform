<template>
  <div class="my-right-content">
    <yw-top-breadcrumb :topMenuData="topMenuData" :activeId="activeId"></yw-top-breadcrumb>
    <div class="add-wrap">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="110px" class="demo-ruleForm">
        <h2 class="small-title">
          基本信息<el-popover placement="top" width="190" trigger="hover" content="用户的原始密码为:用户名+123">
            <i slot="reference" class="iconfont tooltip-icon iconxinxixianshi"></i>
          </el-popover>
        </h2>
        <el-form-item label="用户名" prop="userName" class="input-w364">
          <yw-input :disabled="editBool" v-model="ruleForm.userName" :byteType="0" :maxlength="20" placeholder="最多20字"></yw-input>
        </el-form-item>
        <el-form-item label="工号" prop="userCode" class="input-w364">
          <el-input :disabled="editBool" @blur="value => toInputCode(value)" type="number" v-model="ruleForm.userCode" placeholder="6位数字，左边补0；如：000019"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName" class="input-w364">
          <yw-input v-model="ruleForm.realName" :byteType="0" :maxlength="20" placeholder="最多20字"></yw-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex" class="is-required">
          <el-radio-group v-model="ruleForm.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部门名称" prop="departId" class="input-w364">
          <el-select v-model="ruleForm.departId" placeholder="请选择部门" style="width:100%">
            <el-option v-for="item in options" :key="item.id" :label="item.departmentName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position" class="input-w364">
          <yw-input v-model="ruleForm.position" :byteType="0" :maxlength="20" placeholder="最多20字"></yw-input>
        </el-form-item>
        <el-form-item label="邮箱" class="input-w364">
          <el-input v-model="ruleForm.email" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone" class="input-w364">
          <el-input type="number" v-model="ruleForm.phone" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="备用联系人" prop="otherPhone" class="input-w364" :class="{ 'is-error': otherPhoneBool }">
          <el-input @blur="checkOtherPhone(ruleForm.otherPhone)" type="number" v-model="ruleForm.otherPhone" placeholder="请输入内容"></el-input>
          <div v-show="otherPhoneBool" class="el-form-item__error">
            请输入正确的11位手机号码
          </div>
        </el-form-item>
        <el-form-item label="用户类型" prop="userStyle" class="is-required user-type-wrap">
          <el-radio-group @change="changeUserType" :disabled="editBool" v-model="ruleForm.userStyle">
            <el-radio :label="0">内部</el-radio>
            <el-radio :label="1">临时<el-date-picker v-show="ruleForm.userStyle == 1" :disabled="editBool" @change="changeMyDate" class="my-date-picker" value-format="yyyy-MM-dd HH:mm:ss" v-model="dateValue" type="datetime" placeholder="选择失效日期"> </el-date-picker></el-radio>
            <el-radio :label="2">其他</el-radio>
          </el-radio-group>
          <div v-show="ruleForm.userStyle == 1 && datePickerBool && !dateValue" class="date-picker-error el-form-item__error">请选择失效时间</div>
        </el-form-item>
        <el-form-item label="是否冻结" prop="accountLocked" class="is-required">
          <el-radio-group v-model="ruleForm.accountLocked">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="editBool" label="是否重置密码" prop="resetPassword" class="is-required reset-paw">
          <el-radio-group v-model="ruleForm.resetPassword">
            <el-radio :label="0">否</el-radio>
            <el-radio :label="1"
              >是<el-popover placement="top" width="50" trigger="hover" content="重置为原始密码"> <i slot="reference" class="iconfont tooltip-icon iconxinxixianshi"></i></el-popover
            ></el-radio>
          </el-radio-group>
        </el-form-item>
        <h2 class="small-title">用户角色</h2>
        <el-form-item label="关联角色" class="is-required my-transfer-wrap">
          <el-transfer @change="changeContactRole" v-model="selectedUserList" :data="allUserList" :titles="['角色列表', '已添加角色']" :button-texts="['移除', '转入']"></el-transfer>
          <div v-show="contactRoleBool && selectedUserList.length < 1" class="el-form-item__error">请选择关联角色</div>
        </el-form-item>
        <el-form-item style="padding:20px 0">
          <el-button @click="saveSubmit('ruleForm')" type="primary">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import ywTopBreadcrumb from '@/components/yw-top-breadcrumb.vue';
import ywInput from '@/components/yw-input/input.vue';
import { getRequest, postRequest, putRequest } from '@/api/api';
import { dateFormat } from '@/common/js/dateFilter';
import { isCommonSpace, isvalidPhone } from '@/common/js/validate';
let commonSpace = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('用户名不允许有空格'));
  } else {
    callback();
  }
};
let commonSpaceReal = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入真实姓名'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('真实姓名不允许有空格'));
  } else {
    callback();
  }
};
let commonSpacePosition = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入职位'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('职位不允许有空格'));
  } else {
    callback();
  }
};
let validPhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号码'));
  } else if (!isvalidPhone(value)) {
    callback(new Error('请输入正确的11位手机号码'));
  } else {
    callback();
  }
};
export default {
  name: 'addUser',
  data() {
    return {
      requestProject: 'gic-authcenter',
      topMenuData: [
        {
          id: '1',
          name: '用户管理',
          path: '/userManage'
        },
        {
          id: '2',
          name: '新增用户',
          path: ''
        }
      ],
      activeId: '2',
      options: [],
      ruleForm: {
        userName: '',
        userCode: '',
        realName: '',
        sex: 1,
        departId: '',
        position: '',
        email: '',
        phone: '',
        otherPhone: '',
        userStyle: 0,
        accountLocked: 0,
        resetPassword: 0
      },
      rules: {
        userName: [{ required: true, trigger: 'blur', validator: commonSpace }],
        userCode: [{ required: true, trigger: 'blur', message: '请输入工号' }],
        realName: [{ required: true, trigger: 'blur', validator: commonSpaceReal }],
        departId: [{ required: true, trigger: 'change', message: '请输入工号' }],
        position: [{ required: true, trigger: 'blur', validator: commonSpacePosition }],
        phone: [{ required: true, trigger: 'blur', validator: validPhone }]
      },
      dateValue: '', // 临时日期
      datePickerBool: false,
      saveDataBool: true, // 是否保存的标识
      otherPhoneBool: false, // 备用联系人的验证
      contactRoleBool: false, // 关联角色
      // 穿梭框
      allUserList: [],
      selectedUserList: [],
      // 编辑
      loginName: '',
      editBool: false,
      tabId: ''
    };
  },
  mounted() {
    this.$emit('getLinkType', 'authority');
    this.init();
  },
  methods: {
    init() {
      this.tabId = this.$route.query.tabId;
      this.loginName = this.$route.query.loginName;
      this.getDepartList();
      this.getNowDate();
      this.getUserList();
      this.topMenuData[0].path = `/userManage?code=authz_manage&tabId=${this.tabId}`;
      if (!!this.loginName) {
        this.topMenuData[1].name = '编辑用户';
        this.editBool = true;
        this.getUserInfo();
      } else {
        this.topMenuData[1].name = '新增用户';
        this.editBool = false;
      }
    },
    // 编辑时的初始化数据
    getUserInfo() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest(`/gic-authcenter/user/${this.loginName}`, para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            let _result = data.result;
            this.ruleForm.userName = _result.loginName;
            this.ruleForm.userCode = _result.employeeNumber;
            this.ruleForm.realName = _result.realName;
            this.ruleForm.sex = _result.sex;
            this.ruleForm.departId = _result.departmentId;
            this.ruleForm.position = _result.position;
            this.ruleForm.email = _result.email;
            this.ruleForm.phone = _result.userMobile;
            this.ruleForm.otherPhone = _result.userMobileBak;
            this.ruleForm.userStyle = _result.accountType;
            this.ruleForm.accountLocked = _result.accountLocked;
            let selectedUserList = _result.selectedRoleList ? _result.selectedRoleList : [];
            this.selectedUserList = [];
            selectedUserList.forEach((el, idx) => {
              this.selectedUserList.push(el.id);
            });
            // 用户类型  临时
            if (this.ruleForm.userStyle == 1) {
              this.dateValue = dateFormat(_result.accountExpiredDate, 'YYYY-MM-DD hh:mm:ss');
            }
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 获取当前年月日时分秒
    getNowDate() {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();
      let second = date.getSeconds();
      month = month < 10 ? '0' + month : month;
      day = day < 10 ? '0' + day : day;
      hour = hour < 10 ? '0' + hour : hour;
      minute = minute < 10 ? '0' + minute : minute;
      second = second < 10 ? '0' + second : second;
      this.dateValue = year + month + day + ' ' + hour + ':' + minute + ':' + second;
    },
    // 获取部门列表
    getDepartList() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest('/gic-authcenter/department', para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            this.options = data.result ? data.result : [];
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 获取角色列表
    getUserList() {
      let para = {
        requestProject: this.requestProject,
        allList: true
      };
      getRequest('/gic-authcenter/role', para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            let allUserList = data.result ? data.result : [];
            this.allUserList = [];
            allUserList.forEach((el, idx) => {
              this.allUserList.push({
                key: el.id,
                label: el.roleName
              });
            });
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 输入工号
    toInputCode(value) {
      let newValue = value.target.value;
      let len = newValue.toString().length;
      while (len < 6) {
        newValue = '0' + newValue;
        len++;
      }
      if (len > 6) {
        newValue = newValue.substring(newValue.length - 6);
      }
      this.ruleForm.userCode = newValue;
    },
    // 验证备用联系人是否符合规则
    checkOtherPhone(val) {
      if (!!val) {
        const reg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
        if (reg.test(val)) {
          this.otherPhoneBool = false;
        } else {
          this.otherPhoneBool = true;
        }
      } else {
        this.otherPhoneBool = false;
      }
    },
    // 选择失效的日期
    changeMyDate() {
      if (!this.dateValue) {
        this.datePickerBool = true;
      } else {
        this.saveDataBool = true;
      }
    },
    // 改变用户类型
    changeUserType(val) {
      if (val != 1) {
        this.saveDataBool = true;
      }
    },
    // 选择关联角色
    changeContactRole() {
      if (this.selectedUserList && this.selectedUserList.length > 0) {
        this.saveDataBool = true;
      } else {
        this.contactRoleBool = true;
      }
    },
    // 新增
    saveSubmit(formName) {
      // 用户类型
      if (this.ruleForm.userStyle == 1 && !this.dateValue) {
        this.datePickerBool = true;
        this.saveDataBool = false;
      }
      // 关联角色
      if (this.selectedUserList && this.selectedUserList.length < 1) {
        this.contactRoleBool = true;
        this.saveDataBool = false;
      }
      let para = {
        loginName: this.ruleForm.userName,
        accountType: this.ruleForm.userStyle,
        accountExpiredTime: this.dateValue,
        realName: this.ruleForm.realName,
        sex: this.ruleForm.sex,
        userMobile: this.ruleForm.phone,
        userMobileBak: this.ruleForm.otherPhone,
        email: this.ruleForm.email,
        employeeNumber: this.ruleForm.userCode,
        departmentId: this.ruleForm.departId,
        position: this.ruleForm.position,
        accountLocked: this.ruleForm.accountLocked,
        roleIds: this.selectedUserList.join(','),
        resetPassword: this.ruleForm.resetPassword == 1 ? true : false // 编辑时多出来的
      };
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.saveDataBool && !this.otherPhoneBool) {
            // 编辑
            if (this.editBool) {
              delete para.loginName;
              delete para.accountType;
              delete para.accountExpiredTime;
              delete para.employeeNumber;
              putRequest(`/gic-authcenter/user/${this.loginName}`, para)
                .then(res => {
                  let data = res.data;
                  if (data.errorCode == 0) {
                    this.$message.success('保存成功');
                    this.$router.push(`/userManage?code=authz_manage&tabId=${this.tabId}`);
                  } else {
                    this.$message.error(data.message);
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            } else {
              delete para.resetPassword;
              postRequest(`/gic-authcenter/user`, para)
                .then(res => {
                  let data = res.data;
                  if (data.errorCode == 0) {
                    this.$message.success('保存成功');
                    this.$router.push(`/userManage?code=authz_manage&tabId=${this.tabId}`);
                  } else {
                    this.$message.error(data.message);
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            }
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  },
  components: {
    ywTopBreadcrumb,
    ywInput
  }
};
</script>
<style lang="less" scoped>
.my-right-content {
  box-sizing: border-box;
}
.add-wrap {
  padding: 0 24px;
}
.input-w364 {
  width: 364px;
}
.small-title {
  font-size: 16px;
  color: #909399;
  line-height: 22px;
  padding: 6px 0 24px;
  &::before {
    content: '';
    width: 3px;
    height: 14px;
    background: #606266;
    display: inline-block;
    margin-right: 8px;
  }
}
.my-transfer-wrap /deep/ .el-transfer__button {
  padding: 6px 8px;
}
.my-date-picker {
  width: 200px;
  margin-left: 8px;
}
.date-picker-error {
  padding-left: 154px;
}
.user-type-wrap /deep/ .el-radio {
  margin-right: 16px;
}
.tooltip-icon {
  padding-left: 3px;
}
// .reset-paw span {
//   font-size: 13px;
//   color: #909399;
//   padding-left: 15px;
// }
</style>

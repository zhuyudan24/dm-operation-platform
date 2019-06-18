<template>
  <div class="my-right-content">
    <yw-top-breadcrumb :topMenuData="topMenuData" :activeId="activeId"></yw-top-breadcrumb>
    <div class="add-wrap">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName" class="input-w364">
          <yw-input v-model="ruleForm.roleName" :byteType="0" :maxlength="20" placeholder="最多20字"></yw-input>
        </el-form-item>
        <el-form-item label="说明" prop="detail" class="input-w364">
          <yw-input type="textarea" v-model="ruleForm.detail" :byteType="0" :maxlength="200"></yw-input>
        </el-form-item>
        <el-form-item label="角色权限" prop="roleRight" class="is-required my-transfer-wrap" style="margin-top:34px;">
          <el-transfer @change="changeContactRole" v-model="selectedUserList" :data="allUserList" :titles="['权限列表', '已添加权限']" :button-texts="['移除', '转入']"></el-transfer>
          <div v-show="contactRoleBool && selectedUserList.length < 1" class="el-form-item__error">请选择关联角色</div>
        </el-form-item>
        <el-form-item label="菜单权限" prop="menuRight" class="account-limit-wrap">
          <elNewTree :data="treeData" show-checkbox ref="tree" node-key="id" :default-checked-keys="withoutParents" default-expand-all :props="defaultProps"> </elNewTree>
        </el-form-item>
        <el-form-item>
          <el-button @click="saveSubmit('ruleForm')" type="primary" style="margin-bottom:34px;">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { getRequest, postRequest, putRequest } from '@/api/api';
import ywTopBreadcrumb from '@/components/yw-top-breadcrumb.vue';
import ywInput from '@/components/yw-input/input.vue';
import elNewTree from '@/components/tree/src/tree';
import { isCommonSpace } from '../../common/js/validate';
let commonSpace = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入角色名称'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('角色名称不允许有空格'));
  } else {
    callback();
  }
};
export default {
  name: 'addRole',
  data() {
    return {
      requestProject: 'gic-authcenter',
      topMenuData: [
        {
          id: '1',
          name: '角色管理',
          path: '/roleManage'
        },
        {
          id: '2',
          name: '创建角色',
          path: ''
        }
      ],
      activeId: '2',
      ruleForm: {
        roleName: '',
        detail: ''
      },
      rules: {
        roleName: [{ required: true, trigger: 'blur', validator: commonSpace }]
      },
      // 角色权限 穿梭框
      allUserList: [],
      selectedUserList: [],
      contactRoleBool: false,
      // 菜单权限
      treeData: [],
      withoutParents: [], //不包含父节点
      ids: [],
      defaultProps: {
        children: 'nodeChildren',
        label: 'menuName'
      },
      // 编辑 or 创建角色
      roleId: '',
      editRoleBool: false,
      // 是否保存的标识
      saveDataBool: true,
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
      this.roleId = this.$route.query.roleId;
      this.topMenuData[0].path = `/roleManage?code=authz_manage&tabId=${this.tabId}`;
      if (this.roleId) {
        this.topMenuData[1].name = '编辑角色';
        this.editRoleBool = true;
        this.getRoleDetail();
      } else {
        this.topMenuData[1].name = '创建角色';
        this.editRoleBool = false;
        this.getRoleRight();
        this.getMenuRight();
      }
    },
    // 获取角色详情
    getRoleDetail() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest(`/gic-authcenter/role/${this.roleId}`, para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            let _result = data.result;
            this.ruleForm.roleName = _result.roleName;
            this.ruleForm.detail = _result.remark;
            // 角色权限
            let allUserList = _result.allPermissionList ? _result.allPermissionList : [];
            this.allUserList = [];
            allUserList.forEach((el, idx) => {
              this.allUserList.push({
                key: el.id,
                label: el.permissionName
              });
            });
            let selectedPermissionList = _result.selectedPermissionList ? _result.selectedPermissionList : [];
            let arrIds = [];
            selectedPermissionList.forEach(el => {
              arrIds.push(el.id);
            });
            this.selectedUserList = arrIds;
            // 菜单权限
            this.treeData = data.result.allMenuTree;
            this.treeData.forEach((item, index) => {
              item.fold = false; // 是折叠还是打开
              item.nodeChildren = item.nodeChildren ? item.nodeChildren : [];
              item.nodeChildren.forEach((el, idx) => {
                el.nodeChildren = el.nodeChildren ? el.nodeChildren : [];
                if (el.nodeChildren.length > 0) {
                  el.foldBool = 1;
                }
              });
            });
            let selectMenuList = data.result.selectedMenuTree;
            let ids = this.getMenuRightIds(selectMenuList);
            ids.forEach(el => {
              this.withoutParents.push(el);
            });
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 编辑时 hasRight为1 选中的权限 选中的权限的ids
    getMenuRightIds(arr) {
      arr.forEach(item => {
        item.nodeChildren = item.nodeChildren ? item.nodeChildren : [];
        if (item.nodeChildren.length > 0) {
          this.getMenuRightIds(item.nodeChildren);
        } else {
          this.ids.push(item.id);
        }
      });
      return this.ids;
    },
    // 获取角色权限
    getRoleRight() {
      let para = {
        requestProject: this.requestProject,
        allList: true
      };
      getRequest('/gic-authcenter/permission', para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            let allUserList = data.result ? data.result : [];
            this.allUserList = [];
            allUserList.forEach((el, idx) => {
              this.allUserList.push({
                key: el.id,
                label: el.permissionName
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
    // 获取菜单权限
    getMenuRight() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest('/gic-authcenter/menu/tree', para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            let _result = data.result ? data.result : [];
            _result.forEach((item, index) => {
              item.fold = false; // 是折叠还是打开
              item.nodeChildren = item.nodeChildren ? item.nodeChildren : [];
              item.nodeChildren.forEach((el, idx) => {
                el.nodeChildren = el.nodeChildren ? el.nodeChildren : [];
                if (el.nodeChildren.length > 0) {
                  el.foldBool = 1;
                }
              });
            });
            this.treeData = _result;
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 选择关联角色
    changeContactRole() {
      if (this.selectedUserList && this.selectedUserList.length > 0) {
        this.saveDataBool = true;
      } else {
        this.contactRoleBool = true;
      }
    },
    // 保存数据
    saveSubmit(formName) {
      // 角色权限
      if (this.selectedUserList && this.selectedUserList.length < 1) {
        this.contactRoleBool = true;
        this.saveDataBool = false;
      }
      // 选中的菜单权限
      let menuIds = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys());
      let para = {
        requestProject: this.requestProject,
        roleName: this.ruleForm.roleName,
        remark: this.ruleForm.detail,
        permissionIds: this.selectedUserList.join(','),
        menuIds: menuIds.join(',')
      };
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.saveDataBool) {
            // 编辑
            if (this.editRoleBool) {
              putRequest(`/gic-authcenter/role/${this.roleId}`, para)
                .then(res => {
                  let data = res.data;
                  if (data.errorCode == 0) {
                    this.$message.success('保存成功');
                    this.$router.push(`/roleManage?code=authz_manage&tabId=${this.tabId}`);
                  } else {
                    this.$message.error(data.message);
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            } else {
              //新增
              postRequest('/gic-authcenter/role', para)
                .then(res => {
                  let data = res.data;
                  if (data.errorCode == 0) {
                    this.$message.success('保存成功');
                    this.$router.push(`/roleManage?code=authz_manage&tabId=${this.tabId}`);
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
    ywInput,
    elNewTree
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
.my-transfer-wrap /deep/ .el-transfer__button {
  padding: 6px 8px;
}
.input-w364 {
  width: 364px;
}
</style>

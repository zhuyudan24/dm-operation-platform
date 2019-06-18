<template>
  <div class="my-right-content">
    <div v-show="tableData.length > 0" class="create-btn">
      <el-button @click="toCreateMenu('main')" type="primary">创建菜单</el-button>
    </div>
    <el-table v-if="tableData.length > 0" v-loading="loading" :data="tableData" row-key="id" class="table-no-line-wrap my-table-wrap">
      <el-table-column prop="menuName" label="菜单名称" show-overflow-tooltip>
        <template slot-scope="scoped">
          <div class="menu-name-wrap " :class="{ 'my-name-wrap': scoped.row.firstLevel, 'my-no-child': scoped.row.nodeChildren && scoped.row.nodeChildren.length > 0 }">
            <el-tooltip v-if="scoped.row.numBool" class="item" effect="dark" content="排序" placement="top">
              <span @click="changeNum(scoped.row)">{{ scoped.row.indexSort }}</span>
            </el-tooltip>
            <el-input v-else type="number" @blur="blurNumInput(scoped.row)" @keyup.native="keyupInput(scoped.row)" v-focus="!scoped.row.numBool" class="num-input-wrap" v-model.trim="scoped.row.indexSort"></el-input>
            {{ scoped.row.menuName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="菜单编码" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="parentCode" label="父级编码" show-overflow-tooltip>
        <template slot-scope="scoped">{{ scoped.row.parentCode ? scoped.row.parentCode : '--' }}</template>
      </el-table-column>
      <el-table-column prop="appName" label="应用模块名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="opr" label="操作" width="200">
        <template slot-scope="scoped">
          <el-button @click="editMenu(scoped.row)" type="text">编辑</el-button>
          <el-button @click="toCreateMenu('child', scoped.row)" type="text">创建子菜单</el-button>
          <el-button v-show="scoped.row.children.length < 1" @click="delMenu(scoped, scoped.row, scoped.$index)" type="text">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="my-no-data-wrap">
      <i class="iconfont iconkong"></i>
      <h3>现在还没有菜单哦~</h3>
      <el-button @click="toCreateMenu('main')" type="primary">去创建菜单</el-button>
    </div>
    <!-- 创建菜单 -->
    <el-dialog :title="menuTitle" :visible.sync="dialogVisible" width="425px" :before-close="cancelCreate">
      <el-form :model="menuForm" :rules="rules" ref="menuForm" label-width="110px">
        <el-form-item label="应用模块名称" prop="applyName">
          <el-select v-model="menuForm.applyName" placeholder="请选择应用模块名称" style="width:100%">
            <el-option v-for="item in options" :key="item.id" :label="item.appName" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <yw-input v-model="menuForm.menuName" :byteType="0" :maxlength="20" placeholder="输入名称，最多20字"></yw-input>
        </el-form-item>
        <el-form-item v-show="menuForm.parentCode != ''" label="父菜单编码" prop="parentCode">
          <yw-input disabled v-model="menuForm.parentCode" :byteType="0" :maxlength="32"></yw-input>
        </el-form-item>
        <el-form-item label="菜单编码" prop="menuCode">
          <yw-input :disabled="editCodeBool" v-model="menuForm.menuCode" :byteType="0" :maxlength="32" placeholder="英文、下划线、数字组成，最多32字"></yw-input>
        </el-form-item>
        <el-form-item label="URI" prop="URI">
          <yw-input v-model="menuForm.URI" :byteType="0" :maxlength="50" placeholder="长度限制50个字，不能有空格"></yw-input>
        </el-form-item>
        <el-form-item label="打开方式" prop="openStyle">
          <el-radio-group v-model="menuForm.openStyle">
            <el-radio :label="0">当前页</el-radio>
            <el-radio :label="1">新开页</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图标">
          <yw-input v-model="menuForm.icon" :byteType="0" :maxlength="64" placeholder="长度限制64个字，不能有空格"></yw-input>
        </el-form-item>
        <el-form-item label="是否显示" prop="isShow">
          <el-radio-group v-model="menuForm.isShow">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreate">取 消</el-button>
        <el-button type="primary" @click="sureCreate('menuForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ywInput from '@/components/yw-input/input.vue';
import { getRequest, postRequest, putRequest, deleteRequest } from '@/api/api';
import { isCommonSpace, isNumLineLetter } from '../../common/js/validate';
let commonSpace = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入菜单名称'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('菜单名称不允许有空格'));
  } else {
    callback();
  }
};
let commonSpaceURI = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入URI'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('URI不允许有空格'));
  } else {
    callback();
  }
};
let numLineLetter = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入菜单编码'));
  } else if (!isNumLineLetter(value)) {
    callback(new Error('菜单编码只能由英文、下划线、数字组成'));
  } else {
    callback();
  }
};
export default {
  name: 'menuManage',
  data() {
    return {
      requestProject: 'gic-authcenter',
      tableData: [],
      menuTitle: '创建菜单',
      dialogVisible: false,
      options: [],
      editCodeBool: false, // 编辑时是否可以更改菜单编码
      menuForm: {
        applyName: '',
        menuName: '',
        menuCode: '',
        parentCode: '',
        URI: '',
        openStyle: 0,
        icon: '',
        isShow: 1
      },
      rules: {
        applyName: [{ required: true, trigger: 'change', message: '请选择应用模块名称' }],
        menuName: [{ required: true, trigger: 'blur', validator: commonSpace }],
        menuCode: [{ required: true, trigger: 'blur', validator: numLineLetter }],
        URI: [{ required: true, trigger: 'blur', validator: commonSpaceURI }],
        openStyle: [{ required: true, trigger: 'change', message: '请选择打开方式' }],
        isShow: [{ required: true, trigger: 'change', message: '请选择是否显示' }]
      },
      loading: false,
      menuType: '', // 创建菜单  新建or编辑
      menuId: ''
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let tabId = this.$route.query.tabId;
      this.$emit('showTab', tabId);
      this.getMenuList();
      this.getApplyList();
    },
    // 获取菜单列表
    getMenuList() {
      this.loading = true;
      let para = {
        requestProject: this.requestProject
      };
      getRequest('/gic-authcenter/menu/tree', para)
        .then(res => {
          let data = res.data;
          this.loading = false;
          if (data.errorCode == 0) {
            let tableData = data.result ? data.result : [];
            this.tableData = this.addMenuPara(tableData);
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 获取应用列表
    getApplyList() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest('/gic-authcenter/app', para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            this.options = data.result ? data.result : [];
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 为菜单列表 添加 参数 numBool
    addMenuPara(tableData) {
      tableData.forEach(item => {
        item.numBool = true;
        item.children = item.nodeChildren ? item.nodeChildren : [];
        item.total = tableData.length;
        item.oldSort = item.indexSort;
        if (item.children.length > 0) {
          this.addMenuPara(item.children);
        }
      });
      return tableData;
    },
    // 显示出排序输入框
    changeNum(row) {
      row.numBool = false;
    },
    // 排序输入框失去焦点
    blurNumInput(row) {
      row.numBool = true;
      if (row.indexSort > row.total || row.indexSort < 1) {
        row.indexSort = row.oldSort;
      } else {
        this.sortMenu(row);
      }
    },
    // 排序
    sortMenu(row) {
      let para = {
        requestProject: this.requestProject,
        sortMenu: true,
        sort: row.indexSort
      };
      putRequest(`/gic-authcenter/menu/tree/${row.code}`, para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            this.getMenuList();
            this.$message.success('排序成功');
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    keyupInput(row) {
      if (row.indexSort > row.total || row.indexSort < 1) {
        row.indexSort = '';
      }
    },
    // 删除菜单
    delMenu(scoped, row, index) {
      // console.log(scoped);
      // scoped.store.states.data.splice(index, 1);
      // return;
      this.$confirm('是否要删除选中的菜单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let para = {
            requestProject: this.requestProject
          };
          deleteRequest(`/gic-authcenter/menu/tree/${row.code}`, para).then(res => {
            let data = res.data;
            if (data.errorCode == 0) {
              // scoped.store.states.data.splice(index, 1);
              this.getMenuList();
              this.$message.success('删除成功');
            } else {
              this.$message.error(data.message);
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 编辑菜单
    editMenu(row) {
      this.menuTitle = '编辑菜单';
      this.menuType = 'edit';
      this.dialogVisible = true;
      this.editCodeBool = true;
      this.menuId = row.id;
      this.menuForm = {
        applyName: row.appId,
        menuName: row.menuName,
        menuCode: row.code,
        parentCode: row.parentCode,
        URI: row.uri,
        openStyle: row.target,
        icon: row.iconUrl,
        isShow: row.isShow
      };
    },
    // 创建菜单
    toCreateMenu(type, row) {
      this.dialogVisible = true;
      this.editCodeBool = false;
      this.menuId = '';
      this.menuType = 'add';
      if (this.$refs.menuForm) {
        this.$refs.menuForm.resetFields();
      }
      if (type == 'main') {
        this.menuTitle = '创建菜单';
        this.menuForm.parentCode = '';
      } else if (type == 'child') {
        this.menuForm.parentCode = row.code;
        this.menuTitle = '创建子菜单';
      }
      this.menuForm.applyName = '';
      this.menuForm.menuName = '';
      this.menuForm.menuCode = '';
      this.menuForm.URI = '';
      this.menuForm.openStyle = 0;
      this.menuForm.icon = '';
      this.menuForm.isShow = 1;
    },
    // 取消创建
    cancelCreate() {
      this.dialogVisible = false;
      this.$refs.menuForm.clearValidate();
    },
    // 确定创建
    sureCreate(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let para = {
            requestProject: this.requestProject,
            menuName: this.menuForm.menuName,
            code: this.menuForm.menuCode,
            uri: this.menuForm.URI,
            appId: this.menuForm.applyName,
            target: this.menuForm.openStyle,
            iconUrl: this.menuForm.icon,
            isShow: this.menuForm.isShow,
            parentCode: this.menuForm.parentCode,
            id: this.menuId
          };
          if (this.menuType == 'add') {
            delete para.id;
            postRequest('/gic-authcenter/menu/tree', para)
              .then(res => {
                let data = res.data;
                if (data.errorCode == 0) {
                  this.dialogVisible = false;
                  this.getMenuList();
                  this.$message.success('保存成功');
                } else {
                  this.$message.error(data.message);
                }
              })
              .catch(error => {
                console.log(error);
              });
          } else if (this.menuType == 'edit') {
            putRequest(`/gic-authcenter/menu/tree/${this.menuForm.menuCode}`, para)
              .then(res => {
                let data = res.data;
                if (data.errorCode == 0) {
                  this.dialogVisible = false;
                  this.getMenuList();
                  this.$message.success('保存成功');
                } else {
                  this.$message.error(data.message);
                }
              })
              .catch(error => {
                console.log(error);
              });
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    }
  },
  components: {
    ywInput
  }
};
</script>
<style lang="less" scoped>
.my-right-content {
  padding: 24px;
  box-sizing: border-box;
  .create-btn {
    text-align: right;
    padding-bottom: 24px;
  }
}
.menu-name-wrap {
  display: inline-block;
  span {
    font-size: 12px;
    padding: 4px 6px;
    color: #909399;
    border-radius: 4px;
    margin-right: 5px;
    border: 1px dashed #c0c4cc;
    cursor: pointer;
  }
  .num-input-wrap {
    width: 34px;
    margin-right: 5px;
    /deep/ .el-input__inner {
      padding: 0 3px;
      text-align: center;
      font-size: 12px;
    }
  }
}
.my-no-data-wrap {
  text-align: center;
  padding-top: 120px;
  i {
    color: #7db6ff;
    font-size: 80px;
    padding-left: 15px;
  }
  h3 {
    padding: 17px 0 23px;
    color: #909399;
    font-size: 14px;
    line-height: 20px;
  }
  /deep/ span {
    letter-spacing: 2px;
  }
  /deep/ .el-button {
    padding: 8px 20px;
  }
}
.my-name-wrap {
  padding-left: 19px;
}
.my-table-wrap /deep/ tbody > tr > td:first-child .cell {
  padding-left: 0;
}
.my-no-child {
  padding-left: 0;
}
</style>

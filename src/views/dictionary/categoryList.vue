<template>
  <div class="my-right-content">
    <div class="create-btn clearfix">
      <el-input @keyup.native.enter="searchList" clearable class="search-input" placeholder="请输入目录名称、目录编码" prefix-icon="el-icon-search" v-model="searchInput"> </el-input>
      <el-button class="fr" @click="toCreateMenu('main')" type="primary">创建字典分类</el-button>
    </div>
    <el-table v-loading="loading" :data="tableData" row-key="id" class="table-no-line-wrap my-table-wrap" lazy :load="loadNextList">
      <el-table-column prop="categoryName" label="分类目录名称">
        <template slot-scope="scoped">
          <div v-if="scoped.row.indexSort > -1" class="menu-name-wrap" :class="{ 'my-name-wrap': scoped.row.firstLevel, 'my-no-child': scoped.row.nextCount > 0 }">
            <el-tooltip v-if="scoped.row.numBool" class="item" effect="dark" content="排序" placement="top">
              <span @click="changeNum(scoped.row)">{{ scoped.row.indexSort }}</span>
            </el-tooltip>
            <el-input v-else type="number" @blur="blurNumInput(scoped.row)" @keyup.native="keyupInput(scoped.row)" v-focus="!scoped.row.numBool" class="num-input-wrap" v-model.trim="scoped.row.indexSort"></el-input>
            {{ scoped.row.categoryName }}
          </div>
          <span v-else>{{ scoped.row.categoryName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="分类目录编码"> </el-table-column>
      <el-table-column prop="parentCode" label="父级编码" show-overflow-tooltip>
        <template slot-scope="scoped">{{ scoped.row.parentCode ? scoped.row.parentCode : '--' }}</template>
      </el-table-column>
      <el-table-column prop="opr" label="操作" width="220">
        <template slot-scope="scoped">
          <el-button v-show="scoped.row.indexSort < 0" @click="lookDictionay(scoped.row)" type="text">查看</el-button>
          <el-button @click="editMenu(scoped.row)" type="text">编辑</el-button>
          <el-button @click="toCreateMenu('child', scoped.row)" type="text">创建子节点</el-button>
          <el-button v-show="scoped.row.nextCount < 1" @click="delMenu(scoped, scoped.row, scoped.$index)" type="text">删除</el-button>
        </template>
      </el-table-column>
      <template slot="empty">
        <div class="no-data-wrap">
          <div class="no-data-icon">
            <img src="../../../static/img/no-data_icon.png" alt="" />
          </div>
          <p>暂无数据</p>
        </div>
      </template>
    </el-table>
    <div class="pagination" v-show="totalCount > 0">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next" :total="totalCount"> </el-pagination>
    </div>
    <!-- 创建字典分类 -->
    <el-dialog :title="menuTitle" :visible.sync="dialogVisible" width="425px" :before-close="cancelCreate">
      <el-form :model="menuForm" :rules="rules" ref="menuForm" label-width="110px">
        <el-form-item label="分类目录名称" prop="name">
          <yw-input v-model="menuForm.name" :byteType="0" :maxlength="20" placeholder="最多20个字"></yw-input>
        </el-form-item>
        <el-form-item label="分类目录编码" prop="menuCode">
          <yw-input :disabled="editCodeBool" v-model="menuForm.menuCode" :byteType="0" :maxlength="32" placeholder="英文、下划线、数字组成，最多32字"></yw-input>
        </el-form-item>
        <el-form-item v-show="menuForm.parentCode" label="父级编码">
          <el-input disabled v-model="menuForm.parentCode"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreate">取 消</el-button>
        <el-button type="primary" @click="sureCreate('menuForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 查看 -->
    <el-dialog class="look-tree-dialog-wrap" title="查看" :visible.sync="dialogVisibleLook" width="450px">
      <el-tree ref="lookTree" :data="lookData" :props="defaultProps" default-expand-all node-key="id" class="look-tree-wrap" highlight-current :expand-on-click-node="false" @node-click="handleNodeClick"></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisibleLook = false">知道了</el-button>
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
    callback(new Error('请输入分类目录名称'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('分类目录名称不允许有空格'));
  } else {
    callback();
  }
};
let numLineLetter = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入分类目录编码'));
  } else if (!isNumLineLetter(value)) {
    callback(new Error('分类目录编码只能由英文、下划线、数字组成'));
  } else {
    callback();
  }
};
export default {
  name: 'categoryList',
  data() {
    return {
      requestProject: 'gic-bizdict',
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      menuTitle: '创建字典分类',
      dialogVisible: false,
      options: [],
      editCodeBool: false, // 编辑时是否可以更改菜单编码
      menuForm: {
        name: '',
        menuCode: '',
        parentCode: ''
      },
      rules: {
        name: [{ required: true, trigger: 'blur', validator: commonSpace }],
        menuCode: [{ required: true, trigger: 'blur', validator: numLineLetter }]
      },
      loading: false,
      menuType: '', // 创建菜单  新建or编辑
      menuId: '',
      // 搜索
      searchInput: '',
      // 查看
      dialogVisibleLook: false,
      lookData: [],
      defaultProps: {
        children: 'nodeChildren',
        label: 'categoryName'
      },
      currentTreeId: ''
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let tabId = this.$route.query.tabId;
      this.$emit('showTab', tabId);
      this.getDictionaryList();
    },
    // 获取字典列表
    getDictionaryList() {
      this.loading = true;
      let para = {
        requestProject: this.requestProject,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchInput
      };
      getRequest('/gic-bizdict/category/root', para)
        .then(res => {
          let data = res.data.result;
          this.loading = false;
          if (data.errorCode == 0) {
            let tableData = data.result ? data.result : [];
            if (this.searchInput != '') {
              this.tableData = tableData;
            } else {
              // 无搜索
              this.tableData = this.addMenuPara(tableData);
              this.tableData.forEach(item => {
                item.firstLevel = true;
              });
            }
            this.totalCount = data.totalCount;
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 查询下一级
    loadNextList(tree, treeNode, resolve) {
      let para = {
        requestProject: this.requestProject,
        code: tree.code
      };
      let nextData = [];
      getRequest('/gic-bizdict/category/next', para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            let tableData = data.result ? data.result : [];
            nextData = this.addMenuPara(tableData);
            resolve(nextData);
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    searchList() {
      this.currentPage = 1;
      this.getDictionaryList();
    },
    // 分页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getDictionaryList();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getDictionaryList();
    },
    // 为菜单列表 添加 参数 numBool
    addMenuPara(tableData) {
      tableData.forEach(item => {
        item.numBool = true;
        item.total = tableData.length;
        item.hasChildren = item.nextCount > 0 ? true : false;
        item.oldSort = item.indexSort;
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
        sortCategory: true,
        sort: row.indexSort
      };
      putRequest(`/gic-bizdict/category/${row.code}`, para)
        .then(res => {
          let data = res.data;
          if (data.errorCode == 0) {
            this.getDictionaryList();
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
    // 查看
    lookDictionay(row) {
      this.dialogVisibleLook = true;
      let para = {
        requestProject: this.requestProject,
        code: row.code
      };
      getRequest('/gic-bizdict/category/tree', para)
        .then(res => {
          let data = res.data;
          this.loading = false;
          if (data.errorCode == 0) {
            this.lookData = data.result ? data.result : [];
            this.currentTreeId = row.id;
            this.$nextTick(_ => {
              this.$refs.lookTree.setCurrentKey(this.currentTreeId);
            });
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 查看  -- 点击树形结构
    handleNodeClick() {
      this.$refs.lookTree.setCurrentKey(this.currentTreeId);
    },
    // 删除字典分类
    delMenu(scoped, row, index) {
      this.$confirm('是否要删除选中的分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let para = {
            requestProject: this.requestProject
          };
          deleteRequest(`/gic-bizdict/category/${row.code}`, para).then(res => {
            let data = res.data;
            if (data.errorCode == 0) {
              this.getDictionaryList();
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
      this.menuTitle = '编辑字典分类';
      this.menuType = 'edit';
      this.dialogVisible = true;
      this.editCodeBool = true;
      this.menuId = row.id;
      this.menuForm = {
        name: row.categoryName,
        menuCode: row.code,
        parentCode: row.parentCode
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
        this.menuTitle = '创建字典分类';
        this.menuForm.parentCode = '';
      } else if (type == 'child') {
        this.menuForm.parentCode = row.code;
        this.menuTitle = '创建子节点';
      }
      this.menuForm.name = '';
      this.menuForm.menuCode = '';
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
            categoryName: this.menuForm.name,
            code: this.menuForm.menuCode,
            parentCode: this.menuForm.parentCode
          };
          if (this.menuType == 'add') {
            postRequest('/gic-bizdict/category', para)
              .then(res => {
                let data = res.data;
                if (data.errorCode == 0) {
                  this.dialogVisible = false;
                  this.searchInput = '';
                  this.currentPage = 1;
                  this.getDictionaryList();
                  this.$message.success('保存成功');
                } else {
                  this.$message.error(data.message);
                }
              })
              .catch(error => {
                console.log(error);
              });
          } else if (this.menuType == 'edit') {
            putRequest(`/gic-bizdict/category/${this.menuForm.menuCode}`, para)
              .then(res => {
                let data = res.data;
                if (data.errorCode == 0) {
                  this.dialogVisible = false;
                  this.getDictionaryList();
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
    padding-bottom: 24px;
    font-size: 0;
    .search-input {
      font-size: 14px;
      width: 245px;
      margin-right: 10px;
    }
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
// 查看
.look-tree-dialog-wrap /deep/ .el-dialog__body {
  padding-top: 10px;
}
.look-tree-dialog-wrap /deep/ .el-tree-node.is-current > .el-tree-node__content {
  color: #1890ff;
  font-weight: 700 !important;
  background: transparent;
}
.look-tree-wrap {
  padding: 10px;
  height: 200px;
  overflow: auto;
  background: #f0f2f5;
}
</style>

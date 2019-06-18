<template>
  <div class="my-right-content">
    <div class="create-btn clearfix">
      <el-input @keyup.native.enter="searchList" clearable class="search-input" placeholder="请输入名称、内容、字典编码" prefix-icon="el-icon-search" v-model="searchInput1"> </el-input>
      <el-input @keyup.native.enter="searchList" clearable class="search-input" placeholder="请输入字典类型" prefix-icon="el-icon-search" v-model="searchInput2"> </el-input>
      <el-popover v-model="searchVisiblePopover" placement="bottom" width="219" trigger="click">
        <el-input v-model="searchCategoryName" placeholder="请输入内容" prefix-icon="el-icon-search" clearable></el-input>
        <el-tree ref="tree3" class="my-tree-wrap" default-expand-all :expand-on-click-node="false" :data="categoryTreeData" :props="defaultProps" @node-click="handleNodeClick2" :filter-node-method="filterNode"></el-tree>
        <div class="el-input dm-store__reference search-input" slot="reference" @click="getCategoryList">
          <div class="el-input__inner dm-store__inputtag">
            <el-tag v-if="searchInput3 != ''" size="small" closable @close="delItem">{{ searchInput3 }}</el-tag>
            <span v-else class="gray-color dm-store__inputtag--tips">请选择类目</span>
          </div>
        </div>
      </el-popover>
      <el-button class="fr" @click="toCreateMenu('main')" type="primary">创建字典类目</el-button>
    </div>
    <el-table v-loading="loading" :data="tableData" row-key="id" lazy :load="loadNextList" class="my-table-wrap table-no-line-wrap">
      <el-table-column prop="name" label="名称" show-overflow-tooltip min-width="100">
        <template slot-scope="scoped">
          <div v-if="scoped.row.indexSort > -1" class="menu-name-wrap " :class="{ 'my-name-wrap': scoped.row.firstLevel, 'my-no-child': scoped.row.nextCount > 0 }">
            <el-tooltip v-if="scoped.row.numBool" class="item" effect="dark" content="排序" placement="top">
              <span @click="changeNum(scoped.row)">{{ scoped.row.indexSort }}</span>
            </el-tooltip>
            <el-input v-else type="number" @blur="blurNumInput(scoped.row)" @keyup.native="keyupInput(scoped.row)" v-focus="!scoped.row.numBool" class="num-input-wrap" v-model.trim="scoped.row.indexSort"></el-input>
            {{ scoped.row.name }}
          </div>
          <span v-else>{{ scoped.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="typeDict" label="字典类型" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="code" label="字典编码" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="parentCode" label="父级编码" show-overflow-tooltip>
        <template slot-scope="scoped">{{ scoped.row.parentCode ? scoped.row.parentCode : '--' }}</template>
      </el-table-column>
      <el-table-column prop="categoryName" label="类目名称" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="categoryCode" label="类目code" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="valueContent" label="内容" show-overflow-tooltip> </el-table-column>
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
    <!-- 创建字典 -->
    <el-dialog :title="menuTitle" :visible.sync="dialogVisible" width="500px" :before-close="cancelCreate">
      <el-form :model="menuForm" :rules="rules" ref="menuForm" label-width="140px">
        <el-form-item label="字典分类目录名称" prop="categoryName" class="is-required" :class="{ 'is-error': categoryNameBool, 'is-success': !categoryNameBool && menuForm.categoryName != '' }">
          <el-popover v-if="!createMainBool" v-model="visiblePopover" placement="bottom" width="294" trigger="click">
            <el-input v-model="categorySearchName" placeholder="请输入内容" prefix-icon="el-icon-search" clearable></el-input>
            <el-tree ref="tree2" class="my-tree-wrap" default-expand-all :expand-on-click-node="false" :data="categoryTreeData" :props="defaultProps" @node-click="handleNodeClick" :filter-node-method="filterNode"></el-tree>
            <el-input readonly slot="reference" v-model="menuForm.categoryName" placeholder="请选择字典分类目录名称"></el-input>
          </el-popover>
          <el-input v-else :disabled="createMainBool" v-model="menuForm.categoryName" placeholder="请选择字典分类目录名称"></el-input>
          <div v-show="categoryNameBool && menuForm.categoryName == ''" class="el-form-item__error">请选择字典分类目录名称</div>
        </el-form-item>
        <el-form-item label="字典类型" prop="typeDict">
          <yw-input v-model="menuForm.typeDict" :byteType="0" :maxlength="32" placeholder="英文、下划线、数字组成，最多32字"></yw-input>
        </el-form-item>
        <el-form-item label="字典编码" prop="code">
          <yw-input :disabled="editCodeBool" v-model="menuForm.code" :byteType="0" :maxlength="32" placeholder="英文、下划线、数字组成，最多32字"></yw-input>
        </el-form-item>
        <el-form-item v-show="menuForm.parentCode" label="父级编码">
          <yw-input disabled v-model="menuForm.parentCode" :byteType="0" :maxlength="32"></yw-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <yw-input v-model="menuForm.name" :byteType="0" :maxlength="20" placeholder="最多20字"></yw-input>
        </el-form-item>
        <el-form-item label="别名">
          <yw-input v-model="menuForm.aliasName" :byteType="0" :maxlength="20" placeholder="最多20字"></yw-input>
        </el-form-item>
        <el-form-item label="内容" prop="valueContent">
          <el-input v-model="menuForm.valueContent" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="说明">
          <el-input type="textarea" v-model="menuForm.remark"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreate">取 消</el-button>
        <el-button type="primary" @click="sureCreate('menuForm')">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 查看 -->
    <el-dialog class="look-tree-dialog-wrap" title="查看" :visible.sync="dialogVisibleLook" width="450px">
      <el-tree ref="lookTree" :data="lookData" :props="defaultPropsLook" default-expand-all node-key="id" class="look-tree-wrap" highlight-current :expand-on-click-node="false" @node-click="lookHandleNodeClick"></el-tree>
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
    callback(new Error('请输入内容'));
  } else if (!isNumLineLetter(value)) {
    callback(new Error('内容只能由英文、下划线、数字组成'));
  } else {
    callback();
  }
};
export default {
  name: 'menuManage',
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
      createMainBool: false,
      menuForm: {
        categoryName: '',
        categoryCode: '',
        typeDict: '',
        code: '',
        name: '',
        aliasName: '',
        valueContent: '',
        remark: ''
      },
      rules: {
        // categoryName: [{ required: true, trigger: 'change', message: '请选择字典分类目录名称' }],
        typeDict: [{ required: true, trigger: 'blur', validator: numLineLetter }],
        code: [{ required: true, trigger: 'blur', validator: numLineLetter }],
        name: [{ required: true, trigger: 'blur', validator: commonSpace }],
        valueContent: [{ required: true, trigger: 'blur', message: '请输入内容' }]
      },
      loading: false,
      menuType: '', // 创建菜单  新建or编辑
      menuId: '',
      // 字典分类目录名称  带搜索
      visiblePopover: false,
      categoryTreeData: [],
      defaultProps: {
        children: 'nodeChildren',
        label: 'categoryName'
      },
      categorySearchName: '',
      categoryNameBool: false,
      // 搜索
      searchInput1: '',
      searchInput2: '',
      searchInput3: '',
      searchCategoryCode: '',
      searchCategoryName: '',
      searchVisiblePopover: false,
      // 查看
      dialogVisibleLook: false,
      lookData: [],
      defaultPropsLook: {
        children: 'nodeChildren',
        label: 'name'
      },
      currentTreeId: ''
    };
  },
  mounted() {
    this.init();
  },
  watch: {
    categorySearchName(val) {
      this.$refs.tree2.filter(val);
    },
    searchCategoryName(val) {
      this.$refs.tree3.filter(val);
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.categoryName.indexOf(value) !== -1;
    },
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
        search: this.searchInput1,
        typeDict: this.searchInput2,
        categoryCode: this.searchCategoryCode
      };
      getRequest('/gic-bizdict/dict/root', para)
        .then(res => {
          let data = res.data.result;
          this.loading = false;
          if (data.errorCode == 0) {
            let tableData = data.result ? data.result : [];
            if (this.searchInput1 != '' && this.searchInput2 != '' && this.searchCategoryCode != '') {
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
        code: tree.code,
        categoryCode: tree.categoryCode
      };
      let nextData = [];
      getRequest('/gic-bizdict/dict/next', para)
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
    // 搜索
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
        // item.children = item.nodeChildren ? item.nodeChildren : [];
        item.total = tableData.length;
        item.hasChildren = item.nextCount > 0 ? true : false;
        item.oldSort = item.indexSort;
        // if (item.children.length > 0) {
        //   this.addMenuPara(item.children);
        // }
      });
      return tableData;
    },
    // 获取字典分类目录列表
    getCategoryList() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest('/gic-bizdict/category/all', para)
        .then(res => {
          let data = res.data;
          this.loading = false;
          if (data.errorCode == 0) {
            this.categoryTreeData = data.result ? data.result : [];
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
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
        sortDict: true,
        sort: row.indexSort,
        categoryCode: row.categoryCode
      };
      putRequest(`/gic-bizdict/dict/${row.code}`, para)
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
        code: row.code,
        categoryCode: row.categoryCode
      };
      getRequest('/gic-bizdict/dict/tree', para)
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
    lookHandleNodeClick() {
      this.$refs.lookTree.setCurrentKey(this.currentTreeId);
    },
    // 删除字典分类
    delMenu(scoped, row, index) {
      this.$confirm('是否要删除选中的字典?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let para = {
            requestProject: this.requestProject,
            categoryCode: row.categoryCode
          };
          deleteRequest(`/gic-bizdict/dict/${row.code}`, para).then(res => {
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
    // 字典分类目录名称  树形结构
    handleNodeClick(data) {
      this.menuForm.categoryName = data.categoryName;
      this.menuForm.categoryCode = data.code;
      this.categorySearchName = '';
      this.visiblePopover = false;
      this.categoryNameBool = false;
    },
    handleNodeClick2(data) {
      this.searchInput3 = data.categoryName;
      this.searchCategoryCode = data.code;
      this.searchCategoryName = '';
      this.searchVisiblePopover = false;
      this.searchList();
    },
    // 字典分类目录名称 移除选中的
    delItem() {
      this.searchInput3 = '';
      this.searchCategoryCode = '';
      this.currentPage = 1;
      this.getDictionaryList();
    },
    // 编辑菜单
    editMenu(row) {
      this.getCategoryList();
      this.menuTitle = '编辑字典';
      this.menuType = 'edit';
      this.dialogVisible = true;
      this.editCodeBool = true;
      this.createMainBool = true;
      this.menuId = row.id;
      this.menuForm = {
        categoryName: row.categoryName,
        categoryCode: row.categoryCode,
        typeDict: row.typeDict,
        code: row.code,
        name: row.name,
        aliasName: row.aliasName,
        valueContent: row.valueContent,
        remark: row.remark,
        parentCode: row.parentCode
      };
    },
    // 创建菜单
    toCreateMenu(type, row) {
      this.dialogVisible = true;
      this.editCodeBool = false;
      this.menuId = '';
      this.menuType = 'add';
      this.getCategoryList();
      if (this.$refs.menuForm) {
        this.$refs.menuForm.resetFields();
      }
      if (type == 'main') {
        this.menuTitle = '创建字典';
        this.menuForm.parentCode = '';
        this.createMainBool = false;
        this.menuForm.categoryName = '';
        this.menuForm.categoryCode = '';
        this.categorySearchName = '';
      } else if (type == 'child') {
        this.menuForm.parentCode = row.code;
        this.menuTitle = '创建子节点';
        this.createMainBool = true;
        this.menuForm.categoryName = row.categoryName;
        this.menuForm.categoryCode = row.categoryCode;
      }
      this.menuForm.typeDict = '';
      this.menuForm.name = '';
      this.menuForm.code = '';
      this.menuForm.aliasName = '';
      this.menuForm.valueContent = '';
      this.menuForm.remark = '';
    },
    // 取消创建
    cancelCreate() {
      this.dialogVisible = false;
      this.$refs.menuForm.clearValidate();
    },
    // 确定创建
    sureCreate(formName) {
      this.$refs[formName].validate(valid => {
        this.categoryNameBool = this.menuForm.categoryName != '' ? false : true;
        if (valid && !this.categoryNameBool) {
          let para = {
            requestProject: this.requestProject,
            parentCode: this.menuForm.parentCode,
            categoryCode: this.menuForm.categoryCode,
            typeDict: this.menuForm.typeDict,
            code: this.menuForm.code,
            name: this.menuForm.name,
            valueContent: this.menuForm.valueContent,
            aliasName: this.menuForm.aliasName,
            remark: this.menuForm.remark
          };
          if (this.menuType == 'add') {
            postRequest('/gic-bizdict/dict', para)
              .then(res => {
                let data = res.data;
                if (data.errorCode == 0) {
                  this.dialogVisible = false;
                  this.searchInput1 = '';
                  this.searchInput2 = '';
                  this.searchInput3 = '';
                  this.searchCategoryCode = '';
                  this.searchCategoryName = '';
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
            putRequest(`/gic-bizdict/dict/${this.menuForm.code}`, para)
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
  // padding-left: 16px;
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
.my-tree-wrap {
  max-height: 200px;
  overflow: auto;
  margin-top: 10px;
  /deep/ .el-tree-node__label {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
.my-table-wrap /deep/ tbody > tr > td:first-child .cell {
  padding-left: 0;
}
.my-name-wrap {
  padding-left: 19px;
}
.my-no-child {
  padding-left: 0;
}

.dm-store__reference {
  position: relative;
  .el-input__inner {
    line-height: 28px !important;
  }
}
.dm-store__inputtag {
  white-space: nowrap;
  overflow: hidden;
  padding: 0 6px;
  line-height: 28px;
  vertical-align: middle;
}
.dm-store__inputtag--tips {
  padding: 6px;
  font-size: 14px;
}
.gray-color {
  color: #909399;
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

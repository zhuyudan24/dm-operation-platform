<template>
  <div class="my-right-content">
    <div class="search-wrap clearfix">
      <el-input @keyup.native.enter="searchList" class="fl" v-model="searchInput" prefix-icon="el-icon-search" placeholder="请输入内容" clearable></el-input>
      <el-button @click="addCreate('add')" class="fr" type="primary">新增权限</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" class="table-no-line-wrap">
      <el-table-column prop="permissionName" label="权限名称" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="permissionCode" label="权限code" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="remark" label="说明" show-overflow-tooltip>
        <template slot-scope="scoped">
          {{ scoped.row.remark ? scoped.row.remark : '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="操作日期">
        <template slot-scope="scoped">
          {{ scoped.row.updateTime | dateFormat('YYYY-MM-DD hh:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="opr" label="操作" width="120">
        <template slot-scope="scoped">
          <el-button @click="addCreate('edit', scoped.row)" type="text">编辑</el-button>
          <el-button @click="delAuthority(scoped.row, scoped.$index)" type="text">删除</el-button>
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
    <!-- 新增权限 -->
    <el-dialog :title="menuTitle" :visible.sync="dialogVisible" width="425px" :before-close="cancelCreate">
      <el-form :model="menuForm" :rules="rules" ref="menuForm" label-width="100px">
        <el-form-item label="权限名称" prop="menuName">
          <yw-input v-model="menuForm.menuName" :byteType="0" :maxlength="20" placeholder="最多20字"></yw-input>
        </el-form-item>
        <el-form-item label="权限code" prop="menuCode">
          <yw-input :disabled="editCodeType == 'edit'" v-model="menuForm.menuCode" :byteType="0" :maxlength="32" placeholder="英文、下划线、数字组成，最多32字"></yw-input>
        </el-form-item>
        <el-form-item label="说明">
          <yw-input type="textarea" v-model="menuForm.detail" :byteType="0" :maxlength="200"></yw-input>
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
    callback(new Error('请输入权限名称'));
  } else if (!isCommonSpace(value)) {
    callback(new Error('权限名称不允许有空格'));
  } else {
    callback();
  }
};
let numLineLetter = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入权限code'));
  } else if (!isNumLineLetter(value)) {
    callback(new Error('权限code只能由英文、下划线、数字组成'));
  } else {
    callback();
  }
};
export default {
  name: 'authorityList',
  data() {
    return {
      requestProject: 'gic-authcenter',
      searchInput: '',
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      loading: false,
      dialogVisible: false,
      menuTitle: '新增权限',
      editCodeType: 'add', // 编辑时不可以更改编码
      menuForm: {
        menuName: '',
        menuCode: '',
        detail: ''
      },
      rules: {
        menuName: [{ required: true, trigger: 'blur', validator: commonSpace }],
        menuCode: [{ required: true, trigger: 'blur', validator: numLineLetter }]
      }
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let tabId = this.$route.query.tabId;
      this.$emit('showTab', tabId);
      this.getList();
    },
    // 获取权限列表
    getList() {
      this.loading = true;
      let para = {
        requestProject: this.requestProject,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchInput
      };
      getRequest('/gic-authcenter/permission', para)
        .then(res => {
          let data = res.data;
          this.loading = false;
          if (data.errorCode == 0) {
            this.tableData = data.result ? data.result : [];
            this.totalCount = data.totalCount;
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 分页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getList();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getList();
    },
    // 搜索
    searchList() {
      this.currentPage = 1;
      this.getList();
    },
    // 删除
    delAuthority(row, index) {
      this.$confirm('是否要删除选中的权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let para = {
            requestProject: this.requestProject
          };
          deleteRequest(`/gic-authcenter/permission/${row.permissionCode}`, para).then(res => {
            let data = res.data;
            if (data.errorCode == 0) {
              this.totalCount--;
              this.tableData.splice(index, 1);
              if (this.tableData.length == 0) {
                if (this.currentPage > 1) {
                  this.currentPage--;
                  this.getList();
                } else {
                  if (this.totalCount > 0) {
                    this.getList();
                  }
                }
              }
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
    // 新建角色
    addUserBtn() {
      // this.$router.push('/addRole');
    },
    addCreate(type, row) {
      this.dialogVisible = true;
      this.editCodeType = type;
      if (type == 'add') {
        this.menuTitle = '新增权限';
        this.menuForm.menuName = '';
        this.menuForm.menuCode = '';
        this.menuForm.detail = '';
      } else if (type == 'edit') {
        this.menuTitle = '编辑权限';
        this.menuForm.menuName = row.permissionName;
        this.menuForm.menuCode = row.permissionCode;
        this.menuForm.detail = row.remark;
      }
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
            permissionName: this.menuForm.menuName,
            permissionCode: this.menuForm.menuCode,
            remark: this.menuForm.detail
          };
          if (this.editCodeType == 'add') {
            postRequest('/gic-authcenter/permission', para)
              .then(res => {
                let data = res.data;
                if (data.errorCode == 0) {
                  this.dialogVisible = false;
                  this.getList();
                  this.$message.success('保存成功');
                } else {
                  this.$message.error(data.message);
                }
              })
              .catch(error => {
                console.log(error);
              });
          } else if (this.editCodeType == 'edit') {
            delete para.permissionCode;
            putRequest(`/gic-authcenter/permission/${this.menuForm.menuCode}`, para)
              .then(res => {
                let data = res.data;
                if (data.errorCode == 0) {
                  this.dialogVisible = false;
                  this.getList();
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
}
.search-wrap {
  margin-bottom: 24px;
  .fl {
    width: 280px;
  }
}
</style>

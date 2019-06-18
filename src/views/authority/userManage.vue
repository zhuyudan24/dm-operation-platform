<template>
  <div class="my-right-content">
    <div class="search-wrap clearfix">
      <el-input @keyup.native.enter="searchList" class="fl" v-model="searchInput" prefix-icon="el-icon-search" placeholder="请输入内容" clearable></el-input>
      <el-button @click="addUserBtn('add')" class="fr" type="primary">新增用户</el-button>
    </div>
    <el-table :data="tableData" v-loading="loading" class="table-no-line-wrap">
      <el-table-column prop="loginName" label="用户名" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="employeeNumber" label="工号" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="realName" label="姓名" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="sex" label="性别">
        <template slot-scope="scoped">
          <span v-if="scoped.row.sex == 0">女</span>
          <span v-else-if="scoped.row.sex == 1">男</span>
          <span v-else>未知</span>
        </template>
      </el-table-column>
      <el-table-column prop="departmentName" label="部门名称" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="position" label="职位" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="email" label="邮箱" show-overflow-tooltip>
        <template slot-scope="scoped">
          {{ scoped.row.email ? scoped.row.email : '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="userMobile" label="手机号码" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="opr" label="操作" width="120">
        <template slot-scope="scoped">
          <el-button @click="addUserBtn('edit', scoped.row)" type="text">编辑</el-button>
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
  </div>
</template>
<script>
import { getRequest, deleteRequest } from '@/api/api';
export default {
  name: 'userList',
  data() {
    return {
      requestProject: 'gic-authcenter',
      searchInput: '',
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      loading: false
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
    // 获取用户列表
    getList() {
      this.loading = true;
      let para = {
        requestProject: this.requestProject,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchInput
      };
      getRequest('/gic-authcenter/user', para)
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
      this.$confirm('是否要删除选中的用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let para = {
            requestProject: this.requestProject
          };
          deleteRequest(`/gic-authcenter/user/${row.loginName}`, para).then(res => {
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
    addUserBtn(type, row) {
      if (type == 'add') {
        this.$router.push({
          path: '/addUser',
          query: {
            tabId: this.$route.query.tabId
          }
        });
      } else if (type == 'edit') {
        this.$router.push({
          path: '/addUser',
          query: {
            loginName: row.loginName,
            tabId: this.$route.query.tabId
          }
        });
      }
    }
  },
  components: {}
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

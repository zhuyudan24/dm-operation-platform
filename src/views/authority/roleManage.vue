<template>
  <div class="my-right-content">
    <div class="search-wrap clearfix">
      <el-input @keyup.native.enter="searchRole" class="fl" v-model="searchInput" prefix-icon="el-icon-search" placeholder="请输入内容" clearable></el-input>
      <el-button @click="addRoleBtn('add')" class="fr" type="primary">创建角色</el-button>
    </div>
    <el-table :data="tableData" class="table-no-line-wrap">
      <el-table-column prop="roleName" label="名称"> </el-table-column>
      <el-table-column prop="systemCount" label="关联系统"> </el-table-column>
      <el-table-column prop="menuCount" label="关联菜单"> </el-table-column>
      <el-table-column prop="permissionCount" label="权限"> </el-table-column>
      <el-table-column prop="remark" label="说明" show-overflow-tooltip>
        <template slot-scope="scoped">
          {{ scoped.row.remark ? scoped.row.remark : '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="opr" label="操作" width="120">
        <template slot-scope="scoped">
          <el-button @click="addRoleBtn('edit', scoped.row)" type="text">编辑</el-button>
          <el-button @click="delRole(scoped.row, scoped.$index)" type="text">删除</el-button>
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
  name: 'roleManage',
  data() {
    return {
      requestProject: 'gic-authcenter',
      searchInput: '',
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      totalCount: 0
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let tabId = this.$route.query.tabId;
      this.$emit('showTab', tabId);
      this.getRoleList();
    },
    getRoleList() {
      let para = {
        requestProject: this.requestProject,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        listAll: false,
        search: this.searchInput
      };
      getRequest('/gic-authcenter/role', para).then(res => {
        let data = res.data;
        if (data.errorCode == 0) {
          this.tableData = data.result ? data.result : [];
          this.totalCount = data.totalCount;
        } else {
          this.$message.error(data.message);
        }
      });
    },
    // 分页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getRoleList();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getRoleList();
    },
    searchRole() {
      this.pageSize = 1;
      this.getRoleList();
    },
    // 删除
    delRole(row, index) {
      this.$confirm('是否要删除选中的角色?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let para = {
            requestProject: this.requestProject
          };
          deleteRequest(`/gic-authcenter/role/${row.id}`, para).then(res => {
            let data = res.data;
            if (data.errorCode == 0) {
              this.totalCount--;
              this.tableData.splice(index, 1);
              if (this.tableData.length == 0) {
                if (this.currentPage > 1) {
                  this.currentPage--;
                  this.getRoleList();
                } else {
                  if (this.totalCount > 0) {
                    this.getRoleList();
                  }
                }
              }
              this.$message.success('删除成功');
            } else {
              this.$message.error(data.message);
            }
          });
        })
        .catch(() => {});
    },
    // 新建角色
    addRoleBtn(type, row) {
      if (type == 'add') {
        this.$router.push({
          path: '/addRole',
          query: {
            tabId: this.$route.query.tabId
          }
        });
      } else if (type == 'edit') {
        this.$router.push({
          path: '/addRole',
          query: {
            roleId: row.id,
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

<template>
  <div class="log-wrap" :style="{ 'min-height': bgHeight }">
    <div class="search-wrap">
      <el-input @keyup.native.enter="changeDate" class="input-w265" placeholder="请输入内容" v-model="searchInput" clearable>
        <el-select @change="changeDate" class="search-select" v-model="searchType" slot="prepend" placeholder="请选择">
          <el-option v-for="item in optionsSearch" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-input>
      <el-date-picker @change="changeDate" v-model="dateValue" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"> </el-date-picker>
      <el-select @change="changeDate" class="margin-l8 width158" v-model="oprStyle" placeholder="请选择操作类型">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
      </el-select>
      <el-select @change="changeDate" class="margin-l8 width158" v-model="applyId" placeholder="请选择应用模块">
        <el-option v-for="item in optionsApply" :key="item.id" :label="item.appName" :value="item.id"> </el-option>
      </el-select>
    </div>
    <el-table :data="tableData" max-height="550" v-loading="loading" class="table-no-line-wrap">
      <el-table-column prop="employeeNumber" label="用户工号" width="80"> </el-table-column>
      <el-table-column prop="userName" label="用户姓名"> </el-table-column>
      <el-table-column prop="userMobile" label="手机号"> </el-table-column>
      <el-table-column prop="position" label="职位"> </el-table-column>
      <el-table-column prop="ipAddress" label="IP地址"> </el-table-column>
      <el-table-column prop="appName" label="应用模块"> </el-table-column>
      <el-table-column prop="type" label="操作类型">
        <template slot-scope="scoped">
          <p v-if="scoped.row.type == 0">登录</p>
          <p v-else-if="scoped.row.type == 1">登出</p>
          <p v-else-if="scoped.row.type == 2">查看</p>
          <p v-else-if="scoped.row.type == 3">新增</p>
          <p v-else-if="scoped.row.type == 4">修改</p>
          <p v-else-if="scoped.row.type == 5">删除</p>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="操作时间">
        <template slot-scope="scoped">
          {{ scoped.row.createTime | dateFormat('YYYY-MM-DD') }}<br /><span class="date-second-item">{{ scoped.row.createTime | dateFormat('hh:mm:ss') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="operTitle" label="日志标题">
        <template slot-scope="scoped">
          <p class="oper-content-wrap" :title="scoped.row.operTitle">{{ scoped.row.operTitle ? scoped.row.operTitle : '--' }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="operContent" label="日志内容">
        <template slot-scope="scoped">
          <p class="oper-content-wrap" :title="scoped.row.operContent">{{ scoped.row.operContent ? scoped.row.operContent : '--' }}</p>
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
import { getRequest } from '@/api/api';
export default {
  name: 'log',
  data() {
    return {
      requestProject: 'gic-authcenter',
      bgHeight: window.screen.availHeight - 220 + 'px',
      dateValue: [],
      optionsSearch: [
        {
          value: '1',
          label: '用户工号'
        },
        {
          value: '2',
          label: '用户姓名'
        },
        {
          value: '3',
          label: '手机号'
        },
        {
          value: '4',
          label: '职位'
        },
        {
          value: '5',
          label: '日志标题'
        },
        {
          value: '6',
          label: '日志内容'
        }
      ],
      searchInput: '',
      searchType: '1',
      options: [
        {
          value: '',
          label: '所有类型'
        },
        {
          value: '0',
          label: '登录'
        },
        {
          value: '1',
          label: '登出'
        },
        {
          value: '2',
          label: '查看'
        },
        {
          value: '3',
          label: '新增'
        },
        {
          value: '4',
          label: '修改'
        },
        {
          value: '5',
          label: '删除'
        }
      ],
      optionsApply: [],
      oprStyle: '',
      applyId: '',
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      loading: false
    };
  },
  mounted() {
    this.$emit('getLinkType', 'log');
    this.getLogList();
    this.getApplyList();
  },
  methods: {
    getLogList() {
      let para = {
        requestProject: this.requestProject,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchInput,
        searchType: this.searchType,
        startTime: this.dateValue[0],
        endTime: this.dateValue[1],
        type: this.oprStyle,
        appId: this.applyId
      };
      this.loading = true;
      getRequest('/gic-authcenter/log', para).then(res => {
        let data = res.data;
        this.loading = false;
        if (data.errorCode == 0) {
          let _result = data.result;
          this.tableData = _result.result ? _result.result : [];
          this.totalCount = _result.totalCount;
          this.dateValue = [_result.startTime, _result.endTime];
        } else {
          this.$message.error(data.message);
        }
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
            this.optionsApply = data.result ? data.result : [];
            let obj = {
              id: '',
              appName: '所有模块'
            };
            this.optionsApply.unshift(obj);
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 搜索  改变日期 选择类型 选择模块
    changeDate() {
      this.currentPage = 1;
      this.getLogList();
    },
    // 分页
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getLogList();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getLogList();
    }
  },
  components: {}
};
</script>
<style lang="less" scoped>
.log-wrap {
  background-color: #fff;
  padding: 24px;
  box-sizing: border-box;
  box-shadow: 0px 2px 8px 0px rgba(220, 223, 230, 0.3);
}
.search-wrap {
  font-size: 0;
  margin-bottom: 24px;
  .input-w265 {
    width: 300px;
    margin-right: 8px;
    font-size: 14px;
  }
  .search-select {
    width: 100px;
  }
}
.width158 {
  width: 158px;
}
.oper-content-wrap {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>

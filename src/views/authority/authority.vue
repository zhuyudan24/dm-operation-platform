<template>
  <div class="authority-wrap" :style="{ 'min-height': bgHeight }">
    <div class="my-left-aside">
      <yw-left-aside :tabListData="tabListData" :activeSelTab="activeSelTab" @setSelectTab="setSelectTab"></yw-left-aside>
    </div>
    <div class="my-right-wrap">
      <router-view @showTab="showTab"></router-view>
    </div>
  </div>
</template>
<script>
import { getRequest } from '@/api/api';
import ywLeftAside from '@/components/yw-left-aside';
export default {
  name: 'index',
  data() {
    return {
      requestProject: 'gic-authcenter',
      bgHeight: window.screen.availHeight - 220 + 'px',
      tabListData: [],
      activeSelTab: '',
      headerCode: ''
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.headerCode = this.$route.query.code;
      this.$emit('getLinkType', 'authority');
      this.getMenuTree();
    },
    // 获取左侧
    getMenuTree() {
      let para = {
        requestProject: 'gic-authcenter'
      };
      getRequest('/gic-authcenter/loginuser', para)
        .then(res => {
          let resData = res.data;
          if (resData.errorCode == 0) {
            this.entranceList = [];
            let entranceList = resData.result.menuTree ? resData.result.menuTree : [];
            entranceList.forEach(item => {
              if (item.code == 'authcenter' && item.nodeChildren && item.nodeChildren.length > 0) {
                item.nodeChildren.forEach(el => {
                  if (el.code == this.headerCode) {
                    let tabListData = [];
                    tabListData.push(el);
                    this.tabListData = this.getNewTabList(tabListData);
                    if (!this.activeSelTab) {
                      this.activeSelTab = this.tabListData[0].children.length > 0 ? this.tabListData[0].children[0].tabId : this.tabListData[0].tabId;
                    }
                  }
                });
              }
            });
          } else {
            this.$message.error(resData.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 整理左侧数据
    getNewTabList(tabListData) {
      tabListData.forEach(item => {
        if (item.isShow == 1) {
          item.tabId = item.id;
          item.tabName = item.menuName;
          item.icon = item.iconUrl != '' ? item.iconUrl : 'iconcaidan';
          item.onlyIconActive = false;
          item.children = item.nodeChildren ? item.nodeChildren : [];
          if (item.children.length > 0) {
            item.children.forEach(el => {
              el.icon = '';
            });
            this.getNewTabList(item.children);
          }
        }
      });
      return tabListData;
    },
    // 选择后返回tabId，做各路由判断
    setSelectTab(item) {
      this.$router.push({
        path: item.uri,
        query: {
          code: this.headerCode,
          tabId: item.tabId
        }
      });
    },
    // 各路由返回的tabId
    showTab(id) {
      this.activeSelTab = id;
    }
  },
  beforeRouteLeave(to, from, next) {
    // 路由离开之前存储数据
    let d = to;
    if (d.path != '/menuManage' || d.path != '/roleManage' || d.path != '/addRole' || d.path != '/userManage' || d.path != '/addUser' || d.path != '/authorityList') {
      this.$emit('getLinkType', '');
    }
    next();
  },
  components: {
    ywLeftAside
  }
};
</script>
<style lang="less" scoped>
.authority-wrap {
  display: flex;
  background: #fff;
}
</style>

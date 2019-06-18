<!--
  应用公共左侧菜单：
  <yw-left-aside
    :tabListData="tabListData"
    :activeSelTab="activeSelTab"
    @setSelectTab="setSelectTab">
  </yw-left-aside>
  // activeSelTab: 刷新时候传入的选中 tabId
  // tabListData: 列表数据
  // @setSelectTab: 选择后把选择的 tabId 返给父级
 -->
<template>
  <div>
    <ul class="tab-left-list">
      <template v-for="(item, index) in tabData">
        <li v-show="item.isShow == 1" :class="['tab-left-list-cell color-303133 font-14 border-box p-l-14 my-first-level', item.tabId == activeTab ? 'active-tab' : '']" :key="index" @click="selectTab(item, false, index)"><i class="my-icon" :class="['iconfont', item.icon, !!item.onlyIconActive ? 'iconActive' : '']"></i>{{ item.tabName }} <i v-if="!!item.children && !!item.children.length" :class="[!!collapsFlag ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i></li>
        <ul class="child-tab-left-list" :key="'childitem' + index" v-if="!!collapsFlag">
          <template v-for="(childitem, childIndex) in item.children">
            <li v-show="childitem.isShow == 1" :class="['tab-left-list-cell color-303133 font-14 border-box p-l-40', childitem.tabId == activeTab ? 'active-tab' : '']" :key="childIndex" @click="selectTab(childitem, 'child', index)">{{ childitem.tabName }}</li>
            <ul class="third-tab-left-list" :key="'thirditem' + childIndex">
              <template v-for="(thirditem, thirdIndex) in childitem.children">
                <li v-show="thirditem.isShow == 1" :class="['tab-left-list-cell color-303133 font-14 border-box p-l-60', thirditem.tabId == activeTab ? 'active-tab' : '']" :key="thirdIndex" @click="selectTab(thirditem, 'child', index)">{{ thirditem.tabName }}</li>
              </template>
            </ul>
          </template>
        </ul>
      </template>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'yw-left-aside',
  props: {
    appName: {
      type: String,
      default() {
        return '';
      }
    },
    // 刷新时候传入的选中 tabId
    activeSelTab: {
      type: [String, Number],
      default() {
        return '1';
      }
    },
    // 传入的 tabListData
    tabListData: {
      type: [Array, Object],
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      projectName: '', // 当前项目名
      activeTab: '1',
      tabData: this.tabListData,
      collapsFlag: true
    };
  },

  methods: {
    /**
     * 选择后触发方法，返回 tabId
     */
    selectTab(item, flag, index) {
      let that = this;
      if (!!flag) {
        that.tabData[index].onlyIconActive = true;
      } else {
        that.tabData.forEach(ele => {
          ele.onlyIconActive = false;
        });
        that.collapsFlag = !!that.collapsFlag && item.hasOwnProperty('children') && item.children.length > 0 ? false : true;
      }
      // 判断已选 item, 判断只让 icon 变色
      if (item.hasOwnProperty('children') && item.children.length > 0) {
        that.tabData[index].onlyIconActive = true;
        if (item.children[0].hasOwnProperty('children') && item.children[0].hasOwnProperty('children').length > 0) {
          that.activeTab = item.children[0].children[0].tabId;
          that.$emit('setSelectTab', item);
          return false;
        }
        that.activeTab = item.children[0].tabId;
        that.$emit('setSelectTab', item);
        return false;
      }
      that.activeTab = item.tabId;
      that.$emit('setSelectTab', item);
    }
  },
  watch: {
    tabListData: function(newData, oldData) {
      let that = this;
      that.tabData = newData;
    },
    activeSelTab: function(newData, oldData) {
      let that = this;
      that.activeTab = newData;
    }
  },
  mounted() {
    this.activeTab = this.activeSelTab;
  }
};
</script>
<style type="text/scss" lang="scss" scoped>
.tab-left-list {
  .tab-left-list-cell {
    position: relative;
    text-align: left;
    margin-top: 15px;
    height: 30px;
    line-height: 30px;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
    color: #909399;
    .iconActive {
      color: #1890ff;
    }
    &:hover {
      color: #606266;
      background: rgba(24, 144, 255, 0.06);
      i {
        color: #1890ff;
      }
    }
    &.active-tab {
      color: #606266;
      background: rgba(24, 144, 255, 0.06);
      &::before {
        content: ' ';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #1890ff;
        z-index: 1;
      }
      i {
        color: #1890ff;
      }
    }
  }
  .child-tab-left-list {
    -webkit-transition: all 0.5s ease-in-out;
    -o-transition: all 0.5s ease-in-out;
    -moz-transition: all 0.5s ease-in-out;
    transition: all 0.5s ease-in-out;
    li {
      position: relative;
      text-align: left;
      height: 30px;
      line-height: 30px;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;

      &:hover {
        background: rgba(24, 144, 255, 0.06);
        i {
          color: #1890ff;
        }
      }
      &.active-tab {
        background: rgba(24, 144, 255, 0.06);
        &::before {
          content: ' ';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #1890ff;
          z-index: 1;
        }
        i {
          color: #1890ff;
        }
      }
    }
  }
}
.p-l-14 {
  padding-left: 14px;
}
.p-l-40 {
  padding-left: 40px;
}
.color-303133 {
  color: #303133;
}
.font-14 {
  font-size: 14px;
}
.border-box {
  box-sizing: border-box;
}
.p-r-10 {
  padding-right: 10px;
}
.p-l-60 {
  padding-left: 60px;
}
.tab-left-list {
  .my-first-level {
    color: #303133;
  }
  .my-icon {
    font-size: 17px;
    color: #000;
    padding-right: 8px;
    width: 25px;
    display: inline-block;
    box-sizing: border-box;
  }
}
</style>

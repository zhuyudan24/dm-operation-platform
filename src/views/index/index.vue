<template>
  <div class="my-content-wrap">
    <yw-header :linkType="linkType"></yw-header>
    <div class="my-content-content">
      <router-view @getLinkType="getLinkType"></router-view>
    </div>
    <!-- <yw-footer></yw-footer> -->
  </div>
</template>

<script>
// import { getRequest, postRequest } from '@/api/api';
import ywHeader from '../../components/yw-header';
// import ywFooter from '../../components/yw-footer/yw-footer';
export default {
  name: 'index',
  data() {
    return {
      linkType: ''
    };
  },
  methods: {
    // 获取类型  判断是权限管理、操作日志或其他
    getLinkType(val) {
      this.linkType = val;
    }
  },
  components: {
    ywHeader
    // ywFooter
  }
};
</script>

<style lang="less" scoped>
.my-content-content {
  background: #f0f2f5;
  h2 {
    color: #303133;
    font-size: 24px;
    line-height: 33px;
    margin: 88px 0 95px 0;
    letter-spacing: 1px;
  }
  ul {
    display: inline-block;
    padding: 95px 0 20px;
    border-top: 1px dashed #ccc;
    li {
      width: 230px;
      background: #fff;
      border-radius: 4px;
      padding-top: 46px;
      cursor: pointer;
      .img {
        width: 95px;
        height: 95px;
        margin: 0 auto 54px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      p {
        color: #606266;
        font-size: 15px;
        line-height: 21px;
        text-align: center;
        padding-bottom: 44px;
      }
      &:hover {
        box-shadow: 0px 0px 11px 0px rgba(193, 202, 214, 0.3);
        p {
          color: #303133;
        }
      }
    }
  }
}
</style>

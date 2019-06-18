<template>
  <div class="my-index">
    <h2>运维平台快捷入口</h2>
    <div class="entrance-wrap">
      <ul class="clearfix" v-for="(item, index) in entranceList" :key="index">
        <li class="fl" @click="entranceDic(el)" v-for="el in item" :key="el.id">
          <div class="img">
            <img :src="el.iconUrlNew" alt="图片" />
          </div>
          <p>{{ el.menuName }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getRequest } from '@/api/api';
export default {
  name: 'entrance',
  data() {
    return {
      requestProject: 'gic-authcenter',
      entranceList: []
    };
  },
  mounted() {
    this.getUserInfo();
  },
  methods: {
    // 获取用户信息 判断登录状态
    getUserInfo() {
      let para = {
        requestProject: this.requestProject
      };
      getRequest('/gic-authcenter/loginuser', para)
        .then(res => {
          let resData = res.data;
          if (resData.errorCode == 0) {
            this.entranceList = [];
            let entranceList = resData.result.menuTree ? resData.result.menuTree : [];
            let arrList = [];
            entranceList.forEach(item => {
              if (item.isShow == 1) {
                if (item.iconUrl != '') {
                  // eslint-disable-next-line
                  item.iconUrlNew = require(`../../../static/img/${item.iconUrl}.png`);
                } else {
                  // eslint-disable-next-line
                  item.iconUrlNew = require('../../../static/img/failed-load_img.png');
                }
                arrList.push(item);
              }
            });
            for (let i = 0; i < arrList.length; i += 4) {
              this.entranceList.push(arrList.slice(i, i + 4));
            }
          } else {
            this.$message.error(resData.message);
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // 进入入口
    entranceDic(row) {
      let code = row.code;
      if (code == 'platform_operation') {
        let href = row.uri + `?code=platform_operation&name=${row.menuName}&icon=${row.iconUrl}`;
        window.open(href, '_blank');
      } else {
        let url = row.nodeChildren[0].nodeChildren ? row.nodeChildren[0].nodeChildren[0].uri : row.nodeChildren[0].uri;
        this.$router.push({
          path: url,
          query: {
            code: row.code,
            name: row.menuName,
            icon: row.iconUrl
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.my-index {
  background: #f0f2f5;
  text-align: center;
  h2 {
    color: #303133;
    font-size: 24px;
    line-height: 33px;
    margin-bottom: 95px;
    padding-top: 88px;
    letter-spacing: 1px;
  }
  ul {
    margin-bottom: 50px;
  }
  li {
    width: 230px;
    background: #fff;
    border-radius: 4px;
    padding-top: 46px;
    margin-left: 50px;
    cursor: pointer;
    &:first-child {
      margin-left: 0;
    }
    .img {
      width: 100px;
      height: 100px;
      margin: 0 auto 54px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 6px;
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
.entrance-wrap {
  display: inline-block;
  padding: 95px 0 20px;
  border-top: 1px dashed #ccc;
}
</style>

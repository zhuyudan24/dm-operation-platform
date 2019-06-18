import Vue from 'vue';
import Router from 'vue-router';
import _import from './_import.js';
Vue.use(Router);

// 页面刷新时，重新赋值token
if (window.sessionStorage.getItem('token')) {
  // eslint-disable-next-line
  store.commit(types.LOGIN, window.sessionStorage.getItem('token'));
}

export const constantRouterMap = [
  {
    path: '/login',
    name: '用户登录',
    component: _import('login', 'login')
  },
  {
    path: '/',
    name: '登陆',
    component: _import('login', 'login')
  },
  {
    path: '/index',
    name: '首页',
    redirect: '/index',
    component: _import('index', 'index'),
    children: [
      {
        path: '/index',
        name: '首页',
        component: _import('index', 'entrance')
      },
      {
        path: '/authority',
        name: '权限管理',
        redirect: '/menuManage',
        component: _import('authority', 'authority'),
        children: [
          {
            path: '/menuManage',
            name: '菜单管理',
            component: _import('authority', 'menuManage')
          },
          {
            path: '/roleManage',
            name: '角色管理',
            component: _import('authority', 'roleManage')
          },
          {
            path: '/userManage',
            name: '用户管理',
            component: _import('authority', 'userManage')
          },
          {
            path: '/authorityList',
            name: '权限列表',
            component: _import('authority', 'authorityList')
          }
        ]
      },
      {
        path: '/addRole',
        name: '新建角色',
        component: _import('authority', 'addRole')
      },
      {
        path: '/addUser',
        name: '新增用户',
        component: _import('authority', 'addUser')
      },
      {
        path: '/log',
        name: '操作日志',
        component: _import('log', 'log')
      }
    ]
  },

  {
    path: '/dictionary',
    name: '业务数据字典配置中心',
    redirect: '/categoryList',
    component: _import('dictionary', 'dictionary'),
    children: [
      {
        path: '/categoryList',
        name: '字典分类目录',
        component: _import('dictionary', 'categoryList')
      },
      {
        path: '/dictionaryManage',
        name: '字典管理',
        component: _import('dictionary', 'dictionaryManage')
      },
      {
        path: '/dictionaryLog',
        name: '字典管理日志',
        component: _import('dictionary', 'dictionaryLog')
      }
    ]
  },

  {
    path: '/401',
    name: '无权访问',
    component: _import('error', '401')
  },
  {
    path: '/404',
    name: '不存在',
    component: _import('error', '404')
  },

  { path: '*', redirect: '/404', hidden: true }
];
export default new Router({
  routes: constantRouterMap
  // scrollBehavior: () => ({ y: 0 })

  //使用keep-alive标签后部分安卓机返回缓存页位置不精确问题
  // scrollBehavior(to, from, savedPosition) {
  //   if (savedPosition && to.meta.keepAlive) {
  //     return savedPosition;
  //   }
  //   const layoutRight = document.querySelector('.layout-right');
  //   if (layoutRight) {
  //     layoutRight.scrollTo(0,0);
  //   }
  // }
});

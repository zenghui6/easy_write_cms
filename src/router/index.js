import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * // 当设置 true 的时候该路由不会在侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
hidden: true // (默认 false)

//当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
redirect: 'noRedirect'

// 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
// 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
// 若你想不管路由下面的 children 声明的个数都显示你的根路由
// 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
alwaysShow: true

name: 'router-name' // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
meta: {
  roles: ['admin', 'editor'] // 设置该路由进入的权限，支持多个权限叠加
  title: 'title' // 设置该路由在侧边栏和面包屑中展示的名字
  icon: 'svg-name' // 设置该路由的图标，支持 svg-class，也支持 el-icon-x element-ui 的 icon
  noCache: true // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
  breadcrumb: false //  如果设置为false，则不会在breadcrumb面包屑中显示(默认 true)
  affix: true // 如果设置为true，它则会固定在tags-view中(默认 false)

  // 当路由设置了该属性，则会高亮相对应的侧边栏。
  // 这在某些场景非常有用，比如：一个文章的列表页路由为：/article/list
  // 点击文章进入文章详情页，这时候路由为/article/1，但你想在侧边栏高亮文章列表的路由，就可以进行如下设置
  activeMenu: '/article/list'
}
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard', //面包屑导航栏
    children: [{
      path: 'dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '后台管理系统', icon: 'dashboard' }
    }]
  },

  {
    path: '/client',
    component: Layout,
    redirect: '/client/article',
    name: 'client',
    meta: { title: '官网管理', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'article',
        name: 'article',
        component: () => import('@/views/article/index'),
        meta: { title: '文章发布', icon: 'el-icon-s-management' },
      },

      {
        path: 'article/create',
        name: 'create',
        hidden: true ,
        component: () => import('@/views/article/create/index'),
        meta: { title: '新建文章', icon: 'el-icon-s-management' ,activeMenu: '/client/article'}
      },
      {
        path: 'article/edit/:id/',
        component: () => import('@/views/article/edit'),
        name: 'EditArticle',
        meta: { title: 'Edit Article', noCache: true, activeMenu: '/client/article' },
        hidden: true
      },
        
   
      
      {
        path: 'video',
        name: 'video',
        component: () => import('@/views/video/index'),
        meta: { title: '视频发布', icon: 'el-icon-video-camera-solid' }
      },
      {
        path: 'swiper',
        name: 'swiper',
        component: () => import('@/views/swiper/index'),
        meta: { title: '轮播图发布', icon: 'el-icon-picture' }
      }
    ]
  },

  {
    path: '/media',
    component: Layout,
    redirect: '/media', //面包屑导航栏
    children: [{
      path: 'media',
      name: 'media',
      component: () => import('@/views/media/index'),
      meta: { title: '媒体分发', icon: 'el-icon-s-operation' }
    }]
  },

  {
    path: '/miniPrigram',
    component: Layout,
    redirect: '/miniPrigram',
    name: 'miniPrigram',
    meta: {
      title: '小程序',
      icon: 'el-icon-star-on'
    },
    children: [
      {
        path: 'group',
        name: 'group',
        component: () => import('@/views/article/index'),
        meta: { title: '文章管理', icon: 'el-icon-star-on' }
      },
      {
        path: 'mse',
        name: 'mse',
        component: () => import('@/views/article/index'),
        meta: { title: '视频管理', icon: 'el-icon-video-camera-solid' }
      },
      {
        path: 'miniWiper',
        name: 'miniWiper',
        component: () => import('@/views/article/index'),
        meta: { title: '轮播图管理', icon: 'el-icon-picture' }
      }
    ]
  },
]

export const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/account',
    name: 'admin',
    meta: {
      title: '管理员',
      icon: 'el-icon-s-custom',
      roles: ['admin']
    },
    children: [
      {
        path: 'account',
        name: 'account',
        component: () => import('@/views/admin/account/index'),
        meta: { title: '人员管理', icon: 'el-icon-user', roles: ['admin'] }
      },
      {
        path: 'publish',
        name: 'publish',
        redirect: '/admin/publishj/articlePub',
        component: () => import('@/views/admin/publish/index'),
        meta: { title: '审核', icon: 'el-icon-search', roles: ['admin']
       },
          children: [
            {
              path: 'articlePub',
              name: 'articlePub',
              component: () => import('@/views/admin/publish/article/index'),
              meta: { title: '文章管理', icon: 'el-icon-user' , roles: ['admin']}
            },
            {
              path: 'article/edit/:id/',
              component: () => import('@/views/admin/publish/article/edit'),
              name: 'EditArticle',
              meta: { title: 'Edit Article', noCache: true, activeMenu: '/admin/publish/articlePub' },
              hidden: true
            },
            {
              path: 'videoPub',
              name: 'videoPub',
              component: () => import('@/views/admin/publish/video/index'),
              meta: { title: '视频管理', icon: 'el-icon-video-camera-solid', roles: ['admin'] }
            },
            {
              path: 'swiperPub',
              name: 'swiperPub',
              component: () => import('@/views/admin/publish/swiper/index'),
              meta: { title: '轮播图管理', icon: 'el-icon-picture' , roles: ['admin']}
            }
          ]
      },
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]


const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

import request from '@/utils/request'

/**   ---------------   账户相关 ---------------------              */
export function getAccountList(data) {
  return request({
    url: '/admin/find_all_by_keywords',
    method: 'post',
    data
  })
}

export function createAccount(data) {
  return request({
    url: '/admin/add',
    method: 'post',
    data
  })
}

export function updateAccount(data) {
  return request({
    url: '/staff/account/update',
    method: 'put',
    data
  })
}

export function fetchAccount(id) {
  return request({
    url: '/staff/account/find_one/'+id,
    method: 'get',
  })
}

/**-----------------------文章审核相关---------------------- */

export function getArticleList(data) {
  return request({
    url: '/admin/article/find_all_class',
    method: 'post',
    data
  })
}


export function updateArticle(data) {
  return request({
    url: '/staff/article/update',
    method: 'put',
    data
  })
}

export function fetchArticle(id) {
  return request({
    url: '/staff/article/find_one_by_id/'+id,
    method: 'get',
  })
}

/**-----------------------视频审核相关---------------------- */

export function getVideoList(data) {
  return request({
    url: '/admin/video/find_all_class',
    method: 'post',
    data
  })
}

export function updateVideo(data) {
  return request({
    url: '/staff/video/update',
    method: 'put',
    data
  })
}

export function fetchVideo(id) {
  return request({
    url: '/staff/video/find_one_by_id/'+id,
    method: 'get',
  })
}


/**----------------------轮播图审核相关------------------- */

export function getSwiperList(data) {
  return request({
    url: '/admin/swiper/find_all_class',
    method: 'post',
    data
  })
}

export function updateSwiper(data) {
  return request({
    url: '/staff/web_swiper/update',
    method: 'put',
    data
  })
}

export function fetchSwiper(id) {
  return request({
    url: '/staff/swiper/find_one_by_id/'+id,
    method: 'get',
  })
}








import request from '@/utils/request'

export function getSwiperList(data) {
  return request({
    url: '/staff/web_swiper/find_all_by_keywords',
    method: 'post',
    data
  })
}

export function createSwiper(data) {
  return request({
    url: '/staff/web_swiper/add',
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



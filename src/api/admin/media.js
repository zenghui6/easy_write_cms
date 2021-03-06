import request from '@/utils/request'

export function getVideoList(data) {
  return request({
    url: '/media/video/find_all_by_keywords',
    method: 'post',
    data
  })
}

export function createVideo(data) {
  return request({
    url: '/media/video/add',
    method: 'post',
    data
  })
}

export function updateVideo(data) {
  return request({
    url: '/media/video/update',
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



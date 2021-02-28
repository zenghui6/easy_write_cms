import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/client/article/find_some',
    method: 'post',
    data
  })
}

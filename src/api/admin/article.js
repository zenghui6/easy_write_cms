import request from '@/utils/request'

export function getArticleList(data) {
  return request({
    url: '/admin/article/find_all',
    method: 'post',
    data
  })
}

export function createArticle(data) {
  return request({
    url: '/staff/article/add',
    method: 'post',
    data
  })
}

export function fetchArticle(id) {
  return request({
    url: 'client/article/find_one_by_id/'+id,
    method: 'get',
  })
}



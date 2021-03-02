import request from '@/utils/request'

export function getArticleList(data) {
  return request({
    url: '/staff/article/find_all_by_keywords',
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



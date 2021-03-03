import request from '@/utils/request'

export function getAccountList(data) {
  return request({
    url: '/admin//find_all_by_keywords',
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



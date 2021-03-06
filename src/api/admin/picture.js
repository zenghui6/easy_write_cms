import request from '@/utils/request'

export function deletePic(data) {
    return request({
      url: 'picture/OSSdel/'+data,
      method: 'post',
    })
  }

  export function deleteLocalPic(data) {
    return request({
      url: 'picture/OSSdel/'+data,
      method: 'post',
    })
  }
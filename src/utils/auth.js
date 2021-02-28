import Cookies from 'js-cookie'

const uToken = 'u_token'

export function getToken() {
  return Cookies.get(uToken)
}

export function setToken(token) {
  return Cookies.set(uToken, token, {expires: 1})
}

export function removeToken() {
  return Cookies.remove(uToken)
}

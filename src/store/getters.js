const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  user: state => state.user.user,
  permission_routes: state => state.permission.routes,
}
export default getters

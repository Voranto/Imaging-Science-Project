import App from "../App"
const routes = [
  {
    path: '/',
    name: 'main',
    component: App
  },
]
const router = createRouter({
  history: createWebHistory('/imaging/'),
  routes: [ ... ]
});
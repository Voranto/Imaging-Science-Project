import App from "../App"
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'main',
    component: App
  },
]
const router = createRouter({
  history: createWebHistory('/imaging/'),
  routes
});
export default router;
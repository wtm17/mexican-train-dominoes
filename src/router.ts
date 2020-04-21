import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import GameView from './views/GameView.vue';
import Start from './views/Start.vue';
import Join from './views/Join.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: {
        name: 'start',
      },
    },
    {
      path: '/start/:gameId?',
      name: 'start',
      component: Start,
    },
    {
      path: '/join/:gameId/:playerId',
      name: 'join',
      component: Join,
    },
    {
      path: '/game/play/:gameId/:playerId',
      name: 'game',
      component: GameView,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
  ],
});

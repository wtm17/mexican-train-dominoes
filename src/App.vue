<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <h1 class="headline">Mexican Train Dominos</h1>
      </div>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <router-view :key="$route.fullPath"/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App',

  data: () => ({
    //
  }),
});
</script>

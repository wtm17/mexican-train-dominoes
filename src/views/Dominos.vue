<template>
  <v-container>
    <div class="d-flex flex-column">
      <div v-for="i in 13" :key="i" class="d-inline-flex flex-wrap">
        <domino class="mr-1" v-for="j in i" :key="j" :values="{0: (i - 1), 1: (j - 1)}" />
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Domino from '../components/Domino.vue';

export default Vue.extend({
  name: 'Dominos',

  components: {
    Domino,
  },
});
</script>

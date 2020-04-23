<template>
  <v-container>
    <v-row v-for="i in 13" :key="i">
      <v-col v-for="j in i" :key="j" cols="2">
        <domino :values="{0: (i - 1), 1: (j - 1)}" />
      </v-col>
    </v-row>
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

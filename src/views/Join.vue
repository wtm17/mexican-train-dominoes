<template>
  <div class="mt-10 text-center">
    <div class="d-flex flex-column justify-center">
      <h2>Waiting for players to join</h2>
      <v-btn color="primary"
            class="mx-auto mt-10"
            @click="enterGame"
            width="200px"
            x-large>
        Enter Game
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Join',

  methods: {
    enterGame() {
      this.$router.push({
        name: 'game',
        params: {
          gameId: this.$route.params.gameId,
          playerId: this.$route.params.playerId,
        },
      });
    },
  },

});
</script>

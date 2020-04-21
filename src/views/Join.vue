<template>
  <div class="mt-10 text-center">
    <div class="d-flex flex-column justify-center">
      <h2>Waiting for more players to join</h2>
      <v-alert border="left"
               colored-border
               color="deep-purple accent-4"
               elevation="2"
               class="mx-auto mt-4"
               v-if="player.isHost">
        Inite others to join with the following link<br>
        {{ inviteLink }}
      </v-alert>
      <v-simple-table light class="mx-auto">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Id</th>
              <th class="text-left">Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in game.players" :key="player.name">
              <td class="text-left">{{ player.id }}</td>
              <td class="text-left">{{ player.name }} {{ player.isHost ? '(host)' : ''}}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
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
import firebase from '../Firebase';
import { Game } from '../interfaces/Game.interfaces';

export default Vue.extend({
  name: 'Join',

  data() {
    return {
      game: {} as Game,
    };
  },
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
  computed: {
    player() {
      if (this.game.players) {
        return this.game.players.find((player: any) => player.id === +this.$route.params.playerId);
      }
      return {};
    },
    inviteLink() {
      return `${window.location.origin}/start/${this.$route.params.gameId}`;
    },
  },
  mounted() {
    firebase.firestore().collection('games').doc(this.$route.params.gameId)
      .onSnapshot((doc: any) => {
        if (doc.exists) {
          this.game = doc.data();
        } else {
          console.log('Game not found!');
        }
      });
  },

});
</script>

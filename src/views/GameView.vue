<template>
  <Game v-if="isGameLoaded"
        :board="game.board"
        :players="game.players"
        :player="player"
        :pieces="pieces"
        :pool="game.pool"
        @updateGame="updateGame"
         />
</template>

<script lang="ts">
import Vue from 'vue';
import Game from '../components/Game.vue';
import { Game as IGame } from '../interfaces/Game.interfaces';
import firebase from '../Firebase';

export default Vue.extend({
  name: 'GameView',
  components: {
    Game,
  },

  data() {
    return {
      id: +this.$route.params.gameId || 1,
      game: {} as IGame,
      isGameLoaded: false,
      docRef: firebase.firestore().collection('games').doc(this.$route.params.gameId),
    };
  },

  methods: {
    updateGame(game: IGame) {
      this.docRef.set(game);
    },
  },
  computed: {
    player() {
      if (this.isGameLoaded) {
        const vm = this as any;
        return vm.game.players.find((player: any) => player.id === +this.$route.params.playerId);
      }
      return {};
    },
    pieces() {
      if (this.isGameLoaded) {
        const playersCount = this.game.players.length;
        if (playersCount < 5) {
          return 15;
        }
        if (playersCount < 7) {
          return 12;
        }
      }
      return 11;
    },
  },
  mounted() {
    this.docRef.onSnapshot((doc: any) => {
      if (doc.exists) {
        this.game = doc.data();
        this.isGameLoaded = true;
      } else {
        console.log('Game not found!');
      }
    });
  },

});
</script>

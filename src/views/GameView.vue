<template>
  <Game v-if="isGameLoaded"
        :board="game.board"
        :players="game.players"
        :player="player"
        :pieces="pieces"
        :pool="game.pool"
        :next-game-id="game.nextGameId"
        @updateGame="updateGame"
        @startNewGame="startNewGame"
         />
</template>

<script lang="ts">
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import sumBy from 'lodash/sumBy';
import { GAME, TRAIN } from '@/interfaces/Game.constants';
import Game from '../components/Game.vue';
import {
  Game as IGame,
  Player,
  Piece,
  Train,
} from '../interfaces/Game.interfaces';
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
      ref: firebase.firestore().collection('games'),
      docRef: firebase.firestore().collection('games').doc(this.$route.params.gameId),
    };
  },

  methods: {
    updateGame(game: IGame) {
      this.docRef.set(game);
    },
    async startNewGame(players: Player[]) {
      const newGame: IGame = cloneDeep(GAME);
      newGame.players = players;
      players.forEach((player: Player) => {
        const newTrain: Train = cloneDeep(TRAIN);
        newTrain.owner = player.name;
        newGame.board.trains.push(newTrain);
      });

      const docRef = await this.ref.add(newGame);
      this.game.nextGameId = docRef.id;
      this.updateGame(this.game);
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

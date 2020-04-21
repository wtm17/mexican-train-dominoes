<template>
  <div>
    <div class="d-flex flex-column">
      <h2>{{ player.name }} ({{ player.points}} pts)</h2>
      <h3>Middle Piece</h3>
      <domino v-if="board.middle.length"
              :values="board.middle" />
      <h3>Your Train</h3>
      <train v-if="myTrain.owner"
            :has-train="myTrain.hasTrain"
            :is-owner="true"
            :owner="myTrain.owner"
            :pieces="myTrain.pieces"
            :show-add="player.isTurn"
            :disable-add="hasPlayedOrAddedTrain && !hasPlayedDouble"
            @addTrain="addTrain()"
            @addToTrain="addToTrain(myTrain)"
      />
      <h3>Other Trains</h3>
      <train v-for="train in otherTrains"
            :key="train.owner"
            :has-train="train.hasTrain"
            :is-owner="false"
            :owner="train.owner"
            :pieces="train.pieces"
            :show-add="player.isTurn"
            :disable-add="hasPlayedOrAddedTrain && !hasPlayedDouble"
            @addToTrain="addToTrain(train)"
      />
    </div>
    <div class="d-flex flex-column">
      <h2 v-if="player.isTurn">It's your turn!</h2>
      <div class="d-flex-inline flex-wrap" v-if="player.isTurn">
        <v-btn class="mr-5"
               color="secondary"
               @click="draw(player)"
               :disabled="hasPlayedOrAddedTrain && !hasPlayedDouble"
               width="100px">
          Draw
        </v-btn>
        <v-btn class="mr-5"
               color="secondary"
               @click="startNewTrain()"
               :disabled="hasPlayedOrAddedTrain"
               width="180px">
          Start New Train
        </v-btn>
        <v-btn class="mr-5"
               color="secondary"
               @click="endTurn()"
               :disabled="!hasPlayedOrAddedTrain"
               width="100px">
          End Turn
        </v-btn>
      </div>
      <draggable v-model="player.pieces"
                class="d-inline-flex flex-wrap"
                group="pieces"
                @start="drag=true"
                @end="drag=false">
        <domino v-for="(piece, index) in player.pieces"
                :key="piece[0] + '-' + piece[1]"
                @selectPiece="selectPiece"
                @flipPiece="flipPiece"
                :flippable="true"
                :values="piece"
                :index="index"
                :selected="index === selectedPiece" />
      </draggable>
    </div>
    <v-snackbar
      v-model="snackbar.show"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <v-btn
        color="red"
        text
        @click="snackbar.show = false"
      >
        Close
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import Domino from './Domino.vue';
import Train from './Train.vue';

export default Vue.extend({
  name: 'Game',
  components: {
    draggable,
    Train,
    Domino,
  },
  props: {
    board: Object as () => any,
    player: Object as () => any,
    players: Array as () => any[],
    pool: Array as () => number[][],
    pieces: Number,
  },
  data: () => ({
    selectedPiece: -1,
    hasPlayedOrAddedTrain: false,
    hasPlayedDouble: false,
    snackbar: {
      show: false,
      text: '',
      timeout: 5000,
    },
  }),

  methods: {
    draw(player: any) {
      const index = Math.floor(Math.random() * this.pool.length);
      const piece = this.pool[index];
      player.pieces.push(piece);
      // eslint-disable-next-line no-param-reassign
      player.points += (piece[0] + piece[1]);
      this.pool.splice(index, 1);
    },
    addTrain() {
      this.board.trains[0].hasTrain = true;
      this.hasPlayedOrAddedTrain = true;
    },
    startNewTrain() {
      this.board.trains.push({
        hasTrain: true,
        owner: 'Mexican',
        pieces: [] as number[][],
      });
    },
    endTurn() {
      if (!this.hasPlayedOrAddedTrain) {
        this.snackbar.text = 'You must play a piece or add a train.';
        this.snackbar.show = true;
      } else {
        this.hasPlayedOrAddedTrain = false;
        this.player.isTurn = false;
      }
    },
    flipPiece(index: number) {
      const piece = this.player.pieces[index];
      this.player.pieces.splice(index, 1, [piece[1], piece[0]]);
    },
    selectPiece(index: number) {
      if (this.selectedPiece === index) {
        this.selectedPiece = -1;
      } else {
        this.selectedPiece = index;
      }
    },
    addToTrain(trainToAdd: any) {
      if (this.selectedPiece > -1) {
        const pieceToAdd = this.player.pieces[this.selectedPiece];
        const pieceToCompare = trainToAdd.pieces.length === 0 ? this.board.middle : trainToAdd.pieces[trainToAdd.pieces.length - 1];
        if (pieceToCompare[1] !== pieceToAdd[0]) {
          this.snackbar.text = 'Invalid move.';
          this.snackbar.show = true;
        } else {
          trainToAdd.pieces.push(pieceToAdd);
          if (trainToAdd.owner === this.player.name) {
            // eslint-disable-next-line no-param-reassign
            trainToAdd.hasTrain = false;
          }
          this.player.pieces.splice(this.selectedPiece, 1);
          this.player.points -= (pieceToAdd[0] + pieceToAdd[1]);
          this.selectedPiece = -1;
          this.hasPlayedOrAddedTrain = true;
          this.hasPlayedDouble = pieceToAdd[0] === pieceToAdd[1];
        }
      }
    },
    startGame() {
      // Draw pieces
      this.players.forEach((player: any) => {
        for (let i = 0; i < this.pieces; i += 1) {
          this.draw(player);
          // Check if piece is highest allowable middle
          const piece = player.pieces[player.pieces.length - 1];
          if (piece[0] === piece[1] && piece[0] === this.board.middleAllowed[0]) {
            this.board.middle = piece;
            // eslint-disable-next-line no-param-reassign
            player.isTurn = true;
            player.pieces.splice(-1, 1);
            // eslint-disable-next-line no-param-reassign
            player.points -= (piece[0] + piece[1]);
          }
        }
      });
      // If highest allowable middle was not found, find out who goes first
      if (!this.board.middle.length) {
        this.board.middleAllowed.slice(1).forEach((middleAllowed: number) => {
          this.players.some((player: any) => {
            player.pieces.some((piece: any, index: number) => {
              if (piece[0] === piece[1] && piece[0] === middleAllowed) {
                this.board.middle = piece;
                // eslint-disable-next-line no-param-reassign
                player.isTurn = true;
                player.pieces.splice(index, 1);
                // eslint-disable-next-line no-param-reassign
                player.points -= (piece[0] + piece[1]);
              }
              return player.isTurn;
            });
            // Break once a middle piece is found
            return this.board.middle.length;
          });
        });
      }
    },
  },
  computed: {
    myTrain() {
      return this.board.trains.find((train: any) => train.owner === this.player.name);
    },
    otherTrains() {
      return this.board.trains.filter((train: any) => train.owner !== this.player.name);
    },
  },
  mounted() {
    if (this.player.isHost && this.player.pieces.length === 0) {
      this.startGame();
    }
  },

});
</script>

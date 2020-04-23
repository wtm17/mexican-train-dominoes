<template>
  <div>
    <div class="d-flex flex-column">
      <div class="actions">
        <div class="d-flex flex-column" v-if="player.isTurn">
          <v-chip class="turn-chip"
                  color="pink"
                  label
                  text-color="white">
            It's your turn!
          </v-chip>
          <v-btn class="mt-1"
                color="secondary"
                @click="draw(player)"
                :disabled="!canDraw">
            Draw
          </v-btn>
          <v-btn class="mt-1"
                color="secondary"
                @click="startNewTrain()"
                :disabled="!canStartNewTrain">
            Start New Train
          </v-btn>
          <v-btn class="mt-1"
                color="secondary"
                @click="endTurn()"
                :disabled="!canEndTurn">
            End Turn
          </v-btn>
        </div>
      </div>
      <h3>Middle Piece</h3>
      <domino v-if="board.middle"
              :values="board.middle" />
      <h3>Your Train</h3>
      <train v-if="myTrain.owner"
            :has-train="myTrain.hasTrain"
            :is-owner="true"
            :owner="myTrain.owner"
            :pieces="myTrain.pieces"
            :players="players"
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
            :players="players"
            :show-add="player.isTurn"
            :disable-add="hasPlayedOrAddedTrain && !hasPlayedDouble"
            @addToTrain="addToTrain(train)"
      />
    </div>
    <h3>Your Pieces ({{ player.points}} pts)</h3>
    <div class="d-flex flex-column">
      <draggable v-model="myPieces"
                class="d-inline-flex flex-wrap"
                group="pieces"
                @start="drag=true"
                @end="drag=false">
        <domino v-for="(piece, index) in myPieces"
                :key="piece[0] + '-' + piece[1]"
                class="mr-5"
                @selectPiece="selectPiece"
                @flipPiece="flipPiece"
                :flippable="true"
                :values="piece"
                :index="index"
                :selected="index === selectedPiece" />
      </draggable>
    </div>
    <v-dialog v-model="unresolvedDoubleDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Unresolved Double</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                You played an unresolved double. Are you sure you want to end your turn?
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="unresolvedDoubleDialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="endTurn()">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import cloneDeep from 'lodash/cloneDeep';
import Domino from './Domino.vue';
import Train from './Train.vue';
import { Board, Player, Piece } from '../interfaces/Game.interfaces';
import { TRAIN } from '../interfaces/Game.constants';

export default Vue.extend({
  name: 'Game',
  components: {
    draggable,
    Train,
    Domino,
  },
  props: {
    board: Object as () => Board,
    player: Object as () => Player,
    players: Array as () => Player[],
    pool: Array as () => Piece[],
    pieces: Number,
  },
  data: () => ({
    selectedPiece: -1,
    hasPlayedOrAddedTrain: false,
    hasPlayedDouble: false,
    hasDrawn: false,
    snackbar: {
      show: false,
      text: '',
      timeout: 5000,
    },
    unresolvedDoubleDialog: false,
    myPieces: [] as Piece[],
  }),

  methods: {
    draw(player: any) {
      const index = Math.floor(Math.random() * this.pool.length);
      const piece = this.pool[index];
      player.pieces.push(piece);
      // eslint-disable-next-line no-param-reassign
      player.points += (piece[0] + piece[1]);
      this.pool.splice(index, 1);
      this.hasDrawn = true;
    },
    addTrain() {
      this.myTrain!.hasTrain = true;
      this.hasPlayedOrAddedTrain = true;
    },
    startNewTrain() {
      const train = cloneDeep(TRAIN);
      train.hasTrain = true;
      train.owner = `Mexican${this.board.trains.length}`;
      this.board.trains.push(train);
    },
    endTurn() {
      if (!this.canEndTurn) {
        this.snackbar.text = 'You must play a piece or add a train.';
        this.snackbar.show = true;
      } else if (this.hasPlayedDouble && !this.unresolvedDoubleDialog) {
        this.unresolvedDoubleDialog = true;
      } else {
        this.unresolvedDoubleDialog = false;
        this.hasPlayedOrAddedTrain = false;
        this.hasDrawn = false;

        // Find next player's turn
        const nextPlayerId = this.player.id === this.players.length ? 1 : this.player.id + 1;
        this.players.forEach((player: Player) => {
          // eslint-disable-next-line no-param-reassign
          player.isTurn = player.id === nextPlayerId;
        });
        this.updateGame();
      }
    },
    flipPiece(index: number) {
      const piece = this.myPieces[index];
      this.myPieces.splice(index, 1, { 0: piece[1], 1: piece[0] });
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
        const pieceToAdd = this.myPieces[this.selectedPiece];
        const pieceToCompare = trainToAdd.pieces.length === 0 ? this.board.middle
          : trainToAdd.pieces[trainToAdd.pieces.length - 1];
        if (pieceToCompare[1] !== pieceToAdd[0]) {
          this.snackbar.text = 'Invalid move.';
          this.snackbar.show = true;
        } else {
          trainToAdd.pieces.push(pieceToAdd);
          if (trainToAdd.owner === this.player.name) {
            // eslint-disable-next-line no-param-reassign
            trainToAdd.hasTrain = false;
          }
          this.myPieces.splice(this.selectedPiece, 1);
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
      if (!this.board.middle) {
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
            return !!this.board.middle;
          });
        });
      }
    },
    updateGame() {
      this.player.pieces = this.myPieces;
      this.$emit('updateGame', {
        board: this.board,
        players: this.players,
        pool: this.pool,
      });
    },
  },
  computed: {
    myTrain() {
      return this.board.trains.find((train: any) => train.owner === this.player.name);
    },
    otherTrains() {
      return this.board.trains.filter((train: any) => train.owner !== this.player.name);
    },
    canEndTurn() {
      const vm = this as any;
      return this.hasPlayedOrAddedTrain || (this.hasDrawn && vm.myTrain.hasTrain);
    },
    canDraw() {
      return !this.hasDrawn && (!this.hasPlayedOrAddedTrain || this.hasPlayedDouble);
    },
    canStartNewTrain() {
      return !this.hasPlayedOrAddedTrain
        && this.board.middle
        // eslint-disable-next-line arrow-body-style
        && !!this.myPieces.find((piece: Piece) => {
          return piece[0] === this.board.middle![0] || piece[1] === this.board.middle![1];
        });
    },
  },
  mounted() {
    if (this.player.isHost && this.player.pieces.length === 0) {
      this.startGame();
      this.updateGame();
    }
  },
  watch: {
    player: {
      immediate: true,
      handler(player: Player) {
        if (this.myPieces.length === 0 && player.pieces.length > 0) {
          this.myPieces = cloneDeep(player.pieces);
        }
      },
    },
  },

});
</script>

<style scoped>
  .actions {
    position: absolute;
    right: 20px;
    width: 200px;
  }
</style>

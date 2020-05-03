<template>
  <div>
    <div class="d-flex flex-column">
      <transition name="scroll-y-transition" appear>
        <div v-if="player.isTurn && hasUnresolvedDouble" class="unresolved-double-message">
          <v-chip color="secondary"
                  label
                  text-color="white">
            You must play on the double!
          </v-chip>
        </div>
      </transition>
      <transition name="scroll-y-transition" appear>
        <div class="actions" v-if="player.isTurn">
          <div class="d-flex flex-column">
            <v-chip class="turn-chip"
                    color="pink"
                    label
                    text-color="white">
              It's your turn!
            </v-chip>
            <v-btn class="mt-1"
                  color="secondary"
                  @click="drawMyPiece()"
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
      </transition>
      <h3>Middle Piece</h3>
      <domino v-if="board.middle"
              :values="board.middle" />
      <h3>Trains</h3>
      <train v-for="train in board.trains"
            :key="train.owner"
            :has-train="train.hasTrain"
            :is-owner="train.owner === player.name"
            :owner="train.owner"
            :pieces="train.pieces"
            :players="players"
            :show-add="player.isTurn"
            :disable-add="hasPlayedNonDouble || (hasUnresolvedDouble && !train.hasUnresolvedDouble)"
            @addToTrain="addToTrain(train)"
      />
    </div>
    <h3>Your Pieces ({{ myPoints }} pts)</h3>
    <div class="d-flex flex-column">
      <draggable v-model="myPieces"
                class="d-inline-flex flex-wrap"
                group="pieces"
                @start="drag=true"
                @end="drag=false"
                :animation="200">
        <domino v-for="piece in myPieces"
                :key="piece[0] + '-' + piece[1]"
                class="mr-5"
                @selectPiece="selectPiece(piece)"
                @flipPiece="flipPiece(piece)"
                :flippable="true"
                :values="piece"
                :selected="piece[0] === selectedPiece[0] && piece[1] === selectedPiece[1]" />
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
    <v-dialog v-model="winner.isWinner" width="500" persistent>
      <v-card>
        <v-card-title class="headline green white--text darken-2" primary-title>
          {{ winner.name }} Wins!
        </v-card-title>
        <v-card-text class="pa-5">
          <h3 class="overline">Results</h3>
          <v-divider></v-divider>
          <v-simple-table light class="mx-auto">
            <template v-slot:default>
              <thead>
                <tr>
                  <th scope="col">
                    Rank
                  </th>
                  <th scope="col">
                    Player
                  </th>
                  <th v-for="gameNumber in (player.history || []).length + 1"
                      :key="gameNumber"
                      scope="col">
                    Game {{ gameNumber }}
                  </th>
                  <th scope="col">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(player, index) in finalRankings" :key="player.id">
                  <td class="text-left">{{ index + 1 }}</td>
                  <td class="text-left">{{ player.name }}</td>
                  <td class="text-left"
                      v-for="previousScore in (player.history || [])"
                      :key="previousScore">
                    {{ previousScore }}
                  </td>
                  <td class="text-left">{{ getPiecesPoints(player.pieces) }}</td>
                  <td class="text-left font-weight-bold total-col">
                    {{ getPlayerTotalPoints(player) }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" v-if="nextGameId" text @click="joinNextGame()">
            Join Next Game
          </v-btn>
          <v-btn color="blue darken-1" v-else-if="player.isHost" text @click="startNewGame()">
            Start New Game
          </v-btn>
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
import isUndefined from 'lodash/isUndefined';
import findIndex from 'lodash/findIndex';
import sortBy from 'lodash/sortBy';
import sum from 'lodash/sum';
import sumBy from 'lodash/sumBy';
import Domino from './Domino.vue';
import Train from './Train.vue';
import {
  Board,
  Player,
  Piece,
  Train as ITrain,
} from '../interfaces/Game.interfaces';
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
    nextGameId: String,
  },
  data: () => ({
    selectedPiece: {} as Piece,
    hasPlayedNonDouble: false,
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
    draw(): Piece {
      const index = Math.floor(Math.random() * this.pool.length);
      const piece = this.pool[index];
      this.pool.splice(index, 1);
      return piece;
    },
    drawMyPiece() {
      const piece = this.draw();
      this.myPieces.push(piece);
      this.hasDrawn = true;
    },
    startNewTrain() {
      const train = cloneDeep(TRAIN);
      train.hasTrain = true;
      train.owner = `Mexican${this.board.trains.length}`;
      this.board.trains.push(train);
      if (this.selectedPiece[0] === this.board.middle![1]) {
        this.addToTrain(train);
      }
    },
    endTurn() {
      if (!this.canEndTurn) {
        this.snackbar.text = 'You must play a non-double piece or draw.';
        this.snackbar.show = true;
      } else if (this.hasPlayedDouble && this.myPieces.length > 0 && !this.unresolvedDoubleDialog) {
        this.unresolvedDoubleDialog = true;
      } else {
        this.unresolvedDoubleDialog = false;

        // Check if player has won
        if (this.myPieces.length === 0) {
          this.player.isWinner = true;
          this.player.isTurn = false;
        } else {
          // Check if player needs to add a train
          if (!this.hasPlayedNonDouble) {
            this.myTrain!.hasTrain = true;
          }
          this.resetTurn();

          // Find next player's turn
          const nextPlayerId = this.player.id === this.players.length ? 1 : this.player.id + 1;
          this.players.forEach((player: Player) => {
            // eslint-disable-next-line no-param-reassign
            player.isTurn = player.id === nextPlayerId;
          });
        }
        this.updateGame();
      }
    },
    endGame() {
      this.$router.push({
        name: 'start',
      });
    },
    startNewGame() {
      if (this.player.isHost) {
        // Add points to history and clear pieces
        const newPlayers = this.players.map((player: Player) => {
          const newPlayer = cloneDeep(player);
          newPlayer.history = cloneDeep(player.history) || [];
          newPlayer.history.push(this.getPiecesPoints(player.pieces));
          newPlayer.pieces = [];
          newPlayer.isWinner = false;
          newPlayer.isTurn = false;
          return newPlayer;
        });
        this.$emit('startNewGame', newPlayers);
      }
    },
    joinNextGame() {
      this.$router.push({
        name: 'game',
        params: {
          gameId: this.nextGameId,
          playerId: this.$route.params.playerId,
        },
      });
    },
    flipPiece(piece: Piece) {
      // eslint-disable-next-line arrow-body-style
      const pieceIndex = findIndex(this.myPieces, (p: Piece) => {
        return p[0] === piece[0] && p[1] === piece[1];
      });
      const flipped = { 0: piece[1], 1: piece[0] };
      // Also my need to flip selected piece
      if (pieceIndex === this.selectedPieceIndex) {
        this.selectedPiece = flipped;
      }
      this.myPieces.splice(pieceIndex, 1, flipped);
    },
    selectPiece(piece: Piece) {
      if (this.selectedPiece[0] === piece[0] && this.selectedPiece[1] === piece[1]) {
        this.selectedPiece = {} as Piece;
      } else {
        this.selectedPiece = piece;
      }
    },
    addToTrain(trainToAdd: ITrain) {
      if (!isUndefined(this.selectedPiece[0])) {
        const pieceToCompare = trainToAdd.pieces.length === 0 ? this.board.middle!
          : trainToAdd.pieces[trainToAdd.pieces.length - 1];
        if (pieceToCompare[1] !== this.selectedPiece[0]) {
          this.snackbar.text = 'Invalid move.';
          this.snackbar.show = true;
        } else {
          trainToAdd.pieces.push(this.selectedPiece);
          if (trainToAdd.owner === this.player.name) {
            // eslint-disable-next-line no-param-reassign
            trainToAdd.hasTrain = false;
          }
          this.myPieces.splice(this.selectedPieceIndex, 1);

          if (this.selectedPiece[0] === this.selectedPiece[1]) {
            this.hasPlayedDouble = true;
            this.hasPlayedNonDouble = false;
            // eslint-disable-next-line no-param-reassign
            trainToAdd.hasUnresolvedDouble = true;
            // Reset has drawn as player may need to draw again
            this.hasDrawn = false;
          } else {
            this.hasPlayedNonDouble = true;
            this.hasPlayedDouble = false;
            // eslint-disable-next-line no-param-reassign
            trainToAdd.hasUnresolvedDouble = false;
          }
          this.selectedPiece = {} as Piece;
        }
      }
    },
    startGame() {
      // Draw pieces
      const highestDouble = {
        piece: {} as Piece,
        pieceIndex: 0,
        player: {} as Player,
      };
      for (let i = 0; i < this.pieces; i += 1) {
        this.players.forEach((player: any) => {
          const piece = this.draw();
          player.pieces.push(piece);
          // Check if piece is highest double
          if (piece[0] === piece[1] && piece[0] > (highestDouble.piece[0] || 0)) {
            highestDouble.piece = piece;
            highestDouble.player = player;
            highestDouble.pieceIndex = i;
          }
        });
      }

      // Play the highest double
      this.board.middle = highestDouble.piece;
      // eslint-disable-next-line no-param-reassign
      highestDouble.player.isTurn = true;
      highestDouble.player.pieces.splice(highestDouble.pieceIndex, 1);

      // Set My Pieces
      this.myPieces = cloneDeep(this.player.pieces);
      this.resetTurn();
    },
    updateGame() {
      this.player.pieces = this.myPieces;
      this.$emit('updateGame', {
        board: this.board,
        players: this.players,
        pool: this.pool,
      });
    },
    resetTurn() {
      this.hasPlayedNonDouble = false;
      this.hasPlayedDouble = false;
      this.hasDrawn = false;
    },
    getPiecesPoints(pieces: Piece[]) {
      // eslint-disable-next-line arrow-body-style
      return sumBy(pieces, (piece: Piece) => {
        return piece[0] + piece[1];
      });
    },
    getPlayerTotalPoints(player: Player) {
      return this.getPiecesPoints(player.pieces) + sum(player.history);
    },
  },
  computed: {
    selectedPieceIndex() {
      // eslint-disable-next-line arrow-body-style
      return findIndex(this.myPieces, (piece: Piece) => {
        return this.selectedPiece[0] === piece[0] && this.selectedPiece[1] === piece[1];
      });
    },
    myTrain() {
      return this.board.trains.find((train: any) => train.owner === this.player.name);
    },
    myPoints() {
      const vm = this as any;
      return vm.getPiecesPoints(this.myPieces);
    },
    canEndTurn() {
      const vm = this as any;
      return this.hasPlayedNonDouble || this.hasDrawn || this.myPieces.length === 0;
    },
    canDraw() {
      return !this.hasDrawn && !this.hasPlayedNonDouble && this.myPieces.length > 0;
    },
    canStartNewTrain() {
      const vm = this as any;
      return this.myPieces.length > 0
        && !vm.hasUnresolvedDouble
        && !this.hasPlayedNonDouble
        && !this.hasPlayedDouble
        && this.board.middle
        // eslint-disable-next-line arrow-body-style
        && !!this.myPieces.find((piece: Piece) => {
          return piece[0] === this.board.middle![0] || piece[1] === this.board.middle![1];
        });
    },
    winner() {
      return this.players.find((player: Player) => player.isWinner) || {};
    },
    finalRankings() {
      const vm: any = this;
      return sortBy(this.players, [vm.getPlayerTotalPoints]);
    },
    hasUnresolvedDouble() {
      return this.board.trains.some((train: ITrain) => train.hasUnresolvedDouble);
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
    position: fixed;
    right: 20px;
    width: 200px;
    z-index: 1;
  }
  .unresolved-double-message {
    position: fixed;
    width: 200px;
    left: 50%;
    margin-left: -100px;
    z-index: 1;
  }
  .total-col {
    background-color: #c1bbbb59;
  }
</style>

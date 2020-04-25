<template>
  <div class="start">
    <div class="d-flex flex-column justify-center action-btns">
      <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary"
                 @click="isNewGame = true"
                 v-on="on"
                 width="200px"
                x-large>
            Start New Game
          </v-btn>
          <v-btn color="primary"
                 @click="isNewGame = false"
                 v-on="on"
                 width="200px"
                 x-large>
            Join Game
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ isNewGame ? 'Start New Game' : 'Join Game' }}</span>
          </v-card-title>
          <v-card-text>
            <v-form v-model="gameForm.valid" ref="gameForm">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field :readonly="$route.params.gameId ? true : false"
                                  v-if="!isNewGame"
                                  v-model="gameForm.gameId.value"
                                  label="Game Id"
                                  :rules="gameForm.gameId.rules"
                                  required>
                    </v-text-field>
                    <v-text-field v-model="gameForm.playerName.value"
                                  :rules="gameForm.playerName.rules"
                                  label="Name"
                                  required>
                    </v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDialog()">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="doAction()">Let's Go</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import firebase from '../Firebase';
import { GAME, PLAYER, TRAIN } from '../interfaces/Game.constants';
import { Game, Player, Train } from '../interfaces/Game.interfaces';

export default Vue.extend({
  name: 'Start',

  data() {
    return {
      playerId: '',
      dialog: false,
      isNewGame: false,
      ref: firebase.firestore().collection('games'),
      gameForm: {
        valid: false,
        gameId: {
          value: this.$route.params.gameId,
          rules: [
            (v: string) => !!v || 'Game Id is required.',
            (v: string) => v.match(/^[0-9a-zA-Z]+$/) || 'Please enter a valid Game Id.',
          ],
        },
        playerName: {
          value: '',
          rules: [
            (v: string) => !!v || 'Name is required.',
            (v: string) => v.match(/^[0-9a-zA-Z .!,]+$/) || 'Please remove invalid characters.',
            (v: string) => v.length <= 30 || 'Name is too long.',
          ],
        },
      },
    };
  },
  methods: {
    doAction() {
      (this.$refs.gameForm as Vue).validate();
      if (this.gameForm.valid) {
        if (this.isNewGame) {
          this.createGame();
        } else {
          this.joinGame();
        }
      }
    },
    async createGame() {
      const newGame: Game = cloneDeep(GAME);
      const newPlayer: Player = cloneDeep(PLAYER);
      newPlayer.name = this.gameForm.playerName.value;
      newPlayer.isHost = true;
      newPlayer.id = 1;
      newGame.players.push(newPlayer);
      const newTrain: Train = cloneDeep(TRAIN);
      newTrain.owner = this.gameForm.playerName.value;
      newGame.board.trains.push(newTrain);

      const docRef = await this.ref.add(newGame);
      this.gameForm.gameId.value = docRef.id;
      this.playerId = newPlayer.id.toString();
      this.goToJoinPage();
    },
    async joinGame() {
      const docRef = this.ref.doc(this.gameForm.gameId.value);
      const doc = await docRef.get();
      if (doc.exists) {
        const game: Game = doc.data() as Game;
        const newPlayer: Player = cloneDeep(PLAYER);
        newPlayer.name = this.gameForm.playerName.value;
        newPlayer.id = game.players.length + 1;
        game.players.push(newPlayer);
        const newTrain: Train = cloneDeep(TRAIN);
        newTrain.owner = this.gameForm.playerName.value;
        game.board.trains.push(newTrain);

        await docRef.set(game);
        this.playerId = newPlayer.id.toString();
        this.goToJoinPage();
      }
    },
    goToJoinPage() {
      this.$router.push({
        name: 'join',
        params: {
          gameId: this.gameForm.gameId.value,
          playerId: this.playerId,
        },
      });
      this.dialog = false;
    },
    closeDialog() {
      this.dialog = false;
      (this.$refs.gameForm as Vue).reset();
    },
  },
  mounted() {
    if (this.$route.params.gameId) {
      this.isNewGame = false;
      this.dialog = true;
    }
  },

});
</script>

<style scoped lang="scss">
  .start {
    padding-top: 10%;
    .action-btns {
      button {
        margin: 10px auto;
      }
    }
  }
</style>

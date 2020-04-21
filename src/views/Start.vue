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
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field :readonly="$route.params.gameId ? true : false" 
                                v-if="!isNewGame"
                                v-model="gameId"
                                label="Game Id"
                                required>
                  </v-text-field>
                  <v-text-field v-model="playerName" label="Name" required></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="goToJoin()">Let's Go</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Start',

  data() {
    return {
      gameId: this.$route.params.gameId,
      playerName: '',
      dialog: false,
      isNewGame: false,
    };
  },
  methods: {
    goToJoin() {
      this.dialog = false;
      this.$router.push({
        name: 'join',
        params: {
          gameId: this.gameId,
          playerId: '0',
        },
      });
    },
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

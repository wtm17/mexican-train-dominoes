<template>
  <div class="train d-inline-flex flex-wrap align-center">
    <div class="d-flex flex-column mr-5">
      <v-icon v-if="hasTrain" :color="trainColor" dark>mdi-train</v-icon>
      <h2>
        <v-icon color="pink" v-if="player.isTurn">mdi-star</v-icon>
        {{ owner }}
        <span v-if="player.pieces">({{ player.pieces.length }})</span>
      </h2>
    </div>
    <domino v-for="piece in piecesToShow"
              :key="piece[0] + '-' + piece[1]"
              :values="piece" />
    <v-btn fab
           v-if="showAdd && canPlayOnTrain"
           class="ml-5"
           :disabled="disableAdd"
           color="primary"
           @click="addToTrain()">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Domino from './Domino.vue';

export default Vue.extend({
  name: 'Train',
  components: {
    Domino,
  },

  props: {
    hasTrain: Boolean,
    isOwner: Boolean,
    owner: String,
    pieces: Array,
    showAdd: Boolean,
    disableAdd: Boolean,
    players: Array,
  },
  computed: {
    piecesToShow() {
      return this.pieces.slice(-2);
    },
    canPlayOnTrain() {
      return this.isOwner || this.hasTrain;
    },
    trainColor() {
      const colors = ['red', 'green', 'blue', 'yellow', 'black', 'purple', 'pink',
        'grey', 'orange', 'brown'];
      const index = Math.floor(Math.random() * colors.length);
      return colors[index];
    },
    player() {
      if (this.players) {
        return this.players.find((player: any) => player.name === this.owner) || {};
      }
      return {};
    },
  },
  methods: {
    addToTrain() {
      this.$emit('addToTrain');
    },
  },
});
</script>

<style scoped lang="scss">
.train {
  min-height: 70px;
  margin: 10px;
  .active {
    border: 5px solid green;
    box-sizing: border-box;
  }
}
</style>

<template>
  <div class="train d-inline-flex flex-wrap align-center">
    <div class="d-flex flex-column">
      <v-icon v-if="hasTrain" :color="trainColor" dark>mdi-train</v-icon>
      <v-btn v-else-if="isOwner && showAdd"
             :disabled="disableAdd"
             color="secondary"
             @click="addTrain()"
             x-small>
        Train
      </v-btn>
      <h2>{{ owner }} <span v-if="player.pieces">({{ player.pieces.length }})</span></h2>
    </div>
    <domino v-for="piece in piecesToShow"
              :key="piece[0] + '-' + piece[1]"
              :values="piece" />
    <v-btn fab
           v-if="showAdd && canPlayOnTrain"
           class="ml-10"
           x-large
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
    addTrain() {
      this.$emit('addTrain');
    },
  },
});
</script>

<style scoped lang="scss">
.train {
  min-height: 120px;
  margin: 10px;
}
</style>

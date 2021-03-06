<template>
  <div class="domino"
       :class="{active: selected}"
       @click="selectPiece()">
    <div class="left-half">
      <div class="dot-container"
           :class="'dot-container-' + left">
        <div v-for="value in left"
            :key="value"
            class="dot">
        </div>
      </div>
    </div>
    <div class="right-half">
      <div class="dot-container"
          :class="'dot-container-' + right">
        <div v-for="value in right"
            :key="value"
            class="dot">
        </div>
      </div>
    </div>
    <v-btn
      v-if="flippable"
      @click.stop="flip()"
      color="primary"
      class="mr-n9"
      dark
      x-small
      absolute
      bottom
      right
      fab
    >
      <v-icon>mdi-sync</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Piece } from '../interfaces/Game.interfaces';

export default Vue.extend({
  name: 'Domino',

  props: {
    values: Object as () => Piece,
    selected: Boolean,
    flippable: Boolean,
  },
  data() {
    return {
      left: this.values[0],
      right: this.values[1],
    };
  },
  methods: {
    flip() {
      this.$emit('flipPiece');
    },
    selectPiece() {
      this.$emit('selectPiece');
    },
  },
});
</script>

<style scoped lang="scss">
.domino {
  width: 150px;
  height: 70px;
  margin: 10px 0;
  position: relative;
  border: 4px solid #222;
  border-radius: 12px;
  background-color: #FFFFFF;
  cursor: pointer;
  &.active {
    background-color: #808080;
  }
  .left-half,
  .right-half {
    box-sizing: border-box;
    float: left;
    width: 50%;
    height: 100%;
  }
  .left-half {
    border-right: 2px solid #222;
  }
  .right-half {
    border-left: 2px solid #222;
  }

  .dot-container {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 5px 6px 5px 0;
  }
  .dot {
    position: relative;
    width: 10px;
    height: 10px;
    background-color: black;
    border-radius: 50%;
    float: right;
    margin: 4px 2px;
  }
  .dot-container-9,
  .dot-container-8,
  .dot-container-7,
  .dot-container-6,
  .dot-container-5,
  .dot-container-4,
  .dot-container-3,
  .dot-container-2,
  .dot-container-1 {
    .dot {
      width: 14px;
      height: 14px;
      margin: 2px 3px;
    }
  }

  .dot-container-12 {
    .dot {
      background-color: #b3b3b3;
    }
  }
  .dot-container-11 {
    .dot:nth-child(5), .dot:nth-child(6) {
      margin-left: 9px;
    }
  }
  .dot-container-10 {
    .dot {
      background-color: #ff6600;
    }
    .dot:nth-child(5) {
      margin-left: 30px;
    }
  }
  .dot-container-9 {
    .dot {
      background-color: #330066;
    }
  }
  .dot-container-9 {
    .dot {
      background-color: #330066;
    }
  }
  .dot-container-8 {
    .dot {
      background-color: #003300;
    }
    .dot:nth-child(4) {
      margin-left: 23px;
    }
  }
  .dot-container-7 {
    .dot {
      background-color: #404040;
    }
    .dot:nth-child(4) {
      margin-right: 23px;
      margin-left: 20px;
    }
  }
  .dot-container-6 {
    .dot {
      background-color: #ffd11a;
    }
    .dot:nth-child(4), .dot:nth-child(5), .dot:nth-child(6) {
      margin-top: 18px;
    }
  }
  .dot-container-5 {
    padding-right: 8px;
    .dot {
      background-color: #000080;
    }
    .dot:nth-child(1) {
      margin-left: 20px;
    }
    .dot:nth-child(3) {
      margin-right: 21px;
      margin-left: 20px;
    }
    .dot:nth-child(4) {
      margin-left: 20px;
    }
  }
  .dot-container-4 {
    .dot {
      background-color: #996633;
    }
    .dot:nth-child(1) {
      margin-left: 20px;
    }
    .dot:nth-child(3) {
      margin-left: 20px;
    }
    .dot:nth-child(3), .dot:nth-child(4) {
      margin-top: 18px;
    }
  }
  .dot-container-3 {
    .dot {
      background-color: #800060;
    }
    .dot:nth-child(1) {
      margin-right: 45px;
    }
    .dot:nth-child(2) {
      margin-right: 23px;
      margin-left: 20px;
    }
  }
  .dot-container-2 {
    .dot {
      background-color: #003300;
    }
    .dot:nth-child(1) {
      margin-right: 40px;
    }
    .dot:last-child {
      margin-top: 18px;
      margin-left: 30px;
    }
  }
  .dot-container-1 {
    .dot {
      background-color: #0052cc;
    }
    .dot:nth-child(1) {
      margin-top: 18px;
      margin-right: 21px;
    }
  }
}
</style>

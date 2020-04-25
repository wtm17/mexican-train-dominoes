declare module '*.vue' {
  import Vue from 'vue';

  module 'vue/types/vue' {
    interface Vue {
      validate: () => void;
      reset: () => void;
    }
  }

  export default Vue;
}

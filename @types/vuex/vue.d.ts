/**
 * Extends interfaces in Vue.js
 */

import { Vue } from "../vue/vue";
import { ComponentOptions } from "../vue/options";
import { Store } from "./index";

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    store?: Store<any>;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $store: Store<any>;
  }
}

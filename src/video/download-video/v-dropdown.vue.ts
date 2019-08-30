export default {
  props: ['items', 'value'],
  data() {
    return {
      dropdownOpen: false
    }
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    select(item: string) {
      this.$emit('update:value', item)
      this.$emit('change', item)
    }
  }
}
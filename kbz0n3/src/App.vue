<template>
  <Navbar/>
  <router-view/>
  <AppFooter></AppFooter>
</template>

<script >
import { defineAsyncComponent } from 'vue'

export default {
  components: {
    Navbar: defineAsyncComponent(() => import('./Modules/ModuleA/shared/NavBar.vue')),
    AppFooter: defineAsyncComponent(() => import('./Modules/ModuleA/shared/AppFooter.vue')),
  },
}
</script>

<style>
body, html {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

</style>

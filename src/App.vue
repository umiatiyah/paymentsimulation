<template>
  <div id="app">
    <div v-if="showNav" class="navigation">
      <router-link to="/">Customer Portal</router-link> | 
      <router-link to="/admin">Admin Dashboard</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  computed: {
    showNav() {
      return this.$route.path !== '/login' // Add login path if you have one
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
}

.navigation {
  margin-bottom: 30px;
  padding: 10px;
  background: #f5f5f5;
}

.navigation a {
  font-weight: bold;
  color: #2c3e50;
  margin: 0 10px;
}

.navigation a.router-link-exact-active {
  color: #42b983;
}
</style>
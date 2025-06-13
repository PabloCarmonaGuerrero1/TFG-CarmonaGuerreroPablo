<template>
  <div class="NavBar">
    <div class="navbar-leftside">
      <router-link to="/info"><img src="../../../assets/icons/info.png" alt="info-page" /></router-link>
      <router-link to="/reviewpage"><img src="../../../assets/icons/review.png" alt="review-page" /></router-link>
    </div>
    <div class="navbar-center">
      <router-link to="/homepage"><img src="../../../assets/icons/homepage.png" alt="homepage" /></router-link>
    </div>
    <div class="navbar-rightside">
      <router-link v-if="isAdmin" to="/adminedits"><img src="../../../assets/icons/admin.png" alt="adminedits-page" /></router-link>
      <router-link to="/shoppingcart"><img src="../../../assets/icons/shoppingcart.png" alt="shoppingcart-page" /></router-link>
      <router-link v-if="!isLoggedIn" to="/"><img src="../../../assets/icons/login.png" alt="login-page" /></router-link>
      <router-link v-if="isLoggedIn" to="/profile"><img src="../../../assets/icons/user.png" alt="user-page" /></router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      isAdmin : false,
    };
  },
  mounted() {
    this.checkLoginStatus();
    this.checkAdminStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = token !== null;

      if (this.isLoggedIn) {
        this.checkAdminStatus(); 
      } else {
        this.isAdmin = false;
      }
    },
    async checkAdminStatus(){
      const token = localStorage.getItem('token')
      if (!token) return null;
              const res = await fetch("http://localhost:8000/api/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        if(data.name==="Paco"){
          this.isAdmin=true;
        }      
    }
  },
  watch: {
    '$route'() {
      this.checkLoginStatus();
    }
  }
};
</script>

<style>
.NavBar {
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 5rem; 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    background-color: #00E5FF; 
    z-index: 1000; 
    box-sizing: border-box;
}

.NavBar img {
    width: 5vh;
    height: 5vh;
}

.NavBar .navbar-center img {
    width: 9vh;
    height: 9vh;
}

.NavBar .navbar-leftside img {
    padding-left: 2rem;
    padding-right: 2rem;
}

.NavBar .navbar-rightside img {
    padding-left: 2rem;
    padding-right: 2rem;
}
@media (max-width: 768px) {
    .NavBar {
        height: 4rem; 
        padding: 0; 
        justify-content: space-between;
    }

    .NavBar img {
        width: 4vh;
        height: 4vh;
    }

    .NavBar .navbar-center img {
        width: 7vh;
        height: 7vh;
    }

    .NavBar .navbar-leftside img,
    .NavBar .navbar-rightside img {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .NavBar .navbar-leftside,
    .NavBar .navbar-rightside {
        flex: 1;
        justify-content: center; 
    }

    .NavBar .navbar-center {
        flex: 2; 
        display: flex;
        justify-content: center; 
    }
}

@media (max-width: 480px) {
    .NavBar {
        height: 3.5rem; 
        padding: 0;
    }

    .NavBar img {
        width: 3.5vh;
        height: 3.5vh;
    }

    .NavBar .navbar-center img {
        width: 6vh;
        height: 6vh;
    }

    .NavBar .navbar-leftside img,
    .NavBar .navbar-rightside img {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .NavBar .navbar-leftside,
    .NavBar .navbar-rightside {
        flex: 1;
        justify-content: center;
    }

    .NavBar .navbar-center {
        flex: 2;
        display: flex;
        justify-content: center;
    }
}
</style>
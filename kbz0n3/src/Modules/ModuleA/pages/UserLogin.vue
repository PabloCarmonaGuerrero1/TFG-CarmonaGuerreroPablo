<template>
  <div class="Login">
    <div class="login-images-leftside">
      <img :src="images[0]" alt="product-image-left-one" v-if="images[0]">
      <img :src="images[1]" alt="product-image-left-two" v-if="images[1]">
    </div>
    <form class="Login-form" @submit.prevent="loginUser">
      <h1>WELCOME TO KBZ0N3!</h1>
      <label class="login-input-container">
        <h2 class="login-titleform">USERNAME</h2>
        <input v-model="username" type="text" class="login-input" />
        <div class="login-error" v-if="errors.username">{{ errors.username }}</div>
      </label>

      <label class="login-input-container">
        <h2 class="login-titleform">PASSWORD</h2>
        <input v-model="password" type="password" class="login-input" />
        <div class="login-error" v-if="errors.password">{{ errors.password }}</div>
      </label>

      <div class="login-buttons">
        <button type="submit" class="btn">LOGIN</button>
        <router-link to="/homepage">
          <button type="button" class="btn btn-guest">ENTER AS GUEST</button>
        </router-link>
      </div>

      <router-link to="/register" class="login-goregister">
        If you have not registered yet, register here
      </router-link>
    </form>
    <div class="login-images-rightside">
      <img :src="images[2]" alt="product-image-right-one" v-if="images[2]">
      <img :src="images[3]" alt="product-image-right-two" v-if="images[3]">
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      username: "",
      password: "",
      images: [],
      errors: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    async loginUser() {
      try {
        const apiUrl = `http://localhost:8000/api/users/search/${this.username}`;
        const response = await axios.get(apiUrl);

        if (response.data) {
          const user = response.data;
          if (user.password === this.password) {
            localStorage.setItem("username", this.username);
            this.$router.push("/homepage");
          } else {
            this.errors.password = "Incorrect password.";
            this.errors.username = "";
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.errors.username = "User not found.";
          this.errors.password = "";
        } else {
          console.error("Error:", error);
        }
      }
    },
    async getImage() {
      try {
        const apiUrl = `http://localhost:8000/api/product`;
        const response = await axios.get(apiUrl);
        
        if (response.data && Array.isArray(response.data)) {
          const totalProducts = response.data.length;
          if (totalProducts < 4) {
            console.error("Not enough products available.");
            return;
          }
          
          const selectedIndexes = new Set();
          while (selectedIndexes.size < 4) {
            const randomIndex = Math.floor(Math.random() * totalProducts);
            selectedIndexes.add(randomIndex);
          }
          
          this.images = [...selectedIndexes].map(index => response.data[index].image);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  },
  mounted() {
    this.getImage();
  }
};
</script>


<style>
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

.Login {
  height: 98vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.Login img {
  width: 18rem;
  height: 18rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  border-radius: 50%;
  object-fit: cover;
}

.Login .login-images-leftside img {
  margin-left: 15rem;
}

.Login .login-images-rightside img {
  margin-right: 15rem;
}

.Login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "Keania One", sans-serif;
}

.login-input-container {
  width: 80%;
  max-width: 18.75rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-titleform {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-input {
  width: 25rem;
  height: 3rem;
  padding: 1rem;
  border: none;
  border-radius: 0.9375rem;
  background: rgba(0, 0, 0, 0.1);
  text-align: center;
  font-size: 1.5rem;
  font-family: "Keania One", sans-serif;
}

.login-buttons {
  width: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.625rem;
}

.btn-link {
  width: 50%;
}

.btn {
  width: 12rem; 
  min-width: 12rem;
  height: 3.125rem; 
  font-size: 1.2rem;
  border: none;
  border-radius: 1.875rem;
  font-family: "Keania One", sans-serif;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap; 
  padding: 10px 0;
}

.btn:first-child {
  background-color: #00E5FF;
  color: black;
}

.btn:last-child {
  background-color: #0000ff;
  color: white;
}

/* Enlace de registro */
.login-goregister {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: black;
  text-decoration: underline;
  text-align: center;
}

.login-error {
  color: rgb(168, 0, 0);
  margin-top: 0.5rem;
}

@media (max-width: 1024px) {
  .Login {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .Login .login-images-leftside img,
  .Login .login-images-rightside img {
    display: none;
  }

  .Login-form {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .login-input {
    width: 20rem;
  }

  .btn {
    width: 10rem;
  }

  .login-titleform {
    font-size: 1.5rem;
  }

  .login-input-container {
    width: 90%;
  }

  .login-goregister {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .login-input {
    width: 18rem;
    font-size: 1.2rem;
  }

  .btn {
    width: 10rem;
    font-size: 1rem;
  }

  .login-titleform {
    font-size: 1.2rem;
  }

  .login-error {
    font-size: 0.8rem;
  }
}
</style>

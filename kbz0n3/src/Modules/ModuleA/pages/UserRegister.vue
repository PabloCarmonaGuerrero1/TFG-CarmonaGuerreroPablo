<template>
  <div class="Register">
    <div class="register-images-leftside">
      <img :src="images[0]" alt="product-image-left-one" v-if="images[0]">
      <img :src="images[1]" alt="product-image-left-two" v-if="images[1]">
    </div>
    <form class="Register-form">
      <h1 class="registerpage-title">Register on KBZ0N3</h1>
      <div class="register-inputs-container">
        <div class="register-row">
          <label class="register-input-container">
            <h2 class="register-titleform">USERNAME</h2>
            <input type="text" v-model="username" class="register-input" />
            <div class="error" v-if="errors.username">{{ errors.username }}</div>
            <div class="error" v-if="errors.usernameTaken">{{ errors.usernameTaken }}</div>
          </label>
          <label class="register-input-container">
            <h2 class="register-titleform">DNI</h2>
            <input type="text" v-model="DNI" class="register-input" />
            <div class="error" v-if="errors.DNI">{{ errors.DNI }}</div>
          </label>
        </div>
        <div class="register-row">
          <label class="register-input-container">
            <h2 class="register-titleform">PHONE NUMBER</h2>
            <input type="text" v-model="number" class="register-input" />
            <div class="error" v-if="errors.number">{{ errors.number }}</div>
          </label>
          <label class="register-input-container">
            <h2 class="register-titleform">ADDRESS</h2>
            <input type="text" v-model="adress" class="register-input" />
            <div class="error" v-if="errors.adress">{{ errors.adress }}</div>
          </label>
        </div>
        <div class="register-row">
          <label class="register-input-container">
            <h2 class="register-titleform">PASSWORD</h2>
            <input type="password" v-model="password" class="register-input" />
            <div class="error" v-if="errors.password">{{ errors.password }}</div>
          </label>
          <label class="register-input-container">
            <h2 class="register-titleform">REPEAT PASSWORD</h2>
            <input type="password" v-model="repeat" class="register-input" />
            <div class="error" v-if="errors.repeat">{{ errors.repeat }}</div>
          </label>
        </div>
      </div>
      <div class="register-buttons">
        <button @click.prevent="validateAndSubmit" class="btn" :disabled="submitDisabled">REGISTER</button>
      </div>
    </form>
    <div class="register-images-rightside">
      <img :src="images[2]" alt="product-image-right-one" v-if="images[2]">
      <img :src="images[3]" alt="product-image-right-two" v-if="images[3]">
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: "",
      DNI: "",
      number: "",
      adress: "",
      password: "",
      repeat: "",
      images: [],
      errors: {
        username: "",
        DNI: "",
        number: "",
        adress: "",
        password: "",
        repeat: "",
        usernameTaken: "",
      },
      submitDisabled: false,
    };
  },
  methods: {
    async validateUsernameAvailability() {
      try {
        const apiUrl = `http://localhost:8000/api/users/search/${this.username}`;
        await axios.get(apiUrl);
        this.errors.usernameTaken = 'Username is already taken';
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.errors.usernameTaken = ''; 
        } else {
          this.errors.usernameTaken = 'Error checking username availability';
          console.error('Error checking username availability:', error);
        }
      }
    },
    validateName() {
      const namelength = this.username.replace(/\s/g, '').length;
      if (namelength < 4 || namelength > 12){
        this.errors.username = 'Username must be at least 4 characters long';
        this.errors.usernameTaken = ''; 
      } else {
        this.errors.username = '';
      }
      this.updateSubmitDisabled();
    },
    validateDNI() {
        if (!this.DNI.match(/^\d{8}[A-Z]$/)) {
            this.errors.DNI = "DNI must be 8 digits followed by a capital letter (e.g., 12345678A)";
        } else {
            this.errors.DNI = "";
        }
        this.updateSubmitDisabled();
    },
    validatePhoneNumber() {
      if (!this.number.match(/^\d{9,15}$/)) {
        this.errors.number = "Phone number must be between 9 and 15 digits";
      } else {
        this.errors.number = "";
      }
      this.updateSubmitDisabled();
    },
    validateAdress() {
      if (this.adress.length < 5) {
        this.errors.adress = "Address must be at least 5 characters";
      } else {
        this.errors.adress = "";
      }
      this.updateSubmitDisabled();
    },
    validatePassword() {
      if (this.password.length < 8 || this.password.includes(" ")) {
        this.errors.password = "Password must be at least 8 characters long and cannot contain spaces";
      } else {
        this.errors.password = "";
      }
      this.updateSubmitDisabled();
    },
    validateRepeat() {
      if (this.password !== this.repeat) {
        this.errors.repeat = "Passwords do not match";
      } else {
        this.errors.repeat = "";
      }
      this.updateSubmitDisabled();
    },
    updateSubmitDisabled() {
      this.submitDisabled = Object.values(this.errors).some(error => error !== '');
    },
    async registerUser() {
      try {
        const apiUrl = 'http://localhost:8000/api/users';
        const userData = {
          name: this.username,
          DNI: this.DNI,
          number: this.number,
          password: this.password,
          adress: this.adress,
          last_buy: "nothing",
          fav_food: "nothing",
          fav_drink: "nothing",
        };

        const response = await axios.post(apiUrl, userData);
        console.log('Respuesta del servidor:', response.data);

        this.$router.push("/");
      } catch (error) {
        if (error.response) {
          console.error('Server responded with an error status:', error.response.status);
          console.error('Error data:', error.response.data);
        } else if (error.request) {
          console.error('No response received from the server');
        } else {
          console.error('Error setting up the request:', error.message);
        }
      }
    },
    validateAndSubmit() {
      this.validateName();
      this.validateDNI();
      this.validatePhoneNumber();
      this.validateAdress();
      this.validatePassword();
      this.validateRepeat();
      this.validateUsernameAvailability();
      if (!this.submitDisabled) {
        this.registerUser();
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
  },
  watch: {
    username: "validateName",
    DNI: "validateDNI",
    number: "validatePhoneNumber",
    adress: "validateAdress",
    password: "validatePassword",
    repeat: "validateRepeat",
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/*  Layout General  */
.Register {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  font-family: "Keania One", sans-serif;
}

/*  Imágenes  */
.Register img {
  width: 18rem;
  height: 18rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  border-radius: 50%;
  object-fit: cover;
}

.register-images-leftside {
  margin-left: 10rem;
}

.register-images-rightside {
  margin-right: 10rem;
}

/*  Título del Formulario  */
.registerpage-title {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1rem;
  padding: 1rem;
}

/*  Contenedor Inputs  */
.register-inputs-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  justify-content: center;
}

.register-row {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  width: 100%;
}

.register-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 45%;
}

/*  Inputs  */
.register-titleform {
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.register-input {
  height: 3rem;
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 0.9375rem;
  background: #F7F7F7;
  text-align: center;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
}

/*  Botones  */
.register-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 1rem;
}

.btn {
  width: 12rem;
  height: 3.125rem;
  font-size: 1rem;
  border: none;
  border-radius: 1.875rem;
  font-family: "Keania One", sans-serif;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 0.625rem 0;
  background-color: #00aaff;
  color: black;
}

/*  Mensaje de Error  */
.error {
  width: 15rem;
  min-height: 1.2rem;
  color: rgb(168, 0, 0);
  text-align: center;
  margin-top: 0.5rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/*  Responsive  */
@media (max-width: 768px) {
  .Register {
    flex-direction: column;
    padding: 1rem;
    min-height: 175vh;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .register-images-leftside,
  .register-images-rightside {
    display: none;
  }

  .register-row {
    flex-direction: column;
  }

  .register-input-container {
    width: 100%;
  }
}
</style>


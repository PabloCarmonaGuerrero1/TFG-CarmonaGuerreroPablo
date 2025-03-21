<template>
  <div class="profile-page">
    <div class="profile-form-bottons">
      <form class="profile-form-infoupdate">
        <div class="form-row">
        <label class="form-item">
          <p>Username</p>
          <input type="text" v-model="username">
          <div class="profile-error" v-if="errors.username">{{ errors.username }}</div>
          <div class="profile-error" v-if="errors.usernameTaken">{{ errors.usernameTaken }}</div>
        </label>
        <label class="form-item">
          <p>DNI</p>
          <input type="text" v-model="DNI">
          <div class="profile-error" v-if="errors.DNI">{{ errors.DNI }}</div>
        </label>
      </div>
      <div class="form-row">
        <label class="form-item">
          <p>Phone Number</p>
          <input type="text" v-model="number">
          <div class="profile-error" v-if="errors.number">{{ errors.number }}</div>
        </label>
        <label class="form-item">
          <p>Address</p>
          <input type="text" v-model="adress">
          <div class="profile-error" v-if="errors.adress">{{ errors.adress }}</div>
        </label>
      </div>
      <div class="form-row">
        <label class="form-item">
          <p>Password</p>
          <input type="password" v-model="password">
          <div class="profile-error" v-if="errors.password">{{ errors.password }}</div>
        </label>
        <label class="form-item">
          <p>Repeat Password</p>
          <input type="password" v-model="repeat">
          <div class="profile-error" v-if="errors.repeat">{{ errors.repeat }}</div>
        </label>
      </div>
    </form>
    <div class="profile-bottons">
        <button @click.prevent="validateAndSubmit" :disabled="submitDisabled" class="profile-botton-update">Update Profile</button>
        <button @click.prevent="logout" class="profile-botton-logout">Log out</button>
      </div>
    </div>
    <div class="profile-user-favs">
      <h3>Favorite Products</h3>
      <div v-if="favoriteProducts && favoriteProducts.length > 0" class="profile-product-list">
        <div v-for="product in favoriteProducts" :key="product.id" class="profile-product-item">
          <img :src="product.imageUrl" :alt="product.name" class="profile-product-image" @click="selectProduct(product.id)" />
          <p>{{ product.name }}</p>
        </div>
      </div>
      <div v-else>
        <p>No favorite products found.</p>
      </div>
    </div>
    <div v-if="notificationMessage" class="notification" :class="notificationType">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import defaultImage from '@/assets/icons/default-nothing.png';

export default {
  data() {
    return {
      username: "",
      id:"",
      DNI: "",
      number: "",
      adress: "",
      password: "",
      repeat: "",
      fav_drink:"",
      fav_food:"",
      favoriteProducts: [],
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
      defaultImage: defaultImage,
      selectedProduct: null,  
      notificationMessage: "", 
      notificationType: "", 
    };
  },
  methods: {
    async getUserInfo() {
      try {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
          console.error("No username found in localStorage.");
          return;
        }
        const apiUrl = `http://localhost:8000/api/users/search/${storedUsername}`;
        const response = await axios.get(apiUrl);

        if (response.data) {
          this.username = response.data.name || "";
          this.DNI = response.data.DNI || "";
          this.number = response.data.number || "";
          this.adress = response.data.adress || "";
          this.id = response.data.id || "";
          this.userpassword = response.data.password || "";
          this.fav_drink = response.data.fav_drink || "";
          this.fav_food = response.data.fav_food || "";
        }
        this.loadFavoriteProducts();
      } catch (error) {
        console.error('Error fetching user information:', error);
      }
    },     
    async loadFavoriteProducts() {
      try {
        const productIds = [this.fav_drink, this.fav_food];
        
        const productRequests = productIds.map(id => 
          id !== "nothing" ? axios.get(`http://localhost:8000/api/product/${id}`) : null
        ).filter(request => request !== null); 
        
        const responses = await Promise.all(productRequests);
        
        this.favoriteProducts = responses.map(response => ({
          id: response.data.id,
          name: response.data.name,
          imageUrl: response.data.image || this.defaultImage 
        }));
        
        if (this.fav_drink === "nothing") {
          this.favoriteProducts.push({
            id: "nothing_drink",
            name: "No favorite drink",
            imageUrl: this.defaultImage
          });
        }
        if (this.fav_food === "nothing") {
          this.favoriteProducts.push({
            id: "nothing_food",
            name: "No favorite food",
            imageUrl: this.defaultImage
          });
        }
        
      } catch (error) {
        console.error('Error loading favorite products:', error);
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
        this.updateUser();
      }
    },
    selectProduct(productId) {
      localStorage.setItem('selectedProduct', productId);
      this.$router.push('/product-info');
    },
    async updateUser() {
      try {
        const apiUrl = `http://localhost:8000/api/users/${this.id}`;
        const userData = {
          name: this.username,
          DNI: this.DNI,
          number: this.number,
          adress: this.adress,
          last_buy: "nothing",
          fav_food: this.fav_food,
          fav_drink: this.fav_drink,
        };

        if (this.password) {
          userData.password = this.password;
        }

        localStorage.setItem("username", this.username);
        const response = await axios.put(apiUrl, userData);
        console.log('Respuesta del servidor:', response.data);

        this.showNotification("Profile updated successfully", "success");

      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        this.showNotification("Error updating profile", "error");
      }
    },
    async validateUsernameAvailability() {
      try {
        const storedUsername = localStorage.getItem('username');

        if (this.username === storedUsername) {
            this.errors.usernameTaken = '';
        return;
        }
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
  if (this.password && (this.password.length < 8 || this.password.includes(" "))) {
    this.errors.password = "Password must be at least 8 characters long and cannot contain spaces";
  } else {
    this.errors.password = ""; 
  }
  this.updateSubmitDisabled();
},

    validateRepeat() {
        if (this.password && this.password !== this.repeat) {
        this.errors.repeat = "Passwords do not match";
    } else {
        this.errors.repeat = ""; 
    }
        this.updateSubmitDisabled();
    },
    updateSubmitDisabled() {
        this.submitDisabled = Object.values(this.errors).some(error => error !== '');
    },
    logout() {
        localStorage.removeItem("username"); 
        this.$router.push("/");  
        this.showNotification("Logged out successfully", "logout");
            
    },    
    showNotification(message, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      
      setTimeout(() => {
        this.notificationMessage = "";
        this.notificationType = "";
      }, 3000);
    },
},
  mounted() {
    this.getUserInfo(); 
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
.profile-page{
  min-height: 80vh;
  display: flex;
  margin-top: 6rem;
  margin-bottom: 8rem;
  justify-content: space-around;
}
.profile-user-favs{
  width: 25%;
  height: 40rem;
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  background-color: #D9D9D9;
  font-family: "Keania One", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.profile-form-infoupdate{
  width: 100%;
  height: 35rem;
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  background-color: #D9D9D9;
  font-family: "Keania One", sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.profile-form-infoupdate input{
  width: 12rem;
  font-family: "Keania One", sans-serif;
  padding: 0.5rem;
  border: 0.2rem solid #000000;
  border-radius: 0.3rem;
}
.form-row{
  display: flex;
  gap: 2rem;
  justify-content: center;
  width: 100%;
}
.profile-form-infoupdate p{
  font-size: 1.5rem;
}
.profile-form-infoupdate input{
  height: 0.5rem;
  width: 15rem;
  padding: 1rem; 
  margin: 0.5rem;
  border: none;
  border-radius: 0.9375rem; 
  text-align: center;
  font-size: 1rem; 
  font-family: "Keania One", sans-serif;
}
.profile-bottons{
  display: flex;
  justify-content: center;
  align-items: center;
}
.profile-bottons button{
  width: 12rem; 
  height: 3.125rem; 
  font-size: 1rem; 
  margin: 1rem;
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
.profile-botton-update:hover{
  background-color: #0000ff;
  color: white;
}
.profile-botton-logout:hover{
  background-color: rgb(168, 0, 0);
  color: white;
}
.profile-product-image{
  height: 12rem;
  width: 12rem;
  margin-top:2rem;
  object-fit: cover;
  border-radius: 1rem;
  border: 0.2rem solid black;
}
.profile-error{
  width: 15rem;
  font-size: 1rem;
  color: rgb(168, 0, 0);
  text-align: center;
  margin-top: 0.5rem; 
  word-wrap: break-word;
  overflow-wrap: break-word; 
}
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px;
  border-radius: 5px;
  z-index: 1000;
  transition: opacity 0.5s ease;
  font-family: "Keania One", sans-serif;
}

.notification.success {
  background-color: #4caf50;
  color: white;
}

.notification.error,.notification.logout {
  background-color: #f44336;
  color: white;
}
@media (max-width: 1024px) {
  .profile-page {
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .profile-user-favs,
  .profile-form-bottons {
    width: 90%;
    height: auto;
  }

  .form-row {
    flex-direction: column;
    align-items: center;
  }

  .profile-product-image {
    width: 10rem;
    height: 10rem;
  }
}

@media (max-width: 600px) {
  .profile-page {
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    gap: 1rem;
  }

  .profile-form-bottons,
  .profile-user-favs {
    width: 100%;
    padding: 0.5rem;
  }

  .profile-form-infoupdate {
    padding: 0.5rem;
    height: auto;
    max-width: 100%;
  }

  .form-row {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .form-item {
    width: 100%;
  }

  .profile-form-infoupdate p {
    font-size: 1.1rem;
    margin: 0.2rem 0;
  }

  .profile-form-infoupdate input {
    height: 2.2rem;
    font-size: 0.9rem;
    padding: 0.3rem 0.5rem;
    width: 80%;
    margin: 0.2rem 0;
  }

  .profile-bottons {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .profile-bottons button {
    width: 100%;
    height: 2.5rem;
    font-size: 0.95rem;
  }

  .profile-product-image {
    width: 8rem;
    height: 8rem;
  }

  .profile-error {
    font-size: 0.8rem;
    width: 100%;
  }
}
</style>

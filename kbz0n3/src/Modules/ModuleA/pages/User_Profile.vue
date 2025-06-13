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
          <img :src="product.imageUrl" :alt="product.name" class="profile-product-image" @click="selectProduct(product.id)" @error="onProductImageError"/>
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
      id: "",
      DNI: "",
      number: "",
      adress: "",
      password: "",
      repeat: "",
      fav_drink: "",
      fav_food: "",
      favoriteProducts: [],
      currentUser: null, 
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
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("https://kbz0n3api-despliegue.onrender.com/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!data || data.error) return;

        this.currentUser = data;
        this.id = data.id;
        this.username = data.name || "";
        this.DNI = data.DNI || "";
        this.number = data.number || "";
        this.adress = data.adress || "";
        this.fav_drink = data.fav_drink || "";
        this.fav_food = data.fav_food || "";

        this.loadFavoriteProducts();
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },

    async loadFavoriteProducts() {
      try {
        const productIds = [this.fav_drink, this.fav_food];
        const requests = productIds
          .map(id => id !== "nothing" ? axios.get(`https://kbz0n3api-despliegue.onrender.com/api/product/${id}`) : null)
          .filter(req => req !== null);

        const responses = await Promise.all(requests);
        this.favoriteProducts = responses.map(res => ({
          id: res.data.id,
          name: res.data.name,
          imageUrl: res.data.image || this.defaultImage,
        }));

        if (this.fav_drink === "nothing") {
          this.favoriteProducts.push({
            id: "nothing_drink",
            name: "No favorite drink",
            imageUrl: this.defaultImage,
          });
        }

        if (this.fav_food === "nothing") {
          this.favoriteProducts.push({
            id: "nothing_food",
            name: "No favorite food",
            imageUrl: this.defaultImage,
          });
        }
      } catch (error) {
        console.error("Error loading favorite products:", error);
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

    async updateUser() {
      try {
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

        await axios.put(`https://kbz0n3api-despliegue.onrender.com/api/users/${this.id}`, userData);
        this.showNotification("Profile updated successfully", "success");

      } catch (error) {
        console.error("Error updating user:", error);
        this.showNotification("Error updating profile", "error");
      }
    },

    async validateUsernameAvailability() {
      try {
        if (!this.currentUser || this.username === this.currentUser.name) {
          this.errors.usernameTaken = "";
          return;
        }

        await axios.get(`https://kbz0n3api-despliegue.onrender.com/api/users/search/${this.username}`);
        this.errors.usernameTaken = "Username is already taken";
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.errors.usernameTaken = "";
        } else {
          this.errors.usernameTaken = "Error checking username availability";
        }
      }
    },

    validateName() {
      const length = this.username.replace(/\s/g, "").length;
      this.errors.username = length < 4 || length > 12 ? "Username must be at least 4 characters long" : "";
      this.updateSubmitDisabled();
    },
    validateDNI() {
      this.errors.DNI = !/^\d{8}[A-Z]$/.test(this.DNI)
        ? "DNI must be 8 digits followed by a capital letter (e.g., 12345678A)"
        : "";
      this.updateSubmitDisabled();
    },
    validatePhoneNumber() {
      this.errors.number = !/^\d{9,15}$/.test(this.number)
        ? "Phone number must be between 9 and 15 digits"
        : "";
      this.updateSubmitDisabled();
    },
    validateAdress() {
      this.errors.adress = this.adress.length < 5 ? "Address must be at least 5 characters" : "";
      this.updateSubmitDisabled();
    },
    validatePassword() {
      this.errors.password = this.password && (this.password.length < 8 || this.password.includes(" "))
        ? "Password must be at least 8 characters and cannot contain spaces"
        : "";
      this.updateSubmitDisabled();
    },
    validateRepeat() {
      this.errors.repeat = this.password && this.password !== this.repeat
        ? "Passwords do not match"
        : "";
      this.updateSubmitDisabled();
    },

    updateSubmitDisabled() {
      this.submitDisabled = Object.values(this.errors).some(err => err !== "");
    },

    selectProduct(productId) {
      localStorage.setItem("selectedProduct", productId);
      this.$router.push("/product-info");
    },

    logout() {
      localStorage.removeItem("token");
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
    onProductImageError(event) {
      event.target.src = this.defaultImage;
    }
  },

  mounted() {
    this.getUserInfo();
  },

  watch: {
    username() {
      this.validateName();
      this.validateUsernameAvailability(); 
    },
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

/*  General Layout  */
.profile-page {
  min-height: 80vh;
  display: flex;
  justify-content: space-around;
  margin-top: 6rem;
  margin-bottom: 8rem;
  font-family: "Keania One", sans-serif;
}

/*  User Favorites  */
.profile-user-favs {
  width: 25%;
  height: 40rem;
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  background-color: #F7F7F7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/*  Form Info Update  */
.profile-form-infoupdate {
  width: 100%;
  height: 35rem;
  padding: 1rem;
  border-radius: 1rem;
  background-color: #F7F7F7;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.profile-form-infoupdate p {
  font-size: 1.5rem;
}

.profile-form-infoupdate input {
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

/*  Form Row  */
.form-row {
  display: flex;
  gap: 2rem;
  justify-content: center;
  width: 100%;
}

/*  Buttons  */
.profile-bottons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-bottons button {
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

.profile-botton-update:hover {
  background-color: #0000ff;
  color: white;
}

.profile-botton-logout:hover {
  background-color: rgb(180, 0, 0);
  color: white;
}

/*  Product Image  */
.profile-product-image {
  height: 12rem;
  width: 12rem;
  margin-top: 2rem;
  object-fit: cover;
  border-radius: 1rem;
  border: 0.2rem solid black;
}

/*  Error Message  */
.profile-error {
  width: 15rem;
  font-size: 1rem;
  color: rgb(168, 0, 0);
  text-align: center;
  margin-top: 0.5rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/*  Notification  */
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

.notification.error,
.notification.logout {
  background-color: #f44336;
  color: white;
}

/* Responsive  */
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


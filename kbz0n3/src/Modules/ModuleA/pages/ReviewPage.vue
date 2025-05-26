<template>
  <div class="review-container">
    <div class="review-images-leftside">
      <img :src="images[0]" alt="product-image-left-one" v-if="images[0]">
      <img :src="images[1]" alt="product-image-left-two" v-if="images[1]">
    </div>

    <form @submit.prevent="postReview" class="review-form">
      <h2>Leave a Review</h2>
      <label>
        <p>Name (min 4 characters)</p>
        <input type="text" v-model="name" @input="validateName">
        <div class="error" v-if="errors.name">{{ errors.name }}</div>
      </label>

      <label>
        <p>Punctuation (0-10)</p>
        <input type="number" v-model="punctuation" min="0" max="10" @input="validatePunctuation">
        <div class="error" v-if="errors.punctuation">{{ errors.punctuation }}</div>
      </label>

      <label>
        <p>Review Type</p>
        <select v-model="typeofreview" @change="handleReviewTypeChange">
          <option value="Establishment">Establishment</option>
          <option value="Product">Product</option>
        </select>
      </label>

      <label v-if="typeofreview === 'Product'">
        <p>Product Name</p>
        <input type="text" v-model="productName" @input="validateProductName">
        <div class="error" v-if="errors.productName">{{ errors.productName }}</div>
      </label>

      <label>
        <p>Review (min 10 characters)</p>
        <textarea v-model="review" @input="validateReview"></textarea>
        <div class="error" v-if="errors.review">{{ errors.review }}</div>
      </label>

      <button type="submit" :disabled="submitDisabled">Submit Review</button>
      <router-link to="/reviewdata"><p>Go to Review Database</p></router-link>
    </form>
    <div class="review-images-rightside">
      <img :src="images[2]" alt="product-image-left-one" v-if="images[2]">
      <img :src="images[3]" alt="product-image-left-two" v-if="images[3]">
    </div>
    <div v-if="notificationMessage" class="notification" :class="notificationType">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      DNI: "",
      typeofreview: "Establishment",
      productName: "",
      punctuation: null,
      review: "",
      errors: {},
      submitDisabled: true,
      images: [],
      notificationMessage: "", 
      notificationType: "", 
    };
  },
  methods: {
    async postReview() {
      if (!this.validateForm()) return;

      try {
        let apiUrl = `http://localhost:8000/api/reviews`;

        if (this.typeofreview === "Product") {
          const productCheckUrl = `http://localhost:8000/api/products/search/?name=${this.productName}`;
          const response = await axios.get(productCheckUrl);

          if (!response.data || response.data.length === 0) {
            this.errors.productName = "Product not found in API.";
            return;
          }
        }

        const reviewData = {
          name: this.name.trim(),
          DNI: this.DNI,
          TypeOfReview: this.typeofreview === "Product" ? this.productName.trim() : "Establishment",
          punctuation: this.punctuation,
          review: this.review.trim(),
        };

        await axios.post(apiUrl, reviewData);
        console.log("Review submitted successfully");

        this.errors = {};
        this.punctuation = null;
        this.review = "";
        this.submitDisabled = true;
        this.showNotification("Review sent, thank you very much!", "success");

      } catch (error) {
        console.error("Error submitting review:", error);
      }
    },
    async getUserInfo() {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) return;

        const apiUrl = `http://localhost:8000/api/users/search/${storedUsername}`;
        const response = await axios.get(apiUrl);

        if (response.data) {
          this.name = response.data.name || "";
          this.DNI = response.data.DNI || "";
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    },

    showNotification(message, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      
      setTimeout(() => {
        this.notificationMessage = "";
        this.notificationType = "";
      }, 3000);
    },

    validateForm() {
      this.validateName();
      this.validatePunctuation();
      this.validateReview();
      if (this.typeofreview === "Producto") this.validateProductName();

      this.submitDisabled = Object.keys(this.errors).length > 0;
      return this.submitDisabled === false;
    },
    validateName() {
      if (this.name.replace(/\s/g, "").length < 4) {
        this.errors.name = "Name must be at least 4 characters (excluding spaces).";
      } else {
        delete this.errors.name;
      }
      this.updateSubmitDisabled();
    },
    validatePunctuation() {

  if (this.punctuation === null || this.punctuation === "" || isNaN(this.punctuation)) {

    this.errors.punctuation = "Punctuation must be a valid number.";

  } else {
    
    this.punctuation = Number(this.punctuation);

    if (this.punctuation < 1) {
      this.punctuation = 1;
    }
    else if (this.punctuation > 10) {
      this.punctuation = 10;
    }

    delete this.errors.punctuation;
  }
  this.updateSubmitDisabled();
},

    validateReview() {
      if (this.review.replace(/\s/g, "").length < 10) {
        this.errors.review = "Review must be at least 10 characters (excluding spaces).";
      } else {
        delete this.errors.review;
      }
      this.updateSubmitDisabled();
    },
    validateProductName() {
      if (this.productName.trim().length < 3) {
        this.errors.productName = "Product name must be at least 3 characters.";
      } else {
        delete this.errors.productName;
      }
      this.updateSubmitDisabled();
    },
    handleReviewTypeChange() {
      if (this.typeofreview === "Establishment") {
        this.productName = "";
        delete this.errors.productName;
      }
    },
    updateSubmitDisabled() {
      this.submitDisabled = Object.keys(this.errors).length > 0;
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
    this.getUserInfo();
    this.getImage();
  }
};
</script>

<style>
/* Importación de fuente */
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/* Contenedor principal de reseñas */
.review-container {
  height: 90vh;
  margin: 8rem 0;
  display: flex;
  justify-content: space-around;
}

/* Imágenes de reseñas */
.review-container img {
  width: 18rem;
  height: 18rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  border-radius: 50%;
  object-fit: cover;
}

.review-container .review-images-leftside img {
  margin-left: 15rem;
}

.review-container .review-images-rightside img {
  margin-right: 15rem;
}

/* Formulario de reseñas */
.review-form {
  width: 400px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  text-align: center;
  font-family: "Keania One", sans-serif;
}

/* Inputs, textareas y selects */
.review-container input,
.review-container textarea,
.review-container select {
  width: 20rem;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: "Keania One", sans-serif;
}

/* Botón de envío */
.review-container button {
  margin-top: 10px;
  padding: 10px;
  background-color: #00E5FF;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: "Keania One", sans-serif;
}

.review-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Mensajes de error */
.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* Notificaciones */
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

/* Responsive */
@media screen and (max-width: 1024px) {
  .review-container {
    flex-direction: column;
    align-items: center;
    margin: 5rem 0 20rem;
  }

  .review-container .review-images-leftside img,
  .review-container .review-images-rightside img {
    display: none;
  }

  .review-form {
    width: 90%;
    max-width: 500px;
    padding: 20px;
  }

  .review-container input,
  .review-container textarea,
  .review-container select {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
  }

  .review-container button {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
  }
}

@media screen and (max-width: 600px) {
  .review-form {
    width: 90%;
    padding: 15px;
  }

  .review-container input,
  .review-container textarea,
  .review-container select {
    width: 100%;
    padding: 10px;
    margin-top: 8px;
  }

  .review-container button {
    width: 100%;
    padding: 12px;
    font-size: 1.2rem;
  }
}

</style>

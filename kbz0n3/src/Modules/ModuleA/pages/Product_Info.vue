<template>
  <div class="productinfo-container">
    <div class="productinfo-leftside">
      <img :src="image" alt="Image from API KBZ0N3" class="productinfo-image">
      <button @click="toggleFavorite" :class="['productinfo-btn-favorite', isFavorite ? 'favorite' : 'not-favorite']">
        {{ isFavorite ? '💔 Remove favorite' : '❤️ Add favorite' }}
      </button>
      <label for="quantity-input" class="productinfo-sr-only">Quantity to add or remove</label>
      <div class="productinfo-cart-controls">
        <button @click="decreaseQuantity" class="productinfo-btn-quantity">➖</button>
        <input type="number" id="quantity-input" v-model.number="quantityInput" min="0" class="productinfo-quantity-input" />
        <button @click="increaseQuantity" class="productinfo-btn-quantity">➕</button>
        </div>
        <div class="productinfo-add-remove-cart">
          <button @click="addToCart" class="productinfo-btn-add">Add</button>
          <button @click="removeFromCart" class="productinfo-btn-remove" :disabled="cartQuantity === 0">Remove</button>
        </div>
        <p><strong>Quantity in cart:</strong> {{ cartQuantity }}</p>
    </div>

    <div class="productinfo-rightside">
      <div class="productinfo-titlename">
        <h2>{{ name }}</h2>
      </div>

      <div class="productinfo-info-group">
        <div class="productinfo-titlegroup">
          <h3><strong>Price</strong></h3>
          <h3><strong>Allergens</strong></h3>
        </div>
        <div class="productinfo-infogroup">
          <p>${{ price }}</p>
          <p>{{ allergens }}</p>
        </div>
      </div>

      <div class="productinfo-info-group">
        <div class="productinfo-titlegroup">
          <h3><strong>Diet</strong></h3>
          <h3><strong>Main meals</strong></h3>
        </div>
        <div class="productinfo-infogroup">
          <p>{{ diet }}</p>
          <p>{{ main_meals }}</p>
        </div>
      </div>

      <div class="productinfo-description">
        <h3 class="productinfo-descriptiontitle"><strong>Description</strong></h3>
        <p>{{ description }}</p>
      </div>
    </div>
  </div>

  <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: "",
      price: "",
      description: "",
      image: "",
      allergens: "",
      diet: "",
      cartQuantity: 0,
      productId: 1,
      quantityInput: 0,
      TypeOfProduct:"",
      main_meals:"", 
      isFavorite: false,
      notification: {
        show: false,
        message: "",
        type: "", 
      },
    };
  },
  methods: {
    async getProductInfo() {
      try {
        this.productId = localStorage.getItem('selectedProduct');
        const response = await axios.get(`http://localhost:8000/api/product/${this.productId}`);

        if (response.data) {
          this.name = response.data.name;
          this.price = response.data.price;
          this.description = response.data.description;
          this.image = response.data.image;
          this.allergens = response.data.allergens;
          this.diet = response.data.diet;
          this.TypeOfProduct=response.data.TypeOfProduct;
          this.main_meals=response.data.main_meals;
        }

        await this.fetchCartQuantity();
      } catch (error) {
        console.error("Error fetching product information:", error);
      }
    },

    async fetchCartQuantity() {
      try {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) return;

        const responseUser = await axios.get(`http://localhost:8000/api/users/search/${storedUsername}`);
        const username = responseUser.data.id.toString();

        const responseCart = await axios.get(`http://localhost:8000/api/shopping_cart/${username}/${this.productId}`);
        this.cartQuantity = responseCart.data.amount || 0;
      } catch (error) {
        this.cartQuantity = 0;
      }
    },

    async addToCart() {
      if (this.quantityInput < 1) {
        this.showNotification("⚠️ Enter a valid amount.", "error");
        return;
      }

      try {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
          this.showNotification("⚠️ Requires login", "error");
          return;
        }

        const responseUser = await axios.get(`http://localhost:8000/api/users/search/${storedUsername}`);
        const username = responseUser.data.id.toString();
        const quantity = this.cartQuantity + this.quantityInput;
        const totalPrice = this.price * quantity;

        let existingCartItem = null;
        try {
          const responseCart = await axios.get(`http://localhost:8000/api/shopping_cart/${username}/${this.productId}`);
          existingCartItem = responseCart.data;
        } catch (error) {
          if (error.response && error.response.status === 404) {
            existingCartItem = null;
          }
        }

        if (existingCartItem) {
          const updatedQuantity = existingCartItem.amount + this.quantityInput;
          await axios.put(`http://localhost:8000/api/shopping_cart/${existingCartItem.id}`, {
            amount: updatedQuantity,
            total_price: updatedQuantity * this.price
          });
          this.showNotification(`+${this.quantityInput} ${this.name} added. Now you have ${updatedQuantity}.`, "success");
        } else {
          await axios.post("http://localhost:8000/api/shopping_cart", {
            user_id: username,
            product_id: this.productId,
            amount: this.quantityInput,
            total_price: totalPrice
          });
          this.showNotification(`+${this.quantityInput} ${this.name} added to cart.`, "success");
        }
        this.quantityInput = 0;
        this.fetchCartQuantity();
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },

    async removeFromCart() {
      if (this.quantityInput < 1) {
        this.showNotification("⚠️ Enter a valid amount.", "error");
        return;
      }

      try {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
          this.showNotification("⚠️ Requires login", "error");
          return;
        }

        const responseUser = await axios.get(`http://localhost:8000/api/users/search/${storedUsername}`);
        const username = responseUser.data.id.toString();

        const existingCartItem = await axios.get(`http://localhost:8000/api/shopping_cart/${username}/${this.productId}`);
        if (!existingCartItem.data) {
          this.showNotification("Item not found in cart!", "error");
          return;
        }

        const currentQuantity = existingCartItem.data.amount;
        if (this.quantityInput >= currentQuantity) {
          await axios.delete(`http://localhost:8000/api/shopping_cart/${existingCartItem.data.id}`);
          this.cartQuantity = 0;
          this.showNotification(`-${currentQuantity} ${this.name} removed. No longer in your cart.`, "error");
        } else {
          const updatedQuantity = currentQuantity - this.quantityInput;
          await axios.put(`http://localhost:8000/api/shopping_cart/${existingCartItem.data.id}`, {
            amount: updatedQuantity,
            total_price: updatedQuantity * this.price,
          });
          this.showNotification(`-${this.quantityInput} ${this.name} removed. Now you have ${updatedQuantity}.`, "error");
        }
        this.quantityInput = 0;
        this.fetchCartQuantity();
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    },
    showNotification(message, type) {
      this.notification.message = message;
      this.notification.type = type;
      this.notification.show = true;
      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },
        async checkIfFavorite() {
      try {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) return;

        const responseUser = await axios.get(`http://localhost:8000/api/users/search/${storedUsername}`);
        const userData = responseUser.data;
        const favoriteField = this.TypeOfProduct === 'Food' ? 'fav_food' : 'fav_drink';
        this.isFavorite = userData[favoriteField] === this.productId;
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    },
    async toggleFavorite() {
  try {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      this.showNotification("⚠️ Requires login", "error");
      return;
    }

    const responseUser = await axios.get(`http://localhost:8000/api/users/search/${storedUsername}`);
    const userData = responseUser.data;
    const favoriteField = this.TypeOfProduct === 'Food' ? 'fav_food' : 'fav_drink';
    const newFavoriteValue = this.isFavorite ? "nothing" : this.productId;

    await axios.put(`http://localhost:8000/api/users/${userData.id}`, {
      ...userData,
      [favoriteField]: newFavoriteValue,
    });

    this.isFavorite = !this.isFavorite;
    this.showNotification(
      this.isFavorite ? `✅ ${this.name} marked as favorite!` : `❌ ${this.name} removed from favorites.`,
      this.isFavorite ? "success" : "error" // 
    );
  } catch (error) {
    console.error("Error setting favorite:", error);
    this.showNotification("⚠️ Error al marcar favorito.", "error");
  }
}
,
  increaseQuantity() {
    this.quantityInput++; 
  },

  decreaseQuantity() {
    if (this.quantityInput > 0) {
      this.quantityInput--; 
    }
  },
  },
  mounted() {
    this.getProductInfo();
    this.checkIfFavorite();
  }
};
</script>

<style>

/* Importación de fuente */

@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/* Reset de estilos */

* {
    margin: 0;
    padding: 0;
}


/* Contenedor principal */

.productinfo-container {
    margin-top: 6rem;
    margin-bottom: 5rem;
    min-height: 80vh;
    display: flex;
    justify-content: space-between;
    gap: 3rem;
    font-family: "Keania One", sans-serif;
}

/* Lado izquierdo */

.productinfo-leftside {
    width: 30%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.productinfo-image {
    width: 12rem;
    height: 12rem;
    margin-top: 2rem;
    object-fit: cover;
    border-radius: 1rem;
    border: 0.2rem solid black;
}

/* Botones de favoritos */

.productinfo-btn-favorite {
    width: 12rem;
    height: 2rem;
    margin-top: 1rem;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: black;
    border-radius: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-family: "Keania One", sans-serif;
}

.productinfo-btn-favorite.favorite {
    background-color: rgb(220, 53, 69);
}

.productinfo-btn-favorite.not-favorite {
    background-color: rgb(0, 206, 0);
}

/* Controles del carrito */

.productinfo-cart-controls {
    margin: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.productinfo-btn-quantity,
.productinfo-quantity-input,
.productinfo-btn-add,
.productinfo-btn-remove {
    width: 5rem;
    height: 2rem;
    border-radius: 1rem;
    margin: 1rem;
    font-family: "Keania One", sans-serif;
}

.productinfo-btn-quantity,
.productinfo-quantity-input {
    background-color: #D9D9D9;
}

.productinfo-quantity-input {
    width: 5rem;
    text-align: center;
}

.productinfo-btn-add {
    width: 5rem;
    background-color: #28a745;
    color: black;
}

.productinfo-btn-remove {
    width: 5rem;
    background-color: #dc3545;
    color: black;
}

.productinfo-btn-remove:disabled {
    background-color: gray;
    cursor: not-allowed;
}

/* Lado derecho */

.productinfo-rightside {
    width: 60%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.productinfo-titlename h2 {
    width: 40rem;
    height: 4rem;
    font-size: 2rem;
    margin-bottom: 3rem;
    padding: 1rem;
    background-color: #D9D9D9;
    border-radius: 1rem;
    text-align: center;
}

/* Grupos de información */

.productinfo-info-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

.productinfo-titlegroup,
.productinfo-infogroup {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.productinfo-titlegroup h3 {
    width: 10rem;
    margin: 0 5rem;
    padding: 0.5rem;
    background-color: #D9D9D9;
    border-radius: 0.5rem;
    text-align: center;
    font-size: 1.5rem;
}

.productinfo-infogroup {
    text-align: center;
    font-size: 1.5rem;
}

/* Descripción del producto */

.productinfo-description {
    width: 40rem;
    height: 10rem;
    margin-top: 1rem;
    padding: 1rem;
    background-color: #D9D9D9;
    border-radius: 1rem;
}

.productinfo-descriptiontitle {
    margin-top: 0;
    font-size: 1.5rem;
}

/* Notificaciones */

.notification {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.notification.success {
    background-color: #28a745;
}

.notification.error {
    background-color: #dc3545;
}


/* Responsive*/

@media (max-width: 600px) {
    .productinfo-container {
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        gap: 2rem;
    }

    .productinfo-leftside,
    .productinfo-rightside {
        width: 100%;
        align-items: center;
    }

    .productinfo-image {
        width: 10rem;
        height: 10rem;
    }

    .productinfo-btn-favorite {
        width: 100%;
        padding: 0.5rem;
        font-size: 0.9rem;
        text-align: center;
    }

    .productinfo-cart-controls {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .productinfo-quantity-input {
        width: 4rem;
        font-size: 0.9rem;
    }

    .productinfo-btn-quantity,
    .productinfo-btn-add,
    .productinfo-btn-remove {
        width: 4rem;
        font-size: 0.9rem;
    }

    .productinfo-titlename h2,
    .productinfo-description {
        width: 100%;
        font-size: 1.2rem;
        padding: 0.5rem;
    }

    .productinfo-titlegroup h3 {
        width: 80%;
        margin: 0 auto;
        font-size: 1.1rem;
    }

    .productinfo-descriptiontitle {
        font-size: 1.2rem;
        text-align: center;
    }

    .notification {
        top: 70px;
        font-size: 0.9rem;
        padding: 0.6rem 1rem;
    }
}

</style>

<template>
  <div class="homepage-notifications-container">
    <div v-for="notification in notifications" :key="notification.id" 
         :class="['homepage-notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
  <div class="Homepage">
    <h1 class="homepage-title">Search Products</h1>
    <form @submit.prevent="fetchProducts" class="homepage-filter-form">
      <div class="homepage-filter-group">
        <label for="search-name">Name</label>
        <input type="text" id="search-name" v-model="filters.name" class="homepage-filter-input" placeholder="Search Name">
      </div>

      <div class="homepage-filter-group">
        <label for="main-meals">Main Meals</label>
        <select id="main-meals" v-model="filters.main_meals" class="homepage-filter-input">
          <option v-for="meal in uniqueMainMeals" :key="meal" :value="meal">{{ meal }}</option>
        </select>
      </div>

      <div class="homepage-filter-group">
        <label for="diet">Diet</label>
        <select id="diet" v-model="filters.diet" class="homepage-filter-input">
          <option v-for="diet in uniqueDiets" :key="diet" :value="diet">{{ diet }}</option>
        </select>
      </div>

      <div class="homepage-filter-group">
        <label for="allergens">Allergens (Exclude)</label>
        <multiselect id="allergens" v-model="filters.allergens" :options="uniqueAllergens" 
          :multiple="true" :close-on-select="false" :clear-on-select="false" 
          placeholder="Select allergens" class="homepage-filter-input">
        </multiselect>
      </div>

      <div class="homepage-filter-group">
        <label for="price-range">Price Range: {{ filters.price }}</label>
        <input type="range" id="price-range" v-model="filters.price" min="1" max="50" class="homepage-filter-input">
      </div>

      <div class="homepage-filter-buttons">
        <div class="pagination" v-if="totalPages > 1">
          <button @click="prevPage" :disabled="currentPage === 1" class="homepage-pagination-button">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="homepage-pagination-button">Next</button>
        </div>
        <button type="button" @click="clearFilters" class="homepage-button">Clear</button>
      </div>
    </form>

    <div class="results">
      <p v-if="products.length === 0">No products found</p>
      <div v-else v-for="product in paginatedProducts" :key="product.id" class="product-card">
        <div class="product-header">
          <div v-if="isInCart(product.id)" class="cart-icon">
          <img src="../../../assets/icons/shoppingcart.png" class="homepage-cart-image" alt="shopping-cart-product"/>
        </div>
        </div>
        <div class="homepage-product-imagecart">
          <img :src="product.image" :alt="`Image of ${product.name}`"
            @click="saveProductName(product.id)"
            @error="onProductImageError"
            class="homepage-image-product">
        </div>
        <p>{{ product.name }}</p>
        <label :for="`quantity-${product.id}`" class="sr-only">Quantity</label>
        <div class="homepage-quantity-controls">
          <button @click="decreaseQuantity(product.id)" class="homepage-quantity-button">➖</button>
          <input type="number" :id="`quantity-${product.id}`" v-model="cart[product.id]" min="1" @input="updateQuantity(product.id)" class="homepage-quantity-input">
          <button @click="increaseQuantity(product.id)" class="homepage-quantity-button">➕</button>
        </div>
        <div>
          <button @click="addToCart(product)" class="homepage-product-button">Add</button>
          <button @click="removeFromCart(product.id, cart[product.id])" class="homepage-product-button" :disabled="!isInCart(product.id)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import defaultImage from '@/assets/icons/default-nothing.png';

export default {
  components: { Multiselect },
  data() {
    return {
      filters: {
        name: '',
        main_meals: '',
        diet: '',
        allergens: [],
        price: 50,
      },
      isLoggedIn: false,
      defaultImage: defaultImage,
      currentUser: null,
      products: [],
      cart: {}, 
      uniqueMainMeals: [],
      uniqueDiets: [],
      uniqueAllergens: [],
      currentPage: 1,
      itemsPerPage: 8,
      cartProductIds: [],
      notifications: []
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const matchesName =
          this.filters.name === '' ||
          product.name.toLowerCase().includes(this.filters.name.toLowerCase());

        const productMeal = product.main_meals || '';
        const selectedMeal = this.filters.main_meals;
        const matchesMeal =
          selectedMeal === '' ||
          selectedMeal === 'All' ||
          productMeal === 'All' ||
          productMeal === selectedMeal;

        const matchesDiet =
          this.filters.diet === '' || product.diet === this.filters.diet;

        const matchesPrice = product.price <= this.filters.price;

        const productAllergens = product.allergens
        ? product.allergens.split(',').map(a => a.trim().toLowerCase())
        : [];

        const matchesAllergens = this.filters.allergens.every(
        exclude => !productAllergens.includes(exclude.toLowerCase())
        );

        return (
          matchesName &&
          matchesMeal &&
          matchesDiet &&
          matchesPrice &&
          matchesAllergens
        );
      });
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredProducts.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }
  },
  methods: {
    onProductImageError(event) {
      event.target.src = this.defaultImage;
    },
    showNotification(message, type = 'success') {
      const id = Date.now();
      this.notifications.push({ id, message, type });

      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 3000);
    },
    async fetchProducts() {
      try {
        const response = await axios.get('https://kbz0n3api-despliegue.onrender.com/api/product/');
        this.products = response.data;

        const mainMealsSet = new Set();
        const dietsSet = new Set();
        const allergensSet = new Set();

        this.products.forEach(product => {
        if (product.main_meals) mainMealsSet.add(product.main_meals);
        if (product.diet) dietsSet.add(product.diet);
        if (product.allergens) {
          product.allergens.split(',').forEach(allergen => {
            const trimmed = allergen.trim().toLowerCase();
            if (trimmed && trimmed !== 'none') {
              allergensSet.add(trimmed);
            }
          });
        }
      });
      this.uniqueMainMeals = [...mainMealsSet];
      this.uniqueDiets = [...dietsSet];
      this.uniqueAllergens = [...allergensSet];
      this.currentPage = 1;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  },
    async fetchCart() {
      if (!this.currentUser) return;
      try {
        const userId = this.currentUser.id.toString();
        const cartResponse = await axios.get(`https://kbz0n3api-despliegue.onrender.com/api/shopping_cart/${userId}`);
        const cartData = cartResponse.data.data;
        this.cartProductIds = cartData.map(item => item.product_id);
      } catch (error) {
        console.error('Error al obtener el carrito', error);
      }
    },

    isInCart(productId) {
      return this.cartProductIds.includes(productId.toString());
    },

    increaseQuantity(productId) {
      if (!this.cart[productId]) {
        this.cart[productId] = 1;
      } else {
        this.cart[productId]++;
      }
    },
    decreaseQuantity(productId) {
      if (this.cart[productId] > 1) {
        this.cart[productId]--;
      }
    },
    updateQuantity(productId) {
      if (this.cart[productId] < 1) {
        this.cart[productId] = 1;
      }
    },

    async addToCart(product) {
      if (!this.isLoggedIn || !this.currentUser) {
        this.showNotification('⚠️ Requires login', 'error');
        return;
      }

      const userId = this.currentUser.id.toString();
      const quantity = this.cart[product.id] || 1;
      const totalPrice = product.price * quantity;

      try {
        let existingCartItem = null;
        try {
          const responseCart = await axios.get(`https://kbz0n3api-despliegue.onrender.com/api/shopping_cart/${userId}/${product.id}`);
          existingCartItem = responseCart.data;
        } catch (error) {
          if (error.response && error.response.status === 404) {
            existingCartItem = null;
          }
        }
        if (existingCartItem) {
          const updatedQuantity = existingCartItem.amount + quantity;
          await axios.put(`https://kbz0n3api-despliegue.onrender.com/api/shopping_cart/${existingCartItem.id}`, {
            amount: updatedQuantity,
            total_price: updatedQuantity * product.price
          });
          this.showNotification(`+${quantity} ${product.name} added. Now you have ${updatedQuantity}.`, 'success');
        } else {
          const cartData = {
            user_id: userId,
            product_id: product.id.toString(),
            amount: quantity,
            total_price: totalPrice
          };
          await axios.post('https://kbz0n3api-despliegue.onrender.com/api/shopping_cart', cartData);
          this.showNotification(`+${quantity} ${product.name} added to cart.`, 'success');
        }
        this.cart[product.id] = null;
        this.fetchCart();
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
      }
    },

    async removeFromCart(productId, quantityToRemove) {
      if (!this.isLoggedIn || !this.currentUser) {
        this.showNotification('⚠️ Requires login', 'error');
        return;
      }

      const userId = this.currentUser.id.toString();

      try {
        const existingCartItem = await axios.get(`https://kbz0n3api-despliegue.onrender.com/api/shopping_cart/${userId}/${productId}`);
        if (!existingCartItem.data) {
          alert('Item not found in cart!');
          return;
        }

        const product = this.products.find(p => p.id.toString() === productId.toString());
        const productName = product ? product.name : 'Unknown Product';

        const currentQuantity = existingCartItem.data.amount;

        if (quantityToRemove >= currentQuantity) {
          await axios.delete(`https://kbz0n3api-despliegue.onrender.com/api/shopping_cart/${existingCartItem.data.id}`);
          delete this.cart[productId];
          this.showNotification(`-${currentQuantity} ${productName} deleted. No longer in your cart.`, 'error');
        } else {
          const updatedQuantity = currentQuantity - quantityToRemove;
          await axios.put(`https://kbz0n3api-despliegue.onrender.com/api/shopping_cart/${existingCartItem.data.id}`, {
            amount: updatedQuantity,
            total_price: updatedQuantity * existingCartItem.data.total_price / currentQuantity
          });
          this.showNotification(`-${quantityToRemove} ${productName} removed. Now you have ${updatedQuantity}.`, 'error');
        }

        this.fetchCart();
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    },

    saveProductName(productName) {
      localStorage.setItem('selectedProduct', productName);
      this.$router.push('/product-info');
    },

    clearFilters() {
      this.filters = {
        name: '',
        main_meals: '',
        diet: '',
        allergens: [],
        price: 50,
      };
      this.currentPage = 1;
      this.fetchProducts();
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    }
  },
  async mounted() {
    await this.fetchProducts();
    this.showNotification('ℹ️ If you click on a product image, you can see its information.', 'info');

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('https://kbz0n3api-despliegue.onrender.com/api/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!data.error) {
          this.currentUser = data;
          this.isLoggedIn = true;
          await this.fetchCart();
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
      }
    }
  },
  watch: {
    filters: {
      handler() {
        this.currentPage = 1;
        this.fetchProducts();
      },
      deep: true
    }
  }
};
</script>


<style>
/* Importación de estilos externos */
@import "vue-multiselect/dist/vue-multiselect.min.css";
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/* Contenedor principal de la página */
.Homepage {
  max-width: 80vw;
  min-height: 105vh;
  margin: 0 auto;
  padding: 1rem;
  font-family: "Keania One", sans-serif;
  text-align: center;
}

.homepage-title {
  margin-top: 5rem;
  text-align: center;
}

/* Formulario de filtros */
.homepage-filter-form {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.homepage-filter-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.homepage-filter-group label{
  font-size: 1.2rem;
}
.homepage-filter-input {
  width: 14rem;
  height: 2.5rem;
  background-color: #F7F7F7;
  color: black;
  border-radius: 0.3rem;
  text-align: center;
  font-family: "Keania One", sans-serif;
}

.homepage-filter-input::placeholder,
.homepage-filter-group .multiselect__placeholder {
  color: black;
  opacity: 1;
}

/* Botones de filtro */
.homepage-filter-buttons {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  margin: 1rem auto;
}

.homepage-button {
  width: 5rem;
  align-self: center;
  margin-top: 1rem;
  background-color: #00E5FF;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
}

.homepage-button:hover {
  background-color: #0000ff;
  color: white;
}

/* Botón de producto */
.homepage-product-button {
  width: 5rem;
  height: 2.5rem;
  margin: 0.3rem 0.4rem;
  font-size: 0.9rem;
  border-radius: 1.875rem;
  background-color: #00E5FF;
  color: black;
  font-family: "Keania One", sans-serif;
}

/* Resultados */
.results {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.product-card {
  width: 20rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F7F7F7;
  padding: 1rem 0;
  text-align: center;
  border-radius: 1rem;
}

/* Imagen del producto */
.homepage-product-imagecart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 9rem;
  width: 9rem;
  overflow: hidden;
  border-radius: 1rem;
  border: 0.2rem solid black;
}
.homepage-cart-image {
  width: 2rem;  
  height: 2rem; 
}
.homepage-image-product{
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Controles de cantidad */
.homepage-quantity-controls {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.3rem;
  font-family: "Keania One", sans-serif;
}

.homepage-quantity-input {
  width: 3rem;
  text-align: center;
  padding: 0.3rem;
  border-radius: 0.4rem;
  font-family: "Keania One", sans-serif;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1.2rem;
}

.homepage-pagination-button {
  background-color: #00E5FF;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
}

.homepage-quantity-button {
  background-color: #00E5FF;
  border-radius: 1rem;
  width: 3rem;
}

/* Notificaciones */
.homepage-notifications-container {
  position: fixed;
  top: 7rem;
  right: 1.25rem;
  z-index: 1000;
}

.homepage-notification {
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
  border-radius: 0.3rem;
  color: black;
  font-weight: bold;
  box-shadow: 0 0.25rem 0.4rem rgba(0, 0, 0, 0.1);
}

.homepage-notification.success { background-color: #28a745; }
.homepage-notification.error { background-color: #dc3545; }
.homepage-notification.info { background-color: #17a2b8; }

/* Responsive */
@media screen and (max-width: 768px) {
  .Homepage { margin-bottom: 10rem; }
  .homepage-filter-input { width: 90vw; }
  .results { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
  .homepage-product-button { width: 40vw; height: 2.5rem; font-size: 0.8rem; }
  .homepage-image-product { max-width: 100%; }
  .homepage-button, .homepage-pagination-button { width: 40vw; font-size: 0.9rem; }
  .homepage-product-imagecart { height: 8rem; width: 8rem; }
}
</style>
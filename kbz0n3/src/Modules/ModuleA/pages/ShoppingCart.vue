<template> 
  <div class="shoppingcart-page">
    <h2>Shopping Cart</h2>
    <div class="shoppingcart-columns">
      <div class="shoppingcart-column-food" >
        <h3>Food</h3>
        <ul v-if="paginatedFood.length" class="shoppingcart-ul">
          <li v-for="item in paginatedFood" :key="item.id" class="shoppingcart-li">
            <img :src="item.image" alt="Product-image" class="shoppingcart-product-image" />
            <div class="shoppingcart-product-info">
              <label :for="'product-' + item.id"><strong>{{ item.product_name || "Loading..." }}</strong></label>
              <p class="product-price">Price: ${{ (item.total_price).toFixed(2) }}</p>
              <div class="shoppingcart-action-group">
                <div class="shoppingcart-quantity-controls">
                  <button @click="alterQuantity(item, -1)" class="shoppingcart-button-quantity">➖</button>
                  <input 
                    type="number" 
                    v-model="item.amount" 
                    min="1" 
                    class="shoppingcart-quantity-input" 
                    readonly 
                    :id="'product-' + item.id" />
                  <button @click="alterQuantity(item, 1)" class="shoppingcart-button-quantity">➕</button>
                </div>
              </div>
              <button @click="deleteItem(item, 'food')" class="shoppingcart-delete-btn">Delete</button>
            </div>
          </li>
        </ul>
        <p v-else>There are no food items in the cart.</p>
        <div class="shoppingcart-pagination-controls" v-if="food.length">
          <button @click="prevPage('food')" :disabled="isFirstFoodPage" class="shoppingcart-button-pagination">Previous</button>
          <span class="shoppingcart-page-info">Page {{ foodPage + 1 }} of {{ totalFoodPages }}</span>
          <button @click="nextPage('food')" :disabled="isLastFoodPage" class="shoppingcart-button-pagination">Next</button>
        </div>
      </div>
      <div class="shoppingcart-column-drink">
        <h3>Drinks</h3>
        <ul v-if="paginatedDrinks.length" class="shoppingcart-ul">
          <li v-for="item in paginatedDrinks" :key="item.id" class="shoppingcart-li">
            <img :src="item.image" alt="Product-image" class="shoppingcart-product-image" />
            <div class="shoppingcart-product-info">
              <label :for="'product-' + item.id"><strong>{{ item.product_name || "Loading..." }}</strong></label>
              <p class="product-price">Price: ${{ (item.total_price).toFixed(2) }}</p>
              <div class="shoppingcart-action-group">
                <div class="shoppingcart-quantity-controls">
                  <button @click="alterQuantity(item, -1)" class="shoppingcart-button-quantity">➖</button>
                  <input 
                    type="number" 
                    v-model="item.amount" 
                    min="1" 
                    class="shoppingcart-quantity-input" 
                    readonly 
                    :id="'product-' + item.id" />
                  <button @click="alterQuantity(item, 1)" class="shoppingcart-button-quantity">➕</button>
                </div>
              </div>
              <button @click="deleteItem(item, 'drink')" class="shoppingcart-delete-btn">Delete</button>
            </div>
          </li>
        </ul>
        <p v-else>There are no beverage products in the cart.</p>
        <div class="shoppingcart-pagination-controls" v-if="drinks.length">
          <button @click="prevPage('drink')" :disabled="isFirstDrinkPage" class="shoppingcart-button-pagination">Previous</button>
          <span class="shoppingcart-page-info">Page {{ drinkPage + 1 }} of {{ totalDrinkPages }}</span>
          <button @click="nextPage('drink')" :disabled="isLastDrinkPage" class="shoppingcart-button-pagination">Next</button>
        </div>
      </div>
    </div>

    <div class="shoppingcart-total-container">
      <h3>Total: ${{ calculateTotal([...food, ...drinks]) }}</h3>
    </div>

    <div class="button-container">
      <button @click="clearCategory('food')" class="shoppingcart-button-clean" :disabled="food.length === 0">Clean Food</button>
      <button @click="openAddressPopup" class="shoppingcart-button-confirm">Confirm and Empty Cart</button>
      <button @click="clearCategory('drink')" class="shoppingcart-button-clean" :disabled="drinks.length === 0">Clean Drink</button>
    </div>
  </div>

  <div v-if="showAddressPopup" class="shoppingcart-popup-overlay">
    <div class="shoppingcart-popup-content">
      <label for="pop-up"><h3>Enter your address</h3></label>
      <input type="text" :value="useradress" placeholder="Enter your address" id="pop-up"/>
      <button @click="confirmAddress">Confirm</button>
      <button @click="closeAddressPopup">Cancel</button>
    </div>
  </div>

  <div v-if="notificationMessage" class="notification" :class="notificationType">
    {{ notificationMessage }}
  </div>
</template>


<script>
import { ref, onMounted,computed } from "vue";
import axios from "axios";

export default {
  setup() {
    const food = ref([]);
    const drinks = ref([]);
    const foodPage = ref(0);
    const drinkPage = ref(0);
    const itemsPerPage = 3;
    const showAddressPopup = ref(false);
    const useradress = ref("");
    const notificationMessage = ref("");
    const notificationType = ref("");

    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response2 = await fetch("http://localhost:8000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response2.json();
        const userId = data.id
        useradress.value = data.adress;
        const response = await axios.get(`http://localhost:8000/api/shopping_cart/${userId}`);
        const cartData = response.data.data;

        const updatedCart = await Promise.all(
          cartData.map(async (item) => {
            try {
              const productResponse = await axios.get(`http://localhost:8000/api/product/${item.product_id}`);
              const product = productResponse.data;
              return { 
                ...item, 
                product_name: product.name, 
                image: product.image, 
                type: product.TypeOfProduct,
                total_price: parseFloat(item.total_price) || 0
              };
            } catch (error) {
              console.error(`Error obteniendo el producto ${item.product_id}:`, error);
              return { ...item, product_name: "Producto no encontrado", image: '', type: '', total_price: 0 };
            }
          })
        );

        food.value = updatedCart.filter(item => item.type === "Food");
        drinks.value = updatedCart.filter(item => item.type === "Drink");

      } catch (error) {
        console.error("Error obteniendo el carrito:", error);
      }
    };

    const alterQuantity = async (item, change) => {
      const oldAmount = item.amount;
      const newAmount = item.amount + change;
      if (newAmount < 1) return; 
      item.amount = newAmount;

      const newTotalPriceitem = (item.total_price / oldAmount) * newAmount;

      try {
        await axios.put(`http://localhost:8000/api/shopping_cart/${item.id}`, {
          amount: item.amount,
          total_price: newTotalPriceitem
        });

        if (item.type === "Food") {
          food.value = [...food.value];
        } else {
          drinks.value = [...drinks.value];
        }
        await fetchCart();
      } catch (error) {
        console.error("Error actualizando la cantidad en el carrito:", error);
      }
    };

    const deleteItem = async (item, category) => {
      try {
        await axios.delete(`http://localhost:8000/api/shopping_cart/${item.id}`);

        if (category === 'food') {
          food.value = food.value.filter(i => i.id !== item.id);
        } else if (category === 'drink') {
          drinks.value = drinks.value.filter(i => i.id !== item.id);
        }
        showNotification(`Deleted product`, "delete");
      } catch (error) {
        console.error("Error eliminando el producto del carrito:", error);
      }
    };

    const clearCategory = async (category) => {
      try {
        if (category === 'food') {
          for (const item of food.value) {
            await axios.delete(`http://localhost:8000/api/shopping_cart/${item.id}`);
          }
          food.value = [];
        } else if (category === 'drink') {
          for (const item of drinks.value) {
            await axios.delete(`http://localhost:8000/api/shopping_cart/${item.id}`);
          }
          drinks.value = [];
        }
        showNotification(`Cleaned category`, "delete");
      } catch (error) {
        console.error("Error eliminando los productos de la categoría:", error);
      }
    };

    const calculateTotal = (category) => {
      const total = category.reduce((acc, item) => {
        return acc + (typeof item.total_price === "number" && !isNaN(item.total_price) ? item.total_price : 0);
      }, 0);
      return total.toFixed(2); 
    };

    const openAddressPopup = () => {
      showAddressPopup.value = true;
    };

    const closeAddressPopup = () => {
      showAddressPopup.value = false;
    };

    const confirmAddress = async () => {
      try {
        const cartItems = [...food.value, ...drinks.value];
        for (const item of cartItems) {
          await axios.delete(`http://localhost:8000/api/shopping_cart/${item.id}`);
        }

        food.value = [];
        drinks.value = [];
        closeAddressPopup();
        showNotification(`Confirmed address: ${useradress.value}`, "success");
      } catch (error) {
        console.error("Error confirmando la dirección:", error);
      }
    };

    const paginatedFood = computed(() => {
      const start = foodPage.value * itemsPerPage;
      return food.value.slice(start, start + itemsPerPage);
    });

    const paginatedDrinks = computed(() => {
      const start = drinkPage.value * itemsPerPage;
      return drinks.value.slice(start, start + itemsPerPage);
    });

    const totalFoodPages = computed(() => Math.ceil(food.value.length / itemsPerPage));
    const totalDrinkPages = computed(() => Math.ceil(drinks.value.length / itemsPerPage));

    const isFirstFoodPage = computed(() => foodPage.value === 0);
    const isLastFoodPage = computed(() => foodPage.value >= totalFoodPages.value - 1);
    
    const isFirstDrinkPage = computed(() => drinkPage.value === 0);
    const isLastDrinkPage = computed(() => drinkPage.value >= totalDrinkPages.value - 1);

    const nextPage = (category) => {
      if (category === 'food' && (foodPage.value + 1) * itemsPerPage < food.value.length) {
        foodPage.value++;
      } else if (category === 'drink' && (drinkPage.value + 1) * itemsPerPage < drinks.value.length) {
        drinkPage.value++;
      }
    };

    const prevPage = (category) => {
      if (category === 'food' && foodPage.value > 0) {
        foodPage.value--;
      } else if (category === 'drink' && drinkPage.value > 0) {
        drinkPage.value--;
      }
    };

    const showNotification = (message, type) => {
      notificationMessage.value = message;
      notificationType.value = type;

      setTimeout(() => {
        notificationMessage.value = "";
        notificationType.value = "";
      }, 3000);
    };

    onMounted(fetchCart);

    return { 
      food, 
      drinks, 
      deleteItem, 
      clearCategory, 
      calculateTotal, 
      alterQuantity, 
      openAddressPopup, 
      closeAddressPopup, 
      confirmAddress, 
      showAddressPopup, 
      useradress,
      notificationMessage,
      notificationType,
      paginatedFood, 
      paginatedDrinks, 
      nextPage, 
      prevPage,
      foodPage,
      drinkPage,
      isFirstFoodPage,
      isLastFoodPage,
      isFirstDrinkPage,
      isLastDrinkPage,
      totalFoodPages,
      totalDrinkPages, 
    };
  },
};
</script>
  
<style>
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/* Página principal del carrito */
.shoppingcart-page {
  font-family: "Keania One", sans-serif;
  margin: 8rem 0;
  min-height: 80vh;
}

/* Títulos */
h2 {
  color: #333;
  text-align: center;
}

/* Columnas principales */
.shoppingcart-columns {
  display: flex;
  justify-content: center;
  gap: 2rem; 
  margin-top: 20px;
  flex-wrap: wrap;
}


/* Tarjetas de comida/bebida */
.shoppingcart-column-food,
.shoppingcart-column-drink {
  flex: 1 1 45%; 
  max-width: 45%;
  min-width: 300px; 
  background-color: #F7F7F7;
  padding: 1rem;
  border-radius: 5px;
  box-sizing: border-box;
}
.shoppingcart-column-food h3,
.shoppingcart-column-drink h3 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}
.shoppingcart-action-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5rem;
}


/* Imagen del producto */
.shoppingcart-product-image {
  height: 5rem;
  width: 5rem;
  margin: 1rem;
  object-fit: cover;
  border-radius: 1rem;
  border: 0.2rem solid black;
  flex-shrink: 0;
}

/* Lista de productos */
.shoppingcart-ul {
  list-style-type: none;
  padding: 0;
  
}

.shoppingcart-li {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  padding: 10px;
  max-width: 50rem;
  background: white;
  border-radius: 5px;
}
.shoppingcart-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.shoppingcart-pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center; 
  margin-top: 1rem; 
  gap: 1rem; 
}

/* Controles de cantidad */
.shoppingcart-quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.shoppingcart-quantity-input {
  width: 3rem;
  text-align: center;
  padding: 0.3rem;
  margin: 0 10px;
  border-radius: 0.4rem;
  font-family: "Keania One", sans-serif;
}

.shoppingcart-button-quantity {
  cursor: pointer;
  padding: 5px 10px;
  background-color: #F7F7F7;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
}

/* Botones de acción */
.button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.shoppingcart-button-confirm {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20rem;
  margin-top: 20px;
  padding: 10px;
  background-color: #4CAF50;
  color: black;
  border: none;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  font-family: "Keania One", sans-serif;
}

.shoppingcart-button-confirm:hover {
  background-color: #45a049;
}

.shoppingcart-button-pagination,
.shoppingcart-button-clean {
  margin: auto 1rem;
  background-color: #00E5FF;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
}

.shoppingcart-button-clean:hover {
  background-color: #019bac;
}
.shoppingcart-button-pagination:disabled,
.shoppingcart-button-clean:disabled {
  background-color: #F7F7F7;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Botones específicos */
.shoppingcart-delete-btn {
  width: 5rem;
  background-color: #dc3545;
  color: white;
  font-family: "Keania One", sans-serif;
  border-radius: 0.3rem;
  align-self: center; 
}

.shoppingcart-clear-btn {
  background-color: #28a745;
  margin-top: 10px;
}

/* Totales */
.shoppingcart-total-container,
.shoppingcart-total {
  text-align: center;
  margin-top: 20px;
}

.shoppingcart-total {
  font-size: 1.2em;
  font-weight: bold;
}

/* Texto general */
strong {
  font-size: 1.2em;
}

p {
  margin: 5px 0;
}

/* Popup de confirmación */
.shoppingcart-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Keania One", sans-serif;
}

.shoppingcart-popup-overlay button {
  font-family: "Keania One", sans-serif;
  border-radius: 1rem;
  margin: 1rem;
  height: 2rem;
  width: 5rem;
}

.shoppingcart-popup-overlay input {
  font-family: "Keania One", sans-serif;
  border-radius: 1rem;
}

.shoppingcart-popup-content {
  background-color: #D9D9D9;
  padding: 40px;
  border-radius: 5px;
  width: 300px;
  text-align: center;
}

.shoppingcart-popup-content input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Notificaciones */
.notification {
  width: 10rem;
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
  color: black;
}

.notification.delete {
  background-color: #f44336;
  color: white;
}

/* Responsive */
@media screen and (max-width: 768px) {
  .shoppingcart-columns {
    flex-direction: column;
    align-items: center;
  }

  .shoppingcart-column-food,
  .shoppingcart-column-drink {
    width: 90%;
    margin-bottom: 2rem;
  }

  .shoppingcart-li {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .shoppingcart-product-image {
    margin-bottom: 0.5rem;
  }

  .shoppingcart-quantity-controls {
    flex-direction: row;
    justify-content: center;
  }
  .shoppingcart-pagination-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .shoppingcart-page-info {
    font-size: 0.9rem;
    text-align: center;
  }
  .button-container {
    flex-direction: column;
    align-items: center;
  }

  .shoppingcart-button-confirm {
    width: 90%;
  }

  .shoppingcart-popup-content {
    width: 90%;
  }

  .notification {
    width: 80%;
    right: 10%;
  }
}
</style>
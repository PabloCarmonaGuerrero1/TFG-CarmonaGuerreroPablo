<template>
  <div class="admin-notifications-container">
    <div v-for="notification in notifications" :key="notification.id" 
         :class="['admin-notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
  <div class="admin-page">
    <form class="admin-selector">
      <label class="admin-tittle">Admin Options</label>
      <select v-model="admin_selection" @change="handleModeChange" class="admin-options">
        <option value="edit">Edit</option>
        <option value="add">Add</option>
      </select>
    </form>

    <div v-if="admin_selection === 'edit' && !selectedProduct">
      <form @submit.prevent class="admin-filter-form">
        <div class="admin-filter-group">
          <label for="search-name">Name</label>
          <input type="text" id="search-name" v-model="filters.name" class="admin-filter-input" placeholder="Search Name" />
        </div>

        <div class="admin-filter-group">
          <label for="main-meals">Main Meals</label>
          <select id="main-meals" v-model="filters.main_meals" class="admin-filter-input">
            <option v-for="meal in uniqueMainMeals" :key="meal" :value="meal">{{ meal }}</option>
          </select>
        </div>

        <div class="admin-filter-group">
          <label for="diet">Diet</label>
          <select id="diet" v-model="filters.diet" class="admin-filter-input">
            <option v-for="diet in uniqueDiets" :key="diet" :value="diet">{{ diet }}</option>
          </select>
        </div>

        <div class="admin-filter-group">
          <label for="allergens">Allergens (Exclude)</label>
          <multiselect
          id="allergens"
          v-model="filters.allergens"
          :options="filteredAllergenOptions"
          :multiple="true"
          :close-on-select="false"
          :clear-on-select="false"
          placeholder="Select allergens"
          class="admin-filter-input"
          />
        </div>

        <div class="admin-filter-group">
          <label for="price-range">Price Range: {{ filters.price }}</label>
          <input type="range" id="price-range" v-model="filters.price" min="0" max="50" class="admin-filter-input" />
        </div>
        <div class="admin-filter-button">
          <button type="button" @click="clearFilters" class="admin-button-clear">Clear Filters</button>
        </div>

      </form>

      <div class="admin-product-list">
        <div v-for="product in paginatedProducts" :key="product.id" class="admin-product-card">
          <img :src="product.image || previewImage" :alt="product.name" @error="onProductImageError" />
          <p>{{ product.name }}</p>
          <div class="admin-productlist-button">
            <button @click="selectProduct(product)" class="admin-button-submit">Edit</button>
            <button @click="deleteProduct(product.id)" class="admin-button-cancel">Delete</button>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="admin-pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1" class="admin-button-pages">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="admin-button-pages">Next</button>
      </div>
    </div>

    <div v-if="admin_selection === 'add' || selectedProduct">
      <form @submit.prevent="submitForm" class="admin-addoption">
        <div class="admin-add-columns">
        <div class="admin-add-1column">

          <label>
            <h3>Product Name</h3>
            <input v-model="form.name" @input="touched.name = true"/>
          </label>
          <span v-if="touched.name && errors.name" class="admin-error">{{ errors.name }}</span> 

          <label>
            <h3>Main Meal</h3>
            <select v-model="form.main_meals" @change="touched.main_meals = true">
              <option value="All">All</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Afternoon Snack">Afternoon Snack</option>
              <option value="Dinner">Dinner</option>
            </select>
          </label>
          <span v-if="touched.main_meals && errors.main_meals" class="admin-error">{{ errors.main_meals }}</span>

          <h3>Allergens</h3>
          <multiselect
            v-model="form.allergens"
            @input="touched.allergens = true"
            :options="allergensOptions"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            label="label"
            track-by="value"
          />
          <span v-if="touched.allergens && errors.allergens" class="admin-error">{{ errors.allergens }}</span>

        </div>
        <div class="admin-add-2column">
          <img :src="previewImage" @error="onImageError" alt="Preview" class="admin-product-preview"/>
          <label>
            <h3>Image URL</h3>
            <input v-model="form.image" @input="touched.image = true" />
          </label>
          <span v-if="touched.image && errors.image" class="admin-error">{{ errors.image }}</span>

          <label>
            <h3>Description</h3>
            <textarea v-model="form.description" @input="touched.description = true"></textarea>
          </label>
          <span v-if="touched.description && errors.description" class="admin-error">{{ errors.description }}</span>

        </div>
        <div class="admin-add-1column">

          <label>
            <h3>Type of Product</h3>
            <select v-model="form.TypeOfProduct" @change="touched.TypeOfProduct = true">
              <option value="Food">Food</option>
              <option value="Drink">Drink</option>
            </select>
          </label>
          <span v-if="touched.TypeOfProduct && errors.TypeOfProduct" class="admin-error">{{ errors.TypeOfProduct }}</span>
          
          <label>
            <h3>Price</h3>
            <input type="number" v-model.number="form.price" @input="touched.price = true" min="0" max="50" step="0.01"/>
          </label>
          <span v-if="touched.price && errors.price" class="admin-error">{{ errors.price }}</span>

          <label>
            <h3>Diet</h3>
            <select v-model="form.diet" @change="touched.diet = true">
              <option value="No special diet">No special diet</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </label>
          <span v-if="touched.diet && errors.diet" class="admin-error">{{ errors.diet }}</span>

        </div>
        </div>
        <div class="admin-button-container">
          <button type="submit" class="admin-button-submit">{{ selectedProduct ? 'Update' : 'Add' }} Product</button>
          <button type="button" @click="cancelEdit" v-if="selectedProduct" class="admin-button-cancel">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Multiselect from "vue-multiselect";
import defaultImage from '@/assets/icons/default-nothing.png';

export default {
  components: { Multiselect },
  data() {
    return {
      admin_selection: "edit",
      products: [],
      selectedProduct: null,
      imageErrored: false,
      defaultImage: defaultImage,
      form: {
        id: null,
        name: "",
        description: "",
        TypeOfProduct: "",
        image: "",
        main_meals: "",
        price: 0,
        allergens: [],
        diet: ""
      },
      touched: {
        name: false,
        image: false,
        description: false,
        main_meals: false,
        diet: false,
        TypeOfProduct: false,
        allergens: false,
        price: false
      },
      errors: {},
      allergensOptions: [
        { label: "None", value: "None" },
        { label: "Dairy", value: "Dairy" },
        { label: "Gluten", value: "Gluten" },
        { label: "Eggs", value: "Eggs" },
        { label: "Fish", value: "Fish" },
        { label: "Crustacean shellfish", value: "Crustacean Shellfish" },
        { label: "Tree nuts", value: "Tree Nuts" },
        { label: "Peanuts", value: "Peanuts" },
        { label: "Wheat", value: "Wheat" },
        { label: "Soybeans", value: "Soybeans" },
        { label: "Sesame", value: "Sesame" },
        { label: "Mustard", value: "Mustard" },
        { label: "Lupin", value: "Lupin" },
        { label: "Mollusks", value: "Mollusks" },
        { label: "Celery", value: "Celery" },
        { label: "Sulphites", value: "Sulphites" },
      ],
      uniqueMainMeals: [],
      uniqueDiets: [],
      notifications: [],
      filters: {
        name: '',
        main_meals: '',
        diet: '',
        allergens: [],
        price: 50,
      },
      currentPage: 1,
      itemsPerPage: 8,
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product => {
        const matchesName = this.filters.name === '' || product.name.toLowerCase().includes(this.filters.name.toLowerCase());
        const productMeal = product.main_meals;
        const selectedMeal = this.filters.main_meals;
        const matchesMeal = selectedMeal === '' || selectedMeal === 'All' || productMeal === 'All' || productMeal === selectedMeal;

        const matchesDiet = this.filters.diet === '' || product.diet === this.filters.diet;
        const matchesPrice = product.price <= this.filters.price;

        const productAllergens = product.allergens ? product.allergens.split(',').map(a => a.trim()) : [];

        const matchesAllergens = this.filters.allergens.every(exclude => productAllergens.length > 0 && !productAllergens.includes(exclude)
      );
      return matchesName && matchesMeal && matchesDiet && matchesPrice && matchesAllergens;
    });
  },
  filteredAllergenOptions() {
    return this.allergensOptions
    .filter(option => option.value !== "None")
    .map(option => option.value);
  },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredProducts.slice(start, start + this.itemsPerPage);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    },
    previewImage() {
      if (this.imageErrored || !this.form.image) {
        return this.defaultImage;
      }
      return this.form.image;
    }
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    showNotification(message, type) {
      console.log(message,type)
      const id = Date.now();
      this.notifications.push({ id, message, type });

      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 3000);
    },
    handleModeChange() {
      this.resetForm();
    },
    onImageError() {
      this.imageErrored = true;
    },
    onProductImageError(event) {
      event.target.src = this.defaultImage;
    },
    fetchProducts() {
      axios.get("http://localhost:8000/api/product/")
        .then(response => {
          this.products = response.data;
          const mainMealsSet = new Set();
          const dietsSet = new Set();
          this.products.forEach(product => {
            if (product.main_meals) mainMealsSet.add(product.main_meals);
            if (product.diet) dietsSet.add(product.diet);
          });
          this.uniqueMainMeals = [...mainMealsSet];
          this.uniqueDiets = [...dietsSet];
        })
        .catch(error => console.error("Error fetching products:", error));
    },
    selectProduct(product) {
      const allergenStrings = product.allergens === "none"
        ? ["None"]
        : product.allergens.split(",").map(a => a.trim());

      const selectedAllergens = this.allergensOptions.filter(option =>
        allergenStrings.includes(option.value)
      );

      this.form = {
        ...product,
        allergens: selectedAllergens
      };

      this.selectedProduct = product;
    },
    validateField(field) {
      switch (field) {
        case 'name': {
          if (this.form.name.trim().length < 3) {
            this.errors.name = "Name must be at least 3 characters.";
          } else if (
            this.products.some(p => p.name.toLowerCase() === this.form.name.toLowerCase() && p.id !== this.form.id)
          ) {
            this.errors.name = "Name already exists.";
          } else {
            delete this.errors.name;
          }
          break;
        }
        case 'main_meals': {
          if (!this.form.main_meals) {
            this.errors.main_meals = "Please select a main meal.";
          } else {
            delete this.errors.main_meals;
          }
          break;
        }
        case 'TypeOfProduct': {
          if (!this.form.TypeOfProduct) {
            this.errors.TypeOfProduct = "Please select a product type.";
          } else {
            delete this.errors.TypeOfProduct;
          }
          break;
        }
        case 'diet': {
          if (!this.form.diet) {
            this.errors.diet = "Please select a diet.";
          } else {
            delete this.errors.diet;
          }
          break;
        }
        case 'price': {
          if (this.form.price < 0) {
            this.form.price = 0;
          }
          delete this.errors.price;
          break;
        }
        case 'image': {
          const urlPattern = /^(https?:\/\/)[^\s]+\.[^\s]+/;
          if (!this.form.image || !urlPattern.test(this.form.image)) {
            this.errors.image = "Please enter a valid image url.";
          } else {
            delete this.errors.image;
          }
          break;
        }
        case 'description': {
          if (!this.form.description || this.form.description.trim().length < 10) {

            this.errors.description = "Description must be at least 10 characters.";
          } else {
            delete this.errors.description;
          }
          break;
        }
        case 'allergens': {
          if (!this.form.allergens || this.form.allergens.length === 0) {
            this.errors.allergens = "Please select at least one allergen.";
          } else {
            delete this.errors.allergens;
          }
          break;
        }
      }
    },
    validateAllFields() {
      const fields = [
        'name',
        'main_meals',
        'TypeOfProduct',
        'diet',
        'price',
        'image',
        'description',
        'allergens'
      ];
      fields.forEach(this.validateField);
      return Object.keys(this.errors).length === 0;
    },
    submitForm() {
      Object.keys(this.touched).forEach(key => {
        this.touched[key] = true;
      });
      if (!this.validateAllFields()) return;
      const payload = {
        ...this.form,
        allergens: this.form.allergens.some(a => a.value === "None")
        ? "None"
        : this.form.allergens.map(a => a.value).join(",")
      };
      const request = this.selectedProduct
      ? axios.put(`http://localhost:8000/api/product/${this.form.id}/`, payload)
      : axios.post(`http://localhost:8000/api/product/`, payload);
      request.then(() => {
        this.fetchProducts();
        this.resetForm();
        const message = this.selectedProduct ? "✏️ Product edited" : "✅ Product added";
        const type = this.selectedProduct ? "info" : "success";
        this.showNotification(message, type);
      }).catch(error => console.error("Error saving product:", error));
    },
    deleteProduct(productId) {
      if (!confirm("Are you sure you want to delete this product?")) return;
      axios.delete(`http://localhost:8000/api/product/${productId}/`)
        .then(() => {
          this.fetchProducts();
          this.showNotification("🗑️ Product eliminated", "error");
        })
        .catch(error => console.error("Error deleting product:", error));
    },
    cancelEdit() {
      this.resetForm();
      this.selectedProduct = null;
    },
    resetForm() {
      this.form = {
        id: null,
        name: "",
        description: "",
        TypeOfProduct: "",
        image: "",
        main_meals: "",
        price: 0,
        allergens: [],
        diet: ""
      };
      this.errors = {};
      this.imageErrored = false;
      this.touched = {
      name: false,
      image: false,
      description: false,
      main_meals: false,
      diet: false,
      TypeOfProduct: false,
      allergens: false,
      price: false
    };
    },
    clearFilters() {
      this.filters = {
        name: '',
        main_meals: '',
        diet: '',
        allergens: [],
        price: 50,
      };
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  },
  watch: {
    filteredProducts() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
    },
    'form.name'() {
      this.validateField('name');
    },
    'form.main_meals'() {
      this.validateField('main_meals');
    },
    'form.TypeOfProduct'() {
      this.validateField('TypeOfProduct');
    },
    'form.diet'() {
      this.validateField('diet');
    },
    'form.price'() {
      if (this.form.price < 0) this.form.price = 0;
      this.validateField('price');
    },
    'form.image'() {
      this.imageErrored = false;
      this.validateField('image');
    },
    'form.description'() {
      this.validateField('description');
    },
    'form.allergens': {
      handler() {
        this.validateField('allergens');
      },
      deep: true,
    }
  }
};
</script>

<style scoped>
@import "~vue-multiselect/dist/vue-multiselect.min.css";
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

.admin-page {
  max-width: 80vw;
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Keania One", sans-serif;
}
.admin-tittle{
  font-size: 2rem;
}
.admin-filter-form{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
.admin-selector {
  margin-top: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-family: "Keania One", sans-serif;
}
.admin-options{
  font-size: 1.5rem;
  font-family: "Keania One", sans-serif;
  display: flex;
  justify-content: center;
  width: 10rem;
  margin: 1rem auto;
  background-color: #F7F7F7;
  border: 0;
  border-radius: 1rem;
  text-align: center;
}
.admin-addoption{
  width: 60vw;
  background-color: #F7F7F7;
  padding: 1rem;
  border-radius: 1rem;
  margin: 2rem auto;
}
.admin-filter-group{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.admin-filter-group label{
  font-size: 1.2rem;
}
.admin-filter-group input,
.admin-filter-group select{
  width: 14rem;
  height: 2.5rem;
  background-color: #F7F7F7;
  color: black;
  border-radius: 0.3rem;
  text-align: center;
  font-family: "Keania One", sans-serif;
}
.admin-filter-group select{
  height: 2.8rem;
}
.admin-filter-group .multiselect {
  max-width: 14rem;
  width: 14rem;
}
.admin-add-columns{
  display: flex;
  justify-content:space-between;
}
.admin-add-1column {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center; 
}
.admin-add-2column {
  display: flex;
  flex-direction: column;
  align-items: center; 
}
.admin-product-preview{
  width: 8rem;
  height: 8rem;
  object-fit: cover;
  object-position: center;
  border-radius: 1rem;
}
.admin-add-2column h3{
  font-weight: normal;
  text-align: center;
  font-size: 1.4rem;
  margin: 1rem;
}
.admin-add-2column input{
  width: 15rem;
  height: 2.5rem;
  text-align: center;
  font-size: 1.2rem;
  font-family: "Keania One", sans-serif;
  border : 0;
  border-radius: 1rem;
  margin: 1rem;
}
.admin-add-1column h3{
  font-weight: normal;
  text-align: center;
  font-size: 1.4rem;
  margin: 1rem;
}
.admin-add-1column input{
  width: 15rem;
  height: 2.5rem;
  text-align: center;
  font-size: 1.2rem;
  font-family: "Keania One", sans-serif;
  border : 0;
  border-radius: 1rem;
  margin: 1rem;
}
.admin-add-2column textarea{
  max-width: 15rem;
  height: 2rem;
  text-align: center;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
  border : 0;
  border-radius: 1rem;
  margin: 1rem;
}
::v-deep .multiselect__placeholder {
  color: black; 
  font-weight: normal; 
  opacity: 1; 
}

.multiselect {
  max-width: 15rem;
}
.admin-add-1column select{
  width: 15.5rem;
  height: 2.5rem;
  text-align: center;
  font-size: 1.2rem;
  font-family: "Keania One", sans-serif;
  border : 0;
  border-radius: 1rem;
}
.admin-add-1column option{
  text-align: center;
  font-size: 1.2rem;
  font-family: "Keania One", sans-serif;
}
.admin-product-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
  margin-top: 1.2rem;
}
.admin-product-list p{
  font-size: 1.2rem;
}
.admin-product-card {
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  background-color: #F7F7F7;
}

.admin-product-card img {
  width: 10rem;
  height: 10rem;
  border-radius: 1rem;
  border: 0.2rem solid black;
  object-fit: cover;
  object-position: center;
}
.admin-product-edit{
    width: 9rem;
  margin: 0 1rem;
  background-color: #00E5FF;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
}
.admin-pagination-controls {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
.admin-productlist-button{
    display: flex;
  justify-content: center;
  align-items: center;
}
.admin-button-submit,
.admin-button-cancel,
.admin-button-pages{
  width: 9rem;
  margin: 0 1rem;
  background-color: #00E5FF;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
}
.admin-button-cancel:hover{
  background-color: rgb(180, 0, 0);
  color: white;
}
.admin-filter-button{
  display: flex;
  justify-content: center;
  width: 100%;
}
.admin-button-clear{
  height: 3rem;
  background-color: #00E5FF;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Keania One", sans-serif;
}
.admin-button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
.admin-notifications-container{
  position: fixed;
  top: 7rem;
  right: 1.25rem;
  z-index: 1000;
}
.admin-notification{
  padding: 0.8rem 1rem;
  margin-bottom: 0.8rem;
  border-radius: 0.3rem;
  color: black;
  font-weight: bold;
  box-shadow: 0 0.25rem 0.4rem rgba(0, 0, 0, 0.1);
}
.admin-notification.success { background-color: #28a745; }
.admin-notification.error { background-color: #dc3545; color:white}
.admin-notification.info { background-color: #17a2b8; }
.admin-error{
  color: red;
  font-size: 0.9rem;
}
@media screen and (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .admin-tittle {
    font-size: 1.5rem;
    text-align: center;
  }

  .admin-addoption {
    width: 75vw;
    padding: 1rem;
  }

  .admin-filter-form,
  .admin-add-columns {
    flex-direction: column;
    align-items: center;
  }

  .admin-filter-group input,
  .admin-filter-group select,
  .admin-add-1column input,
  .admin-add-2column input,
  .admin-add-2column textarea,
  .admin-add-1column select {
    width: 80vw;
    font-size: 1rem;
  }
  .admin-add-2column img{
    margin-top: 1rem;
  }
  .admin-add-1column,
  .admin-add-2column {
    width: 100%;
    align-items: center;
  }

  .admin-product-preview,
  .admin-product-card img {
    width: 7rem;
    height: 7rem;
  }

  .admin-product-list {
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 1rem;
  }

  .admin-product-card {
    padding: 0.8rem;
  }

  .admin-product-edit,
  .admin-button-submit,
  .admin-button-cancel,
  .admin-button-pages {
    width: 80vw;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }

  .admin-pagination-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .admin-button-container {
    flex-direction: column;
    align-items: center;
  }

  .admin-options {
    width: 80vw;
    font-size: 1.2rem;
  }

  .multiselect {
    width: 80vw !important;
  }
}

</style>

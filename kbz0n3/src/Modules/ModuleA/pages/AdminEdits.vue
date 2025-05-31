<template>
  <div class="admin-page">
    <form class="admin-selector">
      <label>Admin Options</label>
      <select v-model="admin_selection" @change="handleModeChange">
        <option value="edit">Edit</option>
        <option value="add">Add</option>
      </select>
    </form>


    <div v-if="admin_selection === 'edit' && !selectedProduct">
      <div class="product-list">
        <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
          <img :src="product.image" :alt="product.name" />
          <p>{{ product.name }}</p>
          <button @click="selectProduct(product)">Edit</button>
          <button @click="deleteProduct(product.id)">Delete</button>
        </div>
      </div>
      <div v-if="totalPages > 1" class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>

    <div v-if="admin_selection === 'add' || selectedProduct">
      <form @submit.prevent="submitForm">
        <h3>{{ selectedProduct ? 'Edit Product' : 'Add Product' }}</h3>
        <label>Product Name</label>
        <input type="text" v-model="form.name" placeholder="Chicken" />
        <span v-if="errors.name">{{ errors.name }}</span>

        <label>Type of Product</label>
        <select v-model="form.TypeOfProduct">
          <option value="food">Food</option>
          <option value="drink">Drink</option>
        </select>
        <span v-if="errors.TypeOfProduct">{{ errors.TypeOfProduct }}</span>

        <label>Image URL</label>
        <input type="text" v-model="form.image" />
        <span v-if="errors.image">{{ errors.image }}</span>

        <label>Main Meal</label>
        <select v-model="form.main_meals">
          <option value="all">All</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="afternoon_snack">Afternoon Snack</option>
          <option value="dinner">Dinner</option>
        </select>
        <span v-if="errors.main_meals">{{ errors.main_meals }}</span>

        <label>Description</label>
        <textarea v-model="form.description"></textarea>
        <span v-if="errors.description">{{ errors.description }}</span>

        <label>Price: {{ form.price }}</label>
        <input type="range" min="1" max="50" v-model.number="form.price" />
        <span v-if="errors.price">{{ errors.price }}</span>

        <label>Allergens</label>
        <multiselect
          v-model="form.allergens"
          :options="allergensOptions"
          :multiple="true"
          :close-on-select="false"
          :clear-on-select="false"
          :preserve-search="true"
          label="label"
          track-by="value"
        />
        <span v-if="errors.allergens">{{ errors.allergens }}</span>

        <label>Diet</label>
        <select v-model="form.diet">
          <option value="nospecialdiet">No special diet</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
        </select>

        <button type="submit">{{ selectedProduct ? 'Update' : 'Add' }} Product</button>
        <button type="button" @click="cancelEdit" v-if="selectedProduct">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Multiselect from "vue-multiselect";

export default {
  components: { Multiselect },
  data() {
    return {
      admin_selection: "edit",
      products: [],
      selectedProduct: null,
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
      allergensOptions: [
        { label: "None", value: "none" },
        { label: "Dairy", value: "dairy" },
        { label: "Gluten", value: "gluten" },
        { label: "Eggs", value: "eggs" },
        { label: "Fish", value: "fish" },
        { label: "Crustacean shellfish", value: "crustacean_shellfish" },
        { label: "Tree nuts", value: "tree_nuts" },
        { label: "Peanuts", value: "peanuts" },
        { label: "Wheat", value: "wheat" },
        { label: "Soybeans", value: "soybeans" },
        { label: "Sesame", value: "sesame" },
        { label: "Mustard", value: "mustard" },
        { label: "Lupin", value: "lupin" },
        { label: "Mollusks", value: "mollusks" },
        { label: "Celery", value: "celery" },
        { label: "Sulphites", value: "sulphites" },
      ],
      errors: {},
      currentPage: 1,
      itemsPerPage: 8
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.products.length / this.itemsPerPage);
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.products.slice(start, start + this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    handleModeChange() {
      this.resetForm();
    },
    fetchProducts() {
      axios.get("http://localhost:8000/api/product/")
        .then(response => {
          this.products = response.data;
        })
        .catch(error => console.error("Error fetching products:", error));
    },
    selectProduct(product) {
      this.form = {
        ...product,
        allergens: product.allergens === "none" ? ["none"] : product.allergens.split(",")
      };
      this.selectedProduct = product;
    },
    submitForm() {
      const payload = {
        ...this.form,
        allergens: this.form.allergens.includes("none")
          ? "none"
          : this.form.allergens.join(",")
      };

      const request = this.selectedProduct
        ? axios.put(`http://localhost:8000/api/product/${this.form.id}/`, payload)
        : axios.post(`http://localhost:8000/api/product/`, payload);

      request.then(() => {
        this.fetchProducts();
        this.resetForm();
      }).catch(error => console.error("Error saving product:", error));
    },
    deleteProduct(productId) {
      if (!confirm("Are you sure you want to delete this product?")) return;
      axios.delete(`http://localhost:8000/api/product/${productId}/`)
        .then(() => this.fetchProducts())
        .catch(error => console.error("Error deleting product:", error));
    },
    cancelEdit() {
      this.resetForm();
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
      this.selectedProduct = null;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  }
};
</script>

<style scoped>
@import "~vue-multiselect/dist/vue-multiselect.min.css";
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

.admin-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Keania One", sans-serif;
}

.admin-selector {
  margin-top: 15vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-family: "Keania One", sans-serif;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.product-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  background-color: #fafafa;
}

.product-card img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.pagination-controls {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.admin-form-ad_el_ed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f5f5f5;
  padding: 2rem;
  border-radius: 10px;
}

.admin-form-ad_el_ed h3 {
  margin-bottom: 1rem;
  text-align: center;
}

.admin-form-ad_el_ed label {
  font-weight: bold;
}

.admin-form-ad_el_ed input[type="text"],
.admin-form-ad_el_ed select,
.admin-form-ad_el_ed textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.admin-form-ad_el_ed input[type="range"] {
  width: 100%;
}

.admin-form-ad_el_ed button {
  padding: 0.6rem 1rem;
  background-color: #2e86de;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.admin-form-ad_el_ed button:hover {
  background-color: #1b4f72;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>

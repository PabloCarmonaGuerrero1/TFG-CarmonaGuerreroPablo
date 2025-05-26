<template>
  <form class="admin-form-ad_el_ed" @submit.prevent="submitForm">
    <label>Admin Options</label>
    <select v-model="admin_selection">
      <option value="edit">Edit</option>
      <option value="add">Add</option>
      <option value="eliminate">Eliminate</option>
    </select>

    <div v-if="admin_selection === 'edit'">
      <label>Select Product to Edit</label>
      <select v-model="selectedProductName" @change="loadProductData">
        <option disabled value="">Select a product</option>
        <option v-for="product in products" :key="product.id" :value="product.name">
          {{ product.name }}
        </option>
      </select>
    </div>

    <div v-if="admin_selection === 'add' || admin_selection === 'edit'">
      <label>Product Name</label>
      <input type="text" v-model="form.name" placeholder="Chicken">
      <span v-if="errors.name" class="error">{{ errors.name }}</span>

      <label>Type of Product</label>
      <select v-model="form.TypeOfProduct">
        <option value="food">Food</option>
        <option value="drink">Drink</option>
      </select>
      <span v-if="errors.TypeOfProduct" class="error">{{ errors.TypeOfProduct }}</span>

      <label>Image URL</label>
      <input type="text" v-model="form.image" placeholder="Image URL">
      <span v-if="errors.image" class="error">{{ errors.image }}</span>

      <label>Main Meal</label>
      <select v-model="form.main_meals">
        <option value="all">All</option>
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="afternoon_snack">Afternoon Snack</option>
        <option value="dinner">Dinner</option>
      </select>
      <span v-if="errors.main_meals" class="error">{{ errors.main_meals }}</span>

      <label>Description</label>
      <textarea v-model="form.description" placeholder="Product description"></textarea>
      <span v-if="errors.description" class="error">{{ errors.description }}</span>

      <label>Product Price: {{ form.price }}</label>
      <input type="range" v-model.number="form.price" min="1" max="50">
      <span v-if="errors.price" class="error">{{ errors.price }}</span>

      <label>Allergens</label>
      <select v-model="form.allergens" multiple size="7">
        <option value="none">None</option>
        <option value="dairy">Dairy</option>
        <option value="gluten">Gluten</option>
        <option value="eggs">Eggs</option>
        <option value="fish">Fish</option>
        <option value="crustacean_shellfish">Crustacean shellfish</option>
        <option value="tree_nuts">Tree nuts</option>
        <option value="peanuts">Peanuts</option>
        <option value="wheat">Wheat</option>
        <option value="soybeans">Soybeans</option>
        <option value="sesame">Sesame</option>
        <option value="mustard">Mustard</option>
        <option value="lupin">Lupin</option>
        <option value="mollusks">Mollusks</option>
        <option value="celery">Celery</option>
        <option value="sulphites">Sulphites</option>
      </select>
      <span v-if="errors.allergens" class="error">{{ errors.allergens }}</span>

      <label>Diet</label>
      <select v-model="form.diet">
        <option value="nospecialdiet">No special diet</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
      </select>

      <button type="submit">{{ admin_selection === 'edit' ? 'Update' : 'Add' }} Product</button>
    </div>

    <div v-if="admin_selection === 'eliminate'">
      <label>Select Product to Delete</label>
      <select v-model="selectedProductName">
        <option disabled value="">Select a product</option>
        <option v-for="product in products" :key="product.id" :value="product.name">
          {{ product.name }}
        </option>
      </select>
      <button @click.prevent="deleteProduct">Delete Product</button>
    </div>
  </form>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      admin_selection: "edit",
      products: [],
      selectedProductName: "",
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
      errors: {},
      justSubmitted: false,
      isEditing: false
    };
  },
  mounted() {
    axios.get("http://localhost:8000/api/product/")
      .then(response => {
        this.products = response.data;
      });
  },
  watch: {
    "form.name"(val) {
      if (this.justSubmitted) return;
      if (!val) this.errors.name = "Name is required.";
      else if (val.length < 3) this.errors.name = "Name must be at least 3 characters.";
      else delete this.errors.name;
    },
    "form.description"(val) {
      if (this.justSubmitted) return;
      if (!val) this.errors.description = "Description is required.";
      else if (val.length < 3) this.errors.description = "Description must be at least 3 characters.";
      else delete this.errors.description;
    },
    "form.TypeOfProduct"(val) {
      if (this.justSubmitted) return;
      if (!val) this.errors.TypeOfProduct = "Type of Product is required.";
      else delete this.errors.TypeOfProduct;
    },
    "form.image"(val) {
      if (this.justSubmitted) return;
      if (val && val.length < 3) this.errors.image = "Image URL must be at least 3 characters.";
      else delete this.errors.image;
    },
    "form.main_meals"(val) {
      if (this.justSubmitted) return;
      if (!val) this.errors.main_meals = "Main meal is required.";
      else delete this.errors.main_meals;
    },
    "form.price"(val) {
      if (this.justSubmitted) return;
      if (val === null || isNaN(val)) this.errors.price = "Price must be a number.";
      else if (val < 0) this.errors.price = "Price must be 0 or more.";
      else delete this.errors.price;
    },
    "form.allergens"(val) {
      if (this.justSubmitted) return;
      if (!val.length) this.errors.allergens = "At least one allergen must be selected.";
      else delete this.errors.allergens;
    }
  },
  methods: {
    fetchProducts() {
        axios.get("http://localhost:8000/api/product/")
        .then(response => {
            this.products = response.data;
        })
        .catch(error => {
            console.error("Error fetching products:", error);
        });
    },
    loadProductData() {
      const product = this.products.find(p => p.name === this.selectedProductName);
      if (product) {
        this.form = { ...product };
        this.isEditing = true;
        this.errors = {};
      }
    },
    submitForm() {
      const hasErrors = Object.keys(this.errors).length;
      if (hasErrors) return;

      const payload = {
        ...this.form,
        allergens: this.form.allergens.includes("none") ? "none" : this.form.allergens.join(",")
      };

      const request = this.isEditing
        ? axios.put(`http://localhost:8000/api/product/${this.form.id}/`, payload)
        : axios.post("http://localhost:8000/api/product/", payload);

      request.then(() => {
        console.log(this.isEditing ? "Product updated successfully!" : "Product added successfully!");
        this.resetForm();
      }).catch(error => {
        console.log("Error saving product.");
        console.error(error);
      });
    },
        deleteProduct() {
      const product = this.products.find(p => p.name === this.selectedProductName);
      if (!product) return;

      if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

      axios.delete(`http://localhost:8000/api/product/${product.id}/`)
        .then(() => {
          console.log("Product deleted successfully!");
          this.fetchProducts();
          this.selectedProductName = "";
        })
        .catch(error => {
          console.log("Error deleting product.");
          console.error(error);
        });
    },
    resetForm() {
      this.justSubmitted = true;
      this.errors = {};
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
      this.selectedProductName = "";
      this.isEditing = false;
      setTimeout(() => {
        this.justSubmitted = false;
      }, 100);
    }
  }
};
</script>

<style>
.admin-form-ad_el_ed {
  margin-top: 20vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.error {
  color: red;
  font-size: 0.85em;
}
</style>

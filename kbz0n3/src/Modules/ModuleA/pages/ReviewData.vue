<template>
  <div class="reviews-container">
      <div class="reviews-search-form">
      <label for="names" class="reviewsdata-titleform">Name</label>
      <input v-model="searchName" placeholder="Search by Name" id="names" aria-labelledby="names" />

      <label for="reviewType" class="reviewsdata-titleform">Type of Review</label>
      <input v-model="searchType" placeholder="Search by Type of Review" id="reviewType" aria-labelledby="reviewType" />

      <div class="reviews-buttons-container">
        <button @click="searchReviews" aria-label="Search reviews" class="reviewsdata-buttons">Search</button>
        <button @click="resetSearch" aria-label="Reset search" class="reviewsdata-buttons">Reset</button>
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="page === 1" aria-label="Previous page" class="reviewsdata-pagination">Previous</button>
        <span>Page {{ page }}</span>
        <button @click="nextPage" :disabled="page * reviewsPerPage >= reviews.length" aria-label="Next page" class="reviewsdata-pagination">Next</button>
      </div>
    </div>
    <div v-if="reviews.length > 0">
      <div v-for="review in paginatedReviews" :key="review.id" class="review-card">
        <div class="first-line-review">
          <p>{{ review.name }}</p>
          <p>{{ review.punctuation }}/10</p>
          <p>{{ review.TypeOfReview }}</p>
        </div>
        <p class="review-reviewtext">{{ review.review }}</p>
      </div>
    </div>

    <p v-else>No reviews available.</p>
  </div>
</template>
  
<script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        reviews: [],
        page: 1,
        reviewsPerPage: 4,
        searchName: "",
        searchType: "",
      };
    },
    computed: {
      paginatedReviews() {
        const start = (this.page - 1) * this.reviewsPerPage;
        return this.reviews.slice(start, start + this.reviewsPerPage);
      }
    },
    methods: {
      async getAllReviews() {
        try {
          const response = await axios.get(`http://localhost:8000/api/reviews`);
          if (response.data) {
            this.reviews = response.data.reverse();
          }
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      },
      async searchReviews() {
        try {
          const response = await axios.get(`http://localhost:8000/api/reviews`, {
            params: {
              name: this.searchName,
              TypeOfReview: this.searchType
            }
          });
          if (response.data) {
            this.reviews = response.data;
            this.page = 1; 
          }
        } catch (error) {
          console.error("Error fetching searched reviews:", error);
        }
      },
      resetSearch() {
        this.searchName = "";
        this.searchType = "";
        this.getAllReviews();
      },
      nextPage() {
        if (this.page * this.reviewsPerPage < this.reviews.length) {
          this.page++;
        }
      },
      prevPage() {
        if (this.page > 1) {
          this.page--;
        }
      }
    },
    mounted() {
      this.getAllReviews();
    }
  };
</script>
  
<style>
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/* Base styles */
body {
  font-family: "Keania One", sans-serif;
}

/* Container principal de reseñas */
.reviews-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  margin: 8rem 0;
  text-align: left;
  min-height: 80vh;
}

/* Formulario de búsqueda */
.reviews-search-form {
  width: 30%;
  height: 25rem;
  margin-left: 3rem;
  background-color: #F7F7F7;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.reviews-search-form input {
  padding: 1rem;
  border-radius: 1rem;
  margin: 1rem;
  font-family: "Keania One", sans-serif;
}

/* Botones */
.reviews-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
}

.reviewsdata-buttons {
  width: 10rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 1rem;
  font-family: "Keania One", sans-serif;
}

/* Tarjetas de reseñas */
.review-card {
  background-color: #F7F7F7;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 55rem;
  margin-bottom: 10px;
  padding: 1rem;
  border-radius: 1rem;
}

.review-reviewtext {
  width: 100%;
  text-align: left;
  display: block;
  font-family: "Source Sans 3", sans-serif;
  font-size: 1rem;
}

/* Cabecera de la reseña */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-name {
  font-weight: bold;
  flex: 1;
}

.review-type,
.review-punctuation {
  margin-left: 10px;
}

.first-line-review {
  font-size: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.first-line-review p {
  margin: 0 1rem;
  flex: 1 1 30%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.review-text {
  margin-top: 10px;
}

/* Paginación */
.pagination {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.reviewsdata-pagination {
  font-family: "Keania One", sans-serif;
  border-radius: 5px;
  background-color: #00E5FF;
  width: 5rem;
}

/* Título del formulario */
.reviewsdata-titleform {
  text-align: center;
}

/* Botones generales */
button {
  margin: 5px;
  padding: 8px;
  background-color: #00E5FF;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #F7F7F7;
  cursor: not-allowed;
}

/* Responsive: Tablets */
@media screen and (max-width: 1024px) {
  .reviews-container {
    flex-direction: column;
    align-items: center;
  }

  .reviews-search-form {
    width: 90%;
    height: auto;
  }

  .review-card {
    width: 90%;
  }

  .first-line-review {
    flex-direction: column;
    align-items: flex-start;
    font-size: 1.2rem;
  }

  .first-line-review p {
    margin: 0.3rem 0;
  }

  .reviews-buttons-container {
    flex-direction: row;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .reviewsdata-buttons {
    width: auto;
    flex: 1;
    min-width: 8rem;
  }
}

/* Responsive: Móviles */
@media screen and (max-width: 600px) {
  .reviews-search-form input {
    padding: 0.8rem;
    margin: 0.5rem 0;
  }

  .pagination {
    flex-direction: column;
  }

  .pagination button {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .first-line-review {
    font-size: 1rem;
  }
}
</style>

  
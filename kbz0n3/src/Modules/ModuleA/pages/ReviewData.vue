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
v
</style>
  
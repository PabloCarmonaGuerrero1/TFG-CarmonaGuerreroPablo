<template>

    <div  class="Footer">
        <div class="socials-icons">
            <img src="../../../assets/icons/instagram.png" alt="instagram">
            <img src="../../../assets/icons/facebook.png" alt="facebook">
            <img src="../../../assets/icons/twitter.png" alt="twitter/x">
        </div>
        <div class="copyright">
            <p>© 2025 KBZ0N3. All Rights Reserved</p>
        </div>
    </div>

</template>
<style>
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

.Footer {
  background-color: #0077FF;
  padding: 0.5rem 1rem; /* margen interno */
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;  /* ancho completo de la ventana */
  box-sizing: border-box;
  font-family: "Keania One", sans-serif;
  margin-top: auto;
}


.Footer .copyright {
  font-size: 1rem;
  padding-right: 1.5rem;
}

.Footer .socials-icons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.Footer img {
  width: 3vh;
  height: 3vh;
}

@media (max-width: 768px) {
  .Footer {
    padding: 0.5rem;
    flex-direction: column;
    text-align: center;
  }

  .Footer .socials-icons {
    margin-bottom: 0.5rem;
    gap: 1rem;
  }

  .Footer img {
    width: 4vh;
    height: 4vh;
  }

  .Footer .copyright {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .Footer {
    padding: 0.5rem;
    flex-direction: column;
    text-align: center;
  }

  .Footer .socials-icons {
    margin-bottom: 0.5rem;
    gap: 0.8rem;
  }

  .Footer img {
    width: 3vh;
    height: 3vh;
  }

  .Footer .copyright {
    font-size: 0.9rem;
  }
}
</style>
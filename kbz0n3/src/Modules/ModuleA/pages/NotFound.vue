<template>
    <div class="notfound-page">
        <h2>404</h2>
        <p>Not found</p>
    </div>
</template>

<style>
/* Importación de fuente */
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/* Reset de estilos */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Estilos de la página de error 404 */
.notfound-page {
    background: url("../../../assets/icons/not-found.jpg") center/cover no-repeat;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.notfound-page h2, .notfound-page p {
    font-family: "Keania One", sans-serif;
    color: #000;
    margin: 0;
}

.notfound-page h2 {
    font-size: 15rem;
}

.notfound-page p {
    font-size: 10rem;
}

/* Responsive */
@media (max-width: 768px) {
    .notfound-page h2 {
        font-size: 10rem;
    }
    .notfound-page p {
        font-size: 6rem;
    }
}

@media (max-width: 480px) {
    .notfound-page h2 {
        font-size: 6rem;
    }
    .notfound-page p {
        font-size: 4rem;
    }
}

</style>

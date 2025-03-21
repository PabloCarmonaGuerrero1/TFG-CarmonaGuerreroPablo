<template>
    <div class="infoapp-page">
        <div class="info-whatis">
            <h2>What is KBZ0N3?</h2>
            <p>KBZ0N3 is a pub in which we have 3 areas, one to watch a sport such as football, another to watch an electronic sport such as LEC and another where customers can be 
                quietly with background music. The two rooms where you can watch sports will be soundproofed. In our pub you can also order dishes of food and order them online so 
                that we can bring them to your table or take them to your home.
            </p>
        </div>
        <div class="info-gamestoday">
            <h2>Matchs Today</h2>
            <div class="match-row">
                <div class="match-category">
                    <h3>Football</h3>
                    <p>Real Madrid vs Getafe</p>
                    <p>Real Betis vs Sevilla</p>
                    <p>Osasuna vs Barcelona</p>
                </div>
                <div class="match-category">
                    <h3>LEC</h3>
                    <p>Vitality vs G2</p>
                    <p>FNC vs TH</p>
                    <p>BDS vs GX</p>
                </div>
            </div>
        </div>
        <div class="map-container">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1779.1223476374241!2d-5.996223321543084!3d37.38899204747927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd126c10526e2fe3%3A0xbb3771f8d3fca2c5!2sPub%20CAPITOL!5e0!3m2!1ses!2ses!4v1742539764265!5m2!1ses!2ses"
                loading="lazy">
            </iframe>
        </div>
    </div>
</template>

<style>
/* Importación de fuente */
@import url("https://fonts.googleapis.com/css2?family=Keania+One&display=swap");

/* Página principal de información */
.infoapp-page {
    margin: 8rem 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
}

/* Secciones de información */
.info-whatis, .info-gamestoday {
    font-family: "Keania One", sans-serif;
    background-color: #D9D9D9;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1);
}

.info-gamestoday h2 {
    text-align: center;
}

/* Encabezados y párrafos */
h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    font-weight: bold;
}

h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
}

p {
    margin: 0.5rem 0;
    font-size: 1rem;
    text-align: center;
}

/* Contenedor del mapa */
.map-container {
    grid-column: span 2;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1);
}

iframe {
    width: 100%;
    height: 40vh;
    border: none;
}

/* Filas de partidos */
.match-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
}

.match-category {
    flex: 1;
    background-color: #F0F0F0;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 1024px) {
    .infoapp-page {
        grid-template-columns: 1fr;
    }

    .map-container {
        grid-column: span 1;
    }

    .match-row {
        flex-direction: column;
    }

    .match-category {
        margin-bottom: 2rem;
    }
}

@media (max-width: 768px) {
    h2 {
        font-size: 1.8rem;
    }

    h3 {
        font-size: 1.4rem;
    }

    p {
        font-size: 1rem;
    }

    .info-whatis, .info-gamestoday {
        padding: 1.5rem;
    }

    .match-row {
        gap: 1rem;
    }

    .match-category {
        padding: 1.5rem;
    }
}

@media (max-width: 480px) {
    h2 {
        font-size: 1.6rem;
    }

    h3 {
        font-size: 1.3rem;
    }

    p {
        font-size: 0.9rem;
    }

    .info-whatis, .info-gamestoday {
        padding: 1rem;
    }

    .match-category {
        padding: 1rem;
    }

    iframe {
        height: 30vh;
    }
}
</style>



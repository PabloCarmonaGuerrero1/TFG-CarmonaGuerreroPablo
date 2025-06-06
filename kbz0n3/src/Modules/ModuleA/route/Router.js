import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        component: () => import("@/Modules/ModuleA/layouts/LayoutPublic.vue"),
        children: [
            { path: "", component: () => import("../pages/UserLogin.vue") },
            { path: "register", component: () => import("../pages/UserRegister.vue") },
            { path: "homepage", component: () => import("../pages/HomePage.vue") },
            { path: "info", component: () => import("../pages/App_Info.vue") },
            { path: "product-info", component: () => import("../pages/Product_Info.vue") },
            { path: "reviewdata", component: () => import("../pages/ReviewData.vue") },
            { path: "reviewpage", component: () => import("../pages/ReviewPage.vue") },
            { path: "profile", component: () => import("../pages/User_Profile.vue") },
            { path: "shoppingcart", component: () => import("../pages/ShoppingCart.vue") },
            { path: "adminedits", component: () => import("../pages/AdminEdits.vue") },         
            { path: '/:pathMatch(.*)*', component: () => import("../pages/NotFound.vue") 
            }
            
        ]
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const checkUserExists = async (username) => {
    try {
        const response = await fetch(`http://localhost:8000/api/users/search/${username}`);
        return response.ok; 
    } catch (error) {
        console.error("Error al verificar usuario:", error);
        return false;
    }
};

const checkProductExists = async (productId) => {
    try {
        const response = await fetch(`http://localhost:8000/api/product/${productId}`);
        return response.ok; 
    } catch (error) {
        console.error("Error al verificar producto:", error);
        return false;
    }
};

router.beforeEach(async (to, from, next) => {
    const storedUsername = localStorage.getItem('username');
    const selectedProduct = localStorage.getItem('selectedProduct'); 

    const protectedRoutes = ["/profile", "/reviewpage", "/shoppingcart"];
    
    if (protectedRoutes.includes(to.path)) {
        const userExists = storedUsername ? await checkUserExists(storedUsername) : false;
        
        if (!userExists) {
            localStorage.removeItem('username'); 
            return next('/'); 
        }
    }

    if (to.path === "/product-info") {

        const productExists = selectedProduct ? await checkProductExists(selectedProduct) : false;
        
        if (!productExists) {
            localStorage.removeItem('selectedProduct'); 
            return next('/homepage'); 
        }
    }

    next();
});

export default router;

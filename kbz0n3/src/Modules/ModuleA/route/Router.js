import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/Modules/ModuleA/layouts/LayoutPublic.vue'),
    children: [
      { path: '', component: () => import('../pages/UserLogin.vue') },
      { path: 'register', component: () => import('../pages/UserRegister.vue') },
      { path: 'homepage', component: () => import('../pages/HomePage.vue') },
      { path: 'info', component: () => import('../pages/App_Info.vue') },
      { path: 'product-info', component: () => import('../pages/Product_Info.vue') },
      { path: 'reviewdata', component: () => import('../pages/ReviewData.vue') },
      { path: 'reviewpage', component: () => import('../pages/ReviewPage.vue') },
      { path: 'profile', component: () => import('../pages/User_Profile.vue') },
      { path: 'shoppingcart', component: () => import('../pages/ShoppingCart.vue') },
      { path: 'adminedits', component: () => import('../pages/AdminEdits.vue') },
      { path: '/:pathMatch(.*)*', component: () => import('../pages/NotFound.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

let cachedUserData = null;

const fetchUserData = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (cachedUserData) return cachedUserData;

  try {
    const res = await fetch('https://kbz0n3api-despliegue.onrender.com/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!data.error) {
      cachedUserData = data;
      return data;
    }
  } catch (error) {
    console.error('Error validando token:', error);
  }
  return null;
};

const checkProductExists = async (productId) => {
  try {
    const response = await fetch(`https://kbz0n3api-despliegue.onrender.com/api/product/${productId}`);
    return response.ok;
  } catch (error) {
    console.error('Error al verificar producto:', error);
    return false;
  }
};

router.beforeEach(async (to, from, next) => {
  const userData = await fetchUserData(); 

  const protectedRoutes = ['/profile', '/reviewpage', '/shoppingcart'];
  const adminOnlyRoutes = ['/adminedits'];

  if (protectedRoutes.includes(to.path)) {
    if (!userData) return next('/');
  }

  if (adminOnlyRoutes.includes(to.path)) {
    if (!userData || userData.name !== 'Paco') return next('/homepage');
  }

  if (to.path === '/product-info') {
    const selectedProduct = localStorage.getItem('selectedProduct');
    const exists = selectedProduct ? await checkProductExists(selectedProduct) : false;
    if (!exists) {
      localStorage.removeItem('selectedProduct');
      return next('/homepage');
    }
  }

  next();
});

export default router;

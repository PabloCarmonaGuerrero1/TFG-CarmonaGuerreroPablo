<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShoppingCartController;

Route::post('/product', [ProductController::class, 'store']);
Route::get('/product', [ProductController::class, 'index']);
Route::put('/product/{product}', [ProductController::class, 'update']);  
Route::delete('/product/{product}', [ProductController::class, 'destroy']); 
Route::get('/product/{product}', [ProductController::class, 'show']);
Route::get('/products/search', [ProductController::class, 'search']);

Route::get('/users', [UserController::class, 'index']);        
Route::post('/users', [UserController::class, 'store']);     
Route::get('/users/{user}', [UserController::class, 'show']);  
Route::put('/users/{user}', [UserController::class, 'update']); 
Route::delete('/users/{user}', [UserController::class, 'destroy']);
Route::get('/users/search/{name}', [UserController::class, 'searchByName']);

Route::get('/reviews', [ReviewController::class, 'index']);        
Route::post('/reviews', [ReviewController::class, 'store']);       
Route::get('/reviews/{review}', [ReviewController::class, 'show']);  
Route::put('/reviews/{review}', [ReviewController::class, 'update']); 
Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']); 

Route::get('/shopping_cart', [ShoppingCartController::class, 'allCarts']);
Route::post('/shopping_cart', [ShoppingCartController::class, 'store']);
Route::get('/shopping_cart/{userId}', [ShoppingCartController::class, 'index']);
Route::put('/shopping_cart/{id}', [ShoppingCartController::class, 'update']);
Route::delete('/shopping_cart/{id}', [ShoppingCartController::class, 'destroy']);
Route::get('/shopping_cart/{userId}/{productId}', [ShoppingCartController::class, 'getCartItem']);


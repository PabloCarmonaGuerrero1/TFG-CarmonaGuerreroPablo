<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;


    protected $fillable = [
        'name',
        'DNI',
        'number',
        'password',
        'adress',
        'last_buy',
        'fav_food',
        'fav_drink',
    ];


    //protected $hidden = [
      //  'password',
    //];
}

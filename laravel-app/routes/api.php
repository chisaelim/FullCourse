<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;


Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/signin', [AuthController::class, 'signin']);

Route::get('/verify/email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verify.email');
Route::post('/send/verification-email', [AuthController::class, 'sendVerificationEmail']);

// 1
Route::post('/send/reset-password-email', [AuthController::class, 'sendResetPasswordEmail']);

// 2
Route::post('/set/new-password', [AuthController::class, 'setNewPassword'])->name('set.new-password');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/signout', [AuthController::class, 'signout']);
    Route::get('/verify', [AuthController::class, 'verify']);
});

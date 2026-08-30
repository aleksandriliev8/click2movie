"use strict";

var firebaseConfig = {
    apiKey: "AIzaSyBI2DHX1ednyv3A1RA7ocPva48fGMi2SeA",
    authDomain: "click2movie-8.firebaseapp.com",
    projectId: "click2movie-8",
    storageBucket: "click2movie-8.firebasestorage.app",
    messagingSenderId: "436905086938",
    appId: "1:436905086938:web:c066bf16039b802336769c",
    measurementId: "G-SJZX0EG765"
};

firebase.initializeApp(firebaseConfig);

var auth = firebase.auth();
var db = firebase.firestore();

'use strict'

// swiper
var swiper = new Swiper('.swiper-container', {
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  loop: true,
  pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
});



// js
// window.onload = function() {
//    setInterval(function() {
//       var dd = new Date();
//
//       document.getElementById('time').innerHTML = dd;
//    },1000);
// }

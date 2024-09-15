/*
 * Name: Esther Huang
 * Date: May 28, 2024
 * Section: CSE 154 AC
 * This is the javascript page to make yipper.html used for populating information from the
 * backend database to the pages in yipper.html, and also making the pages interactive.
 * The features include letting user view all the yips, showing yips that matches the search
 * phrase, or adding a new yip.
 */

'use strict';
(function() {

  window.addEventListener('load', init);

  let productId;
  let userId;

  /**
   * initializes the start screen to be the pokedex and add functionalities to buttons
   */
  function init() {
    let url = new URL(window.location.href);
    let searchParams = new URLSearchParams(url.search);
    productId = searchParams.get('productId');
    userId = searchParams.get('userId');
    console.log(productId);
    console.log(userId);
    loadPage();
    id('add-to-cart-button').addEventListener('click', addToCart);
  }

  function loadPage() {
    fetch('/products/' + productId)
      .then(statusCheck)
      .then(res => res.json())
      .then(res => {
        loadPageHandler(res);
      })
      .catch(handleError);
  }

  function loadPageHandler(res) {
    let image = id('one-item-image')
    image.src = 'uploads/' + res.image;
    image.alt = 'image of ' + res.name;
    id('one-item-name').textContent = res.name;
    id('one-item-price').textContent = res.price;
    id('one-item-description').textContent = res.description;
  }

  function addToCart() {
    let apiData = new FormData();
    apiData.append('userId', userId);
    apiData.append('productId', productId);

    fetch('/addToCart', {method: 'POST', body: apiData})
      .then(statusCheck)
      .then(res => res.json())
      .catch(handleError);
  }

  /**
   * status check helpter function
   * @param {*} response - returned text/json from server
   * @returns {*} response
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * fetch error handler
   */
  function handleError(err) {
    console.error('something went wrong with the server: ' + err);
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

})();
'use strict';

(function() {
  const DEFAULT_CATEGORY = 'clothing';

  document.addEventListener("DOMContentLoaded", () => {
    // Get current URL path and search query
    const url = new URL(window.location.href);
    const path = url.pathname;
    const searchParams = new URLSearchParams(url.search);
    const category = searchParams.get('category'); // This will be null if no category is specified

    // Get all navbar links
    const links = document.querySelectorAll("#navbar a");

    // Iterate through links to find the current page link
    links.forEach(link => {
      const linkUrl = new URL(link.href);

      // Check if the link's href matches the current path
      if (linkUrl.pathname === path) {
        // Further check for category match if needed
        if (category) {
          const linkParams = new URLSearchParams(linkUrl.search);
          const linkCategory = linkParams.get('category');
          if (linkCategory === category) {
            link.classList.add('active');
          }
        } else {
          link.classList.add('active');
        }
      }
    });

    // Redirect to login if not logged in and trying to access profile
    const profileLink = document.querySelector("a[href='profile.html']");
    if (profileLink) {
      profileLink.addEventListener('click', (event) => {
        event.preventDefault();
        const userId = localStorage.getItem('userId');
        if (!userId) {
          window.location.href = 'login.html';
        } else {
          window.location.href = 'profile.html';
        }
      });
    }

    if (document.querySelector('#cart-table')) {
      updateTotal(); // Only update total if the cart table exists
    }
    loadCategoryItems();
  });

  /**
   * Loads items of a specific category into the item container on the webpage.
   */
  async function loadCategoryItems() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category') || DEFAULT_CATEGORY;
    const itemContainer = document.getElementById('all-item-container');
    const headerTitle = document.getElementById('item-page-title');

    if (headerTitle) {
      headerTitle.textContent = `${formatCategoryName(category)} Shop`;
    }

    itemContainer.innerHTML = '';

    try {
      let response = await fetch('/products/category/' + category);
      if (!response.ok) {
        throw new Error('Failed to load items');
      }
      let items = await response.json();
      items.forEach(item => itemContainer.appendChild(createItemElement(item)));
    } catch (error) {
      console.error('Error loading items:', error);
    }
  }

  /**
   * Formats the category names to be properly displayed as titles.
   * @param {string} category - The category to format.
   * @return {string} The formatted category name.
   */
  function formatCategoryName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  }

  /**
   * Creates a single item element for display.
   * @param {object} item - The item data.
   * @return {HTMLElement} The created item element.
   */
  function createItemElement(item) {
    const article = document.createElement('article');
    article.className = 'item-container';

    const link = document.createElement('a');
    link.className = 'item';
    link.href = 'one-item.html?id=' + item.id;

    const img = document.createElement('img');
    img.src = 'uploads/' + item.image;
    img.alt = `Image of ${item.name}`;
    link.appendChild(img);

    const detailDiv = document.createElement('div');
    detailDiv.className = 'item-detail';

    const itemName = document.createElement('h3');
    itemName.className = 'item-name';
    itemName.textContent = item.name;
    detailDiv.appendChild(itemName);

    const itemPrice = document.createElement('p');
    itemPrice.className = 'item-price';
    itemPrice.textContent = `$${parseFloat(item.price).toFixed(2)}`;
    detailDiv.appendChild(itemPrice);

    link.appendChild(detailDiv);
    article.appendChild(link);

    return article;
  }

  // Checkout logic

  /**
   * Calculates the total price of all items in the cart and updates the total price display.
   * Iterates through each row in the cart table, extracts the price from the fourth cell,
   * sums up all prices, and displays the formatted total in the designated area.
   * If the cart table does not exist, it returns 0.
   *
   * @returns {number} The total price of all items in the cart or 0 if the
   * cart is empty or not present.
   */
  function updateTotal() {
    const carttable = document.querySelector('#cart-table tbody');
    if (carttable) {
      const total = [...carttable.querySelectorAll('tr')]
        .reduce((acc, row) => acc + parseFloat(row.cells[3].textContent.slice(1)), 0);
      document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
      return total;
    }
    return 0; // Return 0 if no cart table exists
  }

  /**
   * Handles the logic for adding a new product to the listings.
   * It collects input values from a form, validates them, and appends
   * the new product to the listings. Resets the form and closes the modal upon success.
   */
  async function addProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = document.getElementById('product-price').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const size = document.getElementById('product-size').value.trim();
    const image = document.getElementById('product-image').files[0]; // Handle image file

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('size', size);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/products', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Error adding product');
      }
      const result = await response.json();
      if (result.success) {
        closeModal();
        loadCategoryItems();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Displays the modal for adding a new product by setting its display style to 'block'.
   */
  function openModal() {
    document.getElementById('product-modal').style.display = 'block';
  }

  /**
   * Hides the modal for adding a new product by setting its display style to 'none'.
   */
  function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
  }

  // Attach event listeners
  document.addEventListener("DOMContentLoaded", () => {
    const openModalButton = document.getElementById('open-modal-button');
    const closeModalButton = document.querySelector('.close');

    if (openModalButton) {
      openModalButton.addEventListener('click', openModal);
    }

    if (closeModalButton) {
      closeModalButton.addEventListener('click', closeModal);
    }

    if (document.getElementById('add-product-button')) {
      document.getElementById('add-product-button').addEventListener('click', addProduct);
    }
  });

  /**
   * Toggles the visibility of the sold or bought products view based on the provided type.
   * It ensures only the requested view is visible while hiding the other. It also manages
   * the display and functionality of an overlay that dims the background, providing a
   * modal-like interaction experience.
   *
   * @param {string} type - The type of view to display; expected values are 'sold' or 'bought'.
   */
  function toggleView(type) {
    const soldView = document.getElementById('sold-products-view');
    const boughtView = document.getElementById('bought-products-view');
    const overlay = createOverlay();

    // Reset views to none and apply overlay
    resetViews(soldView, boughtView);
    document.body.appendChild(overlay);

    // Display the appropriate view
    displayView(type, soldView, boughtView);

    // Setup overlay to close views on click
    setupOverlayClose(overlay, soldView, boughtView);
  }

  /**
   * Creates or retrieves an overlay div from the document. If the overlay does not exist,
   * it is created, assigned an 'overlay' class, and appended to the body of the document.
   * The overlay style is then set to visible.
   * @returns {HTMLElement} The overlay element.
   */
  function createOverlay() {
    let overlay = document.getElementById('overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'overlay';
      overlay.className = 'overlay'; // Apply the CSS class here
      document.body.appendChild(overlay);
    }
    setOverlayStyle(overlay); // Ensure styles are applied correctly
    return overlay;
  }

  /**
   * Sets the overlay to be visible.
   * @param {HTMLElement} overlay - The overlay element whose display style will be set to 'block'.
   */
  function setOverlayStyle(overlay) {
    overlay.style.display = 'block'; // Make the overlay visible
  }

  /**
   * Hides the sold and bought product views and removes the overlay from the document.
   * @param {HTMLElement} soldView - The element representing sold products.
   * @param {HTMLElement} boughtView - The element representing bought products.
   */
  function resetViews(soldView, boughtView) {
    soldView.style.display = 'none';
    boughtView.style.display = 'none';
    if (document.getElementById('overlay')) {
      document.body.removeChild(document.getElementById('overlay'));
    }
  }

  /**
   * Displays either the sold or bought products view based on the type specified.
   * @param {string} type - The type of view to display ('sold' or 'bought').
   * @param {HTMLElement} soldView - The sold products view element.
   * @param {HTMLElement} boughtView - The bought products view element.
   */
  function displayView(type, soldView, boughtView) {
    if (type === 'sold') {
      soldView.style.display = 'block';
    } else {
      boughtView.style.display = 'block';
    }
  }

  /**
   * Sets up an event listener on the overlay to close both product views and remove the overlay
   * from the document when the overlay is clicked.
   * @param {HTMLElement} overlay - The overlay element.
   * @param {HTMLElement} soldView - The sold products view element.
   * @param {HTMLElement} boughtView - The element representing bought products.
   */
  function setupOverlayClose(overlay, soldView, boughtView) {
    overlay.addEventListener('click', function() {
      soldView.style.display = 'none';
      boughtView.style.display = 'none';
      document.body.removeChild(overlay);
    });
  }

  // Login and registration logic

  /**
   * Handles user login by sending credentials to the server.
   * If successful, saves the user ID in localStorage and redirects to the main page.
   */
  async function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      if (result.id) {
        localStorage.setItem('userId', result.id);
        window.location.href = 'profile.html';
      } else {
        displayMessage('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  /**
   * Handles user registration by sending credentials to the server.
   * If successful, saves the user ID in localStorage and redirects to the main page.
   */
  async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      if (result.id) {
        localStorage.setItem('userId', result.id);
        window.location.href = 'profile.html';
      } else {
        displayMessage('Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  }

  // Attach event listeners for login and registration
  document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');

    if (loginButton) {
      loginButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        loginUser();
      });
    }

    if (registerButton) {
      registerButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        registerUser();
      });
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        logoutUser();
      });
    }
  });

  /**
   * Handles user logout by clearing session and local storage, then redirects to the login page.
   */
  async function logoutUser() {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        localStorage.clear(); // Clear local storage
        window.location.href = 'login.html'; // Redirect to login page
      } else {
        console.error('Logout failed');
        displayMessage('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      displayMessage('Error logging out');
    }
  }

  /**
   * Displays a temporary message to the user, which disappears after a short duration.
   * @param {string} message - The message to display.
   */
  function displayMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    messageContainer.textContent = message;

    document.body.appendChild(messageContainer);

    setTimeout(() => {
      messageContainer.remove();
    }, 3000);
  }
})();
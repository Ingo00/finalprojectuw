# BestDeal API Documentation

This API allows users to manage inventory items, user profiles, and cart functionalities in an e-commerce website.

## Add New Item
**Request Format:** /items

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Adds a new item to the inventory. This endpoint requires the item name, description, price, and category to be provided in the request body.

**Example Request:**

POST /items
Content-Type: application/json
{
  "name": "New Item",
  "description": "This is the description of the new item.",
  "price": 24.99,
  "category": "Category 3"
}

**Example Response:**

{
  "id": 3,
  "name": "New Item",
  "description": "This is the description of the new item.",
  "price": 24.99,
  "category": "Category 3"
}

**Error Handling:**

500 Internal Server Error: If there is an error adding the item to the server.
{
  "error": "Error adding item."
}

400 Bad Request: If the provided data is invalid.
{
  "error": "Invalid data provided."
}

## Get All Items
**Request Format:** /items

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves all items stored in the inventory. This endpoint does not require any parameters.

**Example Request:** GET /items

**Example Response:**
[
  {
    "id": 1,
    "name": "Item 1",
    "description": "This is the description of item 1.",
    "price": 19.99,
    "category": "Category 1"
  },
  {
    "id": 2,
    "name": "Item 2",
    "description": "This is the description of item 2.",
    "price": 29.99,
    "category": "Category 2"
  }
]

**Error Handling:**

500 Internal Server Error: If there is an error reading the items from the server.
{
  "error": "Error reading items."
}

## Get Item by ID
**Request Format:** /items/:id

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves details of a specific item by its ID. The item ID should be provided as a URL parameter.

**Example Request:** GET /items/1

**Example Response:**
{
  "id": 1,
  "name": "Item 1",
  "description": "This is the description of item 1.",
  "price": 19.99,
  "category": "Category 1"
}

**Error Handling:**

400 Bad Request: If the provided ID is invalid.
{
  "error": "Invalid item ID."
}

500 Internal Server Error: If there is an error reading the item from the server.
{
  "error": "Error reading item."
}

## Update Item by ID
**Request Format:** /items/:id

**Request Type:** PUT

**Returned Data Format**: JSON

**Description:** Updates the details of an existing item by its ID. The item ID should be provided as a URL parameter. The request body should include the updated item details.

**Example Request:**

PUT /items/1
Content-Type: application/json
{
  "name": "Updated Item",
  "description": "Updated description",
  "price": 34.99,
  "category": "Updated Category"
}

**Example Response:**

{
  "id": 1,
  "name": "Updated Item",
  "description": "Updated description",
  "price": 34.99,
  "category": "Updated Category"
}

**Error Handling:**

400 Bad Request: Missing required fields or invalid data format.
{
  "error": "Invalid data provided."
}

500 Internal Server Error: If there is an error updating the item on the server.
{
  "error": "Error updating item."
}

## Delete Item by ID
**Request Format:** /items/:id

**Request Type:** DELETE

**Returned Data Format**: Plain Text

**Description:** Deletes a specific item from the inventory by its ID. The item ID should be provided as a URL parameter.

**Example Request:** DELETE /items/1

**Example Response:**

Entry deleted successfully.

**Error Handling:**

500 Internal Server Error: If there is an error deleting the item from the server.
{
  "error": "Error deleting item."
}

400 Bad Request: If the provided ID is invalid.
{
  "error": "Invalid item ID."
}

## Register User
**Request Format:** /users/register

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Registers a new user. The request body should include the username, password, and email.

**Example Request:**

POST /users/register
Content-Type: application/json
{
  "username": "newuser",
  "password": "securepassword",
  "email": "newuser@example.com"
}

**Example Response:**

{
  "id": 1,
  "username": "newuser",
  "email": "newuser@example.com"
}

**Error Handling:**

400 Bad Request: If the provided data is invalid or username/email is already taken.
{
  "error": "Invalid data or user already exists."
}

500 Internal Server Error: If there is an error registering the user.
{
  "error": "Error registering user."
}

## Login User
**Request Format:** /users/login

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Authenticates a user. The request body should include the username and password.

**Example Request:**

POST /users/login
Content-Type: application/json
{
  "username": "existinguser",
  "password": "securepassword"
}

**Example Response:**

{
  "token": "auth-token",
  "username": "existinguser"
}

**Error Handling:**

401 Unauthorized: If the username or password is incorrect.
{
  "error": "Invalid username or password."
}

500 Internal Server Error: If there is an error logging in the user.
{
  "error": "Error logging in user."
}

## Add Item to Cart
**Request Format:** /cart

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Adds an item to the user's cart. The request body should include the user ID, item ID, and quantity.

**Example Request:**

POST /cart
Content-Type: application/json
{
  "userId": 1,
  "itemId": 2,
  "quantity": 1
}

**Example Response:**

{
  "message": "Item added to cart successfully."
}

**Error Handling:**

400 Bad Request: If the provided data is invalid.
{
  "error": "Invalid data."
}

500 Internal Server Error: If there is an error adding the item to the cart.
{
  "error": "Error adding item to cart."
}

## Get Cart Items
**Request Format:** /cart/:userId

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves all items in the user's cart. The user ID should be provided as a URL parameter.

**Example Request:** GET /cart/1

**Example Response:**

[
  {
    "itemId": 2,
    "name": "Item 2",
    "price": 29.99,
    "quantity": 1
  },
  {
    "itemId": 3,
    "name": "Item 3",
    "price": 39.99,
    "quantity": 2
  }
]

**Error Handling:**

500 Internal Server Error: If there is an error retrieving the cart items.
{
  "error": "Error retrieving cart items."
}

## Remove Item from Cart
**Request Format:** /cart/:userId/:itemId

**Request Type:** DELETE

**Returned Data Format**: Plain Text

**Description:** Removes an item from the user's cart. The user ID and item ID should be provided as URL parameters.

**Example Request:** DELETE /cart/1/2

**Example Response:**

Item removed from cart successfully.

**Error Handling:**

500 Internal Server Error: If there is an error removing the item from the cart.
{
  "error": "Error removing item from cart."
}

400 Bad Request: If the provided user ID or item ID is invalid.
{
  "error": "Invalid user ID or item ID."
}

## Place Order
**Request Format:** /orders

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Places a new order for the user. The request body should include the user ID, an array of cart items, and the total amount.

**Example Request:**

POST /orders
Content-Type: application/json
{
  "userId": 1,
  "cartItems": [
    {
      "itemId": 2,
      "quantity": 1
    },
    {
      "itemId": 3,
      "quantity": 2
    }
  ],
  "totalAmount": 109.97
}

**Example Response:**

{
  "orderId": 123,
  "message": "Order placed successfully."
}

**Error Handling:**

400 Bad Request: If the provided data is invalid.
{
  "error": "Invalid data provided."
}

500 Internal Server Error: If there is an error placing the order.
{
  "error": "Error placing order."
}

## Get Orders
**Request Format:** /orders/:userId

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves all orders for the user. The user ID should be provided as a URL parameter.

**Example Request:** GET /orders/1

**Example Response:**

[
  {
    "orderId": 123,
    "date": "2024-05-16",
    "totalAmount": 109.97,
    "status": "Shipped"
  },
  {
    "orderId": 124,
    "date": "2024-05-17",
    "totalAmount": 59.98,
    "status": "Processing"
  }
]

**Error Handling:**

500 Internal Server Error: If there is an error retrieving the orders.
{
  "error": "Error retrieving orders."
}

400 Bad Request: If the provided user ID is invalid.
{
  "error": "Invalid user ID."
}

## Get User Profile
**Request Format:** /users/:userId

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves the profile information of a specific user. The user ID should be provided as a URL parameter.

**Example Request:** GET /users/1

**Example Response:**

{
  "userId": 1,
  "username": "existinguser",
  "email": "existinguser@example.com",
  "address": "1234 Street, City, Country",
  "phone": "(123) 456-7890"
}

**Error Handling:**

500 Internal Server Error: If there is an error retrieving the user profile.
{
  "error": "Error retrieving user profile."
}

400 Bad Request: If the provided user ID is invalid.
{
  "error": "Invalid user ID."
}

## Update User Profile
**Request Format:** /users/:userId

**Request Type:** PUT

**Returned Data Format**: JSON

**Description:** Updates the profile information of a specific user. The user ID should be provided as a URL parameter. The request body should include the updated user details.

**Example Request:**

PUT /users/1
Content-Type: application/json
{
  "username": "updateduser",
  "email": "updateduser@example.com",
  "address": "5678 New Street, New City, New Country",
  "phone": "(987) 654-3210"
}

**Example Response:**

{
  "userId": 1,
  "username": "updateduser",
  "email": "updateduser@example.com",
  "address": "5678 New Street, New City, New Country",
  "phone": "(987) 654-3210"
}

**Error Handling:**

500 Internal Server Error: If there is an error updating the user profile.
{
  "error": "Error updating user profile."
}

400 Bad Request: If the provided data is invalid.
{
  "error": "Invalid data provided."
}
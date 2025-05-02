# 🍽️ OrderUp – The Complete Food Ordering Ecosystem

A full-stack multi-platform solution for online food ordering, built for three types of users: **Customers**, **Restaurant Owners**, and **Delivery Agents**. OrderUp handles everything from browsing menus to order delivery in one ecosystem.

![Built with React Native](https://img.shields.io/badge/React%20Native-2025-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)


## 📚 Table of Contents

- [About the Project](#-about-the-project)
- [Project Structure](#️-project-structure)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots & Demo](#-screenshots--demo)
- [Installation](#️-installation)
- [API Reference](#-api-reference)
- [Usage](#-usage)
- [Roadmap / Future Plans](#️-roadmap--future-plans)
- [Known Issues / Limitations](#-known-issues--limitations)
- [Author & Contact](#-author--contact)
- [Acknowledgements](#-acknowledgements)

## 📦 About the Project

**OrderUp** is an end-to-end food ordering and delivery platform that streamlines the experience for customers, restaurant owners, and delivery agents. 

Built with a modern full-stack architecture, the platform includes:

- A **Customer App** to browse restaurants, order food, and track deliveries in real-time.
- A **Restaurant App** to manage menus and receive and process orders.
- An **Agent App** for delivery personnel to view, accept, and fulfill delivery tasks.
- A **Backend API** that handles all user interactions, data management, authentication, and notifications.

OrderUp was built as a **Final Year Project (FYP)** to demonstrate real-world application design and engineering, with complete responsibility taken for frontend, backend, database, and deployment.

---

### 🔍 Key Objectives

- Provide a real-time, scalable food ordering experience.
- Enable restaurants to manage their digital menus and track orders independently.
- Allow agents to interact with assigned delivery tasks with minimal overhead.
- Implement **live delivery tracking** using the **Google Maps API** to show real-time location updates to both customers and restaurants.
- Build a clean, modular architecture with long-term maintainability in mind.

---

### 🧠 Why This Project?

The goal was not just to simulate a food ordering app, but to **create a working ecosystem** where each user type operates independently yet cohesively. It aims to solve core problems like:

- Disjointed communication between restaurants and delivery systems.
- Inefficient order updates and delivery tracking.
- Poor backend structure in most student-level projects.
- Lack of real-time features like live delivery tracking in most academic food delivery projects.

OrderUp is built to **go beyond prototypes** — with realistic flows, data persistence, and modular architecture to scale each part independently.

---

## 🗂️ Project Structure

The repository is organized as a monorepo with separate apps for each user type, along with a backend server that powers all three.

---

### 🔍 Folder Descriptions

- **apps/customer-app/**  
  Contains the user-facing mobile app for browsing restaurants, placing orders, viewing order history, and tracking live delivery.

- **apps/restaurant-app/**  
  Built for restaurant owners to manage their menu, update profile info, view incoming orders, and update order statuses.

- **apps/agent-app/**  
  Designed for delivery agents to view assigned delivery jobs, accept/reject orders, update status, and share live location using Google Maps API.

- **backend/**  
  Includes all API routes, database models (MongoDB), authentication (JWT), image upload logic, order processing, and real-time updates via socket.io.

- **assets/**  
  Contains logos, banners, screenshots, and other static visual content for use in the README.

---

## ✨ Features

OrderUp delivers a robust, modular food ordering ecosystem with dedicated apps for customers, restaurant owners, and delivery agents. Each role is designed to interact seamlessly through a powerful Node.js backend with real-time capabilities.

---

### 📱 Customer App

- 🔍 **Browse Restaurants** – Explore restaurants by category or location.
- 📋 **View Menus** – Access detailed menus with item descriptions, pricing, and availability.
- 🛒 **Add to Cart & Checkout** – Smoothly add items to the cart and complete orders.
- 🧾 **Order History** – Review previous orders and check their current status.
- 📍 **Live Order Tracking** – Track your delivery’s live location with Google Maps API.
- ⭐ **Item Review & Rating System** – Leave reviews and rate food items after delivery.
- 📸 **Profile Management** – Update profile picture, name, and personal information.

---

### 🏪 Restaurant App

- 🍽️ **Menu Management** – Add, edit, or remove food items with images, prices, descriptions, availability, and categories.
- 📦 **Order Management** – View incoming orders, accept or reject them, and update their status throughout the delivery process.
- 🧭 **Agent Assignment** – Assign available delivery agents to accepted orders. Agents can accept or reject assignments in real time.
- 🧮 **Inventory & Stock Control** – Update item stock quantities, receive low-stock alerts, and manage out-of-stock visibility.
- 💸 **Discount Handling** – Configure discounts and promotional pricing for menu items.
- 🧾 **Editable Restaurant Info** – Update basic profile info, upload a logo and thumbnail image (for listing/branding).
- 🛠️ **Upcoming Features** – Business hours configuration, push notifications, and analytics dashboard.

---

### 🚚 Agent App

- 📬 **Order Assignments** – View orders assigned by restaurants for delivery.
- ✅ **Accept or Reject** – Choose which orders to fulfill based on availability.
- 🗺️ **Live Location Sharing** – Share real-time location with customers using Google Maps API.
- 🔄 **Update Delivery Status** – Mark each stage of delivery (Picked up, On the way, Delivered).
- 👤 **Profile Access** – View agent details and update profile image and information.

---

### 🧠 Backend Features

- 🔐 **Secure Authentication** – Uses JWT-based token authentication for all three user roles (Customer, Restaurant, Agent).
- 🌐 **Role-Specific API Endpoints** – Organized API structure ensures clear separation of logic and validation for each app.
- 🖼️ **Image Uploads** – Upload, store, and update profile and item images with UUID-based naming to prevent conflicts.
- 🧊 **Order Processing Engine** – Supports status transitions, restaurant-agent assignment, and customer-side tracking.
- 📡 **Real-Time Communication** – Powered by **Socket.IO**, enabling live order status updates and agent tracking across all apps.
- 🧩 **Modular & Scalable Codebase** – Structured with independent controllers, routes, models, and middleware for easy maintenance and extension.

## 🧰 Tech Stack

OrderUp is built using modern technologies across the full stack to ensure performance, scalability, and a seamless user experience.

### 👨‍💻 Frontend

- **React Native (Expo)** – For developing performant cross-platform mobile apps (Customer, Restaurant, Agent).
- **Expo Router** – Handles deep linking, nested routing, and tab-based navigation in each app.
- **AsyncStorage** – Used for local persistence of user sessions, carts, and preferences.
- **Google Maps API** – Embedded for real-time location tracking and route visualization.

### 🌐 Backend

- **Node.js + Express** – Backend server handling routing, business logic, and authentication.
- **MongoDB + Mongoose** – NoSQL database for data storage.
- **Socket.IO** – Enables real-time bi-directional communication between apps (order status, agent tracking).
- **JWT (JSON Web Tokens)** – Used for secure authentication and role-based access control.
- **Multer** – Handles multipart/form-data for image uploads.


### 🧪 Development Tools

- **Postman** – For testing API endpoints during development.
- **VS Code** – Preferred editor with extensions for formatting.
- **WebStorm** – Preferred editor for styling components and UI handling.
- **GitHub** – Full version control and collaboration.

---

## 📸 Screenshots & Demo

> ⚠️ **Coming Soon:** Screenshots and demo videos will be added after final polish of each module.

### 👤 Customer App

| Home Screen | Restaurant Page | Cart & Checkout |
|-------------|------------------|-----------------|
| ![Home](assets/screens/user-home.png) | ![Restaurant](assets/screens/user-restaurant.png) | ![Checkout](assets/screens/user-checkout.png) |

### 🏪 Restaurant App

| Dashboard | Menu Management | Order Details |
|-----------|------------------|----------------|
| ![Dashboard](assets/screens/restaurant-dashboard.png) | ![Menu](assets/screens/restaurant-menu.png) | ![Order](assets/screens/restaurant-order.png) |

### 🚚 Agent App

| Assigned Orders | Map View | Status Updates |
|------------------|----------|----------------|
| ![Orders](assets/screens/agent-orders.png) | ![Map](assets/screens/agent-map.png) | ![Status](assets/screens/agent-status.png) |

### 🎬 Live Demo

> 📽️ A video walkthrough (YouTube/Loom) will be available soon.  
> Stay tuned for a full-feature demo of all three apps in action.

---

## 🛠️ Installation

Follow these steps to set up the OrderUp ecosystem locally. You'll need to run the backend server and each app (customer, restaurant, agent) separately.

---

### 📋 Prerequisites

- Node.js v18+ & npm v9+
- MongoDB Community Edition (v6+)
- Expo CLI (for mobile apps)
- Google Maps API Key (for live tracking)
- Git

---

### 🚀 Setup Instructions

#### 1. Clone Repository
```bash
git clone https://github.com/ahsannaeem150/orderUp.git
cd orderUp
```
---
#### 2. Backend Setup
```bash
cd backend
```
```bash
npm install
```
```bash
# Create .env file
# Edit .env with your credentials
# (LOCAL_MONGO_URL, JWT_SECRET, PORT)
```
```bash
npm start
```
#### 3. App Setup
```bash
cd apps/user-app
```
```bash
npm install
```
```bash
# Create .env file
# Edit .env with your Google Maps API credentials
# (ANDROID_API_KEY, IOS_API_KEY)
```
```bash
# Edit app/context/authContext.js
# Change ip variable to your Wifi's IPv4 address (type ipconfig in terminal to get your Wifi's IP)
```
```bash
npx expo start
```
### 🌐 Environmental Variables
#### 1. Backend ``` .env ``` Example
```bash
PORT=5000
LOCAL_MONGO_URL=mongodb://localhost:27017/orderup
JWT_SECRET=your_jwt_secret_here
```
#### 1. App ``` .env ``` Example
```bash
ANDROID_API_KEY=ad8D8GHhsdgUbnsYkaAjnbSYjg78
IOS_API_KEY=ad8D8GHhsdgUbnsYkaAjnbSYjg78
```

## 🔌 API Reference

Endpoints are grouped by resource and user type. All routes are prefixed with `/api`.

### 🔐 Authentication

#### Customer
| Endpoint | Method | Description | Parameters | 
|----------|--------|-------------|------------|
| `/auth/register` | POST | Register new customer | `email`, `password`, `name` |
| `/auth/login` | POST | Customer login | `email`, `password` |

#### Restaurant
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/auth/register/restaurant` | POST | Register restaurant | `name` , `email`, `password`, `phone` , `city` , `address` |
| `/auth/login/restaurant` | POST | Restaurant login | `email`, `password` |

#### Agent
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/auth/agent/register` | POST | Register delivery agent | `email`, `password`, `name` |
| `/auth/agent/login` | POST | Agent login | `email`, `password` |

---

### 👤 Profile Management

#### Customer
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/:id/profile/image` | PUT | Upload profile picture | `image` (file upload) |
| `/user/:id/profile/update` | PUT | Update profile info | `username`, `phone` , `address`, `location`|
| `/images/:imageId` | GET | Get Images | - |

#### Restaurant
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/restaurant/:id/profile/:type` | PUT | Upload profile/cover image | `image` (file upload) |
| `/restaurant/:id/update` | PUT | Update restaurant profile | `name`, `phone` , `address` , `location`, etc. |


#### Agent
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/agent/:id/profile/image` | PUT | Upload agent profile picture | `image` (file upload) |
| `/agent/:id/profile/update` | PUT | Update agent profile | `username`, `phone` , `address`, `location`|

---

### 🍔 Menu Items (Restaurant)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/restaurant/:id/menuitems` | POST | Add new menu item | `name` ,`description` ,`price`,`costPrice` ,`stock` ,`maxStock` ,`minStock` ,`category` ,`tags` ,`supplierName` ,`supplierContact` ,`preparationTime` ,`unit` ,`expiryDate` + `image` |
| `/restaurant/:id/items` | GET | Get all menu items | - |
| `/restaurant/:restaurantId/item/:itemId` | GET | Get single menu item | - |
| `/restaurant/:restaurantId/item/:itemId` | DELETE | Delete menu item | - |
| `/restaurant/:restaurantId/items/:itemId` | PATCH | Update menu item |  `name` ,`description` ,`discount`,`discountStart`,`discountEnd`,`price` ,`costPrice` ,`stock` ,`maxStock` ,`minStock` ,`category` ,`tags` ,`supplierName` ,`supplierContact` ,`preparationTime` ,`unit` ,`expiryDate` + `image` |

---

### 🏪 Restaurant Operations (by Customer)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/restaurants` | GET | List all restaurants (Customer) | - |
| `/restaurants/batch` | POST | Get multiple restaurants by ID | `restaurantIds` array |
| `/restaurant/items/:itemId` | GET | Get single restaurant item | - |
| `/restaurant/items/batch` | POST | Get multiple items by ID | `itemIds` array |

---

### 🛒 Orders & Checkout

#### Customer
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/checkout` | POST | Create new order | `userId`, `name`, `phone` , `city` ,`address` ,`cart` ,`estimatedDeliveryTime`,`notes` |
| `/user/:userId/orders/active` | GET | Get active orders | - |
| `/user/:userId/orders/history` | GET | Get historic orders | - |
| `/user/:userId/orders/:orderId` | GET | Get single order details | - |
| `/user/:userId/orders/history/:orderId` | GET | Get single historic order | - |

#### Restaurant
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/restaurant/:restaurantId/orders/active` | GET | Get active orders | - |
| `/restaurant/:restaurantId/orders/history` | GET | Get historic orders | - |
| `/restaurant/:restaurantId/orders/:orderId` | GET | Get single order details | - |
| `/restaurant/:restaurantId/orders/history/:orderId` | GET | Get single historic order | - |

#### Agent
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/agent/:id/requests` | GET | Get delivery requests | - |

---

### 📝 Reviews & Ratings

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/restaurant/item/:itemId/reviews/:userId` | POST | Submit item review | `rating`, `comment` |
| `/restaurant/item/:itemId/reviews` | GET | Get item reviews | - |

---

### 🖼️ Media Handling

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/images/:imageId` | GET | Get any uploaded image | - |


---

### 🔍 Recommendations

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/recommendations/:itemID` | GET | Get recommended items | - |

---

> 📤 **File Uploads** require `multipart/form-data` format  
> 🔒 All sensitive endpoints use JWT authentication header  
> 🚚 Agent order management endpoints coming in v2.0

## ⚡ Real-Time Features (Socket.IO)

OrderUp uses Socket.IO for real-time communication across the ecosystem. All connections require valid JWT authentication.

### 📡 Connection Endpoints

| Namespace       | Path              | Description                  |
|-----------------|-------------------|------------------------------|
| Customer        | `/user`           | User-specific order updates  |
| Restaurant      | `/restaurant`     | Restaurant order management  |
| Agent           | `/agent`          | Delivery assignment flows    |

---

### 🔌 Socket Events

#### 👤 Customer Events
| Event               | Direction  | Description                                | Parameters                      |
|---------------------|------------|--------------------------------------------|---------------------------------|
| `join-user-room`    | Emit       | Join user's private room                   | `userId`                        |
| `order-created`     | Receive    | New order confirmation                     | Full order object               |
| `order-updated`     | Receive    | Live order status updates                  | Updated order object            |
| `order-removed`     | Receive    | Order cancellation/completion              | `{orderId, status}`             |
| `cancel-order`      | Emit       | Initiate order cancellation                | `orderId`, `cancellationReason` |

#### 🏪 Restaurant Events
| Event                       | Direction  | Description                                | Parameters                      |
|-----------------------------|------------|--------------------------------------------|---------------------------------|
| `join-restaurant-room`      | Emit       | Join restaurant's private room             | `restaurantId`                  |
| `order-created`             | Receive    | New order notification                     | Full order object               |
| `order-updated`             | Receive    | Order status changes                       | Updated order object            |
| `order-removed`             | Receive    | Order removal notification                 | `{orderId, status}`             |
| `send-assignment-request`   | Emit       | Assign order to agent                      | `orderId`, `agentId`            |
| `update-order-status`       | Emit       | Change order status                        | `orderId`, `status`             |
| `search-agents`             | Emit       | Find available agents                      | `query` (name/username)         |
| `new-assignment-request`    | Receive    | Confirm request sent to agent              | Agent+Order details             |

#### 🚚 Agent Events
| Event                       | Direction  | Description                                | Parameters                      |
|-----------------------------|------------|--------------------------------------------|---------------------------------|
| `join-agent-room`           | Emit       | Join agent's private room                  | `agentId`                       |
| `new-assignment-request`    | Receive    | New delivery request                       | Full request details            |
| `respond-to-assignment`     | Emit       | Accept/reject delivery                     | `orderId`, `accept` (boolean)   |
| `assignment-request-removed`| Receive    | Request cancellation                       | `orderId`                       |

---

### 🌐 Global Events (Change Stream)
Triggered by database changes:

| Event               | Description                                | Broadcast To                |
|---------------------|--------------------------------------------|-----------------------------|
| `order-created`     | New order inserted                         | Customer + Restaurant rooms |
| `order-updated`     | Order document updated                     | Customer + Restaurant rooms |
| `order-removed`     | Order moved to history                     | Customer + Restaurant rooms |

---

### 📡 Connection Example

```javascript
const socket = io("http://your-api-url", {
  auth: {
    token: "USER_JWT_TOKEN" 
  }
});

// Join customer room
socket.emit("join-user-room", userId);

// Listen for order updates
socket.on("order-updated", (order) => {
  console.log("Order status:", order.status);
});
```
## 📱 Usage

OrderUp is designed for three core user roles. Here's how each one interacts with the ecosystem:

---

### 👤 Customer Flow

1. **Browse Restaurants**  
   Users can explore a list of restaurants based on location, category, or search keywords.

2. **View Menus & Item Details**  
   Tap into any restaurant to see a full menu, item descriptions, pricing, and stock availability.

3. **Add to Cart & Place Order**  
   Add one or multiple items to the cart. Proceed to checkout and place the order seamlessly.

4. **Track Orders in Real-Time**  
   Customers can view live status updates and delivery tracking via Google Maps.

5. **Leave Reviews**  
   After delivery, users can rate and review individual items.

6. **Manage Profile**  
   Update profile information and upload a profile image.

---

### 🧑‍🍳 Restaurant Flow

1. **Login to Dashboard**  
   Restaurant owners log in to manage their store, items, and incoming orders.

2. **Manage Menu & Stock**  
   Add new items, edit or delete existing ones, upload images, and manage inventory levels with low-stock alerts.

3. **Order Management**  
   Accept or reject incoming orders. Update order statuses (Preparing → Ready → Assigned).

4. **Assign Agents**  
   Assign available delivery agents to new orders based on availability.

5. **View and Edit Business Info**  
   Update basic profile data, contact details, and upload business images like logos and thumbnails.

6. **Track Order Fulfillment**  
   View all orders and their current statuses, including live agent tracking.

---

### 🚚 Agent Flow

1. **View Assigned Orders**  
   See a list of orders assigned by restaurants.

2. **Accept or Reject Assignments**  
   Agents can accept tasks based on location and workload.

3. **Live Location Sharing**  
   While delivering, agents share their GPS location for real-time tracking (Google Maps API).

4. **Update Order Status**  
   Mark orders as “Picked Up,” “On the Way,” and “Delivered.”

5. **Manage Profile**  
   Agents can update basic personal info within their app.

---


## 🛣️ Roadmap / Future Plans

OrderUp is under active development. Here's a look at what’s coming soon:


### 💬 Communication

- [ ] **In-App Chat** between:
  - Customers and Restaurants (e.g., special instructions, delays)
  - Restaurants and Agents (e.g., handoff coordination)
  - Customers and Agents (e.g., location updates)

---

### 🗺️ Live Tracking

- [x] **Google Maps Integration**
- [ ] Improve location accuracy with real-time socket updates
- [ ] Show animated delivery route to customer

---

### 📊 Analytics & Dashboards

- [ ] **Sales Dashboard** for Restaurant Owners
  - Daily/weekly/monthly revenue
  - Popular items, order heatmaps

- [ ] **Earnings Dashboard** for Delivery Agents
  - Total earnings
  - Completed deliveries
  - Tips summary

---

### 💵 Payment & Orders

- [ ] **Online Payment Integration**
  - Stripe or Razorpay for card payments
  - Cash on Delivery toggle

- [ ] **Order Cancellation & Refunds**
  - Controlled cancellation flows
  - Refund request system (manual or automated)

---

### 📲 User Experience

- [ ] **Push Notifications**
  - New order updates, delivery status, promotions

- [ ] **Favorite Restaurants & Items**
  - Personalized recommendations

- [ ] **Dark Mode Support**
  - For all three apps

---

## 🐞 Known Issues / Limitations

While OrderUp is fully functional across its core modules, a few areas are still under development or have known limitations:

---

### 🔧 General

- ⚠️ **No Push Notification System Yet**  
  Currently, users must manually check for updates in-app. Push support is planned.
---

### 🧑‍🍳 Restaurant App

- ❌ **Business Info Section Incomplete**  
  Restaurant owners can update basic details and upload images, but delivery hours and service settings are under development.

- 📉 **Limited Analytics**  
  No dashboard or detailed sales insight yet.

---

### 👤 Customer App

- ❌ **No Payment Gateway Yet**  
  Orders are assumed to be "cash on delivery" — online payments are not integrated yet.

- 💬 **No Chat/Support Feature**  
  Users currently cannot contact restaurants or agents directly in-app.

---

### 🛵 Agent App

- 📊 **No Earnings Summary Screen**  
  Agents currently can't view a breakdown of completed deliveries or earnings.

---

> These limitations are known and being addressed in upcoming updates. Check the [Roadmap](#️-roadmap--future-plans) for more info.
## 👨‍💻 Author & Contact

Built with dedication and passion by:

**Ahsan Naeem**   
🎓 Bachelor's in Software Engineering (Final Year Student)  
🌐 [GitHub](https://github.com/ahsannaeem150)  
💼 [LinkedIn](https://www.linkedin.com/in/ahsan-naeem-ba2907288/)  
📧 Email: ahsannaeem150@gmail.com  

> Feel free to reach out for collaborations, feedback, or project discussions!


## 🙏 Acknowledgements

A huge thanks to the open-source community and the tools that made this project possible:

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/) – For real-time communication
- [Google Maps API](https://developers.google.com/maps) – For live tracking
- [Mongoose](https://mongoosejs.com/)
- [GitHub](https://github.com/) – For version control and collaboration

> And to everyone who supported and inspired this full-stack journey 🚀

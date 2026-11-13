# Basketball Equipment Shop System

A comprehensive, full-stack inventory and point-of-sale (POS) system built for a basketball equipment store. This project was developed collaboratively by a student team, utilizing a Node.js/Express backend, a MySQL database, and a decoupled HTML/JavaScript frontend.

## Tech Stack

* **Frontend:** Vanilla HTML5, CSS3, and JavaScript (Fetch API)

* **Backend:** Node.js, Express.js

* **Database:** MySQL (using `mysql2/promise` for core features and callbacks for legacy routes)

## Core Modules

1. **Users & Roles:** Role-based access control (Admin vs. Customer).

2. **Master Data / Catalog:** Management of Categories, Brands, and Equipment.

3. **Shop Orders (Checkout):** Point-of-sale system that processes customer orders, calculates dynamic subtotals, and immediately deducts purchased items from active inventory.

4. **Inventory & Safety Stock:** Advanced stock evaluation engine that predicts shortages based on daily sales rates and supplier lead times.

5. **Supplier Orders:** Restocking system that allows managers to order low-stock items. Marking an order as "received" automatically adds the items back to the active store inventory.

6. **Shipments:** Logistics tracking to monitor the physical transit of supplier orders (Pending, Shipped, In Transit, Delayed, Delivered).

## How Our System Works

Our system operates using a **decoupled architecture**, meaning the frontend HTML files run independently in the browser and pull data from the Node.js backend using REST API `fetch()` calls.

The core of the system revolves around an **Automated Inventory Lifecycle**. Here is exactly how the modules interact:

### 1. The Checkout Process

When a customer builds a cart and clicks "Place Order", the backend transaction begins. MySQL generates the subtotals automatically, the order is logged, and the system instantly deducts the purchased quantity from the `equipment` table's `stock_quantity`.

### 2. Safety Stock Evaluation

Instead of relying on flat numbers, the backend dynamically calculates a **Reorder Point** for every single item using this formula:

> `Reorder Point = (Daily Sales Rate × Supplier Lead Time) + Minimum Safety Level`

Whenever you visit the **Equipment** or **Reports** dashboard, the system evaluates your current stock against this threshold. If an item falls below its specific reorder point, the backend flags it as `CRITICAL`, triggering red "Low Stock" alerts on the frontend.

### 3. Restocking & Logistics

When a product triggers a low-stock alert, an admin creates a **Supplier Order**.

* The **Shipments** module tracks the physical boxes from the supplier to the store.

* Once the boxes arrive, the admin updates the Supplier Order status to `received`.

* The backend intercepts this status change and automatically injects the newly received quantities back into the `equipment` table.

### 4. Cycle Completion

The moment the inventory is updated, the Reorder Point math is satisfied, and the "Low Stock" alerts instantly clear themselves from the dashboard, completing the lifecycle!

## 5.4 Ownership Matrix

This matrix serves as the record of who owns what for our defense and grading, based on our Git commit history.

| Member / GitHub Username | Tables | Endpoints / screens | Join report(s) and join type | Feature role | 
| ----- | ----- | ----- | ----- | ----- | 
| **zeetkode**  (Narciso Jr I. Balaoro) | `users`, `roles` (System integration) | `/api/users`, `index.html` | N/A | Project Integration, Core Architecture & Authentication | 
| **decerylasoy21**  (Deceryl Asoy) | `orders`, `order_items` | `/api/orders`, `orders.html` | Recent Orders w/ Customer (JOIN) | Shop Orders, Shopping Cart & Checkout Transactions | 
| **Andr3naline22**  (Andre Bandoquillo) | `categories`, `brands`, `equipment` | `/api/masterdata`, `md.html` | N/A | Master Data & Catalog Backend Setup | 
| **Acets28**  (Ralph Vincent Avengoza) | `suppliers`, `supplier_orders`, `supplier_order_items`, `shipments` | `/api/supplier-orders`, `/api/shipments`, `supplierOrders.html`, `shipments.html` | Supplier Orders Details (INNER JOIN) | Supplier Management & Logistics/Shipments | 
| **flacko1738**  (Dean Lloyd Bete) | `stock_alerts`, `alert_audit_logs`, `addresses`, `payments` | `/api/inventory/evaluate`, `equipment.html` | N/A | Safety Stock Logic, Alerts, & Audit Logging | 
| **karlissmyname**\ (Karl Judiel Anqui) - DBMS only | Aggregate queries across multiple tables | `/api/reports`, `reports.html` | INNER JOIN, LEFT JOIN, FULL OUTER JOIN | Advanced Data Reports & MVC Controllers | 
| **diazjeffnyl-bot**  (Jeffnyl Diaz) - SIA only | `equipment` (Monitoring views) | `equipment.html` | N/A | Frontend Equipment & Stock Monitoring UI | 

*(Note: Matrix updated as of Week 1 integration. Responsibilities dynamically handled via GitHub feature branches).*

## Setup Instructions

1. **Database Setup:**

   * Open MySQL Workbench.

   * Run the provided `setup.sql` script to generate the schema, tables, and seed data.

2. **Backend Installation:**

   * Open your terminal in the root directory.

   * Run `npm install` to install dependencies (`express`, `cors`, `mysql2`, etc.).

   * Ensure your database credentials in `db.js` and `config/db.js` match your local MySQL setup.

3. **Run the Server:**

   * Run `node index.js`

   * The server will start on `http://localhost:3000`.

4. **Access the Application:**

   * Open your browser and navigate to `http://localhost:3000/index.html` (or open the HTML files directly if using a Live Server).
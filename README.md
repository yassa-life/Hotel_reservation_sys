# 🏨 Grand Horizon — Hotel Room Reservation System

> **OOP Java Project** · 6-Module Architecture · JSP/Servlet Backend · Pure HTML/CSS/JS Frontend

---

## 📁 Project Structure

```
OOP _proj/
├── hotel-system/               ← BACKEND (Java + Servlets)
│   ├── module1_room/           ← Member 1: Room Management
│   │   ├── Room.java
│   │   └── RoomDAO.java
│   ├── module2_customer/       ← Member 2: Customer Management
│   │   ├── Customer.java
│   │   └── CustomerDAO.java
│   ├── module3_reservation/    ← Member 3: Reservation System
│   │   ├── Reservation.java
│   │   └── ReservationDAO.java
│   ├── module4_payment/        ← Member 4: Payment Handling
│   │   ├── Payment.java
│   │   └── PaymentDAO.java
│   ├── module5_admin/          ← Member 5: Staff / Admin
│   │   ├── Staff.java
│   │   └── StaffDAO.java
│   ├── module6_review/         ← Member 6: Reports & Reviews
│   │   ├── Review.java
│   │   ├── ReviewDAO.java
│   │   └── Report.java
│   ├── shared/
│   │   ├── database/
│   │   │   └── DBConnection.java
│   │   └── models/
│   │       └── User.java       ← Abstract base class
│   ├── web/
│   │   └── WEB-INF/
│   │       ├── web.xml         ← Servlet mappings
│   │       └── servlets/       ← REST API Servlets
│   │           ├── RoomServlet.java
│   │           ├── CustomerServlet.java
│   │           ├── ReservationServlet.java
│   │           ├── PaymentServlet.java
│   │           ├── StaffServlet.java
│   │           └── ReportServlet.java
│   ├── database/
│   │   └── hotel_db.sql        ← MySQL Schema + Seed Data
│   └── build.xml               ← Ant build script
│
└── frontend-react/             ← FRONTEND (React + Tailwind CSS + Vite)
    ├── package.json
    ├── tailwind.config.js
    ├── src/
    │   ├── components/         ← Reusable UI components
    │   ├── context/            ← React Context (Auth, Toast)
    │   ├── pages/              ← Page components (Home, Dashboard, Admin, etc.)
    │   └── App.jsx             ← React Router setup
```

---

## 🧩 OOP Concepts Used

| Concept | Where Used |
|---------|-----------|
| **Encapsulation** | All model classes (Room, Customer, Reservation, Payment, Staff, Review) use private fields + getters/setters |
| **Inheritance** | `Customer` and `Staff` both extend the abstract `User` class |
| **Abstraction** | `User.java` is an abstract class with `displayDashboard()` as abstract method |
| **Polymorphism** | `Customer` and `Staff` override `displayDashboard()` differently |

---

## ⚙️ Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 11 or 17 | https://adoptium.net |
| Apache Tomcat | 9 or 10 | https://tomcat.apache.org |
| MySQL | 8.x | https://dev.mysql.com/downloads |
| Apache Ant *(optional)* | 1.10+ | https://ant.apache.org |
| Any browser | Latest | — |

---

## 🗄️ Step 1 — Set Up the Database (Backend)

1. Open **MySQL Workbench** or run `mysql -u root -p` in your terminal.
2. Run the SQL script to create the database and tables:

```bash
mysql -u root -p < hotel-system/database/hotel_db.sql
```

Or paste the contents of `hotel_db.sql` directly into MySQL Workbench and **Execute**.

3. Verify the database exists:
```sql
SHOW DATABASES;
USE hotel_db;
SHOW TABLES;
```

You should see: `Rooms`, `Customers`, `Reservations`, `Payments`, `Staff`, `Reviews`

4. *(Optional)* Change database credentials in `shared/database/DBConnection.java`:
```java
private static final String DB_URL      = "jdbc:mysql://localhost:3306/hotel_db";
private static final String DB_USER     = "root";       // ← your MySQL username
private static final String DB_PASSWORD = "root";       // ← your MySQL password
```

---

## 🖥️ Step 2 — Run the Backend (Tomcat Server)

> ✅ This project uses **Maven** — all JARs download automatically, no manual configuration needed.

### ✅ IntelliJ (Simplified)

#### Community Edition
1. Open `hotel-system/` as a Maven project.
2. Install **Smart Tomcat** plugin.
3. Download/extract Tomcat 9 (example: `C:\tomcat9`).
4. Create Smart Tomcat config:
   - Deployment: `hotel-system/src/main/webapp`
   - Context path: `/hotel-system`
   - Port: `8080`
5. Run and test: `http://localhost:8080/hotel-system/api/rooms`

#### Ultimate Edition
1. Open `hotel-system/` as a Maven project.
2. **Run > Edit Configurations > + > Tomcat Server > Local**.
3. Deployment:
   - Artifact: `hotel-system:war exploded` (or webapp directory)
   - Context path: `/hotel-system`
4. Run and test: `http://localhost:8080/hotel-system/api/rooms`

### Option B — Build WAR and Deploy Manually

#### 1. Build WAR using Maven (bundled inside IntelliJ)
Open the **Terminal** tab inside IntelliJ and run:
```bash
"C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.2.8\plugins\maven\lib\maven3\bin\mvn.cmd" package -DskipTests
```
This creates: **`hotel-system/target/hotel-system.war`**

#### 2. Copy WAR to Tomcat
```bash
copy hotel-system\target\hotel-system.war C:\tomcat9\webapps\
```

#### 3. Start Tomcat
```bash
C:\tomcat9\bin\startup.bat
```

#### 4. Verify
Open in browser:
```
http://localhost:8080/hotel-system/api/rooms
```
You should see a JSON array of rooms.

### ✅ Backend API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/rooms` | Get all rooms |
| POST | `/api/rooms` | Add a room |
| PUT | `/api/rooms` | Update a room |
| DELETE | `/api/rooms?id=1` | Delete a room |
| GET | `/api/customers` | Get all customers |
| POST | `/api/customers` | Register customer |
| PUT | `/api/customers` | Update customer |
| DELETE | `/api/customers?id=1` | Delete customer |
| GET | `/api/reservations` | Get all reservations |
| POST | `/api/reservations` | Make a reservation |
| DELETE | `/api/reservations?id=1` | Cancel reservation |
| GET | `/api/payments` | Get all payments |
| POST | `/api/payments` | Record payment |
| PUT | `/api/payments` | Update payment status |
| GET | `/api/staff` | Get all staff |
| POST | `/api/staff/login` | Staff login |
| GET | `/api/reports` | Dashboard summary |
| GET | `/api/reports/full` | Full reservation report |
| GET | `/api/reports/revenue` | Monthly revenue |
| GET | `/api/reviews` | Get all reviews |
| POST | `/api/reviews` | Add a review |

---

## 🌐 Step 3 — Run the Frontend (Separate Folder)

The modern frontend is built with React, Vite, and Tailwind CSS and is located in the `frontend-react/` folder. You will need [Node.js](https://nodejs.org/) installed.

1. Open a terminal and navigate to the React frontend folder:
```bash
cd "frontend-react"
```

2. Install the required dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL provided (usually **http://localhost:5173**).

---

## 🔗 Connecting Frontend ↔ Backend

The React frontend seamlessly calls the backend Java Servlet API at `http://localhost:8080/hotel-system`.

*(Note: All modules including Rooms, Customers, Reservations, and Analytics are fully wired up to real backend endpoints. The system will gracefully fall back to local mock data if the Tomcat server is unreachable).*

---

## 🌿 GitHub Workflow for Viva

Use this flow to show clean collaboration history:

- `main` branch: UI / frontend progression first
- backend: each member works in their module folder with a dedicated branch
  - `feature/module1-room` -> `module1_room`
  - `feature/module2-customer` -> `module2_customer`
  - `feature/module3-reservation` -> `module3_reservation`
  - `feature/module4-payment` -> `module4_payment`
  - `feature/module5-admin` -> `module5_admin`
  - `feature/module6-review` -> `module6_review`

Then merge module branches to `main` with one PR per module so commit history clearly shows individual contribution.

---

## 👥 Team — Module Division

| Module | Member | Responsibility | Files |
|--------|--------|---------------|-------|
| 1 | Member 1 | Room Management | `module1_room/Room.java`, `RoomDAO.java`, `RoomServlet.java` |
| 2 | Member 2 | Customer Management | `module2_customer/Customer.java`, `CustomerDAO.java`, `CustomerServlet.java` |
| 3 | Member 3 | Reservation System | `module3_reservation/Reservation.java`, `ReservationDAO.java`, `ReservationServlet.java` |
| 4 | Member 4 | Payment Handling | `module4_payment/Payment.java`, `PaymentDAO.java`, `PaymentServlet.java` |
| 5 | Member 5 | Staff / Admin | `module5_admin/Staff.java`, `StaffDAO.java`, `StaffServlet.java` |
| 6 | Member 6 | Reports & Reviews | `module6_review/Review.java`, `ReviewDAO.java`, `Report.java`, `ReportServlet.java` |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ClassNotFoundException: com.mysql.cj.jdbc.Driver` | Add `mysql-connector-j.jar` to `lib/` and Tomcat's `lib/` |
| `Cannot connect to database` | Check MySQL is running; verify credentials in `DBConnection.java` |
| Frontend shows "Could not load..." | Ensure Tomcat is running on port 8080; check browser console for CORS errors |
| CORS error in browser | The servlets already add CORS headers. Ensure you're hitting `http://` not `file://` |
| `404` on API calls | Verify the WAR deployed correctly; check `web.xml` URL patterns |
| Port 8080 already in use | Change Tomcat's port in `conf/server.xml` and update `BASE_URL` in `api.js` |

---

## 🚀 Quick Start Checklist

- [ ] MySQL installed and running
- [ ] `hotel_db.sql` executed (database created)
- [ ] MySQL JAR + Gson JAR added to `lib/`
- [ ] Project opened in IDE or WAR deployed to Tomcat
- [ ] Tomcat started → visit `http://localhost:8080/hotel-system/api/rooms`
- [ ] Frontend served (`cd frontend-react` then `npm install` and `npm run dev`)
- [ ] Visit `http://localhost:5173`
- [ ] Dashboard loads with live data from backend ✅

---

## 📄 License

This project is for educational purposes — SLIIT OOP Module Assignment.

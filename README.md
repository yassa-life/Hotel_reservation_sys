# 🏨 Grand Horizon — Hotel Room Reservation System

> **OOP Java Project** · 6-Module Architecture · JSP/Servlet Backend · React + Tailwind CSS Frontend

---

## 📁 Project Structure

```
Hotel_reservation_sys/
├── hotel-system/               ← BACKEND (Java + Servlets)
│   ├── module1_room/           ← Room Management
│   ├── module2_customer/       ← Customer Management
│   ├── module3_reservation/    ← Reservation System
│   ├── module4_payment/        ← Payment Handling
│   ├── module5_admin/          ← Staff / Admin
│   ├── module6_review/         ← Reports & Reviews
│   ├── shared/                 ← DB connection, base models
│   ├── web/                    ← Servlets, web.xml
│   ├── database/               ← MySQL schema
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
```        |

---

## ⚙️ Prerequisites

| Tool         | Version | Download                                  |
|--------------|---------|-------------------------------------------|
| Java JDK     | 11+     | https://adoptium.net                      |
| Apache Tomcat| 9/10    | https://tomcat.apache.org                 |
| MySQL        | 8.x     | https://dev.mysql.com/downloads           |
| Node.js      | 18+     | https://nodejs.org                        |

---

## 🗄️ Backend Setup (Java)

1. Install Java, Maven, and MySQL.
2. Import `hotel-system/database/hotel_db.sql` into MySQL.
3. Configure DB credentials in `shared/database/DBConnection.java` if needed.
4. Build and deploy backend:
   ```sh
   cd hotel-system
   mvn clean package
   # Deploy `target/hotel-system.war` to Tomcat or use provided scripts
   ```

## 🖥️ Frontend Setup (React)

1. Install Node.js and npm.
2. Install dependencies:
   ```sh
   cd frontend-react
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## 🚀 Usage
- Access the frontend at `http://localhost:5173`
- Backend runs on Tomcat (default: `http://localhost:8080`)
- Default admin credentials: `admin@hotel.com` / `admin123`

## 🌿 GitHub Workflow
- Use feature branches per module, then merge to `main` via PR.
- See `README.md` for module responsibilities and team division.

## 📄 License
MIT

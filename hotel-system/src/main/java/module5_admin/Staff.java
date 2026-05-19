package module5_admin;

import shared.models.User;

/**
 * Module 5 - User Interface / Main System
 * Member 5 Responsibility: Staff/Admin user, controls program flow & menu.
 *
 * OOP Concepts Demonstrated:
 *  - Inheritance: Staff extends the abstract User class
 *  - Polymorphism: Overrides displayDashboard()
 *  - Encapsulation: private fields + getters/setters
 */
public class Staff extends User {
    // Encapsulation
    private String role;       // "Admin" | "Receptionist" | "Manager"
    private String phone;
    private String createdAt;

    // Constructor chaining (Inheritance)
    public Staff() {
        super();
    }

    public Staff(int id, String name, String email, String password,
                 String role, String phone, String createdAt) {
        super(id, name, email, password);
        this.role      = role;
        this.phone     = phone;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getRole()            { return role; }
    public void setRole(String role)   { this.role = role; }

    public String getPhone()           { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCreatedAt()                   { return createdAt; }
    public void setCreatedAt(String createdAt)     { this.createdAt = createdAt; }

    // Polymorphism: Staff goes to admin dashboard
    @Override
    public String displayDashboard() {
        return "admin_dashboard.jsp";
    }
}

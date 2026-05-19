package module2_customer;

import shared.models.User;

// Inheritance: Customer extends the abstract User class
public class Customer extends User {
    // Encapsulation
    private String phone;
    private String address;
    private String createdAt;

    public Customer() {
        super();
    }

    public Customer(int id, String name, String email, String password, String phone, String address, String createdAt) {
        super(id, name, email, password);
        this.phone = phone;
        this.address = address;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    // Polymorphism: Overriding the abstract method from User
    @Override
    public String displayDashboard() {
        return "customer_dashboard.jsp";
    }
}

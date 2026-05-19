package shared.models;

// Abstraction: Using an abstract class to define common properties for all users
public abstract class User {
    // Encapsulation: private variables
    private int id;
    private String name;
    private String email;
    private String password;

    public User() {}

    public User(int id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters (Encapsulation)
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // Polymorphism: This method can be overridden by Customer and Staff classes
    public abstract String displayDashboard();
}

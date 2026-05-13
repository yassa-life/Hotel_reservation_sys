package shared.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBConnection — creates a NEW connection per call.
 *
 * The previous Singleton pattern reused one shared Connection object.
 * That caused ResultSets to be silently closed whenever a second query
 * was executed on the same connection (e.g., nested DAO calls).
 *
 * Each caller is responsible for closing the connection (use try-with-resources).
 */
public class DBConnection {

    private static final String DB_URL      = "jdbc:mysql://localhost:3306/hotel_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DB_USER     = "root";
    private static final String DB_PASSWORD = "root";

    // Private constructor — utility class, never instantiated
    private DBConnection() {}

    /**
     * Returns a brand-new Connection every time.
     * Always use inside try-with-resources so it is closed automatically:
     *
     *   try (Connection conn = DBConnection.getConnection()) { ... }
     */
    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC Driver not found.", e);
        }
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }
}

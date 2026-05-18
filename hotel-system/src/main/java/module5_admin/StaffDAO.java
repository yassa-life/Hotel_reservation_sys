package module5_admin;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Module 5 - Staff DAO
 * Handles CRUD operations for the Staff/Admin table.
 */
public class StaffDAO {

    // 1. CREATE — Add new staff member
    public boolean addStaff(Staff staff) {
        String sql = "INSERT INTO Staff (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staff.getName());
            pstmt.setString(2, staff.getEmail());
            pstmt.setString(3, staff.getPassword());
            pstmt.setString(4, staff.getRole());
            pstmt.setString(5, staff.getPhone());

            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. READ — Get staff by ID
    public Staff getStaffById(int staffId) {
        String sql = "SELECT * FROM Staff WHERE staff_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, staffId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // READ — Login check (email + password)
    public Staff login(String email, String password) {
        String sql = "SELECT * FROM Staff WHERE email = ? AND password = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, email);
            pstmt.setString(2, password);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // READ — Get all staff
    public List<Staff> getAllStaff() {
        List<Staff> staffList = new ArrayList<>();
        String sql = "SELECT * FROM Staff ORDER BY name";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                staffList.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return staffList;
    }

    // 3. UPDATE
    public boolean updateStaff(Staff staff) {
        String sql = "UPDATE Staff SET name = ?, email = ?, password = ?, role = ?, phone = ? WHERE staff_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staff.getName());
            pstmt.setString(2, staff.getEmail());
            pstmt.setString(3, staff.getPassword());
            pstmt.setString(4, staff.getRole());
            pstmt.setString(5, staff.getPhone());
            pstmt.setInt(6, staff.getId());

            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. DELETE
    public boolean deleteStaff(int staffId) {
        String sql = "DELETE FROM Staff WHERE staff_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, staffId);
            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper
    private Staff mapRow(ResultSet rs) throws SQLException {
        return new Staff(
            rs.getInt("staff_id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getString("password"),
            rs.getString("role"),
            rs.getString("phone"),
            rs.getString("created_at")
        );
    }
}

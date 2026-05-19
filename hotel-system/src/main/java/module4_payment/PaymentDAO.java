package module4_payment;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Module 4 - Payment Handling (DAO)
 * Handles all database interactions for the Payments table.
 */
public class PaymentDAO {

    // 1. CREATE — Record a new payment
    public boolean addPayment(Payment payment) {
        String sql = "INSERT INTO Payments (reservation_id, amount, payment_method, status, payment_date) VALUES (?, ?, ?, ?, NOW())";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, payment.getReservationId());
            pstmt.setDouble(2, payment.getAmount());
            pstmt.setString(3, payment.getPaymentMethod());
            pstmt.setString(4, payment.getStatus());

            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. READ — Get payment by ID
    public Payment getPaymentById(int paymentId) {
        String sql = "SELECT * FROM Payments WHERE payment_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, paymentId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // READ — Get payment by reservation ID
    public Payment getPaymentByReservation(int reservationId) {
        String sql = "SELECT * FROM Payments WHERE reservation_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, reservationId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // READ — View all payments
    public List<Payment> getAllPayments() {
        List<Payment> payments = new ArrayList<>();
        String sql = "SELECT * FROM Payments ORDER BY payment_date DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                payments.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return payments;
    }

    // 3. UPDATE — Update payment status (e.g. Pending → Paid)
    public boolean updatePaymentStatus(int paymentId, String newStatus) {
        String sql = "UPDATE Payments SET status = ? WHERE payment_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, newStatus);
            pstmt.setInt(2, paymentId);
            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. DELETE — Delete payment record
    public boolean deletePayment(int paymentId) {
        String sql = "DELETE FROM Payments WHERE payment_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, paymentId);
            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper: map a ResultSet row to a Payment object
    private Payment mapRow(ResultSet rs) throws SQLException {
        return new Payment(
            rs.getInt("payment_id"),
            rs.getInt("reservation_id"),
            rs.getDouble("amount"),
            rs.getString("payment_method"),
            rs.getString("status"),
            rs.getString("payment_date")
        );
    }
}

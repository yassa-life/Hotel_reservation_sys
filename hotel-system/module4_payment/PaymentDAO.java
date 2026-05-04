package module4_payment;

import shared.database.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PaymentDAO {

    public boolean addPayment(Payment payment) {
        String query = "INSERT INTO payments (reservationId, customerId, amount, paymentDate, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, payment.getReservationId());
            stmt.setInt(2, payment.getCustomerId());
            stmt.setDouble(3, payment.getAmount());
            stmt.setTimestamp(4, new java.sql.Timestamp(payment.getPaymentDate().getTime()));
            stmt.setString(5, payment.getPaymentMethod());
            stmt.setString(6, payment.getStatus());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public Payment getPaymentById(int paymentId) {
        String query = "SELECT * FROM payments WHERE paymentId = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, paymentId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return extractPaymentFromResultSet(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Payment> getAllPayments() {
        List<Payment> payments = new ArrayList<>();
        String query = "SELECT * FROM payments";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                payments.add(extractPaymentFromResultSet(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return payments;
    }

    public boolean updatePaymentStatus(int paymentId, String status) {
        String query = "UPDATE payments SET status = ? WHERE paymentId = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, status);
            stmt.setInt(2, paymentId);

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deletePayment(int paymentId) {
        String query = "DELETE FROM payments WHERE paymentId = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setInt(1, paymentId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Payment extractPaymentFromResultSet(ResultSet rs) throws SQLException {
        return new Payment(
                rs.getInt("paymentId"),
                rs.getInt("reservationId"),
                rs.getInt("customerId"),
                rs.getDouble("amount"),
                rs.getTimestamp("paymentDate"),
                rs.getString("paymentMethod"),
                rs.getString("status")
        );
    }
}

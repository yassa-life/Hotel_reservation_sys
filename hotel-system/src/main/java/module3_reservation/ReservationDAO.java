package module3_reservation;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReservationDAO {

    // Helper: map a ResultSet row to a Reservation object
    // Tries to read joined fields (roomNumber, customerName) if present in the result set
    private Reservation mapRow(ResultSet rs) throws SQLException {
        Reservation res = new Reservation(
            rs.getInt("reservation_id"),
            rs.getInt("customer_id"),
            rs.getInt("room_id"),
            rs.getDate("check_in_date"),
            rs.getDate("check_out_date"),
            rs.getString("status"),
            rs.getDouble("total_amount")
        );
        // Joined fields — only set if the column is present
        try { res.setRoomNumber(rs.getString("room_number")); } catch (SQLException ignored) {}
        try { res.setRoomType(rs.getString("type"));          } catch (SQLException ignored) {}
        try { res.setCustomerName(rs.getString("customer_name")); } catch (SQLException ignored) {}
        return res;
    }

    // 1. CREATE Operation
    public boolean makeReservation(Reservation reservation) {
        String sql = "INSERT INTO Reservations (customer_id, room_id, check_in_date, check_out_date, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, reservation.getCustomerId());
            pstmt.setInt(2, reservation.getRoomId());
            pstmt.setDate(3, reservation.getCheckInDate());
            pstmt.setDate(4, reservation.getCheckOutDate());
            pstmt.setString(5, reservation.getStatus());
            pstmt.setDouble(6, reservation.getTotalAmount());

            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. READ Operation — JOIN Rooms + Customers so frontend gets room_number & customer name
    public List<Reservation> getAllReservations() {
        List<Reservation> reservations = new ArrayList<>();
        String sql = "SELECT r.*, rm.room_number, rm.type, c.name AS customer_name " +
                     "FROM Reservations r " +
                     "LEFT JOIN Rooms rm ON r.room_id = rm.room_id " +
                     "LEFT JOIN Customers c ON r.customer_id = c.customer_id " +
                     "ORDER BY r.reservation_id DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                reservations.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reservations;
    }

    // 3. UPDATE Operation
    public boolean updateReservation(Reservation reservation) {
        String sql = "UPDATE Reservations SET room_id = ?, check_in_date = ?, check_out_date = ?, status = ?, total_amount = ? WHERE reservation_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, reservation.getRoomId());
            pstmt.setDate(2, reservation.getCheckInDate());
            pstmt.setDate(3, reservation.getCheckOutDate());
            pstmt.setString(4, reservation.getStatus());
            pstmt.setDouble(5, reservation.getTotalAmount());
            pstmt.setInt(6, reservation.getReservationId());

            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. CANCEL Operation — sets status to 'Cancelled' (does NOT delete the record)
    public boolean cancelReservation(int reservationId) {
        String sql = "UPDATE Reservations SET status = 'Cancelled' WHERE reservation_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, reservationId);
            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 5. READ by Customer — JOIN Rooms so frontend gets room_number
    public List<Reservation> getReservationsByCustomer(int customerId) {
        List<Reservation> reservations = new ArrayList<>();
        String sql = "SELECT r.*, rm.room_number, rm.type, c.name AS customer_name " +
                     "FROM Reservations r " +
                     "LEFT JOIN Rooms rm ON r.room_id = rm.room_id " +
                     "LEFT JOIN Customers c ON r.customer_id = c.customer_id " +
                     "WHERE r.customer_id = ? " +
                     "ORDER BY r.reservation_id DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, customerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    reservations.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reservations;
    }

    // 6. READ by Room (for booked-dates feature — no join needed)
    public List<Reservation> getReservationsByRoom(int roomId) {
        List<Reservation> reservations = new ArrayList<>();
        String sql = "SELECT * FROM Reservations WHERE room_id = ? AND status NOT IN ('Cancelled') ORDER BY check_in_date";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, roomId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    reservations.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reservations;
    }
}

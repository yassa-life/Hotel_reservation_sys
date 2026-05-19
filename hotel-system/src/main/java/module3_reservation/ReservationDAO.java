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

            boolean success = pstmt.executeUpdate() > 0;
            if (success) {
                String roomStatusSql = null;
                if ("Confirmed".equals(reservation.getStatus())) {
                    roomStatusSql = "UPDATE Rooms SET status = 'Booked' WHERE room_id = ?";
                } else if ("CheckedOut".equals(reservation.getStatus()) || "Cancelled".equals(reservation.getStatus())) {
                    roomStatusSql = "UPDATE Rooms SET status = 'Available' WHERE room_id = ?";
                }
                if (roomStatusSql != null) {
                    try (PreparedStatement pstmtRoom = conn.prepareStatement(roomStatusSql)) {
                        pstmtRoom.setInt(1, reservation.getRoomId());
                        pstmtRoom.executeUpdate();
                    }
                }
            }
            return success;

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
            boolean success = pstmt.executeUpdate() > 0;
            if (success) {
                // Find room_id for this reservation to set it as Available
                String findRoomSql = "SELECT room_id FROM Reservations WHERE reservation_id = ?";
                int roomId = -1;
                try (PreparedStatement pstmtFind = conn.prepareStatement(findRoomSql)) {
                    pstmtFind.setInt(1, reservationId);
                    try (ResultSet rs = pstmtFind.executeQuery()) {
                        if (rs.next()) {
                            roomId = rs.getInt("room_id");
                        }
                    }
                }
                if (roomId != -1) {
                    String roomStatusSql = "UPDATE Rooms SET status = 'Available' WHERE room_id = ?";
                    try (PreparedStatement pstmtRoom = conn.prepareStatement(roomStatusSql)) {
                        pstmtRoom.setInt(1, roomId);
                        pstmtRoom.executeUpdate();
                    }
                }
            }
            return success;

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

    // 7. Auto check-out past reservations
    public void autoCheckOutPastReservations() {
        String sql = "SELECT reservation_id, room_id FROM Reservations WHERE status IN ('Pending', 'Confirmed') AND check_out_date <= CURRENT_DATE()";
        String updateResSql = "UPDATE Reservations SET status = 'CheckedOut' WHERE reservation_id = ?";
        String updateRoomSql = "UPDATE Rooms SET status = 'Available' WHERE room_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmtSelect = conn.prepareStatement(sql);
             ResultSet rs = pstmtSelect.executeQuery()) {

            while (rs.next()) {
                int reservationId = rs.getInt("reservation_id");
                int roomId = rs.getInt("room_id");

                try (PreparedStatement pstmtRes = conn.prepareStatement(updateResSql)) {
                    pstmtRes.setInt(1, reservationId);
                    pstmtRes.executeUpdate();
                }
                try (PreparedStatement pstmtRoom = conn.prepareStatement(updateRoomSql)) {
                    pstmtRoom.setInt(1, roomId);
                    pstmtRoom.executeUpdate();
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}

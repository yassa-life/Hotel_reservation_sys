package module6_review;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module 6 - Report Generator
 * Generates summary reports for admin: revenue, occupancy, reservation stats.
 */
public class Report {

    /**
     * Returns a map of summary statistics for the admin dashboard.
     *   - totalRooms, availableRooms, bookedRooms
     *   - totalReservations, confirmedReservations, cancelledReservations
     *   - totalRevenue
     *   - totalCustomers, totalStaff
     */
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> stats = new HashMap<>();
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            // Room stats
            ResultSet rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM Rooms");
            if (rs.next()) stats.put("totalRooms", rs.getInt("total"));

            rs = stmt.executeQuery("SELECT COUNT(*) AS cnt FROM Rooms WHERE status = 'Available'");
            if (rs.next()) stats.put("availableRooms", rs.getInt("cnt"));

            rs = stmt.executeQuery("SELECT COUNT(*) AS cnt FROM Rooms WHERE status = 'Booked'");
            if (rs.next()) stats.put("bookedRooms", rs.getInt("cnt"));

            // Reservation stats
            rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM Reservations");
            if (rs.next()) stats.put("totalReservations", rs.getInt("total"));

            rs = stmt.executeQuery("SELECT COUNT(*) AS cnt FROM Reservations WHERE status = 'Confirmed'");
            if (rs.next()) stats.put("confirmedReservations", rs.getInt("cnt"));

            rs = stmt.executeQuery("SELECT COUNT(*) AS cnt FROM Reservations WHERE status = 'Cancelled'");
            if (rs.next()) stats.put("cancelledReservations", rs.getInt("cnt"));

            // Revenue
            rs = stmt.executeQuery("SELECT COALESCE(SUM(amount),0) AS revenue FROM Payments WHERE status='Paid'");
            if (rs.next()) stats.put("totalRevenue", rs.getDouble("revenue"));

            // People
            rs = stmt.executeQuery("SELECT COUNT(*) AS cnt FROM Customers");
            if (rs.next()) stats.put("totalCustomers", rs.getInt("cnt"));

            rs = stmt.executeQuery("SELECT COUNT(*) AS cnt FROM Staff");
            if (rs.next()) stats.put("totalStaff", rs.getInt("cnt"));

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return stats;
    }

    /**
     * Returns a list of all reservations with customer name and room number joined.
     */
    public List<Map<String, Object>> getFullReservationReport() {
        List<Map<String, Object>> report = new ArrayList<>();
        String sql = "SELECT r.reservation_id, c.name AS customer_name, rm.room_number, rm.type, " +
                     "r.check_in_date, r.check_out_date, r.status, r.total_amount " +
                     "FROM Reservations r " +
                     "JOIN Customers c ON r.customer_id = c.customer_id " +
                     "JOIN Rooms rm ON r.room_id = rm.room_id " +
                     "ORDER BY r.check_in_date DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                row.put("reservationId",   rs.getInt("reservation_id"));
                row.put("customerName",    rs.getString("customer_name"));
                row.put("roomNumber",      rs.getString("room_number"));
                row.put("roomType",        rs.getString("type"));
                row.put("checkIn",         rs.getString("check_in_date"));
                row.put("checkOut",        rs.getString("check_out_date"));
                row.put("status",          rs.getString("status"));
                row.put("totalAmount",     rs.getDouble("total_amount"));
                report.add(row);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return report;
    }

    /**
     * Returns monthly revenue for a given year (defaults to current year if year <= 0).
     * Always returns all 12 months so the chart has a full x-axis.
     */
    public List<Map<String, Object>> getMonthlyRevenue(int year) {
        List<Map<String, Object>> revenue = new ArrayList<>();
        int targetYear = (year > 0) ? year : java.time.LocalDate.now().getYear();

        // Initialise all 12 months with 0 so chart always has full x-axis
        String[] MONTHS = {"Jan","Feb","Mar","Apr","May","Jun",
                           "Jul","Aug","Sep","Oct","Nov","Dec"};
        Map<Integer, Double> monthMap = new java.util.LinkedHashMap<>();
        for (int i = 1; i <= 12; i++) monthMap.put(i, 0.0);

        String sql = "SELECT MONTH(payment_date) AS mon, SUM(amount) AS total " +
                     "FROM Payments WHERE status='Paid' AND YEAR(payment_date) = ? " +
                     "GROUP BY mon ORDER BY mon";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, targetYear);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    monthMap.put(rs.getInt("mon"), rs.getDouble("total"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        for (Map.Entry<Integer, Double> entry : monthMap.entrySet()) {
            Map<String, Object> row = new HashMap<>();
            row.put("month",   MONTHS[entry.getKey() - 1]);
            row.put("revenue", entry.getValue());
            row.put("year",    targetYear);
            revenue.add(row);
        }
        return revenue;
    }
}

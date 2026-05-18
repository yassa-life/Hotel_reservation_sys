package module6_review;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Module 6 - Review DAO
 * CRUD for Reviews table.
 */
public class ReviewDAO {

    // 1. CREATE
    public boolean addReview(Review review) {
        String sql = "INSERT INTO Reviews (reservation_id, customer_id, rating, comment, review_date) VALUES (?, ?, ?, ?, NOW())";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, review.getReservationId());
            pstmt.setInt(2, review.getCustomerId());
            pstmt.setInt(3, review.getRating());
            pstmt.setString(4, review.getComment());

            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. READ — all reviews
    public List<Review> getAllReviews() {
        List<Review> list = new ArrayList<>();
        String sql = "SELECT * FROM Reviews ORDER BY review_date DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // READ — by customer (for user dashboard "My Reviews" page)
    public List<Review> getReviewsByCustomer(int customerId) {
        List<Review> list = new ArrayList<>();
        // JOIN with Reservations so we get room_id and check_in_date for display
        // JOIN with Rooms so we get room_number
        String sql = "SELECT rv.*, res.check_in_date, res.check_out_date, rm.room_number, rm.type AS room_type " +
                     "FROM Reviews rv " +
                     "LEFT JOIN Reservations res ON rv.reservation_id = res.reservation_id " +
                     "LEFT JOIN Rooms rm ON res.room_id = rm.room_id " +
                     "WHERE rv.customer_id = ? " +
                     "ORDER BY rv.review_date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, customerId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Review r = mapRow(rs);
                    // Attach joined fields for UI display
                    r.setRoomNumber(rs.getString("room_number"));
                    r.setRoomType(rs.getString("room_type"));
                    r.setCheckIn(rs.getString("check_in_date"));
                    r.setCheckOut(rs.getString("check_out_date"));
                    list.add(r);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    // READ — by reservation
    public Review getReviewByReservation(int reservationId) {
        String sql = "SELECT * FROM Reviews WHERE reservation_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, reservationId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // 3. UPDATE
    public boolean updateReview(Review review) {
        String sql = "UPDATE Reviews SET rating = ?, comment = ? WHERE review_id = ? AND customer_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, review.getRating());
            pstmt.setString(2, review.getComment());
            pstmt.setInt(3, review.getReviewId());
            pstmt.setInt(4, review.getCustomerId()); // security: only owner can update

            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. DELETE — only allow the owner to delete their review
    public boolean deleteReview(int reviewId, int customerId) {
        String sql = "DELETE FROM Reviews WHERE review_id = ? AND customer_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, reviewId);
            pstmt.setInt(2, customerId);
            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Admin delete (no customer check)
    public boolean deleteReview(int reviewId) {
        String sql = "DELETE FROM Reviews WHERE review_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, reviewId);
            return pstmt.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private Review mapRow(ResultSet rs) throws SQLException {
        return new Review(
            rs.getInt("review_id"),
            rs.getInt("reservation_id"),
            rs.getInt("customer_id"),
            rs.getInt("rating"),
            rs.getString("comment"),
            rs.getString("review_date")
        );
    }
}

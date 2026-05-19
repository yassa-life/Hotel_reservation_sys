package module1_room;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * DAO for the Room_Images table.
 * Handles all CRUD operations for multi-image support on rooms.
 */
public class RoomImageDAO {

    // ── Helper ─────────────────────────────────────────────────────────────────
    private RoomImage mapRow(ResultSet rs) throws SQLException {
        return new RoomImage(
            rs.getInt("image_id"),
            rs.getInt("room_id"),
            rs.getString("image_url"),
            rs.getBoolean("is_primary"),
            rs.getInt("sort_order")
        );
    }

    // ── CREATE ─────────────────────────────────────────────────────────────────
    /**
     * Insert a new image record.
     * @return the generated image_id, or -1 on failure
     */
    public int addImage(RoomImage img) {
        String sql = "INSERT INTO Room_Images (room_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setInt(1, img.getRoomId());
            ps.setString(2, img.getImageUrl());
            ps.setBoolean(3, img.isPrimary());
            ps.setInt(4, img.getSortOrder());
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    // ── READ ───────────────────────────────────────────────────────────────────
    /** All images for a room, ordered by sort_order then image_id */
    public List<RoomImage> getImagesForRoom(int roomId) {
        List<RoomImage> list = new ArrayList<>();
        String sql = "SELECT * FROM Room_Images WHERE room_id = ? ORDER BY sort_order ASC, image_id ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, roomId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    /** Return just the primary (or first) image URL for a room — useful for list views */
    public String getPrimaryImageUrl(int roomId) {
        // Prefer is_primary=1, fall back to lowest sort_order
        String sql = "SELECT image_url FROM Room_Images WHERE room_id = ? ORDER BY is_primary DESC, sort_order ASC, image_id ASC LIMIT 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, roomId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getString("image_url");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────────
    /** Set one image as primary and clear the flag on all others for the same room */
    public boolean setPrimary(int imageId, int roomId) {
        String clearSql = "UPDATE Room_Images SET is_primary = 0 WHERE room_id = ?";
        String setSql   = "UPDATE Room_Images SET is_primary = 1 WHERE image_id = ?";
        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement ps1 = conn.prepareStatement(clearSql);
                 PreparedStatement ps2 = conn.prepareStatement(setSql)) {

                ps1.setInt(1, roomId);  ps1.executeUpdate();
                ps2.setInt(1, imageId); ps2.executeUpdate();
                conn.commit();
                return true;
            } catch (SQLException ex) {
                conn.rollback();
                throw ex;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // ── DELETE ─────────────────────────────────────────────────────────────────
    /** Delete a single image record by its ID */
    public boolean deleteImage(int imageId) {
        String sql = "DELETE FROM Room_Images WHERE image_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, imageId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /** Delete ALL images for a room (e.g. when deleting the room itself) */
    public boolean deleteAllForRoom(int roomId) {
        String sql = "DELETE FROM Room_Images WHERE room_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, roomId);
            ps.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}

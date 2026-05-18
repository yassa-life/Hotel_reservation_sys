package module1_room;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomDAO {

    private final RoomImageDAO imageDAO = new RoomImageDAO();

    // ── Helper: map a ResultSet row to a Room (without images) ────────────────
    private Room mapRow(ResultSet rs) throws SQLException {
        return new Room(
            rs.getInt("room_id"),
            rs.getString("room_number"),
            rs.getString("type"),
            rs.getDouble("price_per_night"),
            rs.getString("status"),
            rs.getString("description")
        );
    }

    // 1. CREATE
    public boolean addRoom(Room room) {
        String sql = "INSERT INTO Rooms (room_number, type, price_per_night, status, description) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, room.getRoomNumber());
            ps.setString(2, room.getType());
            ps.setDouble(3, room.getPricePerNight());
            ps.setString(4, room.getStatus());
            ps.setString(5, room.getDescription());
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2a. READ — all rooms
    public List<Room> getAllRooms() {
        List<Room> rooms = new ArrayList<>();

        // ── Step 1: load all room rows – connection closed before any image queries ──
        String sql = "SELECT * FROM Rooms ORDER BY room_id";
        try (Connection conn = DBConnection.getConnection();
             Statement  stmt = conn.createStatement();
             ResultSet  rs   = stmt.executeQuery(sql)) {

            while (rs.next()) {
                rooms.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return rooms; // return whatever we have
        }

        // ── Step 2: load images for each room (separate connections, RS is closed) ──
        for (Room room : rooms) {
            room.setImages(imageDAO.getImagesForRoom(room.getRoomId()));
        }

        return rooms;
    }

    // 2b. READ — single room by ID
    public Room getRoomById(int roomId) {
        String sql = "SELECT * FROM Rooms WHERE room_id = ?";
        Room room = null;

        // Step 1: fetch room row
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, roomId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) room = mapRow(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        // Step 2: fetch images after connection is closed
        if (room != null) {
            room.setImages(imageDAO.getImagesForRoom(roomId));
        }

        return room;
    }

    // 3. UPDATE
    public boolean updateRoom(Room room) {
        String sql = "UPDATE Rooms SET room_number = ?, type = ?, price_per_night = ?, status = ?, description = ? WHERE room_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, room.getRoomNumber());
            ps.setString(2, room.getType());
            ps.setDouble(3, room.getPricePerNight());
            ps.setString(4, room.getStatus());
            ps.setString(5, room.getDescription());
            ps.setInt(6, room.getRoomId());
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. DELETE — Room_Images are cascade-deleted by the FK constraint
    public boolean deleteRoom(int roomId) {
        String sql = "DELETE FROM Rooms WHERE room_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, roomId);
            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}

package module1_room;

import shared.database.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomDAO {

    // 1. CREATE Operation
    public boolean addRoom(Room room) {
        String sql = "INSERT INTO Rooms (room_number, type, price_per_night, status, description) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, room.getRoomNumber());
            pstmt.setString(2, room.getType());
            pstmt.setDouble(3, room.getPricePerNight());
            pstmt.setString(4, room.getStatus());
            pstmt.setString(5, room.getDescription());
            
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 2. READ Operation (View All)
    public List<Room> getAllRooms() {
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT * FROM Rooms";
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
             
            while (rs.next()) {
                Room room = new Room(
                    rs.getInt("room_id"),
                    rs.getString("room_number"),
                    rs.getString("type"),
                    rs.getDouble("price_per_night"),
                    rs.getString("status"),
                    rs.getString("description")
                );
                rooms.add(room);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rooms;
    }

    // Overloaded READ Operation (Polymorphism)
    public Room getRoomById(int roomId) {
        String sql = "SELECT * FROM Rooms WHERE room_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
             
            pstmt.setInt(1, roomId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new Room(
                        rs.getInt("room_id"),
                        rs.getString("room_number"),
                        rs.getString("type"),
                        rs.getDouble("price_per_night"),
                        rs.getString("status"),
                        rs.getString("description")
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // 3. UPDATE Operation
    public boolean updateRoom(Room room) {
        String sql = "UPDATE Rooms SET room_number = ?, type = ?, price_per_night = ?, status = ?, description = ? WHERE room_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, room.getRoomNumber());
            pstmt.setString(2, room.getType());
            pstmt.setDouble(3, room.getPricePerNight());
            pstmt.setString(4, room.getStatus());
            pstmt.setString(5, room.getDescription());
            pstmt.setInt(6, room.getRoomId());
            
            return pstmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 4. DELETE Operation
    public boolean deleteRoom(int roomId) {
        String sql = "DELETE FROM Rooms WHERE room_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, roomId);
            return pstmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}

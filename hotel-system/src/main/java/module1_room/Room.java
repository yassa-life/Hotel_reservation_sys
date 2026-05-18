package module1_room;

import java.util.ArrayList;
import java.util.List;

public class Room {
    // Encapsulation
    private int    roomId;
    private String roomNumber;
    private String type;
    private double pricePerNight;
    private String status;
    private String description;

    /** All images from Room_Images (populated by RoomDAO.getAllRooms / getRoomById) */
    private List<RoomImage> images = new ArrayList<>();

    // ── Constructors ──────────────────────────────────────────────────────────
    public Room() {}

    public Room(int roomId, String roomNumber, String type,
                double pricePerNight, String status, String description) {
        this.roomId        = roomId;
        this.roomNumber    = roomNumber;
        this.type          = type;
        this.pricePerNight = pricePerNight;
        this.status        = status;
        this.description   = description;
    }

    // ── Getters and Setters ───────────────────────────────────────────────────
    public int    getRoomId()                  { return roomId; }
    public void   setRoomId(int roomId)        { this.roomId = roomId; }

    public String getRoomNumber()              { return roomNumber; }
    public void   setRoomNumber(String v)      { this.roomNumber = v; }

    public String getType()                    { return type; }
    public void   setType(String type)         { this.type = type; }

    public double getPricePerNight()           { return pricePerNight; }
    public void   setPricePerNight(double v)   { this.pricePerNight = v; }

    public String getStatus()                  { return status; }
    public void   setStatus(String status)     { this.status = status; }

    public String getDescription()             { return description; }
    public void   setDescription(String v)     { this.description = v; }

    public List<RoomImage> getImages()              { return images; }
    public void            setImages(List<RoomImage> images) { this.images = images; }

    /** Convenience — returns the URL of the primary image, or null if none */
    public String getPrimaryImageUrl() {
        if (images == null || images.isEmpty()) return null;
        return images.stream()
                     .filter(RoomImage::isPrimary)
                     .map(RoomImage::getImageUrl)
                     .findFirst()
                     .orElse(images.get(0).getImageUrl());
    }
}

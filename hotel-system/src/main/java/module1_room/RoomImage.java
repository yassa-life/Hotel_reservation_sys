package module1_room;

/**
 * Represents a single image record from the Room_Images table.
 */
public class RoomImage {
    private int    imageId;
    private int    roomId;
    private String imageUrl;
    private boolean isPrimary;
    private int    sortOrder;

    public RoomImage() {}

    public RoomImage(int imageId, int roomId, String imageUrl, boolean isPrimary, int sortOrder) {
        this.imageId   = imageId;
        this.roomId    = roomId;
        this.imageUrl  = imageUrl;
        this.isPrimary = isPrimary;
        this.sortOrder = sortOrder;
    }

    public int     getImageId()   { return imageId; }
    public void    setImageId(int imageId) { this.imageId = imageId; }

    public int     getRoomId()    { return roomId; }
    public void    setRoomId(int roomId) { this.roomId = roomId; }

    public String  getImageUrl()  { return imageUrl; }
    public void    setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isPrimary()    { return isPrimary; }
    public void    setPrimary(boolean primary) { isPrimary = primary; }

    public int     getSortOrder() { return sortOrder; }
    public void    setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}

package module6_review;

/**
 * Module 6 - Reports & Admin Features
 * OOP Concepts: Encapsulation (private fields, getters/setters)
 */
public class Review {
    private int    reviewId;
    private int    reservationId;
    private int    customerId;
    private int    rating;       // 1–5
    private String comment;
    private String reviewDate;

    // Joined display fields (not stored in DB — populated by JOIN queries)
    private String roomNumber;
    private String roomType;
    private String checkIn;
    private String checkOut;

    public Review() {}

    public Review(int reviewId, int reservationId, int customerId,
                  int rating, String comment, String reviewDate) {
        this.reviewId      = reviewId;
        this.reservationId = reservationId;
        this.customerId    = customerId;
        this.rating        = rating;
        this.comment       = comment;
        this.reviewDate    = reviewDate;
    }

    // Core fields
    public int    getReviewId()              { return reviewId; }
    public void   setReviewId(int id)        { this.reviewId = id; }

    public int    getReservationId()                   { return reservationId; }
    public void   setReservationId(int reservationId)  { this.reservationId = reservationId; }

    public int    getCustomerId()            { return customerId; }
    public void   setCustomerId(int id)      { this.customerId = id; }

    public int    getRating()                { return rating; }
    public void   setRating(int rating)      { this.rating = rating; }

    public String getComment()               { return comment; }
    public void   setComment(String comment) { this.comment = comment; }

    public String getReviewDate()                  { return reviewDate; }
    public void   setReviewDate(String reviewDate) { this.reviewDate = reviewDate; }

    // Joined display fields
    public String getRoomNumber()                    { return roomNumber; }
    public void   setRoomNumber(String roomNumber)   { this.roomNumber = roomNumber; }

    public String getRoomType()                      { return roomType; }
    public void   setRoomType(String roomType)       { this.roomType = roomType; }

    public String getCheckIn()                       { return checkIn; }
    public void   setCheckIn(String checkIn)         { this.checkIn = checkIn; }

    public String getCheckOut()                      { return checkOut; }
    public void   setCheckOut(String checkOut)       { this.checkOut = checkOut; }
}

package module3_reservation;

import java.sql.Date;

public class Reservation {
    private int    reservationId;
    private int    customerId;
    private int    roomId;
    private Date   checkInDate;
    private Date   checkOutDate;
    private String status;
    private double totalAmount;

    // Joined fields (populated by JOIN queries — not stored in DB)
    private String roomNumber;
    private String roomType;
    private String customerName;

    public Reservation() {}

    public Reservation(int reservationId, int customerId, int roomId,
                       Date checkInDate, Date checkOutDate, String status, double totalAmount) {
        this.reservationId = reservationId;
        this.customerId    = customerId;
        this.roomId        = roomId;
        this.checkInDate   = checkInDate;
        this.checkOutDate  = checkOutDate;
        this.status        = status;
        this.totalAmount   = totalAmount;
    }

    public int    getReservationId()                       { return reservationId; }
    public void   setReservationId(int reservationId)      { this.reservationId = reservationId; }

    public int    getCustomerId()                          { return customerId; }
    public void   setCustomerId(int customerId)            { this.customerId = customerId; }

    public int    getRoomId()                              { return roomId; }
    public void   setRoomId(int roomId)                    { this.roomId = roomId; }

    public Date   getCheckInDate()                         { return checkInDate; }
    public void   setCheckInDate(Date checkInDate)         { this.checkInDate = checkInDate; }

    public Date   getCheckOutDate()                        { return checkOutDate; }
    public void   setCheckOutDate(Date checkOutDate)       { this.checkOutDate = checkOutDate; }

    public String getStatus()                              { return status; }
    public void   setStatus(String status)                 { this.status = status; }

    public double getTotalAmount()                         { return totalAmount; }
    public void   setTotalAmount(double totalAmount)       { this.totalAmount = totalAmount; }

    // Joined fields
    public String getRoomNumber()                          { return roomNumber; }
    public void   setRoomNumber(String roomNumber)         { this.roomNumber = roomNumber; }

    public String getRoomType()                            { return roomType; }
    public void   setRoomType(String roomType)             { this.roomType = roomType; }

    public String getCustomerName()                        { return customerName; }
    public void   setCustomerName(String customerName)     { this.customerName = customerName; }
}

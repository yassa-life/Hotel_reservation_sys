public class Payment {


    //Encapsulation
    private int paymentId;
    private int reservationId;
    private double amount;
    private String paymentMethod; // "Cash" | "Card" | "Online"
    private String status;        // "Paid" | "Pending" | "Refunded"
    private String paymentDate;

    //Payment method constants
    public static final String METHOD_CASH   = "Cash";
    public static final String METHOD_CARD   = "Card";
    public static final String METHOD_ONLINE = "Online";

    public static final String STATUS_PAID    = "Paid";
    public static final String STATUS_PENDING = "Pending";
    public static final String STATUS_REFUNDED = "Refunded";

    // Constructors
    public Payment() {}

    public Payment(int paymentId, int reservationId, double amount,
                   String paymentMethod, String status, String paymentDate) {
        this.paymentId       = paymentId;
        this.reservationId   = reservationId;
        this.amount          = amount;
        this.paymentMethod   = paymentMethod;
        this.status          = status;
        this.paymentDate     = paymentDate;
    }

    // Getters and Setters
    public int getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(int id) {
        this.paymentId = id;
    }

    public int getReservationId() {
        return reservationId;
    }

    public void setReservationId(int reservationId) {
        this.reservationId = reservationId;
    }

    public double getAmount() {
        return amount;
    }
    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }
    public void setPaymentMethod(String paymentMethod)  {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status){
        this.status = status;
    }

    public String getPaymentDate()  {
        return paymentDate;
    }
    public void setPaymentDate(String paymentDate)  {
        this.paymentDate = paymentDate;
    }

    /**
     * Utility: calculates the total cost from price-per-night and number of nights.
     * Demonstrates method responsibility inside the Payment class.
     */
    public static double calculateTotal(double pricePerNight, int nights) {
        return pricePerNight * nights;
    }

    @Override
    public String toString() {
        return "Payment{id=" + paymentId + "," +
                " reservationId=" + reservationId + "," +
                " amount=" + amount +
                ", method=" + paymentMethod +
                ", status=" + status + "}";
    }






}

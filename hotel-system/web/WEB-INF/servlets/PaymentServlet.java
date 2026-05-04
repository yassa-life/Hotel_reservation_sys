package servlets;

import module4_payment.Payment;
import module4_payment.PaymentDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.List;

@WebServlet("/payments/*")
public class PaymentServlet extends HttpServlet {

    private PaymentDAO paymentDAO;

    @Override
    public void init() throws ServletException {
        paymentDAO = new PaymentDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setAccessControlHeaders(response);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String pathInfo = request.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            // Get all payments
            List<Payment> payments = paymentDAO.getAllPayments();
            out.print("[");
            for (int i = 0; i < payments.size(); i++) {
                out.print(paymentToJson(payments.get(i)));
                if (i < payments.size() - 1) {
                    out.print(",");
                }
            }
            out.print("]");
        } else {
            // Get payment by ID
            try {
                int paymentId = Integer.parseInt(pathInfo.substring(1));
                Payment payment = paymentDAO.getPaymentById(paymentId);
                if (payment != null) {
                    out.print(paymentToJson(payment));
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print("{\"error\":\"Payment not found\"}");
                }
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Invalid payment ID\"}");
            }
        }
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setAccessControlHeaders(response);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            int reservationId = Integer.parseInt(request.getParameter("reservationId"));
            int customerId = Integer.parseInt(request.getParameter("customerId"));
            double amount = Double.parseDouble(request.getParameter("amount"));
            String paymentMethod = request.getParameter("paymentMethod");
            String status = request.getParameter("status") != null ? request.getParameter("status") : "Pending";

            Payment payment = new Payment(0, reservationId, customerId, amount, new Date(), paymentMethod, status);
            boolean success = paymentDAO.addPayment(payment);

            if (success) {
                response.setStatus(HttpServletResponse.SC_CREATED);
                out.print("{\"message\":\"Payment created successfully\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"error\":\"Failed to create payment\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Invalid input data\"}");
        }
        out.flush();
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setAccessControlHeaders(response);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String pathInfo = request.getPathInfo();
        if (pathInfo != null && pathInfo.length() > 1) {
            try {
                int paymentId = Integer.parseInt(pathInfo.substring(1));
                String status = request.getParameter("status");

                if (status != null && paymentDAO.updatePaymentStatus(paymentId, status)) {
                    out.print("{\"message\":\"Payment status updated successfully\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print("{\"error\":\"Failed to update payment status\"}");
                }
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Invalid payment ID\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Payment ID is required\"}");
        }
        out.flush();
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        setAccessControlHeaders(response);
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String pathInfo = request.getPathInfo();
        if (pathInfo != null && pathInfo.length() > 1) {
            try {
                int paymentId = Integer.parseInt(pathInfo.substring(1));

                if (paymentDAO.deletePayment(paymentId)) {
                    out.print("{\"message\":\"Payment deleted successfully\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.print("{\"error\":\"Payment not found or delete failed\"}");
                }
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"error\":\"Invalid payment ID\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"Payment ID is required\"}");
        }
        out.flush();
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setAccessControlHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private void setAccessControlHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    private String paymentToJson(Payment p) {
        return "{" +
                "\"paymentId\":" + p.getPaymentId() + "," +
                "\"reservationId\":" + p.getReservationId() + "," +
                "\"customerId\":" + p.getCustomerId() + "," +
                "\"amount\":" + p.getAmount() + "," +
                "\"paymentDate\":\"" + p.getPaymentDate().toString() + "\"," +
                "\"paymentMethod\":\"" + p.getPaymentMethod() + "\"," +
                "\"status\":\"" + p.getStatus() + "\"" +
                "}";
    }
}

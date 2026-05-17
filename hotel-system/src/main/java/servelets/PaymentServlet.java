package servelets;

import module4_payment.Payment;
import module4_payment.PaymentDAO;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet for Module 4 - Payment Handling
 * Handles GET/POST/PUT/DELETE for /api/payments
 */

public class PaymentServlet extends HttpServelt {


    private final PaymentDAO paymentDAO = new PaymentDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String idParam = req.getParameter("reservationId");
        if (idParam != null) {
            Payment p = paymentDAO.getPaymentByReservation(Integer.parseInt(idParam));
            out.print(p != null ? gson.toJson(p) : "{}");
        } else {
            List<Payment> list = paymentDAO.getAllPayments();
            out.print(gson.toJson(list));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        Payment payment = gson.fromJson(req.getReader(), Payment.class);
        boolean success = paymentDAO.addPayment(payment);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        // Update payment status: expects { "paymentId": X, "status": "Paid" }
        Payment payment = gson.fromJson(req.getReader(), Payment.class);
        boolean success = paymentDAO.updatePaymentStatus(payment.getPaymentId(), payment.getStatus());
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        String idParam = req.getParameter("id");
        boolean success = idParam != null && paymentDAO.deletePayment(Integer.parseInt(idParam));
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }


}

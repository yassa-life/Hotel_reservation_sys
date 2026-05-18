package servlets;

import module3_reservation.Reservation;
import module3_reservation.ReservationDAO;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet for Module 3 - Reservation System
 * GET  /api/reservations                → all reservations
 * GET  /api/reservations?customerId=X   → reservations for one customer
 * GET  /api/reservations?roomId=X&bookedDates=true → booked date ranges for a room
 * POST /api/reservations                → create reservation
 * PUT  /api/reservations                → update reservation
 * DELETE /api/reservations?id=X        → cancel reservation
 */
public class ReservationServlet extends HttpServlet {

    private final ReservationDAO reservationDAO = new ReservationDAO();
    private final Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd").create();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String customerIdParam = req.getParameter("customerId");
        String roomIdParam     = req.getParameter("roomId");
        String bookedDates     = req.getParameter("bookedDates");

        if (roomIdParam != null && "true".equals(bookedDates)) {
            // Return booked date ranges for a specific room
            List<Reservation> list = reservationDAO.getReservationsByRoom(Integer.parseInt(roomIdParam));
            out.print(gson.toJson(list));
        } else if (customerIdParam != null) {
            // Return reservations for a specific customer
            List<Reservation> list = reservationDAO.getReservationsByCustomer(Integer.parseInt(customerIdParam));
            out.print(gson.toJson(list));
        } else {
            // Return all reservations
            List<Reservation> list = reservationDAO.getAllReservations();
            out.print(gson.toJson(list));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        Reservation reservation = gson.fromJson(req.getReader(), Reservation.class);
        boolean success = reservationDAO.makeReservation(reservation);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        Reservation reservation = gson.fromJson(req.getReader(), Reservation.class);
        boolean success = reservationDAO.updateReservation(reservation);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        String idParam = req.getParameter("id");
        // cancelReservation now does UPDATE status='Cancelled', NOT a physical delete
        boolean success = idParam != null && reservationDAO.cancelReservation(Integer.parseInt(idParam));
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

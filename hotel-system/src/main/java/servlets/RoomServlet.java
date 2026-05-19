package servlets;

import module1_room.Room;
import module1_room.RoomDAO;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet for Module 1 - Room Management
 * Handles GET/POST/PUT/DELETE for /api/rooms
 */
public class RoomServlet extends HttpServlet {

    private final RoomDAO roomDAO = new RoomDAO();
    private final Gson gson       = new Gson();

    // GET /api/rooms        → all rooms
    // GET /api/rooms?id=X   → single room
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String idParam = req.getParameter("id");
        if (idParam != null) {
            Room room = roomDAO.getRoomById(Integer.parseInt(idParam));
            out.print(room != null ? gson.toJson(room) : "{}");
        } else {
            List<Room> rooms = roomDAO.getAllRooms();
            out.print(gson.toJson(rooms));
        }
    }

    // POST /api/rooms → add room
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        Room room = gson.fromJson(req.getReader(), Room.class);
        boolean success = roomDAO.addRoom(room);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    // PUT /api/rooms → update room
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        Room room = gson.fromJson(req.getReader(), Room.class);
        boolean success = roomDAO.updateRoom(room);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    // DELETE /api/rooms?id=X
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        String idParam = req.getParameter("id");
        boolean success = idParam != null && roomDAO.deleteRoom(Integer.parseInt(idParam));
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    // OPTIONS pre-flight
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

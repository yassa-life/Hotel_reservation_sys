package servlets;

import module5_admin.Staff;
import module5_admin.StaffDAO;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet for Module 5 - Staff Management
 * Handles GET/POST/PUT/DELETE for /api/staff
 * Also handles /api/staff/login
 */
public class StaffServlet extends HttpServlet {

    private final StaffDAO staffDAO = new StaffDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String idParam = req.getParameter("id");
        if (idParam != null) {
            Staff s = staffDAO.getStaffById(Integer.parseInt(idParam));
            out.print(s != null ? gson.toJson(s) : "{}");
        } else {
            List<Staff> list = staffDAO.getAllStaff();
            out.print(gson.toJson(list));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");

        // Check if this is a login request
        if (req.getRequestURI().contains("/login")) {
            Staff credentials = gson.fromJson(req.getReader(), Staff.class);
            Staff found = staffDAO.login(credentials.getEmail(), credentials.getPassword());
            if (found != null) {
                resp.getWriter().print("{\"success\":true,\"staff\":" + gson.toJson(found) + "}");
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().print("{\"success\":false,\"message\":\"Invalid credentials\"}");
            }
            return;
        }

        // Add new staff
        Staff staff = gson.fromJson(req.getReader(), Staff.class);
        boolean success = staffDAO.addStaff(staff);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        Staff staff = gson.fromJson(req.getReader(), Staff.class);
        boolean success = staffDAO.updateStaff(staff);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        String idParam = req.getParameter("id");
        boolean success = idParam != null && staffDAO.deleteStaff(Integer.parseInt(idParam));
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

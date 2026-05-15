package servlets;

import module2_customer.Customer;
import module2_customer.CustomerDAO;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet for Module 2 - Customer Management
 * Handles GET/POST/PUT/DELETE for /api/customers
 * Also handles POST /api/customers/login
 */
public class CustomerServlet extends HttpServlet {

    private final CustomerDAO customerDAO = new CustomerDAO();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String idParam = req.getParameter("id");
        if (idParam != null) {
            Customer c = customerDAO.getCustomerById(Integer.parseInt(idParam));
            out.print(c != null ? gson.toJson(c) : "{}");
        } else {
            List<Customer> list = customerDAO.getAllCustomers();
            // Strip passwords before sending to browser
            list.forEach(c -> c.setPassword(null));
            out.print(gson.toJson(list));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");

        // Route: POST /api/customers/login
        if (req.getRequestURI().contains("/login")) {
            Customer credentials = gson.fromJson(req.getReader(), Customer.class);
            Customer found = customerDAO.loginCustomer(credentials.getEmail(), credentials.getPassword());
            if (found != null) {
                found.setPassword(null); // never send password back
                resp.getWriter().print("{\"success\":true,\"customer\":" + gson.toJson(found) + "}");
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().print("{\"success\":false,\"message\":\"Invalid email or password\"}");
            }
            return;
        }

        // Route: POST /api/customers  → register new customer
        Customer customer = gson.fromJson(req.getReader(), Customer.class);
        boolean success = customerDAO.registerCustomer(customer);
        if (success) {
            // Fetch the newly created record so we can return the real customer_id
            Customer created = customerDAO.loginCustomer(customer.getEmail(), customer.getPassword());
            if (created != null) {
                created.setPassword(null);
                resp.getWriter().print("{\"success\":true,\"customer\":" + gson.toJson(created) + "}");
            } else {
                resp.getWriter().print("{\"success\":true}");
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_CONFLICT);
            resp.getWriter().print("{\"success\":false,\"message\":\"Email already registered\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        Customer customer = gson.fromJson(req.getReader(), Customer.class);
        boolean success = customerDAO.updateCustomer(customer);
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        String idParam = req.getParameter("id");
        boolean success = idParam != null && customerDAO.deleteCustomer(Integer.parseInt(idParam));
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

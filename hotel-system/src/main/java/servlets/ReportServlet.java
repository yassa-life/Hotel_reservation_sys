package servlets;

import module6_review.Report;
import module6_review.Review;
import module6_review.ReviewDAO;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * Servlet for Module 6 - Reports & Reviews
 *
 * GET  /api/reports               → dashboard summary
 * GET  /api/reports/full          → full reservation report
 * GET  /api/reports/revenue?year  → monthly revenue (defaults to current year)
 * GET  /api/reviews               → all reviews
 * GET  /api/reviews?customerId=X  → reviews for a specific customer (with room join)
 * POST /api/reviews               → add review
 * PUT  /api/reviews               → update review (rating + comment)
 * DELETE /api/reviews?id=X&customerId=Y → delete (owner-safe; omit customerId for admin)
 */
public class ReportServlet extends HttpServlet {

    private final Report    report    = new Report();
    private final ReviewDAO reviewDAO = new ReviewDAO();
    private final Gson      gson      = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        String uri = req.getRequestURI();

        if (uri.contains("/reports/full")) {
            out.print(gson.toJson(report.getFullReservationReport()));

        } else if (uri.contains("/reports/revenue")) {
            String yearParam = req.getParameter("year");
            int year = 0;
            try { if (yearParam != null) year = Integer.parseInt(yearParam); } catch (NumberFormatException ignored) {}
            out.print(gson.toJson(report.getMonthlyRevenue(year)));

        } else if (uri.contains("/reviews")) {
            String custParam = req.getParameter("customerId");
            if (custParam != null) {
                // Return only this customer's reviews (with room join)
                List<Review> reviews = reviewDAO.getReviewsByCustomer(Integer.parseInt(custParam));
                out.print(gson.toJson(reviews));
            } else {
                out.print(gson.toJson(reviewDAO.getAllReviews()));
            }

        } else {
            // default: dashboard summary
            out.print(gson.toJson(report.getDashboardSummary()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        if (req.getRequestURI().contains("/reviews")) {
            Review review = gson.fromJson(req.getReader(), Review.class);
            boolean success = reviewDAO.addReview(review);
            resp.getWriter().print("{\"success\":" + success + "}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        if (req.getRequestURI().contains("/reviews")) {
            Review review = gson.fromJson(req.getReader(), Review.class);
            boolean success = reviewDAO.updateReview(review);
            resp.getWriter().print("{\"success\":" + success + "}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");
        String idParam   = req.getParameter("id");
        String custParam = req.getParameter("customerId");

        if (idParam == null) {
            resp.getWriter().print("{\"success\":false,\"message\":\"Missing id\"}");
            return;
        }

        boolean success;
        if (custParam != null) {
            // Owner-safe delete: only allows the customer to delete their own review
            success = reviewDAO.deleteReview(Integer.parseInt(idParam), Integer.parseInt(custParam));
        } else {
            // Admin delete (no ownership check)
            success = reviewDAO.deleteReview(Integer.parseInt(idParam));
        }
        resp.getWriter().print("{\"success\":" + success + "}");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin",  "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
}

package servlets;

import module1_room.RoomImage;
import module1_room.RoomImageDAO;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.*;
import java.util.List;

/**
 * Accepts a plain JSON body with an image URL and saves it to Room_Images.
 * Use this when the user wants to paste a URL instead of uploading a file.
 *
 * POST /api/rooms/imageurl
 *   Body: { "roomId": 1, "imageUrl": "https://..." }
 *   → { "success": true, "image": { imageId, roomId, imageUrl, isPrimary, sortOrder } }
 */
public class RoomImageUrlServlet extends HttpServlet {

    private final RoomImageDAO imageDAO = new RoomImageDAO();
    private final Gson         gson     = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");

        try {
            JsonObject body = gson.fromJson(req.getReader(), JsonObject.class);

            if (body == null || !body.has("roomId") || !body.has("imageUrl")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().print("{\"success\":false,\"message\":\"roomId and imageUrl required\"}");
                return;
            }

            int    roomId   = body.get("roomId").getAsInt();
            String imageUrl = body.get("imageUrl").getAsString().trim();

            if (imageUrl.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().print("{\"success\":false,\"message\":\"imageUrl cannot be empty\"}");
                return;
            }

            // Determine sort order and whether this is the first (primary) image
            List<RoomImage> existing = imageDAO.getImagesForRoom(roomId);
            int     sortOrder = existing.size();
            boolean isPrimary = existing.isEmpty();

            RoomImage img = new RoomImage(0, roomId, imageUrl, isPrimary, sortOrder);
            int newId = imageDAO.addImage(img);

            if (newId > 0) {
                img.setImageId(newId);
                resp.getWriter().print("{\"success\":true,\"image\":" + gson.toJson(img) + "}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().print("{\"success\":false,\"message\":\"Failed to save image URL\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"success\":false,\"message\":\"Server error: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin",  "*");
        resp.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
}

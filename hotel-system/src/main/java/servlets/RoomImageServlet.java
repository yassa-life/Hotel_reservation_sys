package servlets;

import module1_room.RoomImage;
import module1_room.RoomImageDAO;
import com.google.gson.Gson;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.*;
import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * Servlet for Room Image Management — Multi-image support
 *
 * GET    /api/rooms/image?roomId=X
 *   → returns JSON array of all images for the room
 *
 * POST   /api/rooms/image?roomId=X   multipart/form-data  field: "image"
 *   → saves file, inserts a new Room_Images row
 *   → returns { "success": true, "image": { imageId, roomId, imageUrl, isPrimary, sortOrder } }
 *
 * PUT    /api/rooms/image?imageId=X&roomId=X&action=setPrimary
 *   → marks one image as primary for its room
 *   → returns { "success": true }
 *
 * DELETE /api/rooms/image?imageId=X
 *   → removes one image record (file stays on disk — cheap cleanup)
 *   → returns { "success": true }
 */
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024,       // 1 MB threshold before writing to disk
    maxFileSize       = 10 * 1024 * 1024,  // 10 MB per file
    maxRequestSize    = 50 * 1024 * 1024   // 50 MB total (allows multiple files later)
)
public class RoomImageServlet extends HttpServlet {

    private static final String UPLOAD_DIR = "uploads/rooms";
    private final RoomImageDAO imageDAO = new RoomImageDAO();
    private final Gson         gson     = new Gson();

    // ── GET: list images for a room ──────────────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");

        String roomIdParam = req.getParameter("roomId");
        if (roomIdParam == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print("{\"success\":false,\"message\":\"roomId required\"}");
            return;
        }
        List<RoomImage> images = imageDAO.getImagesForRoom(Integer.parseInt(roomIdParam));
        resp.getWriter().print(gson.toJson(images));
    }

    // ── POST: upload a new image ─────────────────────────────────────────────
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");

        String roomIdParam = req.getParameter("roomId");
        if (roomIdParam == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print("{\"success\":false,\"message\":\"roomId required\"}");
            return;
        }
        int roomId = Integer.parseInt(roomIdParam);

        Part filePart = req.getPart("image");
        if (filePart == null || filePart.getSize() == 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print("{\"success\":false,\"message\":\"No image file received\"}");
            return;
        }

        // Resolve / create upload directory inside webapp root
        String appPath  = getServletContext().getRealPath("/");
        Path uploadPath = Paths.get(appPath, UPLOAD_DIR);
        Files.createDirectories(uploadPath);

        // Unique file name
        String original = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
        String ext      = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".jpg";
        String fileName = "room_" + roomId + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
        Path   filePath = uploadPath.resolve(fileName);

        try (InputStream in = filePart.getInputStream()) {
            Files.copy(in, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        String relativeUrl = "/" + UPLOAD_DIR + "/" + fileName;

        // Determine sort order (append at end)
        List<RoomImage> existing = imageDAO.getImagesForRoom(roomId);
        int sortOrder = existing.size();
        boolean isPrimary = existing.isEmpty(); // first image auto-becomes primary

        RoomImage img = new RoomImage(0, roomId, relativeUrl, isPrimary, sortOrder);
        int newId = imageDAO.addImage(img);

        if (newId > 0) {
            img.setImageId(newId);
            resp.getWriter().print("{\"success\":true,\"image\":" + gson.toJson(img) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().print("{\"success\":false,\"message\":\"DB insert failed\"}");
        }
    }

    // ── PUT: set primary image ───────────────────────────────────────────────
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");

        String imageIdParam = req.getParameter("imageId");
        String roomIdParam  = req.getParameter("roomId");
        String action       = req.getParameter("action");

        if (imageIdParam == null || roomIdParam == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print("{\"success\":false,\"message\":\"imageId and roomId required\"}");
            return;
        }

        if ("setPrimary".equals(action)) {
            boolean ok = imageDAO.setPrimary(Integer.parseInt(imageIdParam), Integer.parseInt(roomIdParam));
            resp.getWriter().print("{\"success\":" + ok + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print("{\"success\":false,\"message\":\"Unknown action\"}");
        }
    }

    // ── DELETE: remove one image ─────────────────────────────────────────────
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        setCorsHeaders(resp);
        resp.setContentType("application/json");

        String imageIdParam = req.getParameter("imageId");
        if (imageIdParam == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().print("{\"success\":false,\"message\":\"imageId required\"}");
            return;
        }
        boolean ok = imageDAO.deleteImage(Integer.parseInt(imageIdParam));
        resp.getWriter().print("{\"success\":" + ok + "}");
    }

    // ── OPTIONS pre-flight ───────────────────────────────────────────────────
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

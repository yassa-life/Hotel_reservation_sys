package shared;

import module3_reservation.ReservationDAO;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class AutoCheckOutListener implements ServletContextListener {

    private ScheduledExecutorService scheduler;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        scheduler = Executors.newSingleThreadScheduledExecutor();
        // Run once every day. Runs immediately on startup, then every 24 hours.
        scheduler.scheduleAtFixedRate(() -> {
            try {
                System.out.println("[AutoCheckOutScheduler] Running auto-checkout task...");
                ReservationDAO dao = new ReservationDAO();
                dao.autoCheckOutPastReservations();
                System.out.println("[AutoCheckOutScheduler] Task finished.");
            } catch (Exception e) {
                System.err.println("[AutoCheckOutScheduler] Error during auto-checkout task:");
                e.printStackTrace();
            }
        }, 0, 1, TimeUnit.DAYS);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        if (scheduler != null) {
            scheduler.shutdownNow();
        }
    }
}

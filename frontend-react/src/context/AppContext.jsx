import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ─── Toast Context ────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error:   <AlertCircle size={18} className="text-red-500" />,
    info:    <Info size={18} className="text-blue-500" />,
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div key={t.id}
            className="toast-enter flex items-start gap-3 bg-white border border-light-gray
                       rounded-xl shadow-card-hover px-4 py-3 min-w-[280px]">
            {icons[t.type]}
            <p className="text-sm text-dark-text flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-mid-gray hover:text-dark-text">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ─── Auth Context — persists session in localStorage ─────────────────────────
const AuthContext = createContext(null);

const USER_KEY  = 'hrv_user';
const ADMIN_KEY = 'hrv_admin';

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Initialise from localStorage so session survives page refresh
  const [user,  setUser]  = useState(() => readStorage(USER_KEY));
  const [admin, setAdmin] = useState(() => readStorage(ADMIN_KEY));

  // Keep localStorage in sync whenever state changes
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else      localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    else       localStorage.removeItem(ADMIN_KEY);
  }, [admin]);

  const loginUser   = (data) => setUser(data);
  const loginAdmin  = (data) => setAdmin(data);
  const logoutUser  = () => setUser(null);
  const logoutAdmin = () => setAdmin(null);

  return (
    <AuthContext.Provider value={{ user, admin, loginUser, loginAdmin, logoutUser, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

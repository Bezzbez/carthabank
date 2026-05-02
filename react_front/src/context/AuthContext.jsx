import useAuthStore from '../store/authStore';

// We export useAuth so that legacy components don't break.
// They will now transparently use the highly optimized Zustand store!
export const useAuth = useAuthStore;

// A dummy provider so <AuthProvider> in App.js doesn't crash, 
// though it's no longer needed for Zustand.
export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};

export default useAuthStore;

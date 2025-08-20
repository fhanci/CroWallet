import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : { id: "A", username: "" , email:  ""};
  });

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const setUserInfo = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const clearUser = () => {
    setUser({ id: "" , username: "" , email:  ""});
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, setUserInfo, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

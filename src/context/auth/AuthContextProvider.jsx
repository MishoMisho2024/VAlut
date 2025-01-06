import React, { createContext, useContext, useEffect, useReducer } from "react";
import { initialState, reducer } from "./reducer";
import jwtDecode from "jwt-decode";
import { authenticateAction, logOutAction } from "./actions";
import { isTokenValid } from "../../utils/jwt";

const authContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token && isTokenValid(token)) {
      dispatch(authenticateAction(token));

      // Decode the token to get its expiry time
      const { exp } = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000); // Current time in seconds

      if (exp > now) {
        // Calculate the remaining time in milliseconds
        const remainingTime = (exp - now) * 1000;

        // Set a timeout to log out the user when the token expires
        const tokenExpiryTimer = setTimeout(() => {
          dispatch(logOutAction());
        }, remainingTime);

        // Clear timeout on cleanup
        return () => clearTimeout(tokenExpiryTimer);
      } else {
        // Token is already expired, log out the user immediately
        dispatch(logOutAction());
      }
    }
  }, [dispatch]);

  return (
    <authContext.Provider value={{ state, dispatch }}>
      {children}
    </authContext.Provider>
  );
};

const useAuthContext = () => {
  const AuthContext = useContext(authContext);
  if (!AuthContext) {
    throw new Error("auth context is not working");
  }
  return AuthContext;
};

export { AuthContextProvider, useAuthContext };
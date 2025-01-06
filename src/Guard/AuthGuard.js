import React from "react";
import { useAuthContext } from "../context/auth/AuthContextProvider";
import { Link } from "react-router-dom";
import { SIGN_IN_PAGE, SIGN_UP_PAGE } from "../constants/routes";

const AuthGuard = ({ children }) => {
  const { state } = useAuthContext();

  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f6f6f6",
    },
    box: {
      background: "white",
      padding: "40px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
      maxWidth: "400px",
      width: "100%",
    },
    heading: {
      marginBottom: "20px",
      fontSize: "24px",
      color: "#333",
    },
    subheading: {
      fontSize: "16px",
      marginBottom: "30px",
      color: "#555",
    },
    button: {
      backgroundColor: "#007c89",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
      textDecoration: "none",
      margin: "10px",
    },
    link: {
      color: "white",
      textDecoration: "none",
    },
  };

  return (
    <>
      {state.isAuthenticated ? (
        children
      ) : (
        <div style={styles.container}>
          <div style={styles.box}>
            <h1 style={styles.heading}>You are not AUTHENTICATED</h1>
            <h4 style={styles.subheading}>Please sign in or sign up</h4>
            <button style={styles.button}>
              <Link to={SIGN_IN_PAGE} style={styles.link}>
                Sign IN
              </Link>
            </button>
            <button style={styles.button}>
              <Link to={SIGN_UP_PAGE} style={styles.link}>
                Sign UP
              </Link>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthGuard;
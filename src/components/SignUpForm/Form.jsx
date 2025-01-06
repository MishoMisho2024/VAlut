import React, { useState } from "react";
import { signUp } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { HOME_PAGE, SIGN_IN_PAGE } from "../../constants/routes";

const Form = () => {
  const [info, setInfo] = useState({
    userName: "",
    password: "",
    email: "",
  });
  const navigate = useNavigate();

  const signUpHandler = (e) => {
    e.preventDefault();
    signUp(info)
      .then(() => {
        navigate(SIGN_IN_PAGE, { state: { success: true } });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const styles = {
    formWrapper: {
      width: "100%",
      maxWidth: "400px",
      margin: "50px auto",
      padding: "20px",
      borderRadius: "10px",
      background: "#fff",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    header: {
      fontSize: "24px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "10px",
    },
    subText: {
      textAlign: "center",
      fontSize: "14px",
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
    },
    button: {
      width: "100%",
      padding: "12px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "white",
      backgroundColor: "#007C89",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    link: {
      display: "block",
      marginTop: "10px",
      fontSize: "14px",
      textAlign: "center",
      color: "#007C89",
      textDecoration: "none",
    },
    linkHover: {
      textDecoration: "underline",
    },
  };

  return (
    <form style={styles.formWrapper}>
      <h2 style={styles.header}>Sign Up</h2>
      <p style={styles.subText}>
        Already have an account?{" "}
        <Link to={SIGN_IN_PAGE} style={{ color: "#007C89", textDecoration: "none" }}>
          Log in
        </Link>
      </p>

      <label htmlFor="userName" style={styles.label}>
        Username
      </label>
      <input
        autoComplete="true"
        type="text"
        name="userName"
        placeholder="Enter your username"
        style={styles.input}
        onChange={(e) =>
          setInfo((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
          })
        }
      />

      <label htmlFor="email" style={styles.label}>
        Email
      </label>
      <input
        autoComplete="true"
        type="email"
        name="email"
        placeholder="Enter your email"
        style={styles.input}
        onChange={(e) =>
          setInfo((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
          })
        }
      />

      <label htmlFor="password" style={styles.label}>
        Password
      </label>
      <input
        autoComplete="true"
        type="password"
        name="password"
        placeholder="Enter your password"
        style={styles.input}
        onChange={(e) =>
          setInfo((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
          })
        }
      />

      <button type="submit" onClick={signUpHandler} style={styles.button}>
        Sign Up
      </button>
      <Link to={HOME_PAGE} style={styles.link}>
        Back to Home
      </Link>
    </form>
  );
};

export default Form;
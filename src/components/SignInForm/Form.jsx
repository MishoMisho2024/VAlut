import React, { useState } from "react";
import { signIn } from "../../api/auth";
import { useAuthContext } from "../../context/auth/AuthContextProvider";
import { logInAction } from "../../context/auth/actions";
import { Link, useNavigate } from "react-router-dom";
import { HOME_PAGE } from "../../constants/routes";
import { PacmanLoader } from "react-spinners";

const Form = () => {
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const [info, setInfo] = useState({
    userName: "",
    password: "",
    error: "",
  });
  const [loading, setLoading] = useState(false);

  const submitHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    setInfo((prev) => ({ ...prev, error: "" }));
    signIn(info)
      .then((data) => {
        dispatch(logInAction(data));
        navigate(HOME_PAGE);
      })
      .catch((err) => {
        setInfo((prev) => ({ ...prev, error: err.message }));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const styles = {
    formWrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      maxWidth: "400px",
      margin: "50px auto",
      padding: "20px",
      borderRadius: "15px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      background: "white",
    },
    label: {
      fontSize: "14px",
      marginBottom: "5px",
      alignSelf: "flex-start",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "10px",
      fontSize: "16px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.05)",
    },
    button: {
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      fontSize: "16px",
      fontWeight: "bold",
      color: "white",
      background: "linear-gradient(to right, #9d50bb, #6e48aa)",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    buttonHover: {
      opacity: "0.9",
    },
    error: {
      color: "red",
      fontSize: "14px",
      textAlign: "center",
    },
    link: {
      textDecoration: "none",
      color: "#6e48aa",
      fontSize: "14px",
      marginTop: "10px",
    },
    linkHover: {
      textDecoration: "underline",
    },
    loader: {
      margin: "15px 0",
    },
  };

  return (
    <form style={styles.formWrapper}>
      <h2>Login</h2>
      <label htmlFor="userName" style={styles.label}>
        User Name or Email
      </label>
      <input
        autoComplete="true"
        value={info.userName}
        type="text"
        name="userName"
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
        value={info.password}
        type="password"
        name="password"
        style={styles.input}
        onChange={(e) =>
          setInfo((prev) => {
            return { ...prev, [e.target.name]: e.target.value };
          })
        }
      />
      {loading && (
        <div style={styles.loader}>
          <PacmanLoader color="#36d7b7" />
        </div>
      )}
      {info.error && <h4 style={styles.error}>{info.error}</h4>}
      <button onClick={submitHandler} style={styles.button}>
        Login
      </button>
      <Link to={HOME_PAGE} style={styles.link}>
        Sign Up
      </Link>
    </form>
  );
};

export default Form;
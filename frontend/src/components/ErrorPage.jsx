import React from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from "i18next";

const ErrorPage = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      textAlign: 'center',
      padding: '50px',
      fontFamily: 'sans-serif',
    },
    heading: {
      fontSize: '3rem',
      color: '#ff4c4c',
    },
    paragraph: {
      fontSize: '1.2rem',
      margin: '20px 0',
    },
    button: {
      padding: '10px 20px',
      fontSize: '1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '5px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{t("pageNotFound")} </h1>
      <p style={styles.paragraph}>{t("noPageError")} </p>
      <button style={styles.button} onClick={() => navigate('/')}>
        {t("returnMain")}
      </button>
    </div>
  );
};

export default ErrorPage;

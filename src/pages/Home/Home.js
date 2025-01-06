import React, { useState, useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuthContext } from "../../context/auth/AuthContextProvider";
import { logOutAction } from "../../context/auth/actions";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const Home = () => {
  const { dispatch } = useAuthContext();
  const canvasRef = useRef(null);
  const [chart, setChart] = useState(null);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("EUR");

  const currenciesPerPage = 20;
  const ratesAPIKey = "68debe51aceb485995c825817f033312";
  const ratesAPIUrl = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${ratesAPIKey}`;
  const graphAPIKey = "ssY54om8IqCccngLw8rlFC8lrCtI4bvU";
  const years = Array.from({ length: new Date().getFullYear() - 2010 + 1 }, (_, i) => 2010 + i);

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      margin: "20px auto",
      maxWidth: "1000px",
      padding: "20px",
      backgroundColor: "#1E1E2F",
      color: "#E4E6EB",
      borderRadius: "10px",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
    },
    header: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#00c6ff",
    },
    logoutButton: {
      backgroundColor: "#d9534f",
      color: "white",
      padding: "10px 15px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginBottom: "20px",
    },
    calculator: {
      background: "#2C2C3C",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    },
    inputBox: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #00c6ff",
      borderRadius: "5px",
      backgroundColor: "#1E1E2F",
      color: "#E4E6EB",
      fontSize: "16px",
    },
    dropdown: {
      width: "48%",
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #00c6ff",
      borderRadius: "5px",
      backgroundColor: "#1E1E2F",
      color: "#E4E6EB",
      marginRight: "2%",
    },
    convertButton: {
      backgroundColor: "#00c6ff",
      color: "#1E1E2F",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      cursor: "pointer",
    },
    calculatorResult: {
      marginTop: "10px",
      padding: "15px",
      borderRadius: "5px",
      textAlign: "center",
      backgroundColor: "#00c6ff",
      color: "#1E1E2F",
      fontSize: "18px",
    },
    ratesTable: {
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      backgroundColor: "#2C2C3C",
    },
    styledTable: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "16px",
      color: "#E4E6EB",
      textAlign: "left",
    },
    tableHeader: {
      backgroundColor: "#00c6ff",
      color: "#1E1E2F",
      fontWeight: "bold",
    },
    tableCell: {
      padding: "12px",
      borderBottom: "1px solid #444",
    },
    evenRow: {
      backgroundColor: "#29293B",
    },
    oddRow: {
      backgroundColor: "#20202C",
    },
    searchBox: {
      width: "100%",
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #00c6ff",
      marginBottom: "15px",
      backgroundColor: "#1E1E2F",
      color: "#E4E6EB",
    },
    graph: {
      background: "#2C2C3C",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      color: "#E4E6EB",
    },
  };

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(ratesAPIUrl);
        if (!response.ok) throw new Error("Failed to fetch exchange rates");
        const data = await response.json();
        setRates(data.rates);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchExchangeRates();
  }, []);

  const handleConvert = () => {
    if (rates) {
      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];
      const result = (amount * toRate) / fromRate;
      setConvertedAmount(result.toFixed(2));
    }
  };

  const paginateCurrencies = () => {
    if (!rates) return [];
    const filteredCurrencies = Object.keys(rates).filter((currency) =>
      currency.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const startIndex = (currentPage - 1) * currenciesPerPage;
    const endIndex = currentPage * currenciesPerPage;
    return filteredCurrencies.slice(startIndex, endIndex);
  };

  const fetchGraphData = async (currency) => {
    const labels = years;
    const values = [];
    for (const year of years) {
      const date = `${year}-03-20`;
      try {
        const response = await fetch(
          `https://api.currencybeacon.com/v1/historical?api_key=${graphAPIKey}&base=USD&date=${date}&symbols=${currency}`
        );
        const data = await response.json();
        values.push(data.rates[currency] || null);
      } catch {
        values.push(null);
      }
    }
    buildGraph(currency, labels, values);
  };

  const buildGraph = (currency, labels, values) => {
    const ctx = canvasRef.current.getContext("2d");
    if (chart) chart.destroy();
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Exchange Rate (USD to ${currency})`,
            data: values,
            borderColor: "#00c6ff",
            backgroundColor: "rgba(0, 198, 255, 0.2)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Exchange Rate Trend (USD to ${currency})`,
          },
        },
        scales: {
          x: { title: { display: true, text: "Year" } },
          y: { title: { display: true, text: "Exchange Rate" } },
        },
      },
    });
    setChart(newChart);
  };

  useEffect(() => {
    fetchGraphData(currency);
  }, [currency]);

  return (
    <div style={styles.container}>
      <button style={styles.logoutButton} onClick={() => dispatch(logOutAction())}>
        Log Out
      </button>

      <div style={styles.calculator}>
        <h1 style={styles.header}>Currency Calculator</h1>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          style={styles.inputBox}
        />
        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} style={styles.dropdown}>
          {rates && Object.keys(rates).map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} style={styles.dropdown}>
          {rates && Object.keys(rates).map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <button onClick={handleConvert} style={styles.convertButton}>
          Convert
        </button>
        {convertedAmount && (
          <div style={styles.calculatorResult}>
            {amount} {fromCurrency} = {convertedAmount} {toCurrency}
          </div>
        )}
      </div>

      <div style={styles.ratesTable}>
        <h1 style={styles.header}>Exchange Rates</h1>
        <input
          type="text"
          placeholder="Search currencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchBox}
        />
        <table style={styles.styledTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Currency</th>
              <th style={styles.tableHeader}>Exchange Rate</th>
            </tr>
          </thead>
          <tbody>
            {paginateCurrencies().map((currency, index) => (
              <tr
                key={currency}
                style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
              >
                <td style={styles.tableCell}>{currency}</td>
                <td style={styles.tableCell}>{rates[currency]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.graph}>
        <h1 style={styles.header}>Currency Trend</h1>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={styles.inputBox}>
          {rates && Object.keys(rates).map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <canvas ref={canvasRef} style={{ maxHeight: "400px", marginTop: "20px" }} />
      </div>
    </div>
  );
};

export default Home;

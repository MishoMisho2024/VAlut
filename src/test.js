import React, { useEffect, useState } from "react";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from "chart.js";

// Register necessary components for Chart.js
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const Home = () => {
  const [currency, setCurrency] = useState("EUR"); // Default currency
  const [chart, setChart] = useState(null); // Chart.js instance
  const [suggestions, setSuggestions] = useState([]); // Currency suggestions
  const [searchInput, setSearchInput] = useState(""); // Input value

  const accessKey = "ssY54om8IqCccngLw8rlFC8lrCtI4bvU"; // Your API access key
  const years = Array.from({ length: new Date().getFullYear() - 2010 + 1 }, (_, i) => 2010 + i); // Years from 2010 to now
  const supportedCurrencies = [
"AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LTL", "LVL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRO", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STD", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "YER", "ZAR", "ZMK", "ZMW", "ZWL"  ]; // Example list of currencies

  // Fetch data for a specific year
  const fetchCurrencyDataForYear = async (year, currency) => {
    const date = `${year}-03-20`; // Use March 20th as a reference date
    try {
      const response = await fetch(
        `https://api.currencybeacon.com/v1/historical?api_key=${accessKey}&base=USD&date=${date}&symbols=${currency}`
      );
      const data = await response.json();

      if (data.error) {
        console.error(`API Error for ${year}: ${data.error.info}`);
        return null;
      }

      return parseFloat(data.rates[currency]);
    } catch (error) {
      console.error(`Error fetching data for ${year}:`, error);
      return null;
    }
  };

  // Fetch data for all years
  const fetchAllData = async (currency) => {
    const labels = years;
    const values = [];

    for (const year of years) {
      const rate = await fetchCurrencyDataForYear(year, currency);
      values.push(rate !== null ? rate : null); // Add null for missing data
    }

    buildGraph(currency, labels, values);
  };

  // Build the chart
  const buildGraph = (currency, labels, values) => {
    const canvas = document.getElementById("currencyChart");
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    // Destroy the previous chart if it exists
    if (chart) {
      chart.destroy();
    }

    // Log data for debugging
    console.log("Building chart with data:", { currency, labels, values });

    // Create a new chart
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Exchange Rate (USD to ${currency})`,
            data: values,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
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

  // Handle user search input
  const handleSearchInput = (e) => {
    const input = e.target.value.toUpperCase();
    setSearchInput(input);
    setSuggestions(supportedCurrencies.filter((curr) => curr.includes(input)));
  };

  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setSearchInput(selectedCurrency);
    setSuggestions([]);
  };

  // Fetch data whenever the currency changes
  useEffect(() => {
    fetchAllData(currency);
  }, [currency]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Exchange Rate Trends</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchInput}
          placeholder="Enter currency code (e.g., EUR)"
          style={{
            padding: "8px",
            width: "300px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={() => fetchAllData(currency)}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            position: "absolute",
            backgroundColor: "white",
            border: "1px solid #ddd",
            width: "300px",
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          {suggestions.map((currency) => (
            <div
              key={currency}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => handleCurrencySelect(currency)}
            >
              {currency}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        <canvas id="currencyChart" width="800" height="400"></canvas>
      </div>
    </div>
  );
};

export default Home;



















import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/auth/AuthContextProvider";
import { logOutAction } from "../../context/auth/actions";

const Home = () => {
  const { dispatch } = useAuthContext();
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const currenciesPerPage = 20;

  const API_KEY = "68debe51aceb485995c825817f033312";
  const URL = https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY};

  // Inject CSS into the document head dynamically
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = 
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
        flex-direction: row;
        padding: 20px;
      }
  
      .container {
        display: flex;
        justify-content: space-between;
        width: 100%;
        max-width: 1200px;
      }
  
      .left-column {
        width: 45%;
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
      }
  
      .right-column {
        width: 45%;
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
  
      h1 {
        color: #333;
        margin-bottom: 20px;
      }
  
      .loading {
        color: #888;
        font-size: 16px;
      }
  
      .rates p {
        font-size: 18px;
        margin: 5px 0;
      }
  
      .calculator {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
  
      .calculator input,
      .calculator select {
        margin: 5px;
        padding: 10px;
        font-size: 16px;
        width: 100%;
        max-width: 250px;
        border-radius: 5px;
        border: 1px solid #ccc;
      }
  
      .calculator button {
        margin-top: 10px;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      }
  
      .calculator button:hover {
        background-color: #45a049;
      }
  
      .result {
        margin-top: 15px;
        font-size: 18px;
        font-weight: bold;
      }
  
      table {
        width: 100%;
        border-collapse: collapse;
        background-color: black;
        color: red;
        font-family: 'Courier New', Courier, monospace;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
      }
  
      table th,
      table td {
        padding: 15px;
        text-align: center;
        border: 1px solid #333;
      }
  
      table th {
        background-color: #222;
        color: #ffcc00;
        font-size: 18px;
      }
  
      table td {
        font-size: 24px;
      }
  
      table td:first-child {
        color: white; /* Currency names */
      }
  
      table td:nth-child(2) {
        font-weight: bold;
      }
  
      table tbody tr:hover {
        background-color: #333;
      }
  
      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
  
      .pagination button {
        margin: 0 5px;
        padding: 5px 10px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
  
      .pagination button:hover {
        background-color: #45a049;
      }
  
      .pagination button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
  
      .search-bar {
        margin-bottom: 15px;
        padding: 10px;
        width: 100%;
        max-width: 250px;
        border-radius: 5px;
        border: 1px solid #ccc;
      }
  
      .logout-button {
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 10px 15px;
        background-color: #ff6347;
        color: white;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
  
      .logout-button:hover {
        background-color: #e55347;
      }
    ;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch the exchange rates from the Currency API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(URL);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

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

  const nextPage = () => {
    const filteredCurrencies = Object.keys(rates).filter((currency) =>
      currency.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (currentPage * currenciesPerPage < filteredCurrencies.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container">
      <button className="logout-button" onClick={() => dispatch(logOutAction())}>
        Log Out
      </button>

      <div className="left-column">
        <h1>Currency Exchange Rates</h1>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="loading" style={{ color: "red" }}>{Failed to load exchange rates. Error: ${error}}</div>}

        {rates && !loading && !error && (
          <>
            <input
              type="text"
              className="search-bar"
              placeholder="Search for a currency"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Exchange Rate</th>
                </tr>
              </thead>
              <tbody>
                {paginateCurrencies().map((currency) => (
                  <tr key={currency}>
                    <td>{currency}</td>
                    <td>{rates[currency]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={prevPage} disabled={currentPage === 1}>
                Prev
              </button>
              <button onClick={nextPage} disabled={(currentPage * currenciesPerPage) >= Object.keys(rates).length}>
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <div className="right-column">
        <h1>Currency Exchange Calculator</h1>

        {rates && (
          <div className="calculator">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />

            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
              {Object.keys(rates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>

            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
              {Object.keys(rates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>

            <button onClick={handleConvert}>Convert</button>

            {convertedAmount && (
              <div className="result">
                {amount} {fromCurrency} = {convertedAmount} {toCurrency}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from "chart.js";

// Register necessary components for Chart.js
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const Home = () => {
  const [currency, setCurrency] = useState("EUR"); // Default currency
  const [chart, setChart] = useState(null); // Chart.js instance
  const [suggestions, setSuggestions] = useState([]); // Currency suggestions
  const [searchInput, setSearchInput] = useState(""); // Input value

  const accessKey = "ssY54om8IqCccngLw8rlFC8lrCtI4bvU"; // Your API access key
  const years = Array.from({ length: new Date().getFullYear() - 2010 + 1 }, (_, i) => 2010 + i); // Years from 2010 to now
  const supportedCurrencies = [
"AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LTL", "LVL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRO", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STD", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "YER", "ZAR", "ZMK", "ZMW", "ZWL"  ]; // Example list of currencies

  // Fetch data for a specific year
  const fetchCurrencyDataForYear = async (year, currency) => {
    const date = ${year}-03-20; // Use March 20th as a reference date
    try {
      const response = await fetch(
        https://api.currencybeacon.com/v1/historical?api_key=${accessKey}&base=USD&date=${date}&symbols=${currency}
      );
      const data = await response.json();

      if (data.error) {
        console.error(API Error for ${year}: ${data.error.info});
        return null;
      }

      return parseFloat(data.rates[currency]);
    } catch (error) {
      console.error(Error fetching data for ${year}:, error);
      return null;
    }
  };

  // Fetch data for all years
  const fetchAllData = async (currency) => {
    const labels = years;
    const values = [];

    for (const year of years) {
      const rate = await fetchCurrencyDataForYear(year, currency);
      values.push(rate !== null ? rate : null); // Add null for missing data
    }

    buildGraph(currency, labels, values);
  };

  // Build the chart
  const buildGraph = (currency, labels, values) => {
    const canvas = document.getElementById("currencyChart");
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    // Destroy the previous chart if it exists
    if (chart) {
      chart.destroy();
    }

    // Log data for debugging
    console.log("Building chart with data:", { currency, labels, values });

    // Create a new chart
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: Exchange Rate (USD to ${currency}),
            data: values,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: Exchange Rate Trend (USD to ${currency}),
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

  // Handle user search input
  const handleSearchInput = (e) => {
    const input = e.target.value.toUpperCase();
    setSearchInput(input);
    setSuggestions(supportedCurrencies.filter((curr) => curr.includes(input)));
  };

  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency) => {
    setCurrency(selectedCurrency);
    setSearchInput(selectedCurrency);
    setSuggestions([]);
  };

  // Fetch data whenever the currency changes
  useEffect(() => {
    fetchAllData(currency);
  }, [currency]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Exchange Rate Trends</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchInput}
          placeholder="Enter currency code (e.g., EUR)"
          style={{
            padding: "8px",
            width: "300px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={() => fetchAllData(currency)}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            border: "none",
            backgroundColor: "#007BFF",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            position: "absolute",
            backgroundColor: "white",
            border: "1px solid #ddd",
            width: "300px",
            maxHeight: "150px",
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          {suggestions.map((currency) => (
            <div
              key={currency}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => handleCurrencySelect(currency)}
            >
              {currency}
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        <canvas id="currencyChart" width="800" height="400"></canvas>
      </div>
    </div>
  );
};


export default Home; 






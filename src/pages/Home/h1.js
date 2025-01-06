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
  const URL = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY}`;

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
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
        width: 250%;
        max-width: 1200px;
      }
      .left-column {
        width: 55%;
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
      }
      .right-column {
        width: 35%;
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
        color: white;
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
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        <h1>Currency Calculator</h1>
        <div className="calculator">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
            {rates && Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
            {rates && Object.keys(rates).map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <button onClick={handleConvert}>Convert</button>
          {convertedAmount && (
            <div className="result">{`${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`}</div>
          )}
        </div>

        <h1>Currency Exchange Rates</h1>
        {loading && <div className="loading">Loading...</div>}
        {error && (
          <div className="loading" style={{ color: "red" }}>{`Failed to load exchange rates. Error: ${error}`}</div>
        )}

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
              <button
                onClick={nextPage}
                disabled={
                  currentPage * currenciesPerPage >=
                  Object.keys(rates).filter((currency) =>
                    currency.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length
                }
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

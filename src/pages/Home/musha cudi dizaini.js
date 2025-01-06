import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../context/auth/AuthContextProvider";
import { logOutAction } from "../../context/auth/actions";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from "chart.js";

// Register necessary components for Chart.js
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

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

  const [chart, setChart] = useState(null);
  const [currency, setCurrency] = useState("EUR");
  const [suggestions, setSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const API_KEY = "68debe51aceb485995c825817f033312";
  const URL = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${API_KEY}`;
  const accessKey = "ssY54om8IqCccngLw8rlFC8lrCtI4bvU";

  const years = Array.from({ length: new Date().getFullYear() - 2010 + 1 }, (_, i) => 2010 + i);

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

  const fetchCurrencyDataForYear = async (year, currency) => {
    const date = `${year}-03-20`;
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

  const fetchAllData = async (currency) => {
    const labels = years;
    const values = [];

    for (const year of years) {
      const rate = await fetchCurrencyDataForYear(year, currency);
      values.push(rate !== null ? rate : null);
    }

    buildGraph(currency, labels, values);
  };

  const buildGraph = (currency, labels, values) => {
    const canvas = document.getElementById("currencyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (chart) {
      chart.destroy();
    }

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

  useEffect(() => {
    fetchAllData(currency);
  }, [currency]);

  return (
    <div className="container" style={{ textAlign: "center", padding: "20px" }}>
      <button
        className="logout-button"
        onClick={() => dispatch(logOutAction())}
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        Log Out
      </button>

      {/* Calculator Section */}
      <div>
        <h1>Currency Calculator</h1>
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
            {rates &&
              Object.keys(rates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
          </select>
          <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
            {rates &&
              Object.keys(rates).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
          </select>
          <button onClick={handleConvert}>Convert</button>
          {convertedAmount && (
            <div>{`${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`}</div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div>
        <h1>Currency Exchange Rates</h1>
        {rates && (
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
        )}
      </div>

      {/* Graph Section */}
      <div>
        <h1>Exchange Rate Trends</h1>
        <canvas id="currencyChart" width="800" height="400"></canvas>
      </div>
    </div>
  );
};

export default Home;

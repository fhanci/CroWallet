import axios from "axios";
import { backendUrl } from "../utils/envVariables";


export const CURRENCIES = [
  { value: "TRY", label: "₺ Türk Lirası", flag: "🇹🇷", symbol: "₺", exchangeRates: 1 },
  { value: "USD", label: "$ Amerikan Doları", flag: "🇺🇸", symbol: "$", exchangeRates: 1 },
  { value: "EUR", label: "€ Euro", flag: "🇪🇺", symbol: "€", exchangeRates: 1 },
];



export const exchangeRates = async () => {
  const response = await axios.get('https://finans.truncgil.com/v4/today.json');
  CURRENCIES[1].exchangeRates = response.data.USD.Selling;
  CURRENCIES[2].exchangeRates = response.data.EUR.Selling;

  return { "USD": response.data.USD, "EUR": response.data.EUR }
}


export const getExchangeRateByPastDate = async (currency, date, quotes) => {
  const response = await axios.get(`https://api.frankfurter.dev/v2/rates?date=${date}&base=${currency}&quotes=${quotes}`);
  return response.data[0];
}


export const getCurrentCurrencyRates = async () => {
  const usdExchangeRate = await getExchangeRateByPastDate("USD", new Date().toLocaleDateString("tr-TR"), "TRY");
  const eurExchangeRate = await getExchangeRateByPastDate("EUR", new Date().toLocaleDateString("tr-TR"), "TRY");

  const body = [
    {
      currency: "USD",
      rate: usdExchangeRate.rate,
    },
    {
      currency: "EUR",
      rate: eurExchangeRate.rate,
    },
    {
      currency: "TRY",
      rate: 1
    }
  ];
  const token = localStorage.getItem("token");

  await axios.post(
    `${backendUrl}/api/currencies/setRate`,
    body,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
}
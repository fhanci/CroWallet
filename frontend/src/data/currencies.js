import axios from "axios";

export const CURRENCIES = [
  { value: "TRY", label: "₺ Türk Lirası", flag: "🇹🇷", exchangeRates: 1 },
  { value: "USD", label: "$ Amerikan Doları", flag: "🇺🇸", exchangeRates: 1 },
  { value: "EUR", label: "€ Euro", flag: "🇪🇺", exchangeRates: 1},
];



export const exchangeRates = async() => {
  const response = await axios.get('https://finans.truncgil.com/v4/today.json');
  CURRENCIES[1].exchangeRates = response.data.USD.Selling;
  CURRENCIES[2].exchangeRates = response.data.EUR.Selling;
  return {"USD": response.data.USD, "EUR":response.data.EUR}
}
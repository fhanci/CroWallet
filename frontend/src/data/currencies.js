import axios from "axios";

export const CURRENCIES = [
  { value: "TRY", label: "₺ Türk Lirası", flag: "🇹🇷" },
  { value: "USD", label: "$ Amerikan Doları", flag: "🇺🇸" },
  { value: "EUR", label: "€ Euro", flag: "🇪🇺" },
];



export const exchangeRates = async() => {
  const response = await axios.get('https://finans.truncgil.com/v4/today.json');
  return {"USD": response.data.USD, "EUR":response.data.EUR}
}
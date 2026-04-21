import axios from "axios";
import { backendUrl } from "../utils/envVariables";

const token = localStorage.getItem("token");

export const GOLD_TYPES = [
  { value: "GRAM", label: "Gram Altın", symbol: "gr", Buying: 0, Selling: 0 },
  { value: "CEYREK", label: "Çeyrek Altın", symbol: "adet", Buying: 0, Selling: 0 },
  { value: "YARIM", label: "Yarım Altın", symbol: "adet", Buying: 0, Selling: 0 },
  { value: "TAM", label: "Tam Altın", symbol: "adet", Buying: 0, Selling: 0 },
  { value: "CUMHURIYET", label: "Cumhuriyet Altını", symbol: "adet", Buying: 0, Selling: 0 },
];


const goldTypeKey = ["GRA", "CEYREKALTIN", "YARIMALTIN", "TAMALTIN", "CUMHURIYETALTINI"]

export const getGoldCurrentValue = async () => {
  const response = await axios.get('https://finans.truncgil.com/v4/today.json');
  const goldPrices = (Object.entries(response.data).filter(([key]) => goldTypeKey.includes(key)).map(data => data[1]))
  // setGoldPrice(goldPrices)

  const updatedGoldTypes = GOLD_TYPES.map((goldType) => ({
    ...goldType,
    Selling: goldPrices.find(
      (data) => data.Name.split("ALTIN")[0] === goldType.value
    )?.Selling,
    Buying: goldPrices.find(
      (data) => data.Name.split("ALTIN")[0] === goldType.value
    )?.Buying,
  }));

  updatedGoldTypes.forEach((goldType,index) => {
    GOLD_TYPES[index].Buying = goldType.Buying; 
    GOLD_TYPES[index].Selling = goldType.Selling;
  });

  await axios.post(`${backendUrl}/api/asset/setInvestmentPrice`,
    updatedGoldTypes.map((goldType) => {
      return {
        assetSymbol: goldType.value,
        price: goldType.Buying
      }
    }),
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );



  return updatedGoldTypes.map((goldType) => ({ Name: `${goldType.value}ALTIN`, Buying: goldType.Buying, Selling: goldType.Selling }));
};


export const getGoldValue = () => {
  return GOLD_TYPES.map((goldType) => goldType.Buying = goldPrices.find((data) => data.Name.split("ALTIN")[0] === goldType.value)?.Buying);
};


import axios from "axios";

export const GOLD_TYPES = [
  { value: "GRAM", label: "Gram Altın", symbol: "gr", price: 0 },
  { value: "CEYREK", label: "Çeyrek Altın", symbol: "adet", price: 0 },
  { value: "YARIM", label: "Yarım Altın", symbol: "adet", price: 0 },
  { value: "TAM", label: "Tam Altın", symbol: "adet", price: 0 },
  { value: "CUMHURIYET", label: "Cumhuriyet Altını", symbol: "adet", price: 0 },
];


const goldTypeKey = ["GRA", "CEYREKALTIN", "YARIMALTIN", "TAMALTIN", "CUMHURIYETALTINI"]

export const getGoldCurrentValue = async () => {
  const response = await axios.get('https://finans.truncgil.com/v4/today.json');
  const goldPrices = (Object.entries(response.data).filter(([key]) => goldTypeKey.includes(key)).map(data => data[1]))
  // setGoldPrice(goldPrices)
  // console.log("Bulunan Altın Fiyatları: ")
  // console.log(goldPrices)
  GOLD_TYPES.map((goldType) => goldType.price = goldPrices.find((data) => data.Name.split("ALTIN")[0] === goldType.value)?.Buying);
  return GOLD_TYPES.map((goldType) => ({Name: `${goldType.value}ALTIN`, Buying: goldType.price }));
  // console.log("Altın Fiyatları Güncellendi")
  // console.log(GOLD_TYPES)


};


export const getGoldValue = () => {
  return GOLD_TYPES.map((goldType) => goldType.price = goldPrices.find((data) => data.Name.split("ALTIN")[0] === goldType.value)?.Buying);
};


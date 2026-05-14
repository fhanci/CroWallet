import axios from "axios";
import { backendUrl } from "../utils/envVariables";

const token = localStorage.getItem("token");

export const STOCKS = [
  { symbol: "AKBNK", name: "Akbank T.A.Ş.", price: 90.15 },
  { symbol: "GARAN", name: "Garanti BBVA", price: 159.05 },
  { symbol: "ISCTR", name: "Türkiye İş Bankası (C)", price: 14.37 },
  { symbol: "KCHOL", name: "Koç Holding A.Ş.", price: 191.80 },
  { symbol: "TUPRS", name: "Tüpraş - Türkiye Petrol Rafinerileri A.Ş.", price: 263.25 },
  { symbol: "THYAO", name: "Türk Hava Yolları A.O.", price: 280.50 },
  { symbol: "FROTO", name: "Ford Otomotiv Sanayi A.Ş.", price: 1045.50 },
  { symbol: "ASELS", name: "ASELSAN Elektronik Sanayi ve Ticaret A.Ş.", price: 319.28 },
  { symbol: "BIMAS", name: "BİM Birleşik Mağazalar A.Ş.", price: 665.45 },
  { symbol: "SASA", name: "SASA Polyester Sanayi A.Ş.", price: 18.30 },
  { symbol: "ARCLK", name: "Arçelik A.Ş.", price: 116.30 },
  { symbol: "SISE", name: "Türkiye Şişe ve Cam Fabrikaları A.Ş.", price: 71.10 },
  { symbol: "AKSA", name: "Aksa Akrilik Kimya Sanayii A.Ş.", price: 95.20 },
  { symbol: "MGROS", name: "Migros Ticaret A.Ş.", price: 252.00 },
  { symbol: "EREGL", name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.", price: 32.72 },
  { symbol: "EKGYO", name: "Emlak Konut Gayrimenkul Yatırım Ortaklığı A.Ş.", price: 23.80 },
  { symbol: "PETKM", name: "Petkim Petrokimya Holding A.Ş.", price: 19.64 },
  { symbol: "TCELL", name: "Turkcell İletişim Hizmetleri A.Ş.", price: 172.70 },
  { symbol: "PGSUS", name: "Pegasus Hava Taşımacılığı A.Ş.", price: 177.30 },
  { symbol: "ENKAI", name: "Enka İnşaat ve Sanayi A.Ş.", price: 71.50 },
  { symbol: "TAVHL", name: "TAV Havalimanları Holding A.Ş.", price: 285.40 },
  { symbol: "TTKOM", name: "Türk Telekomünikasyon A.Ş.", price: 73.20 },
  { symbol: "VAKBN", name: "Türkiye Vakıflar Bankası T.A.O.", price: 26.45 },
  { symbol: "HALKB", name: "Türkiye Halk Bankası A.Ş.", price: 18.15 },
  { symbol: "YKBNK", name: "Yapı ve Kredi Bankası A.Ş.", price: 42.10 },
  { symbol: "GUBRF", name: "Gübre Fabrikaları T.A.Ş.", price: 185.30 },
  { symbol: "ENJSA", name: "Enerjisa Enerji A.Ş.", price: 155.00 },
  { symbol: "TRALT", name: "Koza Altın İşletmeleri A.Ş.", price: 50.85 },
  { symbol: "DOAS", name: "Doğuş Otomotiv Servis ve Ticaret A.Ş.", price: 295.00 },
  { symbol: "ALARK", name: "Alarko Holding A.Ş.", price: 102.95 },
  { symbol: "ASTOR", name: "Astor Enerji A.Ş.", price: 179.75 },
  { symbol: "BRSAN", name: "Borusan Mannesmann Boru Sanayi ve Ticaret A.Ş.", price: 685.20 },
  { symbol: "SOKM", name: "Şok Marketler Ticaret A.Ş.", price: 54.80 },
  { symbol: "AKCNS", name: "Akçansa Çimento Sanayi ve Ticaret A.Ş.", price: 248.25 },
  { symbol: "AKSEN", name: "Aksa Enerji Üretim A.Ş.", price: 68.15 },
  { symbol: "AEFES", name: "Anadolu Efes Biracılık ve Malt Sanayii A.Ş.", price: 19.32 },
  { symbol: "CCOLA", name: "Coca-Cola İçecek A.Ş.", price: 83.80 },
  { symbol: "ULKER", name: "Ülker Bisküvi Sanayi A.Ş.", price: 142.50 },
  { symbol: "OTKAR", name: "Otokar Otomotiv ve Savunma Sanayi A.Ş.", price: 432.25 },
  { symbol: "TKFEN", name: "Tekfen Holding A.Ş.", price: 84.10 },
  { symbol: "KRDMD", name: "Kardemir Karabük Demir Çelik Sanayi ve Ticaret A.Ş. (D)", price: 34.60 },
  { symbol: "OYAKC", name: "Oyak Çimento Fabrikaları A.Ş.", price: 88.40 },
  { symbol: "GWIND", name: "Galata Wind Enerji A.Ş.", price: 36.15 },
  { symbol: "AYDEM", name: "Aydem Yenilenebilir Enerji A.Ş.", price: 45.30 },
  { symbol: "HEKTS", name: "Hektaş Ticaret T.A.Ş.", price: 6.75 },
  { symbol: "GESAN", name: "Girişim Elektrik Sanayi Taahhüt ve Ticaret A.Ş.", price: 92.40 },
  { symbol: "KONTR", name: "Kontrolmatik Teknoloji Enerji ve Mühendislik A.Ş.", price: 184.20 },
  { symbol: "MIATK", name: "Mia Teknoloji A.Ş.", price: 78.15 },
  { symbol: "CIMSA", name: "Çimsa Çimento Sanayi ve Ticaret A.Ş.", price: 48.90 },
  { symbol: "DOHOL", name: "Doğan Holding A.Ş.", price: 14.85 },
];



export const getStocksValueApi = async (symbol) => {
  try {
    return STOCKS[STOCKS.indexOf((data) => data.symbol === symbol)].price;
  }
  catch (e) {
    return STOCKS.find((data) => data.symbol === symbol)?.price;
  }
}


export const getStockCurrentValue = async () => {
  const stockItem = []
  await Promise.all(
    STOCKS.map(async (stock) => {
      stockItem.push({ symbol: stock.symbol, value: await getStocksValueApi(stock.symbol) })
    })
  );


  await axios.post(`${backendUrl}/api/asset/setInvestmentPrice`,
    stockItem.map((stock) => {
      return {
        assetSymbol: stock.symbol,
        price: stock.value
      }
    }),
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return stockItem
};


export const getStocksValue = () => {
  axios.post(`${backendUrl}/api/asset/setInvestmentPrice`,
    STOCKS.map((stock) => {
      return {
        assetSymbol: stock.symbol,
        price: stock.price
      }
    }),
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return STOCKS.map((stock) => ({ symbol: stock.symbol, value: stock.price }))

}

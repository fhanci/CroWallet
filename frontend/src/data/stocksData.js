import axios from "axios";
import { backendUrl } from "../utils/envVariables";

export const STOCKS = [  
  { symbol: "AKBNK", name: "Akbank T.A.Ş." },
  { symbol: "GARAN", name: "Garanti BBVA" },
  { symbol: "ISCTR", name: "Türkiye İş Bankası (C)" },
  { symbol: "KCHOL", name: "Koç Holding A.Ş." },
  { symbol: "TUPRS", name: "Tüpraş - Türkiye Petrol Rafinerileri A.Ş." },
  { symbol: "THYAO", name: "Türk Hava Yolları A.O." },
  { symbol: "FROTO", name: "Ford Otomotiv Sanayi A.Ş." },
  { symbol: "ASELS", name: "ASELSAN Elektronik Sanayi ve Ticaret A.Ş." },
  { symbol: "BIMAS", name: "BİM Birleşik Mağazalar A.Ş." },
  { symbol: "SASA", name: "SASA Polyester Sanayi A.Ş." },
  { symbol: "ARCLK", name: "Arçelik A.Ş." },
  { symbol: "SISE", name: "Türkiye Şişe ve Cam Fabrikaları A.Ş." },
  { symbol: "AKSA", name: "Aksa Akrilik Kimya Sanayii A.Ş." },
  { symbol: "MGROS", name: "Migros Ticaret A.Ş." },
  { symbol: "EREGL", name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş." },
  { symbol: "EKGYO", name: "Emlak Konut Gayrimenkul Yatırım Ortaklığı A.Ş." },
  { symbol: "PETKM", name: "Petkim Petrokimya Holding A.Ş." },
  { symbol: "TCELL", name: "Turkcell İletişim Hizmetleri A.Ş." },
  { symbol: "PGSUS", name: "Pegasus Hava Taşımacılığı A.Ş." },
  { symbol: "ENKAI", name: "Enka İnşaat ve Sanayi A.Ş." },
  { symbol: "TAVHL", name: "TAV Havalimanları Holding A.Ş." },
  { symbol: "TTKOM", name: "Türk Telekomünikasyon A.Ş." },
  { symbol: "VAKBN", name: "Türkiye Vakıflar Bankası T.A.O." },
  { symbol: "HALKB", name: "Türkiye Halk Bankası A.Ş." },
  { symbol: "YKBNK", name: "Yapı ve Kredi Bankası A.Ş." },
  { symbol: "GUBRF", name: "Gübre Fabrikaları T.A.Ş." },
  { symbol: "ENJSA", name: "Enerjisa Enerji A.Ş." },
  { symbol: "TRALT", name: "Koza Altın İşletmeleri A.Ş." },
  { symbol: "DOAS", name: "Doğuş Otomotiv Servis ve Ticaret A.Ş." },
  { symbol: "ALARK", name: "Alarko Holding A.Ş." },
  { symbol: "ASTOR", name: "Astor Enerji A.Ş." },
  { symbol: "BRSAN", name: "Borusan Mannesmann Boru Sanayi ve Ticaret A.Ş." },
  { symbol: "SOKM", name: "Şok Marketler Ticaret A.Ş." },
  { symbol: "AKCNS", name: "Akçansa Çimento Sanayi ve Ticaret A.Ş." },
  { symbol: "AKSEN", name: "Aksa Enerji Üretim A.Ş." },
  { symbol: "AEFES", name: "Anadolu Efes Biracılık ve Malt Sanayii A.Ş." },
  { symbol: "CCOLA", name: "Coca-Cola İçecek A.Ş." },
  { symbol: "ULKER", name: "Ülker Bisküvi Sanayi A.Ş." },
  { symbol: "OTKAR", name: "Otokar Otomotiv ve Savunma Sanayi A.Ş." },
  { symbol: "TKFEN", name: "Tekfen Holding A.Ş." },
  { symbol: "KRDMD", name: "Kardemir Karabük Demir Çelik Sanayi ve Ticaret A.Ş. (D)" },
  { symbol: "OYAKC", name: "Oyak Çimento Fabrikaları A.Ş." },
  { symbol: "GWIND", name: "Galata Wind Enerji A.Ş." },
  { symbol: "AYDEM", name: "Aydem Yenilenebilir Enerji A.Ş." },
  { symbol: "HEKTS", name: "Hektaş Ticaret T.A.Ş." },
  { symbol: "GESAN", name: "Girişim Elektrik Sanayi Taahhüt ve Ticaret A.Ş." },
  { symbol: "KONTR", name: "Kontrolmatik Teknoloji Enerji ve Mühendislik A.Ş." },
  { symbol: "MIATK", name: "Mia Teknoloji A.Ş." },
  { symbol: "CIMSA", name: "Çimsa Çimento Sanayi ve Ticaret A.Ş." },
  { symbol: "DOHOL", name: "Doğan Holding A.Ş." },
];


export const getStocksValue = async (symbol) => {
    console.log(`Veriler çekiliyor: ${symbol}.IS`);
    const response = await axios.get(`${backendUrl}/api/asset/getYahoo/${symbol}.IS`);
    const stockValues = response.data;
    console.log(`Veriler çekildi: ${symbol}.IS`);
    console.log(stockValues)
    return response.data.chart.result[0].meta.regularMarketPrice;
}
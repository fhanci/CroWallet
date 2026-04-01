import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import { useGetUserIDQuery } from "../api/accountApi";
import { useGetUserAssetQuery } from "../api/holdingsApi";
import InvestmentAccountDetailPageItem from "./InvestmentAccountDetailPageItem";
import Divider from '@mui/material/Divider';
import {
  Container,
  Alert,
  Tooltip
} from "@mui/material";
import { getStockCurrentValue, getStocksValue } from "../data/stocksData";
import { IoIosRefresh } from "react-icons/io";
import { getGoldCurrentValue } from "../data/goldData";





const InvestmentAccountDetailPage = () => {
  const [finalHoldings, setFinalHoldings] = useState({ "GOLD": {}, "STOCK": {} });

  const refs = useRef({});
  const { accountId } = useParams();

  //UserID Toolkit Query
  const { data: userID, isLoading: userLoading } = useGetUserIDQuery();

  //Holding Toolkit Query
  // const { data: holdings, isLoading: holdingsLoading, } = useGetUserHoldingQuery(userID, { skip: userID === undefined || userID === null || userID === 0 });

  // //Asset Toolkit Query
  const { data: holdings, isLoading: holdingsLoading } = useGetUserAssetQuery(undefined, { refetchOnMountOrArgChange: true });
  const [getPrices, setGetPrices] = useState(false)
  const [goldPrice, setGoldPrice] = useState([])
  // const goldTypeKey = ["GRA", "CEYREKALTIN", "YARIMALTIN", "TAMALTIN", "CUMHURIYETALTINI"]
  const [stockPrice, setStockPrice] = useState([])



  useEffect(() => {
    setGetPrices(true);
  }, [])

  useEffect(() => {
    if (!getPrices) return;

    const updateAllPrices = async () => {


      const goldData = await getGoldCurrentValue();
      const stockData = await getStocksValue();

      setGoldPrice([...goldData]);
      setStockPrice([...stockData]);

      setGetPrices(false);
    };

    updateAllPrices();
  }, [getPrices]);




  useEffect(() => {
    if (!accountId) return;

    const interval = setInterval(() => {
      const element = refs.current[String(accountId)];
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        clearInterval(interval);
      }

    }, 100);
    return () => clearInterval(interval)
  }, [accountId, finalHoldings])



  useEffect(() => {

    if (!getPrices && goldPrice.length && stockPrice.length) {
      if (typeof holdings === "object" && holdings.length === 0) {

        setFinalHoldings({ GOLD: {}, STOCK: {} });
        return;
      }

      if (holdings !== undefined && typeof holdings === "object" && holdings.length > 0) {



        const newData = { GOLD: {}, STOCK: {} }

        holdings.forEach(item => {
          const { assetType, accountId } = item;


          if (!newData[assetType][accountId]) {
            newData[assetType][accountId] = [];
          }
          newData[assetType][accountId].push({ 
            ...item, 
            profitLoss: (item.currentPrice * item.quantity) - (item.purchasePrice * item.quantity), 
            currentPrice: item.assetType === "GOLD" && item.assetSymbol 
            ? goldPrice.find((data) => data.Name.split("ALTIN")[0] === item.assetSymbol)?.Buying 
            : item.assetType === "STOCK" && item.assetSymbol 
            ? stockPrice.find((s) => s.symbol === item.assetSymbol).value 
            : 0 
          });

        });

        setFinalHoldings(newData);
      }
    }
  }, [holdings, getPrices])


  if (userLoading && holdingsLoading && getPrices)
    return <div> Yükleniyor</div>
  return (
    <div>
      {/* <Tooltip title="Yatırım Fiyatlarını Çek">
        <IoIosRefresh style={{position:"absolute",right:"22vw",marginTop:"4"}} onClick={() => getInvestmentPrices()} />
      </Tooltip> */}

      
      {Object.keys(finalHoldings.GOLD).length === 0 ? <Container sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Altın Hesabı Bulunamadı.</Alert></Container> :
        Object.entries(finalHoldings.GOLD).map(([key, value]) => (

          //Referans bağladık
          <div key={key} ref={el => {
            if (el) refs.current[String(key)] = el;
          }}>

            <InvestmentAccountDetailPageItem
              title={"Altın"} key={key} item={value}></InvestmentAccountDetailPageItem>

          </div>
        ))
      }

      <Divider></Divider>
      {Object.keys(finalHoldings.STOCK).length === 0 ? <Container sx={{ mt: 4 }}>
        <Alert severity="error">Yatırım Hesabı Bulunamadı.</Alert></Container> :
        Object.entries(finalHoldings.STOCK).map(([key, value]) => (

          <div key={key} ref={el => {
            if (el) refs.current[String(key)] = el;
          }}>
            <InvestmentAccountDetailPageItem
              title={"Yatırım"} key={key} item={value}></InvestmentAccountDetailPageItem>
          </div>
        ))
      }

    </div>
  );
};

export default InvestmentAccountDetailPage;


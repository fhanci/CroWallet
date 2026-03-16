import React, { useState, useEffect, useRef } from "react";
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
  const { data: holdings, isLoading: holdingsLoading, } = useGetUserAssetQuery();
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
      console.log("İşlem başladı...");


      const goldData = await getGoldCurrentValue();
      const stockData = await getStocksValue();

      setGoldPrice([...goldData]);
      setStockPrice([...stockData]);

      setGetPrices(false);
      console.log(stockPrice)
      console.log("Her şey güncellendi ve ekran tazelendi.");
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
      console.log("Stock Data")
      console.log(stockPrice)
      console.log("Gold Data")
      console.log(goldPrice)
      if (typeof holdings === "object" && holdings.length === 0) {
        console.log("Girdim")
        setFinalHoldings({ GOLD: {}, STOCK: {} });
        return;
      }

      if (holdings !== undefined && typeof holdings === "object" && holdings.length > 0) {

        console.log("Holdings: ");
        console.log(holdings);


        const newData = { GOLD: {}, STOCK: {} }

        holdings.forEach(item => {
          const { assetType, accountId } = item;
          console.log(item)

          if (!newData[assetType][accountId]) {
            newData[assetType][accountId] = [];
          }
          newData[assetType][accountId].push({ ...item, profitLoss: (item.currentPrice * item.quantity) - (item.purchasePrice * item.quantity), currentPrice: item.assetType === "GOLD" ? goldPrice.find((data) => data.Name.split("ALTIN")[0] === item.assetSymbol)?.Buying : stockPrice.find((s) => s.symbol === item.assetSymbol).value });
          // console.log("Test : " + {...item, profitLoss: (item.currentPrice * item.quantity) - (item.purchasePrice * item.quantity) , currentPrice: item.assetType === "GOLD" ?  goldPrice.find((data) => data.Name.split("ALTIN")[0] === item.assetSymbol)?.Buying : stockPrice.find((s) => s.symbol === value.symbol).value})

        });

        setFinalHoldings(newData);
      }
    }
  }, [holdings, getPrices])

  const getInvestmentPrices = () => {
    console.log("Fiyat Bilgileri Çekiliyor.")
    setGetPrices(true)
  }

  if (userLoading && holdingsLoading && getPrices)
    return <div> Yükleniyor</div>
  return (
    <div>
      <Tooltip title="Yatırım Fiyatlarını Çek">
        <IoIosRefresh style={{position:"absolute",right:"22vw",marginTop:"4"}} onClick={() => getInvestmentPrices()} />
      </Tooltip>

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


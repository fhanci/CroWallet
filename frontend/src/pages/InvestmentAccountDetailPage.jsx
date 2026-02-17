import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import { useGetUserIDQuery } from "../api/accountApi";
import { useGetUserHoldingQuery } from "../api/holdingsApi";
import InvestmentAccountDetailPageItem from "./InvestmentAccountDetailPageItem";
import Divider from '@mui/material/Divider';
import {
  Container,
  Alert,
} from "@mui/material";





const InvestmentAccountDetailPage = () => {
  const [finalHoldings, setFinalHoldings] = useState({ "GOLD": {}, "STOCK": {} });

  const refs = useRef({});
  const { accountId } = useParams();

  //UserID Toolkit Query
  const { data: userID, isLoading: userLoading } = useGetUserIDQuery();

  //Holding Toolkit Query
  const { data: holdings, isLoading: holdingsLoading, } = useGetUserHoldingQuery(userID, { skip: userID === undefined || userID === null || userID === 0 });


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

        if (!newData[assetType][accountId]) {
          newData[assetType][accountId] = [];
        }
        newData[assetType][accountId].push(item);
      });

      setFinalHoldings(newData);
      console.log("Güncellenen Holdings")
      console.log(finalHoldings);
    }
  }, [holdings])

  if (userLoading && holdingsLoading)
    return <div> Yükleniyor</div>
  return (
    <div>
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


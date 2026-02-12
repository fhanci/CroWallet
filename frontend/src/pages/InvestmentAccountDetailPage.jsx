import React, { useState, useEffect } from "react";

import { useGetUserIDQuery } from "../api/accountApi";
import { useGetUserHoldingQuery } from "../api/holdingsApi";
import InvestmentAccountDetailPageItem from "./InvestmentAccountDetailPageItem";
import Divider from '@mui/material/Divider';
import {
  Container,
  Alert,
} from "@mui/material";
import axios from "axios";
import { backendUrl } from "../utils/envVariables";




const InvestmentAccountDetailPage = () => {
  const [finalHoldings, setFinalHoldings] = useState({ "GOLD": {}, "STOCK": {} });
  const [oldKeys, setOldKeys] = useState([]);
  const [newKeys, setNewKeys] = useState([]);

  //UserID Toolkit Query
  const { data: userID, isLoading: userLoading } = useGetUserIDQuery();

  //Holding Toolkit Query
  const { data: holdings, isLoading: holdingsLoading, } = useGetUserHoldingQuery(userID, { skip: userID === undefined || userID === null || userID === 0 });
  const token = localStorage.getItem("token");

  useEffect(() => {

    if (holdings !== undefined && typeof holdings === "object" && holdings.length > 0) {
      // console.log("Holdings")
      // console.log(JSON.stringify(holdings, 4, 4));
      


      setFinalHoldings(prev => {
        const newData = { ...prev };

        holdings.forEach(item => {
          const { asset_type, account_id } = item;

          if (!newData[asset_type][account_id]) {
            newData[asset_type][account_id] = [];
          }

          newData[asset_type][account_id] = [
            ...newData[asset_type][account_id], item
          ];
        });
        return newData;
      });
    }






  }, [holdings])

  console.log("FinalHoldings")
  console.log(JSON.stringify(finalHoldings, 4, 4));

  // console.log("GOLD: " + finalHoldings.GOLD);
  // console.log("STOCK: " + finalHoldings.STOCK);



  if (userLoading && holdingsLoading)
    return <div> Yükleniyor</div>
  return (
    <div>
      {Object.keys(finalHoldings.GOLD).length === 0 ? <Container sx={{ mt: 4, mb: 4 }}> <Alert severity="error">Altın Hesabı Bulunamadı.</Alert></Container> : Object.entries(finalHoldings.GOLD).map(([key, value]) => <InvestmentAccountDetailPageItem title={"Altın"} key={key} item={value}></InvestmentAccountDetailPageItem>)}
      <Divider></Divider>
      {Object.keys(finalHoldings.STOCK).length === 0 ? <Container sx={{ mt: 4 }}> <Alert severity="error">Yatırım Hesabı Bulunamadı.</Alert></Container> : Object.entries(finalHoldings.STOCK).map(([key, value]) => <InvestmentAccountDetailPageItem title={"Yatırım"} key={key} item={value}></InvestmentAccountDetailPageItem>)}



      {/* <InvestmentAccountDetailPageItem title={"Altın"} item={finalHoldings.GOLD}></InvestmentAccountDetailPageItem>
      <Divider></Divider>
      <InvestmentAccountDetailPageItem title={"Yatırım"} item={finalHoldings.STOCK}></InvestmentAccountDetailPageItem> */}
    </div>
  );
};

export default InvestmentAccountDetailPage;


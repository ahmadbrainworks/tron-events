const TronWeb = require('tronweb')
const request = require("request")
const express = require('express')
const app = express()
require('dotenv').config();

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("http://161.117.83.38:8090");
const solidityNode = new HttpProvider("http://161.117.83.38:8091");
const eventServer = new HttpProvider("http://161.117.83.38:8080");
const privateKey = "";
const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);

const headers = {
    "content-type": "text/plain;"
  };


app.get("/api/events/:blockNumber", (req, res) => {
    var dataString = `{num: ${req.params.blockNumber}}`;
    var options = {
      url: 'http://161.117.83.38:8091/walletsolidity/gettransactioninfobyblocknum',
      method: "POST",
      headers: headers,
      body: dataString
    };
  
    callback = (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        obj_arr = []
        data.forEach(element => {
            try {
                if(tronWeb.address.fromHex(element.contract_address) === process.env.CONTRACT_ADDRESS){
                    var from = tronWeb.address.fromHex(element.log[0].topics[1].replace('000000000000000000000000', '0x'))
                    var to = tronWeb.address.fromHex(element.log[0].topics[2].replace('000000000000000000000000', '0x'))
               console.log([{blockNumber:element.blockNumber,from,to,value:tronWeb.fromSun(parseInt(element.log[0].data, 16)),tx_hash: element.id,contract_address:tronWeb.address.fromHex(element.contract_address),result: element.receipt.result}])           
               var obj = {blockNumber:element.blockNumber,from,to,value:tronWeb.fromSun(parseInt(element.log[0].data, 16)),tx_hash: element.id,contract_address:tronWeb.address.fromHex(element.contract_address),result: element.receipt.result}           
               obj_arr.push(obj)
            }
        } catch (error) {
            console.log(error)
        }
    });
    res.send(obj_arr);
      }
    };
    request(options, callback);
  });
  
  app.listen(process.env.PORT)
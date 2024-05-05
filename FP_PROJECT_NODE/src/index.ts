import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import { fetchDatabase, getAllAvailableStocksSorted, getVendorData, updateVendorsDatabase } from "./utils/jsonFileHandlerUtil";
import { ApparelStockDetails, ApparelToSell } from "./models/apparel";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  const data = fetchDatabase()
  res.send(data);
});

app.put("/updateApparelToSell", (req: Request, res: Response) => {
    const vendorId = req.body?.vendorId
    const apparelsToSell = req.body?.apparelsToSell

    let vendorDBData = getVendorData(vendorId)

    let newApparelsToSell: ApparelToSell[] = vendorDBData.apparelsToSell
    vendorDBData.apparelsToSell?.forEach((apparel: ApparelToSell) => {
      let updatedApparel = apparelsToSell.find((updaatedApparelObj: ApparelToSell) => (updaatedApparelObj.skuId === apparel.skuId))

      if(!updatedApparel) {
        return
      }

      let newSizesAvailable: ApparelStockDetails[] = apparel.sizesAvailable
      apparel.sizesAvailable.forEach((size: ApparelStockDetails) => {
        let updatedSize = updatedApparel.sizesAvailable?.find((updatedSizeObj: ApparelStockDetails) => (size.skuSizeId === updatedSizeObj.skuSizeId))

        if(!updatedSize) {
          return
        }

        newSizesAvailable.map(obj => obj.skuSizeId===size.skuSizeId? Object.assign(size, updatedSize) : obj);
      })

      newApparelsToSell.map(obj => obj.skuId === apparel.skuId ?Object.assign(apparel,{sizesAvailable: newSizesAvailable}): obj)
    })

    updateVendorsDatabase(Object.assign(vendorDBData, {apparelsToSell: newApparelsToSell}))

    res.status(200)
    res.send("File Updated Successfully")
})

app.get("/getLowestPrice", (req: Request, res: Response) => {
  const apparelsData = req.body?.apparelsData
  let canFulfilOrder = true, lowestPrice = 0

  apparelsData.every((apparel: {skuId: string, skuSizeId: string, quantity: number}) => {
    const stocks = getAllAvailableStocksSorted(apparel.skuId, apparel.skuSizeId)
    let updatedQuantity = apparel.quantity

    stocks.every((stock: ApparelStockDetails) => {
      if(stock.stocksAvailable >= updatedQuantity) {
        lowestPrice = lowestPrice + updatedQuantity*stock.price
        updatedQuantity = 0
        return false
      }

      lowestPrice = lowestPrice + stock.stocksAvailable*stock.price
      updatedQuantity = updatedQuantity-stock.stocksAvailable
      return true
    })

    if(updatedQuantity > 0) {
      canFulfilOrder = false
      return false
    }

    return true
  })

  if(!canFulfilOrder) {
    res.status(200)
    res.send("Cannot fulfil the order")
  } else {
    res.status(200)
    res.send(`Lowest Price at which order can be placed is ${lowestPrice}`)
  }
})


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
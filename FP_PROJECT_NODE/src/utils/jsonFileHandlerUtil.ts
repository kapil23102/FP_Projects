import { readFileSync, writeFile } from "fs";
import { DATABASE_PATH } from "../constants";
import { ApparelStockDetails } from "../models/apparel";
import Vendor from "../models/vendor";

export const fetchDatabase = () => {
    const data = readFileSync(DATABASE_PATH, { encoding: 'utf8', flag: 'r' })
    const  parsedData = JSON.parse(data.toString());
    return parsedData
}

export const updateDatabase = (parsedData: object) => {
    writeFile(DATABASE_PATH, JSON.stringify(parsedData, null, 2), (err) => {
        if (err) {
            console.log("Failed to write updated data to file");
            return;
        }
        console.log("Updated file successfully");
    });
}

export const getVendorData = (vendorId: string) => {
    const database = fetchDatabase()
    const vendors = database.vendors || []
    return vendors.find((vendor: Vendor) => (vendor.vendorId === vendorId))
}

export const getAllVendorsData = () => {
    const database = fetchDatabase()
    return database.vendors
}

export const updateVendorsDatabase = (vendorData: Vendor) => {
    let dbData = fetchDatabase()
   updateDatabase(Object.assign(dbData, {vendors: dbData.vendors.map((obj: Vendor) => obj.vendorId === vendorData.vendorId? vendorData : obj)}))
}

export const getAllAvailableStocksSorted = (skuId: string, skuSizeId: string) => {
    const vendors = getAllVendorsData()

    let stocksAvailable: ApparelStockDetails[] = []
    vendors.forEach((vendor: Vendor) => {
       let sku =  vendor.apparelsToSell.find(apparel => apparel.skuId === skuId)

       if(!sku) {
        return
       }

       let stock = sku.sizesAvailable.find((size) => size.skuSizeId === skuSizeId)

       if(!stock) {
        return
       }

       stocksAvailable.push(stock)
    })

    return stocksAvailable.sort((a,b) => (a.price <= b.price? -1: 1))
}
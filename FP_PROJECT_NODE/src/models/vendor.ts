import { ApparelToSell } from "./apparel";

export default interface Vendor {
    vendorId: string,
    apparelsToSell: ApparelToSell[]
}
export interface ApparelSizeVariant {
    skuSizeId: string,
    size: string
}

export interface ApparelStockDetails {
    skuSizeId: string,
    stocksAvailable: number,
    price: number
}

export interface ApparelToSell {
    skuId: string,
    sizesAvailable: ApparelStockDetails[]
}

export default interface Apparel {
    skuId: string,
    sizes: ApparelSizeVariant[]
}
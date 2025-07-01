export interface Item {
  id: number;
  name: string;
  description: string | null;
  startingPrice: number;
  currentBid: number | null;
  bidInterval: number;
  bidEndTime: Date;
  auctionType: string;
  imageURL: string | null;
  isFeatured: boolean;
  totalBids: number;
  bidderName: string | null;
  bidderEmail: string | null;
  bidderPhone: string | null;
  bidTime: Date | null;
  status: string;
  soldTo: string | null;
  soldToName?: string | null;
  soldToEmail?: string | null;
  soldToPhone?: string | null;
}

export type AuctionType = "regular" | "live" | "draft" | "direct";

export type ItemUpdate = {
  name?: string;
  description?: string;
  startingPrice?: number;
  bidInterval?: number;
  bidEndTime?: Date;
  auctionType?: "live" | "regular";
  isFeatured?: boolean;
  imageURL?: string;
};

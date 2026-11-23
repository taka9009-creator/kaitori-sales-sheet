export interface DealRecord {
  id: string;
  month?: string; // e.g. '2026/10'
  date: string;
  staff: string;
  customerName: string;
  area: string;
  category: string;
  purchaseAmount: number;
  media: string;
  carryover: number;
  marketSales: number;
  goldSales: number;
  yahooSales: number;
  recoverySales: number;
  estimatedGoldGrossProfit: number;
  estimatedYahooGrossProfit: number;
  transportCost: number;
  disposalCost: number;
  memo: string;
  status: string;
}

export interface MarketItem {
  id: string;
  purchaseDate: string;
  itemDescription: string;
  staff: string;
  purchaseCost: number;
  estimatedMarketPrice: number;
  targetMarketName: string;
  auctionDate: string;
  actualSoldPrice: number | null;
  commissionRate: number;
  status: string;
  notes: string;
  linkedDealId?: string;
}

export interface AdCosts {
  松浦: number;
  mediaCosts: Record<string, number>;
}

export interface GoldPreset {
  purchaseAmount: number;
  goldSales: number;
  category: string;
  memo: string;
}

export interface GoldBasketItem {
  id: string;
  metal: string;
  weight: number;
  unitPrice: number;
  rate: number;
  wholesaleValue: number;
  offerPrice: number;
  grossProfit: number;
}

export const STAFF_LIST = ['松浦'] as const;
export const MEDIA_LIST = ['チラシ', 'HP', 'リピート', '紹介', '看板/その他'] as const;
export const STATUS_LIST = ['完結', '一部繰越', '全量繰越(未売却)', '市場出品中'] as const;
export const MARKET_STATUS_LIST = ['出品準備完了', '保管中', '落札完了', '不落札(繰越)'] as const;

export const INITIAL_MONTHS = ['2026/9', '2026/10'];

export const INITIAL_AD_COSTS: AdCosts = {
  松浦: 0,
  mediaCosts: {
    チラシ: 0,
    HP: 0,
    リピート: 0,
    紹介: 0,
    '看板/その他': 0,
  },
};

export const INITIAL_RECORDS: DealRecord[] = [];

export const INITIAL_MARKET_ITEMS: MarketItem[] = [];

export const formatCurrency = (val: number | null | undefined): string => {
  if (val == null || isNaN(val)) return '0';
  return new Intl.NumberFormat('ja-JP').format(Math.round(val));
};

export const formatPercent = (val: number): string => {
  if (isNaN(val)) return '0.0%';
  return (val * 100).toFixed(1) + '%';
};

export const calcRecordSales = (r: DealRecord): number =>
  (r.goldSales || 0) + (r.marketSales || 0) + (r.yahooSales || 0) + (r.recoverySales || 0);

export const calcRecordGross = (r: DealRecord): number =>
  calcRecordSales(r) - (r.purchaseAmount || 0);

export const calcStaffStats = (staffName: string, records: DealRecord[], adCost: number) => {
  const filtered = staffName === '店' || staffName === '店舗全体' || staffName === '全員'
    ? records
    : records.filter(r => r.staff === staffName);

  const purchaseTotal = filtered.reduce((acc, r) => acc + (r.purchaseAmount || 0), 0);
  const purchaseCount = filtered.length;
  const goldSalesTotal = filtered.reduce((acc, r) => acc + (r.goldSales || 0), 0);
  const marketSalesTotal = filtered.reduce((acc, r) => acc + (r.marketSales || 0), 0);
  const yahooSalesTotal = filtered.reduce((acc, r) => acc + (r.yahooSales || 0), 0);
  const recoverySalesTotal = filtered.reduce((acc, r) => acc + (r.recoverySales || 0), 0);
  const salesTotal = goldSalesTotal + marketSalesTotal + yahooSalesTotal + recoverySalesTotal;
  const carryoverTotal = filtered.reduce((acc, r) => acc + (r.carryover || 0), 0);
  const otherExpenses = filtered.reduce((acc, r) => acc + (r.transportCost || 0) + (r.disposalCost || 0), 0);
  const grossProfit = salesTotal - purchaseTotal;
  const averageCustomerSpend = purchaseCount > 0 ? Math.round(salesTotal / purchaseCount) : 0;
  const netProfit = grossProfit - adCost - otherExpenses;

  const mediaBreakdown = MEDIA_LIST.map(media => {
    const mRecs = filtered.filter(r => r.media === media);
    const count = mRecs.length;
    const goldProfit = mRecs.reduce((acc, r) => acc + (r.estimatedGoldGrossProfit || 0), 0);
    const totalGross = mRecs.reduce((acc, r) => acc + calcRecordGross(r), 0);
    const totalSales = mRecs.reduce((acc, r) => acc + calcRecordSales(r), 0);
    return {
      media,
      count,
      goldProfit,
      totalGross,
      totalSales,
      averageUnitPrice: count > 0 ? Math.round(totalGross / count) : 0,
    };
  });

  return {
    staffName,
    purchaseTotal,
    purchaseCount,
    averageCustomerSpend,
    salesTotal,
    grossProfit,
    carryoverTotal,
    yahooSalesTotal,
    goldSalesTotal,
    marketSalesTotal,
    recoverySalesTotal,
    adCost,
    otherExpenses,
    netProfit,
    mediaBreakdown,
  };
};

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
  mercariSales?: number;
  recoverySales: number;
  estimatedGoldGrossProfit: number;
  estimatedYahooGrossProfit: number;
  transportCost: number;
  disposalCost: number;
  platformFee?: number;
  shippingCost?: number;
  memo: string;
  status: string;
  // 古物台帳・本人確認フィールド（すべてオプショナルで後方互換維持）
  customerAddress?: string;
  customerOccupation?: string;
  customerBirthDate?: string; // YYYY-MM-DD
  idDocType?: string;
  idDocNumber?: string;
  itemFeatures?: string;
  itemQuantity?: number;
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
export const ID_DOC_TYPES = ['運転免許証', 'マイナンバーカード', 'パスポート', 'その他'] as const;
export const OCCUPATION_PRESETS = ['会社員', '自営業', 'パート・アルバイト', '専業主婦・主夫', '年金受給者', '無職', 'その他'] as const;
export const DEFAULT_EC_FEE_RATE = 0.1;
export const CATEGORY_PRESETS = [
  '貴金属・金',
  'ブランド・時計',
  '古銭・切手',
  '骨董・茶道具',
  '着物・毛皮',
  '家電・カメラ',
  '不用品回収・その他',
] as const;

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

export const calcDefaultPlatformFee = (
  yahooSales?: number,
  mercariSales?: number,
  rate = DEFAULT_EC_FEE_RATE
): number => Math.round(((yahooSales || 0) + (mercariSales || 0)) * rate);

export const calcRecordSales = (r: DealRecord): number =>
  (r.goldSales || 0) +
  (r.marketSales || 0) +
  (r.yahooSales || 0) +
  (r.mercariSales || 0) +
  (r.recoverySales || 0);

export const calcRecordExpenses = (r: DealRecord): number =>
  (r.transportCost || 0) +
  (r.disposalCost || 0) +
  (r.platformFee || 0) +
  (r.shippingCost || 0);

export const calcRecordGross = (r: DealRecord): number =>
  calcRecordSales(r) - (r.purchaseAmount || 0);

export const calcRecordNet = (r: DealRecord): number =>
  calcRecordGross(r) - calcRecordExpenses(r);

/**
 * 案件の日付('M/D' や 'YYYY/MM/DD' 等)と所属月('YYYY/MM')からローカルDateを生成
 */
export const parseRecordDate = (rec: Pick<DealRecord, 'date' | 'month'>): Date | null => {
  const raw = (rec.date || '').trim();
  if (!raw) return null;

  const normalized = raw.replace(/-/g, '/');
  const parts = normalized.split('/').map(p => parseInt(p.trim(), 10));

  let year: number;
  let month: number;
  let day: number;

  if (parts.length === 3 && !parts.some(isNaN)) {
    [year, month, day] = parts;
  } else if (parts.length === 2 && !parts.some(isNaN)) {
    const mParts = (rec.month || '').split('/').map(Number);
    year = !isNaN(mParts[0]) && mParts[0] > 2000 ? mParts[0] : new Date().getFullYear();
    [month, day] = parts;
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return d;
};

export const formatDateYYYYMMDD = (d: Date, sep = '-'): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${sep}${m}${sep}${day}`;
};

export const formatRecordFullDate = (rec: Pick<DealRecord, 'date' | 'month'>, sep = '/'): string => {
  const d = parseRecordDate(rec);
  return d ? formatDateYYYYMMDD(d, sep) : rec.date || '';
};

/**
 * 生年月日(YYYY-MM-DD)と基準日(取引日など)から満年齢を算出
 */
export const calcAgeAtDate = (birthDateStr?: string, refDate?: Date | null): number | null => {
  if (!birthDateStr) return null;
  const parts = birthDateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [by, bm, bd] = parts;
  const target = refDate || new Date();
  let age = target.getFullYear() - by;
  const monthDiff = target.getMonth() + 1 - bm;
  if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < bd)) {
    age -= 1;
  }
  return age >= 0 && age < 150 ? age : null;
};

/**
 * 買取日から現在までの経過日数を返す
 */
export const getElapsedDaysFromDeal = (rec: Pick<DealRecord, 'date' | 'month'>, now = new Date()): number | null => {
  const dealDate = parseRecordDate(rec);
  if (!dealDate) return null;
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startDeal = new Date(dealDate.getFullYear(), dealDate.getMonth(), dealDate.getDate()).getTime();
  return Math.floor((startToday - startDeal) / (1000 * 60 * 60 * 24));
};

/**
 * 滞留在庫(ステータスが「完結」以外 かつ 買取日から30日以上経過)判定
 */
export const isStagnantRecord = (rec: DealRecord, thresholdDays = 30, now = new Date()): boolean => {
  if (rec.status === '完結') return false;
  const elapsed = getElapsedDaysFromDeal(rec, now);
  return elapsed !== null && elapsed >= thresholdDays;
};

export const calcStaffStats = (staffName: string, records: DealRecord[], adCost: number) => {
  // 松浦専用（1人用）として全レコードを対象に集計
  const filtered = records;

  const purchaseTotal = filtered.reduce((acc, r) => acc + (r.purchaseAmount || 0), 0);
  const purchaseCount = filtered.length;
  const goldSalesTotal = filtered.reduce((acc, r) => acc + (r.goldSales || 0), 0);
  const marketSalesTotal = filtered.reduce((acc, r) => acc + (r.marketSales || 0), 0);
  const yahooSalesTotal = filtered.reduce((acc, r) => acc + (r.yahooSales || 0), 0);
  const mercariSalesTotal = filtered.reduce((acc, r) => acc + (r.mercariSales || 0), 0);
  const recoverySalesTotal = filtered.reduce((acc, r) => acc + (r.recoverySales || 0), 0);
  const salesTotal = goldSalesTotal + marketSalesTotal + yahooSalesTotal + mercariSalesTotal + recoverySalesTotal;
  const carryoverTotal = filtered.reduce((acc, r) => acc + (r.carryover || 0), 0);
  const transportCostTotal = filtered.reduce((acc, r) => acc + (r.transportCost || 0), 0);
  const disposalCostTotal = filtered.reduce((acc, r) => acc + (r.disposalCost || 0), 0);
  const platformFeeTotal = filtered.reduce((acc, r) => acc + (r.platformFee || 0), 0);
  const shippingCostTotal = filtered.reduce((acc, r) => acc + (r.shippingCost || 0), 0);
  const otherExpenses = filtered.reduce((acc, r) => acc + calcRecordExpenses(r), 0);
  const grossProfit = salesTotal - purchaseTotal;
  const averageCustomerSpend = purchaseCount > 0 ? Math.round(salesTotal / purchaseCount) : 0;
  const netProfit = grossProfit - adCost - otherExpenses;

  const mediaBreakdown = MEDIA_LIST.map(media => {
    const mRecs = filtered.filter(r => r.media === media);
    const count = mRecs.length;
    const purchaseSum = mRecs.reduce((acc, r) => acc + (r.purchaseAmount || 0), 0);
    const goldProfit = mRecs.reduce((acc, r) => acc + (r.estimatedGoldGrossProfit || 0), 0);
    const totalGross = mRecs.reduce((acc, r) => acc + calcRecordGross(r), 0);
    const totalSales = mRecs.reduce((acc, r) => acc + calcRecordSales(r), 0);
    return {
      media,
      count,
      purchaseSum,
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
    mercariSalesTotal,
    goldSalesTotal,
    marketSalesTotal,
    recoverySalesTotal,
    transportCostTotal,
    disposalCostTotal,
    platformFeeTotal,
    shippingCostTotal,
    adCost,
    otherExpenses,
    netProfit,
    mediaBreakdown,
  };
};

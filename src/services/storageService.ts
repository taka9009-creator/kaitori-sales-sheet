import {
  DealRecord,
  MarketItem,
  AdCosts,
  INITIAL_RECORDS,
  INITIAL_MARKET_ITEMS,
  INITIAL_AD_COSTS,
  INITIAL_MONTHS,
} from '../data';

/**
 * 既存の localStorage キー（後方互換性維持のため変更禁止）
 */
export const STORAGE_KEYS = {
  RECORDS: 'kaitori_pro_records_v3',
  MARKET: 'kaitori_pro_market_v3',
  TITLE: 'kaitori_pro_title_v3',
  AD_COSTS: 'kaitori_pro_adcosts_v3',
  PREV_CARRYOVER: 'kaitori_pro_prev_carryover_v3',
  MONTHS: 'kaitori_pro_months_v3',
  TARGET_GROSS: 'kaitori_pro_target_gross_v3',
} as const;

export interface PersistedAppState {
  sheetTitle: string;
  months: string[];
  records: DealRecord[];
  marketItems: MarketItem[];
  adCosts: AdCosts;
  prevCarryover: number;
  targetGrossProfit: number;
}

/**
 * 将来的に Firebase (Firestore) 等のクラウドバックエンドへ差し替えるための共通リポジトリ契約。
 * UI層 (App.tsx) はこのインターフェースのみに依存させる。
 */
export interface AppDataRepository {
  loadState(): PersistedAppState;
  saveState(state: PersistedAppState): void;
  clearState(): void;
  loadStateAsync(): Promise<PersistedAppState>;
  saveStateAsync(state: PersistedAppState): Promise<void>;
}

const DEFAULT_PERSISTED_STATE: PersistedAppState = {
  sheetTitle: '松浦売上管理表',
  months: INITIAL_MONTHS,
  records: INITIAL_RECORDS,
  marketItems: INITIAL_MARKET_ITEMS,
  adCosts: INITIAL_AD_COSTS,
  prevCarryover: 0,
  targetGrossProfit: 0,
};

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeAdCosts(raw: AdCosts | null): AdCosts {
  if (!raw || typeof raw !== 'object') return INITIAL_AD_COSTS;
  return {
    松浦: Number(raw.松浦) || 0,
    mediaCosts: {
      ...INITIAL_AD_COSTS.mediaCosts,
      ...(raw.mediaCosts || {}),
    },
  };
}

class LocalStorageRepository implements AppDataRepository {
  loadState(): PersistedAppState {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_PERSISTED_STATE;
    }
    try {
      const sheetTitle = localStorage.getItem(STORAGE_KEYS.TITLE) || DEFAULT_PERSISTED_STATE.sheetTitle;

      const parsedMonths = safeJsonParse<unknown>(
        localStorage.getItem(STORAGE_KEYS.MONTHS),
        INITIAL_MONTHS
      );
      const months = Array.isArray(parsedMonths) && parsedMonths.length > 0
        ? parsedMonths.map(String)
        : INITIAL_MONTHS;

      const parsedRecords = safeJsonParse<unknown>(
        localStorage.getItem(STORAGE_KEYS.RECORDS),
        INITIAL_RECORDS
      );
      const records = Array.isArray(parsedRecords) ? (parsedRecords as DealRecord[]) : INITIAL_RECORDS;

      const parsedMarket = safeJsonParse<unknown>(
        localStorage.getItem(STORAGE_KEYS.MARKET),
        INITIAL_MARKET_ITEMS
      );
      const marketItems = Array.isArray(parsedMarket) ? (parsedMarket as MarketItem[]) : INITIAL_MARKET_ITEMS;

      const parsedAdCosts = safeJsonParse<AdCosts | null>(
        localStorage.getItem(STORAGE_KEYS.AD_COSTS),
        null
      );
      const adCosts = normalizeAdCosts(parsedAdCosts);

      const prevCarryoverRaw = localStorage.getItem(STORAGE_KEYS.PREV_CARRYOVER);
      const prevCarryover = prevCarryoverRaw ? Number(prevCarryoverRaw) || 0 : 0;

      const targetGrossRaw = localStorage.getItem(STORAGE_KEYS.TARGET_GROSS);
      const targetGrossProfit = targetGrossRaw ? Number(targetGrossRaw) || 0 : 0;

      return {
        sheetTitle,
        months,
        records,
        marketItems,
        adCosts,
        prevCarryover,
        targetGrossProfit,
      };
    } catch (e) {
      console.error('LocalStorage load failed:', e);
      return DEFAULT_PERSISTED_STATE;
    }
  }

  saveState(state: PersistedAppState): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(state.records));
      localStorage.setItem(STORAGE_KEYS.MARKET, JSON.stringify(state.marketItems));
      localStorage.setItem(STORAGE_KEYS.TITLE, state.sheetTitle);
      localStorage.setItem(STORAGE_KEYS.AD_COSTS, JSON.stringify(state.adCosts));
      localStorage.setItem(STORAGE_KEYS.PREV_CARRYOVER, String(state.prevCarryover));
      localStorage.setItem(STORAGE_KEYS.MONTHS, JSON.stringify(state.months));
      localStorage.setItem(STORAGE_KEYS.TARGET_GROSS, String(state.targetGrossProfit));
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }
  }

  clearState(): void {
    this.saveState({
      ...DEFAULT_PERSISTED_STATE,
      records: [],
      marketItems: [],
      adCosts: {
        松浦: 0,
        mediaCosts: { ...INITIAL_AD_COSTS.mediaCosts },
      },
      prevCarryover: 0,
      targetGrossProfit: 0,
    });
  }

  async loadStateAsync(): Promise<PersistedAppState> {
    return this.loadState();
  }

  async saveStateAsync(state: PersistedAppState): Promise<void> {
    this.saveState(state);
  }
}

/**
 * 現在のデフォルトデータストア。
 * Firebase / Firestore 移行時は、AppDataRepository を実装した FirestoreRepository を
 * 生成・差し替えるだけでアプリケーション全体をクラウド同期へ切り替え可能。
 */
export const storageService: AppDataRepository = new LocalStorageRepository();

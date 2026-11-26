import React, { useState, useMemo } from 'react';
import {
  Gavel, TrendingUp, CheckCircle2, Plus, Building2, Trash2,
  BarChart3, Coins, Trophy, Megaphone, Target, ArrowUpRight, Wallet, Receipt, Calendar
} from 'lucide-react';
import {
  DealRecord, MarketItem, AdCosts, STAFF_LIST, MEDIA_LIST, MARKET_STATUS_LIST,
  formatCurrency, formatPercent, calcStaffStats, calcRecordSales
} from '../data';

export const MarketView: React.FC<{
  items: MarketItem[];
  onAddItem: (item: MarketItem) => void;
  onUpdateItem: (item: MarketItem) => void;
  onDeleteItem: (id: string) => void;
  onSyncToLedger?: (item: MarketItem) => void;
}> = ({ items, onAddItem, onUpdateItem, onDeleteItem, onSyncToLedger }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editVal, setEditVal] = useState('');
  const [form, setForm] = useState({
    purchaseDate: '2026/09/25',
    itemDescription: '',
    staff: STAFF_LIST[0] as string,
    purchaseCost: 0,
    estimatedMarketPrice: 0,
    targetMarketName: '関東道具市場',
    auctionDate: '2026/10/05',
    commissionRate: 10,
    status: '出品準備完了',
    notes: '',
  });

  const totalCost = items.reduce((s, i) => s + i.purchaseCost, 0);
  const totalEst = items.reduce((s, i) => s + i.estimatedMarketPrice, 0);
  const soldItems = items.filter(i => i.actualSoldPrice !== null);
  const totalSold = soldItems.reduce((s, i) => s + (i.actualSoldPrice || 0), 0);
  const totalFee = soldItems.reduce((s, i) => s + ((i.actualSoldPrice || 0) * i.commissionRate) / 100, 0);
  const realizedNetProfit = totalSold - totalFee - soldItems.reduce((s, i) => s + i.purchaseCost, 0);

  const startEdit = (item: MarketItem, field: keyof MarketItem) => {
    setEditingCell({ id: item.id, field });
    setEditVal(item[field] === null ? '' : String(item[field]));
  };

  const commitEdit = (item: MarketItem) => {
    if (!editingCell) return;
    const { field } = editingCell;
    const updated = { ...item };
    if (field === 'actualSoldPrice') {
      const trimmed = editVal.trim();
      if (trimmed === '') {
        updated.actualSoldPrice = null;
      } else {
        const num = Number(trimmed.replace(/,/g, ''));
        updated.actualSoldPrice = isNaN(num) ? null : num;
        if (updated.actualSoldPrice !== null && updated.actualSoldPrice > 0) {
          updated.status = '落札完了';
        }
      }
    } else if (field === 'purchaseCost' || field === 'estimatedMarketPrice' || field === 'commissionRate') {
      (updated as any)[field] = Number(editVal.replace(/,/g, '')) || 0;
    } else {
      (updated as any)[field] = editVal;
    }
    onUpdateItem(updated);
    setEditingCell(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-4 space-y-4 text-xs text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">市場出品総アイテム数</span>
            <Gavel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-gray-900">{items.length} 点</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            落札済: {soldItems.length} 点 / 保管・準備中: {items.length - soldItems.length} 点
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">仕入原価合計 (買取額)</span>
            <span className="text-rose-600 text-xs font-bold">COST</span>
          </div>
          <div className="font-mono text-xl font-bold text-rose-700">¥{formatCurrency(totalCost)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">市場出し予定品の買取仕入れ総額</div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">予想落札総額 (見込)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-xl font-bold text-blue-700">¥{formatCurrency(totalEst)}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
            見込粗利: ¥{formatCurrency(totalEst - totalCost)}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-lg border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-semibold">落札確定粗利 (手数料控除後)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-emerald-700">¥{formatCurrency(realizedNetProfit)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            確定落札: ¥{formatCurrency(totalSold)} (手数料計: ¥{formatCurrency(totalFee)})
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 gap-2">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-emerald-700" />
            <h2 className="font-bold text-sm text-gray-800">古物市場・ブランドオークション出品管理台帳（クリックで落札額・状態編集可）</h2>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>市場出品アイテムを追加</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b border-gray-300 font-semibold text-center">
                <th className="py-2 px-2 border-r border-gray-300 w-10">No</th>
                <th className="py-2 px-2 border-r border-gray-300 w-24">仕入日</th>
                <th className="py-2 px-2 border-r border-gray-300 text-left min-w-48">品名・詳細</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-24">買取額(原価)</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-24">予想落札額</th>
                <th className="py-2 px-2 border-r border-gray-300 text-left min-w-36">出品先市場名</th>
                <th className="py-2 px-2 border-r border-gray-300 w-24">競売日</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-28 bg-emerald-50 text-emerald-950">実際落札額(編集可)</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-16">歩率</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-24">確定粗利</th>
                <th className="py-2 px-2 border-r border-gray-300 w-28">状態</th>
                <th className="py-2 px-2 border-r border-gray-300 text-left min-w-36">備考</th>
                <th className="py-2 px-2 w-32">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-gray-400 font-sans">
                    市場出品アイテムはまだ登録されていません。「市場出品アイテムを追加」または売上明細シートの「市場へ出品」ボタンから登録できます。
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const netProfit = item.actualSoldPrice === null
                    ? null
                    : item.actualSoldPrice - (item.actualSoldPrice * item.commissionRate) / 100 - item.purchaseCost;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-1.5 px-2 text-center bg-gray-50 border-r border-gray-200 text-gray-500 text-[11px]">{idx + 1}</td>
                      <td
                        onClick={() => startEdit(item, 'purchaseDate')}
                        className="py-1.5 px-2 text-center border-r border-gray-200 font-sans cursor-pointer hover:bg-gray-50"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'purchaseDate' ? (
                          <input
                            type="text"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-center text-xs outline-none"
                          />
                        ) : item.purchaseDate}
                      </td>
                      <td
                        onClick={() => startEdit(item, 'itemDescription')}
                        className="py-1.5 px-2 border-r border-gray-200 font-sans font-medium text-gray-900 cursor-pointer hover:bg-gray-50"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'itemDescription' ? (
                          <input
                            type="text"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-xs outline-none"
                          />
                        ) : item.itemDescription}
                      </td>
                      <td
                        onClick={() => startEdit(item, 'purchaseCost')}
                        className="py-1.5 px-2 text-right border-r border-gray-200 text-rose-700 font-semibold cursor-pointer hover:bg-rose-50/40"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'purchaseCost' ? (
                          <input
                            type="number"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-rose-500 rounded bg-white text-right text-xs outline-none"
                          />
                        ) : `¥${formatCurrency(item.purchaseCost)}`}
                      </td>
                      <td
                        onClick={() => startEdit(item, 'estimatedMarketPrice')}
                        className="py-1.5 px-2 text-right border-r border-gray-200 text-blue-700 font-semibold cursor-pointer hover:bg-blue-50/40"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'estimatedMarketPrice' ? (
                          <input
                            type="number"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-blue-500 rounded bg-white text-right text-xs outline-none"
                          />
                        ) : `¥${formatCurrency(item.estimatedMarketPrice)}`}
                      </td>
                      <td
                        onClick={() => startEdit(item, 'targetMarketName')}
                        className="py-1.5 px-2 border-r border-gray-200 font-sans text-gray-700 cursor-pointer hover:bg-gray-50"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'targetMarketName' ? (
                          <input
                            type="text"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-xs outline-none"
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{item.targetMarketName}</span>
                          </div>
                        )}
                      </td>
                      <td
                        onClick={() => startEdit(item, 'auctionDate')}
                        className="py-1.5 px-2 text-center border-r border-gray-200 font-sans text-gray-600 cursor-pointer hover:bg-gray-50"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'auctionDate' ? (
                          <input
                            type="text"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-center text-xs outline-none"
                          />
                        ) : item.auctionDate}
                      </td>
                      <td
                        onClick={() => startEdit(item, 'actualSoldPrice')}
                        className="py-1.5 px-2 text-right border-r border-gray-200 bg-emerald-50/50 font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100/60"
                        title="クリックして実際落札額を入力"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'actualSoldPrice' ? (
                          <input
                            type="number"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            placeholder="落札額"
                            autoFocus
                            className="w-full px-1 py-0.5 border border-emerald-600 rounded bg-white text-right text-xs outline-none"
                          />
                        ) : item.actualSoldPrice === null ? (
                          <span className="text-emerald-600/80 underline decoration-dotted font-normal font-sans text-[11px]">
                            + 落札額を入力
                          </span>
                        ) : (
                          `¥${formatCurrency(item.actualSoldPrice)}`
                        )}
                      </td>
                      <td
                        onClick={() => startEdit(item, 'commissionRate')}
                        className="py-1.5 px-2 text-right border-r border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'commissionRate' ? (
                          <input
                            type="number"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-emerald-500 rounded bg-white text-right text-xs outline-none"
                          />
                        ) : `${item.commissionRate}%`}
                      </td>
                      <td className="py-1.5 px-2 text-right border-r border-gray-200 font-bold">
                        {netProfit === null ? (
                          <span className="text-gray-400 font-normal font-sans">-</span>
                        ) : (
                          <span className={netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                            ¥{formatCurrency(netProfit)}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-gray-200 font-sans">
                        <select
                          value={item.status}
                          onChange={e => onUpdateItem({ ...item, status: e.target.value })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold outline-none cursor-pointer ${
                            item.status === '落札完了'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === '出品準備完了'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === '保管中'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {MARKET_STATUS_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td
                        onClick={() => startEdit(item, 'notes')}
                        className="py-1.5 px-2 border-r border-gray-200 font-sans text-gray-500 text-[11px] cursor-pointer hover:bg-gray-50"
                      >
                        {editingCell?.id === item.id && editingCell.field === 'notes' ? (
                          <input
                            type="text"
                            value={editVal}
                            onFocus={e => e.target.select()}
                            onChange={e => setEditVal(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                            autoFocus
                            className="w-full px-1 py-0.5 border border-gray-400 rounded bg-white text-xs outline-none"
                          />
                        ) : (item.notes || '-')}
                      </td>
                      <td className="py-1.5 px-2 text-center font-sans">
                        <div className="flex items-center justify-center gap-1">
                          {item.actualSoldPrice !== null && onSyncToLedger && (
                            <button
                              onClick={() => onSyncToLedger(item)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-0.5 shadow-2xs cursor-pointer"
                              title="当月台帳の市場売上に反映"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>台帳に反映</span>
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-emerald-600" />
              市場出品アイテムの登録（松浦専用）
            </h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!form.itemDescription) return;
                onAddItem({
                  id: `mkt-${Date.now()}`,
                  purchaseDate: form.purchaseDate,
                  itemDescription: form.itemDescription,
                  staff: STAFF_LIST[0],
                  purchaseCost: Number(form.purchaseCost) || 0,
                  estimatedMarketPrice: Number(form.estimatedMarketPrice) || 0,
                  targetMarketName: form.targetMarketName,
                  auctionDate: form.auctionDate,
                  actualSoldPrice: null,
                  commissionRate: Number(form.commissionRate) || 10,
                  status: form.status,
                  notes: form.notes,
                });
                setShowAdd(false);
                setForm({
                  purchaseDate: '2026/09/25',
                  itemDescription: '',
                  staff: STAFF_LIST[0] as string,
                  purchaseCost: 0,
                  estimatedMarketPrice: 0,
                  targetMarketName: '関東道具市場',
                  auctionDate: '2026/10/05',
                  commissionRate: 10,
                  status: '出品準備完了',
                  notes: '',
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1 text-gray-700">品名・商品詳細</label>
                <input
                  type="text"
                  value={form.itemDescription}
                  onChange={e => setForm({ ...form, itemDescription: e.target.value })}
                  placeholder="例: 古九谷色絵大皿・共箱付き"
                  required
                  autoFocus
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">仕入日</label>
                  <input
                    type="text"
                    value={form.purchaseDate}
                    onChange={e => setForm({ ...form, purchaseDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">出品先古物市場</label>
                  <input
                    type="text"
                    value={form.targetMarketName}
                    onChange={e => setForm({ ...form, targetMarketName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">仕入原価(買取額)</label>
                  <input
                    type="number"
                    value={form.purchaseCost}
                    onFocus={e => e.target.select()}
                    onChange={e => setForm({ ...form, purchaseCost: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">予想落札額</label>
                  <input
                    type="number"
                    value={form.estimatedMarketPrice}
                    onFocus={e => e.target.select()}
                    onChange={e => setForm({ ...form, estimatedMarketPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">オークション開催日</label>
                  <input
                    type="text"
                    value={form.auctionDate}
                    onChange={e => setForm({ ...form, auctionDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700">市場手数料率 (%)</label>
                  <input
                    type="number"
                    value={form.commissionRate}
                    onFocus={e => e.target.select()}
                    onChange={e => setForm({ ...form, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700">備考・コンディション</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
                >
                  登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const DailyChart: React.FC<{ records: DealRecord[] }> = ({ records }) => {
  const [mode, setMode] = useState<'comparison' | 'profitOnly'>('comparison');
  const [hoveredDay, setHoveredDay] = useState<any | null>(null);

  const dailyData = useMemo(() => {
    const map = new Map<string, DealRecord[]>();
    records.forEach(r => {
      const list = map.get(r.date) || [];
      list.push(r);
      map.set(r.date, list);
    });
    const res: any[] = [];
    Array.from(map.keys())
      .sort((a, b) => {
        const [m1, d1] = a.split('/').map(Number);
        const [m2, d2] = b.split('/').map(Number);
        return (m1 || 0) === (m2 || 0) ? (d1 || 0) - (d2 || 0) : (m1 || 0) - (m2 || 0);
      })
      .forEach(date => {
        const list = map.get(date) || [];
        const purchaseTotal = list.reduce((s, r) => s + (r.purchaseAmount || 0), 0);
        const goldSales = list.reduce((s, r) => s + (r.goldSales || 0), 0);
        const marketSales = list.reduce((s, r) => s + (r.marketSales || 0), 0);
        const yahooSales = list.reduce((s, r) => s + (r.yahooSales || 0), 0);
        const mercariSales = list.reduce((s, r) => s + (r.mercariSales || 0), 0);
        const recoverySales = list.reduce((s, r) => s + (r.recoverySales || 0), 0);
        const carryoverTotal = list.reduce((s, r) => s + (r.carryover || 0), 0);
        const salesTotal = goldSales + marketSales + yahooSales + mercariSales + recoverySales;
        const grossProfit = salesTotal - purchaseTotal;
        const dealsCount = list.length;
        const profitMargin = salesTotal > 0 ? (grossProfit / salesTotal) * 100 : 0;
        res.push({
          date,
          purchaseTotal,
          salesTotal,
          grossProfit,
          goldSales,
          marketSales,
          yahooSales,
          mercariSales,
          recoverySales,
          carryoverTotal,
          dealsCount,
          profitMargin,
        });
      });
    return res;
  }, [records]);

  const totalSales = dailyData.reduce((s, d) => s + d.salesTotal, 0);
  const totalPurchase = dailyData.reduce((s, d) => s + d.purchaseTotal, 0);
  const totalGross = totalSales - totalPurchase;
  const maxVal = useMemo(() => {
    if (dailyData.length === 0) return 100000;
    const vals = dailyData.flatMap(d => [d.salesTotal, d.purchaseTotal, Math.abs(d.grossProfit)]);
    return Math.max(...vals, 100000);
  }, [dailyData]);

  const bestDay = useMemo(
    () => (dailyData.length === 0 ? null : [...dailyData].sort((a, b) => b.grossProfit - a.grossProfit)[0]),
    [dailyData]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden space-y-4">
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>松浦 日別 売上・仕入・粗利推移チャート</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-mono">
                粗利 = 売上合計 - 仕入合計
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              日々の出張買取における「買取仕入れ費用」と「売上（即時金換金・市場等）」の差額粗利推移
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMode('comparison')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'comparison' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              売上・仕入・粗利（3本比較）
            </button>
            <button
              onClick={() => setMode('profitOnly')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'profitOnly' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              粗利のみ
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 pt-1">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
          <div className="text-[10px] text-emerald-800 font-medium flex items-center justify-between">
            <span>期間累計粗利益</span>
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="font-mono text-lg font-extrabold text-emerald-900 mt-1">¥{formatCurrency(totalGross)}</div>
        </div>
        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3">
          <div className="text-[10px] text-blue-800 font-medium flex items-center justify-between">
            <span>期間総売上合計</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="font-mono text-lg font-bold text-blue-900 mt-1">¥{formatCurrency(totalSales)}</div>
        </div>
        <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3">
          <div className="text-[10px] text-rose-800 font-medium flex items-center justify-between">
            <span>期間総仕入 (買取額)</span>
            <span className="text-rose-600 font-bold text-[10px]">仕入</span>
          </div>
          <div className="font-mono text-lg font-bold text-rose-900 mt-1">¥{formatCurrency(totalPurchase)}</div>
        </div>
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
          <div className="text-[10px] text-amber-800 font-medium flex items-center justify-between">
            <span>最高粗利記録日</span>
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="font-mono text-lg font-bold text-amber-950 mt-1">
            {bestDay ? `${bestDay.date}: ¥${formatCurrency(bestDay.grossProfit)}` : '-'}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 relative">
          {dailyData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-xs">
              案件データがまだありません。新規買取登録を行うと日別推移チャートが表示されます。
            </div>
          ) : (
            <div className="relative h-56 pt-4 pb-6 flex items-end justify-between gap-2 overflow-x-auto">
              {dailyData.map(d => {
                const sH = Math.max(4, Math.round((d.salesTotal / maxVal) * 100));
                const pH = Math.max(4, Math.round((d.purchaseTotal / maxVal) * 100));
                const gH = Math.max(4, Math.round((Math.abs(d.grossProfit) / maxVal) * 100));
                return (
                  <div
                    key={d.date}
                    className="flex-1 min-w-14 flex flex-col items-center h-full justify-end group relative cursor-pointer p-1 rounded-lg hover:bg-white/80"
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-40">
                      {mode === 'comparison' && (
                        <>
                          <div style={{ height: `${sH}%` }} className="w-1/3 max-w-4 bg-blue-500 rounded-t-xs" title={`売上: ¥${formatCurrency(d.salesTotal)}`} />
                          <div style={{ height: `${pH}%` }} className="w-1/3 max-w-4 bg-rose-500 rounded-t-xs" title={`仕入: ¥${formatCurrency(d.purchaseTotal)}`} />
                        </>
                      )}
                      <div
                        style={{ height: `${gH}%` }}
                        className={`${mode === 'comparison' ? 'w-1/3 max-w-4' : 'w-3/5 max-w-8'} ${
                          d.grossProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600'
                        } rounded-t-xs`}
                        title={`粗利: ¥${formatCurrency(d.grossProfit)}`}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-bold text-gray-800 block">{d.date}</span>
                      <span className="text-[9px] text-gray-500 font-mono">{d.dealsCount}件</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {hoveredDay && (
            <div className="absolute top-3 right-3 z-20 bg-slate-900/95 text-white p-3 rounded-xl shadow-xl w-60 text-xs font-mono pointer-events-none">
              <div className="font-bold text-amber-400 pb-1 border-b border-slate-700 font-sans">
                {hoveredDay.date} 実績 ({hoveredDay.dealsCount}件)
              </div>
              <div className="space-y-1 pt-1.5 text-[11px]">
                <div className="flex justify-between text-blue-300"><span>売上:</span><span>¥{formatCurrency(hoveredDay.salesTotal)}</span></div>
                <div className="flex justify-between text-rose-300"><span>仕入:</span><span>¥{formatCurrency(hoveredDay.purchaseTotal)}</span></div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-700 pt-1">
                  <span>粗利:</span><span>¥{formatCurrency(hoveredDay.grossProfit)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 日別実績一覧テーブル */}
      {dailyData.length > 0 && (
        <div className="px-4 pb-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 font-bold text-xs text-gray-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>日別 実績一覧表</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-center font-sans">
                    <th className="py-2 px-3 border-r">日付</th>
                    <th className="py-2 px-3 border-r">件数</th>
                    <th className="py-2 px-3 border-r text-right">買取仕入</th>
                    <th className="py-2 px-3 border-r text-right">金売上</th>
                    <th className="py-2 px-3 border-r text-right">市場売上</th>
                    <th className="py-2 px-3 border-r text-right">EC・回収他</th>
                    <th className="py-2 px-3 border-r text-right font-bold">売上合計</th>
                    <th className="py-2 px-3 border-r text-right font-bold">日別粗利</th>
                    <th className="py-2 px-3 text-right">粗利率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyData.map(d => (
                    <tr key={d.date} className="hover:bg-blue-50/30">
                      <td className="py-1.5 px-3 text-center border-r font-sans font-bold text-gray-800">{d.date}</td>
                      <td className="py-1.5 px-3 text-center border-r">{d.dealsCount}件</td>
                      <td className="py-1.5 px-3 text-right border-r text-rose-700">¥{formatCurrency(d.purchaseTotal)}</td>
                      <td className="py-1.5 px-3 text-right border-r text-amber-800">¥{formatCurrency(d.goldSales)}</td>
                      <td className="py-1.5 px-3 text-right border-r text-emerald-800">¥{formatCurrency(d.marketSales)}</td>
                      <td className="py-1.5 px-3 text-right border-r text-gray-700">¥{formatCurrency(d.yahooSales + d.mercariSales + d.recoverySales)}</td>
                      <td className="py-1.5 px-3 text-right border-r font-bold text-blue-800">¥{formatCurrency(d.salesTotal)}</td>
                      <td className={`py-1.5 px-3 text-right border-r font-bold ${d.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        ¥{formatCurrency(d.grossProfit)}
                      </td>
                      <td className="py-1.5 px-3 text-right text-gray-600">
                        {d.salesTotal > 0 ? `${d.profitMargin.toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PersonalAnalyticsView: React.FC<{
  records: DealRecord[];
  adCosts: AdCosts;
  onUpdateStaffAdCost: (staff: '松浦', val: number) => void;
}> = ({ records, adCosts, onUpdateStaffAdCost }) => {
  const matsuura = calcStaffStats('松浦', records, adCosts.松浦);
  const marginPct = matsuura.salesTotal > 0 ? (matsuura.grossProfit / matsuura.salesTotal) * 100 : 0;

  const channels = [
    { label: '金・地金（即換金）', val: matsuura.goldSalesTotal, color: 'bg-amber-500', textColor: 'text-amber-800' },
    { label: '古物市場（道具市・ブランド市）', val: matsuura.marketSalesTotal, color: 'bg-emerald-500', textColor: 'text-emerald-800' },
    { label: 'ヤフオク販売', val: matsuura.yahooSalesTotal, color: 'bg-blue-500', textColor: 'text-blue-800' },
    { label: 'メルカリShops販売', val: matsuura.mercariSalesTotal, color: 'bg-rose-500', textColor: 'text-rose-800' },
    { label: '回収・不用品・その他売上', val: matsuura.recoverySalesTotal, color: 'bg-slate-500', textColor: 'text-slate-800' },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-4 space-y-5 text-xs text-gray-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-semibold text-xs">当月 総売上高</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl font-bold text-gray-900">¥{formatCurrency(matsuura.salesTotal)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            成約 {matsuura.purchaseCount}件 / 平均客単価: ¥{formatCurrency(matsuura.averageCustomerSpend)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-semibold text-xs">当月 総粗利益</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-mono text-2xl font-bold text-amber-600">¥{formatCurrency(matsuura.grossProfit)}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            粗利率: {matsuura.salesTotal > 0 ? formatPercent(matsuura.grossProfit / matsuura.salesTotal) : '0.0%'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-semibold text-xs">翌月繰越 (未売却在庫)</span>
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] rounded font-bold">STOCK</span>
          </div>
          <div className="font-mono text-2xl font-bold text-purple-700">¥{formatCurrency(matsuura.carryoverTotal)}</div>
          <div className="text-[11px] text-gray-500 mt-1">次回市場・EC出品予定の在庫プール</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-300 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="font-semibold text-xs">松浦 最終純利益 (手残り)</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`font-mono text-2xl font-bold ${matsuura.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ¥{formatCurrency(matsuura.netProfit)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">広告費¥{formatCurrency(matsuura.adCost)}・経費¥{formatCurrency(matsuura.otherExpenses)}控除後</div>
        </div>
      </div>

      {/* 月次損益（P&L）＆ 販路別売上内訳 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左: 月次損益計算書 */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              松浦 月次損益計算書 (P&Lレポート)
            </h3>
            <span className="text-[10px] text-slate-300">粗利率 {marginPct.toFixed(1)}%</span>
          </div>
          <div className="p-4 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="font-sans font-semibold text-gray-700">① 売上高合計 (全販路)</span>
              <span className="font-bold text-base text-blue-800">¥{formatCurrency(matsuura.salesTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="font-sans text-gray-600">② (-) 買取仕入れ原価合計 ({matsuura.purchaseCount}件)</span>
              <span className="font-semibold text-rose-700">- ¥{formatCurrency(matsuura.purchaseTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="font-sans font-bold text-emerald-950">③ (=) 売上総利益 (粗利)</span>
              <span className="font-extrabold text-base text-emerald-800">¥{formatCurrency(matsuura.grossProfit)}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <span className="font-sans text-gray-600">④ (-) 広告宣伝費合計 (クリック/直接編集)</span>
              <div className="flex items-center gap-1">
                <span className="text-rose-600">- ¥</span>
                <input
                  type="number"
                  value={adCosts.松浦}
                  onFocus={e => e.target.select()}
                  onChange={e => onUpdateStaffAdCost('松浦', Number(e.target.value) || 0)}
                  className="w-28 px-2 py-0.5 text-right border border-gray-300 rounded bg-white font-mono text-xs focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
              <div>
                <div className="font-sans text-gray-600">⑤ (-) 現場・EC諸経費（手数料・送料・交通費・処分費）</div>
                <div className="text-[10px] text-gray-400 font-mono">
                  手数料¥{formatCurrency(matsuura.platformFeeTotal)} / 送料¥{formatCurrency(matsuura.shippingCostTotal)} / 交通¥{formatCurrency(matsuura.transportCostTotal)} / 処分¥{formatCurrency(matsuura.disposalCostTotal)}
                </div>
              </div>
              <span className="font-semibold text-rose-700">- ¥{formatCurrency(matsuura.otherExpenses)}</span>
            </div>
            <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg border-2 ${matsuura.netProfit >= 0 ? 'bg-cyan-50 border-cyan-400' : 'bg-rose-50 border-rose-300'}`}>
              <span className="font-sans font-extrabold text-sm text-gray-900">⑥ (=) 最終営業純利益 (手残り)</span>
              <span className={`font-extrabold text-lg ${matsuura.netProfit >= 0 ? 'text-cyan-900' : 'text-rose-700'}`}>
                ¥{formatCurrency(matsuura.netProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* 右: 販路別売上内訳 */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              販路別 売上内訳 ＆ 構成比
            </h3>
            <span className="text-[10px] text-slate-300">売上合計: ¥{formatCurrency(matsuura.salesTotal)}</span>
          </div>
          <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-center">
            {channels.map(ch => {
              const pct = matsuura.salesTotal > 0 ? (ch.val / matsuura.salesTotal) * 100 : 0;
              return (
                <div key={ch.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{ch.label}</span>
                    <div className="font-mono flex items-center gap-2">
                      <span className={`font-bold ${ch.textColor}`}>¥{formatCurrency(ch.val)}</span>
                      <span className="text-[11px] text-gray-500 w-12 text-right">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${ch.color} transition-all duration-300`} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>未売却在庫として翌月繰越中:</span>
              <span className="font-mono font-bold text-purple-700">¥{formatCurrency(matsuura.carryoverTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <DailyChart records={records} />
    </div>
  );
};

export const StaffAnalyticsView = PersonalAnalyticsView;

export const MediaAnalyticsView: React.FC<{
  records: DealRecord[];
  adCosts: AdCosts;
  onUpdateMediaAdCost: (media: string, val: number) => void;
}> = ({ records, adCosts, onUpdateMediaAdCost }) => {
  const mediaStats = MEDIA_LIST.map(name => {
    const recs = records.filter(r => r.media === name);
    const count = recs.length;
    const purchaseSum = recs.reduce((s, r) => s + r.purchaseAmount, 0);
    const salesSum = recs.reduce((s, r) => s + calcRecordSales(r), 0);
    const gross = salesSum - purchaseSum;
    const adCost = adCosts.mediaCosts[name] || 0;
    const avgTicket = count > 0 ? Math.round(salesSum / count) : 0;
    const avgGross = count > 0 ? Math.round(gross / count) : 0;
    const cpa = count > 0 && adCost > 0 ? Math.round(adCost / count) : 0;
    const roi = adCost > 0 ? (gross / adCost) * 100 : 0;
    const netAfterAd = gross - adCost;
    return { name, adCost, count, purchaseSum, salesSum, gross, avgTicket, avgGross, cpa, roi, netAfterAd };
  });

  const totalAdCost = mediaStats.reduce((s, m) => s + m.adCost, 0);
  const totalCount = mediaStats.reduce((s, m) => s + m.count, 0);
  const totalGross = mediaStats.reduce((s, m) => s + m.gross, 0);
  const totalNet = totalGross - totalAdCost;

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-4 space-y-5 text-xs text-gray-800">
      <div className="bg-white rounded-xl border border-gray-300 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-purple-900 text-white flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-300" />
            松浦 集客媒体別 費用対効果・CPA・ROI シミュレーター（チラシ vs Web）
          </h3>
          <span className="text-[11px] text-purple-200">※ 投下広告費を直接変更してCPA・ROIを試算できます</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-300 text-center">
                <th className="py-2.5 px-3 border-r border-gray-300 text-left">媒体名</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-right">投下広告費 (編集可)</th>
                <th className="py-2.5 px-3 border-r border-gray-300 w-20">成約件数</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-right">買取総額</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-right">総売上額</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-right font-bold text-emerald-800">獲得粗利</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-right">平均粗利/件</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-right">1件獲得単価(CPA)</th>
                <th className="py-2.5 px-3 border-r border-gray-300 text-right">広告控除後純利</th>
                <th className="py-2.5 px-3 text-right font-bold">ROI (粗利回収率)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {mediaStats.map(m => (
                <tr key={m.name} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-gray-900 border-r border-gray-200">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        m.name === 'チラシ'
                          ? 'bg-blue-100 text-blue-900'
                          : m.name === 'HP'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {m.name}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right border-r border-gray-200">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-gray-400">¥</span>
                      <input
                        type="number"
                        value={m.adCost}
                        onFocus={e => e.target.select()}
                        onChange={e => onUpdateMediaAdCost(m.name, Number(e.target.value) || 0)}
                        className="w-28 px-1.5 py-0.5 text-right border border-gray-300 rounded bg-white font-mono text-xs focus:border-purple-500 outline-none"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center border-r border-gray-200 font-bold">{m.count} 件</td>
                  <td className="py-2.5 px-3 text-right border-r border-gray-200 text-rose-700">¥{formatCurrency(m.purchaseSum)}</td>
                  <td className="py-2.5 px-3 text-right border-r border-gray-200 font-semibold">¥{formatCurrency(m.salesSum)}</td>
                  <td className="py-2.5 px-3 text-right border-r border-gray-200 font-bold text-emerald-800">¥{formatCurrency(m.gross)}</td>
                  <td className="py-2.5 px-3 text-right border-r border-gray-200 text-gray-700">¥{formatCurrency(m.avgGross)}</td>
                  <td className="py-2.5 px-3 text-right border-r border-gray-200 text-blue-700 font-semibold">
                    {m.cpa > 0 ? `¥${formatCurrency(m.cpa)}` : '-'}
                  </td>
                  <td className={`py-2.5 px-3 text-right border-r border-gray-200 font-bold ${m.netAfterAd >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    ¥{formatCurrency(m.netAfterAd)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    {m.adCost > 0 ? (
                      <span className={m.roi >= 100 ? 'text-emerald-700' : 'text-amber-700'}>{m.roi.toFixed(1)}%</span>
                    ) : (
                      <span className="text-gray-400 font-normal font-sans">広告費0円</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="bg-purple-50/70 font-bold border-t-2 border-purple-200">
                <td className="py-2.5 px-3 font-sans border-r border-gray-200">全媒体 合計</td>
                <td className="py-2.5 px-3 text-right border-r border-gray-200">¥{formatCurrency(totalAdCost)}</td>
                <td className="py-2.5 px-3 text-center border-r border-gray-200">{totalCount} 件</td>
                <td className="py-2.5 px-3 text-right border-r border-gray-200 text-rose-700">
                  ¥{formatCurrency(mediaStats.reduce((s, m) => s + m.purchaseSum, 0))}
                </td>
                <td className="py-2.5 px-3 text-right border-r border-gray-200">
                  ¥{formatCurrency(mediaStats.reduce((s, m) => s + m.salesSum, 0))}
                </td>
                <td className="py-2.5 px-3 text-right border-r border-gray-200 text-emerald-800">
                  ¥{formatCurrency(totalGross)}
                </td>
                <td className="py-2.5 px-3 text-right border-r border-gray-200">
                  ¥{formatCurrency(totalCount > 0 ? Math.round(totalGross / totalCount) : 0)}
                </td>
                <td className="py-2.5 px-3 text-right border-r border-gray-200 text-blue-700">
                  {totalCount > 0 && totalAdCost > 0 ? `¥${formatCurrency(Math.round(totalAdCost / totalCount))}` : '-'}
                </td>
                <td className={`py-2.5 px-3 text-right border-r border-gray-200 ${totalNet >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  ¥{formatCurrency(totalNet)}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {totalAdCost > 0 ? `${((totalGross / totalAdCost) * 100).toFixed(1)}%` : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 松浦 媒体別 構成比ビジュアルサマリー */}
      <div className="bg-white rounded-xl border border-gray-300 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <span className="font-bold text-sm text-gray-800">松浦 媒体別 粗利貢献シェア・平均客単価</span>
          <span className="font-mono text-xs text-emerald-700 font-bold">総粗利: ¥{formatCurrency(totalGross)}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {mediaStats.map(m => {
            const share = totalGross > 0 ? Math.max(0, (m.gross / totalGross) * 100) : 0;
            return (
              <div key={m.name} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{m.name}</span>
                  <span className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{m.count}件</span>
                </div>
                <div className="font-mono text-base font-extrabold text-emerald-700">¥{formatCurrency(m.gross)}</div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div style={{ width: `${share}%` }} className="h-full bg-purple-600" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>平均客単価: ¥{formatCurrency(m.avgTicket)}</span>
                  <span>{share.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

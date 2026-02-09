/**
 * 日本极简主义 - 离境时间段列表组件
 * 显示、编辑和删除离境时间段
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DeparturePeriodList() {
  const { state, updateDeparturePeriod, deleteDeparturePeriod } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const handleEdit = (id: string, startDate: string, endDate: string) => {
    setEditingId(id);
    setEditStartDate(startDate);
    setEditEndDate(endDate);
  };

  const handleSave = (id: string) => {
    if (!editStartDate || !editEndDate) {
      toast.error('请填写完整日期 Please fill in all dates');
      return;
    }

    if (new Date(editStartDate) > new Date(editEndDate)) {
      toast.error('开始日期不能晚于结束日期 Start date cannot be later than end date');
      return;
    }

    updateDeparturePeriod(id, editStartDate, editEndDate);
    setEditingId(null);
    toast.success('已更新离境时间段 Departure period updated');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditStartDate('');
    setEditEndDate('');
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个离境时间段吗? Are you sure you want to delete this departure period?')) {
      deleteDeparturePeriod(id);
      toast.success('已删除离境时间段 Departure period deleted');
    }
  };

  if (state.departurePeriods.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        <p>暂无离境记录 (No departure records yet)</p>
        <p className="mt-2 text-xs">使用批量标记功能添加离境时间段 (Use batch mark to add departure periods)</p>
      </div>
    );
  }

  // 按创建时间倒序排列
  const sortedPeriods = [...state.departurePeriods].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground/80 mb-4">
        离境记录 (Departure Records)
      </h3>
      
      <div className="space-y-2">
        {sortedPeriods.map((period) => (
          <div
            key={period.id}
            className="group p-4 bg-card border border-border/50 hover:border-border transition-all duration-300"
          >
            {editingId === period.id ? (
              // 编辑模式
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      开始日期 Start Date
                    </label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      结束日期 End Date
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleSave(period.id)}
                    className="px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:opacity-80 transition-opacity flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    保存 Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 text-xs border border-border hover:bg-muted transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    取消 Cancel
                  </button>
                </div>
              </div>
            ) : (
              // 显示模式
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-medium">
                      {period.startDate}
                    </span>
                    <span className="text-xs text-muted-foreground">至 to</span>
                    <span className="text-sm font-medium">
                      {period.endDate}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    共 {period.days} 天 ({period.days} days)
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(period.id, period.startDate, period.endDate)}
                    className="p-2 hover:bg-muted transition-colors"
                    title="编辑 Edit"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(period.id)}
                    className="p-2 hover:bg-destructive/10 transition-colors"
                    title="删除 Delete"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

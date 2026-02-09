/**
 * 日本极简主义 - 日期范围选择对话框
 * 用于批量标记连续离境时间段
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { parseDate, formatDate } from '@/lib/calculator';

export function DateRangeDialog() {
  const { state, batchToggleDepartures } = useApp();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error('请选择开始和结束日期 (Please select start and end dates)');
      return;
    }

    if (!state.config) return;
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const arrival = parseDate(state.config.arrivalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 验证日期范围
    if (start > end) {
      toast.error('开始日期不能晚于结束日期 (Start date cannot be later than end date)');
      return;
    }

    if (start < arrival) {
      toast.error('离境日期不能早于抵达日期 (Departure date cannot be earlier than arrival date)');
      return;
    }

    if (end > today) {
      toast.error('离境日期不能晚于今天');
      return;
    }

    // 计算天数
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (days > 365) {
      toast.error('单次离境时间段不能超过 365 天');
      return;
    }

    // 批量标记
    const datesToMark: string[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      const dateStr = formatDate(current);
      if (!state.departures[dateStr]) {
        datesToMark.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }

    // 批量添加
    batchToggleDepartures(datesToMark);

    toast.success(`已标记 ${datesToMark.length} 天为离境日期`);
    setOpen(false);
    setStartDate('');
    setEndDate('');
  };

  const maxDate = new Date().toISOString().split('T')[0];
  const minDate = state.config?.arrivalDate || '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
        >
          <Calendar className="w-3 h-3 mr-2" />
          批量标记 Batch Mark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">批量标记离境时间段 (Batch Mark Departure Period)</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            选择连续的离境开始和结束日期,系统将自动标记该时间段内的所有日期
            <br />
            Select continuous departure start and end dates, the system will automatically mark all dates within this period
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm font-normal">
              离境开始日期 (Departure Start Date)
            </Label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 bg-input border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm font-normal">
              离境结束日期 (Departure End Date)
            </Label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || minDate}
              max={maxDate}
              className="w-full px-4 py-3 bg-input border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {startDate && endDate && parseDate(startDate) <= parseDate(endDate) && (
            <div className="p-3 bg-muted/50 border border-border text-sm text-muted-foreground">
              将标记 <span className="font-medium text-foreground">
                {Math.floor((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
              </span> 天为离境日期 (Will mark {Math.floor((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days as departed)
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="text-xs"
          >
            取消 Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!startDate || !endDate}
            className="text-xs"
          >
            确认标记 Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

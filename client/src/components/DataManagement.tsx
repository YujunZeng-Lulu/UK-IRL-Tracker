/**
 * 日本极简主义 - 数据管理组件
 * 导入导出备份功能
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportData, importData } from '@/lib/storage';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';

export function DataManagement() {
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ilr-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('数据导出成功 (Data exported successfully)');
    } catch (error) {
      toast.error('导出失败,请重试 (Export failed, please retry)');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importData(content);
        
        if (success) {
          toast.success('数据导入成功,页面即将刷新 (Data imported successfully, page will refresh)');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error('导入失败,请检查文件格式 (Import failed, please check file format)');
        }
      } catch (error) {
        toast.error('导入失败,请检查文件格式 (Import failed, please check file format)');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('读取文件失败 (Failed to read file)');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="text-xs"
      >
        <Download className="w-3 h-3 mr-2" />
        导出备份 Export
      </Button>
      
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={isImporting}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isImporting}
          className="text-xs"
          asChild
        >
          <span>
            <Upload className="w-3 h-3 mr-2" />
            {isImporting ? '导入中... Importing' : '导入备份 Import'}
          </span>
        </Button>
      </label>
    </div>
  );
}

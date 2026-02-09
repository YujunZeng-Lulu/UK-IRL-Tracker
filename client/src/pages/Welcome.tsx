/**
 * 日本极简主义 - 欢迎页面
 * 首次使用时的配置引导
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { VisaType } from '@/../../shared/types';

export default function Welcome() {
  const { updateConfig, initialize } = useApp();
  const [visaType, setVisaType] = useState<VisaType>('5-year');
  const [arrivalDate, setArrivalDate] = useState('');

  const handleSubmit = () => {
    if (!arrivalDate) {
      return;
    }

    updateConfig({
      visaType,
      arrivalDate
    });

    initialize();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/ZlUTTpS1FZ9xWzWKRjdpl5/sandbox/ZtMjnDU0hYi8I7OhVcuPt7-img-1_1770668050000_na1fn_aGVyby1iYWNrZ3JvdW5k.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWmxVVFRwUzFGWjl4V3pXS1JqZHBsNS9zYW5kYm94L1p0TWpuRFUwaFlpOEk3T2hWY3VQdDctaW1nLTFfMTc3MDY2ODA1MDAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1ay5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=BkpoSUoqxkGUIIi6ZxSWZgQsNp~cfF~LrGwU-j4R0Zgd5sBHJL5PUVVLQITDPsbCIm-hDllWTKZTDV3tDcd3RcBpoEECRX7T5axbgGHC6IF5BZFyZHS1JDmzwWqAE6KQ7mYQWU7pmQ40lt9d5b2g08G7NjsH58TR1xhW8JxK2mAytBd0Lu~JJiNjWVkxfTDafO~EbNzHcTHPTxZ-T2TlxUflz98XMjlWH3GEAwTxrE-6rcq5EzVexe2Btqvd4CG3QzIVh0CYMyALESqxKfXOfb66xMQH5q4KfSj6XL8aRBG2yKkZLbZJi2LjE0Jl9LWnGm2RD8HLXmmNLQZvsmkPkw__')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
        <div className="w-full max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-card/95 backdrop-blur-sm border border-border p-12 space-y-8">
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-medium text-foreground">
              英国永居离境追踪
            </h1>
            <p className="text-xs text-muted-foreground mb-2">UK ILR Tracker</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              精确计算离境天数,守护您的永居资格
            </p>
            <p className="text-xs text-muted-foreground">Track your days outside the UK for ILR eligibility</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-normal">签证类型 <span className="text-sm text-muted-foreground">Visa Type</span></Label>
              <RadioGroup value={visaType} onValueChange={(v) => setVisaType(v as VisaType)}>
                <div className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value="5-year" id="5-year" />
                  <Label htmlFor="5-year" className="font-normal cursor-pointer">
                    5 年永居路线 (5-Year Route)
                    <span className="block text-xs text-muted-foreground mt-1">
                      Skilled Worker / Tier 2 / Global Talent
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value="10-year" id="10-year" />
                  <Label htmlFor="10-year" className="font-normal cursor-pointer">
                    10 年长期居住路线 (10-Year Route)
                    <span className="block text-xs text-muted-foreground mt-1">
                      Long Residence (任意签证类型组合 Any visa combination)
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label htmlFor="arrival-date" className="text-base font-normal">
                抵达英国日期 <span className="text-sm text-muted-foreground">UK Arrival Date</span>
              </Label>
              <input
                id="arrival-date"
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                请输入您第一次抵达英国的日期 (Enter your first arrival date in the UK)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!arrivalDate}
            className="w-full py-6 text-base font-normal transition-all duration-500 hover:opacity-80 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始追踪 Start Tracking
          </button>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              所有数据存储在您的浏览器本地 (All data stored locally in your browser)<br />
              无需注册,完全离线可用 (No registration, works offline)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

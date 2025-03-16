'use client'
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function CoinDetail(): React.ReactNode  {
  const { coinId } = useParams();
  const [timeFrame, setTimeFrame] = useState('1h');
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [activeTab, setActiveTab] = useState('buy');

  // 这里应该添加获取coin详情和持有者数据的逻辑
  const topHolders :any[] = []; // 模拟数据

  return (
    <div className="coin-detail">
      <h1>Coin Details</h1>
      <div className="content">
        <div className="kline-section">
          <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
            <option value="5d">5 Days</option>
          </select>
          {/* 这里需要集成K线图表库 */}
          <div className="kline-chart">K-Line Chart Placeholder</div>
        </div>

        <div className="trade-section">
          <div className="tabs">
            <button 
              className={activeTab === 'buy' ? 'active' : ''} 
              onClick={() => setActiveTab('buy')}
            >
              Buy
            </button>
            <button 
              className={activeTab === 'sell' ? 'active' : ''} 
              onClick={() => setActiveTab('sell')}
            >
              Sell
            </button>
          </div>

          {activeTab === 'buy' ? (
            <div className="trade-panel">
              <input 
                type="number" 
                value={buyAmount} 
                onChange={(e) => setBuyAmount(Number(e.target.value))} 
              />
              <div className="quick-buttons">
                <button onClick={() => setBuyAmount(0)}>Reset</button>
                <button onClick={() => setBuyAmount(0.1)}>0.1 SUI</button>
                <button onClick={() => setBuyAmount(0.5)}>0.5 SUI</button>
                <button onClick={() => setBuyAmount(1)}>1 SUI</button>
              </div>
            </div>
          ) : (
            <div className="trade-panel">
              <input 
                type="number" 
                value={sellAmount} 
                onChange={(e) => setSellAmount(Number(e.target.value))} 
              />
              <div className="quick-buttons">
                <button onClick={() => setSellAmount(0)}>Reset</button>
                <button onClick={() => setSellAmount(25)}>25%</button>
                <button onClick={() => setSellAmount(50)}>50%</button>
                <button onClick={() => setSellAmount(70)}>70%</button>
                <button onClick={() => setSellAmount(100)}>100%</button>
              </div>
            </div>
          )}

          <div className="top-holders">
            <h3>Top 20 Holders</h3>
            <ul>
              {topHolders.map((holder, index) => (
                <li key={index}>{holder.address} - {holder.amount}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';

export default function TextInputWithClear() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event:any) => {
    setInputValue(event.target.value);
  };

  const handleClearInput = () => {
    setInputValue('');
  };

  return (
    <div className="m-5">
      <div className="relative inline-block">
        {/* 输入框 */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="请输入内容"
          className="pl-3 pr-10 py-2 text-base border border-gray-300 rounded w-72"
        />
        {/* 清除按钮（使用 × 图标） */}
        {inputValue && (
          <button
            onClick={handleClearInput}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-none border-none cursor-pointer text-gray-500 text-xl"
          >
            ×
          </button>
        )}
      </div>

      {/* 显示当前输入内容 */}
      <p className="mt-2 text-gray-600">
        当前输入内容: {inputValue || '空'}
      </p>
    </div>
  );
}
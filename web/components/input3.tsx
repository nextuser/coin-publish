import { useState } from 'react';
import { Copy, Trash2 } from "lucide-react";





export default function TextInputWithClear() {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event:any) => {
    setInputValue(event.target.value);
  };

  const handleClearInput = () => {
    setInputValue('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputValue).then(() => {
      alert("已拷贝到剪贴板");
    }).catch((err) => {
      console.error("拷贝失败: ", err);
    });
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

        <div className="absolute top-2 right-2 flex space-x-2">
            <button onClick={handleCopy} className="text-gray-500 hover:text-gray-700">
              <Copy size={20} />
            </button>
            <button onClick={handleClearInput} className="text-gray-500 hover:text-gray-700">
              <Trash2 size={20} />
            </button>
        </div>
      </div>

      {/* 显示当前输入内容 */}
      <p className="mt-2 text-gray-600">
        当前输入内容: {inputValue || '空'}
      </p>
    </div>
  );
}
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function TextInputWithClear(props:{onClear: ()=>void, value:any, onChange:any, placeholder:any}) {

  return (
    <div style={{ margin: '20px' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* 输入框 */}
        <input
          type="text"
          onChange={props.onChange}
          placeholder={props.placeholder}
          value = {props.value}
          style={{
            padding: '8px 32px 8px 12px', // 右侧留出空间给图标
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '300px',
          }}
        />
        {/* 清除按钮（使用 Font Awesome 图标） */}
        {props.value && (
          <button
            onClick= { ()=>props.onClear()}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#999',
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* 显示当前输入内容 */}
      <p style={{ marginTop: '10px', color: '#666' }}>
        当前输入内容: {props.value || '空'}
      </p>
    </div>
  );
}
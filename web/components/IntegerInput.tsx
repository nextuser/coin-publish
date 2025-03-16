import React, { useState , Dispatch,SetStateAction} from 'react';
import { Input } from './ui/input';
const IntegerInput = (props:{min:number,max :number, value:string,setValue: (val:string)=>void } & React.ComponentProps<"input">) => {

    const handleChange = (e :any) => {
        let inputValue = e.target.value;
        // 确保输入为整数
        inputValue = inputValue.replace(/[^0-9]/g, '');
        // 将输入转换为数字
        let numValue = parseInt(inputValue, 10);
        // 处理空输入
        if (isNaN(numValue)) {
            props.setValue('');
            return;
        }
        // 限制范围在 0 - 255
        if (numValue < 0) {
            numValue = 0;
        } else if (numValue > 255) {
            numValue = 255;
        }
        props.setValue(numValue.toString());
    };

    return (
        <Input
            type="number"
            min={props.min}
            max={props.max}
            value={props.value}
            onChange={handleChange}
        />
    );
};

export default IntegerInput;
    
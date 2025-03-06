import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface KLineChartProps {
    data: number[][];
    xAxis : string[];
}

const KLineChart: React.FC<KLineChartProps> = (props:{ data :number[][],xAxis : string[]}) => {
    const chartRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                xAxis: {
                    type: 'category',
                    data: props.xAxis,
                    boundaryGap: false
                },
                yAxis: {
                    scale: true
                },
                series: [
                    {
                        name: 'K 线图',
                        type: 'candlestick',
                        data: props.data,
                    }
                ]
            };

            if (option && typeof option === 'object') {
                myChart.setOption(option);
            }

            return () => {
                myChart.dispose();
            };
        }
    }, [props.data]);

    return (
        <div ref={chartRef} style={{ width: '800px', height: '600px' }} />
    );
};

export default KLineChart;
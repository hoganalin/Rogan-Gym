import * as echarts from "echarts/core";
import { GridComponent } from "echarts/components";
import { LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([GridComponent, LineChart, UniversalTransition, CanvasRenderer]);

const incomePie = (element) => {
  echarts.dispose(element);
  const myChart = echarts.init(element);

  const setOption = (data) => {
    const option = {
      grid: {
        show: false,
        left: 0,
        right: 0,
        top: 1,
        bottom: 0,
        containLabel: false,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: "line",
          smooth: true,
          itemStyle: {
            color: "#4ade80",
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(74, 222, 128, 0.5)",
              },
              {
                offset: 1,
                color: "rgba(74, 222, 128, 0.1)",
              },
            ]),
          },
          showSymbol: false,
        },
      ],
    };

    option.series[0].data = data;

    return myChart.setOption(option);
  };
  const resize = () => myChart.resize();
  return { setOption, resize };
};

export default incomePie;

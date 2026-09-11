import * as echarts from "echarts/core";
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { PieChart } from "echarts/charts";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  TitleComponent,
]);

const incomePie = (element) => {
  echarts.dispose(element);
  const myChart = echarts.init(element);

  const setOption = (data) => {
    const option = {
      color: ["#7cb5ec", "#f97316", "#90ed7d"],
      tooltip: {
        trigger: "item",
        backgroundColor: "#000000",
        borderColor: "#555555",
        borderWidth: 2,
        textStyle: {
          color: "#ffffff",
        },
        formatter(params) {
          const res = `
          <div>
            <p class="mb-0">${params.seriesName}</p>
            <p class="mb-0">${params.marker}${params.name} ${params.data.value} (${params.percent}%)</p>
          </div>
          `;
          return res;
        },
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: "",
          type: "pie",
          itemStyle: {
            borderRadius: 0,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            formatter: "{b} : {d}%",
            fontSize: 16,
            fontWeight: "bold",
            color: "#ffffff",
          },
          data: [],
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

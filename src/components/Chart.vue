<template>
  <div class="chart-container">
    <Chart class="chart-content" ref="measurementChart" :data="chartData" :options="chartOptions" />
    <div v-if="props.edit === false">
      <Button @click="generateCSVPrompt()" class="button-download-csv">CSV</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DashboardSensorDataObject } from '../services/Interfaces';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import { Interaction, InteractionModeFunction } from 'chart.js';
import { getRelativePosition } from 'chart.js/helpers';
import { onMounted, ref, watch } from 'vue';
import { ConvertHEXtoRGB, FormatDate } from '../services/Utils';
import { useClassPresence } from '../services/useClassPresence';
import { useI18n } from 'vue-i18n';
import { dialogShow } from '../services/Dialog';

const { t } = useI18n();

declare module 'chart.js' {
  interface InteractionModeMap {
    customMode: InteractionModeFunction;
  }
}

interface ScaleY {
  id: string;
  sensor: string;
  unit: string;
}

/**
 * Custom interaction mode for chart.js
 * @param chart - The chart instance
 * @param e - The event object
 * @param options - Interaction options
 * @param useFinalPosition - Whether to use the final position
 */
Interaction.modes.customMode = function(chart, e, options, useFinalPosition) {
  const position = getRelativePosition(e, chart);

  const datasetIndexesFound: number[] = [];
  const items: any = [];
  Interaction.evaluateInteractionItems(chart, 'x', position, (element, datasetIndex, index) => {
    if (element.inXRange(position.x, useFinalPosition) && (datasetIndexesFound.includes(datasetIndex) === false)) {
      items.push({element, datasetIndex, index});
      datasetIndexesFound.push(datasetIndex);
    }
  });
  return items;
};

const props = defineProps({
  counter: { // Used to trigger updates
    type: Number,
    required: false,
    default: 0
  },
  edit: { // Whether the chart is in edit mode
    type: Boolean,
    required: false,
    default: false
  },
  index: { // Unique index for the chart
    type: Number,
    required: true
  },
  name: { // Chart name/title
    type: String,
    required: false,
    default: 'N/A',
  },
  sensors: { // Sensors to display in the chart
    type: Array<DashboardSensorDataObject>,
    required: true
  },
  sindex: { // Sensor index to highlight
    default: 0,
    required: false,
    type: Number
  }
});

let updateTimeout: ReturnType<typeof setTimeout> | null = null; // Timeout for debouncing updates

// Watch for dark mode changes to update grid line colors
const { present: isDark } = useClassPresence(() => document.documentElement, 'app-dark-mode', {
    immediate: true,
    onChange: (present, el) => {
      if (chartOptions.value === undefined) { return; }
      for (const a in chartOptions.value.scales) {
        chartOptions.value.scales[a].grid.color = present === true ? gridColors.dark : gridColors.light;
      }
      measurementChart.value.chart.update();
    }
  }
);

onMounted(() => {
  for (const s of props.sensors) {
    const sy = scaleY.find((y) => { return y.unit === s.unit });
    if (sy === undefined) {
      const yid = 'y' + scaleY.length;
      scaleY.push({ id: yid, sensor: s.sensor, unit: s.unit });
    }
  }

  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});

// Watch for sensor index changes
watch(() => props.sindex, async (newValue, oldValue) => {
  updateChartData();
});

// Watch for counter changes
watch(() => props.counter, async (newValue, oldValue) => {
  if (updateTimeout !== null) { clearTimeout(updateTimeout); }
  updateTimeout = setTimeout(() => {
    updateChartData();
    updateTimeout = null;
  }, 300);
});

const chartData = ref(); // Chart data
const chartOptions = ref(); // Chart options
const gridColors = { dark: 'rgba(255, 255, 255, 0.2)', light: 'rgba(0, 0, 0, 0.2)' }; // Grid line colors
const measurementChart = ref(); // Measurement chart instance
const scaleY: ScaleY[] = []; // Y-axis scales

/**
 * Execute CSV download
 */
const downloadCSVAction = () => {
  const csvHeader = [t('csv.date')];
  const baseData: any = [];
  for (const t of props.sensors[0].measurements) {
    baseData.push({ ts: t.x, data: [] });
  }
  for (const s of props.sensors) {
    csvHeader.push(s.name + ' (' + s.unit + ')');
    for (const m of s.measurements) {
      const d = baseData.find((d: any) => { return d.ts === m.x; });
      if (d !== undefined) {
        d.data.push(m.y.toString().replace('.', ','));
      } else { d.data.push(); }
    }
  }
  
  const csvData = [];
  for (const d of baseData) {
    let row = '"' + FormatDate(d.ts * 1000, true, true, true) + '";' + d.data.join(';');
    csvData.push(row);
  }
  const csvFinal = [csvHeader.join(';'), ...csvData].join('\n');
  
  // Create a Blob
  const blob = new Blob([csvFinal], { type: 'text/csv;charset=utf-8;' });

  // Filename timestamp
  const date = new Date();
  const filename = 'CoPower_' + props.name + '_' + date.getDate().toString().padStart(2, '0') + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getFullYear() + '_' + date.getHours().toString().padStart(2, '0') + '-' + date.getMinutes().toString().padStart(2, '0') + '-' + date.getSeconds().toString().padStart(2, '0');

  // Create a temporary download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
}

/**
 * Prompt the user to confirm CSV download
 */
const generateCSVPrompt = () => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('csv.downloadPrompt'),
    message: t('csv.downloadMessage', { name: props.name }),
    rejectProps: {
      label: t('buttons.cancel'),
      icon: 'pi pi-times',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: t('buttons.confirm'),
      icon: 'pi pi-check',
      size: 'small'
    },
    accept: () => {
      downloadCSVAction();
    },
    reject: () => {}
  });
}

/**
 * Get the axis limits for the chart
 */
const getAxisLimits = () => {
  const limits = { min: null, max: null };
  if (chartData.value === undefined || chartData.value.datasets === undefined || chartData.value.datasets.length === 0) {
    return limits;
  }
  limits.min = chartData.value.datasets[0].data[0].x;
  limits.max = chartData.value.datasets[0].data[chartData.value.datasets[0].data.length - 1].x;
  return limits;
}

/**
 * Set the chart data
 */
const setChartData = () => {
  const bar = [];
  const line = [];
  for (const s of props.sensors) {
    const sy = scaleY.find((y) => { return y.sensor === s.sensor });
    const rgb = ConvertHEXtoRGB(s.color);
    const data = {
      label: s.name,
      data: s.measurements,
      backgroundColor: `rgba(${rgb}, 0.2)`,
      borderColor: `rgba(${rgb}, 1)`,
      borderWidth: 2,
      pointHitRadius: 20,
      pointRadius: 0,
      tension: 0.4,
      fill: false,
      type: s.type,
      yAxisID: sy !== undefined ? sy.id : 'y'
    };
    if (s.type === 'bar') {
      bar.push(data);
    } else { line.push(data); }
  }
  return {
    datasets: [...line, ...bar]
  };
}

/**
 * Set the chart options
 */
const setChartOptions = () => {
  const scales: any = {
    x: {
      grid: {
        color: isDark.value === true ? gridColors.dark : gridColors.light,
      },
      ticks: {
        callback: (value: number, index: number, ticks: any): string => {
          if (value <= 1) { return '-'; }
          return FormatDate(value * 1000, true, true);
        }
      },
      title: {
        display: false
      },
      type: 'linear'
    },
    y: {
      display: false
    }
  };

  const chartLimits = getAxisLimits();
  if (chartLimits.min !== null && chartLimits.max !== null) { // Set x-axis limits based on data
    scales.x.min = chartLimits.min;
    scales.x.max = chartLimits.max;
  }
  
  let yindex = 0;
  for (const s of props.sensors) {
    const sy = scaleY.find((y) => { return y.unit === s.unit });
    if (sy !== undefined) {
      scales[sy.id] = {
        display: true,
        grid: {
          color: isDark.value === true ? gridColors.dark : gridColors.light,
          drawOnChartArea: yindex === 0
        },
        title: {
          display: true,
          text: s.unit,
        }
      }
    }
    yindex++;
  }

  return {
    interaction: {
      mode: 'customMode',
      intersect: false
    },
    maintainAspectRatio: false,
    parsing: false,
    plugins: {
      legend: {
        position: 'bottom',
        display: true
      },
      title: {
        display: true,
        text: props.name
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const unit = scaleY.find((y) => { return y.id === context.dataset.yAxisID });
            return context.parsed.y + ' ' + (unit !== undefined ? unit.unit : '');
          },
          title: (data: any) => {
            return FormatDate(data[0].parsed.x * 1000, true, true);
          }
        },
        mode: 'customMode',
        intersect: false
      }
    },
    responsive: true,
    scales
  };
}

/**
 * Update the chart data
 */
const updateChartData = () => {
  const chart = measurementChart.value.chart;
  chart.config.data = setChartData();
  chart.config.options = setChartOptions();
  chart.update();
}
</script>
<style scoped>
.button-download-csv {
  font-size: 0.75em;
  padding: 4px 6px;
  position: absolute;
  top: 0.5em;
  right: 0.5em;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-content {
  width: 100%;
  height: 100%;
}
</style>

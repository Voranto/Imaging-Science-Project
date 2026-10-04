
import Chart from 'chart.js/auto';
import { ref } from 'vue';

export const histogramCanvas = ref(null);
let chartInstance : Chart | null= null;

export const computeHistogram = (floatBuffer : Float32Array<ArrayBufferLike>) => {
  if (!floatBuffer || floatBuffer.length === 0) return [];

  const hist = new Uint32Array(256);
  const len = floatBuffer.length;

  for (let i = 0; i < len; i++) {
    
    const val = Math.round(floatBuffer[i]! * 255);
    
    // Clamp to [0, 255] bounds
    if (val >= 0 && val <= 255) {
      hist[val]!++;
    } else if (val > 255) {
      hist[255]!++;
    } else {
      hist[0]!++;
    }
  }

  return Array.from(hist);
};

// Function to render/update histogram
export const renderHistogram = (histogramData : Array<number>) => {
  if (!histogramCanvas.value) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(histogramCanvas.value, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 256 }, (_, i) => i),
      datasets: [{
        label: 'Pixel Count',
        data: histogramData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: true }
      }
    }
  });
};
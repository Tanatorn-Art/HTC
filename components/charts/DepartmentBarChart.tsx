'use client';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type DepartmentData = {
  department: string;
  total: number;
  checkedIn: number;
};

export default function DepartmentBarChart() {
  const [data, setData] = useState<DepartmentData[]>([]);

  useEffect(() => {
    fetch('/api/department')
      .then(res => res.json())
      .then(setData);
  }, []);

  const chartData = {
    labels: data.map(d => d.department),
    datasets: [
      {
        label: 'สแกนแล้ว',
        data: data.map(d => d.checkedIn),
        backgroundColor: '#3b82f6'
      },
      {
        label: 'ยังไม่สแกน',
        data: data.map(d => d.total - d.checkedIn),
        backgroundColor: '#d1d5db'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `จำนวน: ${context.raw}`
        }
      }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'จำนวนพนักงาน'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow" style={{ height: '500px' }}>
      <h2 className="text-lg font-bold mb-4">สถานะการสแกนเข้าแต่ละแผนก</h2>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

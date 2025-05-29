'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import Spinner from '@/components/ui/Spinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = {
  apiEndpoint: string;
};

export default function DepartmentBarChart({ apiEndpoint }: Props) {
  const [data, setData] = useState<{ department: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiEndpoint);
        const result = await res.json();

        const chart = result.map((dept: { deptname: string; countPerson: number }) => ({
          department: dept.deptname,
          count: dept.countPerson,
        }));

        setData(chart);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center text-gray-500">ไม่มีข้อมูลแผนก</div>;
  }

  const chartData = {
    labels: data.map((d) => d.department),
    datasets: [
      {
        label: 'จำนวนพนักงาน',
        data: data.map((d) => d.count),
        backgroundColor: '#3B82F6',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">จำนวนพนักงานแต่ละแผนก</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}

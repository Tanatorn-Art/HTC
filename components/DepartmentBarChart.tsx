'use client';

import { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartOptions,
  type AnimationSpec,
} from 'chart.js';
import ZoomPlugin from 'chartjs-plugin-zoom';
import Spinner from '@/components/ui/Spinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ZoomPlugin);

type Props = {
  apiEndpoint: string;
};

type DepartmentChartData = {
  deptcode: string;
  department: string;
  scannedCount: number;
  notScannedCount: number;
};

export default function DepartmentBarChart({ apiEndpoint }: Props) {
  const [data, setData] = useState<DepartmentChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [inView, setInView] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (chartContainerRef.current) {
      observer.observe(chartContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiEndpoint);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }
        const result: DepartmentChartData[] = await res.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setData([]);
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
        label: 'สแกนเข้าแล้ว',
        data: data.map((d) => d.scannedCount),
        backgroundColor: '#4CAF50',
        stack: 'Stack 1',
      },
      {
        label: 'ยังไม่สแกน',
        data: data.map((d) => d.notScannedCount),
        backgroundColor: '#FFC107',
        stack: 'Stack 1',
      },
    ],
  };

  const animationOptions: AnimationSpec<'bar'> = {
    duration: 1000,
    easing: 'easeOutQuart',
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'สรุปจำนวนพนักงานที่สแกนเข้าและยังไม่สแกน (รวมแผนกที่ไม่มีการสแกน)',
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    animation: inView ? animationOptions : false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'แผนก',
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { precision: 0 },
        title: {
          display: true,
          text: 'จำนวนพนักงาน',
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow" ref={chartContainerRef}>
      <h2 className="text-lg font-semibold mb-4">
        สรุปจำนวนพนักงานแต่ละแผนก (สแกนเข้า / ยังไม่สแกน)
      </h2>
      <div style={{ height: '500px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

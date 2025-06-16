'use client';

import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaExclamationCircle, FaUsers } from 'react-icons/fa'; 

type Props = {
  totalScanned: number; 
  totalNotScanned: number; 
};

const AttendanceCardSummary = ({ totalScanned, totalNotScanned }: Props) => {
  const router = useRouter();
  const totalEmployees = totalScanned + totalNotScanned;

  const handleRedirect = (status: string) => {
    router.push(`/report?status=${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch"> 

        <button
          onClick={() => handleRedirect('scanned')} 
          className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-5 rounded-2xl shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg h-full"
        >
          <div className="flex items-center gap-4">
            <FaUsers size={36} /> 
            <div className="text-left">
              <div className="text-2xl font-extrabold">{totalEmployees}</div>
              <div className="text-base text-blue-900 font-medium">Total</div> 
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRedirect('scanned')} 
          className="flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 px-6 py-5 rounded-2xl shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg h-full"
        >
          <div className="flex items-center gap-4">
            <FaCheckCircle size={36} />
            <div className="text-left">
              <div className="text-2xl font-extrabold">{totalScanned}</div>
              <div className="text-base text-green-900 font-medium">Scan</div> 
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRedirect('not_scanned')} 
          className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 px-6 py-5 rounded-2xl shadow-md transition-transform duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg h-full"
        >
          <div className="flex items-center gap-4">
            <FaExclamationCircle size={36} />
            <div className="text-left">
              <div className="text-2xl font-extrabold">{totalNotScanned}</div> 
              <div className="text-base text-red-900 font-medium">No Scan</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AttendanceCardSummary;

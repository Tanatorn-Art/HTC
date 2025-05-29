'use client';

export default function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-900 animate-spin" />
    </div>
  );
}

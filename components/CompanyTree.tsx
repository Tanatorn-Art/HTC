'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Department = {
  id: number;
  name: string;
  children?: Department[];
};

const CompanyTree = () => {
  const [treeData, setTreeData] = useState<Department[]>([]);

  useEffect(() => {
    fetch('/api/department')
      .then((res) => res.json())
      .then((data) => setTreeData(data));
  }, []);

  const renderTree = (nodes: Department[]) => (
    <ul className="pl-4 border-l border-gray-300">
      {nodes.map((node) => (
        <li key={node.id} className="py-1">
          <Link
            href={'/app/api/department/${node.id}'}
            className="text-blue-600 hover:underline"
          >
            {node.name}
          </Link>
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {treeData.length > 0 ? renderTree(treeData) : <div>ไม่พบข้อมูลแผนก</div>}
    </div>
  );
};

export default CompanyTree;
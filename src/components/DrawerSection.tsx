// src/components/DrawerSection.tsx

import React from "react";

interface DrawerSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DrawerSection: React.FC<DrawerSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`border-b border-gray-200 pb-6 mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default DrawerSection;
"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 mb-10">
      <h1 className="text-[42px] font-bold text-slate-900 tracking-tight leading-none">
        {title}
      </h1>
      <p className="text-[18px] text-slate-400 font-bold tracking-tight">
        {subtitle}
      </p>
    </div>
  );
}

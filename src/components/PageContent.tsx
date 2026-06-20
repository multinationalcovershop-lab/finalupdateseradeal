import React from "react";
import { FileText, Calendar, ArrowLeft } from "lucide-react";
import { Page } from "../types";

interface PageContentProps {
  page: Page;
  onBack: () => void;
}

export default function PageContent({ page, onBack }: PageContentProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in text-gray-800">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-orange-600 transition"
      >
        <ArrowLeft size={16} /> ফিরে যান (Back to Homepage)
      </button>

      {/* Frosted Glass Page Card */}
      <div className="bg-white/70 backdrop-blur-md border border-white/60 p-6 sm:p-10 rounded-3xl shadow-sm">
        {/* Header Metadata */}
        <div className="flex items-center gap-2 mb-3">
          <FileText className="text-orange-600" size={18} />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Sera Deal BD Official Pages
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-800 mb-2 leading-tight">
          {page.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8 pb-4 border-b border-gray-100">
          <Calendar size={13} />
          <span>Last modified: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>•</span>
          <span className="text-orange-600 font-semibold">Verified Author: Admin</span>
        </div>

        {/* Dynamic Inner HTML Content Output */}
        <article 
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}

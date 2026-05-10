import React, { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const Waiter = ({ message = 'Loading...', overlay = false }) => {
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-3" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Waiter;

import React from 'react';
import { WasteStatus } from '../../types';
import { CheckCircle2, Clock, XCircle, Calendar, Truck, PackageCheck, Eye } from 'lucide-react';

interface StatusTimelineProps {
  status: WasteStatus;
  createdAt?: string;
  scheduledDate?: string;
  completedAt?: string;
  rejectionReason?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  status,
  createdAt,
  scheduledDate,
  completedAt,
  rejectionReason,
}) => {
  const isRejected = status === 'Rejected';

  const normalSteps = [
    { id: 'Submitted', label: 'Submitted', desc: createdAt ? new Date(createdAt).toLocaleDateString() : 'Request logged', icon: Clock },
    { id: 'Under Review', label: 'Under Review', desc: 'Municipal validation', icon: Eye },
    { id: 'Accepted', label: 'Accepted', desc: 'Approved for pickup', icon: CheckCircle2 },
    { id: 'Scheduled', label: 'Scheduled', desc: scheduledDate ? new Date(scheduledDate).toLocaleDateString() : 'Route assigned', icon: Calendar },
    { id: 'Collected', label: 'Collected', desc: 'Loaded on truck', icon: Truck },
    { id: 'Completed', label: 'Completed', desc: completedAt ? new Date(completedAt).toLocaleDateString() : 'Delivered & logged', icon: PackageCheck },
  ];

  const rejectedSteps = [
    { id: 'Submitted', label: 'Submitted', desc: createdAt ? new Date(createdAt).toLocaleDateString() : 'Request logged', icon: Clock },
    { id: 'Under Review', label: 'Under Review', desc: 'Municipal validation', icon: Eye },
    { id: 'Rejected', label: 'Rejected', desc: rejectionReason ? `Reason: ${rejectionReason}` : 'Not approved', icon: XCircle },
  ];

  const steps = isRejected ? rejectedSteps : normalSteps;

  const getStepIndex = (currentStatus: WasteStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return 0;
      case 'Under Review':
        return 1;
      case 'Accepted':
        return 2;
      case 'Scheduled':
        return 3;
      case 'Collected':
        return 4;
      case 'Completed':
        return 5;
      case 'Rejected':
        return 2;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      {/* Desktop Horizontal Timeline */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 z-0" />
        <div
          className={`absolute top-5 left-8 h-1 transition-all duration-700 ease-out z-0 ${
            isRejected ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
          style={{
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 4rem)',
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 text-center max-w-[130px]">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isPassed
                    ? isRejected
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? isRejected
                      ? 'bg-rose-50 border-rose-500 text-rose-600 ring-4 ring-rose-100 animate-pulse'
                      : 'bg-emerald-50 border-emerald-600 text-emerald-600 ring-4 ring-emerald-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-semibold ${
                  isCurrent
                    ? isRejected
                      ? 'text-rose-600'
                      : 'text-emerald-700 font-bold'
                    : isPassed
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight mt-0.5 max-w-[120px] truncate" title={step.desc}>
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="flex md:hidden flex-col space-y-4 pl-4 border-l-2 border-slate-200 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="relative flex items-start space-x-3">
              <div
                className={`w-7 h-7 -ml-[27px] rounded-full flex items-center justify-center border-2 shrink-0 ${
                  isPassed
                    ? isRejected
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                    ? isRejected
                      ? 'bg-rose-50 border-rose-500 text-rose-600 ring-2 ring-rose-100'
                      : 'bg-emerald-50 border-emerald-600 text-emerald-600 ring-2 ring-emerald-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? isRejected
                        ? 'text-rose-600'
                        : 'text-emerald-700 font-bold'
                      : isPassed
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

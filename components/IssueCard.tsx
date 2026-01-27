import React from 'react';
import { motion } from 'framer-motion';
import { ArrowBigUp, MessageSquare, Clock, CheckCircle2, XCircle, Ban, AlertCircle, Image as ImageIcon, Flag, Trash2 } from 'lucide-react';
import { Issue, ViewMode } from '../types';

interface IssueCardProps {
  issue: Issue;
  isUpvoted: boolean;
  isReported: boolean;
  onUpvote: (id: string) => void;
  onReport: (id: string) => void;
  onResolve?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  viewMode: ViewMode;
  index: number;
}

export const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, 
  isUpvoted, 
  isReported,
  onUpvote, 
  onReport,
  onResolve,
  onReject,
  onDelete,
  viewMode, 
  index 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative w-full border rounded-2xl p-5 backdrop-blur-md transition-colors duration-300 group ${
        issue.status === 'rejected' 
          ? 'bg-red-950/10 border-red-500/20' 
          : 'bg-white/5 hover:bg-white/10 border-white/10'
      }`}
    >
      {/* Delete Button (Only for Owners) */}
      {onDelete && viewMode === 'student' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(issue.id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors z-20 shadow-sm border border-white/5"
          title="Delete your issue"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="flex gap-4">
        {/* Left Action Section */}
        <div className="flex flex-col items-center gap-2 min-w-[3rem]">
          {viewMode === 'student' ? (
            // Student View: Upvote
            <>
              <button
                onClick={() => issue.status === 'open' && onUpvote(issue.id)}
                disabled={issue.status !== 'open'}
                className={`p-2 rounded-xl transition-all active:scale-95 ${
                  issue.status !== 'open'
                    ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
                    : isUpvoted 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400'
                }`}
              >
                <ArrowBigUp size={24} fill={isUpvoted ? "currentColor" : "none"} />
              </button>
              <span className={`font-bold text-lg ${isUpvoted ? 'text-indigo-400' : 'text-slate-200'}`}>
                {issue.upvotes}
              </span>
            </>
          ) : (
            // Professor View: Resolve / Reject
            <>
              {issue.status === 'open' ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onResolve && onResolve(issue.id)}
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 border border-emerald-500/20"
                    title="Mark as Resolved"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <button
                    onClick={() => onReject && onReject(issue.id)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-500/20"
                    title="Reject Issue"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    {issue.status === 'resolved' ? (
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    ) : (
                      <Ban size={24} className="text-rose-500" />
                    )}
                 </div>
              )}
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
            <div className="flex flex-col">
               {/* Department Tag */}
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                {issue.department}
              </span>
              <h3 className={`text-xl font-semibold transition-colors ${issue.status === 'rejected' ? 'text-slate-300 line-through decoration-rose-500/50' : 'text-white group-hover:text-indigo-200'}`}>
                {issue.title}
              </h3>
            </div>

            {/* Status Badges */}
            {issue.status === 'resolved' && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 whitespace-nowrap">
                <CheckCircle2 size={12} /> RESOLVED
              </span>
            )}
            {issue.status === 'rejected' && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full border border-rose-400/20 whitespace-nowrap">
                <Ban size={12} /> REJECTED
              </span>
            )}
          </div>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {issue.description}
          </p>

          {/* Issue Image */}
          {issue.imageUrl && (
            <div className="mb-4">
              <div className="relative group/image overflow-hidden rounded-lg border border-white/10 max-w-md">
                 <img 
                   src={issue.imageUrl} 
                   alt="Issue attachment" 
                   className="w-full h-48 object-cover transition-transform duration-500 group-hover/image:scale-105" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity flex items-end p-3">
                   <span className="text-xs text-white flex items-center gap-1 font-medium">
                     <ImageIcon size={12} /> Attached Image
                   </span>
                 </div>
              </div>
            </div>
          )}

          {/* Resolved Proof Image */}
          {issue.status === 'resolved' && issue.resolvedImageUrl && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                 <CheckCircle2 size={14} className="text-emerald-400" />
                 <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Proof of Resolution</span>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-emerald-500/20 max-w-md">
                 <img 
                   src={issue.resolvedImageUrl} 
                   alt="Resolution proof" 
                   className="w-full h-48 object-cover" 
                 />
              </div>
            </div>
          )}

          {/* Rejection Reason Highlight */}
          {issue.status === 'rejected' && issue.rejectionReason && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm flex gap-3 items-start">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-xs uppercase opacity-70 mb-1">Reason for Rejection</span>
                {issue.rejectionReason}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(issue.timestamp).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
               by {issue.author}
            </span>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-auto">
               <button 
                 onClick={() => onReport(issue.id)}
                 className={`flex items-center gap-1 transition-colors ${isReported ? 'text-rose-500' : 'hover:text-rose-400'}`}
                 title="Report inappropriate content"
               >
                  <Flag size={14} fill={isReported ? "currentColor" : "none"} />
                  {isReported ? 'Reported' : 'Report'}
               </button>
               <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                <MessageSquare size={14} />
                Comments
               </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
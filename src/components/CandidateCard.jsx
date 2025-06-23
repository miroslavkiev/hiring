import React from 'react';
import { LocationIcon, UserIcon, TypeIcon, PriorityIcon } from './Icons';
import { getStatusColor, stageProgress } from '../utils';

const CandidateCard = ({ candidate, displayName }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between transform hover:scale-105 transition-transform duration-300">
    <div>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-800">{displayName}</h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(candidate.status)}`}>{candidate.status}</span>
      </div>
      <p className="text-sm text-gray-500 mt-2"><UserIcon /> Recruiter: {candidate.recruiter.name}</p>
      <div className="mt-4 space-y-3 text-sm text-gray-600">
        <div className="flex items-center"><LocationIcon /><span>{candidate.location}</span></div>
        <div className="flex items-center"><TypeIcon /><span>{candidate.type}</span></div>
        {candidate.priority !== "N/A" && (
          <div className="flex items-center"><PriorityIcon /><span>Priority: {candidate.priority}</span></div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700">Current Stage: {candidate.stage}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stageProgress[candidate.stage] || 5}%` }}></div>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-500 italic">"{candidate.details}"</p>
    </div>
  </div>
);

export default CandidateCard;

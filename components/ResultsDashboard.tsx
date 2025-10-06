
import React, { useState, useMemo } from 'react';
import type { Candidate } from '../types';
import { ChevronUpIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, ArrowPathIcon } from './Icons';

type SortKey = 'score' | 'candidateName';
type SortDirection = 'asc' | 'desc';

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 85) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (score >= 50) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };
  return <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getColor()}`}>{score}</span>;
};

// FIX: Wrapped icons in a span with a title attribute to fix prop type error, as 'title' is not a valid prop for the SVG components.
const RecommendationIcon: React.FC<{ recommendation: Candidate['recommendation'] }> = ({ recommendation }) => {
    switch (recommendation) {
        case 'Recommend for Interview':
            return <span title={recommendation}><CheckCircleIcon className="text-green-400" /></span>;
        case 'Consider for Other Roles':
            return <span title={recommendation}><QuestionMarkCircleIcon className="text-yellow-400" /></span>;
        case 'Not a Good Fit':
            return <span title={recommendation}><XCircleIcon className="text-red-400" /></span>;
        default:
            return null;
    }
};

const CandidateDetailModal: React.FC<{ candidate: Candidate; onClose: () => void }> = ({ candidate, onClose }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 sticky top-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">{candidate.candidateName}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                        <ScoreBadge score={candidate.score} />
                        <div className="flex items-center space-x-1.5 text-gray-300">
                           <RecommendationIcon recommendation={candidate.recommendation} />
                           <span>{candidate.recommendation}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XCircleIcon /></button>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="font-semibold text-lg text-green-400 mb-2">AI Summary</h3>
                    <p className="text-gray-300 leading-relaxed">{candidate.summary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-lg text-green-400 mb-2">Strengths</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-gray-300">
                            {candidate.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-red-400 mb-2">Gaps</h3>
                        <ul className="list-disc list-inside space-y-1.5 text-gray-300">
                            {candidate.gaps.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


export const ResultsDashboard: React.FC<{ results: Candidate[]; onReset: () => void }> = ({ results, onReset }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [results, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const SortableHeader: React.FC<{ columnKey: SortKey, children: React.ReactNode }> = ({ columnKey, children }) => (
      <th className="p-3 text-left cursor-pointer hover:bg-gray-700/50" onClick={() => handleSort(columnKey)}>
          <div className="flex items-center space-x-1">
            <span>{children}</span>
            {sortKey === columnKey && (sortDirection === 'desc' ? <ChevronDownIcon /> : <ChevronUpIcon />)}
          </div>
      </th>
  );

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Analysis Results</h2>
                <p className="text-gray-400">Found {results.length} candidates. Click a row for details.</p>
            </div>
             <button onClick={onReset} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300 flex items-center space-x-2">
                <ArrowPathIcon />
                <span>Start New Analysis</span>
            </button>
        </div>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                        <th className="p-3">Rank</th>
                        <SortableHeader columnKey="candidateName">Candidate</SortableHeader>
                        <SortableHeader columnKey="score">Score</SortableHeader>
                        <th className="p-3">Summary</th>
                        <th className="p-3 text-center">Recommendation</th>
                    </tr>
                </thead>
                <tbody>
                {sortedResults.map((candidate, index) => (
                    <tr key={index} onClick={() => setSelectedCandidate(candidate)} className="bg-gray-800/30 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors duration-200">
                        <td className="p-3 font-bold text-lg text-center">{candidate.position}</td>
                        <td className="p-3 font-semibold whitespace-nowrap">{candidate.candidateName}</td>
                        <td className="p-3"><ScoreBadge score={candidate.score} /></td>
                        <td className="p-3 max-w-sm truncate text-gray-400">{candidate.summary}</td>
                        <td className="p-3">
                           <div className="flex justify-center">
                             <RecommendationIcon recommendation={candidate.recommendation} />
                           </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
      {selectedCandidate && <CandidateDetailModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import CandidateCard from './components/CandidateCard';
import PipelineFilter from './components/PipelineFilter';
import SettingsModal from './components/SettingsModal';
import { UploadIcon, SettingsIcon } from './components/Icons';
import { shortenName } from './utils';
import ErrorToastProvider from './components/ErrorToastProvider';

// --- INITIAL STATE ---
const initialCandidates = [];

const App = () => {
  const [allCandidates, _setAllCandidates] = useState(initialCandidates);
  const [pipelineFilter, setPipelineFilter] = useState('All');
  const [sort, setSort] = useState('priority');
  const [shortenNamesFlag, setShortenNamesFlag] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, _setIsLoading] = useState(false);
  const [notification, _setNotification] = useState('');

  useEffect(() => {
    // Add favicon dynamically
    const favicon = document.createElement('link');
    favicon.id = 'dynamic-favicon';
    favicon.rel = 'icon';
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20,80 V40 H35 V80 H20 M45,80 V20 H60 V80 H45 M70,80 V50 H85 V80 H70" fill="%232563eb"/></svg>`;
    favicon.href = 'data:image/svg+xml,' + encodeURIComponent(svgIcon);

    const existingFavicon = document.getElementById('dynamic-favicon');
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }
    document.head.appendChild(favicon);

    return () => {
      if (document.head.contains(favicon)) {
        document.head.removeChild(favicon);
      }
    };
  }, []);


  const filteredCandidates = allCandidates.filter(
    (c) => pipelineFilter === 'All' || c.pipelineStatus === pipelineFilter
  );

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sort === 'priority') {
      const priorityA = parseFloat(a.priority);
      const priorityB = parseFloat(b.priority);
      if (isNaN(priorityA)) return 1;
      if (isNaN(priorityB)) return -1;
      return priorityA - priorityB;
    }
    if (sort === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const pipelineCounts = {
    All: allCandidates.length,
    'In-Progress': allCandidates.filter((c) => c.pipelineStatus === 'In-Progress').length,
    'On-Hold': allCandidates.filter((c) => c.pipelineStatus === 'On-Hold').length,
    Rejected: allCandidates.filter((c) => c.pipelineStatus === 'Rejected').length,
  };

  return (
    <ErrorToastProvider>
    <div className="bg-gray-50 min-h-screen w-full font-sans">
      {allCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen w-full p-4">
          {isLoading && (
            <div className="absolute top-5 text-center p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 font-semibold">Parsing CSV file...</p>
            </div>
          )}
          {notification && (
            <div
              className={`absolute top-5 text-center p-4 mb-4 rounded-lg ${notification.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}
            >
              <p className="font-semibold">{notification}</p>
            </div>
          )}
          <div className="text-center bg-white p-8 sm:p-12 rounded-xl shadow-md border w-full max-w-xl">
            <h1 className="text-3xl font-extrabold text-gray-800">Architect Hiring Pipeline</h1>
            <p className="mt-2 text-gray-500">To get started, please upload your CSV file.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-8 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold shadow-sm"
            >
              <UploadIcon />
              Open Settings & Upload
            </button>
          </div>
          <SettingsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      ) : (
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-none mx-auto">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-800">Architect Hiring Pipeline</h1>
                <p className="text-lg text-gray-500 mt-2">Live Report</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-200"
              >
                <SettingsIcon />
              </button>
            </header>

            {isLoading && (
              <div className="text-center p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 font-semibold">Parsing CSV file...</p>
              </div>
            )}
            {notification && (
              <div
                className={`text-center p-4 mb-4 rounded-lg ${notification.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}
              >
                <p className="font-semibold">{notification}</p>
              </div>
            )}

            <PipelineFilter counts={pipelineCounts} activeFilter={pipelineFilter} setFilter={setPipelineFilter} />
            <div className="flex justify-end items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="shorten-names"
                    checked={shortenNamesFlag}
                    onChange={() => setShortenNamesFlag(!shortenNamesFlag)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="shorten-names" className="text-sm font-medium text-gray-700">
                    Shorten Surnames
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select onChange={(e) => setSort(e.target.value)} className="p-2 border rounded-md text-sm">
                    <option value="priority">Priority</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  displayName={shortenNamesFlag ? shortenName(candidate.name) : candidate.name}
                />
              ))}
            </main>
          </div>
          <SettingsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      )}
    </div>
    </ErrorToastProvider>
  );
};

export default App;

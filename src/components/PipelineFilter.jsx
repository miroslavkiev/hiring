import React from 'react';

const PipelineFilter = ({ counts, activeFilter, setFilter }) => {
  const filters = [
    { name: 'All Candidates', key: 'All', color: 'bg-gray-100' },
    { name: 'In-Progress', key: 'In-Progress', color: 'bg-blue-100' },
    { name: 'On-Hold', key: 'On-Hold', color: 'bg-yellow-100' },
    { name: 'Rejected', key: 'Rejected', color: 'bg-red-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={`p-4 rounded-lg shadow-md text-center transition-all duration-200 transform hover:-translate-y-1 ${f.color} ${activeFilter === f.key ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent'}`}
        >
          <h3 className="text-2xl font-bold">{counts[f.key] || 0}</h3>
          <p className="text-sm font-semibold">{f.name}</p>
        </button>
      ))}
    </div>
  );
};

export default PipelineFilter;

import React, { useEffect, useState } from 'react';

// --- INITIAL STATE ---
const initialCandidates = [];

// --- STATIC CONFIGURATION ---
const statusColors = {
  "default": "bg-gray-100 text-gray-800",
  "ti to be set": "bg-blue-100 text-blue-800",
  "hri to be set": "bg-blue-100 text-blue-800",
  "hr set": "bg-indigo-100 text-indigo-800",
  "hri set": "bg-indigo-100 text-indigo-800",
  "hri failed": "bg-red-100 text-red-800",
  "hr failed": "bg-red-100 text-red-800",
  "ti set": "bg-green-100 text-green-800",
  "on hold": "bg-yellow-100 text-yellow-800",
  "hired": "bg-green-100 text-green-800",
};

const getStatusColor = (status) => {
    const normalizedStatus = (status || 'default').toLowerCase();
    for (const key in statusColors) {
        if (normalizedStatus.includes(key)) {
            return statusColors[key];
        }
    }
    if (normalizedStatus.includes('passed') || normalizedStatus.includes('accepted')) return 'bg-green-100 text-green-800';
    if (normalizedStatus.includes('failed') || normalizedStatus.includes('declined') || normalizedStatus.includes('rejected')) return 'bg-red-100 text-red-800';
    return statusColors.default;
};

// Updated progress percentages based on the approved proposal
const stageProgress = {
    'HRI to be set': 10,
    'HR is set': 15,
    'Hackerrank is sent': 20,
    'Hackerrank Passed': 30,
    'TI to be Set': 40,
    'TI is set': 45,
    'TI passed': 55,
    'DM CV review': 60,
    'DM call to be set': 65,
    'DM call is set': 70,
    'DM call Passed': 75,
    'CP to be shared w Client': 80,
    'CP sent to Client': 82,
    'CI to be set': 85,
    'CI is set': 88,
    'CI Passed': 90,
    'JO on approval': 95,
    'JO extended': 98,
    'JO accepted / Hired': 100,
    'N/A': 5,
};

// --- ICONS ---
const LocationIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> );
const TypeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg> );
const PriorityIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg> );
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> );
const UploadIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L9 9.414V13H5.5z" /><path d="M9 13h2v5a1 1 0 11-2 0v-5z" /></svg>);

// --- DATA PROCESSING UTILITIES ---
const shortenName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    if (parts.length <= 1) return fullName;
    const firstName = parts[0];
    const initials = parts.slice(1).map(part => `${part.charAt(0)}.`).join(' ');
    return `${firstName} ${initials}`;
};

const normalizeData = (row, index) => {
    const unifiedStatus = (row['Unified status'] || 'Unknown').toLowerCase();
    const shortStatus = (row['Short status'] || '').toLowerCase();
    const isActive = (row['Active'] || '').toLowerCase() !== 'no';

    let pipelineStatus;
    if (unifiedStatus.includes('on hold')) {
        pipelineStatus = 'On-Hold';
    } else if (!isActive || unifiedStatus.includes('rejected') || unifiedStatus.includes('failed') || unifiedStatus.includes('declined')) {
        pipelineStatus = 'Rejected';
    } else {
        pipelineStatus = 'In-Progress';
    }
    
    // Determine the most advanced stage based on the comprehensive list
    let stage = 'N/A';
    if (unifiedStatus.includes('jo accepted') || unifiedStatus.includes('hired')) stage = 'JO accepted / Hired';
    else if (unifiedStatus.includes('jo extended')) stage = 'JO extended';
    else if (unifiedStatus.includes('jo on approval')) stage = 'JO on approval';
    else if (unifiedStatus.includes('ci passed')) stage = 'CI Passed';
    else if (unifiedStatus.includes('ci is set')) stage = 'CI is set';
    else if (unifiedStatus.includes('ci to be set')) stage = 'CI to be set';
    else if (unifiedStatus.includes('cp sent to client')) stage = 'CP sent to Client';
    else if (unifiedStatus.includes('cp to be shared')) stage = 'CP to be shared w Client';
    else if (unifiedStatus.includes('dm call passed')) stage = 'DM call Passed';
    else if (unifiedStatus.includes('dm call is set')) stage = 'DM call is set';
    else if (unifiedStatus.includes('dm call to be set')) stage = 'DM call to be set';
    else if (unifiedStatus.includes('dm cv review')) stage = 'DM CV review';
    else if (unifiedStatus.includes('ti passed')) stage = 'TI passed';
    else if (unifiedStatus.includes('ti is set')) stage = 'TI is set';
    else if (unifiedStatus.includes('ti to be set')) stage = 'TI to be Set';
    else if (unifiedStatus.includes('hackerrank passed')) stage = 'Hackerrank Passed';
    else if (unifiedStatus.includes('hackerrank is sent')) stage = 'Hackerrank is sent';
    else if (unifiedStatus.includes('hr is set')) stage = 'HR is set';
    else if (unifiedStatus.includes('hri to be set')) stage = 'HRI to be set';
    
    let priority = (row['Priority according to start date + status'] || 'N/A').replace(/[^0-9]/g, '') || 'N/A';

    return {
        id: row.ID || index,
        name: row['Candidate Name'] || 'N/A',
        status: row['Unified status'] || 'Unknown', // Keep original for display
        stage: stage,
        location: row['Actual Location'] || 'N/A',
        type: row['Candidate type - external, bench, deployment'] || 'N/A',
        recruiter: { name: row['Responsible Recruiter or Deployment Partner'] || 'N/A' },
        priority: priority,
        details: row['Short status'] || 'No details provided.',
        pipelineStatus: pipelineStatus, 
    };
};

// --- COMPONENTS ---
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
        {candidate.priority !== "N/A" && ( <div className="flex items-center"><PriorityIcon /><span>Priority: {candidate.priority}</span></div> )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700">Current Stage: {candidate.stage}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stageProgress[candidate.stage] || 5}%` }}></div>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200"><p className="text-xs text-gray-500 italic">"{candidate.details}"</p></div>
  </div>
);

const SettingsModal = ({ isOpen, onClose, onSync }) => {
    if (!isOpen) return null;
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const handleFileChange = (event) => { const file = event.target.files[0]; if (file) { setSelectedFile(file); setFileName(file.name); } };
    return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"> <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"> <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">Settings</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon /></button></div> <div className="mt-6"> <label className="block text-sm font-medium text-gray-700 mb-2">Upload Pipeline CSV</label> <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"> <div className="space-y-1 text-center"> <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> <div className="flex text-sm text-gray-600"> <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} /></label> <p className="pl-1">or drag and drop</p> </div> <p className="text-xs text-gray-500">{fileName || 'CSV up to 10MB'}</p> </div> </div> </div> <div className="mt-8 flex justify-end"> <button onClick={() => onSync(selectedFile)} disabled={!selectedFile} className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"><UploadIcon />Sync Data</button> </div> </div> </div> );
};

const PipelineFilter = ({ counts, activeFilter, setFilter }) => {
    const filters = [ { name: 'All Candidates', key: 'All', color: 'bg-gray-100' }, { name: 'In-Progress', key: 'In-Progress', color: 'bg-blue-100' }, { name: 'On-Hold', key: 'On-Hold', color: 'bg-yellow-100' }, { name: 'Rejected', key: 'Rejected', color: 'bg-red-100' }, ];
    return ( <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8"> {filters.map(f => ( <button key={f.key} onClick={() => setFilter(f.key)} className={`p-4 rounded-lg shadow-md text-center transition-all duration-200 transform hover:-translate-y-1 ${f.color} ${activeFilter === f.key ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent'}`} > <h3 className="text-2xl font-bold">{counts[f.key] || 0}</h3> <p className="text-sm font-semibold">{f.name}</p> </button> ))} </div> );
}

const App = () => {
    const [allCandidates, setAllCandidates] = useState(initialCandidates);
    const [pipelineFilter, setPipelineFilter] = useState('All');
    const [sort, setSort] = useState('priority');
    const [shortenNamesFlag, setShortenNamesFlag] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState('');

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

        // Load PapaParse script
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            // Cleanup on unmount
            if (document.head.contains(favicon)) {
                document.head.removeChild(favicon);
            }
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleSync = (file) => {
        if (!file) { setNotification('Error: Please select a CSV file to upload.'); setTimeout(() => setNotification(''), 5000); return; }
        if (typeof Papa === 'undefined') { setNotification('Error: CSV parsing library not loaded. Please try again.'); setTimeout(() => setNotification(''), 5000); return; }
        setIsLoading(true);
        setNotification('');
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => { const mappedCandidates = results.data.map(normalizeData).filter(c => c && c.name !== 'N/A' && c.name); setAllCandidates(mappedCandidates); setIsLoading(false); setNotification('Data successfully synced!'); setIsModalOpen(false); setTimeout(() => setNotification(''), 5000); },
            error: (error) => { setIsLoading(false); setNotification(`Error parsing file: ${error.message}`); setTimeout(() => setNotification(''), 8000); }
        });
    };
    
    const filteredCandidates = allCandidates.filter(c => pipelineFilter === 'All' || c.pipelineStatus === pipelineFilter);
    
    const sortedCandidates = [...filteredCandidates].sort((a, b) => {
        if (sort === 'priority') { const priorityA = parseFloat(a.priority); const priorityB = parseFloat(b.priority); if (isNaN(priorityA)) return 1; if (isNaN(priorityB)) return -1; return priorityA - priorityB; }
        if (sort === 'name') { return a.name.localeCompare(b.name); }
        return 0;
    });

    const pipelineCounts = { 'All': allCandidates.length, 'In-Progress': allCandidates.filter(c => c.pipelineStatus === 'In-Progress').length, 'On-Hold': allCandidates.filter(c => c.pipelineStatus === 'On-Hold').length, 'Rejected': allCandidates.filter(c => c.pipelineStatus === 'Rejected').length, }

  return (
    <div className="bg-gray-50 min-h-screen w-full font-sans">
      {allCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen w-full p-4">
            {isLoading && <div className="absolute top-5 text-center p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg"><p className="text-blue-700 font-semibold">Parsing CSV file...</p></div>}
            {notification && <div className={`absolute top-5 text-center p-4 mb-4 rounded-lg ${notification.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}><p className="font-semibold">{notification}</p></div>}
            <div className="text-center bg-white p-8 sm:p-12 rounded-xl shadow-md border w-full max-w-lg">
                <h1 className="text-3xl font-extrabold text-gray-800">Architect Hiring Pipeline</h1>
                <p className="mt-2 text-gray-500">To get started, please upload your CSV file.</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-8 inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold shadow-sm">
                    <UploadIcon />
                    Open Settings & Upload
                </button>
            </div>
            <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSync={handleSync} />
        </div>
      ) : (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div><h1 className="text-4xl font-extrabold text-gray-800">Architect Hiring Pipeline</h1><p className="text-lg text-gray-500 mt-2">Live Report</p></div>
                    <button onClick={() => setIsModalOpen(true)} className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-200"><SettingsIcon /></button>
                </header>

                {isLoading && <div className="text-center p-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg"><p className="text-blue-700 font-semibold">Parsing CSV file...</p></div>}
                {notification && <div className={`text-center p-4 mb-4 rounded-lg ${notification.startsWith('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}><p className="font-semibold">{notification}</p></div>}

                <PipelineFilter counts={pipelineCounts} activeFilter={pipelineFilter} setFilter={setPipelineFilter} />
                <div className="flex justify-end items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                     <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="shorten-names" checked={shortenNamesFlag} onChange={() => setShortenNamesFlag(!shortenNamesFlag)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="shorten-names" className="text-sm font-medium text-gray-700">Shorten Surnames</label>
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
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCandidates.map(candidate => ( <CandidateCard key={candidate.id} candidate={candidate} displayName={shortenNamesFlag ? shortenName(candidate.name) : candidate.name}/> ))}
                </main>
            </div>
            <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSync={handleSync} />
        </div>
      )}
    </div>
  );
};

export default App;


// Utility functions and constants extracted from App.jsx

export const statusColors = {
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

export const getStatusColor = (status) => {
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

export const stageProgress = {
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

export const shortenName = (fullName) => {
  if (!fullName) return '';
  const parts = fullName.split(' ');
  if (parts.length <= 1) return fullName;
  const firstName = parts[0];
  const initials = parts.slice(1).map(part => `${part.charAt(0)}.`).join(' ');
  return `${firstName} ${initials}`;
};

export const normalizeData = (row, index) => {
  const unifiedStatus = (row['Unified status'] || 'Unknown').toLowerCase();
  const isActive = (row['Active'] || '').toLowerCase() !== 'no';

  let pipelineStatus;
  if (unifiedStatus.includes('on hold')) {
    pipelineStatus = 'On-Hold';
  } else if (!isActive || unifiedStatus.includes('rejected') || unifiedStatus.includes('failed') || unifiedStatus.includes('declined')) {
    pipelineStatus = 'Rejected';
  } else {
    pipelineStatus = 'In-Progress';
  }

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

  const priority = (row['Priority according to start date + status'] || 'N/A').replace(/[^0-9]/g, '') || 'N/A';

  return {
    id: row.ID || index,
    name: row['Candidate Name'] || 'N/A',
    status: row['Unified status'] || 'Unknown',
    stage: stage,
    location: row['Actual Location'] || 'N/A',
    type: row['Candidate type - external, bench, deployment'] || 'N/A',
    recruiter: { name: row['Responsible Recruiter or Deployment Partner'] || 'N/A' },
    priority: priority,
    details: row['Short status'] || 'No details provided.',
    pipelineStatus: pipelineStatus,
  };
};

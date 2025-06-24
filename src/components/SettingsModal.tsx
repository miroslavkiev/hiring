import React, { useEffect, useState } from 'react';
import { CloseIcon, UploadIcon } from './Icons';
import toast from 'react-hot-toast';
import api from '../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Sheet {
  id: string;
  name: string;
}

interface Tab {
  gid: string;
  title: string;
}

const SettingsModal: React.FC<Props> = ({ open, onClose }) => {
  const [mode, setMode] = useState<'csv' | 'google'>('csv');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [sheetId, setSheetId] = useState('');
  const [tabGid, setTabGid] = useState('');
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const savedMode = localStorage.getItem('settingsMode');
    const savedSheet = localStorage.getItem('settingsSheetId');
    const savedTab = localStorage.getItem('settingsTabGid');
    if (savedMode === 'csv' || savedMode === 'google') setMode(savedMode);
    if (savedSheet) setSheetId(savedSheet);
    if (savedTab) setTabGid(savedTab);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    localStorage.setItem('settingsMode', mode);
    if (mode === 'google' && sheets.length === 0) {
      fetchSheets();
    }
  }, [mode, open, sheets.length]);

  useEffect(() => {
    if (sheetId) {
      localStorage.setItem('settingsSheetId', sheetId);
      fetchTabs(sheetId);
    }
  }, [sheetId]);

  useEffect(() => {
    if (tabGid) {
      localStorage.setItem('settingsTabGid', tabGid);
    }
  }, [tabGid]);

  const fetchSheets = async () => {
    setLoadingSheets(true);
    try {
      const res = await api.get('/sheets');
      const data: Sheet[] = await res.json();
      data.sort((a, b) => a.name.localeCompare(b.name));
      setSheets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSheets(false);
    }
  };

  const fetchTabs = async (id: string) => {
    setLoadingTabs(true);
    try {
      const res = await api.get(`/sheets/${id}/tabs`);
      const data: Tab[] = await res.json();
      setTabs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTabs(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSync = async () => {
    if (mode === 'google') {
      if (!sheetId || !tabGid) return;
      setSyncing(true);
      try {
        const res = await api.post('/pipeline/sync', { sheetId, tabGid });
        if (res.ok) {
          toast.success('Data synced');
        } else {
          const json = await res.json().catch(() => ({}));
          console.error(json);
          toast.error('Sync failed');
        }
      } catch (err) {
        console.error(err);
        toast.error('Sync failed');
      } finally {
        setSyncing(false);
      }
    } else {
      // CSV mode uses FileReader parsing handled in parent or elsewhere
      if (!selectedFile) return;
      const reader = new FileReader();
      reader.onload = () => {
        toast.success('CSV loaded');
        onClose();
      };
      reader.readAsText(selectedFile);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon />
          </button>
        </div>
        <div className="mb-4 flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="form-radio"
              checked={mode === 'csv'}
              onChange={() => setMode('csv')}
            />
            <span className="text-sm">Upload CSV</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              className="form-radio"
              checked={mode === 'google'}
              onChange={() => setMode('google')}
            />
            <span className="text-sm">Google Sheet</span>
          </label>
        </div>
        {mode === 'csv' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Pipeline CSV</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">{fileName || 'CSV up to 10MB'}</p>
              </div>
            </div>
          </div>
        )}
        {mode === 'google' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spreadsheet</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
              >
                <option value="">Select sheet</option>
                {loadingSheets && <option>Loading...</option>}
                {sheets.map((s) => (
                  <option key={s.id} value={s.id} className="truncate">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tab</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={tabGid}
                onChange={(e) => setTabGid(e.target.value)}
                disabled={!sheetId}
              >
                <option value="">Select tab</option>
                {loadingTabs && <option>Loading...</option>}
                {tabs.map((t) => (
                  <option key={t.gid} value={t.gid} className="truncate">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSync}
            disabled={syncing || (mode === 'google' ? !sheetId || !tabGid : !selectedFile)}
            className={`inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <UploadIcon />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

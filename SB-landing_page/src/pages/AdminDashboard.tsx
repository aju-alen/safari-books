import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Building, 
  User, 
  Clock, 
  CheckCircle, 
  Eye, 
  FileText, 
  Play, 
  Download,
  RefreshCw,
  LogOut,
  Search,
  AlertCircle,
  X,
  Check,
  Music,
  Library
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Publisher {
  id: string;
  name: string;
  isCompany: boolean;
  isVerified: boolean;
  submissionDate: string;
  document1: string;
  document2: string;
  document1Label: string;
  document2Label: string;
  documentNumber1: string;
  documentNumber2: string;
  bookTitle: string;
  email?: string;
  phone?: string;
  address?: string;
  synopsis?: string;
  language?: string;
  category?: string;
  isbn?: string;
  publicationDate?: string;
  narrator?: string;
  narrationStyle?: string[];
  coverImage?: string;
  audioSampleURL?: string;
  completeAudioUrl?: string;
  narrationSegments?: string | null;
  pdfURL?: string;
  rightsHolder?: boolean;
}

interface RawUserMeta {
  createdAt?: string;
}

interface RawCompany {
  id: string;
  companyName?: string;
  name?: string;
  isVerified: boolean;
  createdAt?: string;
  user?: RawUserMeta;
  companyRegNoPdfUrl: string;
  kraPinPdfUrl: string;
  companyRegNo: string;
  kraPin: string;
  title: string;
  email?: string;
  telephone?: string;
  address?: string;
  synopsis?: string;
  language?: string;
  categories?: string;
  ISBNDOIISRC?: string;
  date?: string;
  narrator?: string;
  narrationSampleHeartzRate?: string;
  narrationSpeakingRate?: string;
  narrationGender?: string;
  narrationLanguageCode?: string;
  narrationVoiceName?: string;
  coverImage?: string;
  audioSampleURL?: string;
  completeAudioUrl?: string;
  narrationSegments?: string | null;
  pdfURL?: string;
  rightsHolder?: boolean;
}

interface RawAuthor {
  id: string;
  fullName?: string;
  name?: string;
  isVerified: boolean;
  createdAt?: string;
  user?: RawUserMeta;
  idppPdfUrl: string;
  kraPinPdfUrl: string;
  idppNo: string;
  kraPin: string;
  title: string;
  email?: string;
  telephone?: string;
  address?: string;
  synopsis?: string;
  language?: string;
  categories?: string;
  ISBNDOIISRC?: string;
  date?: string;
  narrator?: string;
  narrationSampleHeartzRate?: string;
  narrationSpeakingRate?: string;
  narrationGender?: string;
  narrationLanguageCode?: string;
  narrationVoiceName?: string;
  coverImage?: string;
  audioSampleURL?: string;
  completeAudioUrl?: string;
  narrationSegments?: string | null;
  pdfURL?: string;
  rightsHolder?: boolean;
}

type AudioTaskType = 'sample' | 'full';
type AudioTaskStatus = 'running' | 'completed' | 'failed';

const ACCENT_PALETTE = ['#0d9488', '#2563eb', '#7c3aed', '#c026d3', '#ea580c', '#ca8a04'];

function stableAccentFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = id.charCodeAt(i) + ((h << 5) - h);
  }
  return ACCENT_PALETTE[Math.abs(h) % ACCENT_PALETTE.length];
}

/** Book timeline segments use `s`/`e` in ms (see admin full-audio pipeline). */
function durationFromNarrationSegmentsJson(
  raw: string | undefined | null
): { hours: number; minutes: number } {
  if (!raw || typeof raw !== 'string') return { hours: 0, minutes: 0 };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return { hours: 0, minutes: 0 };
    let maxEnd = 0;
    let hasTimeline = false;
    for (const seg of parsed) {
      if (!seg || typeof seg !== 'object') continue;
      const e = seg.e;
      const s = seg.s;
      if (Number.isFinite(e) && Number.isFinite(s) && e > s) {
        hasTimeline = true;
        maxEnd = Math.max(maxEnd, Number(e));
      }
    }
    if (!hasTimeline || maxEnd <= 0) return { hours: 0, minutes: 0 };
    let totalMinutes = Math.ceil(maxEnd / 60000);
    if (maxEnd > 0 && totalMinutes === 0) totalMinutes = 1;
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60,
    };
  } catch {
    return { hours: 0, minutes: 0 };
  }
}

function buildVerifyPublisherRequestBody(p: Publisher) {
  const { hours, minutes } = durationFromNarrationSegmentsJson(p.narrationSegments);
  const completeAudio =
    (p.completeAudioUrl || '').trim() || (p.audioSampleURL || '').trim();
  const narratorName = (p.narrator || '').trim() || 'Audiobook';
  return {
    type: p.isCompany ? 'company' : 'author',
    durationHours: hours,
    durationMinutes: minutes,
    completeAudioSample: completeAudio,
    narratorName,
    colorCode: stableAccentFromId(p.id),
    pdfURL: p.pdfURL,
  };
}

interface AudioTask {
  key: string;
  publisherId: string;
  publisherName: string;
  isCompany: boolean;
  type: AudioTaskType;
  status: AudioTaskStatus;
  phase: string;
  message: string;
  progress: number;
  resultUrl?: string;
  error?: string;
  startedAt: number;
  updatedAt: number;
  publisher: Publisher;
}

const MAX_AUDIO_TASKS = 10;

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [publisherData, setPublisherData] = useState<{ companies: RawCompany[]; authors: RawAuthor[] }>({ 
    companies: [], 
    authors: [] 
  });
  const [filterType, setFilterType] = useState<'all' | 'companies' | 'authors'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioTasks, setAudioTasks] = useState<Record<string, AudioTask>>({});
  const [showAudioPanel, setShowAudioPanel] = useState(true);

  console.log(publisherData, 'publisherData');

  // Load publisher data from API
  const loadPublisherData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/pending-verifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dubaiAnalytica-userAccess') ? JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')!).token : ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPublisherData({
          companies: data.company || [],
          authors: data.author || []
        });
      } else {
        console.error('Failed to load publisher data');
      }
    } catch (error) {
      console.error('Error loading publisher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dubaiAnalytica-userAccess');
    navigate('/super-admin-login');
  };

  const getFilteredPublishers = (): Publisher[] => {
    let filteredList: Publisher[] = [];
    
    if (filterType === 'all' || filterType === 'companies') {
      const companies = publisherData.companies.map((company: RawCompany) => 
        { console.log(company, 'company in companies');
          return ({
        id: company.id,
        name: company.companyName || company.name || 'Unknown Publisher',
        isCompany: true,
        isVerified: company.isVerified,
        submissionDate: new Date(company.createdAt || company.user?.createdAt || Date.now()).toISOString().split('T')[0],
        document1: company.companyRegNoPdfUrl,
        document2: company.kraPinPdfUrl,
        document1Label: 'Company Registration',
        document2Label: 'KRA PIN',
        documentNumber1: company.companyRegNo,
        documentNumber2: company.kraPin,
        bookTitle: company.title || '',
        email: company.email,
        phone: company.telephone,
        address: company.address,
        synopsis: company.synopsis,
        language: company.language,
        category: company.categories,
        isbn: company.ISBNDOIISRC,
        publicationDate: company.date,
        narrator: company.narrator,
        narrationStyle: [
          company.narrationSampleHeartzRate,
          company.narrationSpeakingRate,
          company.narrationGender,
          company.narrationLanguageCode,
          company.narrationVoiceName
        ].filter((value): value is string => Boolean(value)),
        coverImage: company.coverImage,
        audioSampleURL: company.audioSampleURL,
        completeAudioUrl: company.completeAudioUrl,
        narrationSegments: company.narrationSegments ?? null,
        pdfURL: company.pdfURL,
        rightsHolder: company.rightsHolder
      })});
      
      if (filterType === 'companies') {
        filteredList = companies;
      } else {
        filteredList = [...companies];
      }
    }
    
    if (filterType === 'all' || filterType === 'authors') {

      const authors = publisherData.authors.map((author: RawAuthor) => { console.log(author, 'author in authors');
        return ({
        id: author.id,
        name: author.fullName || author.name || 'Unknown Publisher',
        isCompany: false,
        isVerified: author.isVerified,
        submissionDate: new Date(author.createdAt || author.user?.createdAt || Date.now()).toISOString().split('T')[0],
        document1: author.idppPdfUrl,
        document2: author.kraPinPdfUrl,
        document1Label: 'ID/PP Document',
        document2Label: 'KRA PIN',
        documentNumber1: author.idppNo,
        documentNumber2: author.kraPin,
        bookTitle: author.title || '',
        email: author.email,
        phone: author.telephone,
        address: author.address,
        synopsis: author.synopsis,
        language: author.language,
        category: author.categories,
        isbn: author.ISBNDOIISRC,
        publicationDate: author.date,
        narrator: author.narrator,
        narrationStyle: [
          author.narrationSampleHeartzRate,
          author.narrationSpeakingRate,
          author.narrationGender,
          author.narrationLanguageCode,
          author.narrationVoiceName
        ].filter((value): value is string => Boolean(value)),
        coverImage: author.coverImage,
        audioSampleURL: author.audioSampleURL,
        completeAudioUrl: author.completeAudioUrl,
        narrationSegments: author.narrationSegments ?? null,
        pdfURL: author.pdfURL,
        rightsHolder: author.rightsHolder
      })});
      
      if (filterType === 'authors') {
        filteredList = authors;
      } else {
        filteredList = [...filteredList, ...authors];
      }
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredList = filteredList.filter(publisher => 
        publisher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publisher.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publisher.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredList;
  };

  const handleVerifyPublisher = async (publisher: Publisher) => {
    const label = publisher.bookTitle || publisher.name;
    if (
      !window.confirm(
        `Approve and publish "${label}"?\n\nDetails (filled automatically):\n• Runtime from narration timeline when available, else 0h 0m\n• Full audio: complete URL if set, otherwise sample URL\n• Narrator and accent color from the listing\n\nThis creates the storefront book and emails the publisher.`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('dubaiAnalytica-userAccess')
        ? JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')!).token
        : '';
      const response = await fetch(
        `http://localhost:3001/api/admin/verify-publisher/${publisher.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildVerifyPublisherRequestBody(publisher)),
        },
      );

      if (response.ok) {
        await loadPublisherData();
        alert(
          'Publisher verified successfully. A confirmation email was sent to the publisher account on file.',
        );
      } else {
        let detail = 'Failed to verify publisher';
        try {
          const errBody = await response.json();
          if (errBody?.message) detail = String(errBody.message);
        } catch {
          /* ignore */
        }
        alert(detail);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying publisher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTaskKey = (publisher: Publisher, type: AudioTaskType) =>
    `${type}:${publisher.isCompany ? 'company' : 'author'}:${publisher.id}`;

  const isTaskRunning = (publisher: Publisher, type: AudioTaskType) => {
    const task = audioTasks[getTaskKey(publisher, type)];
    return task?.status === 'running';
  };

  const upsertAudioTask = (key: string, updater: (existing?: AudioTask) => AudioTask) => {
    setAudioTasks((prev) => {
      const nextTask = updater(prev[key]);
      const merged = { ...prev, [key]: { ...nextTask, updatedAt: Date.now() } };
      const orderedKeys = Object.keys(merged).sort((a, b) => merged[b].updatedAt - merged[a].updatedAt);
      const limited: Record<string, AudioTask> = {};
      orderedKeys.slice(0, MAX_AUDIO_TASKS).forEach((taskKey) => {
        limited[taskKey] = merged[taskKey];
      });
      return limited;
    });
  };

  const getProgressFromPhase = (
    phase: string,
    current?: number,
    total?: number,
    existingProgress = 0
  ) => {
    if (Number.isFinite(current) && Number.isFinite(total) && (total as number) > 0) {
      const ratio = Math.min(1, Math.max(0, (current as number) / (total as number)));
      return Math.round(50 + ratio * 45);
    }

    const phaseProgressMap: Record<string, number> = {
      downloading_document: 5,
      parsing_document: 15,
      generating_segments: 30,
      segments_preview: 30,
      segments_cached: 35,
      tts_batch_start: 50,
      synthesizing_segment: 65,
      synthesizing_audio: 70,
      uploading: 95,
      complete: 100
    };

    const mapped = phaseProgressMap[phase];
    if (!Number.isFinite(mapped)) return existingProgress;
    return Math.max(existingProgress, mapped);
  };

  const parseNdjsonPayload = (line: string) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      console.error('Failed to parse progress line:', line, error);
      return null;
    }
  };

  const startAudioTask = async (publisher: Publisher, type: AudioTaskType) => {
    const taskKey = getTaskKey(publisher, type);
    if (audioTasks[taskKey]?.status === 'running') {
      return;
    }

    const requestBody = {
      narrationSampleHeartzRate: publisher.narrationStyle?.includes('Slow') ? 0.8 : 1.0,
      narrationSpeakingRate: publisher.narrationStyle?.includes('Fast') ? 1.2 : 1.0,
      narrationGender: 'neutral',
      narrationLanguageCode: publisher.language || 'en',
      narrationVoiceName: publisher.narrator || 'default'
    };

    upsertAudioTask(taskKey, (existing) => ({
      key: taskKey,
      publisherId: publisher.id,
      publisherName: publisher.name,
      isCompany: publisher.isCompany,
      type,
      status: 'running',
      phase: 'queued',
      message: type === 'sample' ? 'Preparing sample audio request…' : 'Preparing full audio request…',
      progress: existing?.progress ?? 0,
      startedAt: existing?.startedAt ?? Date.now(),
      updatedAt: Date.now(),
      publisher,
      resultUrl: existing?.resultUrl
    }));

    const endpoint = type === 'sample' ? 'send-sample-audio' : 'generate-full-audio';
    const token = localStorage.getItem('dubaiAnalytica-userAccess')
      ? JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')!).token
      : '';
    const url = `http://localhost:3001/api/admin/${endpoint}/${publisher.id}?isCompany=${publisher.isCompany}&stream=true`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/x-ndjson, application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to generate ${type} audio`);
      }

      if (!response.body) {
        const fallback = await response.json().catch(() => ({}));
        const resultUrl = fallback.audioSampleURL || fallback.completeAudioUrl;
        upsertAudioTask(taskKey, (existing) => ({
          ...(existing as AudioTask),
          status: 'completed',
          phase: 'complete',
          message: type === 'sample' ? 'Sample audio generated.' : 'Full audio generated.',
          progress: 100,
          resultUrl: resultUrl || existing?.resultUrl
        }));
        await loadPublisherData();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = '';
      let streamCompleted = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffered += decoder.decode(value, { stream: true });
        const lines = buffered.split('\n');
        buffered = lines.pop() || '';

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          const payload = parseNdjsonPayload(trimmed);
          if (!payload) return;

          if (payload.type === 'progress') {
            upsertAudioTask(taskKey, (existing) => {
              const progress = getProgressFromPhase(
                payload.phase || '',
                payload.current,
                payload.total,
                existing?.progress ?? 0
              );
              return {
                ...(existing as AudioTask),
                status: 'running',
                phase: payload.phase || existing?.phase || 'progress',
                message: payload.message || existing?.message || 'Processing audio…',
                progress
              };
            });
          } else if (payload.type === 'complete') {
            streamCompleted = true;
            const resultUrl = payload.audioSampleURL || payload.completeAudioUrl;
            upsertAudioTask(taskKey, (existing) => ({
              ...(existing as AudioTask),
              status: 'completed',
              phase: 'complete',
              message: payload.message || 'Audio generation completed.',
              progress: 100,
              resultUrl: resultUrl || existing?.resultUrl
            }));
          } else if (payload.type === 'error') {
            throw new Error(payload.message || `Failed to generate ${type} audio`);
          }
        });
      }

      if (!streamCompleted) {
        upsertAudioTask(taskKey, (existing) => ({
          ...(existing as AudioTask),
          status: 'failed',
          phase: 'failed',
          message: existing?.message || 'Task stopped unexpectedly.',
          error: 'Stream ended before completion.'
        }));
      } else {
        await loadPublisherData();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to generate ${type} audio`;
      console.error(`${type} audio error:`, error);
      upsertAudioTask(taskKey, (existing) => ({
        ...(existing as AudioTask),
        status: 'failed',
        phase: 'failed',
        message: 'Audio generation failed.',
        error: message
      }));
    }
  };

  const retryAudioTask = async (task: AudioTask) => {
    await startAudioTask(task.publisher, task.type);
  };

  const handleGenerateSampleAudio = async (publisher: Publisher) => {
    await startAudioTask(publisher, 'sample');
  };

  const handleGenerateFullAudio = async (publisher: Publisher) => {
    await startAudioTask(publisher, 'full');
  };

  const handleOpenDocument = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('Document URL is not available');
    }
  };

  useEffect(() => {
    loadPublisherData();
  }, []);

  const filteredPublishers = getFilteredPublishers();
  const audioTaskList = Object.values(audioTasks).sort((a, b) => b.updatedAt - a.updatedAt);
  const pendingCount = filteredPublishers.filter(pub => !pub.isVerified).length;
  const verifiedCount = filteredPublishers.filter(pub => pub.isVerified).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-500">Publisher Verification</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <Clock className="h-8 w-8 mr-4" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-blue-100">Pending Verification</p>
              </div>
            </div>
          </div>
          <div className="bg-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 mr-4" />
              <div>
                <p className="text-2xl font-bold">{verifiedCount}</p>
                <p className="text-green-100">Verified Publishers</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <Building className="h-8 w-8 mr-4" />
              <div>
                <p className="text-2xl font-bold">{publisherData.companies.length}</p>
                <p className="text-purple-100">Companies</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <User className="h-8 w-8 mr-4" />
              <div>
                <p className="text-2xl font-bold">{publisherData.authors.length}</p>
                <p className="text-orange-100">Authors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Publishers Pending Verification</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search publishers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('companies')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'companies'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Companies
                </button>
                <button
                  onClick={() => setFilterType('authors')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'authors'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Authors
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Publishers List */}
        <div className="space-y-4">
          {filteredPublishers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No publishers found matching the selected filter</p>
            </div>
          ) : (
            filteredPublishers.map((publisher) => (
              <div key={publisher.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${publisher.isCompany ? 'bg-purple-100' : 'bg-orange-100'}`}>
                      {publisher.isCompany ? (
                        <Building className="h-6 w-6 text-purple-600" />
                      ) : (
                        <User className="h-6 w-6 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{publisher.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {publisher.isCompany ? 'Publishing Company' : 'Independent Author'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Submitted: {publisher.submissionDate}</span>
                        <span>Book: {publisher.bookTitle}</span>
                        {publisher.email && <span>Email: {publisher.email}</span>}
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          publisher.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {publisher.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setSelectedPublisher(publisher); setShowDetails(true) }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                    {!publisher.isVerified && (
                      <button
                        onClick={() => handleVerifyPublisher(publisher)}
                        disabled={isSubmitting}
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Verify
                      </button>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleOpenDocument(publisher.document1)}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-gray-500 mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{publisher.document1Label}</p>
                        <p className="text-xs text-gray-500">{publisher.documentNumber1}</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleOpenDocument(publisher.document2)}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-gray-500 mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{publisher.document2Label}</p>
                        <p className="text-xs text-gray-500">{publisher.documentNumber2}</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Action Buttons for Pending Publishers */}
                {!publisher.isVerified && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleGenerateSampleAudio(publisher)}
                        disabled={isTaskRunning(publisher, 'sample')}
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Music className="h-4 w-4 mr-1" />
                        {isTaskRunning(publisher, 'sample') ? 'Generating Sample…' : 'Sample Audio'}
                      </button>
                      <button
                        onClick={() => handleGenerateFullAudio(publisher)}
                        disabled={isTaskRunning(publisher, 'full')}
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Library className="h-4 w-4 mr-1" />
                        {isTaskRunning(publisher, 'full') ? 'Generating Full Audio…' : 'Generate Full Audio'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showAudioPanel && (
        <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-900">Audio Uploads</p>
              <p className="text-xs text-gray-500">Progress runs in background while you continue working</p>
            </div>
            <button
              onClick={() => setShowAudioPanel(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-3 space-y-3">
            {audioTaskList.length === 0 && (
              <p className="text-sm text-gray-500">No active audio tasks yet.</p>
            )}

            {audioTaskList.map((task) => (
              <div key={task.key} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate pr-2">
                    {task.publisherName} · {task.type === 'sample' ? 'Sample' : 'Full'}
                  </p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-1">{task.message}</p>

                <div className="mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        task.status === 'failed' ? 'bg-red-500' : task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(5, task.progress)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(task.progress)}%</p>
                </div>

                {task.status === 'completed' && task.resultUrl && (
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={task.resultUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Open
                    </a>
                    <a
                      href={task.resultUrl}
                      download
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-gray-700 rounded hover:bg-gray-800"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </div>
                )}

                {task.status === 'failed' && (
                  <div className="mt-2">
                    {task.error && <p className="text-xs text-red-600 mb-2">{task.error}</p>}
                    <button
                      onClick={() => retryAudioTask(task)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!showAudioPanel && (
        <button
          onClick={() => setShowAudioPanel(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700"
        >
          <Music className="h-4 w-4 mr-2" />
          Audio Uploads ({audioTaskList.filter((task) => task.status === 'running').length})
        </button>
      )}

      {/* Publisher Details Modal */}
      {showDetails && selectedPublisher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedPublisher.isCompany ? 'Company Details' : 'Author Details'}
                </h2>
                <button
                  onClick={() => { setShowDetails(false); setSelectedPublisher(null) }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedPublisher.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-gray-900">
                      {selectedPublisher.isCompany ? 'Publishing Company' : 'Independent Author'}
                    </p>
                  </div>
                  {selectedPublisher.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedPublisher.email}</p>
                    </div>
                  )}
                  {selectedPublisher.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedPublisher.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Book Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Title</label>
                    <p className="text-gray-900">{selectedPublisher.bookTitle}</p>
                  </div>
                  {selectedPublisher.language && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Language</label>
                      <p className="text-gray-900">{selectedPublisher.language}</p>
                    </div>
                  )}
                  {selectedPublisher.category && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-gray-900">{selectedPublisher.category}</p>
                    </div>
                  )}
                  {selectedPublisher.isbn && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ISBN/DOI/ISRC</label>
                      <p className="text-gray-900">{selectedPublisher.isbn}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Synopsis */}
              {selectedPublisher.synopsis && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Synopsis</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedPublisher.synopsis}</p>
                </div>
              )}

              {/* Narration Information */}
              {selectedPublisher.narrator && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Narration Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Narrator</label>
                      <p className="text-gray-900">{selectedPublisher.narrator}</p>
                    </div>
                    {selectedPublisher.narrationStyle && selectedPublisher.narrationStyle.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Narration Style</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedPublisher.narrationStyle.map((style, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sample Files */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sample Files</h3>
                <div className="space-y-3">
                  {selectedPublisher.audioSampleURL && (
                    <button
                      onClick={() => handleOpenDocument(selectedPublisher.audioSampleURL!)}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full"
                    >
                      <Play className="h-5 w-5 text-gray-500 mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Audio Sample</p>
                        <p className="text-xs text-gray-500">Click to listen</p>
                      </div>
                    </button>
                  )}
                  {selectedPublisher.pdfURL && (
                    <button
                      onClick={() => handleOpenDocument(selectedPublisher.pdfURL!)}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full"
                    >
                      <FileText className="h-5 w-5 text-gray-500 mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">PDF Sample</p>
                        <p className="text-xs text-gray-500">Click to view</p>
                      </div>
                    </button>
                  )}
                  {selectedPublisher.coverImage && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">Cover Image</p>
                      <img
                        src={selectedPublisher.coverImage}
                        alt="Cover"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

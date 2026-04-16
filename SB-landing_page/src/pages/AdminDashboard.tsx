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
  Filter,
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
  pdfURL?: string;
  rightsHolder?: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publisherData, setPublisherData] = useState<{ companies: Publisher[]; authors: Publisher[] }>({ 
    companies: [], 
    authors: [] 
  });
  const [filterType, setFilterType] = useState<'all' | 'companies' | 'authors'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    durationHours: '',
    durationMinutes: '',
    completeAudioSample: '',
    narratorName: '',
    colorCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPublisherData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('dubaiAnalytica-userAccess');
    navigate('/super-admin-login');
  };

  const getFilteredPublishers = (): Publisher[] => {
    let filteredList: Publisher[] = [];
    
    if (filterType === 'all' || filterType === 'companies') {
      const companies = publisherData.companies.map((company: any) => 
        { console.log(company, 'company in companies');
          return ({
        id: company.id,
        name: company.companyName || company.name,
        isCompany: true,
        isVerified: company.isVerified,
        submissionDate: new Date(company.createdAt || company.user?.createdAt || Date.now()).toISOString().split('T')[0],
        document1: company.companyRegNoPdfUrl,
        document2: company.kraPinPdfUrl,
        document1Label: 'Company Registration',
        document2Label: 'KRA PIN',
        documentNumber1: company.companyRegNo,
        documentNumber2: company.kraPin,
        bookTitle: company.title,
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
        ].filter(Boolean),
        coverImage: company.coverImage,
        audioSampleURL: company.audioSampleURL,
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

      const authors = publisherData.authors.map((author: any) => { console.log(author, 'author in authors');
        return ({
        id: author.id,
        name: author.fullName || author.name,
        isCompany: false,
        isVerified: author.isVerified,
        submissionDate: new Date(author.createdAt || author.user?.createdAt || Date.now()).toISOString().split('T')[0],
        document1: author.idppPdfUrl,
        document2: author.kraPinPdfUrl,
        document1Label: 'ID/PP Document',
        document2Label: 'KRA PIN',
        documentNumber1: author.idppNo,
        documentNumber2: author.kraPin,
        bookTitle: author.title,
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
        ].filter(Boolean),
        coverImage: author.coverImage,
        audioSampleURL: author.audioSampleURL,
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
    setSelectedPublisher(publisher);
    setShowVerificationModal(true);
  };

  const handleSubmitVerification = async () => {
    if (!selectedPublisher) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/admin/verify-publisher/${selectedPublisher.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dubaiAnalytica-userAccess') ? JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')!).token : ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: selectedPublisher.isCompany ? 'company' : 'author',
          durationHours: parseInt(verificationData.durationHours) || 0,
          durationMinutes: parseInt(verificationData.durationMinutes) || 0,
          completeAudioSample: selectedPublisher.audioSampleURL,
          narratorName: verificationData.narratorName,
          colorCode: verificationData.colorCode,
          pdfURL: selectedPublisher.pdfURL,
        })
      });

      if (response.ok) {
        setShowVerificationModal(false);
        setVerificationData({
          durationHours: '',
          durationMinutes: '',
          completeAudioSample: '',
          narratorName: '',
          colorCode: ''
        });
        await loadPublisherData();
        alert('Publisher verified successfully!');
      } else {
        alert('Failed to verify publisher');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying publisher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSampleAudio = async (publisher: Publisher) => {
    try {
      console.log(publisher, 'publisher in sample audio');
      const response = await fetch(`http://localhost:3001/api/admin/send-sample-audio/${publisher.id}?isCompany=${publisher.isCompany}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dubaiAnalytica-userAccess') ? JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')!).token : ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          narrationSampleHeartzRate: publisher.narrationStyle?.includes('Slow') ? 0.8 : 1.0,
          narrationSpeakingRate: publisher.narrationStyle?.includes('Fast') ? 1.2 : 1.0,
          narrationGender: 'neutral',
          narrationLanguageCode: publisher.language || 'en',
          narrationVoiceName: publisher.narrator || 'default'
        })
      });

      if (response.ok) {
        alert('Sample audio generated successfully!');
      } else {
        alert('Failed to generate sample audio');
      }
    } catch (error) {
      console.error('Sample audio error:', error);
      alert('Error generating sample audio');
    }
  };

  const handleGenerateFullAudio = async (publisher: Publisher) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/generate-full-audio/${publisher.id}?isCompany=${publisher.isCompany}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dubaiAnalytica-userAccess') ? JSON.parse(localStorage.getItem('dubaiAnalytica-userAccess')!).token : ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          narrationSampleHeartzRate: publisher.narrationStyle?.includes('Slow') ? 0.8 : 1.0,
          narrationSpeakingRate: publisher.narrationStyle?.includes('Fast') ? 1.2 : 1.0,
          narrationGender: 'neutral',
          narrationLanguageCode: publisher.language || 'en',
          narrationVoiceName: publisher.narrator || 'default'
        })
      });

      if (response.ok) {
        alert('Full audio generated successfully!');
      } else {
        alert('Failed to generate full audio');
      }
    } catch (error) {
      console.error('Full audio error:', error);
      alert('Error generating full audio');
    }
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
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Check className="h-4 w-4 mr-1" />
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
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Music className="h-4 w-4 mr-1" />
                        Sample Audio
                      </button>
                      <button
                        onClick={() => handleGenerateFullAudio(publisher)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Library className="h-4 w-4 mr-1" />
                        Generate Full Audio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

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

      {/* Verification Modal */}
      {showVerificationModal && selectedPublisher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Verify Publisher</h2>
              <p className="text-sm text-gray-500 mt-1">
                Please provide the following information to complete the verification process
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={verificationData.durationHours}
                    onChange={(e) => setVerificationData({...verificationData, durationHours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={verificationData.durationMinutes}
                    onChange={(e) => setVerificationData({...verificationData, durationMinutes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    max="59"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Narrator Name</label>
                <input
                  type="text"
                  value={verificationData.narratorName}
                  onChange={(e) => setVerificationData({...verificationData, narratorName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter narrator name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                <input
                  type="text"
                  value={verificationData.colorCode}
                  onChange={(e) => setVerificationData({...verificationData, colorCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter color code"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitVerification}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Verify Publisher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

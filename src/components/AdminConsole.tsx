import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider } from 'firebase/auth';
import { 
  auth, 
  provider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  db,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  type User
} from '../lib/firebase';
import { 
  createGoogleSheet, 
  appendRowToGoogleSheet, 
  sendGmailNotification, 
  type SubmissionData 
} from '../lib/googleApi';
import { 
  X, 
  Settings, 
  FileSpreadsheet, 
  Mail, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  LogOut, 
  Lock,
  Database,
  Smartphone,
  Eye,
  CheckCircle,
  Clock,
  Image,
  Upload,
  Trash2
} from 'lucide-react';

interface AdminConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminConsole({ isOpen, onClose }: AdminConsoleProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('admin_spreadsheet_id') || '';
  });
  const [sheetName, setSheetName] = useState<string>(() => {
    return localStorage.getItem('admin_sheet_name') || '예약접수목록';
  });
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'config'>('list');

  // Custom Banner states
  const [showCustomBanner, setShowCustomBanner] = useState<boolean>(() => {
    return localStorage.getItem('show_custom_banner') === 'true';
  });
  const [customBannerImage, setCustomBannerImage] = useState<string>(() => {
    return localStorage.getItem('custom_banner_image') || '';
  });

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('이미지 파일 크기가 너무 큽니다. 2.5MB 이하의 이미지를 사용해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        localStorage.setItem('custom_banner_image', base64String);
        setCustomBannerImage(base64String);
        localStorage.setItem('show_custom_banner', 'true');
        setShowCustomBanner(true);
        window.dispatchEvent(new Event('bannerChanged'));
        setStatusMessage({ text: '배너 이미지가 성공적으로 업로드 및 적용되었습니다!', isError: false });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleBanner = () => {
    const newValue = !showCustomBanner;
    localStorage.setItem('show_custom_banner', String(newValue));
    setShowCustomBanner(newValue);
    window.dispatchEvent(new Event('bannerChanged'));
    setStatusMessage({ text: newValue ? '업로드된 이미지 배너가 활성화되었습니다.' : '기본 인터랙티브 배너로 변경되었습니다.', isError: false });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleClearBanner = () => {
    if (confirm('업로드된 배너 이미지를 삭제하시겠습니까?')) {
      localStorage.removeItem('custom_banner_image');
      localStorage.setItem('show_custom_banner', 'false');
      setCustomBannerImage('');
      setShowCustomBanner(false);
      window.dispatchEvent(new Event('bannerChanged'));
      setStatusMessage({ text: '업로드된 배너가 삭제되었습니다.', isError: false });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // If logged in, look for cached token in session/memory or trigger sign in to refresh
        const cachedToken = sessionStorage.getItem('g_access_token');
        if (cachedToken) {
          setToken(cachedToken);
        }
      } else {
        setToken(null);
        sessionStorage.removeItem('g_access_token');
      }
    });
    return unsubscribe;
  }, []);

  // Fetch submissions from Firestore and LocalStorage
  const fetchAllSubmissions = async () => {
    setIsLoading(true);
    let firestoreList: SubmissionData[] = [];
    
    // 1. Try to fetch from Firestore
    try {
      const q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      snapshot.forEach((d) => {
        const data = d.data();
        firestoreList.push({
          id: d.id,
          name: data.name,
          phone: data.phone,
          service: data.service,
          urgency: data.urgency,
          notes: data.notes,
          timestamp: data.timestamp,
          syncedToSheets: data.syncedToSheets || false,
          emailSent: data.emailSent || false
        });
      });
    } catch (err) {
      console.warn('Firestore fetch failed (likely no db setup), using LocalStorage fallback.', err);
    }

    // 2. Read from LocalStorage
    const localRaw = localStorage.getItem('local_submissions');
    const localList: SubmissionData[] = localRaw ? JSON.parse(localRaw) : [];

    // 3. Merge submissions based on name, phone, and timestamp to avoid duplicates
    const mergedMap = new Map<string, SubmissionData>();
    
    // Add local ones first
    localList.forEach((sub) => {
      const key = `${sub.name}_${sub.phone}_${sub.timestamp}`;
      mergedMap.set(key, sub);
    });

    // Add Firestore ones (Firestore is source of truth, so overwrite or combine)
    firestoreList.forEach((sub) => {
      const key = `${sub.name}_${sub.phone}_${sub.timestamp}`;
      mergedMap.set(key, sub);
    });

    // Convert back to sorted list (newest first)
    const sortedList = Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setSubmissions(sortedList);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllSubmissions();
    }
  }, [isOpen]);

  // Google Login and Scope Request
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = (result as any)._tokenResponse?.oauthAccessToken || 
                         (result as any).credential?.accessToken;
      
      const oauthToken = credential || GoogleAuthProvider.credentialFromResult(result)?.accessToken;

      if (!oauthToken) {
        throw new Error('Google Access Token을 가져오지 못했습니다. 다시 시도해 주세요.');
      }

      setToken(oauthToken);
      sessionStorage.setItem('g_access_token', oauthToken);
      
      // Auto-save admin email to localStorage for convenience
      if (result.user.email) {
        localStorage.setItem('admin_email', result.user.email);
      }

      showStatus('구글 계정이 성공적으로 연동되었습니다!', false);
      fetchAllSubmissions();
    } catch (err: any) {
      console.error(err);
      showStatus(`로그인 실패: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setToken(null);
      sessionStorage.removeItem('g_access_token');
      showStatus('로그아웃 되었습니다.', false);
    } catch (err: any) {
      showStatus(`로그아웃 실패: ${err.message}`, true);
    }
  };

  // Status helper
  const showStatus = (text: string, isError: boolean) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Google Sheets Creation
  const handleCreateSheet = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await createGoogleSheet(token);
      setSpreadsheetId(result.spreadsheetId);
      setSheetName(result.sheetName);
      localStorage.setItem('admin_spreadsheet_id', result.spreadsheetId);
      localStorage.setItem('admin_sheet_name', result.sheetName);
      showStatus(`새 구글 시트가 정상적으로 생성되었습니다!`, false);
    } catch (err: any) {
      console.error(err);
      showStatus(`구글 시트 생성 실패: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual Row Sync
  const handleSyncToSheet = async (sub: SubmissionData) => {
    if (!token) {
      showStatus('구글 로그인이 먼저 필요합니다.', true);
      return;
    }
    if (!spreadsheetId) {
      showStatus('설정 탭에서 연동할 구글 시트 ID를 입력하거나 새로 생성해 주세요.', true);
      return;
    }

    try {
      await appendRowToGoogleSheet(token, spreadsheetId, sheetName, [
        sub.timestamp,
        sub.name,
        sub.phone,
        sub.service,
        sub.urgency,
        sub.notes || '없음'
      ]);

      // Update state & persistence
      await markAsSynced(sub, 'syncedToSheets');
      showStatus(`${sub.name}님의 예약 내역이 구글 시트에 기록되었습니다.`, false);
    } catch (err: any) {
      console.error(err);
      showStatus(`구글 시트 동기화 실패: ${err.message}`, true);
    }
  };

  // Manual Email Send
  const handleSendEmail = async (sub: SubmissionData) => {
    if (!token) {
      showStatus('구글 로그인이 먼저 필요합니다.', true);
      return;
    }

    try {
      await sendGmailNotification(token, 'nakeunjong@gmail.com', sub);
      await markAsSynced(sub, 'emailSent');
      showStatus(`${sub.name}님의 예약 알림 메일이 nakeunjong@gmail.com으로 발송되었습니다.`, false);
    } catch (err: any) {
      console.error(err);
      showStatus(`메일 발송 실패: ${err.message}`, true);
    }
  };

  // Mark submission state
  const markAsSynced = async (sub: SubmissionData, field: 'syncedToSheets' | 'emailSent') => {
    // 1. Update in Firestore if id exists
    if (sub.id) {
      try {
        const docRef = doc(db, 'submissions', sub.id);
        await updateDoc(docRef, { [field]: true });
      } catch (err) {
        console.warn('Firestore state update failed:', err);
      }
    }

    // 2. Update in LocalStorage
    const localRaw = localStorage.getItem('local_submissions');
    if (localRaw) {
      const localList: SubmissionData[] = JSON.parse(localRaw);
      const updatedList = localList.map((item) => {
        if (item.timestamp === sub.timestamp && item.name === sub.name && item.phone === sub.phone) {
          return { ...item, [field]: true };
        }
        return item;
      });
      localStorage.setItem('local_submissions', JSON.stringify(updatedList));
    }

    // 3. Update component state
    setSubmissions((prev) =>
      prev.map((item) => {
        if (item.timestamp === sub.timestamp && item.name === sub.name && item.phone === sub.phone) {
          return { ...item, [field]: true };
        }
        return item;
      })
    );
  };

  // Sync All Unsynced Submissions
  const handleSyncAll = async () => {
    if (!token) {
      showStatus('구글 로그인이 먼저 필요합니다.', true);
      return;
    }
    if (!spreadsheetId) {
      showStatus('구글 시트를 먼저 연동해 주세요.', true);
      return;
    }

    const unsyncedSheets = submissions.filter((s) => !s.syncedToSheets);
    const unsyncedEmails = submissions.filter((s) => !s.emailSent);

    if (unsyncedSheets.length === 0 && unsyncedEmails.length === 0) {
      showStatus('새로 동기화할 내역이 없습니다.', false);
      return;
    }

    setIsLoading(true);
    let sheetSuccessCount = 0;
    let emailSuccessCount = 0;

    // Run sheet sync
    for (const sub of unsyncedSheets) {
      try {
        await appendRowToGoogleSheet(token, spreadsheetId, sheetName, [
          sub.timestamp,
          sub.name,
          sub.phone,
          sub.service,
          sub.urgency,
          sub.notes || '없음'
        ]);
        await markAsSynced(sub, 'syncedToSheets');
        sheetSuccessCount++;
      } catch (err) {
        console.error('Batch sheet sync error:', err);
      }
    }

    // Run email sync
    for (const sub of unsyncedEmails) {
      try {
        await sendGmailNotification(token, 'nakeunjong@gmail.com', sub);
        await markAsSynced(sub, 'emailSent');
        emailSuccessCount++;
      } catch (err) {
        console.error('Batch email send error:', err);
      }
    }

    showStatus(
      `동기화 완료: 구글시트 ${sheetSuccessCount}건 업로드, 이메일 ${emailSuccessCount}건 발송 완료!`,
      false
    );
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1b4332] to-[#2e7d32] px-6 py-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Settings className="w-5 h-5 text-[#a5d6a7]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight flex items-center gap-2">
                베스트누수설비 실시간 상담/예약 관리 시스템
              </h3>
              <p className="text-xs text-[#a5d6a7] font-medium mt-0.5">
                Google Sheets 연동 & nakeunjong@gmail.com 이메일 알림 제어기
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div className={`px-6 py-3 flex items-center gap-2 text-sm font-bold tracking-tight shrink-0 transition-all ${
            statusMessage.isError ? 'bg-red-50 text-red-700 border-b border-red-100' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
          }`}>
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8faf9] flex flex-col lg:flex-row gap-6">
          
          {/* Left panel: Auth & Spreadsheet Setup */}
          <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0">
            
            {/* Account Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <h4 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#2e7d32]" />
                구글 관리자 계정 연동
              </h4>
              
              {!user ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    예약 접수 데이터를 <strong>구글 시트</strong>에 저장하고, <strong>nakeunjong@gmail.com</strong>으로 즉시 메일을 발송하려면 구글 권한 인증이 필수입니다.
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 active:scale-98 text-gray-700 py-3.5 px-4 rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google 계정으로 연동하기</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[#f1f8f3] p-3 rounded-xl border border-[#a5d6a7]/40 flex items-center gap-3">
                    <img 
                      src={user.photoURL || undefined} 
                      alt="profile" 
                      className="w-10 h-10 rounded-full border border-[#a5d6a7]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="overflow-hidden">
                      <div className="font-extrabold text-xs text-[#1b4332] truncate">{user.displayName || '관리자'}</div>
                      <div className="text-[10px] text-gray-500 font-mono truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-1 text-xs text-red-600 font-bold hover:underline"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      계정 연동 해제
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sheets Link Config */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <h4 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#2e7d32]" />
                구글 스프레드시트 설정
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-600 block">연동된 구글시트 ID</label>
                  <input
                    type="text"
                    placeholder="스프레드시트 ID 또는 새로 생성하세요"
                    value={spreadsheetId}
                    onChange={(e) => {
                      setSpreadsheetId(e.target.value);
                      localStorage.setItem('admin_spreadsheet_id', e.target.value);
                    }}
                    className="w-full bg-[#fcfcfc] border border-gray-200 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/10 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-gray-600 block">시트 이름</label>
                  <input
                    type="text"
                    placeholder="예약접수목록"
                    value={sheetName}
                    onChange={(e) => {
                      setSheetName(e.target.value);
                      localStorage.setItem('admin_sheet_name', e.target.value);
                    }}
                    className="w-full bg-[#fcfcfc] border border-gray-200 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/10 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>

                {user && (
                  <button
                    onClick={handleCreateSheet}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-1 bg-[#e8f5e9] text-[#1b5e20] hover:bg-[#c8e6c9] border border-[#a5d6a7]/40 py-2 rounded-lg text-xs font-black transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    새 접수 전용 구글시트 자동생성
                  </button>
                )}

                <div className="text-[10px] text-gray-400 font-medium leading-relaxed bg-[#fafafa] p-2.5 rounded-lg border border-gray-100">
                  💡 직접 스프레드시트의 주소 창 중 <span className="font-mono text-gray-600">/d/<b>[이부분]</b>/edit</span>에 있는 긴 문자열을 복사해서 붙여넣어도 정상 작동합니다.
                </div>
              </div>
            </div>

            {/* Banner Image Configuration Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <h4 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#2e7d32]" />
                실제 배너 이미지 설정
              </h4>

              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  카카오톡이나 문자 등으로 전달받으신 원본 배너 이미지를 이곳에 직접 업로드하여 홈페이지 최상단 메인 이미지로 간편하게 교체할 수 있습니다.
                </p>

                {/* Upload Area */}
                {!customBannerImage ? (
                  <label className="border-2 border-dashed border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                    <Upload className="w-6 h-6 text-emerald-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                    <span className="text-xs font-black text-emerald-800">배너 이미지 업로드</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (최대 2.5MB)</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBannerUpload} 
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-gray-100 h-20 bg-gray-50">
                      <img 
                        src={customBannerImage} 
                        alt="Uploaded Banner Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={handleClearBanner}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-colors cursor-pointer"
                        title="배너 이미지 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Toggle Switch to show/hide custom banner */}
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/30">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-emerald-950">실제 이미지 배너 적용</span>
                        <span className="text-[9px] text-gray-500">활성화 시 업로드한 이미지가 메인 배너로 보입니다.</span>
                      </div>
                      <button
                        onClick={handleToggleBanner}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                          showCustomBanner ? 'bg-[#2e7d32]' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            showCustomBanner ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Alternative Change button */}
                    <label className="w-full flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-black transition-all cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      다른 이미지로 변경
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleBannerUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <h4 className="text-sm font-black text-gray-800 mb-2.5 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#2e7d32]" />
                종합 데이터 상태
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div className="text-[10px] font-black text-gray-500">총 접수 건수</div>
                  <div className="text-lg font-black text-gray-800 mt-0.5">{submissions.length}건</div>
                </div>
                <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/40">
                  <div className="text-[10px] font-black text-amber-700">미동기화 건수</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">
                    {submissions.filter((s) => !s.syncedToSheets || !s.emailSent).length}건
                  </div>
                </div>
              </div>

              {user && submissions.length > 0 && (
                <button
                  onClick={handleSyncAll}
                  disabled={isLoading}
                  className="w-full mt-3 flex items-center justify-center gap-1.5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-98 text-white py-2.5 rounded-xl text-xs font-black shadow-md shadow-[#2e7d32]/10 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  미처리 내역 전체 동기화 실행
                </button>
              )}
            </div>

          </div>

          {/* Right panel: Submissions Table List */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col min-h-[350px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4 mb-4 shrink-0">
              <div>
                <h4 className="text-base font-black text-gray-800 flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-[#2e7d32]" />
                  실시간 예약 신청 목록 ({submissions.length}건)
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  사이트 방문자가 10초 상담을 신청하면 이곳과 서버 데이터베이스에 즉시 업데이트됩니다.
                </p>
              </div>
              
              <button
                onClick={fetchAllSubmissions}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-[#2e7d32] hover:bg-[#f1f8f3] font-bold border border-[#a5d6a7]/40 px-3 py-1.5 rounded-lg transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                목록 새로고침
              </button>
            </div>

            {/* Submissions List Container */}
            <div className="flex-1 overflow-x-auto">
              {submissions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                  <Database className="w-12 h-12 text-gray-200 mb-2" />
                  <p className="text-sm font-bold">아직 등록된 예약 상담 내역이 없습니다.</p>
                  <p className="text-xs mt-1">사이트 홈에서 10초 초고속 상담 예약을 테스트로 등록해 보세요!</p>
                </div>
              ) : (
                <div className="space-y-4 min-w-[600px] pr-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8faf9] text-[11px] font-black text-[#1b4332] uppercase tracking-wider border-b border-gray-100">
                        <th className="py-3 px-4 rounded-l-lg">신청시간</th>
                        <th className="py-3 px-3">고객 인적사항</th>
                        <th className="py-3 px-3">신청 서비스</th>
                        <th className="py-3 px-3">긴급 여부 / 요청사항</th>
                        <th className="py-3 px-4 text-center rounded-r-lg">수동 동기화 제어</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {submissions.map((sub, index) => (
                        <tr key={sub.id || index} className="hover:bg-[#fdfdfd]/50 transition-all">
                          <td className="py-4 px-4 text-[11px] text-gray-400 font-mono font-medium">
                            {sub.timestamp}
                          </td>
                          <td className="py-4 px-3">
                            <div className="font-extrabold text-sm text-gray-800">{sub.name}</div>
                            <div className="text-xs text-gray-500 font-mono font-semibold mt-0.5">{sub.phone}</div>
                          </td>
                          <td className="py-4 px-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]/20">
                              {sub.service}
                            </span>
                          </td>
                          <td className="py-4 px-3 max-w-[240px]">
                            <div className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                              <span>{sub.urgency}</span>
                            </div>
                            <div className="text-xs text-gray-600 font-medium truncate mt-1" title={sub.notes}>
                              {sub.notes || <span className="text-gray-300 italic">요청사항 없음</span>}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Google Sheet Sync Control */}
                              <button
                                onClick={() => handleSyncToSheet(sub)}
                                disabled={!user || sub.syncedToSheets}
                                className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-lg border transition-all ${
                                  sub.syncedToSheets
                                    ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]/30'
                                    : user
                                    ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer'
                                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                }`}
                                title={sub.syncedToSheets ? '동기화 완료' : '구글시트로 동기화'}
                              >
                                {sub.syncedToSheets ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#2e7d32]" />
                                    <span>시트완료</span>
                                  </>
                                ) : (
                                  <>
                                    <FileSpreadsheet className="w-3 h-3" />
                                    <span>시트전송</span>
                                  </>
                                )}
                              </button>

                              {/* Email Send Control */}
                              <button
                                onClick={() => handleSendEmail(sub)}
                                disabled={!user || sub.emailSent}
                                className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-lg border transition-all ${
                                  sub.emailSent
                                    ? 'bg-[#e3f2fd] text-[#1565c0] border-[#90caf9]/30'
                                    : user
                                    ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer'
                                    : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                }`}
                                title={sub.emailSent ? '메일 전송 완료' : 'nakeunjong@gmail.com으로 전송'}
                              >
                                {sub.emailSent ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#1565c0]" />
                                    <span>메일완료</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail className="w-3 h-3" />
                                    <span>메일전송</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!user && (
              <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center text-xs text-gray-500 font-medium">
                🔒 개별 구글시트 전송 및 이메일 전송 기능을 잠금 해제하려면 좌측에서 <strong>Google 계정으로 연동하기</strong>를 완료해 주세요.
              </div>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 font-semibold gap-2 shrink-0">
          <span>* 모든 접수 데이터는 브라우저 LocalStorage에 실시간 보안 백업됩니다.</span>
          <span>베스트누수설비 관리자 통합 대시보드 v1.2</span>
        </div>

      </div>
    </div>
  );
}

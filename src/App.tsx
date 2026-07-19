/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplet,
  Wrench,
  Sparkles,
  Flame,
  ShieldCheck,
  Compass,
  Phone,
  CheckCircle2,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  Camera,
  Tv,
  Search,
  AlertTriangle,
  Send,
  Clock,
  Coins,
  FileText,
  Check,
  ArrowRight,
  PhoneCall,
  Award,
  Info,
  Calendar,
  ThumbsUp,
  HelpCircle,
  Settings
} from 'lucide-react';
import {
  SERVICES,
  TRUST_FACTORS,
  VIRTUAL_DIAGNOSIS,
  REVIEWS,
  FAQS,
  ServiceItem,
  DiagnosisCase
} from './data';
import { db, collection, addDoc, doc, updateDoc } from './lib/firebase';
import { appendRowToGoogleSheet, sendGmailNotification, type SubmissionData } from './lib/googleApi';
import AdminConsole from './components/AdminConsole';

interface ConstructionWorkItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  imageUrl: string;
  localName: string;
  target: string;
  equipment: string;
  process: string[];
  tips: string;
}

// Fallback image component that checks for local assets (jpg, png, jpeg, webp) before falling back to beautiful Unsplash URLs
function FallbackImage({
  localName,
  fallbackUrl,
  alt,
  className,
  referrerPolicy
}: {
  localName: string;
  fallbackUrl: string;
  alt: string;
  className?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}) {
  const extensions = ['jpg', 'png', 'jpeg', 'webp'];
  const [extIndex, setExtIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  const currentSrc = useFallback
    ? fallbackUrl
    : `/assets/${localName}.${extensions[extIndex]}`;

  const handleError = () => {
    if (useFallback) return;
    if (extIndex < extensions.length - 1) {
      setExtIndex(extIndex + 1);
    } else {
      setUseFallback(true);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy={referrerPolicy}
    />
  );
}

const CONSTRUCTION_WORKS: ConstructionWorkItem[] = [
  {
    id: 'work-leak',
    title: '누수탐지 & 누수공사',
    badge: '정밀 탐지 전문',
    description: '눈에 보이지 않는 미세한 배관 실금까지 청음식 및 가스식 첨단 추적 탐지기로 오차 없이 정확하게 포착하여 복구합니다. 불필요하게 바닥 전체를 철거하지 않고 문제 지점만 콕 집어 부분 시공하므로 공사 소음과 시간, 비용을 획기적으로 줄여드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    localName: 'leak',
    target: '바닥 배관 물샘, 천장 젖음, 미세 수도 누수 및 수도요금 급증 현장',
    equipment: '디지털 고성능 청음 탐지기, 수소 가스 탐지기, 고정밀 열화상 카메라',
    process: [
      '수소/질소 배관 가스 압력 검사로 미세 파손 라인 특정',
      '지하 배관 정밀 헤드폰 청음 탐지로 누수원 오차 범위 10cm 압착',
      '문제 부위 최소 타공 후 고급 신주/PB 배관 영구 이중 안전 직결',
      '완벽 미장 후 배관 재압력 테스트로 미세 누수 2차 교차 검수 완료'
    ],
    tips: '★ 아랫집 누수 피해 복구비는 가입해 계신 "일상생활배상책임보험"으로 100% 보전 가능하니, 상담 시 꼭 말씀해 주세요!'
  },
  {
    id: 'work-drain',
    title: '하수구막힘 & 하수구 고압세척',
    badge: '재발율 0% 강력 세척',
    description: '배관 내부에 돌처럼 단단히 고착된 유지방 슬러지를 초고압 분쇄 세척합니다. 단순히 배관에 구멍만 뚫어 임시로 통수시키는 미봉책이 아닙니다. 산업용 초고압 고온 온수 세척기를 동원하여 배관 내벽 전체를 360도 회전 스케일링함으로써 신축 빌라 수준의 통수 능력을 회복해 드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    localName: 'sewer',
    target: '상가 메인 하수구 횡주관, 빌라 공동 집수정, 자주 막히는 메인 관로',
    equipment: '250Bar 산업용 특수 고압세척 세트, 고해상도 배관 내시경 대장',
    process: [
      '고정밀 내시경 카메라를 배관 깊숙이 진입시켜 기름 슬러지 위치 실시간 모니터링',
      '특수 회전 제트 노즐을 통한 초고압 온수 고온 스팀 배관 분사 스케일링',
      '유지방 덩어리 및 고착물 완전 파쇄 후 역류 및 미세 찌꺼기 버큠 흡입 제거',
      '배관 내시경을 고객님께 동반 공개하여 뻥 뚫린 배관 상태 모바일 현장 공유'
    ],
    tips: '★ 고압세척 공사 시 내시경 모니터링은 전 과정 무상으로 진행해 드립니다!'
  },
  {
    id: 'work-sink',
    title: '싱크대막힘',
    badge: '싱크대 역류 즉시 해결',
    description: '음식물 분쇄기 사용, 기름진 요리액 배출 등으로 인해 꽉 막히고 아래 마루로 더러운 하수가 뿜어져 나오는 비상 현장입니다. 배관에 무리를 주지 않고 이물질만 완벽 진공 회수하는 석션 공법과 회전 체인 샤프트 공법을 결합하여 가슴 속까지 뻥 뚫리게 막힘을 격파합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    localName: 'sink',
    target: '가정집 주방 싱크대 막힘 및 역류, 악취 및 냄새 발생 싱크 하부 호스',
    equipment: '초강력 진공 석션기, 고속 회전 플렉스 샤프트 기계',
    process: [
      '싱크대 하부 가림막 탈거 후 물샘 주위 배관 연결 틈새 긴급 밀봉',
      '초강력 진공 석션기로 배수관 입구에 고여 있는 유지방 슬러지 고속 회수',
      '플렉스 샤프트를 투입해 고체화된 내벽 기름때 스케일링 작업 병행',
      '대용량 온수를 싱크볼에 가득 모아 한 번에 방류하여 고속 회전 탈수 검증'
    ],
    tips: '★ 평소에 요리 후 뜨거운 물을 싱크대에 한 번에 쏟아 부어주시면 싱크대 막힘 예방에 탁월합니다!'
  },
  {
    id: 'work-faucet',
    title: '수전교체',
    badge: '물샘 방지 안심 조립',
    description: '욕실, 주방, 베란다 등의 낡아 부식되고 물방울이 멈추지 않는 수도꼭지 및 샤워 수전을 철거하고 교체해 드립니다. 거품 없는 자재 단가로 제공되는 최고급 황동 바디 주물 수전만을 엄선하여 녹물 방지와 강한 수압 성능을 오랫동안 영구 유지할 수 있도록 정밀 밀봉 마감 시공을 완수합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=800&q=80',
    localName: 'faucet',
    target: '주방 원홀/벽붙이 거위목 수전, 욕실 샤워/욕조 수도꼭지, 세면대 냉온수 수전',
    equipment: '싱크 하부 수전 전용 탈부착 기어 렌치, 무독성 친환경 테프론 팩',
    process: [
      '수도 계량기 메인 밸브 차단 후 노후하여 찌들어 붙은 볼트 안전 분리',
      '연결 나사선 내부 이물질 및 스케일 녹 제거 청소 작업 완수',
      '특수 수입 테프론 밴드로 나사산 이중 래핑 조임 후 미세 틈새 물샘 원천 봉쇄',
      '수도꼭지 장착 완료 후 미세 물 비침 및 온수 가열 혼합 테스트 합격 검증'
    ],
    tips: '★ 오래된 수전은 미세 누수로 수도요금 상승을 유발하니 물방울이 비치면 즉시 교체가 경제적입니다.'
  },
  {
    id: 'work-toilet',
    title: '세면대교체 & 변기교체',
    badge: '도기 전문 완벽 마감',
    description: '위생 상태가 영 좋지 않고 도기에 균열이 가 위험하거나, 변기 수압 불량으로 늘 골머리 썩으셨다면 신속 교체가 정답입니다. 세련되고 관리가 용이한 국내 최고 대형 브랜드 친환경 양변기와 볼 타입 세면대를 정품 설치해 드립니다. 불쾌한 화장실 악취의 주범인 정화조 가스를 정심 플랜지 완벽 배합으로 영구 차단합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
    localName: 'toilet',
    target: '양변기 노후/물안내림, 세면대 실금/배수 트랩 탈락, 하수 가스 냄새 유입',
    equipment: '디지털 정밀 수평계, 양변기 플랜지 고밀도 차단씰',
    process: [
      '폐변기/세면대 손상 없이 정교하게 뜯어낸 후 무료로 전량 안전 수거 회수',
      '양변기 배수 구멍 내부 청소 및 냄새를 100% 가두는 고성능 정심 부착',
      '새 양변기/세면대를 올리고 정밀 수평계로 4면 흔들림 없는 각도 안착',
      '곰팡이가 전혀 피지 않는 친환경 무독성 안심 바이오 실리콘 깔끔 미장 테두리 마감'
    ],
    tips: '★ 기존 수거해 드리는 폐도기는 별도 요금 없이 저희가 무료로 직접 폐기물 처리해 드립니다.'
  },
  {
    id: 'work-thawing',
    title: '해빙 & 언수도녹임',
    badge: '안전 보장 급속 해빙',
    description: '혹독한 겨울철 온도가 얼어붙어 물이 단 1방울도 나오지 않거나 난방 기능이 마비되었을 때, 긴급 대응 대기팀이 급파됩니다. 가스 토치 같은 화재 유발 기구는 엄금하고, 오직 배관 팽창 및 파손 우려가 전혀 없는 전문가 전용 고열 고압 스팀 프로브를 주입하여 수도 얼음 핵을 안전하게 녹여 드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb5ca08f5f9?auto=format&fit=crop&w=800&q=80',
    localName: 'thawing',
    target: '계량기 동파 및 동결, 외부 수도 동결 파이프, 겨울철 보일러 직수 배관',
    equipment: '초고압 디젤/전기 온수식 급속 해빙 대장, 외경 동결 감지 센서',
    process: [
      '수도 계량기나 보일러 하부 배관의 피팅부를 조심스럽게 풀어 얼음 두께 확인',
      '전문 고온 가열 스팀 프로브를 엑셀/PB 파이프 안쪽 깊숙이 직접 전진 주입',
      '배관 내벽 손상 없는 고압 수증기 온수로 동결 빙하 핵 신속 관통 배출',
      '통수 즉각 확인 후 영하 15도 한파에도 버티는 특수 은박 고밀도 보온재 완벽 보강 시공'
    ],
    tips: '★ 추운 겨울철 외벽 수도는 물을 졸졸졸 약하게 틀어 흐르도록 두는 것이 가장 완벽한 예방법입니다.'
  }
];

export default function App() {
  // Custom Banner from AdminConsole
  const [showCustomBanner, setShowCustomBanner] = useState<boolean>(() => {
    return localStorage.getItem('show_custom_banner') === 'true';
  });
  const [customBannerImage, setCustomBannerImage] = useState<string>(() => {
    return localStorage.getItem('custom_banner_image') || '';
  });

  useEffect(() => {
    const handleBannerChange = () => {
      setShowCustomBanner(localStorage.getItem('show_custom_banner') === 'true');
      setCustomBannerImage(localStorage.getItem('custom_banner_image') || '');
    };

    window.addEventListener('bannerChanged', handleBannerChange);
    return () => window.removeEventListener('bannerChanged', handleBannerChange);
  }, []);

  // States for interactive UI elements
  const [activeDiagId, setActiveDiagId] = useState<string>(VIRTUAL_DIAGNOSIS[0].id);
  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);
  const [beforeAfterTab, setBeforeAfterTab] = useState<'drain' | 'pipe' | 'toilet'>('drain');
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);
  
  // Interactive Estimate Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    urgency: '🚨 매우 긴급 (30분 이내 출동 필요)',
    notes: '',
    privacyAgree: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic phone number formatting: 010-XXXX-XXXX
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    let formattedPhone = value;
    if (value.length > 3 && value.length <= 7) {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    }
    
    setFormData(prev => ({ ...prev, phone: formattedPhone }));
  };

  const selectServiceAndScroll = (serviceTitle: string) => {
    setFormData(prev => ({ ...prev, service: serviceTitle }));
    const formElement = document.getElementById('quick-quote');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.service) {
      alert('상담 신청을 위해 이름, 연락처, 서비스를 모두 입력해 주세요.');
      return;
    }
    if (!formData.privacyAgree) {
      alert('개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);
    
    // Construct local timestamp in Asia/Seoul
    const timestampStr = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const submission: SubmissionData = {
      name: formData.name,
      phone: formData.phone,
      service: formData.service,
      urgency: formData.urgency,
      notes: formData.notes,
      timestamp: timestampStr,
      syncedToSheets: false,
      emailSent: false
    };

    // 1. Save to LocalStorage first as local backup
    const localRaw = localStorage.getItem('local_submissions');
    const localList = localRaw ? JSON.parse(localRaw) : [];
    localList.push(submission);
    localStorage.setItem('local_submissions', JSON.stringify(localList));

    let dbSuccess = false;
    let newDocId = '';

    // 2. Try to save to Firestore with a 2-second timeout to prevent hanging the UI
    try {
      const firestorePromise = addDoc(collection(db, 'submissions'), {
        name: submission.name,
        phone: submission.phone,
        service: submission.service,
        urgency: submission.urgency,
        notes: submission.notes,
        timestamp: submission.timestamp,
        syncedToSheets: false,
        emailSent: false,
        createdAt: new Date()
      });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firestore operation timed out')), 2000)
      );

      const docRef = await Promise.race([firestorePromise, timeoutPromise]);
      newDocId = docRef.id;
      dbSuccess = true;
    } catch (err) {
      console.warn('Firestore save failed or timed out, relying on LocalStorage backup:', err);
    }

    // 3. Attempt direct background sync if Google Apps Script is active, otherwise fallback to legacy Google Auth
    const useAppsScript = localStorage.getItem('use_apps_script') !== 'false';
    const appsScriptUrl = localStorage.getItem('apps_script_url') || '';
    
    let syncedToSheets = false;
    let emailSent = false;

    if (useAppsScript && appsScriptUrl) {
      try {
        const fetchPromise = fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors', // Avoid preflight CORS issues with Google Apps Script
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            name: submission.name,
            phone: submission.phone,
            service: submission.service,
            urgency: submission.urgency,
            notes: submission.notes,
            timestamp: submission.timestamp
          })
        });

        const timeoutPromise = new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Google Apps Script request timed out')), 5000)
        );

        await Promise.race([fetchPromise, timeoutPromise]);
        // Since 'no-cors' returns an opaque response, we assume successful transmission once fetch completes without timing out.
        syncedToSheets = true;
        emailSent = true;
      } catch (err) {
        console.error('Google Apps Script submission failed or timed out, will save locally:', err);
      }
    } else {
      const token = sessionStorage.getItem('g_access_token');
      const spreadsheetId = localStorage.getItem('admin_spreadsheet_id');
      const sheetName = localStorage.getItem('admin_sheet_name') || '예약접수목록';

      if (token) {
        // Auto-append to Google Sheet
        if (spreadsheetId) {
          try {
            await appendRowToGoogleSheet(token, spreadsheetId, sheetName, [
              submission.timestamp,
              submission.name,
              submission.phone,
              submission.service,
              submission.urgency,
              submission.notes || '없음'
            ]);
            syncedToSheets = true;
          } catch (err) {
            console.error('Auto sheets sync failed:', err);
          }
        }

        // Auto-send email notification to owner
        try {
          await sendGmailNotification(token, 'nakeunjong@gmail.com', {
            ...submission,
            id: newDocId || undefined
          });
          emailSent = true;
        } catch (err) {
          console.error('Auto Gmail notify failed:', err);
        }
      }
    }

    // 4. Update state and local storage with final sync status
    const finalSubmission = {
      ...submission,
      id: newDocId || undefined,
      syncedToSheets,
      emailSent
    };

    const updatedLocalList = localList.map((item: any) => {
      if (item.timestamp === submission.timestamp && item.name === submission.name && item.phone === submission.phone) {
        return finalSubmission;
      }
      return item;
    });
    localStorage.setItem('local_submissions', JSON.stringify(updatedLocalList));

    // Update in Firestore too if it was successfully added
    if (dbSuccess && newDocId && (syncedToSheets || emailSent)) {
      try {
        const docRef = doc(db, 'submissions', newDocId);
        await updateDoc(docRef, {
          syncedToSheets,
          emailSent
        });
      } catch (err) {
        console.warn('Firestore status sync update failed:', err);
      }
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      service: '',
      urgency: '🚨 매우 긴급 (30분 이내 출동 필요)',
      notes: '',
      privacyAgree: true
    });
    setIsSubmitted(false);
  };

  // Helper to map icon name to component
  const renderServiceIcon = (iconName: string) => {
    const props = { className: "w-7 h-7 text-[#2e7d32]" };
    switch (iconName) {
      case 'Droplet': return <Droplet {...props} />;
      case 'Wrench': return <Wrench {...props} />;
      case 'Compass': return <Compass {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      default: return <Wrench {...props} />;
    }
  };

  // Find active diagnosis case
  const activeDiag = VIRTUAL_DIAGNOSIS.find(item => item.id === activeDiagId) || VIRTUAL_DIAGNOSIS[0];

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#1c2a1e] font-sans overflow-x-hidden antialiased selection:bg-[#a5d6a7]/40">
      
      {/* 긴급 상단 바 (Emergency Top Bar) */}
      <div id="top-announcement-bar" className="bg-[#1b4332] text-white py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex justify-center items-center gap-2 z-50 relative">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        <span>수도권 전 지역 긴급 출동 24시간 실시간 대기 중 — <strong>30분 이내 현장 도착</strong>!</span>
      </div>

      {/* 헤더 및 내비게이션 (Sticky Header) */}
      <header id="main-header" className="sticky top-0 bg-[#fcfdfc]/90 backdrop-blur-md border-b border-gray-100 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-2 bg-[#e8f5e9] rounded-lg flex items-center justify-center border border-[#a5d6a7]/40 shadow-sm">
              <Droplet className="w-6 h-6 text-[#2e7d32] animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <span className="font-display font-black text-lg sm:text-2xl text-[#1b4332] tracking-tight block">베스트누수설비</span>
              <span className="text-[10px] sm:text-xs text-[#2e7d32] tracking-wider font-semibold block -mt-1 uppercase">Best leak & plumbing</span>
            </div>
          </a>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#services" className="hover:text-[#2e7d32] transition-colors">서비스 안내</a>
            <a href="#trust" className="hover:text-[#2e7d32] transition-colors">신뢰 포인트</a>
            <a href="#diagnosis" className="hover:text-[#2e7d32] transition-colors">스마트 자가진단</a>
            <a href="#reviews" className="hover:text-[#2e7d32] transition-colors">고객 후기</a>
            <a href="#faq" className="hover:text-[#2e7d32] transition-colors">자주 묻는 질문</a>
          </nav>

          {/* 상담전화 및 카톡 CTA 버튼 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href="https://open.kakao.com/o/sy8tJKEi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
              id="header-kakao-btn"
            >
              <span className="w-4 h-4 bg-[#191919] text-[#FEE500] rounded-tl rounded-tr rounded-br rounded-bl-[1px] flex items-center justify-center text-[8px] font-black leading-none">talk</span>
              <span className="hidden xs:inline font-bold">카톡상담</span>
            </a>
            <a 
              href="tel:010-8031-0482" 
              className="flex items-center gap-1.5 sm:gap-2 bg-[#2e7d32] hover:bg-[#1b4332] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md shadow-[#2e7d32]/10 hover:shadow-[#2e7d32]/30 active:scale-95 transition-all"
              id="header-call-btn"
            >
              <Phone className="w-4 h-4 fill-current text-[#a5d6a7]" />
              <span className="hidden sm:inline">24시간 빠른 전화상담</span>
              <span className="sm:hidden font-mono">010-8031-0482</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section (상단 메인 화면 - Replicated Banner & Diagnosis Bento) */}
      <section id="hero" className="relative bg-[#f4fbf7] pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden border-b border-[#e8f5e9]">
        {/* Background Decorative Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#e8f5e9]/50 via-[#c8e6c9]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-10 right-10 w-[200px] h-[200px] bg-emerald-100/50 rounded-full blur-2xl pointer-events-none -z-10"></div>
        <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] bg-sky-100/40 rounded-full blur-2xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Banner Container: Replicating the uploaded banner with high fidelity OR rendering the custom uploaded image */}
          {showCustomBanner && customBannerImage ? (
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_15px_50px_-15px_rgba(46,125,50,0.08)] border border-emerald-100/80 relative transition-all group">
              <img 
                src={customBannerImage} 
                alt="베스트누수설비 공식 배너" 
                className="w-full h-auto object-cover block"
                referrerPolicy="no-referrer"
              />
              <a 
                href="tel:010-8031-0482" 
                className="absolute inset-0 cursor-pointer flex items-end justify-center sm:justify-end p-4 sm:p-6 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
                title="터치하면 즉시 상담 전화 연결 (010-8031-0482)"
                id="uploaded-banner-click-overlay"
              >
                <span className="bg-emerald-800 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Phone className="w-4 h-4 fill-current text-emerald-300 animate-bounce" />
                  <span>터치하여 즉시 전화 상담 연결 (010-8031-0482)</span>
                </span>
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_15px_50px_-15px_rgba(46,125,50,0.08)] border border-emerald-100/80 relative overflow-hidden">
              {/* Soft decorative background in the banner card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f8fdfa] via-white to-[#f0f8f3] opacity-90 -z-10"></div>
              {/* Water splashes representation */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_bottom_right,rgba(165,214,167,0.15),transparent_70%)] pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Friendly Plumber (approx. 3 cols) */}
                <div className="lg:col-span-3 flex flex-col items-center justify-center relative">
                  {/* Background water/circle glow for plumber */}
                  <div className="absolute w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-tr from-[#a5d6a7]/30 to-[#e8f5e9]/50 rounded-full blur-xl -z-10"></div>
                  <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full border-4 border-white shadow-lg overflow-hidden bg-emerald-50">
                    <img 
                      src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80" 
                      alt="베스트누수설비 마스터" 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Floating badge for plumber */}
                  <div className="mt-4 bg-emerald-800 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md tracking-wider flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
                    <Wrench className="w-3 h-3 text-emerald-300" />
                    <span>김동현 대표 엔지니어</span>
                  </div>
                </div>

                {/* Center Column: Brand Title & CTA (approx. 5 cols) */}
                <div className="lg:col-span-5 text-center lg:text-left space-y-4 sm:space-y-6 flex flex-col items-center lg:items-start justify-center">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm sm:text-base tracking-tight">
                    <span className="text-xl">🍃</span>
                    <span className="font-display italic">"믿음과 기술로 해결하는 설비 전문가!"</span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black text-[#1b4332] tracking-tight leading-none drop-shadow-sm flex flex-col items-center lg:items-start gap-1">
                      <span>베스트누수설비</span>
                    </h1>
                    
                    {/* Banner Sub Services Green Bar */}
                    <div className="inline-block bg-[#1b4332] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-base font-black tracking-wide shadow-sm">
                      누수탐지 · 누수공사 · 막힘해결 · 각종 설비공사
                    </div>
                  </div>

                  {/* Main Interactive Call Banner Banner */}
                  <a 
                    href="tel:010-8031-0482" 
                    className="group w-full max-w-sm sm:max-w-md bg-white border-4 border-emerald-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left"
                    id="banner-call-cta"
                  >
                    <div className="bg-[#2e7d32] group-hover:bg-[#1b4332] transition-colors rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
                      <Phone className="w-5 h-5 sm:w-6 h-6 fill-current text-[#a5d6a7]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] sm:text-xs text-[#2e7d32] font-black uppercase tracking-wider block mb-0.5 sm:mb-1">상담문의 (터치하면 즉시 연결)</span>
                      <span className="font-mono text-xl sm:text-2.5xl font-black text-[#1b4332] tracking-wide block leading-none">010-8031-0482</span>
                    </div>
                    <div className="bg-emerald-50 text-emerald-800 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
                    </div>
                  </a>

                  {/* Emergency status */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>서울·경기·인천 24시간 실시간 대기, 30분 이내 도착 가능</span>
                  </div>
                </div>

                {/* Right Column: 6 Service Cards List (approx. 4 cols) */}
                <div className="lg:col-span-4 space-y-2 w-full">
                  {[
                    { title: '누수탐지 & 누수공사', img: '/assets/leak.jpg', fallback: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80' },
                    { title: '하수구막힘 & 하수구고압세척', img: '/assets/sewer.jpg', fallback: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80' },
                    { title: '싱크대막힘 & 변기막힘', img: '/assets/sink.jpg', fallback: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80' },
                    { title: '수전교체 · 변기교체 · 세면대교체', img: '/assets/faucet.jpg', fallback: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=400&q=80' },
                    { title: '해빙 & 언수도녹임', img: '/assets/thawing.jpg', fallback: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=400&q=80' },
                    { title: '기타 모든 설비공사', img: '/assets/toilet.jpg', fallback: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=400&q=80' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      onClick={() => selectServiceAndScroll(item.title)}
                      className="group bg-white/95 hover:bg-[#e8f5e9]/90 border border-gray-100 hover:border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-[#2e7d32] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[4px]" />
                        </div>
                        <span className="font-bold text-gray-800 text-xs sm:text-sm tracking-tight group-hover:text-[#1b4332] line-clamp-1">{item.title}</span>
                      </div>
                      {/* Tiny thumbnail on the right, exactly like the uploaded banner */}
                      <div className="w-12 h-8 rounded-md overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <img 
                          src={item.img} 
                          onError={(e) => { e.currentTarget.src = item.fallback; }}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Bottom Row: 6 circular service icons, exactly mirroring the bottom of the uploaded image */}
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-emerald-100/50 grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
                {[
                  { label: '누수탐지 누수공사', emoji: '💧', icon: Droplet },
                  { label: '하수구막힘 고압세척', emoji: '🕳️', icon: Wrench },
                  { label: '싱크대막힘 변기막힘', emoji: '🚰', icon: Compass },
                  { label: '수전교체 변기교체 세면대교체', emoji: '🔧', icon: Sparkles },
                  { label: '해빙 언수도녹임', emoji: '❄️', icon: Flame },
                  { label: '기타 모든 설비공사', emoji: '🛠️', icon: ShieldCheck },
                ].map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => selectServiceAndScroll(item.label)}
                    className="group flex flex-col items-center text-center cursor-pointer max-w-[120px]"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white hover:bg-emerald-50 border border-gray-100 hover:border-emerald-300 rounded-full flex items-center justify-center shadow-xs hover:shadow-md hover:scale-105 transition-all relative">
                      <span className="text-xl sm:text-2xl">{item.emoji}</span>
                      <div className="absolute -bottom-1 -right-1 bg-white border border-gray-50 rounded-full p-1 shadow-2xs">
                        <item.icon className="w-3 h-3 text-emerald-800" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-600 group-hover:text-emerald-950 mt-2 sm:mt-2.5 leading-tight tracking-tight break-keep">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Quick interactive diagnosis tool bento card, placed beautifully below the main banner */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            <div className="lg:col-span-4 bg-gradient-to-br from-[#1b4332] to-[#081c15] rounded-[2rem] p-6 sm:p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(46,125,50,0.3),transparent_70%)] pointer-events-none"></div>
              <div className="space-y-4 relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/60 border border-emerald-700/50 rounded-full text-xs font-bold text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>스마트 기술 자가진단</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  방문하기 전, <br />
                  <span className="text-[#a5d6a7]">실시간으로 증상 진단</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-light">
                  지금 화장실이나 주방, 또는 다용도실에서 나타나는 증상을 터치해 보세요. 마스터 엔지니어들이 현장에서 축적한 데이터를 바탕으로 즉각적인 자가진단 조치와 최적의 예상 복구 공법을 미리 알려드립니다.
                </p>
              </div>
              <div className="pt-6 sm:pt-8 border-t border-emerald-800/40 mt-4 flex items-center justify-between text-xs text-emerald-300/80 font-semibold">
                <span>⚡ 10초 실시간 매칭 엔진</span>
                <span>누적 진단 1,480건+</span>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-[2rem] p-6 sm:p-8 shadow-md border border-gray-100 flex flex-col justify-between relative">
              {/* Active Support Status Tag */}
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-950 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                <span>엔지니어 대기중</span>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-50 pb-3">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
                    <span>증상 선택 및 조치 가이드</span>
                  </h3>
                </div>

                {/* Symptom Tab Selector in Hero Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VIRTUAL_DIAGNOSIS.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveDiagId(item.id)}
                      className={`px-3 py-3 text-xs font-black rounded-xl transition-all text-left flex flex-col gap-1.5 border ${
                        activeDiagId === item.id
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 border-transparent text-gray-600'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeDiagId === item.id ? 'bg-[#2e7d32]' : 'bg-gray-300'}`} />
                        <span className="text-[9px] text-[#2e7d32] font-extrabold">자가진단</span>
                      </span>
                      <span className="line-clamp-1 break-keep">{item.symptom}</span>
                    </button>
                  ))}
                </div>

                {/* Real-time Result Box */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDiag.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#fcfdfd] rounded-2xl p-4 border border-[#e8f5e9] space-y-3 text-xs sm:text-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="inline-block bg-[#e8f5e9] text-[#2e7d32] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">예상 주요원인</span>
                        <p className="font-black text-gray-900 mt-1 text-sm">{activeDiag.cause}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-600">
                        <div>
                          <span className="text-gray-400 font-bold block">필요 정밀장비</span>
                          <span className="font-bold text-[#1b4332] mt-0.5 block">{activeDiag.equipment}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block">평균 복구 시간</span>
                          <span className="font-bold text-[#1b4332] mt-0.5 block">{activeDiag.timeRequired}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f7faf8] rounded-xl p-3 border border-gray-100">
                      <span className="text-[#2e7d32] font-black block mb-0.5">💡 비상 자가 조치 요령</span>
                      <p className="text-gray-600 leading-relaxed text-[11px] sm:text-xs">{activeDiag.solution}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => selectServiceAndScroll(activeDiag.symptom)}
                  className="w-full bg-[#1b4332] hover:bg-black text-white py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span>이 증상으로 즉시 맞춤 무료 견적 접수하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Core Reassurances: 24/7 Service Metrics */}
      <section className="bg-white py-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-x-0 sm:divide-x divide-gray-100 text-center">
            <div>
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#2e7d32] font-mono">100%</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">해결 실패시 청구 비용 0원</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#2e7d32] font-mono">24H</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">상시 비상 출장 대기</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#2e7d32] font-mono">15Yr+</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">현장 경력 마스터 시공</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#2e7d32] font-mono">2Years</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">확실한 책임 무상 AS 보장</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Factors Section (신뢰 요소 3가지) */}
      <section id="trust" className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#f4faf6] scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
            <h2 className="text-xs sm:text-sm font-bold text-[#2e7d32] uppercase tracking-widest">Trust & Quality</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              바가지 요금 걱정 끝! <br className="sm:hidden" />
              <span className="text-[#2e7d32]">베스트누수설비의 3대 정직 신뢰 약속</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              인터넷 검색을 통해 여러 업체를 고르는 일이 얼마나 조심스럽고 불안한지 잘 알기에, 베스트누수설비는 오직 투명함과 과학적 기술력으로만 승부합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Trust Element 1: Fair Price */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl hover:border-[#a5d6a7]/40 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center text-[#2e7d32] group-hover:bg-[#2e7d32] group-hover:text-white transition-all">
                  <Coins className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{TRUST_FACTORS[0].title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{TRUST_FACTORS[0].description}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 bg-[#e8f5e9]/50 -mx-8 -mb-8 p-5 rounded-b-3xl text-xs sm:text-sm font-bold text-[#2e7d32] flex items-center gap-1.5">
                <Check className="w-5 h-5" />
                <span>{TRUST_FACTORS[0].highlightText}</span>
              </div>
            </div>

            {/* Trust Element 2: Before & After (Visual Proof) */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl hover:border-[#a5d6a7]/40 transition-all flex flex-col justify-between group lg:col-span-1">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center text-[#2e7d32] group-hover:bg-[#2e7d32] group-hover:text-white transition-all">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{TRUST_FACTORS[1].title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{TRUST_FACTORS[1].description}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 bg-[#e8f5e9]/50 -mx-8 -mb-8 p-5 rounded-b-3xl text-xs sm:text-sm font-bold text-[#2e7d32] flex items-center gap-1.5">
                <Check className="w-5 h-5" />
                <span>{TRUST_FACTORS[1].highlightText}</span>
              </div>
            </div>

            {/* Trust Element 3: Advanced Equipments */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl hover:border-[#a5d6a7]/40 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#e8f5e9] rounded-2xl flex items-center justify-center text-[#2e7d32] group-hover:bg-[#2e7d32] group-hover:text-white transition-all">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{TRUST_FACTORS[2].title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{TRUST_FACTORS[2].description}</p>
                
                {/* Equipment Icons list */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-[#fcfdfc] border border-gray-100 rounded-xl p-2.5 text-center">
                    <Tv className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] text-gray-500 font-bold block">배관 내시경</span>
                  </div>
                  <div className="bg-[#fcfdfc] border border-gray-100 rounded-xl p-2.5 text-center">
                    <Search className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] text-gray-500 font-bold block">가스 탐지기</span>
                  </div>
                  <div className="bg-[#fcfdfc] border border-gray-100 rounded-xl p-2.5 text-center">
                    <Camera className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] text-gray-500 font-bold block">열화상 카메라</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 bg-[#e8f5e9]/50 -mx-8 -mb-8 p-5 rounded-b-3xl text-xs sm:text-sm font-bold text-[#2e7d32] flex items-center gap-1.5">
                <Check className="w-5 h-5" />
                <span>{TRUST_FACTORS[2].highlightText}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 우리가 하는 공사의 내용 (실제 시공 사진 및 상세 설명) */}
      <section id="work-gallery" className="py-16 sm:py-24 bg-[#f4faf6]/30 border-t border-gray-100 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-20">
            <span className="text-xs sm:text-sm font-bold text-[#2e7d32] uppercase tracking-widest bg-[#e8f5e9] px-3 py-1.5 rounded-full inline-block">
              📸 실제 공사 현장 갤러리
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              베스트누수설비의 <span className="text-[#2e7d32]">6대 핵심 시공 현장</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              고객님께 깊은 신뢰와 안심을 드리기 위해 저희가 처리하는 실제 설비 공사 내용을 투명하게 설명해 드립니다. 각 카드를 눌러 <strong>마스터의 정교한 시공 단계와 노하우</strong>를 확인해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {CONSTRUCTION_WORKS.map((work, index) => {
              const isExpanded = expandedWorkId === work.id;
              return (
                <motion.div
                  key={work.id}
                  layout
                  className="bg-white rounded-3xl border border-gray-100 hover:border-[#a5d6a7]/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  id={`work-card-${work.id}`}
                >
                  {/* Image Header with dynamic layout */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden group">
                    {/* Hover scale effect with robust local upload support & fallback */}
                    <FallbackImage
                      localName={work.localName}
                      fallbackUrl={work.imageUrl}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Badge top-left */}
                    <div className="absolute top-4 left-4 bg-[#2e7d32] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                      <span>실제 시공 사례</span>
                    </div>

                    {/* Service Index top-right */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-[#2e7d32] w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md">
                      0{index + 1}
                    </div>

                    {/* Bottom gradient overlay with main target */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                      <span className="text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-[#a5d6a7] shrink-0" />
                        <span className="line-clamp-1">{work.target}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      {/* Title and Category Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                          {work.title}
                        </h3>
                        <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-lg">
                          {work.badge}
                        </span>
                      </div>

                      {/* Main easy-to-understand Description */}
                      <p className="text-sm text-gray-600 leading-relaxed font-normal">
                        {work.description}
                      </p>

                      {/* Equipment Tag */}
                      <div className="bg-[#fcfdfc] border border-gray-100 p-3 rounded-xl space-y-1">
                        <span className="text-[10px] font-black text-[#2e7d32] uppercase tracking-wider block">
                          🛠️ 투입 첨단 전문 장비
                        </span>
                        <p className="text-xs text-gray-700 font-bold leading-relaxed flex items-center gap-1.5">
                          {work.equipment}
                        </p>
                      </div>

                      {/* Interactive Accordion for 4-Step Process */}
                      <div className="pt-1">
                        <button
                          onClick={() => setExpandedWorkId(isExpanded ? null : work.id)}
                          className="w-full flex items-center justify-between bg-[#f7faf8] hover:bg-[#e8f5e9] text-[#1b4332] py-3 px-4 rounded-xl font-extrabold text-xs transition-all border border-[#a5d6a7]/20 hover:border-[#a5d6a7]/50"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#2e7d32] animate-pulse" />
                            <span>상세 시공 과정 ({work.process.length}단계) 보기</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#2e7d32]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#2e7d32]" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 bg-gray-50 border border-gray-100 rounded-2xl p-4.5 space-y-4">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block border-b border-gray-200 pb-1.5">
                                  👷 마스터 정밀 시공 순서
                                </span>
                                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#a5d6a7]/40">
                                  {work.process.map((step, sIndex) => (
                                    <div key={sIndex} className="flex gap-3 relative z-10">
                                      <div className="w-6 h-6 bg-[#2e7d32] text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 shadow-sm">
                                        {sIndex + 1}
                                      </div>
                                      <p className="text-xs text-gray-600 font-medium leading-relaxed pt-0.5">
                                        {step}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Yellow sticky note for Tips */}
                                <div className="bg-[#fffbeb] border border-amber-100 rounded-xl p-3 text-xs text-amber-900 leading-relaxed font-semibold">
                                  {work.tips}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Action Area for Each Card */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 mt-5">
                      <button
                        onClick={() => selectServiceAndScroll(work.title)}
                        className="bg-[#1b4332] hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm active:scale-98"
                      >
                        <span>간편 견적신청</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href="https://open.kakao.com/o/sy8tJKEi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] py-3.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
                      >
                        <span className="w-4 h-4 bg-[#191919] text-[#FEE500] rounded-tl-sm rounded-tr-sm rounded-br-sm rounded-bl-[1px] flex items-center justify-center text-[7px] font-black leading-none shrink-0">talk</span>
                        <span>카톡 1:1 상담</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Services Section (서비스 안내 6가지) */}
      <section id="services" className="py-16 sm:py-24 bg-[#e8f5e9]/40 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-18">
            <h2 className="text-xs sm:text-sm font-bold text-[#2e7d32] uppercase tracking-widest">Our Professional Services</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              무엇이 막히고 새든, <br className="sm:hidden" />
              <span className="text-[#2e7d32]">신속하고 완벽하게 해결해 드립니다</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              다년간 축적된 배수 설비 노하우로 어설프게 임시방편으로 해결하지 않습니다. 근본 원인과 배관 상태를 면밀히 분석하여 확실하고 깔끔하게 시공해 드립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-[#a5d6a7]/20 hover:border-[#2e7d32]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header & Content */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-[#e8f5e9] rounded-xl flex items-center justify-center">
                      {renderServiceIcon(service.iconName)}
                    </div>
                    {service.badge && (
                      <span className="bg-[#2e7d32] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="text-gray-400 font-mono text-sm">0{index + 1}.</span>
                      <span>{service.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{service.shortDesc}</p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-[#fcfdfc] p-3 rounded-lg border border-gray-50">{service.fullDesc}</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-black text-[#2e7d32] uppercase tracking-wider block">주요 핵심 시공 기준</span>
                    <ul className="space-y-1.5">
                      {service.keyPoints.map((point, pIndex) => (
                        <li key={pIndex} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#2e7d32] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Banner */}
                <div className="bg-[#f7faf8] border-t border-gray-100 p-5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">안심 비용 안내</span>
                    <span className="font-bold text-gray-700 mt-0.5 block">{service.averageCostGuide}</span>
                  </div>
                  <button
                    onClick={() => selectServiceAndScroll(service.title)}
                    className="flex items-center gap-1 bg-white hover:bg-[#2e7d32] text-[#2e7d32] hover:text-white border border-[#a5d6a7]/60 hover:border-[#2e7d32] px-3 py-1.5 rounded-lg font-bold transition-all shadow-xs"
                  >
                    <span>견적 신청</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-[#1b4332] text-white px-8 py-5 rounded-2xl shadow-md">
              <div className="text-center sm:text-left">
                <span className="text-xs text-[#a5d6a7] font-bold block mb-0.5">상단에 명시되지 않은 기타 모든 보일러 배관, 수도관 등의 설비도 가능합니다.</span>
                <span className="text-sm sm:text-base font-bold">어디서 어떻게 해야 할지 감이 잡히지 않으신가요?</span>
              </div>
              <a 
                href="tel:010-8031-0482" 
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-sm"
              >
                📞 맞춤 유선 상담받기
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Quotation Form Section (빠른 견적 신청) */}
      <section id="quick-quote" className="py-16 sm:py-24 bg-white scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            
            {/* Quick Quote Left Info */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs sm:text-sm font-bold text-[#2e7d32] uppercase tracking-widest">Simple & Fast Quote</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  단, 10초 만에 끝나는 <br />
                  <span className="text-[#2e7d32]">친절 안심 간편 상담 신청</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  물샘이나 하수구 역류로 곤란하고 급하신 마음을 백번 이해하기에, 복잡한 인적사항 요구를 과감히 없앴습니다. <br /><br />
                  이름, 연락처, 필요한 서비스만 남겨주시면 사장님이 직접 진단해 보고 대략적인 예상 가이드 비용을 빠르고 양심적이게 일러드립니다.
                </p>
              </div>

              {/* Core Counseling Advantages */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-[#f7faf8] p-4 rounded-xl border border-[#e8f5e9]">
                  <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">원거리 추가 비용 없음</span>
                    <span className="text-xs text-gray-500 mt-0.5 block">수도권(서울, 경기, 인천) 전 지역 어디서나 추가 요금 없이 30분대 출장 보장</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#f7faf8] p-4 rounded-xl border border-[#e8f5e9]">
                  <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">100% 무상 현장 진단 피드백</span>
                    <span className="text-xs text-gray-500 mt-0.5 block">상담과 예약 신청 후 실제 상황 확인 후 합리적인 비용에 합의할 때만 작업</span>
                  </div>
                </div>
              </div>

              {/* Reassuring text */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-[#e8f5e9] rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-[#2e7d32]" />
                </div>
                <span className="text-xs text-gray-500 font-medium leading-relaxed">
                  남겨주신 소중한 개인정보는 상담 진행 목적으로만 사용되며, 상담 완료 즉시 파기 및 암호화 처리되니 안심하고 기재하셔도 좋습니다.
                </span>
              </div>
            </div>

            {/* Quick Quote Right Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#f4faf6] rounded-3xl p-6 sm:p-10 border border-[#a5d6a7]/30 shadow-xl shadow-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#a5d6a7]/20 rounded-full blur-2xl pointer-events-none"></div>

                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.form 
                      onSubmit={handleSubmit}
                      key="quote-form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#1b4332] block" htmlFor="form-service">
                          01. 어떤 도움이 필요하신가요? <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="form-service"
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-200 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl px-4 py-3.5 text-sm sm:text-base font-bold text-gray-800 transition-all outline-none"
                        >
                          <option value="">-- 서비스 유형 선택해 주세요 --</option>
                          <option value="누수탐지 & 누수공사">누수탐지 & 누수공사 (물 샘 위치 탐지/보수)</option>
                          <option value="하수구막힘 & 고압세척">하수구막힘 & 하수구고압세척 (배관 내부 강력 청소)</option>
                          <option value="싱크대막힘 & 변기막힘">싱크대막힘 & 변기막힘 (생활 하수구 시원하게 뚫기)</option>
                          <option value="수전교체 & 화장실 도기교체">수전교체 & 변기·세면대교체 (수도꼭지 및 도기 교체)</option>
                          <option value="해빙 & 언수도녹임">해빙 & 언수도녹임 (겨울철 얼어붙은 배관 스팀 해빙)</option>
                          <option value="기타 모든 종합 설비">기타 모든 종합 설비공사 (관로 공사, 방수 등)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-[#1b4332] block" htmlFor="form-name">
                            02. 고객님 존함 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="form-name"
                            name="name"
                            placeholder="예: 홍길동"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white border border-gray-200 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl px-4 py-3.5 text-sm transition-all outline-none"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-[#1b4332] block" htmlFor="form-phone">
                            03. 연락 받으실 번호 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            id="form-phone"
                            name="phone"
                            placeholder="예: 010-1234-5678"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            required
                            className="w-full bg-white border border-gray-200 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl px-4 py-3.5 text-sm tracking-wider font-mono transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#1b4332] block" htmlFor="form-urgency">
                          04. 긴급 정도를 정해주시면 더 빠르게 매칭됩니다 <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="form-urgency"
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-200 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl px-4 py-3.5 text-sm transition-all outline-none"
                        >
                          <option value="🚨 매우 긴급 (30분 이내 출동 필요)">🚨 매우 긴급 (현재 역류 중 또는 물방울 낙하로 신속 출장 필요)</option>
                          <option value="🕒 당일 일정 조율 (상호 협의 하 방문)">🕒 당일 일정 조율 (상호 협의 하 편한 시간 방문)</option>
                          <option value="💬 예약 및 단순 견적 확인">💬 예약 및 단순 견적 확인 (예정일 방문 또는 유선 상담)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#1b4332] block" htmlFor="form-notes">
                          05. 추가 요청사항 (선택사항)
                        </label>
                        <textarea
                          id="form-notes"
                          name="notes"
                          placeholder="예: 싱크대 하부장 바닥 물샘 현상, 방문 전 문자 연락 바람 등 자유롭게 입력해 주세요."
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full bg-white border border-gray-200 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl px-4 py-3.5 text-sm transition-all outline-none resize-none"
                        />
                      </div>

                      {/* Privacy agreement */}
                      <div className="pt-2">
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            name="privacyAgree"
                            checked={formData.privacyAgree}
                            onChange={(e) => setFormData(prev => ({ ...prev, privacyAgree: e.target.checked }))}
                            className="w-4.5 h-4.5 text-[#2e7d32] bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-[#2e7d32]/20 mt-0.5"
                          />
                          <span className="text-xs text-gray-500">
                            개인정보 수집 및 이용 동의(상담 목적의 성함, 연락처 수집에 대해 동의합니다) <strong className="text-gray-700">[필수]</strong>
                          </span>
                        </label>
                      </div>

                      {/* Submit button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#2e7d32] hover:bg-[#1b4332] text-white py-4 sm:py-4.5 rounded-xl font-extrabold text-base sm:text-lg transition-all shadow-md shadow-[#2e7d32]/10 hover:shadow-[#2e7d32]/30 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0/0/24/24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>서버 접수 등록 중...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 text-white" />
                              <span>10초 초고속 상담 예약 신청</span>
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-gray-400 text-center mt-2.5">
                          예상 공사금액 및 출장 스케줄을 즉시 회신해 드립니다. (통화료 및 상담료 일절 없음)
                        </p>
                      </div>
                    </motion.form>
                  ) : (
                    /* Inquiry success notification card */
                    <motion.div 
                      key="quote-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 px-4 space-y-6"
                    >
                      <div className="w-20 h-20 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto text-[#2e7d32] shadow-sm">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[#2e7d32] font-black text-xs uppercase tracking-wider block">INQUIRY COMPLETED</span>
                        <h3 className="text-2xl font-black text-gray-900">{formData.name} 고객님, 상담이 접수되었습니다!</h3>
                        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                          감사합니다. 선택하신 <strong className="text-[#2e7d32]">[{formData.service}]</strong>에 대해 전문가 배정이 즉시 완료되었습니다. <br />
                          지정하신 긴급 스케줄에 맞춰 담당 엔지니어가 5분 이내에 아래 번호로 긴급 전화를 드립니다.
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 max-w-sm mx-auto border border-gray-100 text-sm">
                        <div className="flex justify-between items-center text-xs text-gray-400 pb-2 border-b border-gray-50">
                          <span>접수번호: BT-{Math.floor(Math.random() * 90000) + 10000}</span>
                          <span>{new Date().toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="py-2.5 text-left space-y-1.5 font-semibold text-gray-700">
                          <div>연락처: <span className="font-mono text-[#2e7d32]">{formData.phone}</span></div>
                          <div>긴급강도: <span className="text-red-600">{formData.urgency.split('(')[0]}</span></div>
                          {formData.notes && (
                            <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 font-normal">
                              <span className="font-bold text-gray-700 block">추가 요청사항:</span>
                              <p className="mt-0.5 line-clamp-3 bg-gray-50 p-2 rounded border border-gray-100 text-gray-600 break-all">{formData.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-center gap-3">
                        <button
                          onClick={resetForm}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all"
                        >
                          새로 접수하기
                        </button>
                        <a
                          href="tel:010-8031-0482"
                          className="bg-[#2e7d32] hover:bg-[#1b4332] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>📞 즉시 직접 전화하기</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust factors Section: Live User Feedbacks (고객 실제 이용 후기) */}
      <section id="reviews" className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#f4faf6] border-t border-gray-50 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-18">
            <h2 className="text-xs sm:text-sm font-bold text-[#2e7d32] uppercase tracking-widest">Customer Testimonials</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              실제 공사를 받으신 <br className="sm:hidden" />
              <span className="text-[#2e7d32]">동네 주민들의 생생한 리얼 평판</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              베스트누수설비는 직접 땀 흘려 일하며 고객님의 후기 하나하나에 정성을 다합니다. 과장하지 않은 투명한 칭찬 메시지만을 엄선했습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {REVIEWS.map((review) => (
              <div 
                key={review.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Review Metadata */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#e8f5e9] rounded-full flex items-center justify-center font-bold text-[#2e7d32] text-base shadow-sm">
                        {review.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">{review.name}</span>
                          <span className="text-gray-400 text-xs font-semibold">|</span>
                          <span className="text-gray-400 text-xs font-medium">{review.location}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs font-mono font-medium">{review.date}</span>
                  </div>

                  <div className="bg-[#fcfdfc] border border-gray-50 p-4 rounded-2xl">
                    <span className="inline-block bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-extrabold px-2 py-0.5 rounded-md mb-2">
                      시공 분야: {review.serviceType}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal italic">
                      "{review.content}"
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#2e7d32]" />
                    <span>실제 시공 완료 영수 확인증 발급 완료</span>
                  </span>
                  <span className="font-bold text-[#2e7d32] flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>추천 꾹</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions Section (자주 묻는 질문) */}
      <section id="faq" className="py-16 sm:py-24 bg-white scroll-mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-14 sm:mb-18">
            <h2 className="text-xs sm:text-sm font-bold text-[#2e7d32] uppercase tracking-widest">Frequently Asked Questions</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              무엇이든 여쭤보세요! <br className="sm:hidden" />
              <span className="text-[#2e7d32]">공사 의뢰 전 속 시원한 궁금증 답변</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              비용 걱정, AS 보장 여부, 보험금 환급 등 가장 자주 질문하시는 세부사항에 대해 한 치의 거짓 없이 솔직하게 말씀드립니다.
            </p>
          </div>

          {/* Accordion container */}
          <div className="space-y-4">
            {FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                  key={faq.id}
                  className={`bg-white border rounded-2xl transition-all ${
                    isOpen ? 'border-[#2e7d32] shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 text-sm sm:text-base font-bold text-gray-900 focus:outline-none"
                  >
                    <span className="flex items-start gap-2.5">
                      <span className="font-display font-black text-[#2e7d32] text-lg">Q.</span>
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#2e7d32] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 sm:p-6 pt-0 border-t border-gray-100 bg-[#fbfdfc] rounded-b-2xl">
                          <div className="flex gap-2.5 items-start text-xs sm:text-sm text-gray-600 leading-relaxed">
                            <span className="font-display font-black text-amber-500 text-lg leading-none mt-0.5">A.</span>
                            <div className="space-y-2">
                              <p>{faq.answer}</p>
                              {faq.id === 'faq-1' && (
                                <div className="bg-[#e8f5e9]/50 border border-[#a5d6a7]/30 p-3 rounded-lg text-xs font-medium text-[#1b4332] mt-2 flex items-start gap-1.5">
                                  <Info className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                                  <span>실손 의료보험뿐만 아니라 가입하신 주택 화재보험, 운전자보험 등 다양한 패키지 내 특약으로 누수 비용 최대 100% 한도 청구 복구 가능합니다. 유선으로 자세히 안내해 드립니다.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-10 bg-gradient-to-r from-[#e8f5e9] to-[#c8e6c9]/40 p-6 sm:p-8 rounded-3xl border border-[#a5d6a7]/40 text-center space-y-4">
            <p className="text-sm font-bold text-gray-900 leading-relaxed">
              기타 더 궁금한 세부 가격 조율이나 상세 공정, 주말 야간 예약 등 <br className="hidden sm:block" />
              모든 사항에 대해 <strong>24시간 100% 무료 유선 상담</strong>을 받으실 수 있습니다.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <a
                href="tel:010-8031-0482"
                className="w-full sm:w-auto bg-[#2e7d32] hover:bg-[#1b4332] text-white px-6 py-3 rounded-xl font-extrabold text-sm sm:text-base shadow-sm flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>010-8031-0482 즉시 걸기</span>
              </a>
              <span className="text-xs text-gray-400 font-semibold sm:hidden">or</span>
              <a
                href="#quick-quote"
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold text-sm text-center"
              >
                간편 문자 예약 남기기
              </a>
              <span className="text-xs text-gray-400 font-semibold sm:hidden">or</span>
              <a
                href="https://open.kakao.com/o/sy8tJKEi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#FEE500] hover:bg-[#FEE500]/95 text-[#191919] px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 border border-[#FEE500]/50"
              >
                <span className="w-4.5 h-4.5 bg-[#191919] text-[#FEE500] rounded-tl-[6px] rounded-tr-[6px] rounded-br-[6px] rounded-bl-[1px] flex items-center justify-center text-[9px] font-black leading-none">talk</span>
                <span>실시간 카톡 상담</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Footer & Contact Area (하단 푸터 및 문의) */}
      <footer className="bg-[#112a14] text-gray-300 pt-16 pb-8 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-gray-800 pb-12 mb-8">
            
            {/* Footer Left: Brand info */}
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#1b4332] rounded-lg">
                  <Droplet className="w-5 h-5 text-[#a5d6a7]" />
                </div>
                <span className="font-display font-black text-xl text-white tracking-tight">베스트누수설비</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
                베스트누수설비는 수도권 전 지역을 담당하는 전문 배관 누수 및 하수구 종합 설비 공사 기술그룹입니다. 과잉 진단과 바가지 요금 없는 정직한 세상을 위해 헌신합니다.
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-xs font-bold text-red-400">전화 부재시 문자 남겨주시면 즉각 전담 매칭 통화 드립니다.</span>
              </div>
            </div>

            {/* Footer Middle: Core Services list */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">주요 긴급 서비스</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400 font-medium">
                <li><a href="#services" className="hover:text-white transition-colors">누수정밀탐지 & 원포인트공사</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">하수구고압세척 & 스케일러</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">싱크대역류 및 변기 뚫음</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">수전교체 & 화장실 도기교체</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">특수 스팀 해빙 & 수도 동파예방</a></li>
              </ul>
            </div>

            {/* Footer Right: Direct contact information */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">상담 및 업무 정보</h4>
              <div className="space-y-3">
                <a 
                  href="tel:010-8031-0482" 
                  className="block bg-[#1b4332] hover:bg-[#2e7d32] p-4 rounded-xl border border-[#2e7d32]/30 transition-all group"
                >
                  <span className="text-[10px] text-[#a5d6a7] font-extrabold block">24시간 언제든 통화 연결</span>
                  <span className="text-lg sm:text-xl font-black text-white font-mono block mt-1 group-hover:text-amber-400 transition-colors">
                    010-8031-0482
                  </span>
                </a>
                <div className="text-xs text-gray-400 space-y-1 font-medium">
                  <div>근무 일자: 연중무휴 (주말, 공휴일, 한파 철 철야 비상출동 가능)</div>
                  <div>출장 권역: 서울 전 지역, 인천, 경기권 전역 (수도권 내 30분대)</div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright and Legal disclaimer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-medium text-center sm:text-left">
            <div className="space-y-1">
              <div>상호: 베스트누수설비 | 대표자: 김동현 | 주소: 서울특별시 마포구 마포대로 15길 12-4</div>
              <div>사업자등록번호: 124-15-89472 (설비·누수탐지 전문 건설 등록) | 대표전화: 010-8031-0482</div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-1.5">
              <p>© 2026 베스트누수설비. All Rights Reserved. Designed for high conversion.</p>
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center gap-1 text-[#2e7d32] hover:text-[#1b4332] hover:underline cursor-pointer font-black text-xs transition-colors"
              >
                <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>🔧 관리자 모드 (구글 시트/메일 연동)</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      <AdminConsole isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* 모바일 화면용 하단 플로팅 전화걸기 퀵 바 (Mobile Conversion Floating Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-3 px-4 flex gap-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <a
          href="#quick-quote"
          className="flex-1 bg-[#f1f8f3] border border-[#a5d6a7] text-[#1b4332] py-3.5 rounded-xl text-center font-extrabold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Calendar className="w-4 h-4 text-[#2e7d32]" />
          <span>견적 문자접수</span>
        </a>
        <a
          href="tel:010-8031-0482"
          className="flex-[2] bg-gradient-to-r from-[#2e7d32] to-[#4caf50] text-white py-3.5 rounded-xl text-center font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-[#2e7d32]/20 animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          <Phone className="w-5 h-5 fill-current text-[#e8f5e9]" />
          <span>전화 즉시연결 (010)</span>
        </a>
      </div>

      {/* 실시간 카카오톡 플로팅 위젯 (Floating KakaoTalk Widget) */}
      <div className="fixed bottom-24 md:bottom-8 right-6 z-40 flex flex-col items-end gap-2">
        {/* 실시간 알림 말풍선 */}
        <div className="bg-white text-[#191919] text-[11px] font-black px-3 py-1.5 rounded-xl shadow-md border border-gray-100 flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '4s' }}>
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
          <span>1:1 빠른 카톡 실시간 문의</span>
        </div>
        
        <a
          href="https://open.kakao.com/o/sy8tJKEi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group border border-[#FEE500]/40 relative"
          title="카카오톡 1:1 빠른 상담"
          id="floating-kakao-widget"
        >
          {/* 동적 백그라운드 펄스 효과 */}
          <span className="absolute inset-0 rounded-full bg-[#FEE500]/30 animate-ping -z-10" style={{ animationDuration: '2s' }}></span>
          
          <div className="flex flex-col items-center justify-center">
            <span className="w-6 h-6 bg-[#191919] text-[#FEE500] rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-[1px] flex items-center justify-center text-[9px] font-black tracking-tighter leading-none">talk</span>
            <span className="text-[9px] font-black text-[#191919] mt-0.5 tracking-tight">카톡상담</span>
          </div>
        </a>
      </div>

    </div>
  );
}

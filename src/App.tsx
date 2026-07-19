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
  Settings,
  Wind
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
    badge: '누수 지점 오차 없는 첨단 탐지',
    description: '첨단 청음식·가스식 탐지 장비와 열화상 카메라를 동원하여 보이지 않는 바닥 속, 벽체 속 미세 누수 지점을 단 1cm의 오차도 없이 찾아냅니다.',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    localName: 'leak',
    target: '아랫집 천장 물샘, 보일러 물보충 에러, 벽면 곰팡이 유발 미세 배관 파손 지점',
    equipment: '초정밀 가스 추적식 누수 탐지기, 주파수 다중 청음식 탐지기, 고화질 열화상 카메라',
    process: [
      '온수/직수/난방 배관별 고압 공기압 테스트 및 혼합 가스를 주입해 가스식 추적 탐지 착수',
      '미세 가스 반응 위치를 감지한 후 다중 청음식 장비로 바닥 하부의 누수음 타격 정밀 포착',
      '열화상 카메라로 배관 매립 구조를 열로 스캔해 정확한 크랙 부위 최소한으로 굴착 진행',
      '손상된 동관/PB/엑셀관 부분 안전 절단 후 국산 KS 규격 배관 신설 용접 후 미장 마감 복원'
    ],
    tips: '★ 아래층 천장에 물이 샌다면 90% 이상 일상생활배상책임보험 적용이 가능합니다. 지앤지클린은 기술 소견서 및 보험사 제출용 시공 사진 대행으로 자부담을 최소화해 드립니다!'
  },
  {
    id: 'work-sewer',
    title: '하수구막힘 & 하수구 고압세척',
    badge: '자주 막히는 하수구 완결',
    description: '자주 막히고 역류하는 야외 맨홀, 빌라 공용 배관, 식당 하수관 내부를 특수 초고압 분사 세척기로 완벽 스케일링합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    localName: 'sewer',
    target: '공동 주택 공용 배관, 빌딩 맨홀, 음식점 대형 배수구, 막힘 및 역류가 잦은 배관',
    equipment: '초고압 고속 배관 스케일러, 특수 회전형 제트 노즐, 산업용 고풍량 흡입 석션기',
    process: [
      '특수 배관 배수 내시경 카메라를 배관 내부 깊숙이 투입해 고착 유지방 및 슬러지 정밀 진단',
      '수압 250Bar 이상의 초고압 고속 제트 노즐을 기동해 돌처럼 굳은 기름 결정 분쇄',
      '특수 플렉스 샤프트 장비를 연동해 배관 내벽에 흡착된 잔여 유분 스케일 정밀 연마',
      '고출력 석션기로 분쇄된 찌꺼기를 원스톱 흡입 회수하고 고효율 배수 테스트 완료'
    ],
    tips: '★ 단순 관통 스프링 작업과 달리 초고압 세척은 배관 내부를 신축 배관처럼 맑고 깨끗하게 복원하므로 재막힘 주기를 비약적으로 연장합니다!'
  },
  {
    id: 'work-sink',
    title: '싱크대막힘',
    badge: '싱크대 누수·악취 원인 차단',
    description: '싱크대 아래 음식물 찌꺼기로 막히거나 오래되어 경화되어 누수가 발생하는 배수 호스 세트를 전량 탈거하고 위생적인 특수 배수구 홈통과 S트랩으로 교체 시공합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    localName: 'sink',
    target: '싱크대 배수구 누수, 악취가 풍기는 싱크대 홈통, 싱크대 주름관 및 하부 배수관',
    equipment: '항균 오배수구 홈통 세트, 스텐레스 위생 트랩, 전용 호스 절단기, 역류 방지 트랩',
    process: [
      '악취와 위생 오염이 누적된 오래된 주름 호스 및 주방 홈통 전량 분리 수거 후 안전 폐기',
      '싱크 구멍 주위 실리콘 잔여 흔적 및 틈새 이물질 친환경 항균 약품 세척 살균 소독',
      '내부에 물때가 끼지 않는 프리미엄 위생 스텐레스 홈통 및 냄새 역류 차단 S트랩 완벽 장착',
      '주방 바닥 오수관 입구에 역류 차단 밀폐 캡을 씌우고 누수 유무 최종 검수 동작 테스트 진행'
    ],
    tips: '★ 주방에서 올라오는 원인 모를 악취는 90% 이상 싱크대 호스 내부 물때 부패와 하부 오수관 틈새 때문입니다. 홈통 세트 교체만으로도 드라마틱하게 악취가 차단됩니다!'
  },
  {
    id: 'work-faucet',
    title: '수전교체',
    badge: '수전·수도 안심 보수',
    description: '싱크대, 세면대, 샤워기 등 부식되거나 물이 새는 수도꼭지를 최고급 국산 정품으로 정밀 교체하고 고장 난 욕실 도기 설비 및 앵글밸브까지 보수해 드립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    localName: 'faucet',
    target: '아파트, 빌라, 오피스텔, 상가 등 노후 수전 및 화장실 도기 교체가 필요한 모든 곳',
    equipment: '전문 배관 몽키 렌치, 첼라, 전용 조절대 스패너, 무독성 야마테이프',
    process: [
      '기존 노후 및 고착 수전의 급수 앵글 밸브 차단 및 조절대 완전 안전 분해',
      '고착된 연결구 나사선 스케일링 정돈 및 친환경 소독 처리',
      '최고급 국산 안심 정품 수전 조립 및 고밀도 테프론 테이프 이중 밀결 시공',
      '수도 계량기 개방 후 접합부 고압 정밀 누수 테스트 및 최종 토수량 검증 완료'
    ],
    tips: '★ 싱크대나 화장실 수전에서 아주 미세한 물방울이 떨어지는 것도 한 달이면 엄청난 수도 요금과 아래층 누수로 번질 수 있으니 즉시 조치를 권장합니다!'
  },
  {
    id: 'work-toilet',
    title: '세면대교체 & 변기교체',
    badge: '세면대·변기 완벽 교체 시공',
    description: '장난감이나 이물질로 막힌 양변기 역류 문제를 강력 석션과 관통기로 해결하고, 노후되거나 깨진 세면대와 변기를 세련된 명품 국산 도기로 새롭게 시공합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb5ca08f5f9?auto=format&fit=crop&w=800&q=80',
    localName: 'toilet',
    target: '이물질로 막힌 변기, 노후 세면대 교체, 양변기 고장 및 물탱크 부속 교체가 필요한 곳',
    equipment: '초고압 리지드 관통기, 강력 건습식 고출력 석션기, 내시경 카메라, 변기/세면대 전용 설치구',
    process: [
      '내시경 카메라로 배관 내부 및 오수관 초입 막힘의 원인 물질 정밀 선별 인식',
      '세면대 및 변기 손상 없는 정밀 철거 및 고착 시멘트/실리콘 수공 정교한 박리',
      '수평자를 가동해 오차 없는 완전 수평 고정과 최고급 항균 실리콘/백시멘트 마감',
      '노후 물탱크 필밸브 및 배수 폽업 트랩 전량 KS 국산 정품 교체 장착 및 통수 동작 테스트'
    ],
    tips: '★ 변기가 막혔을 때 뚫어뻥으로 무리하게 밀어 넣으면 이물질이 변기 S자 굴곡 깊숙이 박혀 변기를 뜯어내야 할 수 있습니다. 초기에 흡입 석션 장비로 뽑아내야 비용을 아낍니다!'
  },
  {
    id: 'work-thawing',
    title: '해빙 & 언수도녹임',
    badge: '겨울철 언수도·해빙 긴급출동',
    description: '한겨울 혹한으로 꽁꽁 얼어붙어 물이 나오지 않는 수도 계량기, 세탁실 급수관, 보일러 배관을 전문 해빙 스팀 장비로 안전하게 해빙합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    localName: 'thawing',
    target: '동파 및 한파로 얼어붙은 계량기, 단독주택/빌라 직수관 및 온수 배관, 보일러 순환관',
    equipment: '독일제 초고온 고압 스팀 해빙기, 산업용 고풍량 열풍기, 동결 배관 탐지 적외선 장비',
    process: [
      '수수 동결 지점 및 계량기 내부 파손 유무를 육안과 적외선 온도 탐지기로 신속 정밀 확인',
      '배관이나 계량기 크랙 위험을 최소화하기 위해 단계적 온도 상승 특수 초고온 스팀기 기동',
      '동결 부위에 직접 스팀 노즐을 삽입하거나 배관 피복 속 얼음을 서서히 안전 액화 유화 해빙',
      '해빙 완료 후 원활한 급수 확인 및 고성능 보온재 이중 피복 시공과 보온 열선 밀착 보완 마감'
    ],
    tips: '★ 겨울철 수도가 얼었을 때 토치나 헤어드라이어로 무리하게 가열하면 배관이 급격한 온도차로 파열(동파)될 수 있습니다. 반드시 전문 스팀 장비로 서서히 해빙해야 안전합니다!'
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
      alert('상담 신청을 위해 이름, 연락처, 서비스를 모두 선택해 주세요.');
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
    const props = { className: "w-7 h-7 text-[#0284c7]" };
    switch (iconName) {
      case 'Droplet': return <Droplet {...props} />;
      case 'Wrench': return <Wrench {...props} />;
      case 'Compass': return <Compass {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  // Find active diagnosis case
  const activeDiag = VIRTUAL_DIAGNOSIS.find(item => item.id === activeDiagId) || VIRTUAL_DIAGNOSIS[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans overflow-x-hidden antialiased selection:bg-sky-200/40">
      
      {/* 긴급 상단 바 (Emergency Top Bar) */}
      <div id="top-announcement-bar" className="bg-[#0369a1] text-white py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide flex justify-center items-center gap-2 z-50 relative">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
        <span>수도권 전 지역 긴급 출장 24시간 실시간 대기 중 — <strong>지앤지클린 종합설비·누수탐지</strong>!</span>
      </div>

      {/* 헤더 및 내비게이션 (Sticky Header) */}
      <header id="main-header" className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-sky-100 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-2 bg-[#e0f2fe] rounded-lg flex items-center justify-center border border-sky-200/45 shadow-sm">
              <Sparkles className="w-6 h-6 text-[#0284c7] animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <span className="font-display font-black text-lg sm:text-2xl text-[#0369a1] tracking-tight block">지앤지클린</span>
              <span className="text-[10px] sm:text-xs text-[#0284c7] tracking-wider font-semibold block -mt-1 uppercase">Premium Leak Detection & Plumbing Group</span>
            </div>
          </a>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#services" className="hover:text-[#0284c7] transition-colors">서비스 안내</a>
            <a href="#trust" className="hover:text-[#0284c7] transition-colors">신뢰 포인트</a>
            <a href="#diagnosis" className="hover:text-[#0284c7] transition-colors">스마트 자가진단</a>
            <a href="#reviews" className="hover:text-[#0284c7] transition-colors">고객 후기</a>
            <a href="#faq" className="hover:text-[#0284c7] transition-colors">자주 묻는 질문</a>
          </nav>

          {/* 상담전화 및 카톡 CTA 버튼 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href="https://open.kakao.com/o/sWmhpq8f"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#191919] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all"
              id="header-kakao-btn"
            >
              <span className="w-4 h-4 bg-[#191919] text-[#FEE500] rounded-tl rounded-tr rounded-br rounded-bl-[1px] flex items-center justify-center text-[8px] font-black leading-none">talk</span>
              <span className="hidden xs:inline font-bold">카톡상담</span>
            </a>
            <a 
              href="tel:010-2699-0484" 
              className="flex items-center gap-1.5 sm:gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md shadow-sky-600/10 hover:shadow-sky-600/30 active:scale-95 transition-all"
              id="header-call-btn"
            >
              <Phone className="w-4 h-4 fill-current text-sky-200" />
              <span className="hidden sm:inline">24시간 빠른 전화상담</span>
              <span className="sm:hidden font-mono">010-2699-0484</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section (상단 메인 화면 - Replicated Banner & Diagnosis Bento) */}
      <section id="hero" className="relative bg-[#f0f9ff] pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden border-b border-sky-100">
        {/* Background Decorative Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-sky-100/50 via-sky-50/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-10 right-10 w-[200px] h-[200px] bg-sky-100/50 rounded-full blur-2xl pointer-events-none -z-10"></div>
        <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] bg-sky-200/20 rounded-full blur-2xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Banner Container: Replicating the uploaded banner with high fidelity OR rendering the custom uploaded image */}
          {showCustomBanner && customBannerImage ? (
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_15px_50px_-15px_rgba(2,132,199,0.08)] border border-sky-100/80 relative transition-all group">
              <img 
                src={customBannerImage} 
                alt="지앤지클린 공식 배너" 
                className="w-full h-auto object-cover block"
                referrerPolicy="no-referrer"
              />
              <a 
                href="tel:010-2699-0484" 
                className="absolute inset-0 cursor-pointer flex items-end justify-center sm:justify-end p-4 sm:p-6 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
                title="터치하면 즉시 상담 전화 연결 (010-2699-0484)"
                id="uploaded-banner-click-overlay"
              >
                <span className="bg-sky-800 text-white font-black text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <Phone className="w-4 h-4 fill-current text-sky-300 animate-bounce" />
                  <span>터치하여 즉시 전화 상담 연결 (010-2699-0484)</span>
                </span>
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_15px_50px_-15px_rgba(2,132,199,0.08)] border border-sky-100/80 relative overflow-hidden">
              {/* Soft decorative background in the banner card */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-sky-50 opacity-90 -z-10"></div>
              {/* Water splashes representation */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_bottom_right,rgba(186,230,253,0.15),transparent_70%)] pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Friendly Plumber / Cleaner (approx. 3 cols) */}
                <div className="lg:col-span-3 flex flex-col items-center justify-center relative">
                  {/* Background water/circle glow for plumber */}
                  <div className="absolute w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-tr from-sky-200/30 to-sky-100/50 rounded-full blur-xl -z-10"></div>
                  <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full border-4 border-white shadow-lg overflow-hidden bg-sky-50">
                    <FallbackImage 
                      localName="profile_cleaner"
                      fallbackUrl="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80" 
                      alt="지앤지클린 마스터" 
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Floating badge for plumber */}
                  <div className="mt-4 bg-sky-800 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md tracking-wider flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '3s' }}>
                    <Sparkles className="w-3 h-3 text-sky-300" />
                    <span>지앤지클린 마스터 매니저</span>
                  </div>
                </div>

                {/* Center Column: Brand Title & CTA (approx. 5 cols) */}
                <div className="lg:col-span-5 text-center lg:text-left space-y-4 sm:space-y-6 flex flex-col items-center lg:items-start justify-center">
                  <div className="flex items-center gap-1.5 text-sky-700 font-extrabold text-sm sm:text-base tracking-tight">
                    <span className="text-xl">✨</span>
                    <span className="font-display italic">"정직하고 완벽한 첨단 누수탐지 & 종합설비 전문가!"</span>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black text-[#0369a1] tracking-tight leading-none drop-shadow-sm flex flex-col items-center lg:items-start gap-1">
                      <span>지앤지클린</span>
                    </h1>
                    
                    {/* Banner Sub Services Blue Bar */}
                    <div className="inline-block bg-[#0369a1] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-base font-black tracking-wide shadow-sm">
                      누수탐지 · 배관설비 · 하수구막힘 · 변기역류
                    </div>
                  </div>

                  {/* Main Interactive Call Banner Banner */}
                  <a 
                    href="tel:010-2699-0484" 
                    className="group w-full max-w-sm sm:max-w-md bg-white border-4 border-sky-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left"
                    id="banner-call-cta"
                  >
                    <div className="bg-[#0284c7] group-hover:bg-[#0369a1] transition-colors rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse">
                      <Phone className="w-5 h-5 sm:w-6 h-6 fill-current text-sky-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] sm:text-xs text-[#0284c7] font-black uppercase tracking-wider block mb-0.5 sm:mb-1">상담문의 (터치하면 즉시 연결)</span>
                      <span className="font-mono text-xl sm:text-2.5xl font-black text-[#0369a1] tracking-wide block leading-none">010-2699-0484</span>
                    </div>
                    <div className="bg-sky-50 text-sky-800 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                      <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
                    </div>
                  </a>

                  {/* Emergency status */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>서울·경기·인천 고성능 첨단 장비 설비팀 항시 대기 중, 당일 긴급 출동 가능</span>
                  </div>
                </div>

                {/* Right Column: 6 Service Cards List (approx. 4 cols) */}
                <div className="lg:col-span-4 space-y-2 w-full">
                  {[
                    { title: '누수탐지 & 누수공사', img: 'leak', fallback: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80' },
                    { title: '하수구막힘 & 하수구 고압세척', img: 'sewer', fallback: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80' },
                    { title: '싱크대막힘', img: 'sink', fallback: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80' },
                    { title: '수전교체', img: 'faucet', fallback: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
                    { title: '세면대교체 & 변기교체', img: 'toilet', fallback: 'https://images.unsplash.com/photo-1607472586893-edb5ca08f5f9?auto=format&fit=crop&w=400&q=80' },
                    { title: '해빙 & 언수도녹임', img: 'thawing', fallback: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      onClick={() => selectServiceAndScroll(item.title)}
                      className="group bg-white/95 hover:bg-sky-50/90 border border-gray-100 hover:border-sky-200 rounded-xl p-3 flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[4px]" />
                        </div>
                        <span className="font-bold text-gray-800 text-xs sm:text-sm tracking-tight group-hover:text-[#0369a1] line-clamp-1">{item.title}</span>
                      </div>
                      {/* Tiny thumbnail on the right, exactly like the uploaded banner */}
                      <div className="w-12 h-8 rounded-md overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <FallbackImage 
                          localName={item.img} 
                          fallbackUrl={item.fallback}
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
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-sky-100 grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
                {[
                  { label: '누수탐지', emoji: '🔍', icon: Wrench },
                  { label: '하수구막힘', emoji: '🌊', icon: ShieldCheck },
                  { label: '싱크대막힘', emoji: '🍽️', icon: Droplet },
                  { label: '수전교체', emoji: '🚰', icon: Sparkles },
                  { label: '세면대&변기', emoji: '🚽', icon: Compass },
                  { label: '언수도해빙', emoji: '🔥', icon: Flame },
                ].map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => selectServiceAndScroll(item.label)}
                    className="group flex flex-col items-center text-center cursor-pointer max-w-[120px]"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white hover:bg-sky-50 border border-gray-100 hover:border-sky-300 rounded-full flex items-center justify-center shadow-xs hover:shadow-md hover:scale-105 transition-all relative">
                      <span className="text-xl sm:text-2xl">{item.emoji}</span>
                      <div className="absolute -bottom-1 -right-1 bg-white border border-gray-50 rounded-full p-1 shadow-2xs">
                        <item.icon className="w-3 h-3 text-sky-800" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-600 group-hover:text-sky-950 mt-2 sm:mt-2.5 leading-tight tracking-tight break-keep">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Quick interactive diagnosis tool bento card, placed beautifully below the main banner */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="diagnosis">
            
            <div className="lg:col-span-4 bg-gradient-to-br from-[#0c4a6e] to-[#082f49] rounded-[2rem] p-6 sm:p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(2,132,199,0.3),transparent_70%)] pointer-events-none"></div>
              <div className="space-y-4 relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-900/60 border border-sky-700/50 rounded-full text-xs font-bold text-sky-300">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>스마트 오염 자가진단</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  상담 신청하기 전, <br />
                  <span className="text-sky-300">오염도 자가 진단 가이드</span>
                </h3>
                <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed font-light">
                  현재 우리 집이나 작업 공간에서 겪고 계신 핵심 오염 증상을 아래 버튼 중에서 터치해 보세요! 지앤지클린 마스터들이 현장에서 다져온 해결 비법과 예상 공법, 자가 해결 가능 여부를 직관적으로 보여드립니다.
                </p>
              </div>
              <div className="pt-6 sm:pt-8 border-t border-sky-800/40 mt-4 flex items-center justify-between text-xs text-sky-300/80 font-semibold">
                <span>⚡ 10초 무상 피드백 가동</span>
                <span>누적 진단 케이스 2,150건+</span>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-[2rem] p-6 sm:p-8 shadow-md border border-gray-100 flex flex-col justify-between relative">
              {/* Active Support Status Tag */}
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-950 font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                <span>매니저 배정 가능</span>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-50 pb-3">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 fill-current" />
                    <span>증상별 주요 원인과 안심 클리닝 가이드</span>
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
                          ? 'bg-sky-50 border-[#0284c7] text-sky-950 shadow-sm'
                          : 'bg-gray-50 hover:bg-gray-100 border-transparent text-gray-600'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeDiagId === item.id ? 'bg-[#0284c7]' : 'bg-gray-300'}`} />
                        <span className="text-[9px] text-[#0284c7] font-extrabold">정밀진단</span>
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
                    className="bg-[#f0f9ff]/30 rounded-2xl p-4 border border-sky-100 space-y-3 text-xs sm:text-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="inline-block bg-[#e0f2fe] text-[#0284c7] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">예상 주요원인</span>
                        <p className="font-black text-gray-900 mt-1 text-sm">{activeDiag.cause}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-600">
                        <div>
                          <span className="text-gray-400 font-bold block">권장 장비 및 솔루션</span>
                          <span className="font-bold text-sky-800 mt-0.5 block">{activeDiag.equipment}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold block">평균 케어 시간</span>
                          <span className="font-bold text-sky-800 mt-0.5 block">{activeDiag.timeRequired}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                      <span className="text-[#0284c7] font-black block mb-0.5">💡 전문 해결 방안 및 예방법</span>
                      <p className="text-gray-600 leading-relaxed text-[11px] sm:text-xs">{activeDiag.solution}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => selectServiceAndScroll(activeDiag.symptom)}
                  className="w-full bg-[#0369a1] hover:bg-black text-white py-3.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span>이 증상 기준으로 맞춤 무료 안심 상담 신청하기</span>
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
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#0284c7] font-mono">100%</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">현장 동반 검수 책임 완료제</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#0284c7] font-mono">친환경</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">안전성 1등급 수입 세제 사용</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#0284c7] font-mono">1억</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">영업배상책임보험 가입 완료</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-4xl font-extrabold text-[#0284c7] font-mono">당일AS</span>
              <span className="block text-xs sm:text-sm font-semibold text-gray-500 mt-1">신속한 보강 예약 접수제</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Factors Section (신뢰 요소 3가지) */}
      <section id="trust" className="py-16 sm:py-24 bg-gradient-to-b from-white to-[#f0f9ff]/30 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
            <h2 className="text-xs sm:text-sm font-bold text-[#0284c7] uppercase tracking-widest">Trust & Quality</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              바가지 요금 걱정 끝! <br className="sm:hidden" />
              <span className="text-[#0284c7]">지앤지클린의 3대 정직 신뢰 약속</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              인터넷에 수많은 광고 속에서 정말 믿을 수 있는 양심 업체를 고르기 어려우셨죠? 지앤지클린은 프리미엄 장비와 전용 약품만을 아낌없이 투자하여 오직 투명한 가치와 완벽한 청결함으로 승부합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Trust Element 1: Fair Price */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl hover:border-sky-200/40 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#e0f2fe] rounded-2xl flex items-center justify-center text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white transition-all">
                  <Coins className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{TRUST_FACTORS[0].title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{TRUST_FACTORS[0].description}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 bg-[#e0f2fe]/50 -mx-8 -mb-8 p-5 rounded-b-3xl text-xs sm:text-sm font-bold text-[#0284c7] flex items-center gap-1.5">
                <Check className="w-5 h-5" />
                <span>{TRUST_FACTORS[0].highlightText}</span>
              </div>
            </div>

            {/* Trust Element 2: Before & After (Visual Proof) */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl hover:border-sky-200/40 transition-all flex flex-col justify-between group lg:col-span-1">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#e0f2fe] rounded-2xl flex items-center justify-center text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white transition-all">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{TRUST_FACTORS[1].title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{TRUST_FACTORS[1].description}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 bg-[#e0f2fe]/50 -mx-8 -mb-8 p-5 rounded-b-3xl text-xs sm:text-sm font-bold text-[#0284c7] flex items-center gap-1.5">
                <Check className="w-5 h-5" />
                <span>{TRUST_FACTORS[1].highlightText}</span>
              </div>
            </div>

            {/* Trust Element 3: Advanced Equipments */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md hover:shadow-xl hover:border-sky-200/40 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#e0f2fe] rounded-2xl flex items-center justify-center text-[#0284c7] group-hover:bg-[#0284c7] group-hover:text-white transition-all">
                  <Wind className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{TRUST_FACTORS[2].title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{TRUST_FACTORS[2].description}</p>
                
                {/* Equipment Icons list */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-[#fcfdfc] border border-gray-100 rounded-xl p-2.5 text-center">
                    <Tv className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] text-gray-500 font-bold block">고온 스팀기</span>
                  </div>
                  <div className="bg-[#fcfdfc] border border-gray-100 rounded-xl p-2.5 text-center">
                    <Search className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] text-gray-500 font-bold block">산업용 버큠</span>
                  </div>
                  <div className="bg-[#fcfdfc] border border-gray-100 rounded-xl p-2.5 text-center">
                    <Camera className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                    <span className="text-[10px] text-gray-500 font-bold block">오존 살균기</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 bg-[#e0f2fe]/50 -mx-8 -mb-8 p-5 rounded-b-3xl text-xs sm:text-sm font-bold text-[#0284c7] flex items-center gap-1.5">
                <Check className="w-5 h-5" />
                <span>{TRUST_FACTORS[2].highlightText}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 우리가 하는 공사의 내용 (실제 시공 사진 및 상세 설명) */}
      <section id="work-gallery" className="py-16 sm:py-24 bg-sky-50/10 border-t border-gray-100 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-20">
            <span className="text-xs sm:text-sm font-bold text-[#0284c7] uppercase tracking-widest bg-[#e0f2fe] px-3 py-1.5 rounded-full inline-block">
              📸 실제 안심 시공 현장 갤러리
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              지앤지클린의 <span className="text-[#0284c7]">6대 핵심 안심 설비 시공</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              고객님의 소중한 주거 및 상업 공간의 배관 고장과 누수를 어떻게 해결하는지 그 과정을 한 눈에 정직하게 공개합니다. 각 카드를 눌러 저희만의 <strong>숙련된 디테일과 단계별 안심 시공과정</strong>을 직접 체크해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {CONSTRUCTION_WORKS.map((work, index) => {
              const isExpanded = expandedWorkId === work.id;
              return (
                <motion.div
                  key={work.id}
                  layout
                  className="bg-white rounded-3xl border border-gray-100 hover:border-sky-200/60 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  id={`work-card-${work.id}`}
                >
                  {/* Image Header with dynamic layout */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden group">
                    <FallbackImage
                      localName={work.localName}
                      fallbackUrl={work.imageUrl}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Badge top-left */}
                    <div className="absolute top-4 left-4 bg-[#0284c7] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-ping"></span>
                      <span>실제 시공 사례</span>
                    </div>

                    {/* Service Index top-right */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-[#0284c7] w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md">
                      0{index + 1}
                    </div>

                    {/* Bottom gradient overlay with main target */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                      <span className="text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-sky-300 shrink-0" />
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
                        <span className="bg-[#e0f2fe] text-[#0284c7] text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-lg">
                          {work.badge}
                        </span>
                      </div>

                      {/* Main easy-to-understand Description */}
                      <p className="text-sm text-gray-600 leading-relaxed font-normal">
                        {work.description}
                      </p>

                      {/* Equipment Tag */}
                      <div className="bg-white border border-gray-100 p-3 rounded-xl space-y-1">
                        <span className="text-[10px] font-black text-[#0284c7] uppercase tracking-wider block">
                          🛠️ 투입 전용 친환경 장비·약품
                        </span>
                        <p className="text-xs text-gray-700 font-bold leading-relaxed flex items-center gap-1.5">
                          {work.equipment}
                        </p>
                      </div>

                      {/* Interactive Accordion for 4-Step Process */}
                      <div className="pt-1">
                        <button
                          onClick={() => setExpandedWorkId(isExpanded ? null : work.id)}
                          className="w-full flex items-center justify-between bg-sky-50/50 hover:bg-sky-100 text-[#0369a1] py-3 px-4 rounded-xl font-extrabold text-xs transition-all border border-sky-200/20 hover:border-sky-200/50"
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#0284c7] animate-pulse" />
                            <span>상세 시공 과정 ({work.process.length}단계) 보기</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#0284c7]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#0284c7]" />
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
                                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-sky-200/40">
                                  {work.process.map((step, sIndex) => (
                                    <div key={sIndex} className="flex gap-3 relative z-10">
                                      <div className="w-6 h-6 bg-[#0284c7] text-white rounded-full flex items-center justify-center font-black text-[11px] shrink-0 shadow-sm">
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
                        className="bg-sky-800 hover:bg-sky-950 text-white py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-sm active:scale-98"
                      >
                        <span>간편 견적신청</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href="https://open.kakao.com/o/sWmhpq8f"
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
      <section id="services" className="py-16 sm:py-24 bg-sky-50/40 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-18">
            <h2 className="text-xs sm:text-sm font-bold text-[#0284c7] uppercase tracking-widest">Our Professional Services</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              어디가 어떻게 더럽든, <br className="sm:hidden" />
              <span className="text-[#0284c7]">지앤지클린이 새 배관처럼 완벽하게 살려냅니다</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              임시방편으로 대충 표면만 때우지 않습니다. 노후 배관의 정밀 진단부터 특수 초고압 세척, 미세 누수 탐지까지 첨단 탐지 장비와 국산 프리미엄 정품 자재만을 아낌없이 투자하여 깊고 보이지 않는 배관 속 고질적인 문제까지 완벽하게 해결합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-sky-100 hover:border-sky-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header & Content */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-[#e0f2fe] rounded-xl flex items-center justify-center">
                      {renderServiceIcon(service.iconName)}
                    </div>
                    {service.badge && (
                      <span className="bg-[#0284c7] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
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
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-[#fcfdfd] p-3 rounded-lg border border-gray-50">{service.fullDesc}</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-black text-[#0284c7] uppercase tracking-wider block">주요 핵심 시공 기준</span>
                    <ul className="space-y-1.5">
                      {service.keyPoints.map((point, pIndex) => (
                        <li key={pIndex} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#0284c7] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Banner */}
                <div className="bg-[#f0f9ff]/50 border-t border-gray-100 p-5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">안심 견적 안내</span>
                    <span className="font-bold text-gray-700 mt-0.5 block">{service.averageCostGuide}</span>
                  </div>
                  <button
                    onClick={() => selectServiceAndScroll(service.title)}
                    className="flex items-center gap-1 bg-white hover:bg-[#0284c7] text-[#0284c7] hover:text-white border border-sky-200 hover:border-[#0284c7] px-3 py-1.5 rounded-lg font-bold transition-all shadow-xs"
                  >
                    <span>견적 신청</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-[#0369a1] text-white px-8 py-5 rounded-2xl shadow-md">
              <div className="text-center sm:text-left">
                <span className="text-xs text-sky-200 font-bold block mb-0.5">상단 분류에 기술되지 않은 아파트 배관 신설 및 상가 대형 고압세척도 가능합니다.</span>
                <span className="text-sm sm:text-base font-bold">우리 공간의 수도 배관 설비 및 누수 상태가 모호하신가요?</span>
              </div>
              <a 
                href="tel:010-2699-0484" 
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shadow-sm"
              >
                📞 다이렉트 유선 상담받기
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
                <span className="text-xs sm:text-sm font-bold text-[#0284c7] uppercase tracking-widest">Simple & Fast Quote</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  단, 10초 만에 끝나는 <br />
                  <span className="text-[#0284c7]">친절 안심 간편 상담 신청</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  이사 스케줄이나 준공 일정 조율로 곤란하고 마음 급하신 고객님들의 사정을 적극 이해하기에 복잡한 인적사항이나 불필요한 인증 요구 절차를 단숨에 생략했습니다. <br /><br />
                  이름, 연락처, 필요한 청소 서비스 유형만 간단히 남겨주시면 대표 매니저가 직접 신속하게 예상 실견적가와 최적 출장 스케줄을 명확하게 일러드립니다.
                </p>
              </div>

              {/* Core Counseling Advantages */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-[#f0f9ff]/50 p-4 rounded-xl border border-sky-100">
                  <CheckCircle2 className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">출장 추가 경비 일체 요구 없음</span>
                    <span className="text-xs text-gray-500 mt-0.5 block">수도권(서울, 경기, 인천) 전역 별도 추가 경비 발생 없이 정직한 정액 견적 보증</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-[#f0f9ff]/50 p-4 rounded-xl border border-sky-100">
                  <CheckCircle2 className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">100% 현장 동반 최종 검수제</span>
                    <span className="text-xs text-gray-500 mt-0.5 block">시공 마감 직전 직접 꼼꼼히 검수한 뒤 완벽히 만족하시고 서명할 때만 최종 완료</span>
                  </div>
                </div>
              </div>

              {/* Reassuring text */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-[#e0f2fe] rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-[#0284c7]" />
                </div>
                <span className="text-xs text-gray-500 font-medium leading-relaxed">
                  남겨주신 소중한 상담 기재 정보는 원활한 견적 회신 및 상담 완료 즉시 성실하게 파기 및 암호화 조치되오니 편하게 접수하셔도 안심입니다.
                </span>
              </div>
            </div>

            {/* Quick Quote Right Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#f0f9ff]/40 rounded-3xl p-6 sm:p-10 border border-sky-200/30 shadow-xl shadow-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/20 rounded-full blur-2xl pointer-events-none"></div>

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
                        <label className="text-xs font-black text-sky-900 block" htmlFor="form-service">
                          01. 어떤 서비스가 필요하신가요? <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="form-service"
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-600/20 rounded-xl px-4 py-3.5 text-sm sm:text-base font-bold text-gray-800 transition-all outline-none"
                        >
                          <option value="">-- 원하시는 서비스 유형을 선택해 주세요 --</option>
                          <option value="누수탐지 & 누수공사">누수탐지 & 누수공사 (주파수 청음식·가스 추적 첨단 탐지)</option>
                          <option value="하수구막힘 & 하수구 고압세척">하수구막힘 & 하수구 고압세척 (배관 내시경 정밀 진단 및 고압세척 완파)</option>
                          <option value="싱크대막힘">싱크대막힘 (위생 홈통 S트랩 교체 및 악취·막힘 박멸)</option>
                          <option value="수전교체">수전교체 (노후 싱크대·세면대·욕실 수전 완벽 교체)</option>
                          <option value="세면대교체 & 변기교체">세면대교체 & 변기교체 (변기 막힘·역류 해결 및 도기 완벽 신설)</option>
                          <option value="해빙 & 언수도녹임">해빙 & 언수도녹임 (동결 배관 초고온 스팀 긴급 해빙 및 예방 보온)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-sky-900 block" htmlFor="form-name">
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
                            className="w-full bg-white border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-600/20 rounded-xl px-4 py-3.5 text-sm transition-all outline-none"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-sky-900 block" htmlFor="form-phone">
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
                            className="w-full bg-white border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-600/20 rounded-xl px-4 py-3.5 text-sm tracking-wider font-mono transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-sky-900 block" htmlFor="form-urgency">
                          04. 희망 예약 일정을 선택해 주세요 <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="form-urgency"
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-white border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-600/20 rounded-xl px-4 py-3.5 text-sm transition-all outline-none"
                        >
                          <option value="🚨 당일 비상 출동 희망">🚨 당일 긴급 출동 희망 (예상치 못한 가구 오염 등 시급함)</option>
                          <option value="🕒 상호 일정 예약 조율">🕒 상호 편한 일정 예약 조율 (이사/인테리어 일정에 맞춤)</option>
                          <option value="💬 단순 예상 실견적가 문의">💬 단순 예상 견적 문의 (유선 또는 문자로 단가 확인)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-sky-900 block" htmlFor="form-notes">
                          05. 추가 공간 정보 및 요청사항 (선택사항)
                        </label>
                        <textarea
                          id="form-notes"
                          name="notes"
                          placeholder="예: 아랫집 화장실 천장에서 물이 떨어지고 있어요. 미세 누수 탐지 및 공사 견적과 조율 연락 바랍니다."
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full bg-white border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-600/20 rounded-xl px-4 py-3.5 text-sm transition-all outline-none resize-none"
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
                            className="w-4.5 h-4.5 text-[#0284c7] bg-white border-gray-300 rounded-md focus:ring-2 focus:ring-sky-600/20 mt-0.5"
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
                          className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white py-4 sm:py-4.5 rounded-xl font-extrabold text-base sm:text-lg transition-all shadow-md shadow-sky-600/10 hover:shadow-sky-600/30 flex items-center justify-center gap-2"
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
                              <span>10초 초고속 안심 상담 신청</span>
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-gray-400 text-center mt-2.5">
                          접수 즉시 전문가의 예상 시공 금액 안내를 무료 회신해 드립니다.
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
                      <div className="w-20 h-20 bg-[#e0f2fe] rounded-full flex items-center justify-center mx-auto text-[#0284c7] shadow-sm">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[#0284c7] font-black text-xs uppercase tracking-wider block">INQUIRY COMPLETED</span>
                        <h3 className="text-2xl font-black text-gray-900">{formData.name} 고객님, 상담 접수 완료!</h3>
                        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                          지앤지클린 프리미엄 케어를 신청해 주셔서 감사드립니다. 선택하신 <strong className="text-[#0284c7]">[{formData.service}]</strong> 분야 전담 매니저가 지정 완료되었습니다. <br />
                          남겨주신 번호로 5분 이내에 친절히 직접 맞춤 전화를 드립니다.
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-4 max-w-sm mx-auto border border-gray-100 text-sm">
                        <div className="flex justify-between items-center text-xs text-gray-400 pb-2 border-b border-gray-50">
                          <span>접수번호: GG-{Math.floor(Math.random() * 90000) + 10000}</span>
                          <span>{new Date().toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="py-2.5 text-left space-y-1.5 font-semibold text-gray-700">
                          <div>연락처: <span className="font-mono text-[#0284c7]">{formData.phone}</span></div>
                          <div>희망분류: <span className="text-sky-600">{formData.service}</span></div>
                          {formData.notes && (
                            <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 font-normal">
                              <span className="font-bold text-gray-700 block">공간 특이사항:</span>
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
                          href="tel:010-2699-0484"
                          className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-1 shadow-sm"
                        >
                          <span>📞 즉시 직접 전화 연결</span>
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
      <section id="reviews" className="py-16 sm:py-24 bg-gradient-to-b from-white to-sky-50/50 border-t border-gray-50 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-18">
            <h2 className="text-xs sm:text-sm font-bold text-[#0284c7] uppercase tracking-widest">Customer Testimonials</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              실제 시공 받으신 <br className="sm:hidden" />
              <span className="text-[#0284c7]">동네 이웃들의 생생한 친필 평판</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              지앤지클린은 대표 매니저 이하 전문 기술진들이 정성을 담아 구슬땀 흘려 시공합니다. 억지로 작성하지 않은 고객님들의 고마운 칭찬 메시지만 투명히 엄선했습니다.
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
                      <div className="w-11 h-11 bg-[#e0f2fe] rounded-full flex items-center justify-center font-bold text-[#0284c7] text-base shadow-sm">
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
                    <span className="inline-block bg-[#e0f2fe] text-[#0284c7] text-[10px] font-extrabold px-2 py-0.5 rounded-md mb-2">
                      시공 분야: {review.serviceType}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal italic">
                      "{review.content}"
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-[#0284c7]" />
                    <span>실제 동반 안심 검수완료 확인서 교부</span>
                  </span>
                  <span className="font-bold text-[#0284c7] flex items-center gap-1">
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
            <h2 className="text-xs sm:text-sm font-bold text-[#0284c7] uppercase tracking-widest">Frequently Asked Questions</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              무엇이든 여쭤보세요! <br className="sm:hidden" />
              <span className="text-[#0284c7]">공사 의뢰 전 속 시원한 비밀 의문 해결</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              비용 걱정, AS 사후 보증 범위, 가구 파손 대물 안심 보험 적용 등 가장 빈번하게 문의주시는 사항들에 대해 거짓 없이 설명해 드립니다.
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
                    isOpen ? 'border-[#0284c7] shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex justify-between items-center gap-4 text-sm sm:text-base font-bold text-gray-900 focus:outline-none"
                  >
                    <span className="flex items-start gap-2.5">
                      <span className="font-display font-black text-[#0284c7] text-lg">Q.</span>
                      <span>{faq.question}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#0284c7] shrink-0" />
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
                        <div className="p-5 sm:p-6 pt-0 border-t border-gray-100 bg-sky-50/10 rounded-b-2xl">
                          <div className="flex gap-2.5 items-start text-xs sm:text-sm text-gray-600 leading-relaxed">
                            <span className="font-display font-black text-amber-500 text-lg leading-none mt-0.5">A.</span>
                            <div className="space-y-2">
                              <p>{faq.answer}</p>
                              {faq.id === 'faq-3' && (
                                <div className="bg-[#e0f2fe]/50 border border-sky-200/30 p-3 rounded-lg text-xs font-medium text-sky-950 mt-2 flex items-start gap-1.5">
                                  <Info className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                                  <span>지앤지클린은 1억 상당의 영업배상책임보험 가입은 물론, 안전이 검증된 최고급 자재와 전문 장비만을 사용하여 고객님의 재산을 완벽히 보호하며 시공합니다.</span>
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

          <div className="mt-10 bg-gradient-to-r from-[#e0f2fe] to-sky-100/40 p-6 sm:p-8 rounded-3xl border border-sky-200/40 text-center space-y-4">
            <p className="text-sm font-bold text-gray-900 leading-relaxed">
              기타 단가 및 평당 상세 단가 조율, 주말 및 야간 긴급 일정 등 <br className="hidden sm:block" />
              모든 사항에 대해 <strong>24시간 100% 무료 직접 전담 유선 상담</strong>을 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <a
                href="tel:010-2699-0484"
                className="w-full sm:w-auto bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 rounded-xl font-extrabold text-sm sm:text-base shadow-sm flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>010-2699-0484 직접 전화 걸기</span>
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
                href="https://open.kakao.com/o/sWmhpq8f"
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
      <footer className="bg-[#0f172a] text-gray-300 pt-16 pb-8 border-t border-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-gray-800 pb-12 mb-8">
            
            {/* Footer Left: Brand info */}
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#0c4a6e] rounded-lg">
                  <Sparkles className="w-5 h-5 text-sky-300" />
                </div>
                <span className="font-display font-black text-xl text-white tracking-tight">지앤지클린</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
                지앤지클린은 수도권 전 지역을 담당하는 프리미엄 첨단 누수탐지 및 종합 배관 설비 전문 기술그룹입니다. 과잉 과다 요금 요구 및 부실 공사 없는 투명한 가치 실현을 성실히 약속드립니다.
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-xs font-bold text-red-400">부재시 간편 상담 신청을 남겨주시면 대표 매니저가 5분 내로 즉각 연락 드립니다.</span>
              </div>
            </div>

            {/* Footer Middle: Core Services list */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">주요 긴급 서비스</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400 font-medium">
                <li><a href="#services" className="hover:text-white transition-colors">1. 누수탐지 & 누수공사</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">2. 하수구막힘 & 하수구 고압세척</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">3. 싱크대막힘</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">4. 수전교체</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">5. 세면대교체 & 변기교체</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">6. 해빙 & 언수도녹임</a></li>
              </ul>
            </div>

            {/* Footer Right: Direct contact information */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">상담 및 업무 정보</h4>
              <div className="space-y-3">
                <a 
                  href="tel:010-2699-0484" 
                  className="block bg-[#0c4a6e] hover:bg-[#0284c7] p-4 rounded-xl border border-[#0284c7]/30 transition-all group"
                >
                  <span className="text-[10px] text-sky-300 font-extrabold block">24시간 연중무휴 상담접수</span>
                  <span className="text-lg sm:text-xl font-black text-white font-mono block mt-1 group-hover:text-amber-400 transition-colors">
                    010-2699-0484
                  </span>
                </a>
                <div className="text-xs text-gray-400 space-y-1 font-medium">
                  <div>근무 일자: 연중무휴 (토요일, 일요일, 새벽 긴급 수도 배관 누수 동파 대응 대기)</div>
                  <div>출장 권역: 서울 전 지역, 인천 광역시, 경기권 전역 (수도권 전 지역 보증)</div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright and Legal disclaimer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-medium text-center sm:text-left">
            <div className="space-y-1">
              <div>상호: 주식회사 지앤지클린 | 대표자: 박중현</div>
              <div>사업자등록번호: 466-86-02876 (종합 설비 및 누수공사 정식 등록) | 대표전화: 010-2699-0484</div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-1.5">
              <p>© 2026 지앤지클린. All Rights Reserved. Designed for high conversion.</p>
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="inline-flex items-center gap-1 text-[#0284c7] hover:text-[#0369a1] hover:underline cursor-pointer font-black text-xs transition-colors"
              >
                <Settings className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>🔧 관리자 모드 (구글 시트 연동)</span>
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
          className="flex-1 bg-sky-50 border border-sky-200 text-sky-950 py-3.5 rounded-xl text-center font-extrabold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Calendar className="w-4 h-4 text-[#0284c7]" />
          <span>견적 문자접수</span>
        </a>
        <a
          href="tel:010-2699-0484"
          className="flex-[2] bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white py-3.5 rounded-xl text-center font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-sky-600/20 animate-pulse"
          style={{ animationDuration: '3s' }}
        >
          <Phone className="w-5 h-5 fill-current text-sky-100" />
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
          href="https://open.kakao.com/o/sWmhpq8f"
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

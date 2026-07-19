/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: 'Droplet' | 'Wrench' | 'Compass' | 'Sparkles' | 'Flame' | 'ShieldCheck';
  keyPoints: string[];
  badge?: string;
  averageCostGuide: string;
}

export interface TrustFactorItem {
  id: string;
  title: string;
  description: string;
  highlightText: string;
}

export interface DiagnosisCase {
  id: string;
  symptom: string;
  description: string;
  cause: string;
  solution: string;
  equipment: string;
  timeRequired: string;
  iconName: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  serviceType: string;
  content: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'leak-detection',
    title: '누수탐지 & 누수공사',
    shortDesc: '물 새는 정확한 위치를 찾아내고 꼼꼼하게 보수합니다.',
    fullDesc: '첨단 청음식 및 가스식 누수 탐지 장비를 활용하여 눈에 보이지 않는 미세한 배관 파손 부위까지 벽이나 바닥을 함부로 허물지 않고 100% 정밀 포착합니다. 노후관 교체부터 아래층 천장 피해보상 및 일상생활배상책임보험 서류 발급까지 완벽히 대행해 드립니다.',
    iconName: 'Droplet',
    keyPoints: [
      '첨단 청음식·가스 탐지기로 미세 누수 100% 탐지',
      '불필요한 바닥 철거 없는 원포인트 정밀 공사',
      '보험 청구용 전문 기술 진단서 및 사진 무료 지원'
    ],
    badge: '인기 서비스',
    averageCostGuide: '정밀 탐지 후 작업 전 견적 공개'
  },
  {
    id: 'drain-cleaning',
    title: '하수구막힘 & 하수구고압세척',
    shortDesc: '꽉 막힌 하수구를 고압 물줄기로 새 배관처럼 청소합니다.',
    fullDesc: '배관 내부에 돌처럼 단단히 굳어버린 유기물과 기름 슬러지를 초고압 분사 세척기로 완벽히 부수고 씻어냅니다. 하수구 내부를 내시경 카메라로 직접 보며 배관 본래의 넓고 깨끗한 단면을 복구하여 재발 없는 원천적인 해결책을 제시합니다.',
    iconName: 'Wrench',
    keyPoints: [
      '배관 내부 기름 슬러지 100% 스케일링 제거',
      '고성능 산업용 고압세척 장비 가동',
      '배관 내시경을 통한 세척 전/후 시각적 검증'
    ],
    badge: '강력 추천',
    averageCostGuide: '막힘 상태 확인 후 비용 안내'
  },
  {
    id: 'sink-toilet',
    title: '싱크대막힘 & 변기막힘',
    shortDesc: '답답하게 꽉 막힌 싱크대와 화장실 변기를 뚫어드립니다.',
    fullDesc: '일상 생활에서 흔히 발생하는 음식물 찌꺼기, 생활 이물질, 물건 낙하로 막힌 싱크대와 양변기를 배관 손상 없이 부드럽고 안전하게 뚫어냅니다. 강력한 관통기와 강력 석션 장비로 고여 있는 물과 이물질을 신속하고 위생적으로 회수하여 해결합니다.',
    iconName: 'Compass',
    keyPoints: [
      '양변기 도기 손상 없는 안전 관통 공법',
      '싱크대 악취 및 기름 찌꺼기 완벽 흡입(석션)',
      '재발 방지를 위한 원인 이물질 회수 및 통수 테스트'
    ],
    averageCostGuide: '단순 막힘부터 확실한 통수 보장'
  },
  {
    id: 'replacement',
    title: '수전교체 & 변기·세면대교체',
    shortDesc: '낡은 수도꼭지와 화장실 도기류를 깔끔하게 교체합니다.',
    fullDesc: '물방울이 뚝뚝 떨어지는 주방, 욕실 싱크대 수도꼭지부터 수명이 다해 틈새 누수가 발생하는 양변기, 세면대를 최신 트렌드의 고품질 자재로 완벽하게 신규 교체해 드립니다. 꼼꼼한 실리콘 실링과 경사도 세팅으로 물고임 없는 쾌적한 화장실을 만듭니다.',
    iconName: 'Sparkles',
    keyPoints: [
      '국산 최고급 고품질 수전 자재 엄선 사용',
      '흔들림 없고 견고한 욕실 도기 바이오 실링 작업',
      '폐수전 및 폐변기 무료 회수 및 폐기물 완벽 처리'
    ],
    averageCostGuide: '제품 선호도 및 규격별 견적 안내'
  },
  {
    id: 'thawing',
    title: '해빙 & 언수도녹임',
    shortDesc: '겨울철 한파로 꽁꽁 얼어붙은 수도관을 안전하게 녹입니다.',
    fullDesc: '갑작스러운 혹한으로 보일러 분배기나 계량기, 수도관이 얼어 물이 나오지 않을 때 배관이 열팽창으로 터지지 않도록 고온 고압의 특수 스팀 장비를 주입하여 내부 얼음을 녹여냅니다. 얼기 쉬운 부위의 선제적 보온재 래핑 서비스도 함께 제공합니다.',
    iconName: 'Flame',
    keyPoints: [
      '화재 위험이 없는 100% 고열 스팀 전문 해빙',
      '동파로 이어진 손상된 배관 즉시 절단 후 보수 가능',
      '재동파 예방을 위한 단열재 보완 시공 무상 지원'
    ],
    badge: '겨울철 한정',
    averageCostGuide: '동결 범위 및 위치별 견적 안내'
  },
  {
    id: 'general-plumbing',
    title: '기타 모든 종합 설비공사',
    shortDesc: '배관 신설, 방수 등 건물 내부의 모든 설비 문제를 해결합니다.',
    fullDesc: '상하수도 배관 신설 및 이설 공사, 보일러 분배기 물샘 수리, 발코니 및 옥상 방수 공사, 노후 주택 배관 리모델링 등 크고 작은 모든 설비 영역을 장인 정신을 갖고 정직하게 작업합니다. 어떤 난해한 구조든 원인을 규명하여 신속 해결합니다.',
    iconName: 'ShieldCheck',
    keyPoints: [
      '종합설비 경력 15년 이상의 숙련 기술자 직접 시공',
      '소규모 수리부터 전체 관로 리모델링 공사 대행',
      '사후 관리가 보장되는 하자보수 계약서 작성 가능'
    ],
    averageCostGuide: '상세 진단 후 맞춤형 비용 산출'
  }
];

export const TRUST_FACTORS: TrustFactorItem[] = [
  {
    id: 'fair-price',
    title: '투명하고 정직한 비용 안내',
    description: '공사 시작 전 원인과 범위를 정밀 진단하여 최종 공사 비용을 먼저 공개합니다. 고객님의 사전 동의 없이는 무단으로 비용을 추가하거나 필요치 않은 과잉 공사를 유도하지 않으며, 만약 해결하지 못할 시 탐지비를 포함한 어떤 비용도 청구하지 않습니다.',
    highlightText: '과잉 청구 0건, 원인 해결 불가능 시 비용 0원 원칙!'
  },
  {
    id: 'before-after',
    title: '눈으로 직접 확인하는 작업 전/후',
    description: '작업 과정의 투명성을 위해 하수구 내부 내시경 영상, 제거된 이물질 덩어리, 새롭게 용접/연결된 배관 상태 등을 실시간으로 촬영하여 보여드립니다. 겉으로만 대충 메우는 눈가림 시공이 아닌 배관 본연의 통수 성능 복원을 정직하게 검증합니다.',
    highlightText: '전 과정 스마트폰 촬영 공유 및 모니터링 확인 가능'
  },
  {
    id: 'high-tech',
    title: '첨단 디지털 정밀 장비 보유',
    description: '청력에만 의존하는 아날로그식 탐지를 넘어 열화상 카메라(벽 속 온수배관 미세 미열 감지), 독일제 고화질 배관 내시경(하수구 깊은 곳 이물질 유무 확인), 가스식 누수탐지기(수소 혼합가스 추적) 등 대학병원급 첨단 과학 장비로 시공 오차를 줄입니다.',
    highlightText: '“최소한만 깨서 고칩니다” — 불필요한 바닥 굴착 최소화!'
  }
];

export const VIRTUAL_DIAGNOSIS: DiagnosisCase[] = [
  {
    id: 'diag-ceiling',
    symptom: '아래층 천장 벽지가 서서히 젖어갑니다',
    description: '가장 대표적인 배관 누수 징후입니다. 온수 또는 냉수 직수 배관의 균열이나 미세 실금이 원인인 경우가 많습니다.',
    cause: '온수/직수 관로 미세 파손 또는 방수층 탈락',
    solution: '가스 주입식 정밀 탐지 후 해당 부위 10cm 크기 타공 후 신주 엘보 교체 및 미장 복구',
    equipment: '수소 가스식 탐지기, 청음식 탐지기',
    timeRequired: '평균 2 ~ 3시간',
    iconName: 'Home'
  },
  {
    id: 'diag-drain-reverse',
    symptom: '싱크대나 하수구 밑에서 물이 역류합니다',
    description: '물이 전혀 내려가지 않고 아래 배수관 틈새로 더러운 물과 냄새가 거꾸로 솟구치는 증상입니다.',
    cause: '동물성 기름 슬러지가 누적되어 배관 구멍을 꽉 막음',
    solution: '내시경 배관 카메라로 내부 구역 확인 후 고성능 석션 회수 및 고압 고열 온수 배관 세척',
    equipment: '초고화질 배관 내시경, 플렉스 샤프트 스케일러',
    timeRequired: '평균 1 ~ 1.5시간',
    iconName: 'RefreshCw'
  },
  {
    id: 'diag-toilet-stuck',
    symptom: '변기에 물건이 빠져 물이 내려가지 않아요',
    description: '플라스틱 화장품 뚜껑, 칫솔, 물티슈 등이 목에 걸려 레버를 내려도 물만 가득 찼다가 서서히 빠지는 현상입니다.',
    cause: '양변기 내부 에스트랩 구조 구간 내 단단한 이물질 고착',
    solution: '변기를 바닥에서 뜯지 않고 강력 흡입(석션) 장비와 특수 갈고리 관통기로 원형 그대로 보존 견인',
    equipment: '초강력 진공 석션기, 초정밀 관통스프링',
    timeRequired: '평균 30분 ~ 50분',
    iconName: 'Droplet'
  },
  {
    id: 'diag-faucet-drip',
    symptom: '수도꼭지 잠갔는데도 물이 한 방울씩 떨어져요',
    description: '시간당 떨어지는 물의 양은 적지만 한 달 누적 시 미세 수도요금 폭탄과 욕실 얼룩을 생성합니다.',
    cause: '수전 내부 고무 카트리지 패킹 마모 및 노후 부식',
    solution: '기존 노후 수전 제거 및 물샘 방지 테이프 이중 처리 후 친환경 인증 신형 국산 주방/세면대 수전 조립',
    equipment: '수전 분리 전용 토크 렌치, Teflon 물샘 방지 가스켓',
    timeRequired: '평균 30분',
    iconName: 'Sparkles'
  }
];

export const REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: '박*민',
    location: '서울 은평구 아파트',
    rating: 5,
    date: '2026.07.15',
    serviceType: '누수탐지 & 누수공사',
    content: '아랫집 천장에 물이 새서 걱정했는데, 정확한 위치를 찾아서 깔끔하게 공사해 주셨어요. 마감까지 완벽하게 처리해 주셔서 이제 마음이 정말 편안합니다.'
  },
  {
    id: 'rev-2',
    name: '최*윤',
    location: '경기 성남시 상가빌딩',
    rating: 5,
    date: '2026.07.11',
    serviceType: '하수구막힘 & 하수구고압세척',
    content: '자꾸 막히던 하수구 때문에 스트레스였는데, 고압세척으로 배관 속 기름때를 싹 밀어내니 속이 다 시원해요. 진작 전문가를 불러서 해결할 걸 그랬습니다.'
  },
  {
    id: 'rev-3',
    name: '이*희',
    location: '서울 송파구 오피스텔',
    rating: 5,
    date: '2026.07.04',
    serviceType: '싱크대막힘',
    content: '싱크대 물이 역류해서 온 집안에 냄새가 났는데, 꽉 막힌 이물질을 신속하게 뚫어주셨습니다. 작업 후에 관리하는 방법까지 친절하게 설명해 주셔서 유익했어요.'
  },
  {
    id: 'rev-4',
    name: '한*정',
    location: '인천 연수구 아파트',
    rating: 5,
    date: '2026.06.26',
    serviceType: '수전교체 & 세면대교체',
    content: '오래된 화장실 수도꼭지와 세면대를 새것으로 바꿨더니 욕실 분위기가 완전히 환해졌어요. 물도 잘 나오고 인테리어 효과까지 얻은 것 같아 대만족입니다.'
  },
  {
    id: 'rev-5',
    name: '장*우',
    location: '서울 강북구 단독주택',
    rating: 5,
    date: '2026.01.18',
    serviceType: '해빙 & 언수도녹임',
    content: '겨울 한파에 수도가 얼어 물이 안 나와 고생했는데, 연락드리자마자 달려와서 안전하게 녹여주셨어요. 추운 날씨에 고생하셨는데 친절하게 해주셔서 살았습니다.'
  },
  {
    id: 'rev-6',
    name: '임*호',
    location: '경기 광주시 전원주택',
    rating: 5,
    date: '2026.04.09',
    serviceType: '부동전 교체',
    content: '겨울에 마당에 있던 부동전이 얼어 터져서 봄이 되어서야 다시 교체 의뢰 했었는데요. 땅 파는 것이 쉬운 일이 아닌데 정말 깔끔하게 교체해 주셔서 대만족이었습니다.'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: '누수 탐지 공사비용은 아파트 일상생활배상책임보험 적용이 가능한가요?',
    answer: '네, 100% 가능합니다! 가입해 두신 실손보험(실비보험) 특약에 "일상생활배상책임보험"이 포함되어 있다면 본인 부담금을 제외하고 아래층 천장 누수 복구 비용뿐만 아니라, 고객님 댁의 누수 탐지 및 원인 배관 공사 비용까지 보험 혜택을 받으실 수 있습니다. 저희 베스트누수설비는 누수 전문 등록 업체로서 보험금 청구에 필수적인 기술소견서, 공사 전/후 현장 정밀 사진 대장, 영수증 서식 등을 누락 없이 꼼꼼하게 무료로 작성해 드립니다.'
  },
  {
    id: 'faq-2',
    question: '만약 누수 원인을 찾지 못하거나 해결을 못하면 어떻게 되나요?',
    answer: '걱정하지 않으셔도 됩니다! 저희 베스트누수설비는 "못 찾으면 0원" 보증 책임 제도를 전면 시행하고 있습니다. 아무리 까다롭고 오래된 노후 주택이든, 고난도의 미세 가스 누수든 사장님이 직접 진단해보고 당사의 장비와 기술력으로 누수 지점을 정확하게 특정하지 못하거나 배관 막힘을 완벽하게 관통 해결하지 못한다면, 출장비를 포함하여 단 1원도 고객님께 요구하지 않습니다. 고객 중심의 신뢰할 수 있는 철칙입니다.'
  },
  {
    id: 'faq-3',
    question: '출장 예약 시 방문 가능 시간과 소요 시간은 어느 정도 되나요?',
    answer: '상담 전화를 주시면 계신 위치에서 가장 가까운 베테랑 마스터가 매칭되어 서울, 경기, 인천 수도권 전역 30분~1시간 이내에 번개같이 신속하게 도달할 수 있습니다. 일반적인 싱크대/변기 뚫기나 수전 교체는 30분~1시간 이내에 깔끔하게 종결되며, 고난도 누수 정밀 탐지 및 해당 부위 굴착 복구 공사는 현장 컨디션에 따라 2~3시간 내외로 당일 완료를 원칙으로 하여 일상생활에 지장이 없도록 빠르게 조치해 드립니다.'
  },
  {
    id: 'faq-4',
    question: '공사 완료 후에 동일 부위에 하자가 발생하면 AS를 보장해주시나요?',
    answer: '물론입니다. 베스트누수설비는 신뢰를 최우선으로 여깁니다. 저희가 시공 및 교체해 드린 신형 수도관 배관 부위, 욕실 도기류, 수전에 대해서는 시공일로부터 최대 2년간 성실 무상 사후 관리(AS)를 확실히 보장해 드립니다. 시공 전후 사진과 작업 이력이 안전하게 관리되므로 전화 한 통만 주시면 즉각적인 추적 사후 점검 서비스를 받으실 수 있습니다.'
  }
];

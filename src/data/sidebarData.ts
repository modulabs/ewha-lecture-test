import type { SidebarItem } from '../types';

export const sidebarData: SidebarItem[] = [
  {
    id: 'home',
    title: 'Home',
    path: '/'
  },
  {
    id: 'day1',
    title: 'Day 1 (8/19 화)',
    hasAssignment: true,
    assignmentDate: '2025-08-19',
    children: [
      {
        id: 'day1-01',
        title: '1. 온보딩 및 퍼실리테이션',
        path: '/day1/01_onboarding'
      },
      {
        id: 'day1-02',
        title: '2. AI 에이전트 트렌드 & 최신 기술 동향',
        path: '/day1/02_ai_agent_trends'
      },
      {
        id: 'day1-03',
        title: '3. 바이브 코딩과 AI 에이전트 구축',
        path: '/day1/03_vibe_coding_and_agent'
      },
      {
        id: 'day1-04',
        title: '4. Streamlit을 활용한 AI 서비스 배포',
        path: '/day1/04_streamlit_deploy'
      },
      {
        id: 'day1-05',
        title: '5. RAG 개념 및 바이브 코딩으로 적용하기',
        path: '/day1/05_rag_with_vibe_coding'
      },
      {
        id: 'day1-06',
        title: '6. 바이브 코딩을 위한 IT 지식 배우기',
        path: '/day1/06_it_knowledge_for_vibe_coding'
      }
    ]
  },
  {
    id: 'day2',
    title: 'Day 2 (8/20 수)',
    locked: true, // 해제하려면 이 줄을 삭제하세요
    hasAssignment: true,
    assignmentDate: '2025-08-20',
    children: [
      {
        id: 'day2-01',
        title: '1. n8n 워크플로우 자동화 입문',
        path: '/day2/01_n8n_intro'
      },
      {
        id: 'day2-02',
        title: '2. n8n 워크플로우 자동화 실습',
        path: '/day2/02_n8n_workflow'
      },
      {
        id: 'day2-03',
        title: '3. 따끈따끈한 트렌드 AI',
        path: '/day2/03_collaboration_strategy'
      },
      {
        id: 'day2-04',
        title: '4. 해커톤 아이디어 기획',
        path: '/day2/04_hackathon_ideation'
      },
      {
        id: 'day2-05',
        title: '5. 해커톤 아이디어 발표',
        path: '/day2/05_hackathon_presentation'
      },
      {
        id: 'day2-06',
        title: '6. 해커톤 아이디어 발표 피드백',
        path: '/day2/06_hackathon_feedback'
      }
    ]
  },
  {
    id: 'day3',
    title: 'Day 3 (8/21 목)',
    locked: true, // 해제하려면 이 줄을 삭제하세요
    hasAssignment: true,
    assignmentDate: '2025-08-21',
    children: [
      {
        id: 'day3-01',
        title: '1. 특강: Gen AI 시대에서 살아남기',
        path: '/day3/01_special_lecture_gen_ai'
      },
      {
        id: 'day3-02',
        title: '2. 미니 해커톤 킥오프 및 팀 빌딩',
        path: '/day3/02_hackathon_kickoff'
      },
      {
        id: 'day3-03',
        title: '3. 깃허브를 통한 나만의 페이지 만들기',
        path: '/day3/03_github_pages_deploy'
      },
      {
        id: 'day3-04',
        title: '4. 미니 해커톤 집중 개발',
        path: '/day3/04_hackathon_development'
      },
      {
        id: 'day3-05',
        title: '5. 프로젝트 발표 및 시연',
        path: '/day3/05_project_presentation'
      },
      {
        id: 'day3-06',
        title: '6. 이후 과정 안내',
        path: '/day3/06_closing'
      }
    ]
  },
  // 관리자 메뉴 구분선
  {
    id: 'admin-divider',
    title: '🛡️ 관리자 메뉴',
    isDivider: true,
    adminOnly: true
  },
  {
    id: 'admin-dashboard',
    title: '📊 대시보드',
    path: '/admin',
    adminOnly: true
  },
  {
    id: 'admin-students',
    title: '👥 학생 관리',
    adminOnly: true,
    children: [
      {
        id: 'admin-students-list',
        title: '📋 명단 조회',
        path: '/admin/students'
      },
      {
        id: 'admin-students-upload',
        title: '📤 CSV 업로드',
        path: '/admin/students/upload'
      }
    ]
  },
  {
    id: 'admin-assignments',
    title: '📝 과제 관리',
    path: '/admin/assignments',
    adminOnly: true
  }
];
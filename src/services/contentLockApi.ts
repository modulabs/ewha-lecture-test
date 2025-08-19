import { useAuthStore } from '../store/authStore';

// API Base URL
const API_BASE_URL = 'https://modulabs.ddns.net/ewha/api/v1';

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 디버깅용 로그
  console.log('ContentLock API URL:', url);
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('endpoint:', endpoint);
  
  // localStorage에서 토큰 가져오기
  const getAccessToken = (): string | null => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.tokens?.accessToken || null;
    }
    return null;
  };

  const token = getAccessToken();
  console.log('Access Token:', token ? 'Token exists' : 'No token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    headers,
    ...options,
  };

  const response = await fetch(url, config);
  
  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401 && token) {
    try {
      // 토큰 갱신
      const { refreshToken: refresh } = useAuthStore.getState();
      
      await refresh();
      
      // 새로운 토큰으로 재시도
      const newToken = useAuthStore.getState().tokens?.accessToken;
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, { ...config, headers });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${retryResponse.status}`);
        }
        
        return retryResponse.json();
      }
    } catch (refreshError) {
      // 갱신 실패 시 원래 에러 그대로 처리
      console.error('Token refresh failed:', refreshError);
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// 콘텐츠 잠금 관련 타입 정의 (백엔드 응답에 맞춰 수정)
export interface ContentLock {
  id: string;
  content_id: string;
  is_locked: boolean;
  reason?: string | null;
  locked_at?: string | null;
  unlocked_at?: string | null;
  created_by?: {
    id: string;
    name: string;
    email: string;
  } | null;
  updated_by?: {
    id: string;
    name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ContentLockResponse {
  success: boolean;
  data: {
    locks: ContentLock[];
    last_updated: string;
  };
  message: string;
  timestamp: string;
}

export interface UpdateContentLockRequest {
  is_locked: boolean;
  reason?: string;
}

export interface UpdateContentLockResponse {
  success: boolean;
  data: {
    content_id: string;
    is_locked: boolean;
    locked_at?: string;
    unlocked_at?: string;
    updated_by: {
      id: string;
      name: string;
    };
    updated_at: string;
  };
  message: string;
  timestamp: string;
}

export interface BatchUpdateContentLockRequest {
  updates: Array<{
    content_id: string;
    is_locked: boolean;
  }>;
  reason?: string;
}

export interface ContentLockHistory {
  content_id: string;
  action: 'locked' | 'unlocked';
  performed_by: {
    id: string;
    name: string;
    email: string;
  };
  reason?: string;
  timestamp: string;
}

// 콘텐츠 잠금 API 서비스
export const contentLockApi = {
  // 전체 잠금 상태 조회
  getLocks: async (): Promise<ContentLockResponse> => {
    return apiCall('/content/locks/');
  },

  // 개별 잠금 상태 변경
  updateLock: async (
    contentId: string, 
    isLocked: boolean, 
    reason?: string
  ): Promise<UpdateContentLockResponse> => {
    return apiCall(`/content/locks/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        is_locked: isLocked, 
        reason 
      }),
    });
  },

  // 일괄 변경
  batchUpdate: async (
    updates: Array<{ content_id: string; is_locked: boolean }>, 
    reason?: string
  ): Promise<{ success: boolean; message: string; timestamp: string }> => {
    return apiCall('/content/locks/batch/', {
      method: 'PUT',
      body: JSON.stringify({ 
        updates, 
        reason 
      }),
    });
  },

  // 잠금 히스토리 조회
  getHistory: async (contentId: string): Promise<{ 
    success: boolean; 
    data: ContentLockHistory[]; 
    message: string; 
    timestamp: string; 
  }> => {
    return apiCall(`/content/locks/${contentId}/history`);
  }
};
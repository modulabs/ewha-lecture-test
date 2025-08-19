import { useAuthStore } from '../store/authStore';

// API Base URL
const API_BASE_URL = 'https://modulabs.ddns.net/ewha/api/v1';

// API helper function
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
      console.error('Token refresh failed:', refreshError);
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// 과제 관련 타입 정의
export interface AssignmentTemplate {
  id: string;
  assignment_date: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  template_id: string;
  submission_text: string;
  status: 'submitted' | 'reviewed';
  submitted_at: string;
  reviewed_at?: string;
  feedback?: string;
  template?: AssignmentTemplate;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AssignmentTemplateResponse {
  success: boolean;
  data: AssignmentTemplate[];
}

export interface AssignmentSubmissionResponse {
  success: boolean;
  data: AssignmentSubmission[];
}

export interface CreateTemplateRequest {
  assignment_date: string;
  title: string;
  description: string;
}

export interface SubmitAssignmentRequest {
  assignment_id: string;
  submission_text: string;
}

export interface ReviewSubmissionRequest {
  feedback: string;
}

// 과제 API 서비스
export const assignmentApi = {
  // 과제 템플릿 관련
  getTemplates: async (date?: string): Promise<AssignmentTemplateResponse> => {
    const params = date ? `?assignment_date=${date}` : '';
    return apiCall(`/daily-assignments/templates${params}`);
  },

  createTemplate: async (templateData: CreateTemplateRequest): Promise<{ success: boolean; data: AssignmentTemplate }> => {
    return apiCall('/daily-assignments/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  },

  updateTemplate: async (templateId: string, templateData: Partial<CreateTemplateRequest>): Promise<{ success: boolean; data: AssignmentTemplate }> => {
    return apiCall(`/daily-assignments/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  },

  deleteTemplate: async (templateId: string): Promise<{ success: boolean }> => {
    return apiCall(`/daily-assignments/templates/${templateId}`, {
      method: 'DELETE',
    });
  },

  // 과제 제출 관련
  submit: async (assignmentId: string, submissionText: string): Promise<{ success: boolean; data: AssignmentSubmission }> => {
    return apiCall('/daily-assignments/submit', {
      method: 'POST',
      body: JSON.stringify({
        assignment_id: assignmentId,
        submission_text: submissionText
      }),
    });
  },

  getMySubmissions: async (date?: string): Promise<AssignmentSubmissionResponse> => {
    const params = date ? `?assignment_date=${date}` : '';
    return apiCall(`/daily-assignments/my-submissions${params}`);
  },

  getAllSubmissions: async (filters: { 
    assignment_date?: string; 
    status_filter?: string; 
  } = {}): Promise<AssignmentSubmissionResponse> => {
    const params = new URLSearchParams();
    if (filters.assignment_date) params.append('assignment_date', filters.assignment_date);
    if (filters.status_filter) params.append('status_filter', filters.status_filter);
    
    const queryString = params.toString();
    return apiCall(`/daily-assignments/submissions${queryString ? `?${queryString}` : ''}`);
  },

  // 과제 리뷰 관련
  reviewSubmission: async (submissionId: string, feedback: string): Promise<{ success: boolean; data: AssignmentSubmission }> => {
    return apiCall(`/daily-assignments/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        feedback
      }),
    });
  },

  getSubmissionById: async (submissionId: string): Promise<{ success: boolean; data: AssignmentSubmission }> => {
    return apiCall(`/daily-assignments/submissions/${submissionId}`);
  }
};
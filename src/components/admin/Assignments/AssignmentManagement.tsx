import React, { useState, useEffect } from 'react';
import { FileText, Users, Clock, Star, Plus, AlertCircle } from 'lucide-react';
import { AdminTable } from '../shared/AdminTable';
import { AdminStatsCard } from '../shared/AdminStatsCard';
import { assignmentApi } from '../../../services/assignmentApi';
import type { TableColumn } from '../shared/AdminTable';
import type { 
  AssignmentTemplate, 
  AssignmentSubmission 
} from '../../../services/assignmentApi';

// 상태 관리
interface AssignmentManagementState {
  templates: AssignmentTemplate[];
  submissions: AssignmentSubmission[];
  selectedTemplate: AssignmentTemplate | null;
  loading: boolean;
  error: string | null;
}

export const AssignmentManagement: React.FC = () => {
  const [state, setState] = useState<AssignmentManagementState>({
    templates: [],
    submissions: [],
    selectedTemplate: null,
    loading: true,
    error: null
  });
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [reviewData, setReviewData] = useState({
    feedback: ''
  });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    assignment_date: '',
    title: '',
    description: ''
  });

  // 데이터 로딩
  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (state.selectedTemplate) {
      loadSubmissions();
    }
  }, [state.selectedTemplate]);

  const loadTemplates = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await assignmentApi.getTemplates();
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          templates: response.data,
          selectedTemplate: response.data[0] || null,
          loading: false 
        }));
      }
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : '템플릿 로딩에 실패했습니다.',
        loading: false 
      }));
    }
  };

  const loadSubmissions = async () => {
    if (!state.selectedTemplate) return;
    
    try {
      const response = await assignmentApi.getAllSubmissions({
        assignment_date: state.selectedTemplate.assignment_date
      });
      if (response.success) {
        setState(prev => ({ ...prev, submissions: response.data }));
      }
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : '제출물 로딩에 실패했습니다.'
      }));
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await assignmentApi.createTemplate(newTemplate);
      if (response.success) {
        await loadTemplates();
        setShowCreateModal(false);
        setNewTemplate({ assignment_date: '', title: '', description: '' });
      }
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : '템플릿 생성에 실패했습니다.'
      }));
    }
  };

  const submissionColumns: TableColumn<AssignmentSubmission>[] = [
    {
      key: 'user',
      header: '학생',
      render: (record) => (
        <div>
          <div className="font-medium">{record.user?.name || 'Unknown'}</div>
          <div className="text-sm text-gray-500">{record.user?.email}</div>
        </div>
      )
    },
    {
      key: 'submission_text',
      header: '제출 내용',
      render: (record) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-700 truncate">
            {record.submission_text.substring(0, 100)}{record.submission_text.length > 100 ? '...' : ''}
          </div>
        </div>
      )
    },
    {
      key: 'submitted_at',
      header: '제출시간',
      render: (record) => (
        <span className="text-sm">
          {new Date(record.submitted_at).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: '상태',
      render: (record) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          record.status === 'reviewed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {record.status === 'reviewed' ? '검토완료' : '제출완료'}
        </span>
      )
    },
    {
      key: 'feedback',
      header: '피드백',
      render: (record) => (
        <div className="flex items-center">
          {record.feedback ? (
            <span className="text-green-600 text-sm">완료</span>
          ) : (
            <span className="text-gray-400 text-sm">미완료</span>
          )}
        </div>
      )
    }
  ];

  const handleReview = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setReviewData({
      feedback: submission.feedback || ''
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;
    
    try {
      await assignmentApi.reviewSubmission(selectedSubmission.id, reviewData.feedback);
      await loadSubmissions(); // 제출물 목록 새로고침
      setShowReviewModal(false);
      setSelectedSubmission(null);
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : '리뷰 제출에 실패했습니다.'
      }));
    }
  };

  const assignmentStats = {
    totalSubmissions: state.submissions.length,
    pendingReview: state.submissions.filter(s => s.status === 'submitted').length,
    reviewedCount: state.submissions.filter(s => s.status === 'reviewed').length,
    submissionRate: 100 // TODO: 전체 학생 수 대비 제출률 계산을 위해 사용자 API 필요
  };

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900">과제 관리</h1>
          <p className="text-amber-700">데이터를 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900">과제 관리</h1>
          <p className="text-red-700">오류: {state.error}</p>
          <button 
            onClick={loadTemplates}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">과제 관리</h1>
            <p className="text-amber-700">과제 제출 현황 및 검토 관리</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            <Plus size={16} />
            <span>새 과제 생성</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div className="text-red-700">{state.error}</div>
          <button 
            onClick={() => setState(prev => ({ ...prev, error: null }))}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Assignment Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">과제 선택</h3>
        {state.templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>생성된 과제가 없습니다.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              첫 번째 과제 생성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setState(prev => ({ ...prev, selectedTemplate: template }))}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-colors
                  ${state.selectedTemplate?.id === template.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <h4 className="font-medium text-gray-900">{template.title}</h4>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>날짜: {new Date(template.assignment_date).toLocaleDateString()}</span>
                  <span>제출: {state.submissions.filter(s => s.template_id === template.id).length}건</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Assignment Stats */}
      {state.selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminStatsCard
            title="총 제출"
            value={assignmentStats.totalSubmissions}
            subtitle="건"
            icon={FileText}
            color="blue"
          />
          <AdminStatsCard
            title="검토 대기"
            value={assignmentStats.pendingReview}
            subtitle="건"
            icon={Clock}
            color="amber"
          />
          <AdminStatsCard
            title="검토 완료"
            value={assignmentStats.reviewedCount}
            subtitle="건"
            icon={Star}
            color="green"
          />
          <AdminStatsCard
            title="과제 날짜"
            value={new Date(state.selectedTemplate.assignment_date).toLocaleDateString()}
            icon={Users}
            color="gray"
          />
        </div>
      )}

      {state.selectedTemplate && (
        <div className="grid grid-cols-1 gap-6">
          {/* Submissions List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                제출물 목록 - {state.selectedTemplate.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {state.selectedTemplate.description}
              </p>
            </div>
            <AdminTable
              data={state.submissions.filter(s => s.template_id === state.selectedTemplate!.id)}
              columns={submissionColumns}
              actions={[
                {
                  label: '검토',
                  variant: 'primary',
                  onClick: handleReview
                }
              ]}
              emptyMessage="아직 제출된 과제가 없습니다."
            />
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 과제 생성</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제 날짜
                </label>
                <input
                  type="date"
                  value={newTemplate.assignment_date}
                  onChange={(e) => setNewTemplate({...newTemplate, assignment_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제 제목
                </label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: Day 1 최종 과제"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과제 설명
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="과제에 대한 상세 설명을 입력하세요"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.title || !newTemplate.description || !newTemplate.assignment_date}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">과제 검토</h3>
            
            {/* Submission Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">학생:</span> {selectedSubmission.user?.name || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">이메일:</span> {selectedSubmission.user?.email}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">제출시간:</span> {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </div>
              </div>
              
              <div className="mt-4">
                <span className="font-medium">제출 내용:</span>
                <div className="mt-2 p-3 bg-white rounded border max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {selectedSubmission.submission_text}
                  </pre>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  피드백
                </label>
                <textarea
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="학생에게 전달할 피드백을 작성하세요"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                검토 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
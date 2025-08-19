import React, { useState, useEffect } from 'react';
import { Users, FileText, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { AdminStatsCard } from '../shared/AdminStatsCard';
import { AdminTable } from '../shared/AdminTable';
import { StatusBadge } from '../shared/StatusBadge';
import { ContentLockControl } from '../ContentLock/ContentLockControl';
import type { TableColumn } from '../shared/AdminTable';
import { userApi } from '../../../services/userApi';
import { assignmentApi } from '../../../services/assignmentApi';
import type { AssignmentSubmission } from '../../../services/assignmentApi';

interface AdminStats {
  studentsTotal: number;
  studentsRegistered: number;
  studentsActiveToday: number;
  assignmentsPending: number;
  assignmentsTotal: number;
  avgScore: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'assignment_submitted' | 'student_registered' | 'assignment_reviewed';
  title: string;
  studentName: string;
  assignmentTitle?: string;
  timestamp: string;
}


export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    studentsTotal: 0,
    studentsRegistered: 0,
    studentsActiveToday: 0,
    assignmentsPending: 0,
    assignmentsTotal: 0,
    avgScore: 0,
    completionRate: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState<AssignmentSubmission[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 API 호출
      const [userStatsRes, allSubmissionsRes, templatesRes] = await Promise.all([
        userApi.getUserStats().catch(() => null),
        assignmentApi.getAllSubmissions().catch(() => null),
        assignmentApi.getTemplates().catch(() => null)
      ]);

      // 통계 계산
      if (userStatsRes?.success) {
        const userStats = userStatsRes.data;
        
        // 제출 통계 계산
        const pendingCount = allSubmissionsRes?.data?.filter(
          (s: AssignmentSubmission) => s.status === 'submitted'
        ).length || 0;
        
        const reviewedCount = allSubmissionsRes?.data?.filter(
          (s: AssignmentSubmission) => s.status === 'reviewed'
        ).length || 0;
        
        const totalSubmissions = allSubmissionsRes?.data?.length || 0;
        const completionRate = totalSubmissions > 0 
          ? (reviewedCount / totalSubmissions) * 100 
          : 0;

        setStats({
          studentsTotal: userStats.total_users || 0,
          studentsRegistered: userStats.active_users || 0,
          studentsActiveToday: Math.floor((userStats.active_users || 0) * 0.35), // 임시 계산
          assignmentsPending: pendingCount,
          assignmentsTotal: templatesRes?.data?.length || 0,
          avgScore: 82.5, // 나중에 실제 점수 계산 추가
          completionRate: Math.round(completionRate * 10) / 10
        });
      }

      // 최근 제출 과제 설정 (최대 5개)
      if (allSubmissionsRes?.success) {
        const sortedSubmissions = allSubmissionsRes.data
          .sort((a: AssignmentSubmission, b: AssignmentSubmission) => 
            new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
          )
          .slice(0, 5);
        setRecentSubmissions(sortedSubmissions);

        // 최근 활동 생성
        const activities: RecentActivity[] = sortedSubmissions.slice(0, 3).map((submission: AssignmentSubmission) => ({
          id: submission.id,
          type: submission.status === 'reviewed' ? 'assignment_reviewed' : 'assignment_submitted',
          title: submission.status === 'reviewed' ? '과제 검토 완료' : '과제 제출',
          studentName: submission.user?.name || '알 수 없음',
          assignmentTitle: submission.template?.title || '',
          timestamp: submission.status === 'reviewed' && submission.reviewed_at 
            ? submission.reviewed_at 
            : submission.submitted_at
        }));
        setRecentActivity(activities);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const submissionColumns: TableColumn<AssignmentSubmission>[] = [
    {
      key: 'student',
      header: '학생',
      render: (record) => (
        <div>
          <div className="font-medium">{record.user?.name || '알 수 없음'}</div>
          <div className="text-sm text-gray-500">{record.user?.email || ''}</div>
        </div>
      )
    },
    {
      key: 'assignment',
      header: '과제',
      render: (record) => (
        <div>
          <div className="font-medium">{record.template?.title || '과제 정보 없음'}</div>
          <div className="text-sm text-gray-500">
            날짜: {record.template?.assignment_date ? new Date(record.template.assignment_date).toLocaleDateString() : '-'}
          </div>
        </div>
      )
    },
    {
      key: 'submission',
      header: '제출 내용',
      render: (record) => (
        <span className="text-sm text-gray-600" title={record.submission_text}>
          {record.submission_text ? 
            (record.submission_text.length > 50 
              ? record.submission_text.substring(0, 50) + '...' 
              : record.submission_text)
            : '-'
          }
        </span>
      )
    },
    {
      key: 'submittedAt',
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
        <StatusBadge 
          status={record.status === 'reviewed' ? 'approved' : 'pending'} 
          size="sm" 
        />
      )
    },
    {
      key: 'feedback',
      header: '피드백',
      render: (record) => record.feedback ? 
        <span className="text-sm text-green-600">완료</span> : 
        <span className="text-sm text-gray-400">대기</span>
    }
  ];

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-amber-700">
              이화여자대학교 AI 에이전트 개발 과정 관리 시스템
            </p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          title="총 학생 수"
          value={stats.studentsTotal}
          subtitle={`가입 완료: ${stats.studentsRegistered}명`}
          icon={Users}
          color="blue"
        />
        <AdminStatsCard
          title="오늘 활동"
          value={stats.studentsActiveToday}
          subtitle="명이 학습 중"
          icon={TrendingUp}
          color="green"
        />
        <AdminStatsCard
          title="검토 대기"
          value={stats.assignmentsPending}
          subtitle="건의 과제"
          icon={Clock}
          color="amber"
        />
        <AdminStatsCard
          title="과제 현황"
          value={`${stats.assignmentsTotal}개`}
          subtitle={`완료율: ${stats.completionRate}%`}
          icon={CheckCircle}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 활동</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'assignment_submitted' && (
                      <FileText size={16} className="text-blue-600 mt-1" />
                    )}
                    {activity.type === 'student_registered' && (
                      <Users size={16} className="text-green-600 mt-1" />
                    )}
                    {activity.type === 'assignment_reviewed' && (
                      <CheckCircle size={16} className="text-amber-600 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.studentName}
                    </p>
                    <p className="text-sm text-gray-600">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatActivityTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">급한 작업</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle size={16} className="text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">검토 대기 {stats.assignmentsPending}건</p>
                  <p className="text-xs text-red-700">빠른 검토가 필요합니다</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                <Clock size={16} className="text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-900">마감 임박 과제</p>
                  <p className="text-xs text-amber-700">3건의 과제가 내일 마감</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">최근 제출 과제</h3>
            </div>
            <AdminTable
              data={recentSubmissions}
              columns={submissionColumns}
              actions={[
                {
                  label: '검토',
                  variant: 'primary',
                  onClick: (record) => {
                    // 리뷰 페이지로 이동하거나 모달 열기
                    console.log('Review submission:', record.id);
                  }
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Content Lock Control */}
      <ContentLockControl />
    </div>
  );
};
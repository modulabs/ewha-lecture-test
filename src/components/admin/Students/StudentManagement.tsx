import React, { useState, useEffect } from 'react';
import { Upload, Search, UserPlus, AlertCircle } from 'lucide-react';
import { AdminTable } from '../shared/AdminTable';
import { StatusBadge } from '../shared/StatusBadge';
import { AdminStatsCard } from '../shared/AdminStatsCard';
import { userApi } from '../../../services/userApi';
import type { TableColumn, PaginationProps } from '../shared/AdminTable';
import type { User, UserStats, BulkCreateResult } from '../../../services/userApi';

interface Student extends User {
  studentId: string;
  status: 'pending' | 'registered' | 'blocked';
  totalLearningTime?: number;
  completedItems?: number;
}


export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkCreateResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 50;

  // Data fetching functions
  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userApi.getAllUsers({
        role: 'student', // Only fetch students
        cohort: selectedCohort === 'all' ? undefined : selectedCohort,
        search: searchQuery || undefined,
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
      });

      if (response.success) {
        let studentsData: Student[] = response.data.map((user: User) => ({
          ...user,
          studentId: user.student_id || '',
          status: (user.is_active ? 'registered' : 'pending') as 'pending' | 'registered' | 'blocked',
          totalLearningTime: 0, // TODO: Get from learning analytics API
          completedItems: 0, // TODO: Get from progress API
        }));

        // Apply status filter on client side
        if (selectedStatus !== 'all') {
          studentsData = studentsData.filter(student => student.status === selectedStatus);
        }

        setStudents(studentsData);
        setTotalItems(response.total || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userApi.getUserStats();
      if (response.success) {
        setUserStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchStudents();
  }, [currentPage, selectedCohort, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const studentColumns: TableColumn<Student>[] = [
    {
      key: 'name',
      header: '이름',
      render: (record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      )
    },
    {
      key: 'student_id',
      header: '학번',
      render: (record) => record.student_id || '-',
      width: '120px'
    },
    {
      key: 'department',
      header: '학과',
      render: (record) => record.department || '-',
      width: '150px'
    },
    {
      key: 'cohort',
      header: '기수',
      render: (record) => record.cohort || '-',
      width: '100px'
    },
    {
      key: 'status',
      header: '상태',
      render: (record) => <StatusBadge status={record.status} size="sm" />,
      width: '100px'
    },
    {
      key: 'created_at',
      header: '가입일',
      render: (record) => 
        record.created_at ? new Date(record.created_at).toLocaleDateString() : '-',
      width: '120px'
    },
    {
      key: 'completedItems',
      header: '진행도',
      render: (record) => (
        <div>
          <div className="text-sm font-medium">{record.completedItems || 0}/15</div>
          <div className="text-xs text-gray-500">
            {Math.round(((record.completedItems || 0) / 15) * 100)}%
          </div>
        </div>
      ),
      width: '100px'
    }
  ];

  const handleStatusChange = async (student: Student, newStatus: Student['status']) => {
    try {
      setIsLoading(true);
      const isActive = newStatus === 'registered';
      await userApi.toggleUserStatus(student.id, isActive);
      
      // Refresh the data
      await fetchStudents();
      await fetchUserStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userApi.bulkCreateUsers(file);
      
      if (response.success) {
        setUploadResult(response.data);
        await fetchStudents();
        await fetchUserStats();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload users');
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination setup
  const pagination: PaginationProps = {
    currentPage,
    totalPages: Math.ceil(totalItems / pageSize),
    totalItems,
    pageSize,
    onPageChange: setCurrentPage
  };

  const handleEditStudent = (student: Student) => {
    // TODO: Implement edit student modal
    console.log('Edit student:', student.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
        <p className="text-amber-700">허용된 학생 명단 및 상태 관리</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div className="text-red-700">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Result Display */}
      {uploadResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">업로드 완료!</h3>
          <div className="text-sm text-green-700">
            <p>생성: {uploadResult.created_count}명</p>
            <p>건너뜀: {uploadResult.skipped_count}명</p>
            <p>오류: {uploadResult.error_count}명</p>
          </div>
          <button 
            onClick={() => setUploadResult(null)}
            className="mt-2 text-green-500 hover:text-green-700 text-sm"
          >
            닫기
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          title="총 학생 수"
          value={userStats?.total_users || 0}
          icon={UserPlus}
          color="blue"
        />
        <AdminStatsCard
          title="활성 사용자"
          value={userStats?.active_users || 0}
          icon={UserPlus}
          color="green"
        />
        <AdminStatsCard
          title="비활성 사용자"
          value={userStats?.inactive_users || 0}
          icon={UserPlus}
          color="amber"
        />
        <AdminStatsCard
          title="학생"
          value={userStats?.role_distribution?.student || 0}
          icon={UserPlus}
          color="blue"
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 학번 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 기수</option>
              <option value="2024-08">2024-08</option>
              <option value="2024-09">2024-09</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="pending">가입 대기</option>
              <option value="registered">가입 완료</option>
              <option value="blocked">차단됨</option>
            </select>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Upload size={20} />
            <span>CSV 업로드</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
          </div>
        </div>
      ) : (
        <AdminTable
          data={students}
          columns={studentColumns}
          actions={[
            {
              label: '승인',
              variant: 'primary',
              onClick: (record) => handleStatusChange(record, 'registered')
            },
            {
              label: '차단',
              variant: 'danger',
              onClick: (record) => handleStatusChange(record, 'blocked')
            },
            {
              label: '편집',
              onClick: handleEditStudent
            }
          ]}
          pagination={pagination}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">학생 명단 CSV 업로드</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기수 선택
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="2024-08">2024-08</option>
                <option value="2024-09">2024-09</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV 파일
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  CSV 파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  형식: name, email, student_id, department
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="csv-upload"
                  className={`inline-block px-4 py-2 text-white rounded cursor-pointer ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? '업로드 중...' : '파일 선택'}
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
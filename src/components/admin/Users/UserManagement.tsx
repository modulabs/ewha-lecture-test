import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, UserCheck, UserX, Upload } from 'lucide-react';
import { AdminTable } from '../shared/AdminTable';
import { AdminStatsCard } from '../shared/AdminStatsCard';
import { UserBulkUpload } from './UserBulkUpload';
import { userApi } from '../../../services/userApi';
import type { TableColumn } from '../shared/AdminTable';
import type { User, UserStats } from '../../../services/userApi';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 및 검색
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [cohortFilter, setCohortFilter] = useState<string>('');
  
  // 모달 상태
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, searchQuery, roleFilter, cohortFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userApi.getAllUsers({
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        cohort: cohortFilter || undefined,
        skip: currentPage * pageSize,
        limit: pageSize
      });

      if (response.success) {
        setUsers(response.data);
        setTotalUsers(response.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 데이터 로딩에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await userApi.getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await userApi.toggleUserStatus(user.id, !user.is_active);
      await loadUsers(); // 목록 새로고침
      await loadStats(); // 통계 새로고침
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`정말로 ${user.name} 사용자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await userApi.deleteUser(user.id);
      await loadUsers(); // 목록 새로고침
      await loadStats(); // 통계 새로고침
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 삭제에 실패했습니다.');
    }
  };

  const userColumns: TableColumn<User>[] = [
    {
      key: 'name',
      header: '사용자',
      render: (record) => (
        <div>
          <div className="font-medium text-gray-900">{record.name}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
          {record.student_id && (
            <div className="text-xs text-gray-400">학번: {record.student_id}</div>
          )}
        </div>
      )
    },
    {
      key: 'role',
      header: '역할',
      render: (record) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          record.role === 'admin' ? 'bg-purple-100 text-purple-800' :
          record.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {record.role === 'admin' ? '관리자' : 
           record.role === 'instructor' ? '강사' : '학생'}
        </span>
      )
    },
    {
      key: 'cohort',
      header: '기수',
      render: (record) => record.cohort || '-'
    },
    {
      key: 'department',
      header: '학과',
      render: (record) => record.department || '-'
    },
    {
      key: 'is_active',
      header: '상태',
      render: (record) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          record.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {record.is_active ? '활성' : '비활성'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: '가입일',
      render: (record) => (
        <span className="text-sm text-gray-600">
          {new Date(record.created_at).toLocaleDateString()}
        </span>
      )
    }
  ];

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-blue-700">데이터를 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
            <p className="text-blue-700">등록된 사용자들을 관리하고 새로운 사용자를 추가할 수 있습니다.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Upload size={16} />
              <span>CSV 업로드</span>
            </button>
            <button
              onClick={() => alert('개별 사용자 추가 기능은 추후 구현 예정입니다.')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={16} />
              <span>사용자 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-red-700">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminStatsCard
            title="전체 사용자"
            value={stats.total_users}
            subtitle="명"
            icon={UserCheck}
            color="blue"
          />
          <AdminStatsCard
            title="활성 사용자"
            value={stats.active_users}
            subtitle="명"
            icon={UserCheck}
            color="green"
          />
          <AdminStatsCard
            title="비활성 사용자"
            value={stats.inactive_users}
            subtitle="명"
            icon={UserX}
            color="red"
          />
          <AdminStatsCard
            title="관리자"
            value={stats.role_distribution.admin}
            subtitle="명"
            icon={UserCheck}
            color="purple"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">모든 역할</option>
            <option value="student">학생</option>
            <option value="instructor">강사</option>
            <option value="admin">관리자</option>
          </select>

          {/* Cohort Filter */}
          <select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">모든 기수</option>
            {stats && Object.keys(stats.cohort_distribution).map(cohort => (
              <option key={cohort} value={cohort}>{cohort}</option>
            ))}
          </select>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('');
              setCohortFilter('');
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            초기화
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            사용자 목록 ({totalUsers}명)
          </h3>
        </div>
        
        <AdminTable
          data={users}
          columns={userColumns}
          actions={[
            {
              label: '수정',
              icon: <Edit2 size={16} />,
              onClick: () => alert('사용자 수정 기능은 추후 구현 예정입니다.')
            },
            {
              label: '상태변경',
              icon: <UserCheck size={16} />,
              onClick: handleToggleUserStatus,
              variant: 'secondary' as const
            },
            {
              label: '삭제',
              icon: <Trash2 size={16} />,
              onClick: handleDeleteUser,
              variant: 'danger' as const
            }
          ]}
          loading={loading}
          emptyMessage="조건에 맞는 사용자가 없습니다."
        />

        {/* Pagination */}
        {Math.ceil(totalUsers / pageSize) > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalUsers)} / {totalUsers}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= Math.ceil(totalUsers / pageSize) - 1}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">CSV 사용자 일괄 업로드</h3>
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <UserBulkUpload />
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  loadUsers(); // 업로드 후 목록 새로고침
                  loadStats(); // 통계 새로고침
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
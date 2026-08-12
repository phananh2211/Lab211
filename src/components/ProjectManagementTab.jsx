import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2'; 
import toast from 'react-hot-toast';

export default function ProjectManagementTab({ session, role }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🌟 State quản lý trạng thái loading cục bộ cho các thao tác
  const [actionLoadingId, setActionLoadingId] = useState(null); 
  const [isCreatingProj, setIsCreatingProj] = useState(false); 
  const [isSubmittingTask, setIsSubmittingTask] = useState(false); 

  // Modal State for Lecturers
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskLink, setNewTaskLink] = useState(''); // 🌟 MỚI: Link đính kèm minh chứng cho Task

  // 🌟 MỚI: State quản lý chỉnh sửa / cập nhật link minh chứng & ghi chú thảo luận cho Sinh viên trên mỗi Task
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskProofLink, setTaskProofLink] = useState('');
  const [taskComment, setTaskComment] = useState('');

  // Modal State for Students / Admin
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const currentUser = session?.user?.email;

  // Lấy dữ liệu từ Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Projects
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*, users!projects_student_email_fkey(full_name)')
        .order('id', { ascending: false });

      if (projErr) throw projErr;
      if (projData) setProjects(projData);

      // 2. Fetch Users (Không đổi vì thông tin cơ bản vẫn nằm trọn vẹn ở bảng users)[cite: 15, 21]
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('email, full_name, role')
        .order('full_name');

      if (userErr) throw userErr;
      if (userData && userData.length > 0) {
        setUsers(userData);
      } else {
        setUsers([
          { email: currentUser || 'admin@hust.edu.vn', full_name: 'Quản trị viên / Admin', role: 'Admin' },
          { email: 'student@sis.hust.edu.vn', full_name: 'Nguyễn Văn A', role: 'Student' }
        ]);
      }

      // 3. Fetch Tasks
      const { data: taskData, error: taskErr } = await supabase
        .from('tasks')
        .select('*')
        .order('deadline', { ascending: true });

      if (taskErr) throw taskErr;
      if (taskData) setTasks(taskData);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      toast.error("Khởi tạo dữ liệu thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, role, fetchData]);

  // Duyệt / Chuyển trạng thái đề tài
  const handleApproveProject = async (projId, currentStatus) => {
    const nextStatus = currentStatus === 'Đề xuất' ? 'Đang thực hiện' : 'Đề xuất';

    setActionLoadingId(`approve-${projId}`);
    const { error } = await supabase
      .from('projects')
      .update({ progress_status: nextStatus })
      .eq('id', projId);

    if (error) {
      toast.error("Lỗi cập nhật: " + error.message);
    } else {
      setProjects(prev => prev.map(p => p.id === projId ? { ...p, progress_status: nextStatus } : p));
      toast.success(`Đã chuyển đề tài thành: ${nextStatus}`);
    }
    setActionLoadingId(null);
  };

  // Nút Hoàn thành & Kích hoạt Xóa Tự Động
  const handleCompleteProject = async (projId, projTitle) => {
    Swal.fire({
      title: 'Xác nhận hoàn thành?',
      html: `Đánh dấu hoàn thành đề tài <b>${projTitle}</b>?<br/><br/><span style="color: #dc2626; font-size: 13px;">Lưu ý: Đề tài này cùng toàn bộ danh sách công việc bên trong sẽ được tự động xóa khỏi cơ sở dữ liệu để giải phóng bộ nhớ.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đồng ý, Hoàn thành!',
      cancelButtonText: 'Đóng'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoadingId(`complete-${projId}`);
        const { error } = await supabase
          .from('projects')
          .update({ progress_status: 'Hoàn thành' })
          .eq('id', projId);

        if (error) {
          toast.error("Lỗi khi hoàn thành đề tài: " + error.message);
        } else {
          toast.success("🎉 Đã lưu trữ và dọn dẹp đề tài thành công!");
          setProjects(prev => prev.filter(p => p.id !== projId));
          setTasks(prev => prev.filter(t => t.project_id !== projId));
          
          if (selectedProject?.id === projId) {
            setSelectedProject(null);
          }
        }
        setActionLoadingId(null);
      }
    });
  };

  // Hủy khai báo đề tài
  const handleDeleteMyProject = async (projId, projTitle) => {
    Swal.fire({
      title: 'Hủy khai báo đề tài?',
      html: `Bạn có chắc chắn muốn hủy đề tài <b>${projTitle}</b> này không?<br/><span style="color: #dc2626; font-size: 13px;">Hành động này sẽ xóa đề tài để bạn có thể khai báo lại từ đầu.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Đồng ý, Hủy đề tài',
      cancelButtonText: 'Đóng'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoadingId(`delete-${projId}`);
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projId);

        if (error) {
          toast.error("Lỗi khi hủy đề tài: " + error.message);
        } else {
          toast.success("🗑️ Đã hủy khai báo đề tài thành công!");
          setProjects(prev => prev.filter(p => p.id !== projId));
          setTasks(prev => prev.filter(t => t.project_id !== projId));
        }
        setActionLoadingId(null);
      }
    });
  };

  // Mở Popup giao việc
  const handleOpenTaskPopup = (project) => {
    setSelectedProject(project);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDeadline('');
    setNewTaskLink('');
  };

  // Submit giao việc mới (có đính kèm link tài liệu/minh chứng)
  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;

    const assignedList = Array.isArray(selectedProject.members) && selectedProject.members.length > 0
      ? selectedProject.members
      : [selectedProject.student_email];

    setIsSubmittingTask(true);
    const { error } = await supabase.from('tasks').insert({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      project_id: selectedProject.id,
      assigned_to: assignedList,
      deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
      status: 'Cần làm',
      proof_link: newTaskLink.trim() || null 
    });

    if (error) {
      toast.error("Lỗi giao việc: " + error.message);
    } else {
      toast.success("🎉 Đã giao việc cho nhóm thành công!");
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDeadline('');
      setNewTaskLink('');
      await fetchData();
    }
    setIsSubmittingTask(false);
  };

  // Mở Modal khai báo đề tài
  const handleOpenCreateModal = () => {
    setSelectedMembers(currentUser ? [currentUser] : []);
    setNewProjTitle('');
    setNewProjDesc('');
    setIsCreateModalOpen(true);
  };

  // Submit khai báo đề tài
  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    if (!newProjTitle.trim()) {
      return toast.error("Vui lòng nhập tên đề tài!");
    }

    const membersList = selectedMembers.length > 0 ? selectedMembers : [currentUser];

    setIsCreatingProj(true);
    const { error } = await supabase.from('projects').insert({
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      progress_status: 'Đề xuất',
      student_email: currentUser,
      members: membersList
    });

    if (error) {
      toast.error("Lỗi tạo đề tài: " + error.message);
    } else {
      toast.success("🎉 Khai báo đề tài thành công! Chờ giảng viên duyệt.");
      setIsCreateModalOpen(false);
      await fetchData();
    }
    setIsCreatingProj(false);
  };

  // Cập nhật trạng thái Task
  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const statusMap = {
      'Cần làm': 'Đang làm',
      'Đang làm': 'Hoàn thành',
      'Hoàn thành': 'Cần làm'
    };
    const nextStatus = statusMap[currentStatus] || 'Cần làm';

    const { error } = await supabase
      .from('tasks')
      .update({ status: nextStatus })
      .eq('id', taskId);

    if (error) {
      toast.error("Lỗi cập nhật task: " + error.message);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
      toast.success("Đã cập nhật trạng thái công việc!");
    }
  };

  // 🌟 Cập nhật Link báo cáo minh chứng hoặc Ghi chú thảo luận cho Task
  const handleSaveTaskExtra = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        proof_link: taskProofLink.trim() || null,
        comments: taskComment.trim() || null 
      })
      .eq('id', taskId);

    if (error) {
      toast.error("Lỗi cập nhật thông tin task: " + error.message);
    } else {
      toast.success("✅ Đã lưu cập nhật minh chứng & ghi chú thành công!");
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, proof_link: taskProofLink.trim(), comments: taskComment.trim() } : t));
      setEditingTaskId(null);
    }
  };

  // Kiểm tra đề tài thuộc về user hiện tại
  const myProject = projects.find(p => {
    if (!currentUser) return false;
    const isOwner = p.student_email === currentUser;
    const isMember = Array.isArray(p.members) && p.members.includes(currentUser);
    return isOwner || isMember;
  });

  if (loading && projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        ⏳ Đang tải dữ liệu quản lý đề tài...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ================= VIEW DÀNH CHO GIẢNG VIÊN (LECTURER) ================= */}
      {role === 'Lecturer' && (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>📋 Quản lý Đề tài & Giao nhiều việc</h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Bấm vào thẻ đề tài bất kỳ để mở popup quản lý nhiệm vụ, theo dõi tiến độ và giao deadline.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {projects.map(p => {
              const projectTasks = tasks.filter(t => t.project_id === p.id);
              const completedTasksCount = projectTasks.filter(t => t.status === 'Hoàn thành').length;
              const progressPercent = projectTasks.length > 0 ? Math.round((completedTasksCount / projectTasks.length) * 100) : 0;

              const isApproving = actionLoadingId === `approve-${p.id}`;
              const isCompleting = actionLoadingId === `complete-${p.id}`;

              return (
                <div 
                  key={p.id} 
                  onClick={() => handleOpenTaskPopup(p)}
                  style={{ 
                    border: '2px solid #e5e7eb', borderRadius: '12px', padding: '22px', backgroundColor: '#fff', 
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', backgroundColor: p.progress_status === 'Đang thực hiện' ? '#d1fae5' : '#fef3c7', color: p.progress_status === 'Đang thực hiện' ? '#065f46' : '#92400e' }}>
                      {p.progress_status}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleApproveProject(p.id, p.progress_status); }} 
                        disabled={isApproving || isCompleting}
                        style={{ fontSize: '11px', padding: '4px 10px', background: p.progress_status === 'Đề xuất' ? '#f59e0b' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: (isApproving || isCompleting) ? 0.6 : 1 }}
                      >
                        {isApproving ? '⏳ Xử lý...' : (p.progress_status === 'Đề xuất' ? '✔ Duyệt đề tài' : '↩ Trở về Đề xuất')}
                      </button>
                      
                      {p.progress_status === 'Đang thực hiện' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCompleteProject(p.id, p.title); }} 
                          disabled={isApproving || isCompleting}
                          style={{ fontSize: '11px', padding: '4px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.2)', opacity: (isApproving || isCompleting) ? 0.6 : 1 }}
                        >
                          {isCompleting ? '⏳ Đang xử lý...' : '🏁 Hoàn thành'}
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '17px' }}>{p.title}</h4>
                  <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '15px', lineHeight: '1.5' }}>{p.description || 'Không có mô tả'}</p>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>
                      <span>📊 Tiến độ hoàn thành:</span>
                      <span style={{ color: progressPercent === 100 ? '#059669' : '#2563eb' }}>{progressPercent}% ({completedTasksCount}/{projectTasks.length} task)</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? '#10b981' : '#2563eb', height: '100%', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#374151', marginBottom: '12px', background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px' }}>
                    👥 <b>Thành viên nhóm:</b> {Array.isArray(p.members) && p.members.length ? p.members.join(', ') : p.student_email}
                  </div>

                  <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>📌 Quản lý {projectTasks.length} công việc</span>
                    <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>Chi tiết ➔</span>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>Chưa có đề tài nào được đăng ký.</div>}
          </div>
        </div>
      )}

      {/* ================= VIEW DÀNH CHO SINH VIÊN / ADMIN ================= */}
      {(role === 'Student' || role === 'Admin') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {!myProject ? (
            <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '20px' }}>🎓 Bạn chưa khai báo đề tài nhóm nào</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Hãy khai báo đề tài mới và tích chọn các thành viên thực tế từ danh sách hệ thống phòng lab.</p>
              <button onClick={handleOpenCreateModal} style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>
                + Khai báo đề tài & Chọn thành viên
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '2px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#2563eb', fontSize: '16px' }}>🎓 Đề tài nghiên cứu nhóm</h3>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', padding: '4px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontWeight: 'bold' }}>{myProject.progress_status}</span>
                  
                  {myProject.progress_status === 'Đề xuất' && (
                    <button 
                      onClick={() => handleDeleteMyProject(myProject.id, myProject.title)}
                      disabled={actionLoadingId === `delete-${myProject.id}`}
                      style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: actionLoadingId === `delete-${myProject.id}` ? 0.6 : 1 }}
                    >
                      {actionLoadingId === `delete-${myProject.id}` ? '⏳ Đang xóa...' : '🗑️ Hủy đề tài'}
                    </button>
                  )}
                </div>
              </div>

              <h2 style={{ margin: '10px 0', color: '#111827', fontSize: '22px' }}>{myProject.title}</h2>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{myProject.description}</p>

              {(() => {
                const groupTasks = tasks.filter(t => t.project_id === myProject.id);
                const doneCount = groupTasks.filter(t => t.status === 'Hoàn thành').length;
                const percent = groupTasks.length > 0 ? Math.round((doneCount / groupTasks.length) * 100) : 0;
                return (
                  <div style={{ margin: '15px 0 20px 0', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                      <span>📊 Tiến độ hoàn thành của nhóm:</span>
                      <span style={{ color: percent === 100 ? '#059669' : '#2563eb' }}>{percent}% ({doneCount}/{groupTasks.length} nhiệm vụ)</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, backgroundColor: percent === 100 ? '#10b981' : '#2563eb', height: '100%' }}></div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '10px' }}>
                👥 <b>Thành viên nhóm:</b> {Array.isArray(myProject.members) ? myProject.members.join(', ') : myProject.student_email}
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '25px 0' }}/>
              
              <h4 style={{ margin: '0 0 15px 0', color: '#dc2626', fontSize: '16px' }}>📌 Danh sách công việc được giao cho nhóm</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {tasks.filter(t => t.project_id === myProject.id).map(t => (
                  <div key={t.id} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h5 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#1f2937' }}>{t.title}</h5>
                        <div style={{ fontSize: '13px', color: '#4b5563' }}>{t.description}</div>
                        {t.deadline && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', fontWeight: 'bold' }}>⏰ Deadline: {new Date(t.deadline).toLocaleString('vi-VN')}</div>}
                      </div>
                      
                      <button 
                        onClick={() => handleUpdateTaskStatus(t.id, t.status)} 
                        style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', backgroundColor: t.status === 'Hoàn thành' ? '#d1fae5' : (t.status === 'Đang làm' ? '#dbeafe' : '#fef3c7'), color: t.status === 'Hoàn thành' ? '#065f46' : (t.status === 'Đang làm' ? '#1e40af' : '#92400e') }}
                      >
                        {t.status} (Bấm đổi)
                      </button>
                    </div>

                    <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '10px', fontSize: '13px' }}>
                      {t.proof_link && (
                        <div style={{ marginBottom: '6px' }}>
                          📎 <b>Minh chứng báo cáo:</b> <a href={t.proof_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>{t.proof_link}</a>
                        </div>
                      )}
                      {t.comments && (
                        <div style={{ marginBottom: '6px', color: '#4b5563', fontStyle: 'italic', backgroundColor: '#fff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                          💬 <b>Trao đổi / Ghi chú:</b> {t.comments}
                        </div>
                      )}

                      {editingTaskId === t.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <input 
                            type="text" 
                            placeholder="Dán link Google Drive / GitHub / Overleaf..." 
                            value={taskProofLink} 
                            onChange={e => setTaskProofLink(e.target.value)}
                            style={{ padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }}
                          />
                          <input 
                            type="text" 
                            placeholder="Thêm ghi chú hoặc phản hồi cho giảng viên..." 
                            value={taskComment} 
                            onChange={e => setTaskComment(e.target.value)}
                            style={{ padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%', boxSizing: 'border-box' }}
                          />
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setEditingTaskId(null)} style={{ padding: '5px 10px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Hủy</button>
                            <button onClick={() => handleSaveTaskExtra(t.id)} style={{ padding: '5px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Lưu minh chứng</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setEditingTaskId(t.id); setTaskProofLink(t.proof_link || ''); setTaskComment(t.comments || ''); }}
                          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}
                        >
                          ✏️ {t.proof_link || t.comments ? 'Chỉnh sửa minh chứng / ghi chú' : '+ Thêm link minh chứng báo cáo hoặc ghi chú'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.project_id === myProject.id).length === 0 && <span style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>Chưa có công việc nào được giao cho đề tài này.</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL KHAI BÁO ĐỀ TÀI (STUDENT / ADMIN) ================= */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>✍️ Khai báo Đề tài & Chọn Thành viên từ Hệ thống</h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>✕</button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tên đề tài / Đồ án: *</label>
                <input 
                  type="text" 
                  value={newProjTitle} 
                  onChange={e => setNewProjTitle(e.target.value)} 
                  placeholder="Nhập tên đề tài..." 
                  required 
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} 
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Mô tả chi tiết:</label>
                <textarea 
                  value={newProjDesc} 
                  onChange={e => setNewProjDesc(e.target.value)} 
                  placeholder="Mô tả nội dung nghiên cứu..." 
                  rows="3"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} 
                />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '8px' }}>👥 Chọn thành viên nhóm từ danh sách:</label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px', background: '#f9fafb' }}>
                  {users.map(u => {
                    const isCurrent = u.email === currentUser;
                    return (
                      <div key={u.email} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <input 
                          type="checkbox" 
                          value={u.email} 
                          id={`user-chk-${u.email}`} 
                          checked={selectedMembers.includes(u.email)}
                          disabled={isCurrent}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, u.email]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(email => email !== u.email));
                            }
                          }}
                          style={{ marginRight: '8px', cursor: 'pointer' }} 
                        />
                        <label htmlFor={`user-chk-${u.email}`} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151' }}>
                          <b>{u.full_name}</b> ({u.email}) <span style={{ color: '#6b7280', fontSize: '11px' }}>[{u.role}]</span>
                        </label>
                      </div>
                    );
                  })}
                  {users.length === 0 && <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>Đang tải danh sách thành viên...</div>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '10px 18px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" disabled={isCreatingProj} style={{ padding: '10px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: isCreatingProj ? 0.7 : 1 }}>
                  {isCreatingProj ? '⏳ Đang gửi...' : 'Gửi khai báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL GIAO VIỆC DÀNH CHO GIẢNG VIÊN ================= */}
      {selectedProject && role === 'Lecturer' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>📝 Giao nhiều việc & Quản lý nhiệm vụ nhóm</h3>
              <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>✕</button>
            </div>

            <div style={{ backgroundColor: '#f3f4f6', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '16px' }}>{selectedProject.title}</h4>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>👥 Thành viên nhận việc: <b>{Array.isArray(selectedProject.members) ? selectedProject.members.join(', ') : selectedProject.student_email || 'Chưa phân công'}</b></div>
            </div>

            <form onSubmit={handleAddTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px', backgroundColor: '#fdf8f6', padding: '20px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
              <h4 style={{ margin: '0', color: '#c2410c', fontSize: '15px' }}>+ Giao công việc mới cho đề tài này</h4>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Tên công việc: *</label>
                <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Nhập tiêu đề công việc..." required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Mô tả chi tiết:</label>
                <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Nội dung cần thực hiện..." rows="2" style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Link tài liệu / Tham khảo (tùy chọn):</label>
                <input type="text" value={newTaskLink} onChange={e => setNewTaskLink(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Hạn chót (Deadline):</label>
                <input type="datetime-local" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>

              <button type="submit" disabled={isSubmittingTask} style={{ padding: '10px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: isSubmittingTask ? 0.7 : 1 }}>
                {isSubmittingTask ? '⏳ Đang giao việc...' : 'Giao việc ngay'}
              </button>
            </form>

            <h4 style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '15px' }}>📌 Danh sách công việc đang giao ({tasks.filter(t => t.project_id === selectedProject.id).length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {tasks.filter(t => t.project_id === selectedProject.id).map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#111827' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>{t.description}</div>
                    {t.proof_link && <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>📎 Minh chứng: <a href={t.proof_link} target="_blank" rel="noopener noreferrer">{t.proof_link}</a></div>}
                    {t.comments && <div style={{ fontSize: '11px', color: '#4b5563', fontStyle: 'italic', marginTop: '2px' }}>💬 Ghi chú: {t.comments}</div>}
                    {t.deadline && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', fontWeight: 'bold' }}>⏰ {new Date(t.deadline).toLocaleString('vi-VN')}</div>}
                  </div>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', backgroundColor: t.status === 'Hoàn thành' ? '#d1fae5' : (t.status === 'Đang làm' ? '#dbeafe' : '#fef3c7'), color: t.status === 'Hoàn thành' ? '#065f46' : (t.status === 'Đang làm' ? '#1e40af' : '#92400e'), fontWeight: 'bold' }}>
                    {t.status}
                  </span>
                </div>
              ))}
              {tasks.filter(t => t.project_id === selectedProject.id).length === 0 && <span style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' }}>Chưa có công việc nào.</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
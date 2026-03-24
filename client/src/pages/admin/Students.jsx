import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { DEPARTMENTS, getInitials } from '../../utils/constants';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    // Fetch all requests, extract unique students
    axios.get('/api/requests').then(({ data }) => {
      const studentMap = {};
      (data.requests || []).forEach(r => {
        if (r.student && !studentMap[r.student._id]) {
          studentMap[r.student._id] = { ...r.student, requestCount: 0 };
        }
        if (r.student) studentMap[r.student._id].requestCount++;
      });
      setStudents(Object.values(studentMap));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.name?.toLowerCase().includes(q) || s.rollNo?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    const matchesDept = !deptFilter || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <Layout title="Students" subtitle={`${students.length} students with requests`}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <span>🔍</span>
          <input placeholder="Search by name, roll number, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {DEPARTMENTS.filter(d => d !== 'Administration').map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No students found</h3>
        </div></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Email</th>
                  <th>Total Requests</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {getInitials(s.name)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.rollNo}</td>
                    <td><span style={{ fontSize: 12, background: 'var(--primary-soft)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>{s.department}</span></td>
                    <td style={{ fontSize: 13 }}>{s.year ? `Year ${s.year}` : '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.email}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--primary)' }}>{s.requestCount}</span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/admin/requests?student=${s._id}`)}>
                        View Requests
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Students;

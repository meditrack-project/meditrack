import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import Sidebar from '../components/shared/Sidebar';
import InitialsAvatar from '../components/shared/InitialsAvatar';
import Modal from '../components/shared/Modal';
import { useAuth } from '../hooks/useAuth';
import { userApi } from '../lib/axios';
import './Profile.css';

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '', age: user?.age || '', weight: user?.weight || '',
    blood_group: user?.blood_group || '',
  });
  const [conditions, setConditions] = useState(user?.conditions || []);
  const [condInput, setCondInput] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); setSuccess(''); };

  const addCondition = () => {
    if (condInput.trim() && !conditions.includes(condInput.trim())) {
      setConditions([...conditions, condInput.trim()]);
      setCondInput('');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      const data = { name: form.name, conditions };
      if (form.age) data.age = Number(form.age);
      if (form.weight) data.weight = Number(form.weight);
      if (form.blood_group) data.blood_group = form.blood_group;
      const res = await userApi.put('/api/profile', data);
      if (res.data.success) { updateUser(res.data.data); setSuccess('Profile updated!'); }
    } catch (err) { setError(err.response?.data?.detail?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault(); setPwSaving(true); setPwError(''); setPwSuccess('');
    if (pwForm.new_password !== pwForm.confirm) { setPwError('Passwords do not match'); setPwSaving(false); return; }
    try {
      await userApi.put('/api/profile/password', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwSuccess('Password updated!'); setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { setPwError(err.response?.data?.detail?.message || 'Failed'); }
    finally { setPwSaving(false); }
  };

  const handleDelete = async () => {
    try { await userApi.delete('/api/profile'); logout(); navigate('/'); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header"><h1>My Profile</h1></div>
        <div className="profile-page">
          <div className="profile-card">
            <InitialsAvatar name={user?.name || ''} size={80} />
            <div className="profile-card-info">
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
              <p style={{ fontSize: '0.75rem' }}>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</p>
            </div>
          </div>

          <div className="profile-section">
            <h3>Personal Information</h3>
            {success && <div className="success-box">{success}</div>}
            {error && <div className="error-box">{error}</div>}
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group"><label>Name</label><input name="name" value={form.name} onChange={handleChange} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group"><label>Age</label><input type="number" name="age" value={form.age} onChange={handleChange} /></div>
                <div className="form-group"><label>Weight (kg)</label><input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} /></div>
                <div className="form-group"><label>Blood Group</label>
                  <select name="blood_group" value={form.blood_group} onChange={handleChange}><option value="">Select</option>{BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}</select>
                </div>
              </div>
              <div className="form-group"><label>Conditions</label>
                <div className="conditions-input"><input value={condInput} onChange={(e)=>setCondInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();addCondition();}}} placeholder="Type + Enter" /><button type="button" className="btn-secondary" onClick={addCondition}>Add</button></div>
                <div className="conditions-chips">{conditions.map(c=><span key={c} className="condition-chip">{c}<button type="button" onClick={()=>setConditions(conditions.filter(x=>x!==c))}>×</button></span>)}</div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
            </form>
          </div>

          <div className="profile-section">
            <h3>Change Password</h3>
            {pwSuccess && <div className="success-box">{pwSuccess}</div>}
            {pwError && <div className="error-box">{pwError}</div>}
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group"><label>Current Password</label><div className="password-field"><input type={showPw?'text':'password'} value={pwForm.current_password} onChange={e=>setPwForm({...pwForm,current_password:e.target.value})} /><button type="button" className="password-toggle" onClick={()=>setShowPw(!showPw)}>{showPw?<FiEyeOff size={16}/>:<FiEye size={16}/>}</button></div></div>
              <div className="form-group"><label>New Password</label><input type={showPw?'text':'password'} value={pwForm.new_password} onChange={e=>setPwForm({...pwForm,new_password:e.target.value})} /></div>
              <div className="form-group"><label>Confirm New Password</label><input type={showPw?'text':'password'} value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} /></div>
              <button type="submit" className="btn-primary" disabled={pwSaving}>{pwSaving?'Updating...':'Update Password'}</button>
            </form>
          </div>

          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p>Permanently delete your account and all data. This cannot be undone.</p>
            <button className="btn-danger" onClick={()=>setDeleteModal(true)}>Delete Account</button>
          </div>
        </div>

        <Modal isOpen={deleteModal} onClose={()=>{setDeleteModal(false);setDeleteText('')}} title="Delete Account">
          <p style={{marginBottom:'16px',color:'var(--color-muted)'}}>Type <strong>DELETE</strong> to confirm.</p>
          <div className="delete-confirm-input"><input value={deleteText} onChange={e=>setDeleteText(e.target.value)} placeholder="Type DELETE" style={{width:'100%',padding:'10px 14px',border:'1.5px solid var(--color-danger)',borderRadius:'var(--radius-md)'}} /></div>
          <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
            <button className="btn-secondary" onClick={()=>{setDeleteModal(false);setDeleteText('')}}>Cancel</button>
            <button className="btn-danger-filled" disabled={deleteText!=='DELETE'} onClick={handleDelete}>Delete My Account</button>
          </div>
        </Modal>
      </main>
    </div>
  );
}

export default Profile;

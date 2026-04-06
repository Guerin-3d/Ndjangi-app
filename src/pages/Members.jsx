import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'

function Spinner() {
  return <div className="loading"><div className="spinner" /></div>
}

export default function Members() {
  const { t } = useLang()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slot_label: '' })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data } = await supabase.from('members').select('*').order('name')
    setMembers(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm({ name: '', slot_label: '' })
    setShowModal(true)
  }
  function openEdit(m) {
    setEditing(m)
    setForm({ name: m.name, slot_label: m.slot_label || '' })
    setShowModal(true)
  }
  function closeModal() { setShowModal(false); setEditing(null) }

  async function saveMember() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editing) {
      await supabase.from('members')
        .update({ name: form.name.trim(), slot_label: form.slot_label.trim() || null })
        .eq('id', editing.id)
    } else {
      await supabase.from('members')
        .insert({ name: form.name.trim(), slot_label: form.slot_label.trim() || null })
    }
    setSaving(false)
    closeModal()
    fetchMembers()
  }

  async function deleteMember(id) {
    await supabase.from('members').delete().eq('id', id)
    setConfirmDelete(null)
    fetchMembers()
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.slot_label || '').toLowerCase().includes(search.toLowerCase())
  )

  const nameCounts = {}
  members.forEach(m => { nameCounts[m.name] = (nameCounts[m.name] || 0) + 1 })

  if (loading) return <Spinner />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('members_title')}</h1>
          <div className="page-subtitle">{members.length} {t('members_word')}</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>{t('members_add_btn')}</button>
      </div>

      <div className="search-wrap">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder={t('search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {!loading && members.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>{t('members_empty_title')}</h3>
          <p>{t('members_empty_desc')}</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openAdd}>
            {t('members_add_first_btn')}
          </button>
        </div>
      )}

      {!loading && members.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>{t('none_word')}</h3>
          <p>{t('members_no_result')}</p>
        </div>
      )}

      {filtered.map(m => (
        <div key={m.id} className="member-card">
          <div className="member-avatar">{m.name[0]}</div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            {m.slot_label
              ? <div className="member-slot">{m.slot_label}</div>
              : nameCounts[m.name] > 1
                ? <div className="member-slot" style={{ color: 'var(--orange)' }}>
                    {nameCounts[m.name]} {t('members_slots_label')}
                  </div>
                : null
            }
          </div>
          <div className="member-actions" style={{ flexDirection: 'row', gap: '6px' }}>
            <button className="btn-icon" onClick={() => openEdit(m)} title={t('btn_edit')}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button className="btn-icon danger" onClick={() => setConfirmDelete(m)} title={t('btn_delete')}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-handle" />
            <h2 className="modal-title">
              {editing ? t('member_form_edit_title') : t('member_form_add_title')}
            </h2>
            <div className="form-group">
              <label>{t('member_form_name_label')}</label>
              <input
                autoFocus
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('member_form_name_placeholder')}
                onKeyDown={e => e.key === 'Enter' && saveMember()}
              />
            </div>
            <div className="form-group">
              <label>{t('member_form_slot_label')}</label>
              <input
                value={form.slot_label}
                onChange={e => setForm(f => ({ ...f, slot_label: e.target.value }))}
                placeholder={t('member_form_slot_placeholder')}
              />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                {t('member_form_slot_hint')}
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={closeModal}>{t('btn_cancel')}</button>
              <button
                className="btn btn-primary"
                onClick={saveMember}
                disabled={saving || !form.name.trim()}
              >
                {saving ? '...' : t('btn_save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2 className="modal-title" style={{ color: 'var(--red)' }}>{t('delete_title')}</h2>
            <p style={{ fontSize: '15px', marginBottom: '0.5rem' }}>
              {t('delete_desc')} <strong>{confirmDelete.name}</strong> {t('delete_desc2')}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>{t('btn_cancel')}</button>
              <button className="btn btn-danger" onClick={() => deleteMember(confirmDelete.id)}>
                {t('btn_delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

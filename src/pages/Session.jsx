import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

function Spinner() {
  return <div className="loading"><div className="spinner" /></div>
}

export default function Session() {
  const { t, lang } = useLang()
  const locale = lang === 'fr' ? fr : enUS

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '' })
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => { fetchSession() }, [])

  async function fetchSession() {
    setLoading(true)
    const { data } = await supabase
      .from('sessions').select('*')
      .order('created_at', { ascending: false }).limit(1)
    if (data?.length > 0) {
      setSession(data[0])
      setForm({ name: data[0].name, start_date: data[0].start_date, end_date: data[0].end_date })
    }
    setLoading(false)
  }

  async function saveSession() {
    if (!form.name.trim() || !form.start_date || !form.end_date) {
      setErrorMsg(t('session_form_fill_all'))
      return
    }
    setErrorMsg('')
    setSaving(true)
    if (session) {
      await supabase.from('sessions')
        .update({ name: form.name.trim(), start_date: form.start_date, end_date: form.end_date, is_active: true })
        .eq('id', session.id)
    } else {
      await supabase.from('sessions')
        .insert({ name: form.name.trim(), start_date: form.start_date, end_date: form.end_date, is_active: true })
    }
    setSaving(false)
    setEditing(false)
    setSuccessMsg(t('session_saved_msg'))
    fetchSession()
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const totalDays = session
    ? Math.ceil((new Date(session.end_date) - new Date(session.start_date)) / 86400000)
    : 0
  const daysLeft = session
    ? Math.max(0, Math.ceil((new Date(session.end_date) - new Date()) / 86400000))
    : 0
  const elapsed = Math.max(0, totalDays - daysLeft)
  const progress = totalDays > 0 ? Math.round(elapsed / totalDays * 100) : 0

  if (loading) return <Spinner />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('session_title')}</h1>
        {session && !editing && (
          <button className="btn btn-dark btn-sm" onClick={() => setEditing(true)}>
            {t('session_edit_btn')}
          </button>
        )}
      </div>

      {successMsg && <div className="alert alert-success">✓ {successMsg}</div>}
      {errorMsg && <div className="alert alert-warning">⚠️ {errorMsg}</div>}

      {/* Active session view */}
      {!editing && session && (
        <>
          <div className="session-banner">
            <div>
              <div className="session-banner-name">{session.name}</div>
              <div className="session-banner-dates">
                {format(new Date(session.start_date), 'dd MMMM yyyy', { locale })}
                {' → '}
                {format(new Date(session.end_date), 'dd MMMM yyyy', { locale })}
              </div>
            </div>
            <div className="session-banner-right">
              <div className="session-banner-days">{daysLeft}</div>
              <div className="session-banner-days-label">{t('session_days_left')}</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
            {[
              { value: elapsed, label: t('session_elapsed'), color: 'var(--orange)' },
              { value: totalDays, label: t('session_total_days'), color: 'var(--text)' },
              { value: `${progress}%`, label: t('analytics_rate_label'), color: 'var(--green)' },
            ].map(s => (
              <div key={s.label} className="strip-item">
                <div className="strip-number" style={{ color: s.color }}>{s.value}</div>
                <div className="strip-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {t('session_progress_label')}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--orange)' }}>{progress}%</span>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar p-orange" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Info box */}
          <div className="card" style={{ background: 'var(--gray-100)', border: 'none' }}>
            <div className="card-title">{t('session_info_title')}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {t('session_info_body')}
            </p>
          </div>
        </>
      )}

      {/* No session */}
      {!editing && !session && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>{t('session_empty_title')}</h3>
          <p>{t('session_empty_desc')}</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setEditing(true)}>
            {t('session_create_btn')}
          </button>
        </div>
      )}

      {/* Form */}
      {editing && (
        <div className="card">
          <h2 className="modal-title">
            {session ? t('session_form_edit_title') : t('session_form_add_title')}
          </h2>
          <div className="form-group">
            <label>{t('session_form_name_label')}</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('session_form_name_placeholder')}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>{t('session_form_start_label')}</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>{t('session_form_end_label')}</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="modal-actions">
            {session && (
              <button className="btn btn-ghost" onClick={() => { setEditing(false); setErrorMsg('') }}>
                {t('btn_cancel')}
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={saveSession}
              disabled={saving}
            >
              {saving ? '...' : t('btn_save')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

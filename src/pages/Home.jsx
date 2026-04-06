import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

function Spinner() {
  return (
    <div className="loading">
      <div className="spinner" />
    </div>
  )
}

function ContribBadge({ amount, t }) {
  if (amount >= 2000) return <span className="badge badge-full">✓ {t('status_full')}</span>
  if (amount > 0) return <span className="badge badge-partial">~ {t('status_partial')} {amount.toLocaleString()} fr</span>
  return <span className="badge badge-none">✗ {t('status_none')}</span>
}

export default function Home() {
  const { t, lang } = useLang()
  const locale = lang === 'fr' ? fr : enUS
  const today = format(new Date(), 'yyyy-MM-dd')

  const [session, setSession] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState({})
  const [beneficiaries, setBeneficiaries] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [contribModal, setContribModal] = useState(null)
  const [contribAmount, setContribAmount] = useState('')
  const [benefitModal, setBenefitModal] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const { data: sessions } = await supabase
      .from('sessions').select('*')
      .order('created_at', { ascending: false }).limit(1)
    const sess = sessions?.[0] || null
    setSession(sess)

    const { data: mems } = await supabase.from('members').select('*').order('name')
    setMembers(mems || [])

    if (sess) {
      const { data: contribs } = await supabase
        .from('contributions').select('*')
        .eq('session_id', sess.id).eq('contribution_date', today)
      const map = {}
      contribs?.forEach(c => { map[c.member_id] = c.amount })
      setContributions(map)

      const { data: bens } = await supabase
        .from('beneficiaries').select('*').eq('session_id', sess.id)
      setBeneficiaries(new Set(bens?.map(b => b.member_id) || []))
    }
    setLoading(false)
  }

  async function saveContribution() {
    if (!session || !contribModal) return
    setSaving(true)
    const amount = Math.min(2000, Math.max(0, parseInt(contribAmount) || 0))
    const { data: existing } = await supabase
      .from('contributions').select('id')
      .eq('member_id', contribModal.id)
      .eq('session_id', session.id)
      .eq('contribution_date', today)
    if (existing?.length > 0) {
      await supabase.from('contributions').update({ amount })
        .eq('member_id', contribModal.id)
        .eq('session_id', session.id)
        .eq('contribution_date', today)
    } else {
      await supabase.from('contributions').insert({
        member_id: contribModal.id, session_id: session.id, amount, contribution_date: today
      })
    }
    setSaving(false)
    setContribModal(null)
    loadAll()
  }

  async function appointBeneficiary(member) {
    if (!session) return
    await supabase.from('beneficiaries').insert({
      member_id: member.id, session_id: session.id, benefit_date: today
    })
    setBenefitModal(null)
    loadAll()
  }

  async function removeBeneficiary(memberId) {
    if (!session) return
    await supabase.from('beneficiaries').delete()
      .eq('member_id', memberId).eq('session_id', session.id)
    loadAll()
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.slot_label || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPaidToday = Object.values(contributions).reduce((s, v) => s + v, 0)
  const fullCount = members.filter(m => (contributions[m.id] || 0) >= 2000).length
  const daysLeft = session
    ? Math.max(0, Math.ceil((new Date(session.end_date) - new Date()) / 86400000))
    : 0

  if (loading) return <Spinner />

  return (
    <div>
      {/* Session banner */}
      {session ? (
        <div className="session-banner">
          <div>
            <div className="session-banner-name">{session.name}</div>
            <div className="session-banner-dates">
              {format(new Date(session.start_date), 'dd MMM', { locale })} →{' '}
              {format(new Date(session.end_date), 'dd MMM yyyy', { locale })}
            </div>
          </div>
          <div className="session-banner-right">
            <div className="session-banner-days">{daysLeft}</div>
            <div className="session-banner-days-label">{t('home_days_left')}</div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning">⚠️ {t('home_no_session')}</div>
      )}

      {/* Summary strip */}
      {session && members.length > 0 && (
        <div className="summary-strip">
          <div className="strip-item">
            <div className="strip-number" style={{ color: 'var(--orange)' }}>
              {totalPaidToday.toLocaleString()}
            </div>
            <div className="strip-label">{t('home_today_label')}</div>
          </div>
          <div className="strip-item">
            <div className="strip-number" style={{ color: 'var(--green)' }}>{fullCount}</div>
            <div className="strip-label">{t('home_fully_paid_label')}</div>
          </div>
          <div className="strip-item">
            <div className="strip-number" style={{ color: 'var(--purple)' }}>{beneficiaries.size}</div>
            <div className="strip-label">{t('home_beneficiaries_label')}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('home_title')}</h1>
          <div className="page-subtitle">
            {format(new Date(), 'dd MMMM yyyy', { locale })}
          </div>
        </div>
      </div>

      {/* Search */}
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

      {/* Empty state */}
      {members.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>{t('members_empty_title')}</h3>
          <p>{t('home_no_members')}</p>
        </div>
      )}

      {/* Member list */}
      {filtered.map(m => {
        const amount = contributions[m.id] || 0
        const isBenefited = beneficiaries.has(m.id)
        let avatarClass = 'member-avatar'
        if (isBenefited) avatarClass += ' av-benefited'
        else if (amount >= 2000) avatarClass += ' av-full'
        else if (amount > 0) avatarClass += ' av-partial'
        else avatarClass += ' av-none'

        return (
          <div key={m.id} className={`member-card${isBenefited ? ' benefited' : ''}`}>
            <div className={avatarClass}>{m.name[0]}</div>
            <div className="member-info">
              <div className="member-name">{m.name}</div>
              {m.slot_label && <div className="member-slot">{m.slot_label}</div>}
              <div className="member-badges">
                <ContribBadge amount={amount} t={t} />
                {isBenefited && (
                  <span className="badge badge-benefited">★ {t('status_benefited')}</span>
                )}
              </div>
            </div>
            {session && (
              <div className="member-actions">
                <button
                  className="btn btn-dark btn-sm"
                  onClick={() => { setContribModal(m); setContribAmount(String(amount || '')) }}
                >
                  {t('home_btn_contribution')}
                </button>
                {!isBenefited ? (
                  <button
                    className="btn btn-purple btn-sm"
                    onClick={() => setBenefitModal(m)}
                  >
                    ★ {t('home_btn_appoint')}
                  </button>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeBeneficiary(m.id)}
                  >
                    {t('home_btn_remove')}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Contribution modal */}
      {contribModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setContribModal(null)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2 className="modal-title">{t('contrib_modal_title')}</h2>
            <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '0.5rem' }}>{contribModal.name}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {t('contrib_modal_date')}: {format(new Date(), 'dd MMMM yyyy', { locale })}
            </p>
            <div className="form-group">
              <label>{t('contrib_modal_amount_label')}</label>
              <input
                type="number" min="0" max="2000"
                value={contribAmount}
                onChange={e => setContribAmount(e.target.value)}
                placeholder={t('contrib_modal_amount_hint')}
                autoFocus
              />
            </div>
            <div className="contrib-grid">
              <button
                className={`contrib-option${contribAmount === '0' ? ' sel-none' : ''}`}
                onClick={() => setContribAmount('0')}
              >
                <span className="c-amount">{t('contrib_option_none')}</span>
                <span className="c-label">{t('contrib_option_none_label')}</span>
              </button>
              <button
                className={`contrib-option${contribAmount === '1000' ? ' sel-partial' : ''}`}
                onClick={() => setContribAmount('1000')}
              >
                <span className="c-amount">{t('contrib_option_partial')}</span>
                <span className="c-label">{t('contrib_option_partial_label')}</span>
              </button>
              <button
                className={`contrib-option${contribAmount === '2000' ? ' sel-full' : ''}`}
                onClick={() => setContribAmount('2000')}
              >
                <span className="c-amount">{t('contrib_option_full')}</span>
                <span className="c-label">{t('contrib_option_full_label')}</span>
              </button>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setContribModal(null)}>{t('btn_cancel')}</button>
              <button className="btn btn-primary" onClick={saveContribution} disabled={saving}>
                {saving ? '...' : t('btn_save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary confirm modal */}
      {benefitModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setBenefitModal(null)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2 className="modal-title">{t('benefit_modal_title')}</h2>
            <p style={{ fontSize: '15px', marginBottom: '0.5rem' }}>
              {t('benefit_modal_body')} <strong>{benefitModal.name}</strong> {t('benefit_modal_body2')}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('benefit_modal_note')}</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setBenefitModal(null)}>{t('btn_cancel')}</button>
              <button className="btn btn-purple" onClick={() => appointBeneficiary(benefitModal)}>
                ★ {t('btn_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from '../context/LangContext'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { exportToExcel } from '../utils/export'
import BeneficiariesPage from './BeneficiariesPage'

const DAILY = 2000

function Spinner() {
  return <div className="loading"><div className="spinner" /></div>
}

// Reusable drill-down list for full / partial / none
function DrillList({ title, members, memberTotals, beneficiaryIds, drillType, t, onBack }) {
  return (
    <div>
      <button className="back-btn" onClick={onBack}>{t('btn_back')}</button>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <div className="page-subtitle">{members.length} {t('members_word')}</div>
        </div>
      </div>

      {members.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>{t('drill_empty')}</h3>
        </div>
      )}

      {members.map(m => {
        const amount = memberTotals[m.id] || 0
        let avatarClass = 'member-avatar'
        if (drillType === 'full') avatarClass += ' av-full'
        else if (drillType === 'partial') avatarClass += ' av-partial'
        else avatarClass += ' av-none'

        return (
          <div key={m.id} className="member-card">
            <div className={avatarClass}>{m.name[0]}</div>
            <div className="member-info">
              <div className="member-name">{m.name}</div>
              {m.slot_label && <div className="member-slot">{m.slot_label}</div>}
              <div className="member-badges">
                {drillType === 'full' && (
                  <span className="badge badge-full">✓ {amount.toLocaleString()} fr</span>
                )}
                {drillType === 'partial' && (
                  <span className="badge badge-partial">~ {amount.toLocaleString()} fr</span>
                )}
                {drillType === 'none' && (
                  <span className="badge badge-none">✗ 0 fr</span>
                )}
                {beneficiaryIds.has(m.id) && (
                  <span className="badge badge-benefited">★ {t('status_benefited')}</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '18px', fontWeight: 800,
                color: drillType === 'full' ? 'var(--green)' : drillType === 'partial' ? 'var(--amber)' : 'var(--gray-400)'
              }}>
                {amount.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FCFA</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Analytics() {
  const { t, lang } = useLang()
  const locale = lang === 'fr' ? fr : enUS

  const [session, setSession] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('main') // 'main' | 'full' | 'partial' | 'none' | 'beneficiaries'
  const [exporting, setExporting] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
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
        .from('contributions').select('*').eq('session_id', sess.id)
      setContributions(contribs || [])

      const { data: bens } = await supabase
        .from('beneficiaries').select('*').eq('session_id', sess.id)
      setBeneficiaries(bens || [])
    }
    setLoading(false)
  }

  async function handleExport() {
    if (!session) return
    setExporting(true)
    try {
      exportToExcel({ session, members, contributions, beneficiaries, t })
    } catch (e) {
      alert('Export error: ' + e.message)
    }
    setExporting(false)
  }

  if (loading) return <Spinner />

  if (!session) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>{t('analytics_no_session')}</h3>
        <p>{t('analytics_no_session_desc')}</p>
      </div>
    )
  }

  // ── Calculations ────────────────────────────────────────────────
  const memberTotals = {}
  contributions.forEach(c => {
    memberTotals[c.member_id] = (memberTotals[c.member_id] || 0) + c.amount
  })

  const totalDays = Math.ceil((new Date(session.end_date) - new Date(session.start_date)) / 86400000)
  const elapsed = Math.min(totalDays, Math.max(0, Math.ceil((new Date() - new Date(session.start_date)) / 86400000)))
  const expectedPerMember = elapsed * DAILY
  const totalExpected = members.length * expectedPerMember
  const totalCollected = Object.values(memberTotals).reduce((s, v) => s + v, 0)
  const shortfall = Math.max(0, totalExpected - totalCollected)
  const rate = totalExpected > 0 ? Math.round(totalCollected / totalExpected * 100) : 0

  const fullMembers = members.filter(m => expectedPerMember > 0 && (memberTotals[m.id] || 0) >= expectedPerMember)
  const partialMembers = members.filter(m => { const a = memberTotals[m.id] || 0; return a > 0 && (expectedPerMember === 0 || a < expectedPerMember) })
  const noneMembers = members.filter(m => !memberTotals[m.id] || memberTotals[m.id] === 0)
  const beneficiaryIds = new Set(beneficiaries.map(b => b.member_id))

  // ── Drill-down views ─────────────────────────────────────────────
  if (view === 'beneficiaries') {
    return (
      <BeneficiariesPage
        members={members}
        beneficiaries={beneficiaries}
        onBack={() => setView('main')}
      />
    )
  }

  if (view === 'full') {
    return (
      <DrillList
        title={t('drill_fully_paid')}
        members={fullMembers}
        memberTotals={memberTotals}
        beneficiaryIds={beneficiaryIds}
        drillType="full"
        t={t}
        onBack={() => setView('main')}
      />
    )
  }

  if (view === 'partial') {
    return (
      <DrillList
        title={t('drill_partial')}
        members={partialMembers}
        memberTotals={memberTotals}
        beneficiaryIds={beneficiaryIds}
        drillType="partial"
        t={t}
        onBack={() => setView('main')}
      />
    )
  }

  if (view === 'none') {
    return (
      <DrillList
        title={t('drill_unpaid')}
        members={noneMembers}
        memberTotals={memberTotals}
        beneficiaryIds={beneficiaryIds}
        drillType="none"
        t={t}
        onBack={() => setView('main')}
      />
    )
  }

  // ── Main analytics view ──────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('analytics_title')}</h1>
          <div className="page-subtitle">
            {t('analytics_subtitle_day')} {elapsed}/{totalDays}
          </div>
        </div>
        <button className="btn btn-dark btn-sm" onClick={handleExport} disabled={exporting}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? t('analytics_exporting') : t('analytics_export_btn')}
        </button>
      </div>

      {/* Session banner */}
      <div className="session-banner">
        <div>
          <div className="session-banner-name">{session.name}</div>
          <div className="session-banner-dates">
            {format(new Date(session.start_date), 'dd MMM', { locale })} →{' '}
            {format(new Date(session.end_date), 'dd MMM yyyy', { locale })}
          </div>
        </div>
        <div className="session-banner-right">
          <div className="session-banner-days">{rate}%</div>
          <div className="session-banner-days-label">{t('analytics_rate_label')}</div>
        </div>
      </div>

      {/* Clickable stat cards */}
      <p className="section-label">{t('analytics_click_hint')}</p>
      <div className="stat-grid">
        <div className="stat-card" onClick={() => setView('full')} role="button" tabIndex={0}>
          <div className="stat-number" style={{ color: 'var(--green)' }}>{fullMembers.length}</div>
          <div className="stat-label">{t('analytics_fully_paid')}</div>
          <div className="stat-sub" style={{ color: 'var(--green)' }}>
            {fullMembers.reduce((s, m) => s + (memberTotals[m.id] || 0), 0).toLocaleString()} fr
          </div>
        </div>
        <div className="stat-card" onClick={() => setView('partial')} role="button" tabIndex={0}>
          <div className="stat-number" style={{ color: 'var(--amber)' }}>{partialMembers.length}</div>
          <div className="stat-label">{t('analytics_partial')}</div>
          <div className="stat-sub" style={{ color: 'var(--amber)' }}>
            {partialMembers.reduce((s, m) => s + (memberTotals[m.id] || 0), 0).toLocaleString()} fr
          </div>
        </div>
        <div className="stat-card" onClick={() => setView('none')} role="button" tabIndex={0}>
          <div className="stat-number" style={{ color: 'var(--red)' }}>{noneMembers.length}</div>
          <div className="stat-label">{t('analytics_unpaid')}</div>
          <div className="stat-sub" style={{ color: 'var(--red)' }}>0 fr</div>
        </div>
        <div className="stat-card" onClick={() => setView('beneficiaries')} role="button" tabIndex={0}>
          <div className="stat-number" style={{ color: 'var(--purple)' }}>{beneficiaries.length}</div>
          <div className="stat-label">{t('analytics_beneficiaries')}</div>
          <div className="stat-sub" style={{ color: 'var(--text-muted)' }}>
            {members.length - beneficiaries.length} {t('benef_not_yet')}
          </div>
        </div>
      </div>

      {/* Collection progress */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {t('analytics_collected')}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--orange)' }}>{rate}%</span>
        </div>
        <div className="progress-wrap">
          <div className="progress-bar p-orange" style={{ width: `${rate}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalCollected.toLocaleString()} fr</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{totalExpected.toLocaleString()} fr</span>
        </div>
      </div>

      {/* Financial summary */}
      <div className="money-card">
        <div className="card-title">{t('analytics_financial_title')}</div>
        {[
          { label: t('analytics_total_members'), value: members.length, cls: '' },
          { label: t('analytics_days_elapsed'), value: `${elapsed} / ${totalDays}`, cls: '' },
          { label: t('analytics_expected'), value: `${totalExpected.toLocaleString()} fr`, cls: '' },
          { label: t('analytics_collected'), value: `${totalCollected.toLocaleString()} fr`, cls: 'good' },
          { label: t('analytics_shortfall'), value: `${shortfall.toLocaleString()} fr`, cls: shortfall > 0 ? 'bad' : 'good' },
          { label: t('analytics_rate'), value: `${rate}%`, cls: 'highlight' },
        ].map(r => (
          <div key={r.label} className="money-row">
            <span className="money-row-label">{r.label}</span>
            <span className={`money-row-value ${r.cls}`}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Projection */}
      <div className="money-card">
        <div className="card-title">{t('analytics_projection_title')}</div>
        <div className="money-row">
          <span className="money-row-label">{t('analytics_max_pool')}</span>
          <span className="money-row-value highlight">
            {(members.length * totalDays * DAILY).toLocaleString()} fr
          </span>
        </div>
        <div className="money-row">
          <span className="money-row-label">{t('analytics_per_day')}</span>
          <span className="money-row-value">
            {(members.length * DAILY).toLocaleString()} fr
          </span>
        </div>
      </div>
    </div>
  )
}

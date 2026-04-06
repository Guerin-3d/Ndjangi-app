import { useLang } from '../context/LangContext'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

export default function BeneficiariesPage({ members, beneficiaries, onBack }) {
  const { t, lang } = useLang()
  const locale = lang === 'fr' ? fr : enUS

  const benefitMap = {}
  beneficiaries.forEach(b => { benefitMap[b.member_id] = b.benefit_date })

  const benefitedMembers = members.filter(m => benefitMap[m.id])
  const notYetMembers = members.filter(m => !benefitMap[m.id])
  const pct = members.length > 0 ? Math.round(benefitedMembers.length / members.length * 100) : 0

  return (
    <div>
      <button className="back-btn" onClick={onBack}>{t('btn_back')}</button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('benef_page_title')}</h1>
          <div className="page-subtitle">
            {benefitedMembers.length} / {members.length} {t('members_word')}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {benefitedMembers.length} {t('benef_progress_label')}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--purple)' }}>{pct}%</span>
        </div>
        <div className="progress-wrap">
          <div
            className="progress-bar"
            style={{ width: `${pct}%`, background: 'var(--purple)' }}
          />
        </div>
      </div>

      {/* Already benefited */}
      <div className="section-label">✓ {t('benef_already')} ({benefitedMembers.length})</div>

      {benefitedMembers.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '1.5rem' }}>
          {t('benef_none_yet')}
        </div>
      )}

      {benefitedMembers.map(m => (
        <div key={m.id} className="member-card benefited">
          <div className="member-avatar av-benefited">{m.name[0]}</div>
          <div className="member-info">
            <div className="member-name">{m.name}</div>
            {m.slot_label && <div className="member-slot">{m.slot_label}</div>}
            <div className="member-badges">
              <span className="badge badge-benefited">★ {t('status_benefited')}</span>
              {benefitMap[m.id] && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('benef_date_label')} {format(new Date(benefitMap[m.id]), 'dd MMM yyyy', { locale })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Not yet */}
      <div className="section-label" style={{ marginTop: '1.5rem' }}>
        ○ {t('benef_not_yet')} ({notYetMembers.length})
      </div>

      {notYetMembers.length === 0 && (
        <div className="alert alert-success">🎉 {t('benef_all_done')}</div>
      )}

      {notYetMembers.map(m => (
        <div key={m.id} className="member-card">
          <div className="member-avatar av-none">{m.name[0]}</div>
          <div className="member-info">
            <div className="member-name" style={{ color: 'var(--text-muted)' }}>{m.name}</div>
            {m.slot_label && <div className="member-slot">{m.slot_label}</div>}
            <div className="member-badges">
              <span className="badge badge-none">○ {t('benef_not_yet')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

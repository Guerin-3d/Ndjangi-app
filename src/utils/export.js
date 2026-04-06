import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export function exportToExcel({ session, members, contributions, beneficiaries, t }) {
  const wb = XLSX.utils.book_new()

  const memberMap = {}
  members.forEach(m => {
    memberMap[m.id] = m.slot_label ? `${m.name} (${m.slot_label})` : m.name
  })

  // Sheet 1 — Members
  const ws1 = XLSX.utils.aoa_to_sheet([
    [t('export_col_name'), t('export_col_slot'), t('date_label')],
    ...members.map(m => [
      m.name,
      m.slot_label || '',
      format(new Date(m.created_at), 'dd/MM/yyyy')
    ])
  ])
  ws1['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws1, t('export_sheet_members'))

  // Sheet 2 — Contributions
  const ws2 = XLSX.utils.aoa_to_sheet([
    [t('export_col_name'), t('export_col_date'), t('export_col_amount'), t('export_col_status')],
    ...contributions.map(c => [
      memberMap[c.member_id] || c.member_id,
      format(new Date(c.contribution_date), 'dd/MM/yyyy'),
      c.amount,
      c.amount >= 2000 ? t('status_full') : c.amount > 0 ? t('status_partial') : t('status_none')
    ])
  ])
  ws2['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 16 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws2, t('export_sheet_contributions'))

  // Sheet 3 — Beneficiaries
  const ws3 = XLSX.utils.aoa_to_sheet([
    [t('export_col_name'), t('export_col_benefit_date')],
    ...beneficiaries.map(b => [
      memberMap[b.member_id] || b.member_id,
      format(new Date(b.benefit_date), 'dd/MM/yyyy')
    ])
  ])
  ws3['!cols'] = [{ wch: 28 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws3, t('export_sheet_beneficiaries'))

  // Sheet 4 — Summary
  const totalDays = Math.ceil((new Date(session.end_date) - new Date(session.start_date)) / 86400000)
  const elapsed = Math.min(totalDays, Math.max(0, Math.ceil((new Date() - new Date(session.start_date)) / 86400000)))
  const totalCollected = contributions.reduce((s, c) => s + c.amount, 0)
  const expected = members.length * elapsed * 2000

  const ws4 = XLSX.utils.aoa_to_sheet([
    [t('export_summary_session'), session.name],
    [t('export_summary_start'), format(new Date(session.start_date), 'dd/MM/yyyy')],
    [t('export_summary_end'), format(new Date(session.end_date), 'dd/MM/yyyy')],
    [t('export_summary_members'), members.length],
    [t('export_summary_elapsed'), `${elapsed} / ${totalDays}`],
    [t('export_summary_expected'), `${expected.toLocaleString()} FCFA`],
    [t('export_summary_collected'), `${totalCollected.toLocaleString()} FCFA`],
    [t('export_summary_shortfall'), `${Math.max(0, expected - totalCollected).toLocaleString()} FCFA`],
    [t('export_summary_rate'), `${expected > 0 ? Math.round(totalCollected / expected * 100) : 0}%`],
    [t('export_summary_beneficiaries'), beneficiaries.length],
  ])
  ws4['!cols'] = [{ wch: 22 }, { wch: 22 }]
  XLSX.utils.book_append_sheet(wb, ws4, t('export_sheet_summary'))

  const filename = `Ndjangi_${session.name.replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyyyy')}.xlsx`
  XLSX.writeFile(wb, filename)
}

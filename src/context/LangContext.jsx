import { createContext, useContext, useState, useEffect } from 'react'

// ─── ALL APP TEXT LIVES HERE ───────────────────────────────────────────────
// Every string used in every component must come from t('key').
// If you add a new page, add both fr and en keys here first.

const TRANSLATIONS = {
  fr: {
    // ── Navigation ──
    nav_home: 'Accueil',
    nav_members: 'Membres',
    nav_session: 'Session',
    nav_analytics: 'Analyse',

    // ── Common actions ──
    btn_save: 'Enregistrer',
    btn_cancel: 'Annuler',
    btn_delete: 'Supprimer',
    btn_edit: 'Modifier',
    btn_add: 'Ajouter',
    btn_confirm: 'Confirmer',
    btn_back: '← Retour',
    btn_create: 'Créer',

    // ── Common words ──
    loading: 'Chargement...',
    search_placeholder: 'Rechercher...',
    days: 'jours',
    members_word: 'membres',
    fcfa: 'FCFA',
    day_word: 'Jour',
    of_word: 'sur',
    today: "Aujourd'hui",
    date_label: 'Date',
    name_label: 'Nom',
    yes: 'Oui',
    no: 'Non',
    none_word: 'Aucun',
    all_word: 'Tous',
    total_word: 'Total',

    // ── Status labels ──
    status_full: 'Complet',
    status_partial: 'Partiel',
    status_none: 'Non payé',
    status_benefited: 'Bénéficiaire',

    // ── Home page ──
    home_title: 'Accueil',
    home_subtitle: 'Cotisations du jour',
    home_no_session: 'Aucune session active. Allez dans "Session" pour en créer une.',
    home_no_members: 'Aucun membre enregistré. Allez dans "Membres" pour en ajouter.',
    home_today_label: "Collecté aujourd'hui",
    home_fully_paid_label: 'Complet',
    home_beneficiaries_label: 'Bénéficiaires',
    home_btn_contribution: 'Cotisation',
    home_btn_appoint: 'Désigner',
    home_btn_remove: 'Retirer',
    home_days_left: 'jours restants',

    // ── Contribution modal ──
    contrib_modal_title: 'Enregistrer cotisation',
    contrib_modal_date: 'Date du jour',
    contrib_modal_amount_label: 'Montant cotisé (FCFA)',
    contrib_modal_amount_hint: 'Saisir entre 0 et 2000',
    contrib_option_none: '0 fr',
    contrib_option_none_label: 'Rien',
    contrib_option_partial: '1 000 fr',
    contrib_option_partial_label: 'Partiel',
    contrib_option_full: '2 000 fr',
    contrib_option_full_label: 'Complet',

    // ── Beneficiary modal ──
    benefit_modal_title: 'Désigner bénéficiaire',
    benefit_modal_body: 'Confirmer que',
    benefit_modal_body2: 'est le bénéficiaire du jour ?',
    benefit_modal_note: 'Cette action peut être annulée depuis cette page.',

    // ── Members page ──
    members_title: 'Membres',
    members_add_btn: '+ Ajouter',
    members_empty_title: 'Aucun membre',
    members_empty_desc: 'Commencez par ajouter les membres du groupe.',
    members_add_first_btn: 'Ajouter le premier membre',
    members_no_result: 'Aucun résultat pour cette recherche.',
    members_slots_label: 'slots',

    // ── Member form modal ──
    member_form_add_title: 'Nouveau membre',
    member_form_edit_title: 'Modifier le membre',
    member_form_name_label: 'Nom complet *',
    member_form_name_placeholder: 'Ex: Jean Dupont',
    member_form_slot_label: 'Étiquette de slot (optionnel)',
    member_form_slot_placeholder: 'Ex: Jean (2/5)',
    member_form_slot_hint: 'Utilisez ceci si une personne a plusieurs slots dans le groupe. Chaque slot est traité individuellement.',

    // ── Delete confirm modal ──
    delete_title: 'Supprimer ce membre ?',
    delete_desc: 'Toutes les cotisations et bénéfices de',
    delete_desc2: 'seront également supprimés. Cette action est irréversible.',

    // ── Session page ──
    session_title: 'Session',
    session_edit_btn: 'Modifier',
    session_active_badge: 'Active',
    session_days_left: 'jours restants',
    session_total_days: 'jours au total',
    session_elapsed: 'jours écoulés',
    session_progress_label: 'Progression de la session',
    session_info_title: 'Comment ça marche',
    session_info_body: 'Chaque membre cotise 2 000 FCFA par jour. La session dure environ un mois. Chaque jour, désignez le ou les bénéficiaires. Un membre ne peut bénéficier qu\'une seule fois par session.',
    session_empty_title: 'Aucune session active',
    session_empty_desc: 'Créez une session pour commencer la collecte.',
    session_create_btn: 'Créer une session',

    // ── Session form ──
    session_form_add_title: 'Nouvelle session',
    session_form_edit_title: 'Modifier la session',
    session_form_name_label: 'Nom de la session',
    session_form_name_placeholder: 'Ex: Session Janvier 2025',
    session_form_start_label: 'Date de début',
    session_form_end_label: 'Date de fin',
    session_form_fill_all: 'Veuillez remplir tous les champs.',
    session_saved_msg: 'Session enregistrée avec succès.',

    // ── Analytics page ──
    analytics_title: 'Analyse',
    analytics_subtitle_day: 'Jour',
    analytics_click_hint: 'Cliquez sur une carte pour voir les membres',
    analytics_fully_paid: 'Cotisation complète',
    analytics_partial: 'Cotisation partielle',
    analytics_unpaid: 'Non payés',
    analytics_beneficiaries: 'Bénéficiaires',
    analytics_financial_title: 'Bilan financier',
    analytics_total_members: 'Total membres',
    analytics_days_elapsed: 'Jours écoulés',
    analytics_expected: 'Montant attendu',
    analytics_collected: 'Montant collecté',
    analytics_shortfall: 'Manque à gagner',
    analytics_rate: 'Taux de collecte',
    analytics_projection_title: 'Projection fin de session',
    analytics_max_pool: 'Cagnotte totale max',
    analytics_per_day: 'Par bénéficiaire par jour',
    analytics_export_btn: 'Exporter Excel',
    analytics_exporting: 'Export en cours...',
    analytics_no_session: 'Aucune session active',
    analytics_no_session_desc: 'Créez une session pour voir les analyses.',
    analytics_rate_label: 'Taux',

    // ── Beneficiaries drill-down page ──
    benef_page_title: 'Bénéficiaires',
    benef_already: 'A déjà bénéficié',
    benef_not_yet: "N'a pas encore bénéficié",
    benef_all_done: 'Tous les membres ont bénéficié !',
    benef_none_yet: "Personne n'a encore bénéficié cette session.",
    benef_date_label: 'Le',
    benef_progress_label: 'ont bénéficié',

    // ── Drill-down pages ──
    drill_fully_paid: 'Cotisation complète',
    drill_partial: 'Cotisation partielle',
    drill_unpaid: 'Non payés',
    drill_empty: 'Aucun membre dans cette catégorie.',

    // ── Excel export sheet names ──
    export_sheet_members: 'Membres',
    export_sheet_contributions: 'Cotisations',
    export_sheet_beneficiaries: 'Bénéficiaires',
    export_sheet_summary: 'Résumé',
    export_col_name: 'Nom',
    export_col_slot: 'Slot',
    export_col_date: 'Date',
    export_col_amount: 'Montant (FCFA)',
    export_col_status: 'Statut',
    export_col_benefit_date: 'Date de bénéfice',
    export_summary_session: 'Session',
    export_summary_start: 'Début',
    export_summary_end: 'Fin',
    export_summary_members: 'Membres',
    export_summary_elapsed: 'Jours écoulés',
    export_summary_expected: 'Attendu',
    export_summary_collected: 'Collecté',
    export_summary_shortfall: 'Manque',
    export_summary_rate: 'Taux',
    export_summary_beneficiaries: 'Bénéficiaires',

    // ── Theme ──
    theme_dark: 'Mode sombre',
    theme_light: 'Mode clair',
    lang_switch_label: 'EN',
  },

  en: {
    // ── Navigation ──
    nav_home: 'Home',
    nav_members: 'Members',
    nav_session: 'Session',
    nav_analytics: 'Analytics',

    // ── Common actions ──
    btn_save: 'Save',
    btn_cancel: 'Cancel',
    btn_delete: 'Delete',
    btn_edit: 'Edit',
    btn_add: 'Add',
    btn_confirm: 'Confirm',
    btn_back: '← Back',
    btn_create: 'Create',

    // ── Common words ──
    loading: 'Loading...',
    search_placeholder: 'Search...',
    days: 'days',
    members_word: 'members',
    fcfa: 'FCFA',
    day_word: 'Day',
    of_word: 'of',
    today: 'Today',
    date_label: 'Date',
    name_label: 'Name',
    yes: 'Yes',
    no: 'No',
    none_word: 'None',
    all_word: 'All',
    total_word: 'Total',

    // ── Status labels ──
    status_full: 'Full',
    status_partial: 'Partial',
    status_none: 'Unpaid',
    status_benefited: 'Beneficiary',

    // ── Home page ──
    home_title: 'Home',
    home_subtitle: "Today's contributions",
    home_no_session: 'No active session. Go to "Session" to create one.',
    home_no_members: 'No members registered. Go to "Members" to add some.',
    home_today_label: 'Collected today',
    home_fully_paid_label: 'Full',
    home_beneficiaries_label: 'Beneficiaries',
    home_btn_contribution: 'Contribution',
    home_btn_appoint: 'Appoint',
    home_btn_remove: 'Remove',
    home_days_left: 'days remaining',

    // ── Contribution modal ──
    contrib_modal_title: 'Record contribution',
    contrib_modal_date: "Today's date",
    contrib_modal_amount_label: 'Amount contributed (FCFA)',
    contrib_modal_amount_hint: 'Enter between 0 and 2000',
    contrib_option_none: '0 fr',
    contrib_option_none_label: 'Nothing',
    contrib_option_partial: '1,000 fr',
    contrib_option_partial_label: 'Partial',
    contrib_option_full: '2,000 fr',
    contrib_option_full_label: 'Full',

    // ── Beneficiary modal ──
    benefit_modal_title: 'Appoint beneficiary',
    benefit_modal_body: 'Confirm that',
    benefit_modal_body2: 'is today\'s beneficiary?',
    benefit_modal_note: 'This action can be undone from this page.',

    // ── Members page ──
    members_title: 'Members',
    members_add_btn: '+ Add',
    members_empty_title: 'No members',
    members_empty_desc: 'Start by adding members to the group.',
    members_add_first_btn: 'Add first member',
    members_no_result: 'No results for this search.',
    members_slots_label: 'slots',

    // ── Member form modal ──
    member_form_add_title: 'New member',
    member_form_edit_title: 'Edit member',
    member_form_name_label: 'Full name *',
    member_form_name_placeholder: 'E.g. John Doe',
    member_form_slot_label: 'Slot label (optional)',
    member_form_slot_placeholder: 'E.g. John (2/5)',
    member_form_slot_hint: 'Use this if one person has multiple slots. Each slot is treated individually.',

    // ── Delete confirm modal ──
    delete_title: 'Delete this member?',
    delete_desc: 'All contributions and benefits of',
    delete_desc2: 'will also be deleted. This action cannot be undone.',

    // ── Session page ──
    session_title: 'Session',
    session_edit_btn: 'Edit',
    session_active_badge: 'Active',
    session_days_left: 'days remaining',
    session_total_days: 'total days',
    session_elapsed: 'days elapsed',
    session_progress_label: 'Session progress',
    session_info_title: 'How it works',
    session_info_body: 'Each member contributes 2,000 FCFA per day. A session lasts about one month. Each day, appoint one or more beneficiaries. A member can only benefit once per session.',
    session_empty_title: 'No active session',
    session_empty_desc: 'Create a session to start collecting.',
    session_create_btn: 'Create a session',

    // ── Session form ──
    session_form_add_title: 'New session',
    session_form_edit_title: 'Edit session',
    session_form_name_label: 'Session name',
    session_form_name_placeholder: 'E.g. January 2025 Session',
    session_form_start_label: 'Start date',
    session_form_end_label: 'End date',
    session_form_fill_all: 'Please fill in all fields.',
    session_saved_msg: 'Session saved successfully.',

    // ── Analytics page ──
    analytics_title: 'Analytics',
    analytics_subtitle_day: 'Day',
    analytics_click_hint: 'Click a card to see the members',
    analytics_fully_paid: 'Fully paid',
    analytics_partial: 'Partial payment',
    analytics_unpaid: 'Unpaid',
    analytics_beneficiaries: 'Beneficiaries',
    analytics_financial_title: 'Financial summary',
    analytics_total_members: 'Total members',
    analytics_days_elapsed: 'Days elapsed',
    analytics_expected: 'Expected amount',
    analytics_collected: 'Amount collected',
    analytics_shortfall: 'Shortfall',
    analytics_rate: 'Collection rate',
    analytics_projection_title: 'End-of-session projection',
    analytics_max_pool: 'Total max pool',
    analytics_per_day: 'Per beneficiary per day',
    analytics_export_btn: 'Export Excel',
    analytics_exporting: 'Exporting...',
    analytics_no_session: 'No active session',
    analytics_no_session_desc: 'Create a session to see analytics.',
    analytics_rate_label: 'Rate',

    // ── Beneficiaries drill-down page ──
    benef_page_title: 'Beneficiaries',
    benef_already: 'Already benefited',
    benef_not_yet: 'Has not benefited yet',
    benef_all_done: 'All members have benefited!',
    benef_none_yet: 'Nobody has benefited this session yet.',
    benef_date_label: 'On',
    benef_progress_label: 'have benefited',

    // ── Drill-down pages ──
    drill_fully_paid: 'Fully paid',
    drill_partial: 'Partial payment',
    drill_unpaid: 'Unpaid',
    drill_empty: 'No members in this category.',

    // ── Excel export sheet names ──
    export_sheet_members: 'Members',
    export_sheet_contributions: 'Contributions',
    export_sheet_beneficiaries: 'Beneficiaries',
    export_sheet_summary: 'Summary',
    export_col_name: 'Name',
    export_col_slot: 'Slot',
    export_col_date: 'Date',
    export_col_amount: 'Amount (FCFA)',
    export_col_status: 'Status',
    export_col_benefit_date: 'Benefit date',
    export_summary_session: 'Session',
    export_summary_start: 'Start',
    export_summary_end: 'End',
    export_summary_members: 'Members',
    export_summary_elapsed: 'Days elapsed',
    export_summary_expected: 'Expected',
    export_summary_collected: 'Collected',
    export_summary_shortfall: 'Shortfall',
    export_summary_rate: 'Rate',
    export_summary_beneficiaries: 'Beneficiaries',

    // ── Theme ──
    theme_dark: 'Dark mode',
    theme_light: 'Light mode',
    lang_switch_label: 'FR',
  }
}

// ─── CONTEXT ───────────────────────────────────────────────────────────────

const AppContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('fr')
  const [dark, setDarkState] = useState(false)
  const [ready, setReady] = useState(false)

  // Read saved preferences after mount (safe — no SSR crash)
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('ndjangi_lang')
      const savedDark = localStorage.getItem('ndjangi_dark')
      if (savedLang === 'fr' || savedLang === 'en') setLangState(savedLang)
      if (savedDark === 'true') setDarkState(true)
    } catch (_) { /* ignore */ }
    setReady(true)
  }, [])

  // Apply / remove dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  function setLang(l) {
    setLangState(l)
    try { localStorage.setItem('ndjangi_lang', l) } catch (_) {}
  }

  function toggleDark() {
    setDarkState(prev => {
      const next = !prev
      try { localStorage.setItem('ndjangi_dark', String(next)) } catch (_) {}
      return next
    })
  }

  // t() — the ONLY way text appears in the app
  // reads from TRANSLATIONS[lang] every render, so switching lang
  // immediately re-renders all consumers with new strings
  function t(key) {
    const val = TRANSLATIONS[lang][key]
    if (val === undefined) {
      console.warn(`[i18n] Missing key "${key}" for lang "${lang}"`)
      return key
    }
    return val
  }

  if (!ready) return null

  return (
    <AppContext.Provider value={{ lang, setLang, dark, toggleDark, t }}>
      {children}
    </AppContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}

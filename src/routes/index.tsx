import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'

export const Route = createFileRoute('/')({ component: Home })

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface TrackerItem {
  l: string
  sub: string
  s: 'done' | 'act' | 'pend'
}

interface CRQ {
  id: string
  act: string
  tech: string
  domain: string
  circle: string
  impact: string
  window: string
  host: string
  sched: string
  stage: string
  sla: number
  slaCls: string
  urgency: string
  tracker: TrackerItem[]
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const CRQs: CRQ[] = [
  {id:'CRQ-001',act:'Link Upgrade',tech:'MPLS',domain:'IP Core',circle:'GJ',impact:'SA',window:'03:00–05:00',host:'RTR-BLR01',sched:'Mar 26, 2026',stage:'CAB Approval',sla:85,slaCls:'s-re',urgency:'#dc2626',tracker:[{l:'L1 — Manager',sub:'Approved: Mar 24, 2026 09:00',s:'done'},{l:'L2 — CAB',sub:'Current · Waiting for quorum',s:'act'},{l:'L4 — Implementation',sub:'Upcoming',s:'pend'}]},
  {id:'CMC-031',act:'GPON Config',tech:'GPON',domain:'PVoIcc',circle:'MH',impact:'NSA',window:'02:00–04:00',host:'OLT-MUM01',sched:'Mar 26, 2026',stage:'Stakeholder',sla:45,slaCls:'s-am',urgency:'#d97706',tracker:[{l:'L1 — Manager',sub:'Approved: Mar 23, 2026',s:'done'},{l:'L2 — Stakeholder',sub:'Current · 3/5 approved',s:'act'},{l:'L2 — CAB',sub:'Upcoming',s:'pend'},{l:'L4 — Implementation',sub:'Upcoming',s:'pend'}]},
  {id:'CMP-023',act:'BGP Change',tech:'BGP',domain:'IP Core',circle:'KA',impact:'SA',window:'01:00–03:00',host:'RTR-BNG02',sched:'Mar 26, 2026',stage:'MOP Validation',sla:85,slaCls:'s-re',urgency:'#dc2626',tracker:[{l:'L1 — Manager',sub:'Approved',s:'done'},{l:'L3 — MOP Validation',sub:'Current · Pending MOP review',s:'act'},{l:'L2 — CAB',sub:'Upcoming',s:'pend'}]},
  {id:'CMC-003',act:'BLJ Chang',tech:'BGP',domain:'Packet',circle:'DL',impact:'NSA',window:'04:00–06:00',host:'RTR-DEL03',sched:'Mar 26, 2026',stage:'Authorization',sla:72,slaCls:'s-gr',urgency:'#2563eb',tracker:[{l:'L1 — Authorization',sub:'Current · Pending NOC Manager',s:'act'},{l:'L2 — Stakeholder',sub:'Upcoming',s:'pend'},{l:'L2 — CAB',sub:'Upcoming',s:'pend'}]},
  {id:'CRQ-002',act:'MPLS Reroute',tech:'MPLS',domain:'Optics',circle:'RJ',impact:'SA',window:'00:00–02:00',host:'RTR-JAI01',sched:'Mar 27, 2026',stage:'Stakeholder',sla:38,slaCls:'s-am',urgency:'#d97706',tracker:[{l:'L1 — Manager',sub:'Approved',s:'done'},{l:'L2 — Stakeholder',sub:'Current · 2/4 approved',s:'act'},{l:'L2 — CAB',sub:'Upcoming',s:'pend'}]},
  {id:'CMC-002',act:'Router Swap',tech:'Router',domain:'Embedded',circle:'GJ',impact:'NSA',window:'05:00–07:00',host:'RTR-GAN01',sched:'Mar 27, 2026',stage:'Rejected',sla:0,slaCls:'s-br',urgency:'#9ca3af',tracker:[{l:'L1 — Manager',sub:'Rejected: Mar 22, 2026',s:'done'},{l:'Closed',sub:'CRQ cancelled',s:'done'}]},
  {id:'CRQ-003',act:'BGP Policy Update',tech:'BGP',domain:'IP Core',circle:'MH',impact:'SA',window:'02:00–04:00',host:'RTR-MUM04',sched:'Mar 28, 2026',stage:'MOP Creation',sla:60,slaCls:'s-gr',urgency:'#0d9488',tracker:[{l:'L1 — Manager',sub:'Approved',s:'done'},{l:'L2 — Stakeholder',sub:'Approved',s:'done'},{l:'L3 — MOP Creation',sub:'Current · MOP in progress',s:'act'},{l:'L2 — CAB',sub:'Upcoming',s:'pend'}]},
  {id:'CMC-004',act:'Fiber Splice',tech:'Optics',domain:'Optics',circle:'KA',impact:'SA',window:'01:00–03:00',host:'OLT-BNG03',sched:'Mar 29, 2026',stage:'CAB Approval',sla:30,slaCls:'s-am',urgency:'#d97706',tracker:[{l:'L1 — Manager',sub:'Approved',s:'done'},{l:'L2 — Stakeholder',sub:'Approved',s:'done'},{l:'L2 — CAB',sub:'Current',s:'act'}]},
  {id:'CRQ-004',act:'Router Upgrade',tech:'Router',domain:'IP Core',circle:'RJ',impact:'NSA',window:'03:00–05:00',host:'RTR-JAI02',sched:'Mar 29, 2026',stage:'Authorization',sla:90,slaCls:'s-re',urgency:'#dc2626',tracker:[{l:'L1 — Authorization',sub:'CRITICAL · SLA near breach',s:'act'}]},
  {id:'CMC-005',act:'VLAN Change',tech:'Packet',domain:'Embedded',circle:'DL',impact:'NSA',window:'04:00–06:00',host:'SW-DEL01',sched:'Mar 30, 2026',stage:'Impact Validation',sla:55,slaCls:'s-gr',urgency:'#2563eb',tracker:[{l:'L1 — Manager',sub:'Approved',s:'done'},{l:'Plan & Inventory',sub:'Validated',s:'done'},{l:'Impact Validation',sub:'Current · Running analysis',s:'act'}]},
]

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const stageBadges: Record<string, string> = {
  'Authorization': '<span class="bg bg-te">Authorization</span>',
  'Stakeholder': '<span class="bg bg-am">Stakeholder</span>',
  'CAB Approval': '<span class="bg bg-pu">CAB Approval</span>',
  'MOP Validation': '<span class="bg bg-bl">MOP Validation</span>',
  'MOP Creation': '<span class="bg bg-bl">MOP Creation</span>',
  'Impact Validation': '<span class="bg bg-te">Impact Validation</span>',
  'Rejected': '<span class="bg bg-re">Rejected</span>',
}

const stepMap = ['Authorization','Plan & Inventory','Impact Validation','Stakeholder','MOP Creation','MOP Validation','CAB Approval','Network Exec','Closed']
const stageStep: Record<string, number> = {
  'Authorization':0,'Plan & Inventory':1,'Impact Validation':2,'Stakeholder':3,
  'MOP Creation':4,'MOP Validation':5,'CAB Approval':6,'Network Exec':7,'Closed':8,'Rejected':8,
}

const pgTitles: Record<string, string> = {
  dashboard:'Dashboard', crqs:'All CRQs', myapprovals:'My Approvals',
  cabsessions:'CAB Sessions', cabplanning:'CAB Planning', analytics:'Analytics',
  admin:'Admin Configuration',
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function renderStepper(stage: string): string {
  const active = stageStep[stage] ?? 6
  return stepMap.map((s, i) => {
    const cls = i < active ? 'done' : i === active ? 'active' : 'pend'
    return `<div class="sn ${cls}"><div class="sn-dot"></div>${s}</div>`
  }).join('')
}

function renderTracker(tracker: TrackerItem[]): string {
  return tracker.map((t, i) => {
    const iconCls = t.s === 'done' ? 'tr-done' : t.s === 'act' ? 'tr-act' : 'tr-pend'
    const rowCls = t.s === 'done' ? 'done' : t.s === 'act' ? 'act' : ''
    const icon = t.s === 'done' ? '✓' : t.s === 'act' ? '●' : String(i + 1)
    const bg = t.s === 'done' ? 'bg-gr' : t.s === 'act' ? 'bg-bl' : 'bg-gy'
    return `<div class="tr-row ${rowCls}"><div class="tr-icon ${iconCls}">${icon}</div><div style="flex:1"><div class="tr-lbl">${t.l}</div><div class="tr-sub">${t.sub}</div></div><span class="bg ${bg}" style="font-size:10px">${t.s === 'done' ? 'Done' : t.s === 'act' ? 'Active' : 'Pending'}</span></div>`
  }).join('')
}

function renderCrqDetail(crq: CRQ, onApprove: () => void, onReject: () => void, onDelegate: () => void): string {
  return `
  <div class="det-header">
    <div class="det-id">${crq.id} · Change Request</div>
    <div class="det-title">${crq.act}</div>
    <div class="det-actions">
      <button class="btn btn-ok" id="det-approve-btn">✓ Approve</button>
      <button class="btn btn-no" id="det-reject-btn">✗ Reject</button>
      <button class="btn btn-pu" id="det-delegate-btn">Delegate ▾</button>
      <button class="btn btn-s">Download MOP</button>
    </div>
    <div class="stepper">${renderStepper(crq.stage)}</div>
  </div>
  <div class="det-grid">
    <div class="info-card">
      <div style="font-size:12px;font-weight:600;margin-bottom:10px;color:var(--tx2)">CRQ Information</div>
      <div class="info-rows">
        <div class="ir"><div class="ir-lbl">CRQ No.</div><div class="ir-v" style="font-family:'DM Mono';font-size:12px">${crq.id}</div></div>
        <div class="ir"><div class="ir-lbl">Domain</div><div class="ir-v"><span class="bg bg-bl">${crq.domain}</span></div></div>
        <div class="ir"><div class="ir-lbl">Circle</div><div class="ir-v">${crq.circle}</div></div>
        <div class="ir"><div class="ir-lbl">Technology</div><div class="ir-v">${crq.tech}</div></div>
        <div class="ir"><div class="ir-lbl">Impact</div><div class="ir-v"><span class="bg ${crq.impact === 'SA' ? 'bg-re' : 'bg-gy'}">${crq.impact}</span></div></div>
        <div class="ir"><div class="ir-lbl">Window</div><div class="ir-v">${crq.window}</div></div>
        <div class="ir"><div class="ir-lbl">Hostname</div><div class="ir-v" style="font-family:'DM Mono';font-size:12px">${crq.host}</div></div>
        <div class="ir"><div class="ir-lbl">Scheduled</div><div class="ir-v">${crq.sched}</div></div>
        <div class="ir"><div class="ir-lbl">Stage</div><div class="ir-v">${stageBadges[crq.stage] || crq.stage}</div></div>
        <div class="ir" style="border-bottom:none"><div class="ir-lbl">SLA</div><div class="ir-v"><div class="sla"><div class="slabg" style="width:80px"><div class="slaf ${crq.slaCls}" style="width:${crq.sla}%"></div></div><span class="slap" style="${crq.sla > 75 ? 'color:var(--re)' : crq.sla > 50 ? 'color:var(--am)' : 'color:var(--gr)'}">${crq.sla}%</span></div></div></div>
      </div>
    </div>
    <div class="info-card">
      <div style="font-size:12px;font-weight:600;margin-bottom:10px;color:var(--tx2)">Approval Tracker</div>
      <div class="tracker">${renderTracker(crq.tracker)}</div>
    </div>
  </div>`
}

function renderCrqList(data: CRQ[]): string {
  return data.map(crq => {
    const slaColor = crq.sla > 75 ? 'var(--re)' : crq.sla > 50 ? 'var(--am)' : 'var(--gr)'
    return `<div class="crq-item" id="li-${crq.id}" data-crqid="${crq.id}">
      <div style="position:absolute;top:0;right:0;width:3px;height:100%;background:${crq.urgency};border-radius:0 3px 3px 0"></div>
      <div class="crq-item-top">
        <span class="crq-id">${crq.id}</span>
        <span class="crq-time">${crq.sched}</span>
      </div>
      <div class="crq-title">${crq.act} <span style="font-size:11px;color:var(--tx3)">· ${crq.tech}</span></div>
      <div class="crq-meta">
        ${stageBadges[crq.stage] || `<span class="bg bg-gy">${crq.stage}</span>`}
        <span class="bg bg-gy" style="font-size:10px">${crq.domain}</span>
        <span class="bg bg-gy" style="font-size:10px">${crq.circle}</span>
        <div class="sla" style="margin-left:auto"><div class="slabg" style="width:44px"><div class="slaf ${crq.slaCls}" style="width:${crq.sla}%"></div></div><span class="slap" style="color:${slaColor};font-size:10px">${crq.sla}%</span></div>
      </div>
    </div>`
  }).join('')
}

function renderApprovalList(data: CRQ[]): string {
  const pending = data.filter(c => c.stage !== 'Rejected' && c.stage !== 'Closed')
  return pending.map(crq => {
    const slaColor = crq.sla > 75 ? 'var(--re)' : crq.sla > 50 ? 'var(--am)' : 'var(--gr)'
    return `<div class="crq-item" id="al-${crq.id}" data-approvalid="${crq.id}">
      <div style="position:absolute;top:0;right:0;width:3px;height:100%;background:${crq.urgency};border-radius:0 3px 3px 0"></div>
      <div class="crq-item-top">
        <span class="crq-id">${crq.id}</span>
        <div class="sla"><div class="slabg" style="width:44px"><div class="slaf ${crq.slaCls}" style="width:${crq.sla}%"></div></div><span class="slap" style="color:${slaColor};font-size:10px">${crq.sla}%</span></div>
      </div>
      <div class="crq-title">${crq.act}</div>
      <div class="crq-meta">
        ${stageBadges[crq.stage] || `<span class="bg bg-gy">${crq.stage}</span>`}
        <span class="bg bg-gy" style="font-size:10px">${crq.domain} · ${crq.circle}</span>
      </div>
    </div>`
  }).join('')
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Home() {
  const [activePage, setActivePage] = useState('dashboard')
  const [pageTitle, setPageTitle] = useState('Dashboard')
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false })
  const [cabTab, setCabTab] = useState('cab-my')
  const [admTab, setAdmTab] = useState('adm-approvers')
  const [crqSearch, setCrqSearch] = useState('')
  const [fStage, setFStage] = useState('')
  const [fDomain, setFDomain] = useState('')
  const [fSla, setFSla] = useState('')
  const [selectedCrq, setSelectedCrq] = useState<CRQ | null>(null)
  const [selectedApproval, setSelectedApproval] = useState<CRQ | null>(null)
  const crqDetailRef = useRef<HTMLDivElement>(null)
  const approvalDetailRef = useRef<HTMLDivElement>(null)
  const crqListRef = useRef<HTMLDivElement>(null)
  const approvalListRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openModal = (id: string) => setActiveModal(id)
  const closeModal = () => setActiveModal(null)

  const showToast = useCallback((msg: string) => {
    setToast({ msg, visible: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }, [])

  const go = (id: string) => {
    setActivePage(id)
    setPageTitle(pgTitles[id] || id)
    setSelectedCrq(null)
    setSelectedApproval(null)
  }

  const getFilteredCrqs = () => {
    const q = crqSearch.toLowerCase()
    return CRQs.filter(c => {
      if (q && !c.id.toLowerCase().includes(q) && !c.act.toLowerCase().includes(q) && !c.host.toLowerCase().includes(q)) return false
      if (fStage && c.stage !== fStage) return false
      if (fDomain && c.domain !== fDomain) return false
      if (fSla === 'critical' && c.sla <= 80) return false
      if (fSla === 'warn' && (c.sla < 50 || c.sla > 80)) return false
      if (fSla === 'ok' && c.sla >= 50) return false
      return true
    })
  }

  // Render CRQ list & attach click handlers
  useEffect(() => {
    if (!crqListRef.current) return
    const filtered = getFilteredCrqs()
    crqListRef.current.innerHTML = renderCrqList(filtered)
    const items = crqListRef.current.querySelectorAll('.crq-item')
    items.forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.crqid
        if (!id) return
        items.forEach(e => e.classList.remove('sel'))
        el.classList.add('sel')
        const crq = CRQs.find(c => c.id === id)
        if (crq) setSelectedCrq(crq)
      })
    })
  }, [crqSearch, fStage, fDomain, fSla, activePage])

  // Render approval list & attach click handlers
  useEffect(() => {
    if (!approvalListRef.current) return
    approvalListRef.current.innerHTML = renderApprovalList(CRQs)
    const items = approvalListRef.current.querySelectorAll('.crq-item')
    items.forEach(el => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.approvalid
        if (!id) return
        items.forEach(e => e.classList.remove('sel'))
        el.classList.add('sel')
        const crq = CRQs.find(c => c.id === id)
        if (crq) setSelectedApproval(crq)
      })
    })
  }, [activePage])

  // Render CRQ detail & attach action button handlers
  useEffect(() => {
    if (!crqDetailRef.current) return
    if (!selectedCrq) {
      crqDetailRef.current.innerHTML = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--tx3)"><div style="text-align:center"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:10px;opacity:.4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><div style="font-size:13px">Select a CRQ to view details</div></div></div>`
      return
    }
    crqDetailRef.current.innerHTML = renderCrqDetail(selectedCrq, () => openModal('m-approve'), () => openModal('m-reject'), () => openModal('m-delegate'))
    crqDetailRef.current.querySelector('#det-approve-btn')?.addEventListener('click', () => openModal('m-approve'))
    crqDetailRef.current.querySelector('#det-reject-btn')?.addEventListener('click', () => openModal('m-reject'))
    crqDetailRef.current.querySelector('#det-delegate-btn')?.addEventListener('click', () => openModal('m-delegate'))
  }, [selectedCrq])

  // Render approval detail & attach action button handlers
  useEffect(() => {
    if (!approvalDetailRef.current) return
    if (!selectedApproval) {
      approvalDetailRef.current.innerHTML = `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--tx3)"><div style="text-align:center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px;opacity:.4"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><div style="font-size:13px">Select a CRQ to approve or reject</div></div></div>`
      return
    }
    approvalDetailRef.current.innerHTML = renderCrqDetail(selectedApproval, () => openModal('m-approve'), () => openModal('m-reject'), () => openModal('m-delegate'))
    approvalDetailRef.current.querySelector('#det-approve-btn')?.addEventListener('click', () => openModal('m-approve'))
    approvalDetailRef.current.querySelector('#det-reject-btn')?.addEventListener('click', () => openModal('m-reject'))
    approvalDetailRef.current.querySelector('#det-delegate-btn')?.addEventListener('click', () => openModal('m-delegate'))
  }, [selectedApproval])

  const filteredCrqs = getFilteredCrqs()

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

:root{
  --nav:#0c1428;--nav-h:#162040;--nav-a:#1b3560;
  --ac:#2563eb;--ac2:#1d4ed8;--ac-s:#eff6ff;
  --te:#0d9488;--te-s:#f0fdfa;
  --am:#d97706;--am-s:#fffbeb;
  --re:#dc2626;--re-s:#fef2f2;
  --gr:#16a34a;--gr-s:#f0fdf4;
  --pu:#7c3aed;--pu-s:#f5f3ff;
  --bd:#e5e7eb;--bd2:#f3f4f6;
  --tx:#111827;--tx2:#6b7280;--tx3:#9ca3af;
  --bg:#f1f5f9;--wh:#fff;
  --r:10px;--sh:0 1px 3px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.04);
  --sh2:0 4px 16px rgba(0,0,0,.1);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx);display:flex;height:100vh;overflow:hidden;font-size:14px}
#root{display:flex;width:100%;height:100vh;overflow:hidden}

/* NAV */
.nav{width:210px;min-width:210px;background:var(--nav);display:flex;flex-direction:column;height:100vh;overflow-y:auto}
.nav-logo{padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px}
.logo-mark{width:30px;height:30px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;letter-spacing:-.5px;flex-shrink:0}
.logo-name{color:#fff;font-size:15px;font-weight:600;letter-spacing:-.3px}
.logo-ver{color:rgba(255,255,255,.35);font-size:10px}
.nav-grp{padding:14px 8px 2px}
.nav-grp-lbl{color:rgba(255,255,255,.28);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;padding:0 8px;margin-bottom:3px}
.ni{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,.5);font-size:13px;font-weight:400;transition:all .13s;margin-bottom:1px;position:relative}
.ni:hover{background:var(--nav-h);color:rgba(255,255,255,.8)}
.ni.on{background:var(--nav-a);color:#fff;font-weight:500}
.ni svg{width:15px;height:15px;flex-shrink:0;opacity:.75}
.ni.on svg{opacity:1}
.ni-badge{margin-left:auto;background:var(--ac);color:#fff;font-size:10px;font-weight:600;padding:2px 6px;border-radius:10px;line-height:1.4}
.ni-badge.red{background:var(--re)}
.ni-badge.amber{background:var(--am)}
.nav-foot{margin-top:auto;padding:10px 8px;border-top:1px solid rgba(255,255,255,.07)}
.ucard{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;cursor:pointer}
.ucard:hover{background:var(--nav-h)}
.uav{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#fff;flex-shrink:0}
.uname{color:rgba(255,255,255,.8);font-size:12px;font-weight:500}
.urole{color:rgba(255,255,255,.32);font-size:10px}

/* MAIN SHELL */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{background:var(--wh);border-bottom:1px solid var(--bd);padding:0 20px;height:52px;display:flex;align-items:center;gap:12px;flex-shrink:0}
.page-ttl{font-size:15px;font-weight:600;flex:1}
.tb-actions{display:flex;align-items:center;gap:8px}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .13s;white-space:nowrap}
.btn-p{background:var(--ac);color:#fff}.btn-p:hover{background:var(--ac2)}
.btn-s{background:var(--wh);color:var(--tx);border:1px solid var(--bd)}.btn-s:hover{background:var(--bd2)}
.btn-ok{background:var(--gr-s);color:var(--gr);border:1px solid #86efac}
.btn-no{background:var(--re-s);color:var(--re);border:1px solid #fca5a5}
.btn-warn{background:var(--am-s);color:var(--am);border:1px solid #fcd34d}
.btn-pu{background:var(--pu-s);color:var(--pu);border:1px solid #c4b5fd}
.iBtn{width:32px;height:32px;border-radius:8px;background:var(--wh);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--tx2);transition:all .13s}
.iBtn:hover{background:var(--bd2);color:var(--tx)}

/* CONTENT AREA */
.content{flex:1;overflow:hidden;display:flex;flex-direction:column}
.page{display:none;flex:1;overflow:hidden;flex-direction:column}
.page.on{display:flex}

/* CARDS */
.card{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r);box-shadow:var(--sh)}
.ch{padding:14px 18px;border-bottom:1px solid var(--bd2);display:flex;align-items:center;justify-content:space-between;gap:12px}
.ct{font-size:13px;font-weight:600}
.cb{padding:16px 18px}

/* BADGES */
.bg{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:500;white-space:nowrap}
.bg-bl{background:var(--ac-s);color:var(--ac)}
.bg-te{background:var(--te-s);color:var(--te)}
.bg-am{background:var(--am-s);color:var(--am)}
.bg-re{background:var(--re-s);color:var(--re)}
.bg-gr{background:var(--gr-s);color:var(--gr)}
.bg-pu{background:var(--pu-s);color:var(--pu)}
.bg-gy{background:var(--bd2);color:var(--tx2)}

/* METRICS ROW */
.mx{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px 16px 0;flex-shrink:0}
.mc{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r);padding:14px 16px;position:relative;overflow:hidden}
.mc::after{content:'';position:absolute;top:0;left:0;width:3px;height:100%;border-radius:3px 0 0 3px}
.mc.bl::after{background:var(--ac)}.mc.te::after{background:var(--te)}.mc.am::after{background:var(--am)}.mc.re::after{background:var(--re)}
.mc-lbl{font-size:11px;color:var(--tx2);font-weight:500;margin-bottom:4px}
.mc-v{font-size:24px;font-weight:600;line-height:1;margin-bottom:2px}
.mc.bl .mc-v{color:var(--ac)}.mc.te .mc-v{color:var(--te)}.mc.am .mc-v{color:var(--am)}.mc.re .mc-v{color:var(--re)}
.mc-s{font-size:11px;color:var(--tx3)}

/* SLA */
.sla{display:flex;align-items:center;gap:7px}
.slabg{width:56px;height:5px;border-radius:3px;background:#e5e7eb;overflow:hidden;flex-shrink:0}
.slaf{height:100%;border-radius:3px}
.s-gr{background:#16a34a}.s-am{background:#d97706}.s-re{background:#dc2626}.s-br{background:#9ca3af}
.slap{font-size:11px;font-weight:600;min-width:30px}

/* TABLE */
.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse}
thead th{background:var(--bd2);padding:9px 13px;text-align:left;font-size:11px;font-weight:600;color:var(--tx2);text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
thead th:first-child{border-radius:8px 0 0 8px}
thead th:last-child{border-radius:0 8px 8px 0}
tbody tr{border-bottom:1px solid var(--bd2);transition:background .1s;cursor:pointer}
tbody tr:last-child{border-bottom:none}
tbody tr:hover{background:#f8faff}
tbody tr.selected{background:#eff6ff!important;border-left:3px solid var(--ac)}
td{padding:11px 13px;font-size:13px;vertical-align:middle}

/* SPLIT LAYOUT */
.split{display:flex;flex:1;overflow:hidden;gap:0}
.split-list{width:380px;min-width:300px;border-right:1px solid var(--bd);display:flex;flex-direction:column;background:var(--wh);overflow:hidden;flex-shrink:0}
.split-detail{flex:1;overflow-y:auto;background:var(--bg);padding:16px}

/* CRQ LIST ITEMS */
.crq-list-header{padding:12px 14px;border-bottom:1px solid var(--bd2);display:flex;align-items:center;gap:8px;flex-shrink:0}
.crq-list-header input{flex:1;font-size:12px;padding:6px 10px;border:1px solid var(--bd);border-radius:7px;background:var(--bg);outline:none;font-family:inherit}
.crq-list-header input:focus{border-color:var(--ac)}
.crq-list-scr{overflow-y:auto;flex:1}
.crq-item{padding:12px 14px;border-bottom:1px solid var(--bd2);cursor:pointer;transition:background .1s;position:relative}
.crq-item:hover{background:#f8faff}
.crq-item.sel{background:#eff6ff;border-left:3px solid var(--ac)}
.crq-item-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:5px}
.crq-id{font-size:12px;font-weight:600;color:var(--ac);font-family:'DM Mono',monospace}
.crq-time{font-size:11px;color:var(--tx3)}
.crq-title{font-size:13px;font-weight:500;margin-bottom:4px;color:var(--tx)}
.crq-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}

/* DETAIL PANEL */
.det-header{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r);padding:16px 18px;margin-bottom:14px;box-shadow:var(--sh)}
.det-id{font-size:11px;color:var(--tx3);font-family:'DM Mono';margin-bottom:4px}
.det-title{font-size:17px;font-weight:600;margin-bottom:10px}
.det-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.stepper{display:flex;overflow-x:auto;gap:0;margin-bottom:2px}
.sn{display:flex;align-items:center;gap:5px;padding:5px 12px;font-size:11px;font-weight:500;white-space:nowrap;background:var(--wh);border:1px solid var(--bd);border-right:none}
.sn:first-child{border-radius:7px 0 0 7px}
.sn:last-child{border-radius:0 7px 7px 0;border-right:1px solid var(--bd)}
.sn.done{background:var(--te-s);border-color:#99f6e4;color:var(--te)}
.sn.active{background:var(--ac-s);border-color:#93c5fd;color:var(--ac)}
.sn.pend{color:var(--tx3)}
.sn-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.sn.done .sn-dot{background:var(--te)}.sn.active .sn-dot{background:var(--ac)}.sn.pend .sn-dot{background:var(--bd)}

.det-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.info-card{background:var(--wh);border:1px solid var(--bd);border-radius:var(--r);padding:14px 16px;box-shadow:var(--sh)}
.info-rows{display:grid;grid-template-columns:1fr 1fr;gap:0}
.ir{padding:9px 0;border-bottom:1px solid var(--bd2)}
.ir:nth-last-child(-n+2){border-bottom:none}
.ir-lbl{font-size:10px;color:var(--tx3);font-weight:500;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px}
.ir-v{font-size:13px;font-weight:500}

/* TRACKER */
.tracker{display:flex;flex-direction:column;gap:8px}
.tr-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;border:1px solid var(--bd)}
.tr-row.done{background:var(--te-s);border-color:#99f6e4}
.tr-row.act{background:var(--ac-s);border-color:#93c5fd}
.tr-icon{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0}
.tr-done{background:var(--te-s);color:var(--te);border:1.5px solid #99f6e4}
.tr-act{background:var(--ac-s);color:var(--ac);border:1.5px solid #93c5fd}
.tr-pend{background:var(--bd2);color:var(--tx3);border:1.5px solid var(--bd)}
.tr-lbl{font-size:13px;font-weight:500}
.tr-sub{font-size:11px;color:var(--tx2)}

/* MODAL */
.mbg{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;align-items:center;justify-content:center}
.mbg.open{display:flex}
.modal{background:var(--wh);border-radius:14px;width:460px;max-width:95vw;box-shadow:var(--sh2);overflow:hidden}
.mh{padding:16px 18px;border-bottom:1px solid var(--bd);display:flex;align-items:center;justify-content:space-between}
.mt{font-size:14px;font-weight:600}
.mx-btn{cursor:pointer;color:var(--tx2);font-size:20px;line-height:1}
.mb{padding:18px}
.mf{padding:12px 18px;border-top:1px solid var(--bd);display:flex;gap:8px;justify-content:flex-end}
.fr{margin-bottom:12px}
.fl{font-size:11px;font-weight:500;color:var(--tx2);margin-bottom:4px;display:block}
.fr input,.fr select,.fr textarea{width:100%;font-family:inherit;font-size:13px;padding:8px 11px;border:1px solid var(--bd);border-radius:8px;background:var(--wh);color:var(--tx);outline:none;transition:border .13s}
.fr input:focus,.fr select:focus,.fr textarea:focus{border-color:var(--ac);box-shadow:0 0 0 3px rgba(37,99,235,.09)}

/* TABS */
.tabs{display:flex;border-bottom:1px solid var(--bd);flex-shrink:0;padding:0 16px}
.tab{padding:9px 16px;font-size:12px;font-weight:500;color:var(--tx2);cursor:pointer;border-bottom:2px solid transparent;transition:all .13s;margin-bottom:-1px}
.tab:hover{color:var(--tx)}
.tab.on{color:var(--ac);border-bottom-color:var(--ac)}

/* SCROLLABLE CONTENT */
.scrollable{overflow-y:auto;flex:1;padding:16px}

/* ALERT */
.alert{padding:10px 14px;border-radius:8px;font-size:12px;display:flex;align-items:flex-start;gap:9px;margin-bottom:14px}
.a-info{background:var(--ac-s);color:#1e40af;border:1px solid #bfdbfe}
.a-warn{background:var(--am-s);color:#92400e;border:1px solid #fcd34d}
.a-ok{background:var(--gr-s);color:#166534;border:1px solid #bbf7d0}

/* CHARTS */
.bar-ch{display:flex;align-items:flex-end;gap:8px;height:72px;padding-top:8px}
.bc{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1}
.bb{width:100%;border-radius:4px 4px 0 0;min-height:4px}
.bl{font-size:10px;color:var(--tx3);white-space:nowrap}
.bv{font-size:11px;font-weight:600;color:var(--tx2)}

/* QUORUM */
.qbar{background:#e5e7eb;border-radius:4px;height:7px;overflow:hidden;margin:6px 0}
.qfill{height:100%;background:var(--ac);border-radius:4px}

/* TOAST */
#chm-toast{position:fixed;bottom:20px;right:20px;background:#111827;color:#fff;padding:11px 16px;border-radius:10px;font-size:12px;font-weight:500;box-shadow:var(--sh2);transition:all .28s;z-index:200;max-width:320px;pointer-events:none}

::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}

.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.dv{height:1px;background:var(--bd2);margin:12px 0}
      `}</style>

      {/* NAV */}
      <aside className="nav">
        <div className="nav-logo">
          <div className="logo-mark">CHM</div>
          <div><div className="logo-name">CHM Portal</div><div className="logo-ver">Change Management</div></div>
        </div>
        <div className="nav-grp">
          <div className="nav-grp-lbl">Main</div>
          <div className={`ni${activePage === 'dashboard' ? ' on' : ''}`} onClick={() => go('dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </div>
        </div>
        <div className="nav-grp">
          <div className="nav-grp-lbl">CRQ Management</div>
          <div className={`ni${activePage === 'crqs' ? ' on' : ''}`} onClick={() => go('crqs')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            All CRQs<span className="ni-badge">42</span>
          </div>
          <div className={`ni${activePage === 'myapprovals' ? ' on' : ''}`} onClick={() => go('myapprovals')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            My Approvals<span className="ni-badge red">8</span>
          </div>
        </div>
        <div className="nav-grp">
          <div className="nav-grp-lbl">CAB</div>
          <div className={`ni${activePage === 'cabsessions' ? ' on' : ''}`} onClick={() => go('cabsessions')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            CAB Sessions<span className="ni-badge amber">3</span>
          </div>
          <div className={`ni${activePage === 'cabplanning' ? ' on' : ''}`} onClick={() => go('cabplanning')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            CAB Planning
          </div>
        </div>
        <div className="nav-grp">
          <div className="nav-grp-lbl">Reports</div>
          <div className={`ni${activePage === 'analytics' ? ' on' : ''}`} onClick={() => go('analytics')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Analytics
          </div>
        </div>
        <div className="nav-grp">
          <div className="nav-grp-lbl">Admin</div>
          <div className={`ni${activePage === 'admin' ? ' on' : ''}`} onClick={() => go('admin')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M21 12h-2M5 12H3M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 21v-2M12 5V3"/></svg>
            Admin Config
          </div>
        </div>
        <div className="nav-foot">
          <div className="ucard">
            <div className="uav">AV</div>
            <div><div className="uname">Amit Verma</div><div className="urole">CTO · All Domains</div></div>
          </div>
        </div>
      </aside>

      <main className="main">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="page-ttl">{pageTitle}</div>
          <div className="tb-actions">
            <div className="iBtn" title="Notifications">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            </div>
            <button className="btn btn-p" onClick={() => openModal('m-new-crq')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New CRQ
            </button>
          </div>
        </div>

        <div className="content">

          {/* ═══ DASHBOARD ═══ */}
          <div className={`page${activePage === 'dashboard' ? ' on' : ''}`}>
            <div className="mx">
              <div className="mc bl"><div className="mc-lbl">Total Active CRQs</div><div className="mc-v">42</div><div className="mc-s">↑ 6 from last week</div></div>
              <div className="mc te"><div className="mc-lbl">Pending Approvals</div><div className="mc-v">17</div><div className="mc-s">Awaiting action</div></div>
              <div className="mc am"><div className="mc-lbl">SLA Breaches</div><div className="mc-v">4</div><div className="mc-s">Auto-escalated</div></div>
              <div className="mc re"><div className="mc-lbl">Rejected CRQs</div><div className="mc-v">5</div><div className="mc-s">This week</div></div>
            </div>
            <div className="scrollable">
              <div className="g2" style={{marginBottom:'14px'}}>
                <div className="card">
                  <div className="ch"><div className="ct">CRQ Status</div></div>
                  <div className="cb">
                    <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
                      <svg width="90" height="90" viewBox="0 0 90 90" style={{flexShrink:0}}>
                        <circle cx="45" cy="45" r="34" fill="none" stroke="#e5e7eb" strokeWidth="12"/>
                        <circle cx="45" cy="45" r="34" fill="none" stroke="#2563eb" strokeWidth="12" strokeDasharray="85 129" strokeDashoffset="0" strokeLinecap="round"/>
                        <circle cx="45" cy="45" r="34" fill="none" stroke="#dc2626" strokeWidth="12" strokeDasharray="27 129" strokeDashoffset="-85" strokeLinecap="round"/>
                        <circle cx="45" cy="45" r="34" fill="none" stroke="#d97706" strokeWidth="12" strokeDasharray="17 129" strokeDashoffset="-112" strokeLinecap="round"/>
                        <text x="45" y="41" textAnchor="middle" fontSize="16" fontWeight="600" fill="#111827">42</text>
                        <text x="45" y="53" textAnchor="middle" fontSize="8" fill="#9ca3af">Total</text>
                      </svg>
                      <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'12px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#2563eb'}}></div>Approved <b>27</b></div>
                        <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'12px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#dc2626'}}></div>Rejected <b>8</b></div>
                        <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'12px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#d97706'}}></div>Pending <b>5</b></div>
                        <div style={{display:'flex',alignItems:'center',gap:'7px',fontSize:'12px'}}><div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#0d9488'}}></div>CAB Review <b>2</b></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="ch"><div className="ct">SLA Breaches by Domain</div></div>
                  <div className="cb">
                    <div style={{display:'flex',flexDirection:'column',gap:'9px'}}>
                      <div><div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'3px'}}><span style={{color:'var(--tx2)'}}>IP Core</span><span style={{fontWeight:600,color:'var(--re)'}}>13</span></div><div style={{background:'#e5e7eb',borderRadius:'3px',height:'7px'}}><div style={{background:'#dc2626',width:'85%',height:'100%',borderRadius:'3px'}}></div></div></div>
                      <div><div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'3px'}}><span style={{color:'var(--tx2)'}}>Optics</span><span style={{fontWeight:600,color:'var(--am)'}}>8</span></div><div style={{background:'#e5e7eb',borderRadius:'3px',height:'7px'}}><div style={{background:'#d97706',width:'52%',height:'100%',borderRadius:'3px'}}></div></div></div>
                      <div><div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'3px'}}><span style={{color:'var(--tx2)'}}>Packet</span><span style={{fontWeight:600,color:'var(--ac)'}}>3</span></div><div style={{background:'#e5e7eb',borderRadius:'3px',height:'7px'}}><div style={{background:'#2563eb',width:'20%',height:'100%',borderRadius:'3px'}}></div></div></div>
                      <div><div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'3px'}}><span style={{color:'var(--tx2)'}}>Embedded</span><span style={{fontWeight:600,color:'var(--te)'}}>7</span></div><div style={{background:'#e5e7eb',borderRadius:'3px',height:'7px'}}><div style={{background:'#0d9488',width:'45%',height:'100%',borderRadius:'3px'}}></div></div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card" style={{marginBottom:'14px'}}>
                <div className="ch"><div className="ct">Approval TAT by Stage (avg hrs)</div><select style={{fontSize:'11px',padding:'4px 8px',border:'1px solid var(--bd)',borderRadius:'6px',background:'var(--wh)'}}><option>This Week</option><option>This Month</option></select></div>
                <div className="cb" style={{paddingBottom:'8px'}}>
                  <div className="bar-ch">
                    <div className="bc"><div className="bv">22h</div><div className="bb" style={{height:'68px',background:'#2563eb',opacity:.8}}></div><div className="bl">Authorization</div></div>
                    <div className="bc"><div className="bv">16h</div><div className="bb" style={{height:'48px',background:'#0d9488',opacity:.8}}></div><div className="bl">Scheduling</div></div>
                    <div className="bc"><div className="bv">11h</div><div className="bb" style={{height:'32px',background:'#7c3aed',opacity:.8}}></div><div className="bl">CAB</div></div>
                    <div className="bc"><div className="bv">6h</div><div className="bb" style={{height:'18px',background:'#d97706',opacity:.8}}></div><div className="bl">Implementation</div></div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="ch"><div className="ct">Recent CRQ Activity</div><button className="btn btn-s" onClick={() => go('crqs')}>View all →</button></div>
                <div className="tw">
                  <table>
                    <thead><tr><th>CRQ</th><th>Activity</th><th>Domain</th><th>Stage</th><th>SLA</th><th>Action</th></tr></thead>
                    <tbody>
                      <tr onClick={() => go('crqs')}>
                        <td><span style={{fontFamily:"'DM Mono'",fontSize:'11px',fontWeight:500,color:'var(--ac)'}}>CRQ-001</span></td>
                        <td>Link Upgrade</td><td><span className="bg bg-bl">IP Core</span></td><td><span className="bg bg-pu">CAB Approval</span></td>
                        <td><div className="sla"><div className="slabg"><div className="slaf s-gr" style={{width:'72%'}}></div></div><span className="slap" style={{color:'var(--gr)'}}>72%</span></div></td>
                        <td><button className="btn btn-ok" onClick={e => { e.stopPropagation(); openModal('m-approve') }}>Approve</button></td>
                      </tr>
                      <tr onClick={() => go('crqs')}>
                        <td><span style={{fontFamily:"'DM Mono'",fontSize:'11px',fontWeight:500,color:'var(--ac)'}}>CMC-031</span></td>
                        <td>GPON Config</td><td><span className="bg bg-te">PVoIcc</span></td><td><span className="bg bg-am">Stakeholder</span></td>
                        <td><div className="sla"><div className="slabg"><div className="slaf s-am" style={{width:'45%'}}></div></div><span className="slap" style={{color:'var(--am)'}}>45%</span></div></td>
                        <td><button className="btn btn-no" onClick={e => { e.stopPropagation(); openModal('m-reject') }}>Reject</button></td>
                      </tr>
                      <tr onClick={() => go('crqs')}>
                        <td><span style={{fontFamily:"'DM Mono'",fontSize:'11px',fontWeight:500,color:'var(--re)'}}>CMP-023</span></td>
                        <td>BGP Change</td><td><span className="bg bg-bl">IP Core</span></td><td><span className="bg bg-te">MOP Validation</span></td>
                        <td><div className="sla"><div className="slabg"><div className="slaf s-re" style={{width:'85%'}}></div></div><span className="slap" style={{color:'var(--re)'}}>85%</span></div></td>
                        <td><button className="btn btn-warn">Critical</button></td>
                      </tr>
                      <tr onClick={() => go('crqs')}>
                        <td><span style={{fontFamily:"'DM Mono'",fontSize:'11px',fontWeight:500,color:'var(--ac)'}}>CMC-003</span></td>
                        <td>BLJ Chang</td><td><span className="bg bg-gy">Packet</span></td><td><span className="bg bg-te">Authorization</span></td>
                        <td><div className="sla"><div className="slabg"><div className="slaf s-gr" style={{width:'72%'}}></div></div><span className="slap" style={{color:'var(--gr)'}}>72%</span></div></td>
                        <td><button className="btn btn-ok" onClick={e => { e.stopPropagation(); openModal('m-approve') }}>Approve</button></td>
                      </tr>
                      <tr onClick={() => go('crqs')}>
                        <td><span style={{fontFamily:"'DM Mono'",fontSize:'11px',fontWeight:500,color:'var(--ac)'}}>CRQ-002</span></td>
                        <td>MPLS Reroute</td><td><span className="bg bg-pu">Optics</span></td><td><span className="bg bg-am">Stakeholder</span></td>
                        <td><div className="sla"><div className="slabg"><div className="slaf s-am" style={{width:'38%'}}></div></div><span className="slap" style={{color:'var(--am)'}}>38%</span></div></td>
                        <td><button className="btn btn-ok" onClick={e => { e.stopPropagation(); openModal('m-approve') }}>Approve</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ ALL CRQs — SPLIT PANEL ═══ */}
          <div className={`page${activePage === 'crqs' ? ' on' : ''}`}>
            <div style={{padding:'10px 14px 0',display:'flex',alignItems:'center',gap:'8px',flexShrink:0,background:'var(--wh)',borderBottom:'1px solid var(--bd)'}}>
              <select value={fStage} onChange={e => setFStage(e.target.value)} style={{fontSize:'12px',padding:'5px 9px',border:'1px solid var(--bd)',borderRadius:'7px',background:'var(--wh)',fontFamily:'inherit',marginBottom:'10px'}}>
                <option value="">All Stages</option>
                <option value="Authorization">Authorization</option>
                <option value="CAB Approval">CAB Approval</option>
                <option value="Stakeholder">Stakeholder</option>
                <option value="MOP Validation">MOP Validation</option>
              </select>
              <select value={fDomain} onChange={e => setFDomain(e.target.value)} style={{fontSize:'12px',padding:'5px 9px',border:'1px solid var(--bd)',borderRadius:'7px',background:'var(--wh)',fontFamily:'inherit',marginBottom:'10px'}}>
                <option value="">All Domains</option>
                <option value="IP Core">IP Core</option>
                <option value="Optics">Optics</option>
                <option value="Packet">Packet</option>
                <option value="Embedded">Embedded</option>
              </select>
              <select value={fSla} onChange={e => setFSla(e.target.value)} style={{fontSize:'12px',padding:'5px 9px',border:'1px solid var(--bd)',borderRadius:'7px',background:'var(--wh)',fontFamily:'inherit',marginBottom:'10px'}}>
                <option value="">All SLA</option>
                <option value="critical">Critical (&gt;80%)</option>
                <option value="warn">Warning (50-80%)</option>
                <option value="ok">On Track (&lt;50%)</option>
              </select>
              <div style={{marginLeft:'auto',fontSize:'11px',color:'var(--tx3)',marginBottom:'10px'}}>{filteredCrqs.length} CRQs</div>
            </div>
            <div className="split">
              <div className="split-list">
                <div className="crq-list-header">
                  <input type="text" placeholder="Search CRQ ID, activity, hostname..." value={crqSearch} onChange={e => setCrqSearch(e.target.value)} />
                </div>
                <div className="crq-list-scr" ref={crqListRef}></div>
              </div>
              <div className="split-detail" ref={crqDetailRef}></div>
            </div>
          </div>

          {/* ═══ MY APPROVALS — SPLIT PANEL ═══ */}
          <div className={`page${activePage === 'myapprovals' ? ' on' : ''}`}>
            <div className="split">
              <div className="split-list">
                <div className="crq-list-header">
                  <input type="text" placeholder="Search pending approvals..." />
                  <span className="bg bg-re" style={{flexShrink:0}}>8 pending</span>
                </div>
                <div className="crq-list-scr" ref={approvalListRef}></div>
              </div>
              <div className="split-detail" ref={approvalDetailRef}></div>
            </div>
          </div>

          {/* ═══ CAB SESSIONS ═══ */}
          <div className={`page${activePage === 'cabsessions' ? ' on' : ''}`}>
            <div className="mx">
              <div className="mc bl"><div className="mc-lbl">Active CRQs</div><div className="mc-v">12</div><div className="mc-s">In sessions</div></div>
              <div className="mc am"><div className="mc-lbl">Delegated</div><div className="mc-v">3</div><div className="mc-s">Pending CTO/COH</div></div>
              <div className="mc re"><div className="mc-lbl">Escalated</div><div className="mc-v">2</div><div className="mc-s">L2 escalation</div></div>
              <div className="mc re"><div className="mc-lbl">Rejected</div><div className="mc-v">5</div><div className="mc-s">This cycle</div></div>
            </div>
            <div className="tabs" style={{background:'var(--wh)',borderBottom:'1px solid var(--bd)'}}>
              <div className={`tab${cabTab === 'cab-my' ? ' on' : ''}`} onClick={() => setCabTab('cab-my')}>My Sessions</div>
              <div className={`tab${cabTab === 'cab-all' ? ' on' : ''}`} onClick={() => setCabTab('cab-all')}>All Sessions</div>
            </div>
            <div className="scrollable">
              <div style={{display: cabTab === 'cab-my' ? '' : 'none'}}>
                <div className="alert a-info" style={{marginTop:'4px'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:'1px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  MS Teams invite sent for CAB-031 at 10:00 AM. Join button activates at meeting time.
                </div>
                <div className="card" style={{marginBottom:'14px'}}>
                  <div style={{padding:'14px 16px',borderBottom:'1px solid var(--bd2)'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px'}}>
                      <div>
                        <div style={{fontSize:'14px',fontWeight:600,marginBottom:'3px'}}>CAB Session — CAB-031</div>
                        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',fontSize:'12px',color:'var(--tx2)'}}>
                          <span>Mar 26, 2026 · 10:00 AM</span><span>·</span><span className="bg bg-pu">CAB Approval</span>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                        <button className="btn btn-p" onClick={() => openModal('m-cab-session')}>Join Session</button>
                        <button className="btn btn-s">···</button>
                      </div>
                    </div>
                  </div>
                  <div style={{padding:'0'}}>
                    <div style={{padding:'9px 16px',background:'var(--bd2)',fontSize:'11px',fontWeight:600,color:'var(--tx2)',textTransform:'uppercase',letterSpacing:'.05em',display:'flex',gap:'12px'}}>
                      <span style={{width:'90px'}}>CRQ ID</span><span style={{flex:1}}>Activity</span><span style={{width:'80px'}}>Domain</span><span style={{width:'70px'}}>SLA</span><span style={{width:'90px'}}>Status</span>
                    </div>
                    {[
                      {id:'CRQ-001',act:'Link Upgrade (MPLS)',dom:'IP Core',domCls:'bg-bl',sla:85,slaCls:'s-re',slaColor:'var(--re)'},
                      {id:'CMC-031',act:'GPON Config',dom:'PVoIcc',domCls:'bg-te',sla:45,slaCls:'s-am',slaColor:'var(--am)'},
                      {id:'CMP-023',act:'BGP Change',dom:'IP Core',domCls:'bg-bl',sla:60,slaCls:'s-gr',slaColor:'var(--gr)'},
                    ].map((row, i, arr) => (
                      <div key={row.id} style={{padding:'10px 16px',borderBottom: i < arr.length-1 ? '1px solid var(--bd2)' : 'none',display:'flex',alignItems:'center',gap:'12px',fontSize:'13px',cursor:'pointer'}} onClick={() => openModal('m-cab-session')}>
                        <span style={{width:'90px',fontFamily:"'DM Mono'",fontSize:'12px',fontWeight:500,color:'var(--ac)'}}>{row.id}</span>
                        <span style={{flex:1}}>{row.act}</span>
                        <span style={{width:'80px'}}><span className={`bg ${row.domCls}`}>{row.dom}</span></span>
                        <span style={{width:'70px'}}><div className="sla"><div className="slabg"><div className={`slaf ${row.slaCls}`} style={{width:`${row.sla}%`}}></div></div><span className="slap" style={{color:row.slaColor,fontSize:'10px'}}>{row.sla}%</span></div></span>
                        <span style={{width:'90px'}}><span className="bg bg-am">In Review</span></span>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'12px 16px',background:'var(--bd2)',borderTop:'1px solid var(--bd2)',display:'flex',alignItems:'center',gap:'14px'}}>
                    <div style={{fontSize:'12px',color:'var(--tx2)'}}>Quorum: <b>2/5</b> votes · Mandatory: <b>1/2</b></div>
                    <div style={{flex:1}}><div className="qbar"><div className="qfill" style={{width:'40%'}}></div></div></div>
                    <span className="bg bg-am">Waiting for Quorum</span>
                  </div>
                </div>
                <div className="card" style={{opacity:.72,marginBottom:'14px'}}>
                  <div style={{padding:'14px 16px',borderBottom:'1px solid var(--bd2)'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontSize:'14px',fontWeight:600,marginBottom:'3px'}}>CAB Session — CAB-030</div>
                        <div style={{fontSize:'12px',color:'var(--tx2)'}}>Mar 25, 2026 · 2:00 PM · <span className="bg bg-gr" style={{fontSize:'10px'}}>Completed</span></div>
                      </div>
                      <button className="btn btn-s">View Details</button>
                    </div>
                  </div>
                  <div style={{padding:'9px 16px',background:'var(--bd2)',fontSize:'11px',fontWeight:600,color:'var(--tx2)',textTransform:'uppercase',letterSpacing:'.05em',display:'flex',gap:'12px'}}>
                    <span style={{width:'90px'}}>CRQ ID</span><span style={{flex:1}}>Activity</span><span style={{width:'80px'}}>Domain</span><span style={{width:'100px'}}>Decision</span>
                  </div>
                  {[{id:'CRQ-005',act:'Router Upgrade',dom:'Embedded',domCls:'bg-pu'},{id:'CRQ-006',act:'MPLS Reroute',dom:'IP Core',domCls:'bg-bl'}].map((row,i,arr) => (
                    <div key={row.id} style={{padding:'10px 16px',borderBottom:i<arr.length-1?'1px solid var(--bd2)':'none',display:'flex',alignItems:'center',gap:'12px',fontSize:'13px'}}>
                      <span style={{width:'90px',fontFamily:"'DM Mono'",fontSize:'12px',color:'var(--tx2)'}}>{row.id}</span>
                      <span style={{flex:1}}>{row.act}</span>
                      <span style={{width:'80px'}}><span className={`bg ${row.domCls}`}>{row.dom}</span></span>
                      <span style={{width:'100px'}}><span className="bg bg-gr">Approved</span></span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display: cabTab === 'cab-all' ? '' : 'none'}}>
                <div className="card">
                  <div className="tw">
                    <table>
                      <thead><tr><th>Session ID</th><th>Scheduled</th><th>CRQs</th><th>Quorum</th><th>Status</th><th>Decision</th><th>Action</th></tr></thead>
                      <tbody>
                        <tr><td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>CAB-031</td><td>Mar 26 10:00 AM</td><td>3</td><td>2/5</td><td><span className="bg bg-am">In Progress</span></td><td><span className="bg bg-gy">Pending</span></td><td><button className="btn btn-p btn-s" onClick={() => openModal('m-cab-session')}>Join</button></td></tr>
                        <tr><td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>CAB-030</td><td>Mar 25 2:00 PM</td><td>2</td><td>5/5</td><td><span className="bg bg-gr">Completed</span></td><td><span className="bg bg-gr">Approved</span></td><td><button className="btn btn-s">View</button></td></tr>
                        <tr><td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>CAB-029</td><td>Mar 24 11:00 AM</td><td>4</td><td>4/5</td><td><span className="bg bg-gr">Completed</span></td><td><span className="bg bg-re">Rejected</span></td><td><button className="btn btn-s">View</button></td></tr>
                        <tr><td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>CAB-028</td><td>Mar 22 9:00 AM</td><td>1</td><td>5/5</td><td><span className="bg bg-gr">Completed</span></td><td><span className="bg bg-am">Deferred</span></td><td><button className="btn btn-s">View</button></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CAB PLANNING ═══ */}
          <div className={`page${activePage === 'cabplanning' ? ' on' : ''}`}>
            <div className="scrollable">
              <div className="alert a-warn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:'1px'}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                5 CRQs are ready for CAB session planning. All have completed Authorization, Impact Validation, and MOP approval.
              </div>
              <div className="card">
                <div className="ch"><div className="ct">Waiting Queue — Ready for CAB</div><button className="btn btn-p" onClick={() => openModal('m-plan-session')}>Plan CAB Session</button></div>
                <div className="tw">
                  <table>
                    <thead><tr><th><input type="checkbox" style={{width:'13px',padding:'0'}} /></th><th>CRQ ID</th><th>Activity</th><th>Domain</th><th>Circle</th><th>Impact</th><th>Scheduled</th><th>Status</th></tr></thead>
                    <tbody>
                      {[
                        {id:'CRQ-001',act:'Link Upgrade',dom:'IP Core',domCls:'bg-bl',circle:'GJ',impact:'SA',sched:'Mar 26',status:'Active'},
                        {id:'CRQ-002',act:'GPON Config',dom:'Optics',domCls:'bg-te',circle:'MH',impact:'NSA',sched:'Mar 27',status:'NSA Hold'},
                        {id:'CRQ-003',act:'BGP Change',dom:'Packet',domCls:'bg-gy',circle:'DL',impact:'SA',sched:'Mar 28',status:'Active'},
                        {id:'CRQ-004',act:'Router Upgrade',dom:'Embedded',domCls:'bg-pu',circle:'RJ',impact:'NSA',sched:'Mar 29',status:'Active'},
                        {id:'CRQ-005',act:'MPLS Reroute',dom:'IP Core',domCls:'bg-bl',circle:'KA',impact:'SA',sched:'Mar 30',status:'Active'},
                      ].map(row => (
                        <tr key={row.id}>
                          <td><input type="checkbox" style={{width:'13px',padding:'0'}} /></td>
                          <td style={{fontFamily:"'DM Mono'",fontSize:'11px',color:'var(--ac)'}}>{row.id}</td>
                          <td>{row.act}</td>
                          <td><span className={`bg ${row.domCls}`}>{row.dom}</span></td>
                          <td>{row.circle}</td>
                          <td><span className={`bg ${row.impact === 'SA' ? 'bg-re' : 'bg-gy'}`}>{row.impact}</span></td>
                          <td>{row.sched}</td>
                          <td><span className={`bg ${row.status === 'Active' ? 'bg-gr' : 'bg-am'}`}>{row.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ ANALYTICS ═══ */}
          <div className={`page${activePage === 'analytics' ? ' on' : ''}`}>
            <div className="mx">
              <div className="mc bl"><div className="mc-lbl">Total CRQs (Month)</div><div className="mc-v">127</div><div className="mc-s">↑ 14% vs last month</div></div>
              <div className="mc te"><div className="mc-lbl">Avg Approval TAT</div><div className="mc-v">14h</div><div className="mc-s">↓ 2h improvement</div></div>
              <div className="mc am"><div className="mc-lbl">SLA Compliance</div><div className="mc-v">87%</div><div className="mc-s">Target: 95%</div></div>
              <div className="mc re"><div className="mc-lbl">Rejection Rate</div><div className="mc-v">12%</div><div className="mc-s">↑ 3% increase</div></div>
            </div>
            <div className="scrollable">
              <div className="g2" style={{marginBottom:'14px'}}>
                <div className="card">
                  <div className="ch"><div className="ct">SLA Indicator System</div></div>
                  <div className="cb" style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {[
                      {color:'#16a34a',label:'Green — On Track',sub:'More than 50% time remaining',cls:'s-gr',w:'70%'},
                      {color:'#d97706',label:'Amber — Monitor',sub:'Less than 50% remaining',cls:'s-am',w:'40%'},
                      {color:'#dc2626',label:'Red — Near Breach',sub:'Critical threshold exceeded',cls:'s-re',w:'85%'},
                      {color:'#9ca3af',label:'Breached — Auto-escalated',sub:'SLA crossed · L1→L2→L3 escalation',cls:'s-br',w:'100%'},
                    ].map(row => (
                      <div key={row.label} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <div style={{width:'10px',height:'10px',borderRadius:'50%',background:row.color,flexShrink:0}}></div>
                        <div style={{flex:1}}><div style={{fontSize:'12px',fontWeight:500}}>{row.label}</div><div style={{fontSize:'11px',color:'var(--tx2)'}}>{row.sub}</div></div>
                        <div className="slabg" style={{width:'72px'}}><div className={`slaf ${row.cls}`} style={{width:row.w}}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="ch"><div className="ct">CRQ Volume by Domain</div></div>
                  <div className="cb" style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                    {[
                      {label:'IP Core',val:38,color:'#2563eb',w:'80%'},
                      {label:'Embedded',val:31,color:'#7c3aed',w:'65%'},
                      {label:'Optics',val:29,color:'#0d9488',w:'61%'},
                      {label:'Packet',val:29,color:'#d97706',w:'61%'},
                    ].map(row => (
                      <div key={row.label}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'3px'}}><span>{row.label}</span><span style={{fontWeight:600}}>{row.val}</span></div>
                        <div style={{background:'#e5e7eb',borderRadius:'3px',height:'8px'}}><div style={{background:row.color,width:row.w,height:'100%',borderRadius:'3px'}}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ ADMIN ═══ */}
          <div className={`page${activePage === 'admin' ? ' on' : ''}`}>
            <div className="tabs" style={{background:'var(--wh)',borderBottom:'1px solid var(--bd)',padding:'0 16px'}}>
              {[
                {id:'adm-approvers',label:'Approver Config'},
                {id:'adm-sla',label:'SLA Config'},
                {id:'adm-rejection',label:'Rejection Reasons'},
                {id:'adm-escalation',label:'Escalation Matrix'},
                {id:'adm-users',label:'Users & Roles'},
              ].map(t => (
                <div key={t.id} className={`tab${admTab === t.id ? ' on' : ''}`} onClick={() => setAdmTab(t.id)}>{t.label}</div>
              ))}
            </div>
            <div className="scrollable">
              {/* Approver Config */}
              <div style={{display: admTab === 'adm-approvers' ? '' : 'none'}}>
                <div className="card" style={{marginBottom:'14px'}}>
                  <div className="ch"><div className="ct">Approver Master Configuration</div><div style={{display:'flex',gap:'8px'}}><select style={{fontSize:'12px',padding:'5px 9px',border:'1px solid var(--bd)',borderRadius:'7px',fontFamily:'inherit'}}><option>All Roles</option><option>CTO</option><option>COH</option><option>Manager</option></select><button className="btn btn-p" onClick={() => openModal('m-add-approver')}>+ Add Approver</button></div></div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Name</th><th>OLM ID</th><th>Role</th><th>Approval Levels</th><th>Domains</th><th>Circles</th><th>Delegation</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {[
                          {init:'AV',name:'Amit Verma',olm:'amver01',role:'CTO',roleCls:'bg-pu',level:'L4',domains:'All',circles:'All',deleg:true,active:true},
                          {init:'PD',name:'Priya Deshmukh',olm:'prdesh02',role:'COH',roleCls:'bg-bl',level:'L4',domains:'Optics',circles:'MH, GJ',deleg:true,active:true},
                          {init:'RS',name:'Rahul Sharma',olm:'sharra79',role:'Manager',roleCls:'bg-te',level:'L1, L2',domains:'Embedded',circles:'KA',deleg:false,active:true},
                          {init:'SN',name:'Sheha Nair',olm:'nairsh04',role:'Engineer',roleCls:'bg-gy',level:'L1',domains:'WB',circles:'WB',deleg:false,active:false},
                        ].map(row => (
                          <tr key={row.olm}>
                            <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--pu-s)',color:'var(--pu)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:600}}>{row.init}</div><span style={{fontWeight:500}}>{row.name}</span></div></td>
                            <td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>{row.olm}</td>
                            <td><span className={`bg ${row.roleCls}`}>{row.role}</span></td>
                            <td><span className="bg bg-gy">{row.level}</span></td>
                            <td>{row.domains}</td>
                            <td>{row.circles}</td>
                            <td><span className={`bg ${row.deleg ? 'bg-gr' : 'bg-am'}`}>{row.deleg ? 'Yes' : 'No'}</span></td>
                            <td><span className={`bg ${row.active ? 'bg-gr' : 'bg-re'}`}>{row.active ? 'Active' : 'Inactive'}</span></td>
                            <td><button className="btn btn-s">{row.active ? '···' : 'Activate'}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <div className="ch"><div className="ct">Approval Level Definitions</div></div>
                  <div className="tw"><table>
                    <thead><tr><th>Level</th><th>Typical Meaning</th><th>Roles Mapped</th><th>Default SLA</th><th>Configurable</th></tr></thead>
                    <tbody>
                      <tr><td><span className="bg bg-gy">L1</span></td><td>First-level operational approval</td><td>Engineer, NOC</td><td>8 hrs</td><td><span className="bg bg-gr">Yes</span></td></tr>
                      <tr><td><span className="bg bg-bl">L2</span></td><td>Domain Lead / senior engineer</td><td>Domain SPOC, CAB</td><td>12 hrs</td><td><span className="bg bg-gr">Yes</span></td></tr>
                      <tr><td><span className="bg bg-te">L3</span></td><td>Management / escalation</td><td>Manager</td><td>16 hrs</td><td><span className="bg bg-gr">Yes</span></td></tr>
                      <tr><td><span className="bg bg-pu">L4</span></td><td>Top-level authority</td><td>CTO, COH</td><td>24 hrs</td><td><span className="bg bg-gr">Yes</span></td></tr>
                    </tbody>
                  </table></div>
                  <div style={{padding:'10px 16px',borderTop:'1px solid var(--bd2)'}}><div className="alert a-info" style={{margin:'0',fontSize:'11px'}}>CTO/COH are configurable at any level. Hardcoding CTO = L4 is explicitly avoided in the system design.</div></div>
                </div>
              </div>
              {/* SLA Config */}
              <div style={{display: admTab === 'adm-sla' ? '' : 'none'}}>
                <div className="card"><div className="ch"><div className="ct">SLA Configuration by Stage</div><button className="btn btn-p">+ Add Rule</button></div>
                <div className="tw"><table><thead><tr><th>Stage</th><th>SLA Hours</th><th>Warning Threshold</th><th>Critical Threshold</th><th>Status</th><th>Action</th></tr></thead><tbody>
                  <tr><td>Authorization Approval</td><td>24 hrs</td><td>50%</td><td>80%</td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                  <tr><td>Stakeholder Approvals</td><td>12 hrs</td><td>50%</td><td>80%</td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                  <tr><td>CAB Approval</td><td>48 hrs</td><td>40%</td><td>75%</td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                  <tr><td>MOP Validation</td><td>8 hrs</td><td>50%</td><td>80%</td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                </tbody></table></div></div>
              </div>
              {/* Rejection Reasons */}
              <div style={{display: admTab === 'adm-rejection' ? '' : 'none'}}>
                <div className="card"><div className="ch"><div className="ct">Rejection Reason Configuration</div><button className="btn btn-p">+ Add Reason</button></div>
                <div className="tw"><table><thead><tr><th>Stage</th><th>Reason</th><th>Mandatory Comments</th><th>Status</th><th>Action</th></tr></thead><tbody>
                  <tr><td>All Stages</td><td>Implementation Window Overlap</td><td><span className="bg bg-gr">Yes</span></td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                  <tr><td>Authorization</td><td>Incorrect Approval Mapping</td><td><span className="bg bg-gr">Yes</span></td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                  <tr><td>CAB Approval</td><td>Conflicting Change</td><td><span className="bg bg-gr">Yes</span></td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                </tbody></table></div></div>
              </div>
              {/* Escalation Matrix */}
              <div style={{display: admTab === 'adm-escalation' ? '' : 'none'}}>
                <div className="card"><div className="ch"><div className="ct">Escalation Matrix</div><button className="btn btn-p">+ Add Level</button></div>
                <div className="tw"><table><thead><tr><th>Level</th><th>Trigger</th><th>Escalate To</th><th>Channel</th><th>Delay</th><th>Status</th></tr></thead><tbody>
                  <tr><td><span className="bg bg-gy">L1</span></td><td>SLA Breach</td><td>Domain Manager</td><td>Email + Portal</td><td>Immediate</td><td><span className="bg bg-gr">Active</span></td></tr>
                  <tr><td><span className="bg bg-bl">L2</span></td><td>L1 No Response</td><td>Circle Manager</td><td>Email + Portal</td><td>+2 hrs</td><td><span className="bg bg-gr">Active</span></td></tr>
                  <tr><td><span className="bg bg-te">L3</span></td><td>L2 No Response</td><td>NOC Head</td><td>Email + SMS</td><td>+4 hrs</td><td><span className="bg bg-gr">Active</span></td></tr>
                </tbody></table></div></div>
              </div>
              {/* Users & Roles */}
              <div style={{display: admTab === 'adm-users' ? '' : 'none'}}>
                <div className="card"><div className="ch"><div className="ct">Users & Role Management</div><div style={{display:'flex',gap:'8px'}}><input placeholder="Search users..." style={{fontSize:'12px',padding:'5px 10px',border:'1px solid var(--bd)',borderRadius:'7px',fontFamily:'inherit',width:'180px'}} /><button className="btn btn-p">+ Add User</button></div></div>
                <div className="tw"><table><thead><tr><th>Name</th><th>OLM ID</th><th>Role</th><th>Domain</th><th>Last Active</th><th>Status</th><th>Action</th></tr></thead><tbody>
                  <tr><td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--pu-s)',color:'var(--pu)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:600}}>AV</div>Amit Verma</div></td><td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>amver01</td><td><span className="bg bg-pu">CTO</span></td><td>All</td><td>Today</td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                  <tr><td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--ac-s)',color:'var(--ac)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:600}}>PD</div>Priya Deshmukh</div></td><td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>prdesh02</td><td><span className="bg bg-bl">COH</span></td><td>Optics</td><td>Today</td><td><span className="bg bg-gr">Active</span></td><td><button className="btn btn-s">Edit</button></td></tr>
                  <tr><td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--bd2)',color:'var(--tx2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:600}}>SN</div>Sheha Nair</div></td><td style={{fontFamily:"'DM Mono'",fontSize:'11px'}}>nairsh04</td><td><span className="bg bg-gy">Engineer</span></td><td>WB</td><td>5 days ago</td><td><span className="bg bg-re">Inactive</span></td><td><button className="btn btn-s">Activate</button></td></tr>
                </tbody></table></div></div>
              </div>
            </div>
          </div>

        </div>{/* end content */}
      </main>

      {/* ═══ MODALS ═══ */}
      {/* Approve Modal */}
      <div className={`mbg${activeModal === 'm-approve' ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal">
          <div className="mh"><div className="mt">Approve CRQ</div><div className="mx-btn" onClick={closeModal}>×</div></div>
          <div className="mb">
            <div style={{background:'var(--bg)',borderRadius:'8px',padding:'12px',marginBottom:'14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',fontSize:'12px'}}>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>CRQ ID</div><div style={{fontFamily:"'DM Mono'",fontWeight:500}}>{selectedCrq?.id || 'CRQ-001'}</div></div>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>Approver</div><div style={{fontWeight:500}}>Amit Verma</div></div>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>Domain</div><div><span className="bg bg-bl">IP Core</span></div></div>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>OLM ID</div><div style={{fontFamily:"'DM Mono'"}}>A1L575DH</div></div>
            </div>
            <div className="fr"><label className="fl">Comments (Optional)</label><textarea rows={3} placeholder="Add your comments..."></textarea></div>
          </div>
          <div className="mf">
            <button className="btn btn-s" onClick={closeModal}>Cancel</button>
            <button className="btn btn-ok" onClick={() => { closeModal(); showToast('CRQ approved successfully') }}>✓ Confirm Approval</button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <div className={`mbg${activeModal === 'm-reject' ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal">
          <div className="mh"><div className="mt">Reject CRQ</div><div className="mx-btn" onClick={closeModal}>×</div></div>
          <div className="mb">
            <div style={{background:'var(--bg)',borderRadius:'8px',padding:'12px',marginBottom:'14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',fontSize:'12px'}}>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>CRQ ID</div><div style={{fontFamily:"'DM Mono'",fontWeight:500}}>CRQ-001</div></div>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>Approver</div><div style={{fontWeight:500}}>Amit Verma</div></div>
            </div>
            <div className="fr"><label className="fl">Reason for Rejection *</label><select><option>— Select reason —</option><option>Implementation Window Overlap</option><option>Incorrect Approval Mapping</option><option>Conflicting Change</option><option>Insufficient Impact Analysis</option></select></div>
            <div className="fr"><label className="fl">Additional Comments * (Mandatory)</label><textarea rows={3} placeholder="Provide detailed rejection reason..."></textarea></div>
          </div>
          <div className="mf">
            <button className="btn btn-s" onClick={closeModal}>Cancel</button>
            <button className="btn btn-no" onClick={() => { closeModal(); showToast('CRQ rejected and status updated') }}>✗ Confirm Rejection</button>
          </div>
        </div>
      </div>

      {/* Delegate Modal */}
      <div className={`mbg${activeModal === 'm-delegate' ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal">
          <div className="mh"><div className="mt">Delegate Change</div><div className="mx-btn" onClick={closeModal}>×</div></div>
          <div className="mb">
            <div style={{background:'var(--bg)',borderRadius:'8px',padding:'12px',marginBottom:'14px',fontSize:'12px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>Delegator</div><div style={{fontWeight:500}}>Anil Kumar</div></div>
              <div><div style={{color:'var(--tx3)',marginBottom:'2px'}}>OLM ID</div><div style={{fontFamily:"'DM Mono'"}}>A1D389FG</div></div>
            </div>
            <div className="fr"><label className="fl">Delegate To *</label><select><option>— Select approver —</option><option>Suresh Sharma</option><option>Priya Deshmukh</option><option>Rahul Sharma</option></select></div>
            <div style={{display:'flex',gap:'16px',marginBottom:'12px'}}>
              <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',cursor:'pointer'}}><input type="radio" name="dt" defaultChecked /> Permanent</label>
              <label style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',cursor:'pointer'}}><input type="radio" name="dt" /> Time-Based</label>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div className="fr" style={{margin:'0'}}><label className="fl">Start Date</label><input type="date" /></div>
              <div className="fr" style={{margin:'0'}}><label className="fl">End Date</label><input type="date" /></div>
            </div>
          </div>
          <div className="mf">
            <button className="btn btn-s" onClick={closeModal}>Close</button>
            <button className="btn btn-p" onClick={() => { closeModal(); showToast('Delegation sent for CTO/COH approval') }}>✓ Confirm</button>
          </div>
        </div>
      </div>

      {/* CAB Session Modal */}
      <div className={`mbg${activeModal === 'm-cab-session' ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal" style={{width:'500px'}}>
          <div className="mh"><div className="mt">CAB Session — CAB-031</div><div className="mx-btn" onClick={closeModal}>×</div></div>
          <div className="mb">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
              <div style={{background:'var(--bg)',padding:'12px',borderRadius:'8px'}}>
                <div style={{fontSize:'11px',color:'var(--tx3)',fontWeight:500,marginBottom:'8px'}}>CRQ Information</div>
                <div style={{display:'flex',flexDirection:'column',gap:'5px',fontSize:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--tx2)'}}>CRQ ID</span><span style={{fontFamily:"'DM Mono'"}}>CRQ-001</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--tx2)'}}>Domain</span><span className="bg bg-bl" style={{fontSize:'10px'}}>IP Core</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--tx2)'}}>Circle</span><span>GJ</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--tx2)'}}>SLA</span><span style={{color:'var(--re)',fontWeight:600}}>8%</span></div>
                </div>
              </div>
              <div style={{background:'var(--bg)',padding:'12px',borderRadius:'8px'}}>
                <div style={{fontSize:'11px',color:'var(--tx3)',fontWeight:500,marginBottom:'8px'}}>Quorum Status</div>
                <div style={{display:'flex',flexDirection:'column',gap:'5px',fontSize:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--tx2)'}}>Required</span><span style={{fontWeight:600}}>5</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--tx2)'}}>Received</span><span style={{fontWeight:600}}>2</span></div>
                  <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--tx2)'}}>Mandatory</span><span style={{fontWeight:600}}>1/2</span></div>
                </div>
                <div className="qbar"><div className="qfill" style={{width:'40%'}}></div></div>
                <span className="bg bg-am">Waiting for Quorum</span>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button className="btn btn-ok" style={{flex:1}} onClick={() => { closeModal(); showToast('Vote recorded: Approved') }}>✓ Approve</button>
              <button className="btn btn-no" style={{flex:1}} onClick={() => { closeModal(); openModal('m-reject') }}>— Reject</button>
              <button className="btn btn-warn" style={{flex:1}} onClick={() => { closeModal(); showToast('Vote recorded: Deferred') }}>↻ Defer</button>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Session Modal */}
      <div className={`mbg${activeModal === 'm-plan-session' ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal">
          <div className="mh"><div className="mt">Plan CAB Session</div><div className="mx-btn" onClick={closeModal}>×</div></div>
          <div className="mb">
            <div className="fr"><label className="fl">Session Date & Time *</label><input type="datetime-local" /></div>
            <div className="fr"><label className="fl">Session Type</label><select><option>CAB Approval</option><option>Emergency CAB</option></select></div>
            <div className="fr"><label className="fl">Quorum Requirement</label><input type="number" defaultValue={5} min={1} /></div>
            <div className="fr"><label className="fl">Notes / Agenda</label><textarea rows={2} placeholder="Add agenda..."></textarea></div>
            <div className="alert a-info" style={{margin:'0',fontSize:'11px'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:'1px'}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              MS Teams meeting will be auto-created and invites sent.
            </div>
          </div>
          <div className="mf">
            <button className="btn btn-s" onClick={closeModal}>Cancel</button>
            <button className="btn btn-p" onClick={() => { closeModal(); showToast('CAB session planned · MS Teams invite sent') }}>Create Session</button>
          </div>
        </div>
      </div>

      {/* New CRQ Modal */}
      <div className={`mbg${activeModal === 'm-new-crq' ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal" style={{width:'500px'}}>
          <div className="mh"><div className="mt">New Change Request</div><div className="mx-btn" onClick={closeModal}>×</div></div>
          <div className="mb">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Activity Title *</label><input placeholder="e.g. Link Upgrade" /></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Domain *</label><select><option>IP Core</option><option>Optics</option><option>Packet</option><option>Embedded</option></select></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Circle *</label><select><option>GJ</option><option>MH</option><option>KA</option><option>DL</option></select></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Technology *</label><select><option>MPLS</option><option>BGP</option><option>GPON</option><option>Router</option></select></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Impact</label><select><option>SA (Service Affecting)</option><option>NSA</option></select></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Scheduled Date *</label><input type="date" /></div>
            </div>
            <div className="fr"><label className="fl">Maintenance Window *</label><input placeholder="e.g. 03:00 – 05:00" /></div>
            <div className="fr" style={{margin:'0'}}><label className="fl">Hostname / Node</label><input placeholder="e.g. RTR-BLR01" /></div>
          </div>
          <div className="mf">
            <button className="btn btn-s" onClick={closeModal}>Cancel</button>
            <button className="btn btn-p" onClick={() => { closeModal(); showToast('CRQ submitted · Routed for Authorization approval') }}>Submit CRQ</button>
          </div>
        </div>
      </div>

      {/* Add Approver Modal */}
      <div className={`mbg${activeModal === 'm-add-approver' ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal">
          <div className="mh"><div className="mt">Add Approver</div><div className="mx-btn" onClick={closeModal}>×</div></div>
          <div className="mb">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Full Name *</label><input placeholder="Full name" /></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">OLM ID *</label><input placeholder="e.g. user01" /></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Role Type *</label><select><option>CTO</option><option>COH</option><option>Manager</option><option>Engineer</option><option>CAB Member</option></select></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Approval Levels *</label><select><option>L1</option><option>L2</option><option>L3</option><option>L4</option><option>L1, L2</option><option>L3, L4</option></select></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Domain *</label><select><option>All Domains</option><option>IP Core</option><option>Optics</option><option>Embedded</option></select></div>
              <div className="fr" style={{margin:'0 0 10px'}}><label className="fl">Circle</label><select><option>All</option><option>GJ</option><option>MH</option><option>KA</option></select></div>
              <div className="fr" style={{margin:'0'}}><label className="fl">Delegation Allowed</label><select><option>Yes</option><option>No</option></select></div>
              <div className="fr" style={{margin:'0'}}><label className="fl">Status</label><select><option>Active</option><option>Inactive</option></select></div>
            </div>
          </div>
          <div className="mf">
            <button className="btn btn-s" onClick={closeModal}>Cancel</button>
            <button className="btn btn-p" onClick={() => { closeModal(); showToast('Approver added successfully') }}>Save Approver</button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div id="chm-toast" style={{
        transform: toast.visible ? 'translateY(0)' : 'translateY(70px)',
        opacity: toast.visible ? 1 : 0,
      }}>{toast.msg}</div>
    </>
  )
}


//hello

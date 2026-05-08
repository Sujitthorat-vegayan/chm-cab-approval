import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Radar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadarController, RadialLinearScale, Title, Tooltip, Legend, Filler,
)
ChartJS.defaults.color = 'rgba(180, 210, 255, 0.75)'
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.07)'
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(5, 18, 40, 0.97)'
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(0, 191, 255, 0.3)'
ChartJS.defaults.plugins.tooltip.borderWidth = 1
ChartJS.defaults.plugins.tooltip.titleColor = '#00e5ff'
ChartJS.defaults.plugins.tooltip.bodyColor = 'rgba(200, 225, 255, 0.9)'
ChartJS.defaults.plugins.tooltip.padding = 10
ChartJS.defaults.plugins.tooltip.cornerRadius = 8

export const Route = createFileRoute('/')({ component: Home })

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  blue: '#00bfff', cyan: '#00e5ff', green: '#00ff88', orange: '#ff8c00',
  red: '#ff3366', yellow: '#ffd700', purple: '#bf5fff', teal: '#00e0c6', pink: '#ff69b4',
}

const glass = (extra?: CSSProperties): CSSProperties => ({
  background: 'rgba(6, 18, 40, 0.72)',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
  border: '1px solid rgba(0, 191, 255, 0.11)',
  borderRadius: '14px',
  boxShadow: '0 4px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
  ...extra,
})

const neon = (color: string): CSSProperties => ({
  color, textShadow: `0 0 10px ${color}90, 0 0 22px ${color}40`,
})

// ─── FUNCTION → DOMAIN → SUBDOMAIN HIERARCHY ────────────────────────────────
const FUNC_HIERARCHY: Record<string, Record<string, string[]>> = {
  SE: {
    'IP Core': ['MPLS-Core', 'BRAS-Core', 'CEN-Core'],
    'Packet': ['Packet-Change', 'Packet_NI'],
    'Embedded Support': ['All'],
    'IP Access': ['MPLS-Access', 'CEN-Access', 'OLT Access'],
    'Optics': ['Network_expansion', 'NNI', 'OTN/LCD', 'Project'],
    'Service Optimisation': ['All'],
  },
  CCB: {
    'IP Core_CCB': ['MPLS-Core_CCB', 'BRAS-Core_CCB', 'CEN-Core_CCB'],
    'Packet_CCB': ['Packet-Change_CCB', 'Packet_NI_CCB'],
    'Embedded Support_CCB': ['All'],
    'IP Access_CCB': ['MPLS-Access_CCB', 'CEN-Access_CCB', 'OLT Access_CCB'],
    'Optics_CCB': ['Network_expansion_CCB', 'Project_CCB'],
    'Service Optimisation_CCB': ['All'],
  },
}

// ─── CRQ DATASET ─────────────────────────────────────────────────────────────
interface CRQ {
  changeId: string; submitDate: string; status: string; aging: number
  changeImpact: string; changeRequester: string; summary: string
  region: string; circle: string; binGroup: string
  changeCoordinator: string; changeImplementor: string
  domain: string; subdomain: string; func: string; stage: string
}

const CRQ_DATA: CRQ[] = [
  { changeId: 'CRQ001141', submitDate: '2026-01-09', status: 'Completed', aging: 6, changeImpact: 'SA', changeRequester: 'NOC', summary: 'Access switch port VLAN change', region: 'East', circle: 'Odisha', binGroup: 'NOC_SE_Upgrade', changeCoordinator: 'Rahul Sharma', changeImplementor: 'Naveen P', domain: 'IP Core', subdomain: 'MPLS-Core', func: 'SE', stage: 'Task Closure' },
  { changeId: 'CRQ001142', submitDate: '2025-03-23', status: 'Completed', aging: 13, changeImpact: 'SA', changeRequester: 'Operations', summary: 'BRAS configuration for new subscriber pool', region: 'South', circle: 'Karnataka', binGroup: 'TX_DATA', changeCoordinator: 'Kavita Joshi', changeImplementor: 'Ajay K', domain: 'IP Core', subdomain: 'BRAS-Core', func: 'SE', stage: 'Task Closure' },
  { changeId: 'CRQ001143', submitDate: '2025-04-20', status: 'Completed', aging: 13, changeImpact: 'NSA', changeRequester: 'NOC', summary: 'IP-MPLS path optimization', region: 'North', circle: 'Rajasthan', binGroup: 'CCB_AES-CFM-CHM', changeCoordinator: 'Deepa Rao', changeImplementor: 'Naveen P', domain: 'IP Core', subdomain: 'CEN-Core', func: 'SE', stage: 'Task Closure' },
  { changeId: 'CRQ001144', submitDate: '2026-02-15', status: 'Open', aging: 2, changeImpact: 'SA', changeRequester: 'NOC', summary: 'Packet switch firmware upgrade', region: 'West', circle: 'Gujarat', binGroup: 'NOC_SE_Packet', changeCoordinator: 'Amit Patel', changeImplementor: 'Priya S', domain: 'Packet', subdomain: 'Packet-Change', func: 'SE', stage: 'MOP Creation' },
  { changeId: 'CRQ001145', submitDate: '2026-03-01', status: 'Open', aging: 1, changeImpact: 'NSA', changeRequester: 'Planning', summary: 'New NI circuit provisioning on packet ring', region: 'South', circle: 'Tamil Nadu', binGroup: 'TX_NI', changeCoordinator: 'Sanjay M', changeImplementor: 'Vikram R', domain: 'Packet', subdomain: 'Packet_NI', func: 'SE', stage: 'Impact Analysis' },
  { changeId: 'CRQ001146', submitDate: '2026-01-28', status: 'Open', aging: 5, changeImpact: 'SA', changeRequester: 'NOC', summary: 'Embedded controller patching and reboot', region: 'North', circle: 'Delhi', binGroup: 'NOC_SE_Embed', changeCoordinator: 'Neha Gupta', changeImplementor: 'Ravi K', domain: 'Embedded Support', subdomain: 'All', func: 'SE', stage: 'Scheduling & Approvals' },
  { changeId: 'CRQ001147', submitDate: '2026-02-20', status: 'Open', aging: 3, changeImpact: 'NSA', changeRequester: 'Operations', summary: 'MPLS access PE router config change', region: 'East', circle: 'West Bengal', binGroup: 'TX_ACCESS', changeCoordinator: 'Rahul Sharma', changeImplementor: 'Suresh B', domain: 'IP Access', subdomain: 'MPLS-Access', func: 'SE', stage: 'MOP Validation' },
  { changeId: 'CRQ001148', submitDate: '2026-03-10', status: 'Rejected', aging: 4, changeImpact: 'SA', changeRequester: 'NOC', summary: 'CEN access ring reconfiguration rejected due to window conflict', region: 'South', circle: 'Kerala', binGroup: 'NOC_SE_Access', changeCoordinator: 'Deepa Rao', changeImplementor: 'Ajay K', domain: 'IP Access', subdomain: 'CEN-Access', func: 'SE', stage: 'Plan and Inventory Validation' },
  { changeId: 'CRQ001149', submitDate: '2026-02-05', status: 'Open', aging: 7, changeImpact: 'SA', changeRequester: 'Planning', summary: 'OLT access port activation for FTTH expansion', region: 'West', circle: 'Maharashtra', binGroup: 'NOC_FTTH', changeCoordinator: 'Kavita Joshi', changeImplementor: 'Priya S', domain: 'IP Access', subdomain: 'OLT Access', func: 'SE', stage: 'Network Execution' },
  { changeId: 'CRQ001150', submitDate: '2026-01-18', status: 'Completed', aging: 9, changeImpact: 'NSA', changeRequester: 'NOC', summary: 'Network expansion - new fiber route commissioning', region: 'North', circle: 'UP East', binGroup: 'TX_OPTICS', changeCoordinator: 'Amit Patel', changeImplementor: 'Vikram R', domain: 'Optics', subdomain: 'Network_expansion', func: 'SE', stage: 'Task Closure' },
  { changeId: 'CRQ001151', submitDate: '2026-03-05', status: 'Open', aging: 2, changeImpact: 'SA', changeRequester: 'Operations', summary: 'NNI link capacity upgrade between exchanges', region: 'South', circle: 'Andhra Pradesh', binGroup: 'TX_NNI', changeCoordinator: 'Sanjay M', changeImplementor: 'Ravi K', domain: 'Optics', subdomain: 'NNI', func: 'SE', stage: 'Impact Analysis' },
  { changeId: 'CRQ001152', submitDate: '2026-02-28', status: 'Open', aging: 4, changeImpact: 'NSA', changeRequester: 'NOC', summary: 'OTN/LCD wavelength reallocation', region: 'East', circle: 'Bihar', binGroup: 'TX_OTN', changeCoordinator: 'Neha Gupta', changeImplementor: 'Suresh B', domain: 'Optics', subdomain: 'OTN/LCD', func: 'SE', stage: 'MOP Creation' },
  { changeId: 'CRQ001153', submitDate: '2026-03-15', status: 'Open', aging: 1, changeImpact: 'SA', changeRequester: 'Planning', summary: 'Optics project - metro ring dark fiber activation', region: 'West', circle: 'Rajasthan', binGroup: 'TX_PROJECT', changeCoordinator: 'Rahul Sharma', changeImplementor: 'Naveen P', domain: 'Optics', subdomain: 'Project', func: 'SE', stage: 'Plan and Inventory Validation' },
  { changeId: 'CRQ001154', submitDate: '2026-01-25', status: 'Completed', aging: 11, changeImpact: 'SA', changeRequester: 'Operations', summary: 'Service optimization - QoS policy tuning on PE routers', region: 'North', circle: 'Haryana', binGroup: 'NOC_SE_QOS', changeCoordinator: 'Kavita Joshi', changeImplementor: 'Ajay K', domain: 'Service Optimisation', subdomain: 'All', func: 'SE', stage: 'Task Closure' },
  { changeId: 'CRQ001155', submitDate: '2026-02-10', status: 'Open', aging: 6, changeImpact: 'NSA', changeRequester: 'NOC', summary: 'Traffic engineering optimization across MPLS domain', region: 'South', circle: 'Karnataka', binGroup: 'NOC_SE_TE', changeCoordinator: 'Deepa Rao', changeImplementor: 'Priya S', domain: 'Service Optimisation', subdomain: 'All', func: 'SE', stage: 'Scheduling & Approvals' },
  { changeId: 'CRQ001156', submitDate: '2026-03-20', status: 'Open', aging: 1, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB review - MPLS core label range modification', region: 'East', circle: 'Odisha', binGroup: 'CCB_MPLS', changeCoordinator: 'Amit Patel', changeImplementor: 'Vikram R', domain: 'IP Core_CCB', subdomain: 'MPLS-Core_CCB', func: 'CCB', stage: 'MOP Validation' },
  { changeId: 'CRQ001157', submitDate: '2026-02-18', status: 'Open', aging: 5, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB BRAS core subscriber pool expansion review', region: 'North', circle: 'Punjab', binGroup: 'CCB_BRAS', changeCoordinator: 'Sanjay M', changeImplementor: 'Ravi K', domain: 'IP Core_CCB', subdomain: 'BRAS-Core_CCB', func: 'CCB', stage: 'Scheduling & Approvals' },
  { changeId: 'CRQ001158', submitDate: '2026-01-30', status: 'Completed', aging: 8, changeImpact: 'NSA', changeRequester: 'CCB', summary: 'CCB approved CEN core routing policy change', region: 'West', circle: 'Gujarat', binGroup: 'CCB_CEN', changeCoordinator: 'Neha Gupta', changeImplementor: 'Suresh B', domain: 'IP Core_CCB', subdomain: 'CEN-Core_CCB', func: 'CCB', stage: 'Task Closure' },
  { changeId: 'CRQ001159', submitDate: '2026-03-08', status: 'Open', aging: 3, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB packet change - microwave backhaul reconfiguration', region: 'South', circle: 'Tamil Nadu', binGroup: 'CCB_PKT', changeCoordinator: 'Rahul Sharma', changeImplementor: 'Naveen P', domain: 'Packet_CCB', subdomain: 'Packet-Change_CCB', func: 'CCB', stage: 'Impact Analysis' },
  { changeId: 'CRQ001160', submitDate: '2026-02-25', status: 'Rejected', aging: 6, changeImpact: 'NSA', changeRequester: 'CCB', summary: 'CCB NI provisioning rejected - incomplete MOP documentation', region: 'North', circle: 'Delhi', binGroup: 'CCB_NI', changeCoordinator: 'Kavita Joshi', changeImplementor: 'Ajay K', domain: 'Packet_CCB', subdomain: 'Packet_NI_CCB', func: 'CCB', stage: 'MOP Creation' },
  { changeId: 'CRQ001161', submitDate: '2026-03-12', status: 'Open', aging: 2, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB embedded systems critical patch review', region: 'East', circle: 'Jharkhand', binGroup: 'CCB_EMBED', changeCoordinator: 'Deepa Rao', changeImplementor: 'Priya S', domain: 'Embedded Support_CCB', subdomain: 'All', func: 'CCB', stage: 'Plan and Inventory Validation' },
  { changeId: 'CRQ001162', submitDate: '2026-01-15', status: 'Completed', aging: 14, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB MPLS access PE decommission approval', region: 'West', circle: 'Maharashtra', binGroup: 'CCB_ACCESS', changeCoordinator: 'Amit Patel', changeImplementor: 'Vikram R', domain: 'IP Access_CCB', subdomain: 'MPLS-Access_CCB', func: 'CCB', stage: 'Task Closure' },
  { changeId: 'CRQ001163', submitDate: '2026-02-08', status: 'Open', aging: 7, changeImpact: 'NSA', changeRequester: 'CCB', summary: 'CCB CEN access ring topology change review', region: 'South', circle: 'Kerala', binGroup: 'CCB_CEN_ACC', changeCoordinator: 'Sanjay M', changeImplementor: 'Ravi K', domain: 'IP Access_CCB', subdomain: 'CEN-Access_CCB', func: 'CCB', stage: 'Network Execution' },
  { changeId: 'CRQ001164', submitDate: '2026-03-18', status: 'Open', aging: 1, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB OLT access mass provisioning review', region: 'North', circle: 'UP West', binGroup: 'CCB_OLT', changeCoordinator: 'Neha Gupta', changeImplementor: 'Suresh B', domain: 'IP Access_CCB', subdomain: 'OLT Access_CCB', func: 'CCB', stage: 'Impact Analysis' },
  { changeId: 'CRQ001165', submitDate: '2026-02-12', status: 'Open', aging: 5, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB optics network expansion - new DWDM route', region: 'East', circle: 'West Bengal', binGroup: 'CCB_OPTICS', changeCoordinator: 'Rahul Sharma', changeImplementor: 'Naveen P', domain: 'Optics_CCB', subdomain: 'Network_expansion_CCB', func: 'CCB', stage: 'MOP Validation' },
  { changeId: 'CRQ001166', submitDate: '2026-03-25', status: 'Open', aging: 1, changeImpact: 'NSA', changeRequester: 'CCB', summary: 'CCB optics project - intercity fiber splice review', region: 'West', circle: 'Rajasthan', binGroup: 'CCB_PROJ', changeCoordinator: 'Kavita Joshi', changeImplementor: 'Ajay K', domain: 'Optics_CCB', subdomain: 'Project_CCB', func: 'CCB', stage: 'Plan and Inventory Validation' },
  { changeId: 'CRQ001167', submitDate: '2026-01-22', status: 'Completed', aging: 10, changeImpact: 'SA', changeRequester: 'CCB', summary: 'CCB service optimization - bandwidth shaping policy', region: 'South', circle: 'Andhra Pradesh', binGroup: 'CCB_SVC', changeCoordinator: 'Deepa Rao', changeImplementor: 'Priya S', domain: 'Service Optimisation_CCB', subdomain: 'All', func: 'CCB', stage: 'Task Closure' },
  { changeId: 'CRQ001168', submitDate: '2026-03-02', status: 'Open', aging: 4, changeImpact: 'NSA', changeRequester: 'CCB', summary: 'CCB service optimization review - latency reduction plan', region: 'North', circle: 'Haryana', binGroup: 'CCB_OPTIM', changeCoordinator: 'Amit Patel', changeImplementor: 'Vikram R', domain: 'Service Optimisation_CCB', subdomain: 'All', func: 'CCB', stage: 'Scheduling & Approvals' },
  { changeId: 'CRQ001169', submitDate: '2026-02-22', status: 'Open', aging: 8, changeImpact: 'SA', changeRequester: 'NOC', summary: 'MPLS core LDP session flap remediation', region: 'East', circle: 'Odisha', binGroup: 'NOC_SE_MPLS', changeCoordinator: 'Sanjay M', changeImplementor: 'Suresh B', domain: 'IP Core', subdomain: 'MPLS-Core', func: 'SE', stage: 'Network Execution' },
  { changeId: 'CRQ001170', submitDate: '2026-03-28', status: 'Open', aging: 1, changeImpact: 'SA', changeRequester: 'Operations', summary: 'BRAS core AAA server failover configuration', region: 'North', circle: 'Punjab', binGroup: 'NOC_SE_BRAS', changeCoordinator: 'Neha Gupta', changeImplementor: 'Ravi K', domain: 'IP Core', subdomain: 'BRAS-Core', func: 'SE', stage: 'Plan and Inventory Validation' },
]

// ─── LIFECYCLE STAGES (strict order) ─────────────────────────────────────────
const LIFECYCLE_STAGES = [
  'Plan and Inventory Validation', 'Impact Analysis', 'MOP Creation',
  'MOP Validation', 'Scheduling & Approvals', 'Network Execution', 'Task Closure',
]

// ─── DERIVED DATA FUNCTIONS ──────────────────────────────────────────────────
function filterCRQs(data: CRQ[], func: string, domain: string, subdomain: string, dateRange: string): CRQ[] {
  let filtered = [...data]
  if (func !== 'All Functions') filtered = filtered.filter(c => c.func === func)
  if (domain !== 'All Domains') filtered = filtered.filter(c => c.domain === domain)
  if (subdomain !== 'All Subdomains') filtered = filtered.filter(c => c.subdomain === subdomain)

  const now = new Date('2026-03-30')
  if (dateRange === 'Last 7 Days') {
    const d = new Date(now); d.setDate(d.getDate() - 7)
    filtered = filtered.filter(c => new Date(c.submitDate) >= d)
  } else if (dateRange === 'Last 30 Days') {
    const d = new Date(now); d.setDate(d.getDate() - 30)
    filtered = filtered.filter(c => new Date(c.submitDate) >= d)
  } else if (dateRange === 'Last 90 Days') {
    const d = new Date(now); d.setDate(d.getDate() - 90)
    filtered = filtered.filter(c => new Date(c.submitDate) >= d)
  } else if (dateRange === 'This Quarter') {
    filtered = filtered.filter(c => new Date(c.submitDate) >= new Date('2026-01-01'))
  }
  return filtered
}

function getKPIs(data: CRQ[]) {
  const total = data.length
  const open = data.filter(c => c.status === 'Open').length
  const completed = data.filter(c => c.status === 'Completed').length
  const rejected = data.filter(c => c.status === 'Rejected').length
  const sla = total > 0 ? Math.round((data.filter(c => c.aging <= 8).length / total) * 1000) / 10 : 0
  return [
    { title: 'Total CRQs', value: total.toLocaleString(), change: '+12.3%', up: true, color: C.blue, spark: [180,210,195,230,250,240,270,255,280, total] },
    { title: 'Open CRQs', value: open.toLocaleString(), change: '-8.5%', up: false, color: C.cyan, spark: [52,49,47,46,45,45,44,43,42, open] },
    { title: 'Completed', value: completed.toLocaleString(), change: '+15.7%', up: true, color: C.green, spark: [5,6,7,8,8,9,9,10,10, completed] },
    { title: 'Rejected', value: rejected.toLocaleString(), change: '-3.2%', up: false, color: C.orange, spark: [5,5,4,4,3,3,3,2,2, rejected] },
    { title: 'SLA Score', value: `${sla}%`, change: '+2.1%', up: true, color: C.yellow, spark: [88,89,90,91,91,92,93,93,94, sla] },
  ]
}

function getSLARows(data: CRQ[]) {
  return data.filter(c => c.status === 'Open').slice(0, 10).map(c => {
    const hoursLeft = (8 - c.aging) * 24 + Math.floor(Math.random() * 23)
    const status = hoursLeft < 0 ? 'breach' : hoursLeft < 48 ? 'risk' : 'safe'
    return { id: c.changeId, domain: c.domain, eng: c.changeImplementor, status, time: hoursLeft < 0 ? `-${Math.abs(hoursLeft)}h` : `${hoursLeft}h ${Math.floor(Math.random() * 59)}m` }
  })
}

function getBreachRisk(data: CRQ[]) {
  const domains = [...new Set(data.map(c => c.domain))]
  return domains.map(d => {
    const dd = data.filter(c => c.domain === d)
    return {
      domain: d,
      healthy: dd.filter(c => c.aging <= 4).length,
      risk: dd.filter(c => c.aging > 4 && c.aging <= 8).length,
      breach: dd.filter(c => c.aging > 8).length,
    }
  })
}

function getDomainSLA(data: CRQ[]) {
  const domains = [...new Set(data.map(c => c.domain))]
  const colors = [C.cyan, C.blue, C.orange, C.green, C.purple, C.yellow, C.teal, C.pink]
  return domains.map((d, i) => {
    const dd = data.filter(c => c.domain === d)
    const pct = dd.length > 0 ? Math.round((dd.filter(c => c.aging <= 8).length / dd.length) * 1000) / 10 : 0
    return { domain: d, pct, color: colors[i % colors.length] }
  })
}

function getStageDistribution(data: CRQ[]) {
  return {
    labels: LIFECYCLE_STAGES.map(s => s.length > 18 ? s.slice(0, 16) + '…' : s),
    datasets: [{
      label: 'Count',
      data: LIFECYCLE_STAGES.map(s => data.filter(c => c.stage === s).length),
      backgroundColor: [
        'rgba(0,191,255,0.82)', 'rgba(0,255,136,0.78)', 'rgba(255,215,0,0.78)',
        'rgba(191,95,255,0.78)', 'rgba(0,229,255,0.78)', 'rgba(255,140,0,0.82)',
        'rgba(0,255,136,0.9)',
      ],
      borderRadius: 5,
    }],
  }
}

function getDomainCRQData(data: CRQ[]) {
  const domains = [...new Set(data.map(c => c.domain))]
  return {
    labels: domains,
    datasets: [
      { label: 'Completed', data: domains.map(d => data.filter(c => c.domain === d && c.status === 'Completed').length), backgroundColor: 'rgba(0,255,136,0.82)', borderRadius: 3 },
      { label: 'Open', data: domains.map(d => data.filter(c => c.domain === d && c.status === 'Open').length), backgroundColor: 'rgba(0,191,255,0.82)', borderRadius: 3 },
      { label: 'Rejected', data: domains.map(d => data.filter(c => c.domain === d && c.status === 'Rejected').length), backgroundColor: 'rgba(255,51,102,0.82)', borderRadius: 3 },
    ],
  }
}

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const ALERTS = [
  { level: 'critical', msg: 'CRQ001169 SLA BREACHED — IP Core domain, 8d overdue', t: '14:23:45' },
  { level: 'critical', msg: 'CRQ001163 SLA BREACHED — IP Access_CCB, 7d aging', t: '14:18:02' },
  { level: 'warning', msg: 'CRQ001149 approaching SLA breach — OLT Access, 7d aging', t: '14:15:30' },
  { level: 'warning', msg: 'CRQ001146 at risk — Embedded Support, 5d aging', t: '14:12:11' },
  { level: 'warning', msg: '3 CRQs in IP Access domain at risk of imminent SLA breach', t: '14:08:55' },
  { level: 'info', msg: 'CCB approval queue: 8 pending items, avg wait time 3.8h', t: '14:05:20' },
  { level: 'info', msg: 'SE Team utilization at 87% — consider workload rebalancing', t: '13:58:44' },
]

const FEED = [
  { t: '14:27:32', msg: '[IP-CORE] CRQ001141 state: Execution → Closure', type: 'info' },
  { t: '14:26:18', msg: '[PACKET] CRQ001145 validator assigned: Vikram R', type: 'info' },
  { t: '14:25:45', msg: '[IP-CORE] CRQ001169 SLA BREACH — escalating L3', type: 'error' },
  { t: '14:24:33', msg: '[OPTICS] CRQ001150 MOP approved by CCB board', type: 'success' },
  { t: '14:23:12', msg: '[IP-ACCESS] CRQ001149 impact analysis completed', type: 'info' },
  { t: '14:22:05', msg: '[EMBEDDED] CRQ001146 moved to scheduling phase', type: 'info' },
  { t: '14:21:47', msg: '[IP-CORE_CCB] CRQ001157 SLA WARNING — 5d aging', type: 'warning' },
  { t: '14:20:30', msg: '[PACKET_CCB] CRQ001159 new CRQ created', type: 'info' },
  { t: '14:19:15', msg: '[OPTICS] CRQ001152 plan review scheduled 15:00 UTC', type: 'info' },
  { t: '14:18:02', msg: '[SVC-OPT] CRQ001154 closed — SLA met ✓', type: 'success' },
  { t: '14:17:44', msg: '[IP-CORE] CRQ001143 closure validated by Naveen P', type: 'success' },
  { t: '14:16:20', msg: '[CCB] CCB meeting rescheduled → 16:30 UTC today', type: 'warning' },
  { t: '14:15:05', msg: '[IP-ACCESS_CCB] CRQ001163 SLA WARNING — 7d', type: 'warning' },
  { t: '14:14:30', msg: '[EMBEDDED] CRQ001146 change window confirmed 23:00 UTC', type: 'info' },
  { t: '14:13:22', msg: '[OPTICS_CCB] Bulk update: 2 CRQs moved to validation', type: 'info' },
]

const BOTTLENECKS = [
  { name: 'Approver Queue', val: 67, color: C.orange },
  { name: 'Validator Review', val: 45, color: C.yellow },
  { name: 'SE Team Load', val: 82, color: C.red },
  { name: 'CCB Backlog', val: 58, color: C.purple },
  { name: 'MOP Preparation', val: 34, color: C.cyan },
]

const TICKET_AGING_DATA = {
  labels: ['<2 hrs', '2–6 hrs', '6–12 hrs', '12–24 hrs'],
  datasets: [
    { label: 'Open', data: [45, 78, 62, 34], backgroundColor: 'rgba(0,191,255,0.85)', borderRadius: 3 },
    { label: 'At Risk', data: [12, 28, 45, 67], backgroundColor: 'rgba(255,215,0,0.85)', borderRadius: 3 },
    { label: 'Breached', data: [3, 8, 18, 42], backgroundColor: 'rgba(255,51,102,0.85)', borderRadius: 3 },
    { label: 'SLA Safe', data: [89, 145, 112, 78], backgroundColor: 'rgba(0,255,136,0.72)', borderRadius: 3 },
  ],
}

const AGING_FUNNEL_DATA = {
  labels: ['<2 days', '3–4 days', '6–8 days', '>8 days'],
  datasets: [
    { label: 'Released', data: [245, 178, 92, 45], backgroundColor: 'rgba(0,191,255,0.82)', borderRadius: 3 },
    { label: 'Validation', data: [89, 134, 78, 62], backgroundColor: 'rgba(255,215,0,0.78)', borderRadius: 3 },
    { label: 'Implementation', data: [123, 98, 67, 38], backgroundColor: 'rgba(0,255,136,0.75)', borderRadius: 3 },
  ],
}

const HM_DOMAINS = ['IP Core', 'IP Access', 'Optics', 'Packet', 'Embedded', 'Svc Opt']
const HM_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HM_VALUES = [
  [12, 8, 15, 22, 18, 5, 3], [7, 18, 25, 12, 9, 6, 2], [5, 11, 8, 19, 24, 10, 4],
  [9, 14, 11, 7, 16, 13, 1], [15, 22, 18, 9, 12, 8, 5], [3, 7, 9, 15, 11, 4, 2],
]

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────
function Sparkline({ data, color, idx }: { data: number[]; color: string; idx: number }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const W = 100, H = 36
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - 3 - ((v - min) / range) * (H - 6)
    return [x, y] as [number, number]
  })
  const poly = pts.map(p => p.join(',')).join(' ')
  const area = `0,${H} ${poly} ${W},${H}`
  const gid = `sk${idx}`
  return (
    <svg width={W} height={H} style={{ overflow: 'visible', display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}aa)` }} />
    </svg>
  )
}

function SemiGauge({ val, color, label }: { val: number; color: string; label: string }) {
  const r = 36, cx = 52, cy = 50
  const mathAngle = Math.PI - (val / 100) * Math.PI
  const ex = cx + r * Math.cos(mathAngle)
  const ey = cy - r * Math.sin(mathAngle)
  return (
    <div style={{ textAlign: 'center', minWidth: '90px' }}>
      <svg width={104} height={64} viewBox="0 0 104 64">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" strokeLinecap="round" />
        {val > 0 && (
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${val > 50 ? 1 : 0} 0 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
            fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
        )}
        <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="700"
          style={{ fontFamily: 'Inter, sans-serif' }}>{val}%</text>
      </svg>
      <div style={{ fontSize: '9px', color: 'rgba(160,200,250,0.55)', marginTop: '-4px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.03em' }}>{label}</div>
    </div>
  )
}

function HeatCell({ val, onClick }: { val: number; onClick: () => void }) {
  const max = 25, r = Math.min(val / max, 1)
  const bg = r < 0.28 ? `rgba(0,255,136,${0.18 + r * 2.2})` : r < 0.58 ? `rgba(255,215,0,${0.35 + r * 0.85})` : `rgba(255,51,102,${0.3 + r * 0.7})`
  return (
    <div title={`${val} CRQs`} onClick={onClick} style={{
      background: bg, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', transition: 'transform 0.15s', padding: '5px 0',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
    >{val}</div>
  )
}

function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    safe: { bg: 'rgba(0,255,136,0.12)', color: '#00ff88', label: '● Safe' },
    risk: { bg: 'rgba(255,215,0,0.12)', color: '#ffd700', label: '◆ At Risk' },
    breach: { bg: 'rgba(255,51,102,0.12)', color: '#ff3366', label: '✖ Breached' },
  }
  const s = map[status] ?? { bg: 'rgba(100,100,100,0.15)', color: '#aaa', label: status }
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '2px 8px', borderRadius: '20px', fontSize: '9px', fontWeight: '700',
      border: `1px solid ${s.color}35`, letterSpacing: '0.04em', boxShadow: `0 0 6px ${s.color}30`,
    }}>{s.label}</span>
  )
}

function SectionTitle({ color, children, onClick }: { color: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <h3 onClick={onClick} style={{
      fontSize: '12px', fontWeight: '800', letterSpacing: '0.07em', marginBottom: '12px', marginTop: 0,
      display: 'flex', alignItems: 'center', gap: '6px', cursor: onClick ? 'pointer' : 'default', ...neon(color),
    }}>{children}</h3>
  )
}

// ─── MODAL COMPONENT ─────────────────────────────────────────────────────────
function DetailModal({ title, data, onClose }: { title: string; data: CRQ[]; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,5,15,0.82)', backdropFilter: 'blur(8px)',
    }} onClick={onClose}>
      <div style={{
        ...glass({ padding: '24px', border: '1px solid rgba(0,191,255,0.22)' }),
        maxWidth: '1100px', width: '92vw', maxHeight: '80vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', animation: 'slide-in 0.25s ease-out',
        boxShadow: '0 8px 60px rgba(0,120,255,0.15), 0 0 40px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', ...neon(C.cyan) }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,51,102,0.15)', border: '1px solid rgba(255,51,102,0.3)', borderRadius: '8px',
            color: '#ff6680', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'Inter, sans-serif',
          }}>✕ CLOSE</button>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(130,175,230,0.5)', marginBottom: '12px' }}>
          Showing {data.length} record{data.length !== 1 ? 's' : ''}
        </div>
        <div style={{ overflowY: 'auto', overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,191,255,0.15)' }}>
                {['Change ID', 'Submit Date', 'Status', 'Aging', 'Impact', 'Requester', 'Summary', 'Region', 'Circle', 'Bin Group', 'Coordinator', 'Implementor'].map(h => (
                  <th key={h} style={{
                    padding: '8px 6px', textAlign: 'left', color: 'rgba(110,160,215,0.6)', fontWeight: '700',
                    fontSize: '9px', letterSpacing: '0.06em', textTransform: 'uppercase', position: 'sticky', top: 0,
                    background: 'rgba(6,18,40,0.98)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(0,191,255,0.05)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                  <td style={{ padding: '6px', color: C.cyan, fontWeight: '700', fontFamily: 'monospace' }}>{c.changeId}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.8)' }}>{c.submitDate}</td>
                  <td style={{ padding: '6px' }}>
                    <span style={{
                      padding: '2px 7px', borderRadius: '10px', fontSize: '9px', fontWeight: '700',
                      background: c.status === 'Completed' ? 'rgba(0,255,136,0.12)' : c.status === 'Open' ? 'rgba(0,191,255,0.12)' : 'rgba(255,51,102,0.12)',
                      color: c.status === 'Completed' ? C.green : c.status === 'Open' ? C.cyan : C.red,
                      border: `1px solid ${c.status === 'Completed' ? C.green : c.status === 'Open' ? C.cyan : C.red}30`,
                    }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '6px', fontWeight: '700', color: c.aging > 8 ? C.red : c.aging > 4 ? C.yellow : C.green }}>{c.aging}d</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.7)' }}>{c.changeImpact}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.7)' }}>{c.changeRequester}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.85)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.summary}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.7)' }}>{c.region}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.7)' }}>{c.circle}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.6)', fontFamily: 'monospace', fontSize: '9px' }}>{c.binGroup}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.8)' }}>{c.changeCoordinator}</td>
                  <td style={{ padding: '6px', color: 'rgba(200,225,255,0.8)' }}>{c.changeImplementor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(130,175,230,0.4)', fontSize: '12px' }}>
              No records match the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CHART OPTIONS ───────────────────────────────────────────────────────────
const baseChartOpts = (extra = {}) => ({
  responsive: true, maintainAspectRatio: false, animation: { duration: 800 },
  plugins: {
    legend: { labels: { color: 'rgba(180,210,255,0.78)', font: { size: 9, family: 'Inter' }, boxWidth: 10, padding: 10 }, position: 'top' as const },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  ...extra,
})

const stackedYOpts = baseChartOpts({
  indexAxis: 'y' as const,
  scales: {
    x: { stacked: true, ticks: { color: 'rgba(180,210,255,0.6)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { stacked: true, ticks: { color: 'rgba(180,210,255,0.72)', font: { size: 10 } }, grid: { display: false } },
  },
})

const stackedXOpts = baseChartOpts({
  scales: {
    x: { stacked: true, ticks: { color: 'rgba(180,210,255,0.72)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { stacked: true, ticks: { color: 'rgba(180,210,255,0.6)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
  },
})

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function Home() {
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState('This Quarter')
  const [func, setFunc] = useState('All Functions')
  const [domain, setDomain] = useState('All Domains')
  const [subdomain, setSubdomain] = useState('All Subdomains')
  const [clockStr, setClockStr] = useState('')
  const [modalTitle, setModalTitle] = useState('')
  const [modalData, setModalData] = useState<CRQ[]>([])
  const [showModal, setShowModal] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef({ pos: 0, raf: 0 })

  useEffect(() => {
    setMounted(true)
    const updateClock = () => setClockStr(new Date().toUTCString())
    updateClock()
    const cl = setInterval(updateClock, 1000)
    const scrollFeed = () => {
      const el = feedRef.current
      if (el) {
        scrollRef.current.pos += 0.5
        if (scrollRef.current.pos >= el.scrollHeight - el.clientHeight) scrollRef.current.pos = 0
        el.scrollTop = scrollRef.current.pos
      }
      scrollRef.current.raf = requestAnimationFrame(scrollFeed)
    }
    scrollRef.current.raf = requestAnimationFrame(scrollFeed)
    return () => { clearInterval(cl); cancelAnimationFrame(scrollRef.current.raf) }
  }, [])

  // Derived domain/subdomain options based on function selection
  const domainOptions = func === 'All Functions'
    ? ['All Domains', ...new Set(CRQ_DATA.map(c => c.domain))]
    : ['All Domains', ...Object.keys(FUNC_HIERARCHY[func] ?? {})]

  const subdomainOptions = (() => {
    if (domain === 'All Domains') return ['All Subdomains']
    if (func !== 'All Functions' && FUNC_HIERARCHY[func]?.[domain]) {
      return ['All Subdomains', ...FUNC_HIERARCHY[func][domain]]
    }
    // Find subdomains across all functions for this domain
    const subs: string[] = []
    for (const fk of Object.values(FUNC_HIERARCHY)) {
      if (fk[domain]) subs.push(...fk[domain])
    }
    return ['All Subdomains', ...new Set(subs)]
  })()

  // Reset dependent filters
  const handleFuncChange = useCallback((val: string) => {
    setFunc(val)
    setDomain('All Domains')
    setSubdomain('All Subdomains')
  }, [])

  const handleDomainChange = useCallback((val: string) => {
    setDomain(val)
    setSubdomain('All Subdomains')
  }, [])

  // Filtered data
  const filtered = filterCRQs(CRQ_DATA, func, domain, subdomain, dateRange)
  const kpis = getKPIs(filtered)
  const slaRows = getSLARows(filtered)
  const breachRisk = getBreachRisk(filtered)
  const domainSLA = getDomainSLA(filtered)
  const stageDist = getStageDistribution(filtered)
  const domainCRQ = getDomainCRQData(filtered)

  const openModal = useCallback((title: string, data: CRQ[]) => {
    setModalTitle(title)
    setModalData(data)
    setShowModal(true)
  }, [])

  const radarData = {
    labels: ['IP Core', 'IP Access', 'Optics', 'Packet', 'Embedded', 'Svc Opt'],
    datasets: [
      {
        label: 'SE Workload', data: [
          filtered.filter(c => c.domain.includes('IP Core') && !c.domain.includes('CCB')).length * 12,
          filtered.filter(c => c.domain.includes('IP Access') && !c.domain.includes('CCB')).length * 10,
          filtered.filter(c => c.domain.includes('Optics') && !c.domain.includes('CCB')).length * 11,
          filtered.filter(c => c.domain.includes('Packet') && !c.domain.includes('CCB')).length * 15,
          filtered.filter(c => c.domain.includes('Embedded') && !c.domain.includes('CCB')).length * 18,
          filtered.filter(c => c.domain.includes('Service') && !c.domain.includes('CCB')).length * 14,
        ],
        backgroundColor: 'rgba(0,191,255,0.1)', borderColor: C.blue,
        pointBackgroundColor: C.blue, borderWidth: 2, pointRadius: 3,
      },
      {
        label: 'CCB Workload', data: [
          filtered.filter(c => c.domain.includes('IP Core') && c.domain.includes('CCB')).length * 12,
          filtered.filter(c => c.domain.includes('IP Access') && c.domain.includes('CCB')).length * 10,
          filtered.filter(c => c.domain.includes('Optics') && c.domain.includes('CCB')).length * 11,
          filtered.filter(c => c.domain.includes('Packet') && c.domain.includes('CCB')).length * 15,
          filtered.filter(c => c.domain.includes('Embedded') && c.domain.includes('CCB')).length * 18,
          filtered.filter(c => c.domain.includes('Service') && c.domain.includes('CCB')).length * 14,
        ],
        backgroundColor: 'rgba(0,255,136,0.1)', borderColor: C.green,
        pointBackgroundColor: C.green, borderWidth: 2, pointRadius: 3,
      },
    ],
  }

  // Lifecycle gauge data
  const lifecycleGauges = LIFECYCLE_STAGES.map((s, i) => {
    const count = filtered.filter(c => c.stage === s).length
    const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0
    const colors = [C.cyan, C.green, C.yellow, C.purple, C.orange, C.blue, C.teal]
    return { label: s.length > 14 ? s.slice(0, 12) + '…' : s, val: pct, color: colors[i % colors.length] }
  })

  const selectStyle: CSSProperties = {
    background: 'rgba(8, 20, 46, 0.88)', color: 'rgba(180, 215, 255, 0.9)',
    border: '1px solid rgba(0,191,255,0.18)', borderRadius: '8px', padding: '7px 12px',
    fontSize: '11px', cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg,#010913 0%,#020c1c 45%,#030d20 100%)',
      minHeight: '100vh', fontFamily: "'Inter','Segoe UI',sans-serif", color: '#cce0ff', overflowX: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 90% 45% at 50% 0%,rgba(0,80,180,0.12) 0%,transparent 65%)' }} />
      {/* Scan-line */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(0,191,255,0.3),transparent)', animation: 'scan-line 8s linear infinite', pointerEvents: 'none', zIndex: 1 }} />

      {showModal && <DetailModal title={modalTitle} data={modalData} onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: '1900px', margin: '0 auto', padding: '14px 18px', position: 'relative', zIndex: 2 }}>

        {/* ═══ HEADER / FILTERS ═══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg,rgba(0,150,255,0.3),rgba(0,50,140,0.5))',
                border: '1px solid rgba(0,191,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                boxShadow: '0 0 18px rgba(0,191,255,0.28)', animation: 'glow-pulse 3s ease-in-out infinite',
              }}>📡</div>
              <h1 style={{
                margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.025em',
                background: 'linear-gradient(90deg,#00bfff,#00e5ff 40%,#00ff88)', WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>NOC CRQ Analytics</h1>
              <span style={{
                background: 'rgba(0,255,136,0.12)', color: '#00ff88', padding: '3px 10px', borderRadius: '20px',
                fontSize: '9px', fontWeight: '800', border: '1px solid rgba(0,255,136,0.28)',
                letterSpacing: '0.12em', animation: 'pulse 2s ease-in-out infinite',
              }}>● LIVE</span>
              <span style={{
                background: 'rgba(0,191,255,0.08)', color: 'rgba(0,191,255,0.7)', padding: '3px 10px', borderRadius: '20px',
                fontSize: '9px', fontWeight: '600', border: '1px solid rgba(0,191,255,0.15)', letterSpacing: '0.06em',
              }}>COMMAND CENTER v4.2</span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(120,160,210,0.5)', letterSpacing: '0.04em' }}>
              Telecom Network Operations · Change Request Intelligence · {clockStr}
            </p>
          </div>

          {/* Filter controls: Date Range, Function, Domain, Subdomain */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '8px', color: 'rgba(130,175,230,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Date Range</label>
              <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={selectStyle}>
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Quarter', 'All Time'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '8px', color: 'rgba(130,175,230,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Function</label>
              <select value={func} onChange={e => handleFuncChange(e.target.value)} style={selectStyle}>
                {['All Functions', 'SE', 'CCB'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '8px', color: 'rgba(130,175,230,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Domain</label>
              <select value={domain} onChange={e => handleDomainChange(e.target.value)} style={selectStyle}>
                {domainOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '8px', color: 'rgba(130,175,230,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Subdomain</label>
              <select value={subdomain} onChange={e => setSubdomain(e.target.value)} style={selectStyle}>
                {subdomainOptions.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={() => { setDateRange('This Quarter'); handleFuncChange('All Functions') }} style={{
              background: 'linear-gradient(135deg,rgba(0,100,200,0.55),rgba(0,191,255,0.28))',
              color: '#00e5ff', border: '1px solid rgba(0,191,255,0.32)', borderRadius: '8px',
              padding: '7px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
              letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif', boxShadow: '0 0 12px rgba(0,191,255,0.15)',
              transition: 'box-shadow 0.2s', alignSelf: 'flex-end',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,191,255,0.35)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,191,255,0.15)' }}
            >↻ REFRESH</button>
          </div>
        </div>

        {/* ═══ KPI CARDS ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '12px' }}>
          {kpis.map((k, i) => (
            <div key={i} onClick={() => openModal(k.title, k.title === 'Total CRQs' ? filtered : k.title === 'Open CRQs' ? filtered.filter(c => c.status === 'Open') : k.title === 'Completed' ? filtered.filter(c => c.status === 'Completed') : k.title === 'Rejected' ? filtered.filter(c => c.status === 'Rejected') : filtered)}
              style={{
                ...glass({ padding: '14px 16px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }),
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = `0 10px 36px rgba(0,0,0,0.55), 0 0 24px ${k.color}22` }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 4px 28px rgba(0,0,0,0.45)' }}>
              <div style={{ position: 'absolute', top: '-25px', right: '-18px', width: '90px', height: '90px', borderRadius: '50%', background: `radial-gradient(circle,${k.color}16 0%,transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 0, left: '16px', right: '16px', height: '2px', background: `linear-gradient(90deg,transparent,${k.color}80,transparent)`, borderRadius: '0 0 2px 2px' }} />
              <div style={{ fontSize: '10px', color: 'rgba(130,175,230,0.58)', letterSpacing: '0.08em', marginBottom: '7px', textTransform: 'uppercase', fontWeight: '600' }}>{k.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '26px', fontWeight: '900', lineHeight: 1, ...neon(k.color) }}>{k.value}</div>
                  <div style={{ marginTop: '5px', fontSize: '11px', fontWeight: '700', color: k.up ? '#00ff88' : '#ff6680', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span>{k.up ? '▲' : '▼'}</span>{k.change}
                    <span style={{ fontSize: '9px', fontWeight: '400', color: 'rgba(130,175,230,0.4)', marginLeft: '2px' }}>vs last period</span>
                  </div>
                </div>
                <Sparkline data={k.spark} color={k.color} idx={i} />
              </div>
            </div>
          ))}
        </div>

        {/* ═══ MAIN GRID — LEFT | CENTER | RIGHT ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '27% 1fr 23%', gap: '10px', marginBottom: '10px' }}>

          {/* ── LEFT PANEL ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* SLA Countdown Table */}
            <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('SLA Countdown — Open CRQs', filtered.filter(c => c.status === 'Open'))}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <SectionTitle color={C.cyan}>⏱ SLA COUNTDOWN</SectionTitle>
                <span style={{ fontSize: '9px', color: 'rgba(130,175,230,0.4)', fontFamily: 'monospace' }}>{clockStr.slice(17, 25)} UTC</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,191,255,0.1)' }}>
                      {['CRQ ID', 'Domain', 'Engineer', 'Time Left', 'Status'].map(h => (
                        <th key={h} style={{ padding: '4px 5px', textAlign: 'left', color: 'rgba(110,160,215,0.55)', fontWeight: '700', fontSize: '9px', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slaRows.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)', transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(0,191,255,0.04)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}>
                        <td style={{ padding: '5px 5px', color: '#00bfff', fontWeight: '700', fontFamily: 'monospace', fontSize: '9px' }}>{r.id}</td>
                        <td style={{ padding: '5px 5px', color: 'rgba(200,225,255,0.82)' }}>{r.domain}</td>
                        <td style={{ padding: '5px 5px', color: 'rgba(170,205,250,0.7)' }}>{r.eng}</td>
                        <td style={{ padding: '5px 5px', fontFamily: 'monospace', fontWeight: '800', fontSize: '9px', color: r.status === 'breach' ? C.red : r.status === 'risk' ? C.yellow : C.green }}>{r.time}</td>
                        <td style={{ padding: '5px 5px' }}><Badge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SLA Breach Risk Table */}
            <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('SLA Breach Risk — All CRQs', filtered)}>
              <SectionTitle color={C.red}>🔥 SLA BREACH RISK</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,51,102,0.1)' }}>
                    {['Domain', 'Healthy', 'At Risk', 'Breached'].map(h => (
                      <th key={h} style={{ padding: '4px 6px', textAlign: h === 'Domain' ? 'left' : 'right', color: 'rgba(110,160,215,0.5)', fontSize: '9px', letterSpacing: '0.05em', fontWeight: '700' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {breachRisk.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                      <td style={{ padding: '5px 6px', color: 'rgba(200,225,255,0.82)' }}>{r.domain}</td>
                      <td style={{ padding: '5px 6px', textAlign: 'right', color: C.green, fontWeight: '700' }}>{r.healthy}</td>
                      <td style={{ padding: '5px 6px', textAlign: 'right', color: C.yellow, fontWeight: '700' }}>{r.risk}</td>
                      <td style={{ padding: '5px 6px', textAlign: 'right', color: C.red, fontWeight: '700' }}>{r.breach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                {[
                  { label: 'Total Healthy', val: breachRisk.reduce((a, r) => a + r.healthy, 0), color: C.green },
                  { label: 'At Risk', val: breachRisk.reduce((a, r) => a + r.risk, 0), color: C.yellow },
                  { label: 'Breached', val: breachRisk.reduce((a, r) => a + r.breach, 0), color: C.red },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', ...neon(s.color) }}>{s.val}</div>
                    <div style={{ fontSize: '8px', color: 'rgba(130,175,230,0.45)', letterSpacing: '0.05em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Domain SLA Performance */}
            <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('Domain SLA Performance', filtered)}>
              <SectionTitle color={C.green}>📊 DOMAIN SLA PERFORMANCE</SectionTitle>
              {domainSLA.map((d, i) => (
                <div key={i} style={{ marginBottom: '9px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(200,225,255,0.8)' }}>{d.domain}</span>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: d.color }}>{d.pct}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      height: '100%', width: `${d.pct}%`, background: `linear-gradient(90deg,${d.color}66,${d.color})`,
                      borderRadius: '3px', boxShadow: `0 0 8px ${d.color}55`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CENTER PANEL ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Ticket Aging Stacked Bar */}
            {mounted && (
              <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('Ticket Aging Distribution', filtered)}>
                <SectionTitle color={C.blue}>📈 TICKET AGING DISTRIBUTION</SectionTitle>
                <div style={{ height: '148px' }}>
                  <Bar data={TICKET_AGING_DATA} options={stackedYOpts} />
                </div>
              </div>
            )}

            {/* CRQ Aging Funnel */}
            {mounted && (
              <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('CRQ Aging Flow', filtered)}>
                <SectionTitle color={C.yellow}>⚗ CRQ AGING FLOW — STAGE DISTRIBUTION</SectionTitle>
                <div style={{ height: '148px' }}>
                  <Bar data={AGING_FUNNEL_DATA} options={stackedXOpts} />
                </div>
              </div>
            )}

            {/* Bottleneck Detection */}
            <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('Bottleneck Detection — Pending CRQs', filtered.filter(c => c.status === 'Open'))}>
              <SectionTitle color={C.orange}>🔍 BOTTLENECK DETECTION</SectionTitle>
              {BOTTLENECKS.map((b, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(200,225,255,0.8)' }}>{b.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {b.val > 70 && <span style={{ fontSize: '8px', color: C.red, fontWeight: '700', letterSpacing: '0.06em' }}>HIGH</span>}
                      {b.val > 50 && b.val <= 70 && <span style={{ fontSize: '8px', color: C.yellow, fontWeight: '700', letterSpacing: '0.06em' }}>MED</span>}
                      <span style={{ fontSize: '10px', fontWeight: '800', color: b.val > 70 ? C.red : b.val > 50 ? C.yellow : C.green }}>{b.val}%</span>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${b.val}%`, background: `linear-gradient(90deg,${b.color}66,${b.color})`,
                      borderRadius: '4px', boxShadow: `0 0 10px ${b.color}45`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* SE Workload Radar */}
            {mounted && (
              <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('SE / CCB Workload Analysis', filtered)}>
                <SectionTitle color={C.purple}>🎯 SE WORKLOAD — DOMAIN COVERAGE RADAR</SectionTitle>
                <div style={{ height: '210px' }}>
                  <Radar data={radarData} options={{
                    responsive: true, maintainAspectRatio: false, animation: { duration: 800 },
                    plugins: { legend: { labels: { color: 'rgba(180,210,255,0.78)', font: { size: 9, family: 'Inter' }, boxWidth: 10, padding: 10 }, position: 'top' as const } },
                    scales: { r: { min: 0, ticks: { color: 'rgba(120,160,210,0.45)', font: { size: 8 }, backdropColor: 'transparent', stepSize: 25 }, grid: { color: 'rgba(255,255,255,0.07)' }, angleLines: { color: 'rgba(255,255,255,0.09)' }, pointLabels: { color: 'rgba(180,210,255,0.72)', font: { size: 9 } } } },
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Critical Alerts */}
            <div style={{ ...glass({ padding: '14px', cursor: 'pointer' }), borderColor: 'rgba(255,51,102,0.14)' }} onClick={() => openModal('Critical Alerts — Breached/At-Risk CRQs', filtered.filter(c => c.aging > 4))}>
              <SectionTitle color={C.red}>⚠ CRITICAL ALERTS</SectionTitle>
              {ALERTS.map((a, i) => (
                <div key={i} style={{
                  marginBottom: '6px', padding: '7px 9px', borderRadius: '8px',
                  background: a.level === 'critical' ? 'rgba(255,51,102,0.07)' : a.level === 'warning' ? 'rgba(255,215,0,0.055)' : 'rgba(0,191,255,0.045)',
                  border: `1px solid ${a.level === 'critical' ? 'rgba(255,51,102,0.18)' : a.level === 'warning' ? 'rgba(255,215,0,0.13)' : 'rgba(0,191,255,0.1)'}`,
                  transition: 'transform 0.15s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateX(3px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '11px', flexShrink: 0, lineHeight: '14px' }}>
                      {a.level === 'critical' ? '🔴' : a.level === 'warning' ? '🟡' : '🔵'}
                    </span>
                    <div>
                      <div style={{ fontSize: '9.5px', color: 'rgba(200,225,255,0.85)', lineHeight: '1.45', marginBottom: '2px' }}>{a.msg}</div>
                      <div style={{ fontSize: '8px', color: 'rgba(100,145,205,0.45)', fontFamily: 'monospace' }}>{a.t} UTC</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Incident Feed */}
            <div style={{ ...glass({ padding: '14px' }), flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <SectionTitle color={C.cyan}>📡 LIVE INCIDENT FEED</SectionTitle>
                <span style={{
                  background: 'rgba(0,255,136,0.12)', color: '#00ff88', padding: '2px 8px', borderRadius: '10px',
                  fontSize: '8px', fontWeight: '800', border: '1px solid rgba(0,255,136,0.22)', letterSpacing: '0.1em',
                  animation: 'pulse 1.8s ease-in-out infinite',
                }}>● LIVE</span>
              </div>
              <div ref={feedRef} style={{ height: '400px', overflowY: 'scroll', scrollbarWidth: 'none' }}>
                {[...FEED, ...FEED].map((f, i) => (
                  <div key={i} onClick={() => openModal('Live Incident Feed — All CRQs', filtered)} style={{
                    padding: '5px 7px', marginBottom: '3px', borderRadius: '5px', fontSize: '9.5px', cursor: 'pointer',
                    background: f.type === 'error' ? 'rgba(255,51,102,0.07)' : f.type === 'success' ? 'rgba(0,255,136,0.055)' : f.type === 'warning' ? 'rgba(255,215,0,0.055)' : 'rgba(0,191,255,0.04)',
                    borderLeft: `2px solid ${f.type === 'error' ? C.red : f.type === 'success' ? C.green : f.type === 'warning' ? C.yellow : C.blue}`,
                    lineHeight: '1.35',
                  }}>
                    <span style={{ color: 'rgba(90,135,200,0.55)', fontFamily: 'monospace', marginRight: '5px', fontSize: '8.5px' }}>{f.t}</span>
                    <span style={{ color: f.type === 'error' ? '#ff9999' : f.type === 'success' ? '#88ffcc' : f.type === 'warning' ? '#ffdd88' : 'rgba(190,220,255,0.82)' }}>{f.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM SECTION — 4 columns ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>

          {/* Stage Distribution */}
          {mounted && (
            <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('Stage Distribution', filtered)}>
              <SectionTitle color={C.blue}>📋 STAGE DISTRIBUTION</SectionTitle>
              <div style={{ height: '205px' }}>
                <Bar data={stageDist} options={{
                  ...baseChartOpts(), indexAxis: 'y' as const,
                  plugins: { legend: { display: false }, tooltip: {} },
                  scales: {
                    x: { ticks: { color: 'rgba(180,210,255,0.6)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: 'rgba(180,210,255,0.75)', font: { size: 9 } }, grid: { display: false } },
                  },
                }} />
              </div>
            </div>
          )}

          {/* Lifecycle Time Analysis */}
          <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('Lifecycle Time Analysis', filtered)}>
            <SectionTitle color={C.yellow}>⏳ LIFECYCLE TIME ANALYSIS</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '6px', paddingTop: '4px' }}>
              {lifecycleGauges.map((l, i) => (
                <SemiGauge key={i} val={l.val} color={l.color} label={l.label} />
              ))}
            </div>
            <div style={{ marginTop: '8px', padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: 'rgba(130,175,230,0.5)' }}>Avg SLA Achievement: </span>
              <span style={{ fontSize: '12px', fontWeight: '800', ...neon(C.cyan) }}>
                {filtered.length > 0 ? Math.round((filtered.filter(c => c.aging <= 8).length / filtered.length) * 1000) / 10 : 0}%
              </span>
            </div>
          </div>

          {/* CRQ Aging Heatmap */}
          <div style={glass({ padding: '14px' })}>
            <SectionTitle color={C.green}>🗓 CRQ AGING HEATMAP</SectionTitle>
            <div style={{ fontSize: '8.5px', color: 'rgba(110,155,210,0.45)', marginBottom: '7px', marginTop: '-6px' }}>Aging count by domain × weekday</div>
            <div style={{ display: 'grid', gridTemplateColumns: '58px repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
              <div />
              {HM_DAYS.map(d => (
                <div key={d} style={{ fontSize: '8px', textAlign: 'center', color: 'rgba(140,185,240,0.48)', fontWeight: '700', letterSpacing: '0.04em' }}>{d}</div>
              ))}
            </div>
            {HM_VALUES.map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '58px repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
                <div style={{ fontSize: '8.5px', color: 'rgba(175,210,255,0.6)', display: 'flex', alignItems: 'center', paddingRight: '3px', fontWeight: '500' }}>{HM_DOMAINS[ri]}</div>
                {row.map((val, ci) => <HeatCell key={ci} val={val} onClick={() => openModal(`Heatmap: ${HM_DOMAINS[ri]} — ${HM_DAYS[ci]}`, filtered.filter(c => c.domain.includes(HM_DOMAINS[ri].replace('Svc Opt', 'Service'))))} />)}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '5px', marginTop: '9px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', color: 'rgba(130,175,230,0.4)' }}>Low</span>
              {['rgba(0,255,136,0.45)', 'rgba(100,220,150,0.5)', 'rgba(255,215,0,0.55)', 'rgba(255,140,50,0.6)', 'rgba(255,51,102,0.65)'].map((bg, i) => (
                <div key={i} style={{ width: '20px', height: '9px', background: bg, borderRadius: '2px' }} />
              ))}
              <span style={{ fontSize: '8px', color: 'rgba(130,175,230,0.4)' }}>High</span>
            </div>
          </div>

          {/* Domain-wise CRQ Analytics */}
          {mounted && (
            <div style={glass({ padding: '14px', cursor: 'pointer' })} onClick={() => openModal('Domain-wise CRQ Analytics', filtered)}>
              <SectionTitle color={C.purple}>🏢 DOMAIN-WISE CRQ ANALYTICS</SectionTitle>
              <div style={{ height: '205px' }}>
                <Bar data={domainCRQ} options={stackedXOpts} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '14px', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(0,191,255,0.07)',
        }}>
          <span style={{ fontSize: '9px', color: 'rgba(90,130,185,0.38)', letterSpacing: '0.06em' }}>
            NOC CRQ Analytics Platform v4.2.1 · Telecom Network Operations Center · All times UTC
          </span>
          <div style={{ display: 'flex', gap: '14px' }}>
            {[
              { label: 'System Status', val: 'OPERATIONAL', color: C.green },
              { label: 'Data Latency', val: '< 2s', color: C.cyan },
              { label: 'Active Users', val: '47', color: C.blue },
            ].map((s, i) => (
              <div key={i} style={{ fontSize: '9px', color: 'rgba(130,175,230,0.45)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span>{s.label}:</span>
                <span style={{ fontWeight: '700', color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

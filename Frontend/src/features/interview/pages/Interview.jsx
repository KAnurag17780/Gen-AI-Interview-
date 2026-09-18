import React, { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useinterview.js'
import { Link, useParams } from 'react-router'

const severityConfig = {
  low: { cls: 'chip low', label: 'Low gap' },
  medium: { cls: 'chip accent', label: 'Medium gap' },
  high: { cls: 'chip danger', label: 'High gap' },
}

const TABS = [
  { key: 'plan', label: 'Plan', kicker: 'Preparation roadmap' },
  { key: 'technical', label: 'Technical', kicker: 'Technical interview questions' },
  { key: 'behavioral', label: 'Behavioral', kicker: 'Behavioral interview questions' },
]

export const Interview = () => {

    const { loading, report, getReportById, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const [errorMessage, setErrorMessage] = useState("")
    const [activeTab, setActiveTab] = useState("plan")

    useEffect(() => {
      const activeReportId = report?._id || report?.id

      if (!interviewId || activeReportId === interviewId) {
        return
      }

      const loadReport = async () => {
        setErrorMessage("")

        try {
          await getReportById(interviewId)
        } catch (error) {
          setErrorMessage(error?.response?.data?.message || "Unable to load interview report.")
        }
      }

      loadReport()
    }, [interviewId])

    if (loading) {
      return (
        <main className="interview-page">
          <header className="report-topbar">
            <p className="eyebrow">Interview readiness report</p>
            <h1>Loading report…</h1>
          </header>
          <div className="loading-pulse">
            <div className="pulse-block" />
            <div className="pulse-block" />
            <div className="pulse-block" />
          </div>
        </main>
      )
    }

    if (!report) {
      return (
        <main className="interview-page">
          <header className="report-topbar">
            <p className="eyebrow">Interview readiness report</p>
            <h1>{errorMessage || "Report not available"}</h1>
            <p className="lede">Generate a new report or open a report that belongs to your account.</p>
            <Link className="button primary-button" to="/">Back to home</Link>
          </header>
        </main>
      )
    }

    // Strip only obviously corrupted entries: exact field-name match or known fallback placeholder
    const CORRUPTED_EXACT = new Set([
      'question', 'intention', 'answer', 'skill', 'severity', 'day', 'focus', 'tasks',
      // severity values should never be skill names
      'low', 'medium', 'high',
      'technical question not provided', 'behavioral question not provided',
      'no clear interviewer intention was provided.',
      'no answer guidance was provided.',
    ])
    const isBad = (val) => {
      if (!val) return true
      const s = String(val).toLowerCase().trim()
      return CORRUPTED_EXACT.has(s) || /^\d+$/.test(s)
    }

    const skillGaps = (Array.isArray(report.skillGaps) ? report.skillGaps : [])
      .filter(g => g.skill && !isBad(g.skill))

    const technicalQuestions = (Array.isArray(report.technicalQuestions) ? report.technicalQuestions : [])
      .filter(q => q.question && !isBad(q.question))

    const behavioralQuestions = (Array.isArray(report.behavioralQuestions) ? report.behavioralQuestions : [])
      .filter(q => q.question && !isBad(q.question))

    // Plan: strip corrupted focus values, safely coerce tasks, deduplicate
    const preparationPlan = (Array.isArray(report.preparationPlan) ? report.preparationPlan : [])
      .filter(p => p.focus && !isBad(p.focus))
      .map(p => ({ ...p, tasks: Array.isArray(p.tasks) ? p.tasks : [] }))
      .reduce((acc, p) => {
        const exists = acc.find(x => x.day === p.day && x.focus === p.focus)
        if (!exists) acc.push(p)
        return acc
      }, [])

    const currentTab = TABS.find(t => t.key === activeTab)
    const score = Math.max(0, Math.min(100, Math.round(Number(report.matchScore) || 0)))

  return (
    <main className="interview-page">
      {/* ── Top bar ── */}
      <header className="report-topbar">
        <div className="topbar-left">
          <p className="eyebrow">interview readiness report</p>
          <h1>{report.title || "Interview report"}</h1>
        </div>
        <div className="topbar-right">
          <Link to="/home" className="back-btn">
            ← Back
          </Link>
          <button className='button primary-button'
            onClick={() => getResumePdf(interviewId)}>
            ↓ Resume PDF
          </button>
        </div>
      </header>

      {/* ── Dashboard body ── */}
      <div className="dashboard">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          {/* Score */}
          <div className="sidebar-section">
            <p className="panel-kicker">metric 01</p>
            <h2>readiness score</h2>
            <div
              className="score-ring"
              aria-label="Match score"
              style={{
                '--score-deg': `${(score / 100) * 360}deg`,
              }}
            >
              <strong>{score}%</strong>
              <span>match index</span>
            </div>
            <p className="support-text">
              Highlights your strongest themes and next areas to strengthen.
            </p>
          </div>

          {/* Skill gaps */}
          {skillGaps.length > 0 && (
            <div className="sidebar-section">
              <p className="panel-kicker">identified</p>
              <h2>skill gaps</h2>
              <ul className="gap-list">
                {skillGaps.map((item) => {
                  const sev = item.severity?.toLowerCase() || 'medium'
                  const cfg = severityConfig[sev] || severityConfig.medium
                  return (
                    <li key={item.skill} className="gap-item">
                      <strong>{item.skill}</strong>
                      <span className={cfg.cls}>{cfg.label}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Nav tabs */}
          <nav className="sidebar-nav">
            <p className="panel-kicker">sections</p>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`nav-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="nav-icon">
                  {tab.key === 'technical' && '⚙'}
                  {tab.key === 'behavioral' && '💬'}
                  {tab.key === 'plan' && '📋'}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content area ── */}
        <section className="content-area">
          <header className="content-header">
            <div>
              <p className="panel-kicker">{currentTab?.label}</p>
              <h2>{currentTab?.kicker}</h2>
            </div>
          </header>

          {/* Plan tab (default) */}
          {activeTab === 'plan' && (
            preparationPlan.length === 0
              ? <p className="empty-state">No preparation plan available for this report.</p>
              : <div className="plan-grid">
                  {preparationPlan.map((day, idx) => (
                    <article key={`${idx}-${day.focus}`} className="plan-card">
                      <p className="plan-day">day {String(idx + 1).padStart(2, '0')}</p>
                      <h3>{day.focus}</h3>
                      <ul className="tips-list">
                        {day.tasks.map((task, ti) => (
                          <li key={ti}>{task}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
          )}

          {/* Technical tab */}
          {activeTab === 'technical' && (
            technicalQuestions.length === 0
              ? <p className="empty-state">No technical questions available for this report.</p>
              : <div className="question-stack">
                  {technicalQuestions.map((item, index) => (
                    <article key={`${item.question}-${index}`} className="question-card">
                      <p className="question-number">Q{String(index + 1).padStart(2, '0')}</p>
                      <h3>{item.question}</h3>
                      <p className="question-label">Interviewer intention</p>
                      <p className="question-copy">{item.intention}</p>
                      <p className="question-label">Suggested answer direction</p>
                      <p className="question-copy">{item.answer}</p>
                    </article>
                  ))}
                </div>
          )}

          {/* Behavioral tab */}
          {activeTab === 'behavioral' && (
            <div className="question-stack">
              {behavioralQuestions.map((item, index) => (
                <article key={`${item.question}-${index}`} className="question-card">
                  <p className="question-number">B{String(index + 1).padStart(2, '0')}</p>
                  <h3>{item.question}</h3>
                  <p className="question-label">Interviewer intention</p>
                  <p className="question-copy">{item.intention}</p>
                  <p className="question-label">Suggested answer direction</p>
                  <p className="question-copy">{item.answer}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Interview

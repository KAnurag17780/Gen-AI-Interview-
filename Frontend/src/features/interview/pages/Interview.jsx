import React, { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useinterview.js'
import { Link, useParams } from 'react-router'

const severityTone = {
  low: 'chip',
  medium: 'chip accent',
  high: 'chip danger',
}

export const Interview = () => {

    const { loading, report, getReportById , getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const [errorMessage, setErrorMessage] = useState("")

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
          <section className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">Interview readiness report</p>
              <h1>Loading report...</h1>
            </div>
          </section>
        </main>
      )
    }

    if (!report) {
      return (
        <main className="interview-page">
          <section className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">Interview readiness report</p>
              <h1>{errorMessage || "Report not available"}</h1>
              <p className="lede">Generate a new report or open a report that belongs to your account.</p>
              <Link className="button primary-button" to="/">Back to home</Link>
            </div>
          </section>
        </main>
      )
    }

    const skillGaps = Array.isArray(report.skillGaps) ? report.skillGaps : []
    const technicalQuestions = Array.isArray(report.technicalQuestions) ? report.technicalQuestions : []
    const behavioralQuestions = Array.isArray(report.behavioralQuestions) ? report.behavioralQuestions : []
    const preparationPlan = Array.isArray(report.preparationPlan) ? report.preparationPlan : []

  return (
    <main className="interview-page">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Interview readiness report</p>
          <h1>{report.title || "Interview report"}</h1>
          <p className="lede">{report.summary || report.jobDescription}</p>
        </div>

        <div className="hero-badges" aria-label="Report summary highlights">
          <span>Match score {report.matchScore}%</span>
          <span>Technical + behavioral prep</span>
          <span>Skill-gap focus</span>
        </div>

        <button className='button primary-button'
        onClick={() => getResumePdf(interviewId)}>
          
          Download Resume 
        </button>
      </section>

      <section className="panel-grid report-grid">
        <article className="panel score-panel">
          <header className="panel-header">
            <div>
              <p className="panel-kicker">Overview</p>
              <h2>Readiness score</h2>
            </div>
            <span className="chip accent">High confidence</span>
          </header>

          <div className="score-ring" aria-label="Match score">
            <strong>{report.matchScore}</strong>
            <span>/ 100</span>
          </div>
          <p className="support-text">
            The report highlights your strongest interview themes and the next areas to strengthen before the final round.
          </p>
        </article>

        <article className="panel">
          <header className="panel-header">
            <div>
              <p className="panel-kicker">Focus</p>
              <h2>Skill gaps</h2>
            </div>
            <span className="chip">Priority</span>
          </header>

          <ul className="gap-list">
            {skillGaps.map((item) => (
              <li key={item.skill} className="gap-item">
                <div>
                  <strong>{item.skill}</strong>
                  <p className="support-text">Keep this in your prep plan to close the experience gap.</p>
                </div>
                <span className={severityTone[item.severity] || 'chip'}>{item.severity}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel-grid stacked-grid">
        <article className="panel">
          <header className="panel-header">
            <div>
              <p className="panel-kicker">Technical</p>
              <h2>Technical interview questions</h2>
            </div>
            <span className="chip">ML + cloud</span>
          </header>

          <div className="question-stack">
            {technicalQuestions.map((item, index) => (
              <article key={`${item.question}-${index}`} className="question-card">
                <p className="question-number">Q{index + 1}</p>
                <h3>{item.question}</h3>
                <p className="question-label">Interviewer intention</p>
                <p className="question-copy">{item.intention}</p>
                <p className="question-label">Suggested answer direction</p>
                <p className="question-copy">{item.answer}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <div>
              <p className="panel-kicker">Behavioral</p>
              <h2>Behavioral interview questions</h2>
            </div>
            <span className="chip accent">Storytelling</span>
          </header>

          <div className="question-stack">
            {behavioralQuestions.map((item, index) => (
              <article key={`${item.question}-${index}`} className="question-card">
                <p className="question-number">B{index + 1}</p>
                <h3>{item.question}</h3>
                <p className="question-label">Interviewer intention</p>
                <p className="question-copy">{item.intention}</p>
                <p className="question-label">Suggested answer direction</p>
                <p className="question-copy">{item.answer}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <header className="panel-header">
          <div>
            <p className="panel-kicker">Plan</p>
            <h2>Preparation roadmap</h2>
          </div>
          <span className="chip">3-day focus</span>
        </header>

        <div className="plan-grid">
          {preparationPlan.map((day) => (
            <article key={`${day.day}-${day.focus}`} className="plan-card">
              <p className="plan-day">Day {day.day}</p>
              <h3>{day.focus}</h3>
              <ul className="tips-list">
                {day.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Interview

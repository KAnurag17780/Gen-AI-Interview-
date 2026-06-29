import { useState , useRef, useEffect, useContext } from 'react'
import { useInterview } from "../hooks/useinterview.js"
import React from 'react'
import '../style/home.scss'
import { useNavigate } from 'react-router'
import { logout } from '../../auth/services/auth.api'
import { AuthContext } from '../../auth/auth.context'

export const Home = () => {

  const {loading , generateReport , reports, getAllReports } = useInterview()
  const { setUser } = useContext(AuthContext)
  const [jobDescription , setJobDescription] = useState("")
  const [selfDescription , setSelfDescription] = useState("")
  const resumeInputRef = useRef()
  const recentReports = reports
    .filter((item) => (item?._id || item?.id) && (item?.title || item?.matchScore !== undefined))
    .slice(0, 3)

  const navigate = useNavigate()

useEffect(() => {
  getAllReports()
}, [])

const handleGenerateReport = async () => {
  const resumeFile = resumeInputRef.current.files[0]
  const data = await generateReport({jobDescription , selfDescription , resumeFile })
  navigate(`/interview/${data?.report?._id || data?.report?.id}`)
}

const handleLogout = async () => {
  try {
    await logout()
    setUser(null)
    navigate('/login')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}

if(loading){
  return (<main className='loading-screen'
  ><h1>Loading your interview plan ...</h1>
    </main>)
}

  return (
    <main className="home-page">
      <section className="hero-card">
        <button
          id="logout-btn"
          className="logout-btn"
          type="button"
          onClick={handleLogout}
          title="Sign out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
        <div className="hero-copy">
          <p className="eyebrow">AI Interview Prep</p>
          <h1>Build a smarter interview report from your resume and role brief.</h1>
          <p className="lede">
            Paste the job description, upload your resume, and add your self-summary to generate a
            polished interview readiness report.
          </p>
        </div>

        <div className="hero-badges" aria-label="Highlights">
          <span>Resume + JD</span>
          <span>Structured insights</span>
          <span>Ready for review</span>
        </div>
      </section>

      <section className="panel-grid">
        <article className="panel panel-left">
          <header className="panel-header">
            <div>
              <p className="panel-kicker">Step 1</p>
              <h2>Job Description</h2>
            </div>
            <span className="chip">Required</span>
          </header>

          <label className="field-label" htmlFor="jobDescription">Paste the role details</label>
          <textarea
            onChange={(e) => setJobDescription(e.target.value)} 
            id="jobDescription"
            name="jobDescription"
            className="text-area large"
            placeholder="Add the role requirements, responsibilities, and preferred skills..."
          />

          <ul className="tips-list">
            <li>Include must-have skills and experience level.</li>
            <li>Highlight the team, stack, and impact area.</li>
            <li>Use a clear, detailed job brief for better report quality.</li>
          </ul>
        </article>

        <article className="panel panel-right">
          <header className="panel-header">
            <div>
              <p className="panel-kicker">Step 2</p>
              <h2>Resume & Self Summary</h2>
            </div>
            <span className="chip accent">Recommended</span>
          </header>

          <div className="upload-box">
            <div>
              <p className="panel-label">Resume</p>
              <p className="support-text">Upload a PDF resume for deeper analysis.</p>
            </div>
            <label className="upload-btn" htmlFor="resume">Choose PDF</label>
            <input ref={resumeInputRef} hidden type="file" name="resume" id="resume" accept=".pdf" />
          </div>

          <div className="field-block">
            <label className="field-label" htmlFor="selfDescription">Self description</label>
            <textarea
                onChange={(e) => setSelfDescription(e.target.value)}  
              id="selfDescription"
              name="selfDescription"
              className="text-area"
              placeholder="Share your background, strengths, and interview focus..."
            />
          </div>

          <button
            onClick={handleGenerateReport}
            className="generate-btn" type="button">Generate Interview Report</button>
        </article>
      </section>

      {recentReports.length > 0 && (
        <section className="recent-reports">
          <header className="section-header">
            <div>
              <p className="panel-kicker">Recent</p>
              <h2>Your interview reports</h2>
            </div>
            <span className="chip">Latest 3</span>
          </header>

          <div className="report-list">
            {recentReports.map((item) => (
              <button
                key={item._id || item.id}
                type="button"
                className="report-item"
                onClick={() => navigate(`/interview/${item._id || item.id}`)}
              >
                <div>
                  <h3>{item.title || "Interview report"}</h3>
                  <p className="support-text">Open this saved interview readiness report.</p>
                </div>
                <span className="score-badge">{item.matchScore ?? 0}%</span>
              </button>
            ))}
          </div>
        </section>
      )}
     </main>
  )
}

export default Home

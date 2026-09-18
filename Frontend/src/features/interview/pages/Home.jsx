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
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedFileName, setSelectedFileName] = useState("")
  const resumeInputRef = useRef()
  const recentReports = reports
    .filter((item) => (item?._id || item?.id) && (item?.title || item?.matchScore !== undefined))
    .slice(0, 3)

  const navigate = useNavigate()

useEffect(() => {
  getAllReports()
}, [])

const handleGenerateReport = async () => {
  setErrorMessage("")
  const resumeFile = resumeInputRef.current?.files[0]

  if (!resumeFile) {
    setErrorMessage("Please select a PDF resume before generating.")
    return
  }
  if (!jobDescription.trim()) {
    setErrorMessage("Please enter a job description.")
    return
  }

  try {
    const data = await generateReport({ jobDescription, selfDescription, resumeFile })
    const reportId = data?.report?._id || data?.report?.id
    if (!reportId) {
      setErrorMessage("Report was generated but could not be opened. Please try again.")
      return
    }
    navigate(`/interview/${reportId}`)
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "Failed to generate report. Please try again."
    setErrorMessage(msg)
  }
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
          <p className="eyebrow">ai interview intelligence</p>
          <h1>Build a smarter interview report from your resume and role brief.</h1>
          <p className="lede">
            Paste the job description, upload your resume, and add your self-summary to generate a
            polished interview readiness report.
          </p>
        </div>

        <div className="hero-badges" aria-label="Highlights">
          <span>resume + jd</span>
          <span>structured insights</span>
          <span>ready for review</span>
        </div>
      </section>

      <section className="panel-grid">
        <article className="panel panel-left">
          <header className="panel-header">
            <div>
              <p className="panel-kicker">01 / intake</p>
              <h2>job description</h2>
            </div>
            <span className="chip">required</span>
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
              <p className="panel-kicker">02 / candidate</p>
              <h2>resume & self summary</h2>
            </div>
            <span className="chip accent">recommended</span>
          </header>

          <div className="upload-box">
            <div>
              <p className="panel-label">Resume</p>
              <p className="support-text">
                {selectedFileName ? `📄 ${selectedFileName}` : "Upload a PDF resume for deeper analysis."}
              </p>
            </div>
            <label className="upload-btn" htmlFor="resume">Choose PDF</label>
            <input
              ref={resumeInputRef}
              hidden
              type="file"
              name="resume"
              id="resume"
              accept=".pdf"
              onChange={(e) => setSelectedFileName(e.target.files[0]?.name || "")}
            />
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

          {errorMessage && (
            <p className="form-error" role="alert">{errorMessage}</p>
          )}

          <button
            onClick={handleGenerateReport}
            className="generate-btn" type="button">Generate Interview Report →</button>
        </article>
      </section>

      {recentReports.length > 0 && (
        <section className="recent-reports">
          <header className="section-header">
            <div>
              <p className="panel-kicker">history</p>
              <h2>recent reports</h2>
            </div>
            <span className="chip">latest {recentReports.length}</span>
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

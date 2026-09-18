const  { GoogleGenAI } = require("@google/genai")
const {z} = require("zod")
const {zodToJsonSchema} = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey : process.env.GOOGLE_GENAI_API_KEY
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function generateContentWithRetry(options, retries = 2) {
  let lastError

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await ai.models.generateContent(options)
    } catch (error) {
      lastError = error

      if (attempt < retries) {
        await sleep(700 * (attempt + 1))
      }
    }
  }

  throw lastError
}

  const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

function normalizeInterviewReport(report = {}) {
  const parseJsonObject = item => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return item
    }

    if (typeof item === "string") {
      try {
        const parsed = JSON.parse(item)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed
        }
      } catch {
        return null
      }
    }

    return null
  }

  const normalizeTechnicalQuestions = value => {
    if (!value) return []
    const items = Array.isArray(value) ? value : [value]
    return items.map(item => {
      const obj = parseJsonObject(item) || { question: String(item || "") }
      return {
        question: String(obj.question || obj.questions || "").trim() || "Technical question not provided",
        intention: String(obj.intention || obj.intent || "").trim() || "No clear interviewer intention was provided.",
        answer: String(obj.answer || "").trim() || "No answer guidance was provided.",
      }
    }).filter(item => item.question)
  }

  const normalizeBehavioralQuestions = value => {
    if (!value) return []
    const items = Array.isArray(value) ? value : [value]
    return items.map(item => {
      const obj = parseJsonObject(item) || { question: String(item || "") }
      return {
        question: String(obj.question || obj.questions || "").trim() || "Behavioral question not provided",
        intention: String(obj.intention || obj.intent || "").trim() || "No clear interviewer intention was provided.",
        answer: String(obj.answer || "").trim() || "No answer guidance was provided.",
      }
    }).filter(item => item.question)
  }

  const normalizeSkillGaps = value => {
    if (!value) return []
    const items = Array.isArray(value) ? value : [value]
    return items.map(item => {
      const obj = parseJsonObject(item) || { skill: String(item || "") }
      return {
        skill: String(obj.skill || "").trim(),
        severity: String(obj.severity || obj.level || "medium").trim().toLowerCase() || "medium",
      }
    }).filter(item => item.skill)
  }

  const normalizePreparationPlan = value => {
    if (!value) return []
    const items = Array.isArray(value) ? value : [value]
    return items.map(item => {
      const obj = parseJsonObject(item) || { focus: String(item || "") }
      return {
        day: Number(obj.day) || 1,
        focus: String(obj.focus || "").trim(),
        tasks: Array.isArray(obj.tasks) ? obj.tasks.map(String) : [String(obj.tasks || obj.task || "")].filter(Boolean),
      }
    }).filter(item => item.focus)
  }

  return {
    ...report,
    matchScore: typeof report.matchScore === "number" ? report.matchScore : Number(report.matchScore) || 0,
    title: String(report.title || report.jobTitle || "").trim(),
    technicalQuestions: normalizeTechnicalQuestions(report.technicalQuestions),
    behavioralQuestions: normalizeBehavioralQuestions(report.behavioralQuestions),
    skillGaps: normalizeSkillGaps(report.skillGaps),
    preparationPlan: normalizePreparationPlan(report.preparationPlan),
  }
}

 async function generateInterviewReport(resume , selfDescription , jobDescription  ) {
   const safeResume = String(resume || "").trim().slice(0, 6000)
   const safeSelfDescription = String(selfDescription || "").trim()
   const safeJobDescription = String(jobDescription || "").trim()

   const prompt = `You are an expert interview coach. Analyze the candidate profile and the target role, then output a single valid JSON object.

STRICT RULES:
- Output ONLY a valid JSON object. No markdown, no code fences, no extra text.
- Every field MUST be populated with real, specific content based on the resume and job description.
- "intention" must explain WHY an interviewer would ask that question.
- "answer" must give a concrete suggested answer direction, not a placeholder.
- "matchScore" must reflect actual match: if the resume strongly matches the JD, score 80-95; weak match = 20-50.
- "severity" for skillGaps must vary: use "low" when the gap is minor, "high" when it is critical for the role.
- Each question object MUST have all three fields: question, intention, answer.

EXACT OUTPUT FORMAT (follow this structure precisely):
{
  "matchScore": 72,
  "title": "Senior Backend Engineer Interview Report",
  "technicalQuestions": [
    {
      "question": "Explain how you would design a rate limiter for a REST API.",
      "intention": "To assess system design skills and knowledge of API patterns required for this role.",
      "answer": "Discuss token bucket or sliding window algorithms, Redis for distributed state, and returning 429 status codes with Retry-After headers."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Tell me about a time you had to debug a critical production issue under pressure.",
      "intention": "To evaluate problem-solving ability and composure in high-stakes situations.",
      "answer": "Use the STAR method: describe the incident, how you isolated the root cause, the fix you deployed, and what you changed to prevent recurrence."
    }
  ],
  "skillGaps": [
    { "skill": "Kubernetes orchestration", "severity": "high" },
    { "skill": "GraphQL API design", "severity": "low" }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "System Design fundamentals",
      "tasks": ["Study rate limiting patterns", "Review CAP theorem", "Practice 2 system design questions"]
    }
  ]
}

Now generate the report for:

Resume:
${safeResume}

Self Description:
${safeSelfDescription}

Job Description:
${safeJobDescription}`

    const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            temperature: 0.3,
            maxOutputTokens: 8000,
            responseMimeType: "application/json",
        }
    })

 const rawText = typeof response?.text === "string" ? response.text : ""
 console.log("[AI RAW]", rawText.slice(0, 2000))
 const parsed = extractJsonObject(rawText)
 console.log("[AI PARSED] matchScore:", parsed.matchScore, "| techQ[0]:", JSON.stringify(parsed.technicalQuestions?.[0]), "| skillGap[0]:", JSON.stringify(parsed.skillGaps?.[0]))
 return normalizeInterviewReport(parsed)
 
}

function extractJsonObject(rawText) {
  if (typeof rawText !== "string") {
    throw new Error("AI response did not contain text")
  }

  const text = rawText.trim()

  const removeCodeFence = input => {
    const fenced = input.match(/```(?:json)?\n([\s\S]*?)\n```/i)
    return fenced ? fenced[1].trim() : input
  }

  const cleanedText = removeCodeFence(text)

  try {
    return JSON.parse(cleanedText)
  } catch (initialError) {
    const firstBracket = cleanedText.search(/[\[{]/)
    const lastBracket = Math.max(cleanedText.lastIndexOf("}"), cleanedText.lastIndexOf("]"))

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const candidate = cleanedText.slice(firstBracket, lastBracket + 1)
      try {
        return JSON.parse(candidate)
      } catch (candidateError) {
        const normalized = candidate.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
        try {
          return JSON.parse(normalized)
        } catch (normalizedError) {
          throw new Error(`Invalid JSON response from AI: ${normalizedError.message}`)
        }
      }
    }

    throw new Error(`Invalid JSON response from AI: ${initialError.message}`)
  }
}

async function getBrowser() {
    const puppeteer = (await import("puppeteer-core")).default
    const fs = require("fs")

    // 1. Explicit path from environment variable
    const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_BIN || process.env.CHROME_PATH
    if (envPath && fs.existsSync(envPath)) {
        return puppeteer.launch({
            executablePath: envPath,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        })
    }

    // 2. Local system browser (Windows / Mac / Linux)
    const localBrowserPaths = [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe",
        (process.env.PROGRAMFILES || "") + "\\Google\\Chrome\\Application\\chrome.exe",
        (process.env["PROGRAMFILES(X86)"] || "") + "\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        (process.env["PROGRAMFILES(X86)"] || "") + "\\Microsoft\\Edge\\Application\\msedge.exe",
        (process.env.PROGRAMFILES || "") + "\\Microsoft\\Edge\\Application\\msedge.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/snap/bin/chromium",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Chromium.app/Contents/MacOS/Chromium"
    ]

    for (const browserPath of localBrowserPaths) {
        if (browserPath && fs.existsSync(browserPath)) {
            return puppeteer.launch({
                executablePath: browserPath,
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
            })
        }
    }

    // 3. Fallback for AWS Lambda / Serverless Linux environment
    try {
        const chromium = (await import("@sparticuz/chromium-min")).default
        const packUrl = process.env.CHROMIUM_PACK_URL || "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.tar"
        const executablePath = await chromium.executablePath(packUrl)
        return puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: chromium.headless
        })
    } catch (err) {
        throw new Error(`Failed to launch browser for PDF generation: ${err.message}. Please ensure Google Chrome or Microsoft Edge is installed.`)
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await getBrowser()
    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" })

      const pdfBuffer = await page.pdf({
          format: "A4", margin: {
              top: "20mm",
              bottom: "20mm",
              left: "15mm",
              right: "15mm"
          }
      })

      return pdfBuffer
    } finally {
        await browser.close()
    }
}

function extractHtmlContent(rawText) {
    if (typeof rawText !== "string" || !rawText.trim()) {
        throw new Error("AI response did not contain HTML")
    }

    const text = rawText.trim()
    const fenced = text.match(/```(?:html)?\n([\s\S]*?)\n```/i)
    const html = fenced ? fenced[1].trim() : text

    if (!html.includes("<html") && !html.includes("<body")) {
        throw new Error("AI response was not valid resume HTML")
    }

    return html
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

function buildFallbackResumeHtml({ resume, selfDescription, jobDescription }) {
    const resumeLines = String(resume || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 80)

    const summary = String(selfDescription || "").trim()
    const targetRole = String(jobDescription || "").trim()

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; line-height: 1.45; margin: 0; }
    h1 { font-size: 28px; margin: 0 0 8px; color: #0f172a; }
    h2 { font-size: 15px; margin: 22px 0 8px; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #dbeafe; padding-bottom: 5px; }
    p { margin: 0 0 8px; }
    ul { margin: 0; padding-left: 18px; }
    li { margin-bottom: 5px; }
    .muted { color: #475569; }
  </style>
</head>
<body>
  <h1>Resume</h1>
  ${targetRole ? `<p class="muted"><strong>Target role:</strong> ${escapeHtml(targetRole).slice(0, 600)}</p>` : ""}
  ${summary ? `<h2>Professional Summary</h2><p>${escapeHtml(summary)}</p>` : ""}
  <h2>Resume Details</h2>
  <ul>
    ${resumeLines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
  </ul>
</body>
</html>`
}

async function generateResumePdf({resume,selfDescription,jobDescription}){
  const safeResume = String(resume || "").trim().slice(0, 6000)
  const safeSelfDescription = String(selfDescription || "").trim().slice(0, 2000)
  const safeJobDescription = String(jobDescription || "").trim().slice(0, 3000)

  const prompt = `Generate a polished, ATS-friendly resume as a complete HTML document.

Requirements:
- Return only HTML. Do not return JSON, markdown, or code fences.
- Include <!doctype html>, html, head, style, and body.
- Keep styles inline in a <style> tag.
- Use the candidate resume as the source of truth.
- Tailor the summary, skills, and project bullets toward the job description.
- Do not invent companies, degrees, dates, or contact information.

Resume:
${safeResume}

Self Description:
${safeSelfDescription}

Job Description:
${safeJobDescription}`

  try {
    const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config : {
            temperature: 0.2,
            maxOutputTokens: 3000,
        }
    })

    const htmlContent = extractHtmlContent(response.text)
    return generatePdfFromHtml(htmlContent)
  } catch (error) {
    console.error("AI resume HTML generation failed, using fallback HTML:", error.message)
    const fallbackHtml = buildFallbackResumeHtml({
        resume: safeResume,
        selfDescription: safeSelfDescription,
        jobDescription: safeJobDescription
    })
    return generatePdfFromHtml(fallbackHtml)
  }
}

module.exports = { generateInterviewReport  , generateResumePdf  }

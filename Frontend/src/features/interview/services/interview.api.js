import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

/**
 * @description API call to generate interview report based on resume, self-description, and job description
 */


export const generateInterviewReport = async ({jobDescription , selfDescription , resumeFile }) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resume", resumeFile);  

    const response = await api.post("/api/interview", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return {
        ...response.data,
        report: response.data?.interviewReport ?? null,
    };
}

/**
 * @description API call to fetch a specific interview report by its ID
 */

export const getInterviewReportById = async (interviewId) => {  
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return {
        ...response.data,
        report: response.data?.interviewReport ?? null,
    };
} 
/**
 * @description API call to fetch all interview reports for the logged-in user
 */

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview");
    return {
        ...response.data,
        reports: response.data?.interviewReports ?? [],
    };
}

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}
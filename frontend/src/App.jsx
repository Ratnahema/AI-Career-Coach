
import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "./AuthContext";

import {
  LayoutDashboard,
  FileText,
  BriefcaseBusiness,
  MessageSquare,
  ChartNoAxesCombined,
  Settings,
  UserRound,
  Bell,
  Search,
  Upload,
  ArrowUpRight,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  Download,
  LogOut,
} from "lucide-react";

function App() {
  const { session, user, signOut } = useAuth();

  const [activePage, setActivePage] = useState("Dashboard");

  // RESUME STATES
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  // RESUME ANALYZER STATES
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  // JOB MATCHER STATES
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  // CAREER CHAT STATES
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Career Coach. Ask me anything about your resume, skills, projects, or career preparation.",
    },
  ]);
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState("");

  // CAREER REPORT STATES
  const [careerReport, setCareerReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [reportError, setReportError] = useState("");

  // PDF REPORT ELEMENT REFERENCE
  const reportContentRef = useRef(null);

const API_URL = "https://ai-career-coach-2a65.onrender.com";

  // AUTHENTICATED REQUEST HEADERS
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  };

  // RESET LOCAL DATA WHEN ACCOUNT CHANGES
  useEffect(() => {
    setActivePage("Dashboard");
    setSelectedFile(null);
    setUploadMessage("");
    setIsLoading(false);
    setExtractedText("");
    setResumeAnalysis(null);
    setIsAnalyzingResume(false);
    setJobDescription("");
    setMatchResult(null);
    setIsMatching(false);
    setChatInput("");
    setChatMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your AI Career Coach. Ask me anything about your resume, skills, projects, or career preparation.",
      },
    ]);
    setIsChatting(false);
    setChatError("");
    setCareerReport("");
    setIsGeneratingReport(false);
    setIsDownloadingPDF(false);
    setReportError("");
  }, [user.id]);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Resume Analyzer", icon: FileText },
    { name: "Job Matcher", icon: BriefcaseBusiness },
    { name: "Career Chat", icon: MessageSquare },
    { name: "Career Reports", icon: ChartNoAxesCombined },
  ];

  // LOGOUT
  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    const { error } = await signOut();

    if (error) {
      alert("Logout failed: " + error.message);
    }
  };

  // PAGE NAVIGATION
  const handlePageChange = (page) => {
    setActivePage(page);
    setUploadMessage("");
    setChatError("");
    setReportError("");
  };

  // STEP 1: UPLOAD RESUME
  const handleAnalyzeResume = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select a resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsLoading(true);
      setUploadMessage("");
      setExtractedText("");
      setResumeAnalysis(null);
      setMatchResult(null);
      setCareerReport("");

      const response = await axios.post(
        `${API_URL}/api/resume/upload`,
        formData,
        authHeaders
      );

      setExtractedText(response.data.extracted_text);
      setUploadMessage(response.data.message);
    } catch (error) {
      console.error("Resume upload error:", error);

      setUploadMessage(
        error.response?.data?.detail ||
          "Resume upload failed. Please check whether the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: AI RESUME ANALYSIS
  const handleAIResumeAnalysis = async () => {
    if (!extractedText) {
      setUploadMessage("Please upload your resume first.");
      return;
    }

    try {
      setIsAnalyzingResume(true);
      setResumeAnalysis(null);
      setUploadMessage("");

      const response = await axios.post(
        `${API_URL}/api/resume/analyze`,
        {
          resume_text: extractedText,
        },
        authHeaders
      );

      setResumeAnalysis(response.data);

      setUploadMessage(
        response.data.message ||
          "AI resume analysis completed successfully!"
      );
    } catch (error) {
      console.error("AI resume analysis error:", error);

      setUploadMessage(
        error.response?.data?.detail ||
          "AI resume analysis failed. Please check the backend."
      );
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  // JOB MATCHER API
  const handleJobMatch = async () => {
    if (!extractedText) {
      setUploadMessage("Please upload and analyze your resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setUploadMessage("Please enter a job description.");
      return;
    }

    try {
      setIsMatching(true);
      setMatchResult(null);
      setUploadMessage("");

      const response = await axios.post(
        `${API_URL}/api/job/match`,
        {
          resume_text: extractedText,
          job_description: jobDescription.trim(),
        },
        authHeaders
      );

      setMatchResult(response.data);

      setUploadMessage(
        response.data.message ||
          "Job matching completed successfully!"
      );
    } catch (error) {
      console.error("Job matching error:", error);

      setUploadMessage(
        error.response?.data?.detail ||
          "Job matching failed. Please check whether the backend is running."
      );
    } finally {
      setIsMatching(false);
    }
  };

  // CAREER CHAT API
  const handleCareerChat = async () => {
    const question = chatInput.trim();

    if (question.length < 3) {
      setChatError("Please enter a question with at least 3 characters.");
      return;
    }

    if (isChatting) return;

    setChatMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: question,
      },
    ]);

    setChatInput("");
    setChatError("");
    setIsChatting(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          question,
        },
        authHeaders
      );

      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.answer,
        },
      ]);
    } catch (error) {
      console.error("Career Chat error:", error);

      setChatError(
        error.response?.data?.detail ||
          "Unable to generate a response. Please check whether the backend is running."
      );
    } finally {
      setIsChatting(false);
    }
  };

  // CLEAR CAREER CHAT
  const handleClearChat = () => {
    setChatMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your AI Career Coach. How can I help you today?",
      },
    ]);

    setChatInput("");
    setChatError("");
  };

  // GENERATE CAREER REPORT
  const handleGenerateCareerReport = async () => {
    if (!extractedText) {
      setReportError(
        "Please upload your resume first in the Resume Analyzer page."
      );
      return;
    }

    if (isGeneratingReport) return;

    try {
      setIsGeneratingReport(true);
      setReportError("");
      setCareerReport("");

      const response = await axios.post(
        `${API_URL}/api/career/report`,
        {
          resume_text: extractedText,
        },
        authHeaders
      );

      setCareerReport(response.data.report);
    } catch (error) {
      console.error("Career report error:", error);

      setReportError(
        error.response?.data?.detail ||
          "Unable to generate the career report. Please check the backend."
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // DOWNLOAD CAREER REPORT AS MARKDOWN
  const handleDownloadReport = () => {
    if (!careerReport) return;

    const blob = new Blob([careerReport], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AI_Career_Report.md";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // DOWNLOAD CAREER REPORT AS PDF
  const handleDownloadPDF = async () => {
    const element = reportContentRef.current;

    if (!element || !careerReport) {
      setReportError("Please generate a career report first.");
      return;
    }

    if (isDownloadingPDF) return;

    try {
      setIsDownloadingPDF(true);
      setReportError("");

      const options = {
        margin: [12, 12, 15, 12],

        filename: "AI_Career_Coach_Report.pdf",

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          scrollY: 0,
          windowWidth: 900,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
        },

        pagebreak: {
          mode: ["css", "legacy"],
          avoid: [
            "tr",
            "blockquote",
            "pre",
            "h1",
            "h2",
            "h3",
          ],
        },
      };

      await html2pdf()
        .set(options)
        .from(element)
        .save();
    } catch (error) {
      console.error("PDF download error:", error);

      setReportError(
        "Unable to download the PDF. Please try again."
      );
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={23} />
          </div>

          <div>
            <h2>CareerCoach</h2>
            <span>AI POWERED PLATFORM</span>
          </div>
        </div>

        <p className="menu-heading">WORKSPACE</p>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => handlePageChange(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="profile">
            <div className="avatar">
              {(user.email || "U").charAt(0).toUpperCase()}
            </div>

            <div className="profile-details">
              <strong>Welcome!</strong>
              <span title={user.email}>{user.email}</span>
            </div>
          </div>

          <button
            className="nav-item logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="breadcrumb">
            Workspace / <strong>{activePage}</strong>
          </div>

          <div className="top-actions">
            <button className="icon-button">
              <Search size={19} />
            </button>

            <button className="icon-button">
              <Bell size={19} />
            </button>

            <div className="top-avatar">
              <UserRound size={19} />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="page-content">
          {/* CAREER REPORTS PAGE */}
          {activePage === "Career Reports" ? (
            <div className="analyzer-page">
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">
                    YOUR PERSONALIZED CAREER INSIGHTS
                  </p>

                  <h1>Career Reports</h1>

                  <p className="subtitle">
                    Generate a detailed career report based on
                    your resume, skills, and professional profile.
                  </p>
                </div>

                <div className="welcome-icon">
                  <ChartNoAxesCombined size={34} />
                </div>
              </div>

              <div className="analyzer-card">
                <div className="analyzer-heading">
                  <div className="tool-icon purple">
                    <Sparkles size={23} />
                  </div>

                  <h2>AI Career Assessment</h2>

                  <p>
                    Our AI Career Coach analyzes your resume
                    and prepares personalized career recommendations.
                  </p>
                </div>

                <div className="info-grid">
                  <div className="info-card">
                    <FileText size={21} />
                    <div>
                      <h3>Profile Summary</h3>
                      <p>
                        Understand your education, skills, and experience.
                      </p>
                    </div>
                  </div>

                  <div className="info-card">
                    <Target size={21} />
                    <div>
                      <h3>Skill Gap Analysis</h3>
                      <p>
                        Identify skills you can improve or learn.
                      </p>
                    </div>
                  </div>

                  <div className="info-card">
                    <BriefcaseBusiness size={21} />
                    <div>
                      <h3>Career Opportunities</h3>
                      <p>
                        Explore job roles aligned with your profile.
                      </p>
                    </div>
                  </div>

                  <div className="info-card">
                    <TrendingUp size={21} />
                    <div>
                      <h3>Learning Roadmap</h3>
                      <p>
                        Get practical steps for career development.
                      </p>
                    </div>
                  </div>
                </div>

                {!extractedText && (
                  <p className="privacy-note">
                    Please upload your resume in the Resume Analyzer
                    page before generating your career report.
                  </p>
                )}

                <button
                  className="analyze-button"
                  onClick={handleGenerateCareerReport}
                  disabled={!extractedText || isGeneratingReport}
                >
                  <Sparkles size={18} />

                  {isGeneratingReport
                    ? "Generating Career Report..."
                    : "Generate My Career Report"}
                </button>

                {reportError && (
                  <p className="upload-message">{reportError}</p>
                )}
              </div>

              {/* GENERATED CAREER REPORT */}
              {careerReport && (
                <div className="result-section job-match-report">
                  <div className="report-heading">
                    <div>
                      <p className="eyebrow">
                        AI GENERATED CAREER ASSESSMENT
                      </p>

                      <h2>Your Career Report</h2>

                      <p>
                        Your personalized career recommendations
                        are ready.
                      </p>
                    </div>

                    <div className="welcome-icon">
                      <ChartNoAxesCombined size={30} />
                    </div>
                  </div>

                  {/* PDF CONTENT */}
                  <div
                    ref={reportContentRef}
                    className="report-content career-report-pdf"
                  >
                    <div className="pdf-report-title">
                      <h1>AI Career Coach</h1>
                      <p>Personalized Career Assessment Report</p>
                      <hr />
                    </div>

                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {careerReport}
                    </ReactMarkdown>

                    <div className="pdf-report-footer">
                      <hr />
                      <p>
                        Generated by AI Career Coach.
                        Please verify important information before
                        making career decisions.
                      </p>
                    </div>
                  </div>

                  {/* DOWNLOAD BUTTONS */}
                  <div className="report-download-actions">
                    <button
                      className="analyze-button"
                      onClick={handleDownloadReport}
                    >
                      <Download size={18} />
                      Download Markdown
                    </button>

                    <button
                      className="analyze-button pdf-download-button"
                      onClick={handleDownloadPDF}
                      disabled={isDownloadingPDF}
                    >
                      <Download size={18} />
                      {isDownloadingPDF
                        ? "Preparing PDF..."
                        : "Download PDF"}
                    </button>
                  </div>

                  {reportError && (
                    <p className="upload-message">{reportError}</p>
                  )}

                  <p className="privacy-note">
                    This report contains AI-generated recommendations.
                    Verify information before making career decisions.
                  </p>
                </div>
              )}
            </div>
          ) : activePage === "Career Chat" ? (
            /* CAREER CHAT PAGE */
            <div className="analyzer-page">
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">
                    YOUR PERSONAL AI ASSISTANT
                  </p>

                  <h1>Career Chat</h1>

                  <p className="subtitle">
                    Ask questions about your resume, skills, projects,
                    job preparation, and career growth.
                  </p>
                </div>

                <div className="welcome-icon">
                  <MessageSquare size={34} />
                </div>
              </div>

              <div className="analyzer-card career-chat-card">
                <div className="analyzer-heading">
                  <div className="tool-icon purple">
                    <Sparkles size={23} />
                  </div>

                  <h2>AI Career Assistant</h2>

                  <p>
                    Get personalized career guidance using your
                    resume context and AI.
                  </p>
                </div>

                <div className="chat-messages">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`chat-message ${
                        message.role === "user"
                          ? "user-message"
                          : "assistant-message"
                      }`}
                    >
                      <div className="chat-message-avatar">
                        {message.role === "user" ? (
                          <UserRound size={19} />
                        ) : (
                          <Sparkles size={19} />
                        )}
                      </div>

                      <div className="chat-message-content">
                        <strong>
                          {message.role === "user"
                            ? "You"
                            : "AI Career Coach"}
                        </strong>

                        <div className="chat-answer">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isChatting && (
                    <div className="chat-loading">
                      <Sparkles size={18} />
                      AI Career Coach is thinking...
                    </div>
                  )}
                </div>

                {chatError && (
                  <p className="upload-message">{chatError}</p>
                )}

                <div className="chat-input-area">
                  <textarea
                    className="job-description-input"
                    placeholder="Ask me anything about your career..."
                    value={chatInput}
                    onChange={(event) => {
                      setChatInput(event.target.value);
                      setChatError("");
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !isChatting
                      ) {
                        event.preventDefault();
                        handleCareerChat();
                      }
                    }}
                    rows={3}
                    disabled={isChatting}
                  />

                  <button
                    className="analyze-button"
                    onClick={handleCareerChat}
                    disabled={isChatting || !chatInput.trim()}
                  >
                    <MessageSquare size={18} />

                    {isChatting ? "Generating..." : "Send Message"}
                  </button>

                  <button
                    className="chat-clear-button"
                    onClick={handleClearChat}
                    disabled={isChatting}
                  >
                    Clear Chat
                  </button>
                </div>

                <p className="privacy-note">
                  Press Enter to send. Use Shift + Enter for a new line.
                </p>
              </div>
            </div>
          ) : activePage === "Resume Analyzer" ? (
            /* RESUME ANALYZER PAGE */
            <div className="analyzer-page">
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">
                    AI POWERED RESUME REVIEW
                  </p>

                  <h1>Resume Analyzer</h1>

                  <p className="subtitle">
                    Upload your resume to understand your skills,
                    strengths, and areas for improvement.
                  </p>
                </div>

                <div className="welcome-icon">
                  <FileText size={34} />
                </div>
              </div>

              <div className="analyzer-card">
                <div className="analyzer-heading">
                  <div className="tool-icon purple">
                    <Upload size={23} />
                  </div>

                  <h2>Upload Your Resume</h2>
                  <p>Choose your resume file to get started.</p>
                </div>

                <label className="upload-area">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      const extension = file.name
                        .split(".")
                        .pop()
                        .toLowerCase();

                      if (!["pdf", "docx", "txt"].includes(extension)) {
                        setSelectedFile(null);
                        setExtractedText("");
                        setResumeAnalysis(null);
                        setMatchResult(null);
                        setCareerReport("");
                        setUploadMessage(
                          "Please select a PDF, DOCX, or TXT file."
                        );
                        return;
                      }

                      if (file.size > 5 * 1024 * 1024) {
                        setSelectedFile(null);
                        setExtractedText("");
                        setResumeAnalysis(null);
                        setMatchResult(null);
                        setCareerReport("");
                        setUploadMessage(
                          "File size must be less than 5 MB."
                        );
                        return;
                      }

                      setSelectedFile(file);
                      setExtractedText("");
                      setResumeAnalysis(null);
                      setMatchResult(null);
                      setCareerReport("");
                      setUploadMessage("");
                    }}
                  />

                  <div className="upload-icon">
                    <Upload size={30} />
                  </div>

                  <h3>Click to upload your resume</h3>
                  <p>Supported formats: PDF, DOCX, TXT</p>

                  <span className="browse-button">Browse Files</span>
                </label>

                {selectedFile && (
                  <div className="selected-file">
                    <FileText size={23} />

                    <div>
                      <strong>{selectedFile.name}</strong>
                      <span>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setExtractedText("");
                        setResumeAnalysis(null);
                        setMatchResult(null);
                        setCareerReport("");
                        setUploadMessage("");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                {uploadMessage && (
                  <p className="upload-message">{uploadMessage}</p>
                )}

                <button
                  className="analyze-button"
                  disabled={!selectedFile || isLoading}
                  onClick={handleAnalyzeResume}
                >
                  <Upload size={18} />
                  {isLoading ? "Uploading..." : "Upload Resume"}
                </button>

                <p className="privacy-note">
                  Your resume is processed by the AI Career Coach backend.
                </p>
              </div>

              {extractedText && (
                <div className="result-section">
                  <h2>
                    <CheckCircle size={21} /> Extracted Resume Content
                  </h2>

                  <p>
                    Your resume has been successfully uploaded
                    and its text has been extracted.
                  </p>

                  <pre>{extractedText}</pre>

                  <button
                    className="analyze-button"
                    disabled={isAnalyzingResume}
                    onClick={handleAIResumeAnalysis}
                  >
                    <Sparkles size={18} />

                    {isAnalyzingResume
                      ? "Analyzing Resume with AI..."
                      : "Analyze with AI"}
                  </button>

                  <p className="privacy-note">
                    Traditional RAG retrieves relevant resume
                    information before Groq generates your report.
                  </p>
                </div>
              )}

              {resumeAnalysis && (
                <div className="result-section job-match-report">
                  <div className="report-heading">
                    <div>
                      <p className="eyebrow">AI GENERATED ANALYSIS</p>
                      <h2>Resume Analysis Report</h2>

                      <p>
                        Your resume has been analyzed using
                        Traditional RAG and Groq.
                      </p>
                    </div>

                    <div className="welcome-icon">
                      <Sparkles size={30} />
                    </div>
                  </div>

                  <div className="report-stats">
                    <div className="stat-card">
                      <p>Resume Chunks Stored</p>
                      <h2>{resumeAnalysis.chunks_stored}</h2>
                    </div>

                    <div className="stat-card">
                      <p>Resume Chunks Retrieved</p>
                      <h2>{resumeAnalysis.chunks_retrieved}</h2>
                    </div>
                  </div>

                  <div className="report-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {(resumeAnalysis.resume_report || "").replace(
                        /\\\*/g,
                        "*"
                      )}
                    </ReactMarkdown>
                  </div>

                  <p className="privacy-note">
                    AI-generated feedback is based on the information
                    extracted from your resume. Verify suggestions and
                    metrics before using them.
                  </p>
                </div>
              )}

              <div className="info-grid">
                <div className="info-card">
                  <CheckCircle size={21} />
                  <div>
                    <h3>Skill Identification</h3>
                    <p>
                      Identify technical and professional skills
                      in your resume.
                    </p>
                  </div>
                </div>

                <div className="info-card">
                  <Target size={21} />
                  <div>
                    <h3>Improvement Suggestions</h3>
                    <p>
                      Discover areas where your resume can be improved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : activePage === "Job Matcher" ? (
            /* JOB MATCHER PAGE */
            <div className="analyzer-page">
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">AI POWERED JOB MATCHING</p>
                  <h1>Job Matcher</h1>

                  <p className="subtitle">
                    Compare your resume with a job description
                    to identify matching and missing skills.
                  </p>
                </div>

                <div className="welcome-icon">
                  <BriefcaseBusiness size={34} />
                </div>
              </div>

              <div className="analyzer-card">
                <div className="analyzer-heading">
                  <div className="tool-icon purple">
                    <Target size={23} />
                  </div>

                  <h2>Job Description</h2>

                  <p>
                    Paste the job description you want to analyze.
                  </p>
                </div>

                <textarea
                  className="job-description-input"
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value);
                    setMatchResult(null);
                    setUploadMessage("");
                  }}
                  rows={12}
                />

                <button
                  className="analyze-button"
                  disabled={
                    !extractedText ||
                    !jobDescription.trim() ||
                    isMatching
                  }
                  onClick={handleJobMatch}
                >
                  <Sparkles size={18} />
                  {isMatching ? "Analyzing..." : "Match My Resume"}
                </button>

                {!extractedText && (
                  <p className="privacy-note">
                    Please upload and analyze your resume first
                    in the Resume Analyzer page.
                  </p>
                )}

                {uploadMessage && (
                  <p className="upload-message">{uploadMessage}</p>
                )}
              </div>

              {matchResult && (
                <div className="result-section job-match-report">
                  <div className="report-heading">
                    <div>
                      <p className="eyebrow">AI GENERATED ANALYSIS</p>
                      <h2>Job Matching Report</h2>

                      <p>
                        Your resume has been compared with the
                        supplied job description using Traditional RAG.
                      </p>
                    </div>

                    <div className="welcome-icon">
                      <ChartNoAxesCombined size={30} />
                    </div>
                  </div>

                  <div className="report-stats">
                    <div className="stat-card">
                      <p>Resume Chunks Stored</p>
                      <h2>{matchResult.resume_chunks_stored}</h2>
                    </div>

                    <div className="stat-card">
                      <p>Job Chunks Stored</p>
                      <h2>{matchResult.job_chunks_stored}</h2>
                    </div>

                    <div className="stat-card">
                      <p>Resume Chunks Retrieved</p>
                      <h2>{matchResult.resume_chunks_retrieved}</h2>
                    </div>

                    <div className="stat-card">
                      <p>Job Chunks Retrieved</p>
                      <h2>{matchResult.job_chunks_retrieved}</h2>
                    </div>
                  </div>

                  <div className="report-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {(matchResult.match_report || "").replace(
                        /\\\*/g,
                        "*"
                      )}
                    </ReactMarkdown>
                  </div>

                  <p className="privacy-note">
                    The match score is an AI-generated estimate,
                    not an official ATS score.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* DASHBOARD PAGE */
            <>
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">
                    YOUR PERSONAL AI CAREER ASSISTANT
                  </p>

                  <h1>Welcome to your Career Dashboard</h1>

                  <p className="subtitle">
                    Build your career with intelligent resume
                    analysis and AI-powered guidance.
                  </p>
                </div>

                <div className="welcome-icon">
                  <Sparkles size={34} />
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <FileText />
                  </div>

                  <p>Resume Status</p>

                  <h2>
                    {resumeAnalysis
                      ? "AI Analyzed"
                      : extractedText
                        ? "Uploaded"
                        : selectedFile
                          ? "Selected"
                          : "Not Uploaded"}
                  </h2>

                  <span>
                    {resumeAnalysis
                      ? "AI analysis completed"
                      : "Upload your resume to begin"}
                  </span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Target />
                  </div>

                  <p>Job Match Score</p>
                  <h2>--</h2>
                  <span>Analyze a job description</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <TrendingUp />
                  </div>

                  <p>Career Progress</p>
                  <h2>Getting Started</h2>
                  <span>Your journey begins here</span>
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Career Tools</h2>
                  <p>
                    Everything you need to move forward in your career.
                  </p>
                </div>
              </div>

              <div className="tools-grid">
                <div className="tool-card">
                  <div className="tool-icon purple">
                    <FileText size={23} />
                  </div>

                  <h3>Resume Analyzer</h3>

                  <p>
                    Upload your resume and get AI-powered feedback
                    on skills, strengths, and improvements.
                  </p>

                  <button
                    onClick={() => handlePageChange("Resume Analyzer")}
                  >
                    Analyze Resume
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="tool-card">
                  <div className="tool-icon blue">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <h3>Job Matcher</h3>

                  <p>
                    Compare your resume with a job description
                    and identify missing skills and opportunities.
                  </p>

                  <button
                    onClick={() => handlePageChange("Job Matcher")}
                  >
                    Match a Job
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="tool-card">
                  <div className="tool-icon orange">
                    <MessageSquare size={23} />
                  </div>

                  <h3>AI Career Chat</h3>

                  <p>
                    Ask questions about your career, skills,
                    projects, and interview preparation.
                  </p>

                  <button
                    onClick={() => handlePageChange("Career Chat")}
                  >
                    Start Chatting
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className="tool-card">
                  <div className="tool-icon green">
                    <ChartNoAxesCombined size={23} />
                  </div>

                  <h3>Career Reports</h3>

                  <p>
                    Generate a complete career report with skill
                    gaps and personalized recommendations.
                  </p>

                  <button
                    onClick={() => handlePageChange("Career Reports")}
                  >
                    View Reports
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </div>

              <div className="next-step-card">
                <div className="next-step-icon">
                  <CheckCircle size={24} />
                </div>

                <div>
                  <h3>Let's get started!</h3>

                  <p>
                    Upload your resume first. Your AI Career Coach
                    will help you understand your strengths and
                    career opportunities.
                  </p>
                </div>

                <button
                  onClick={() => handlePageChange("Resume Analyzer")}
                >
                  <Upload size={17} />
                  Upload Resume
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

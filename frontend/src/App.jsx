import logoImg2 from "/logo1.png"
import logoImg from "/logo.png"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeCanvas } from "qrcode.react"
import jsPDF from "jspdf"

function useTypingEffect(texts, speed = 80) {
  const [displayed, setDisplayed] = useState("")
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (charIndex < texts[textIndex].length) {
      const timeout = setTimeout(() => {
        setDisplayed(prev => prev + texts[textIndex][charIndex])
        setCharIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setDisplayed("")
        setCharIndex(0)
        setTextIndex(prev => (prev + 1) % texts.length)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [charIndex, textIndex, texts, speed])

  return displayed
}

function FloatingCircles() {
  const circles = [
    { size: 300, top: "10%", left: "5%", delay: 0 },
    { size: 200, top: "60%", left: "80%", delay: 1 },
    { size: 150, top: "30%", left: "70%", delay: 2 },
    { size: 250, top: "75%", left: "15%", delay: 0.5 },
  ]
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "visible", zIndex: 0, pointerEvents: "none" }}>
      {circles.map((c, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.15), rgba(59,130,246,0.05))",
            filter: "blur(40px)",
          }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState("home")
  const [form, setForm] = useState({ name: "", trade: "", city: "" })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
 const [loading, setLoading] = useState(false)
const [showIntro, setShowIntro] = useState(true)
const [error, setError] = useState(null)

  const typingTexts = [
    "Show your work...",
    "AI analyzes your skill...",
    "DGet your digital credential...",
    "Show your craft to the world..."
  ]
  const typedText = useTypingEffect(typingTexts)
  useEffect(() => {
  const timer = setTimeout(() => {
    setShowIntro(false)
  }, 2200)

  return () => clearTimeout(timer)
}, [])
  

  const glassStyle = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "40px",
  }

 const inputStyle = {
  width: "100%",
  padding: "18px 22px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  color: "white",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box",
  marginTop: "10px",
  transition: "all .3s ease",
  boxShadow: "0 0 0 rgba(0,0,0,0)",
}

  const btnStyle = {
    padding: "18px 34px",
    background:"linear-gradient(135deg,#8b5cf6,#6366f1)",
    color: "white",
    border: "none",
    borderRadius: "18px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  }

  function handleFileChange(e) {
    const f = e.target.files[0]
    setFile(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function handleAnalyze() {
    if (!file) { alert("Please select a file first!"); return }
    if (!form.name || !form.trade || !form.city) { alert("Fill your all details!"); return }
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await fetch("https://kaarigarcard.onrender.com/analyze", {
        method: "POST",
        body: formData
      })
      const data = await response.json()
      setResult(data)
      setPage("result")
    } catch (err) {
      setError("Connection failed. Please check if the server is running..")
    }
    setLoading(false)
  }

  async function downloadPDF() {
    const qrCanvas = document.getElementById("qr-canvas")
    const qrImageData = qrCanvas.toDataURL("image/png")
    const assessmentId = "KKC-AI-" + Math.floor(1000 + Math.random() * 9000)

    const pdf = new jsPDF("l", "mm", "a4")
    const W = pdf.internal.pageSize.getWidth()
    const H = pdf.internal.pageSize.getHeight()

    // Background
    pdf.setFillColor(248, 250, 255)
    pdf.rect(0, 0, W, H, "F")

    // Border
    pdf.setDrawColor(30, 60, 120)
    pdf.setLineWidth(3)
    pdf.rect(4, 4, W - 8, H - 8)
    pdf.setDrawColor(180, 160, 100)
    pdf.setLineWidth(0.8)
    pdf.rect(7, 7, W - 14, H - 14)

    // Top right decoration
    pdf.setFillColor(20, 40, 100)
    pdf.triangle(W - 8, 8, W - 70, 8, W - 8, 65, "F")
    pdf.setFillColor(180, 160, 100)
    pdf.triangle(W - 8, 8, W - 55, 8, W - 8, 50, "F")

    // Logo
    pdf.addImage(logoImg, "PNG", 8, 4, 45, 50, "", "NONE")

    // Header
    pdf.setTextColor(20, 40, 100)
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "normal")
    pdf.text("KaarigarCard", W / 2, 18, { align: "center" })
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text("PROFESSIONAL AI SKILL CERTIFICATE", W / 2, 32, { align: "center" })
    pdf.setDrawColor(180, 160, 100)
    pdf.setLineWidth(0.5)
    pdf.line(80, 36, 130, 36)
    pdf.setTextColor(120, 100, 50)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "italic")
    pdf.text("A Certified Assessment", W / 2, 41, { align: "center" })
    pdf.line(W - 130, 36, W - 80, 36)

    // Certify text
    pdf.setTextColor(80, 80, 100)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text("This is to certify that", W / 2, 54, { align: "center" })

    // Worker Name
    pdf.setTextColor(20, 40, 100)
    pdf.setFontSize(40)
    pdf.setFont("helvetica", "bold")
    pdf.text(form.name.toUpperCase(), W / 2, 74, { align: "center" })
    pdf.setTextColor(80, 80, 100)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.text("has successfully demonstrated verified skills in", W / 2, 82, { align: "center" })

    // Trade box
    pdf.setFillColor(20, 40, 100)
    const tradeText = "CERTIFIED " + (form.trade).toUpperCase()
    const tradeWidth = pdf.getTextWidth(tradeText) + 20
    pdf.roundedRect((W - tradeWidth) / 2, 85, tradeWidth, 14, 3, 3, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text(tradeText, W / 2, 94, { align: "center" })
    pdf.setTextColor(100, 100, 130)
    pdf.setFontSize(9)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Location: ${form.city}`, W / 2, 106, { align: "center" })

    // LEFT — AI Verified Credential
    pdf.setFillColor(235, 240, 255)
    pdf.roundedRect(12, 112, 90, 68, 4, 4, "F")
    pdf.setDrawColor(20, 40, 100)
    pdf.setLineWidth(0.5)
    pdf.roundedRect(12, 112, 90, 68, 4, 4, "S")
    pdf.setFillColor(180, 160, 100)
    pdf.roundedRect(12, 112, 88, 10, 4, 4, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.text("AI VERIFIED CREDENTIAL", 56, 119, { align: "center" })
    pdf.setTextColor(30, 30, 80)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    const credLines = pdf.splitTextToSize(result.CREDENTIAL || "", 80)
    pdf.text(credLines, 16, 131)
    pdf.addImage(logoImg2, "PNG", 17, 136, 82, 52, "", "NONE")

    // MIDDLE — QR Code
    pdf.setFillColor(235, 240, 255)
    pdf.roundedRect(109, 112, 60, 68, 4, 4, "F")
    pdf.setDrawColor(20, 40, 100)
    pdf.setLineWidth(0.5)
    pdf.roundedRect(109, 112, 60, 68, 4, 4, "S")
    pdf.addImage(qrImageData, "PNG", 117, 117, 42, 42)
    pdf.setTextColor(20, 40, 100)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.text("SECURE  |  SCAN TO VERIFY", 138, 171, { align: "center" })

   // RIGHT — Skill Assessment Summary
const rX = 176  // box start X
const rW = 112  // box width
const rMid = rX + rW / 2  // center

pdf.setFillColor(235, 240, 255)
pdf.roundedRect(rX, 112, rW, 68, 4, 4, "F")
pdf.setDrawColor(20, 40, 100)
pdf.setLineWidth(0.5)
pdf.roundedRect(rX, 112, rW, 68, 4, 4, "S")
pdf.setFillColor(180, 160, 100)
pdf.roundedRect(rX, 112, rW, 10, 4, 4, "F")
pdf.setTextColor(255, 255, 255)
pdf.setFontSize(8)
pdf.setFont("helvetica", "bold")
pdf.text("SKILL ASSESSMENT SUMMARY", rMid, 119, { align: "center" })

// Label X aur Value X fixed
const labelX = rX + 8
const valueX = rX + 38

// Skill
pdf.setTextColor(100, 100, 140)
pdf.setFontSize(7)
pdf.setFont("helvetica", "normal")
pdf.text("Skill:", labelX, 132)
pdf.setTextColor(20, 40, 100)
pdf.setFontSize(9)
pdf.setFont("helvetica", "bold")
pdf.text(result.SKILL || "", valueX, 132)

// Level
pdf.setTextColor(100, 100, 140)
pdf.setFontSize(7)
pdf.setFont("helvetica", "normal")
pdf.text("Level:", labelX, 147)
pdf.setTextColor(20, 40, 100)
pdf.setFontSize(9)
pdf.setFont("helvetica", "bold")
pdf.text(result.LEVEL || "", valueX, 147)

// Certificate No
pdf.setTextColor(100, 100, 140)
pdf.setFontSize(7)
pdf.setFont("helvetica", "normal")
pdf.text("Certificate No:", labelX, 161)
pdf.setTextColor(20, 40, 100)
pdf.setFontSize(9)
pdf.setFont("helvetica", "bold")
pdf.text(assessmentId, valueX, 161)

// Date Issued
pdf.setTextColor(100, 100, 140)
pdf.setFontSize(7)
pdf.setFont("helvetica", "normal")
pdf.text("Date Issued:", labelX, 175)
pdf.setTextColor(20, 40, 100)
pdf.setFontSize(9)
pdf.setFont("helvetica", "bold")
pdf.text(new Date().toLocaleDateString("en-IN"), valueX, 175)
    // Footer
    pdf.setFillColor(20, 40, 100)
    pdf.rect(4, H - 18, W - 8, 14, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text(
      `Issued by KaarigarCard AI  |  Smart Credential System  |  Powered by Google Gemini  |  Securing India's Workforce`,
      W / 2, H - 9, { align: "center" }
    )

    pdf.save(`KaarigarCard-${form.name}.pdf`)
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Segoe UI', sans-serif",
      color: "white",
      position: "relative",
      overflowX: "hidden",
    }}>
      <FloatingCircles />

      <div style={{ position: "relative", zIndex: 10, maxWidth: "600px", width: "100%", margin: "0 auto", padding: "40px 20px" }}>
        <FloatingCircles />

<AnimatePresence>
  {showIntro && (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background:
          "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      }}
    >
      <motion.img
        src={logoImg}
        initial={{
          scale: 0.3,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        style={{
          width: "170px",
          height: "170px",
          objectFit: "contain",
          filter:
            "drop-shadow(0 0 35px rgba(124,58,237,.6))",
        }}
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.6,
        }}
       style={{
  marginTop: "10px",
  marginBottom: "10px",

  fontSize: "64px",
  fontWeight: "900",

  lineHeight: "1.15",
  letterSpacing: "-2px",

  textAlign: "center",
  whiteSpace: "nowrap",

  background:
    "linear-gradient(135deg,#ffffff,#a5b4fc,#60a5fa)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}}
      >
        KaarigarCard
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          marginTop: "14px",
          color: "rgba(255,255,255,.65)",
          fontSize: "18px",
        }}
      >
        AI Powered Skill Verification Platform
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

<div
  style={{
    position: "relative",
    zIndex: 10,
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
    padding: "40px 20px",
  }}
></div>
        <AnimatePresence mode="wait">

          {/* HOME PAGE */}
          {!showIntro && page === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ textAlign: "center", marginBottom: "70px" }}>
                <div
  style={{
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.25), transparent 70%)",
    marginBottom: "20px",
  }}
>
 <motion.img
  src={logoImg}
  alt="logo"
 animate={{
  y: [0, -6, 0],
}}

transition={{
  duration: 4,
  repeat: Infinity,
  ease: "easeInOut",
}}
  transition={{
    duration: 1,
    ease: "easeInOut",
  }}
  style={{
    width: "95px",
    height: "95px",
    objectFit: "contain",
    position: "relative",
    zIndex: 1000,
    cursor: "pointer",
  }}
/>
</div>
   <div
  style={{
    fontSize: "54px",
    fontWeight: "900",
    lineHeight: 1.3,
    overflow:visible,
    background: "linear-gradient(135deg,#ffffff,#a5b4fc,#60a5fa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-1px",
    marginBottom: "14px",
  }}
>
  KaarigarCard
</div>
                <p
  style={{
    color: "rgba(255,255,255,0.82)",
    fontSize: "22px",
    fontWeight: "600",
    marginTop: "6px",
    marginBottom: "12px",
  }}
>
  AI-Powered Skill Verification Platform
</p>
<div
  style={{
    maxWidth: "650px",
    margin: "0 auto",
    color: "rgba(255,255,255,0.58)",
    fontSize: "17px",
    lineHeight: "30px",
    marginBottom: "24px",
  }}
>
  Turn your work into a secure AI-verified digital credential that showcases
  your skills, builds trust, and helps you unlock better job opportunities.
</div>
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.5 }}
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 20px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "20px",
    color: "#fde68a",
    fontWeight: "600",
    fontSize: "14px",
  }}
>
  ✨ Powered by Google Gemini AI
</motion.div>
  <div
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 28px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    marginBottom: "34px",
  }}
>
  <span
    style={{
      color: "#c4b5fd",
      fontSize: "15px",
      fontWeight: "600",
    }}
  >
    ✨ {typedText}
    <span style={{ animation: "blink 1s infinite" }}>|</span>
  </span>
</div>
              </div>

              <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "22px",
    marginTop: "55px",
    marginBottom: "55px",
  }}
>
  {[
    {
      icon: "🎥",
      title: "Upload",
      desc: "Upload a photo or video of your work",
    },
    {
      icon: "🤖",
      title: "AI Assessment",
      desc: "Gemini evaluates your practical skills",
    },
    {
      icon: "🏆",
      title: "Digital Credential",
      desc: "Receive an AI-verified certificate instantly",
    },
  ].map((card, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.2 }}
      whileHover={{
        y: -12,
        scale: 1.05,
        borderColor: "#8b5cf6",
        boxShadow:
          "0 25px 60px rgba(124,58,237,.35)",
      }}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "24px",
        padding: "32px 24px",
        cursor: "pointer",
        transition: ".3s",
      }}
    >
      <div
        style={{
          width: "70px",
          height: "70px",
          borderRadius: "18px",
          margin: "0 auto",
          marginBottom: "22px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg,#7c3aed,#4338ca)",
          fontSize: "34px",
          boxShadow:
            "0 15px 35px rgba(124,58,237,.45)",
        }}
      >
        {card.icon}
      </div>

      <div
        style={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "10px",
        }}
      >
        {card.title}
      </div>

      <div
        style={{
          color: "rgba(255,255,255,.62)",
          fontSize: "14px",
          lineHeight: "24px",
        }}
      >
        {card.desc}
      </div>
    </motion.div>
  ))}
</div>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 30px rgba(124,58,237,0.5)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPage("form")}
                style={btnStyle}
              >
                🚀 Generate Verified Skill Card
              </motion.button>
            </motion.div>
          )}

          {/* FORM PAGE */}
          {page === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
            >
              <div
  style={{
    ...glassStyle,
    maxWidth: "760px",
    margin: "0 auto",
    padding: "50px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255,255,255,.08)",
    boxShadow: "0 30px 80px rgba(0,0,0,.35)",
  }}
>
                <button
                  onClick={() => setPage("home")}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "14px", marginBottom: "20px", padding: 0 }}
                >
                  ← Go Back
                </button>
                <div
  style={{
    textAlign: "center",
    marginBottom: "40px",
  }}
>

<div
style={{
fontSize:"42px",
marginBottom:"12px"
}}
>
✨
</div>

<h1
style={{
fontSize:"34px",
fontWeight:"800",
marginBottom:"12px"
}}
>
Create Your AI Skill Card
</h1>

<p
style={{
color:"rgba(255,255,255,.6)",
fontSize:"17px",
lineHeight:"28px"
}}
>
Fill in your details and upload proof of your work.
Gemini AI will verify your skills and generate a professional credential.
</p>

</div>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  }}
>
  {["Details", "Upload", "AI Verify"].map((step, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "#7c3aed",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "700",
          color: "white",
        }}
      >
        {i + 1}
      </div>

      <span
        style={{
          color: "rgba(255,255,255,.75)",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        {step}
      </span>
    </div>
  ))}
</div>
                {[
                  { label: "Your Name", key: "name", placeholder: "e.g. Shauryman Dwivedi" },
                  { label: "Your Trade / Job", key: "trade", placeholder: "e.g. Plumber, Carpenter, Welder" },
                  { label: "Your City", key: "city", placeholder: "e.g. Kanpur, Delhi, Mumbai" },
                ].map((field, i) => (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ marginBottom: "20px" }}
                  >
                    <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{field.label}</label>
                    <input
                      style={inputStyle}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ marginBottom: "24px" }}
                >
                  <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                   Upload a Video or Image of Your Work
                  </label>
                  <motion.div
  whileHover={{
    scale: 1.02,
    borderColor: "#8b5cf6",
    boxShadow: "0 20px 60px rgba(124,58,237,.25)",
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: .25 }}
  style={{
    marginTop: "16px",
    border: "2px dashed rgba(167,139,250,.35)",
    borderRadius: "26px",
    padding: "65px 35px",
    textAlign: "center",
    cursor: "pointer",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
    backdropFilter: "blur(20px)",
    transition: ".3s",
  }}
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    {preview ? (
                      file?.type.startsWith("video/") ? (
                        <video src={preview} style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "150px" }} controls />
                      ) : (
                        <img src={preview} style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "150px" }} alt="preview" />
                      )
                    ) : (
                      <>

<div
style={{
fontSize:"62px",
marginBottom:"18px"
}}
>
☁️
</div>

<div
style={{
fontSize:"20px",
fontWeight:"700",
marginBottom:"10px"
}}
>
Drop your file here
</div>

<div
style={{
color:"rgba(255,255,255,.55)",
fontSize:"15px"
}}
>
or click to browse,

Supports MP4 • JPG • PNG • MOV

</div>

</>
                    )}
                  </motion.div>
                  <input
                    id="fileInput"
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </motion.div>

                {error && <p style={{ color: "#f87171", marginBottom: "16px", fontSize: "14px" }}>{error}</p>}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(124,58,237,0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "⏳  AI is Analyzing Your Work..." : "⚡ Generate Your Skill Card"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* RESULT PAGE */}
          {page === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div

initial={{
opacity:0,
y:-20
}}

animate={{
opacity:1,
y:0
}}

style={{

background:"#16a34a",

padding:"12px 22px",

borderRadius:"999px",

display:"inline-block",

marginBottom:"25px",

fontWeight:"700"

}}

>

✅ Verification Successful

</motion.div>
              <div id="skill-card" style={{ ...glassStyle, marginBottom: "20px" }}>
                <div
style={{
textAlign:"center",
marginBottom:"35px"
}}
>

<motion.img
  src={logoImg}
  alt="KaarigarCard Logo"
  animate={{
    y: [0, -5, 0],
    scale: [1, 1.05, 1],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  style={{
    width: "90px",
    height: "90px",
    objectFit: "contain",
    marginBottom: "18px",
    filter: "drop-shadow(0 0 20px rgba(124,58,237,.45))",
  }}
/>
<div
style={{
fontSize:"34px",
fontWeight:"900",
  lineHeight: "1.3",
  paddingBottom: "8px",

  overflow: "visible",
background:
"linear-gradient(135deg,#ffffff,#a5b4fc,#60a5fa)",
WebkitBackgroundClip:"text",
WebkitTextFillColor:"transparent",
marginBottom:"10px"
}}
>
AI Skill Credential
</div>

<div
style={{
fontSize:"17px",
color:"rgba(255,255,255,.6)"
}}
>
Verified using Google Gemini AI
</div>

</div>

                <div style={{
                  background:
                 "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))",
                 order:"1px solid rgba(255,255,255,.08)",
                 backdropFilter:"blur(20px)",
                  borderRadius:"24px",
                  padding:"24px",
                    marginBottom:"26px"
                }}>
                  <div style={{ fontSize: "28px", fontWeight: "800", marginBottom: "4px" }}>👤 {form.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>🔧 {form.trade} &nbsp;•&nbsp; 📍 {form.city}</div>
                </div>

                {[
                  { icon: "⚒️", label: "Skill", value: result.SKILL },
                  { icon: "📊", label: "Level", value: result.LEVEL },
                  { icon: "👁️", label: "Observations", value: result.OBSERVATIONS },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
marginBottom:"18px",
padding:"18px",
borderRadius:"18px",
background:"rgba(255,255,255,.04)",
border:"1px solid rgba(255,255,255,.05)"
}}
                  >
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: "15px", fontWeight: "500", marginTop: "4px" }}>{item.value}</div>
                  </motion.div>
                ))}

                <div style={{
                  background:
"linear-gradient(135deg,#7c3aed,#4f46e5)",
padding:"28px",
borderRadius:"24px",
textAlign:"center",
marginTop:"30px",
boxShadow:
"0 20px 60px rgba(124,58,237,.35)"
                }}>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>✅ AI Verified Credential</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold" }}>{result.CREDENTIAL}</div>
                </div>
              </div>

              {/* QR Code */}
              <div style={{
                textAlign: "center",
                marginBottom: "20px",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "24px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "12px" }}>
                  Scan to verify your AI credential
                </div>
                <div style={{ background: "white", padding: "16px", borderRadius: "12px", display: "inline-block", lineHeight: "0" }}>
                  <QRCodeCanvas
                    id="qr-canvas"
                    value={`KaarigarCard | ${form.name} | ${form.trade} | ${form.city} | ${result.SKILL} | ${result.LEVEL}`}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "10px" }}>
                  Issued by KaarigarCard AI • {new Date().toLocaleDateString("en-IN")}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(5,150,105,0.4)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={downloadPDF}
                  style={{ ...btnStyle, background: "linear-gradient(135deg, #059669, #047857)" }}
                >
                  📄 PDF Download
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setPage("form"); setResult(null); setFile(null); setPreview(null) }}
                  style={btnStyle}
                >
                  🔄  Create Another
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        input::placeholder { color: rgba(255,255,255,0.3); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
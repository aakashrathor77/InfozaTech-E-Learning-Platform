
import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Download,
  AlertCircle
} from "lucide-react";
import API from "../api";

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await API.get("/certificates/my");
        setCertificates(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load certificates."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const downloadCertificate = (certificate) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const studentName = user.name || "Student";
    const courseName = certificate.course?.title || "Course";

    const issueDate = new Date(
      certificate.issueDate
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to download your certificate.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificate - ${certificate.certificateId}</title>

        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 20px;
            background: #eef2f8;
            font-family: Georgia, serif;
          }

          .certificate {
            width: 100%;
            height: 100vh;
            min-height: 550px;
            padding: 35px;
            background: #fff;
            border: 12px double #c49a45;
            outline: 3px solid #173b70;
            outline-offset: -22px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .brand {
            color: #173b70;
            font-family: Arial, sans-serif;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            margin-bottom: 8px;
          }

          .subtitle {
            color: #a47b2c;
            font-family: Arial, sans-serif;
            letter-spacing: 4px;
            font-size: 13px;
          }

          h1 {
            color: #173b70;
            font-size: 42px;
            margin: 24px 0 12px;
            letter-spacing: 3px;
          }

          .presented {
            color: #64748b;
            font-family: Arial, sans-serif;
            font-size: 15px;
          }

          .name {
            color: #b18432;
            font-size: 38px;
            font-weight: bold;
            margin: 15px 0;
            border-bottom: 2px solid #c49a45;
            padding: 0 35px 10px;
          }

          .description {
            color: #475569;
            font-family: Arial, sans-serif;
            font-size: 15px;
            margin: 10px;
          }

          .course {
            color: #173b70;
            font-size: 27px;
            font-weight: bold;
            margin: 12px 0;
          }

          .footer {
            width: 85%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 28px;
            color: #475569;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }

          .seal {
            border: 3px solid #c49a45;
            color: #a47b2c;
            border-radius: 50%;
            width: 75px;
            height: 75px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            font-size: 11px;
            font-weight: bold;
          }

          @media print {
            body {
              padding: 0;
              background: white;
            }

            .certificate {
              height: 100vh;
              min-height: 0;
            }
          }
        </style>
      </head>

      <body>
        <div class="certificate">

          <div class="brand">INFOZATECH</div>
          <div class="subtitle">E-LEARNING PLATFORM</div>

          <h1>CERTIFICATE OF COMPLETION</h1>

          <p class="presented">
            This certificate is proudly presented to
          </p>

          <div class="name">${studentName}</div>

          <p class="description">
            For successfully completing the course
          </p>

          <div class="course">${courseName}</div>

          <p class="description">
            In recognition of dedication, learning and successful completion.
          </p>

          <div class="footer">

            <div>
              <p><b>ISSUE DATE</b></p>
              <p>${issueDate}</p>
            </div>

            <div class="seal">
              VERIFIED<br>INFOZATECH
            </div>

            <div>
              <p><b>CERTIFICATE ID</b></p>
              <p>${certificate.certificateId}</p>
            </div>

          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        <\/script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <div style={styles.message}>
        Loading certificates...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Certificates</h1>
          <p style={styles.subtitle}>
            Your learning achievements and completed courses.
          </p>
        </div>

        <Award size={42} color="#2563eb" />
      </div>

      {error && (
        <p style={styles.error}>
          <AlertCircle size={18} />
          {error}
        </p>
      )}

      {certificates.length === 0 ? (
        <div style={styles.empty}>
          <Award size={55} color="#94a3b8" />
          <h2>No Certificates Yet</h2>
          <p>
            Complete a course with 100% progress to earn a certificate.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {certificates.map((certificate) => (
            <div key={certificate._id} style={styles.card}>

              <div style={styles.icon}>
                <Award size={35} color="#2563eb" />
              </div>

              <h2 style={styles.courseTitle}>
                {certificate.course?.title}
              </h2>

              <p style={styles.detail}>
                <BookOpen size={16} />
                Course Completed
              </p>

              <p style={styles.detail}>
                <Calendar size={16} />
                {new Date(certificate.issueDate).toLocaleDateString("en-IN")}
              </p>

              <p style={styles.certificateId}>
                ID: {certificate.certificateId}
              </p>

              <button
                style={styles.button}
                onClick={() => downloadCertificate(certificate)}
              >
                <Download size={17} />
                Download PDF Certificate
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f8fafc",
    fontFamily: "Arial, sans-serif"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "35px"
  },

  heading: {
    fontSize: "30px",
    color: "#1e293b",
    margin: "0 0 8px"
  },

  subtitle: {
    color: "#64748b",
    margin: 0
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "22px"
  },

  card: {
    background: "#fff",
    padding: "28px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.05)"
  },

  icon: {
    width: "65px",
    height: "65px",
    borderRadius: "14px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px"
  },

  courseTitle: {
    color: "#1e293b",
    fontSize: "20px"
  },

  detail: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "#64748b",
    fontSize: "14px"
  },

  certificateId: {
    color: "#475569",
    fontSize: "13px",
    marginTop: "20px"
  },

  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "18px"
  },

  empty: {
    background: "#fff",
    padding: "55px 20px",
    borderRadius: "16px",
    textAlign: "center",
    color: "#64748b"
  },

  message: {
    padding: "40px",
    textAlign: "center"
  },

  error: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#dc2626"
  }
};

export default Certificates;

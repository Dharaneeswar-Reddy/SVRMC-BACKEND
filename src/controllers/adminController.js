const xlsx = require("xlsx");
const { Readable } = require("stream");
const StudentResult = require("../models/StudentResult");

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (username == ADMIN_USER && password == ADMIN_PASS) {
    return res.json({ ok: true, msg: "Logged in" });
  }
  return res.status(401).json({ ok: false, msg: "Invalid credentials" });
};

// ---------------- HELPER: Extract subject headers dynamically ----------------
function extractSubjectHeadersFromExcel(buffer) {
  const wb = xlsx.read(buffer, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];

  const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });

  const row1 = data[0] || []; // Subject codes (ENG 231, RES 231-1, etc.)
  const row2 = data[1] || []; // Titles (English - I, etc.)
  const row3 = data[2] || []; // Subheaders (CA, SEE, TOT, PF)

  const subjectMap = {};
  const startIndex = 4; // column E = index 4 (0-based)
  const groupSize = 4; // each subject has 4 subcolumns (CA, SEE, TOT, PF)

  for (let i = startIndex; i < row1.length; i += groupSize) {
    const code = (row1[i] || "").trim();
    const title = (row2[i] || "").trim();

    if (!code) continue;

    subjectMap[code] = {
      TITLE: title || code,
      CA: row3[i] ? `${code} - CA` : null,
      SEE: row3[i + 1] ? `${code} - SEE` : null,
      TOT: row3[i + 2] ? `${code} - TOT` : null,
      PF: row3[i + 3] ? `${code} - PF` : null,
    };
  }

  return subjectMap;
}

// -------------------- MAIN: Upload and process CSV --------------------
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ ok: false, msg: "No file uploaded" });

    // ⭐ Get exam_info from req.body
    const exam_info = {
      exam_month_year: req.body.exam_month_year,
      semester: req.body.semester,
      course: req.body.course,
      exam_type: req.body.exam_type,
    };

    // Read Excel or CSV as buffer
    const buffer = req.file.buffer;
    const wb = xlsx.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];

    const data = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });

    const subjectMap = extractSubjectHeadersFromExcel(buffer);
    const results = [];

    // Iterate from row 4 onward (index 3)
    for (let r = 3; r < data.length; r++) {
      const row = data[r];
      if (!row || row.length < 3) continue;

      const register_no =
        row[0] || row["Registered No"] || row["Reg No"] || row["Roll No"];

      const second_language = row[1] || "";
      const total = parseFloat(row[2]) || null;
      const result_summary = row[3] || "";

      const subjects = [];
      let col = 4;

      for (const code in subjectMap) {
        const map = subjectMap[code];
        subjects.push({
          code,
          title: map.TITLE,
          ca: row[col] ?? "--",
          see: row[col + 1] ?? "--",
          total: row[col + 2] ?? "--",
          pf: row[col + 3] ?? "--"
        });
        col += 4;
      }

      results.push({
        register_no: register_no.toString().trim(),
        second_language,
        total,
        result_summary,
        exam_info,  // ⭐ ADD EXAM INFO HERE
        subjects
      });
    }

 // Save each record as a NEW document
for (const r of results) {
  if (!r.register_no) continue;

  const doc = new StudentResult(r);
  await doc.save();
}


    res.json({
      ok: true,
      msg: "CSV processed successfully",
      count: results.length
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      ok: false,
      msg: "Server error",
      error: err.message
    });
  }
};


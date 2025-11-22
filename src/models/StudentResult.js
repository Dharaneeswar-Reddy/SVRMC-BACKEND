const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: String,
  title: String,
  ca: String,
  see: String,
  total: String,
  pf: String
}, { _id: false });

const studentResultSchema = new mongoose.Schema({
  register_no: { type: String, index: true, required: true},
  name: String,
  second_language: String,
  total: Number,
  result_summary: String,

  // ⭐ Added Fields (5 fields grouped here)
  exam_info: {
    exam_month_year: String,  // December-2024
    semester: String,         // I Sem
    course: String,           // Comp. Appl
    exam_type: String,        // REGULAR
  },

  subjects: [subjectSchema],
  raw: Object
}, { timestamps: true });

module.exports = mongoose.model('StudentResult', studentResultSchema);

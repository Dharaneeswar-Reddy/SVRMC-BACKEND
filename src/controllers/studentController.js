const studentResultSchema = require('../models/StudentResult'); // dynamic model

exports.getResultByExam = async (req, res) => {
  const reg = req.params.register_no;
  const { year, sem, exam_type } = req.params;


  if (!reg || !year || !sem || !exam_type) {
    return res.status(400).json({
      ok: false,
      msg: "register_no, year, sem, exam_type are required"
    });
  }

  try {
    // Load dynamic collection name: results_<regno>
    // const StudentModel = createStudentModel(`results_${register_no}`);

    // Fetch full student record
    const student = await studentResultSchema.find({ register_no: reg.toString() });

    if (!student) {
      return res.status(404).json({ ok: false, msg: "Student not found" });
    }

    // Find matching exam record
    const exam = student.find(d =>
      d.exam_info.exam_month_year === year &&
      d.exam_info.semester === sem &&
      d.exam_info.exam_type.toLowerCase() === exam_type.toLowerCase()
    );

    if (!exam) {
      return res.status(404).json({
        ok: false,
        msg: "Exam result not found for given year/sem/type"
      });
    }

    // Format final response
    const finalData = {
      register_no: exam.register_no,
      second_language: exam.second_language,
      exam_info: exam.exam_info,
      total: exam.total,
      result_summary: exam.result_summary,
      subjects: exam.subjects
    };
    return res.json({ ok: true, data: finalData });


    // return res.json({ ok: true, data: doc });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Server error" });
  }
};

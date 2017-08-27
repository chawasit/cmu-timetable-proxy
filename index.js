const request = require('superagent')
const _ = require('lodash')

var isDefined = value => !_.isUndefined(value)

const studentIDPattern = /^[0-9]{9}$/

const semesterPattern = /^[1-3][5-6][0-9]$/

const sectionPattern = /^[0-9]{3}$/

const courseIDPattern = /^[0-9]{6}$/

var isValidStudentID = studentID =>
  isDefined(studentID) && studentIDPattern.test(studentID)

var isValidSemester = semester =>
  isDefined(semester) && semesterPattern.test(semester)

var isValidSection = section =>
  isDefined(section) && sectionPattern.test(section)

var isValidCourseID = courseID =>
  isDefined(courseID) && courseIDPattern.test(courseID)

var hasStudentID = (htmlString, studentID) =>
  new RegExp('.*' + studentID + '.*').test(htmlString)

var hasCourseID = (htmlString, courseID) =>
  new RegExp(courseID).test(htmlString)

var enrollmentURL = (studentID, semester) =>
  'https://www3.reg.cmu.ac.th/regist' +
  semester +
  '/public/result.php?id=' +
  studentID

var courseURL = semester =>
  'https://www3.reg.cmu.ac.th/regist' +
  semester +
  '/public/search.php?act=search'

exports.enrollment = (req, res) => {
  const studentId = req.query.student_id
  const semester = req.query.semester

  console.log(
    `Request Enrollment(studentId=${studentId}, semester=${semester})`
  )

  const isValidRequest =
    isValidStudentID(studentId) && isValidSemester(semester)

  if (!isValidRequest) {
    return res.sendStatus(400)
  }

  const url = enrollmentURL(studentId, semester)

  request
    .get(url)
    .then(result => {
      if (hasStudentID(result.text, studentId)) {
        res.send(result.text)
      } else {
        res.sendStatus(404)
      }
    })
    .catch(err => {
      console.error(err)
      res.sendStatus(500)
    })
}
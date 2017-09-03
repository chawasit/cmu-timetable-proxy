'use strict'

const _ = require('lodash')
const http = require('superagent')

var isDefined = value => !_.isUndefined(value)

const studentIDPattern = /^[0-9]{9}$/

const semesterPattern = /^[1-3][5-6][0-9]$/

const sectionPattern = /^[0-9]{3}$/

const courseIDPattern = /^[0-9]{6}$/

const isValidStudentID = studentID =>
  isDefined(studentID) && studentIDPattern.test(studentID)

const isValidSemester = semester =>
  isDefined(semester) && semesterPattern.test(semester)

const isValidSection = section =>
  isDefined(section) && sectionPattern.test(section)

const isValidCourseID = courseID =>
  isDefined(courseID) && courseIDPattern.test(courseID)

const hasStudentID = (htmlString, studentID) =>
  new RegExp(`.*${studentID}.*`).test(htmlString)

const hasCourseID = (htmlString, courseID) =>
  new RegExp(`.*${courseID}.*`).test(htmlString)

const enrollmentURL = (studentID, semester) =>
  `https://www3.reg.cmu.ac.th/regist${semester}/public/result.php?id=${studentID}`

const courseURL = semester =>
  `https://www3.reg.cmu.ac.th/regist${semester}/public/search.php?act=search`

exports.enrollment = (request, response) => {
  const studentID = request.query.student_id
  const semester = request.query.semester

  const isValidRequest =
    isValidStudentID(studentID) && isValidSemester(semester)

  if (!isValidRequest) {
    return response.sendStatus(400)
  }

  console.log(
    `Request Enrollment(studentID=${studentID}, semester=${semester})`
  )

  const url = enrollmentURL(studentID, semester)

  http
    .get(url)
    .then(result => {
      if (hasStudentID(result.text, studentID)) {
        response.send(result.text)
      } else {
        response.sendStatus(404)
      }
    })
    .catch(function (error) {
      console.error(error)
      response.sendStatus(500)
    })
}

exports.course = (request, response) => {
  const semester = request.query.semester
  const courseID = request.query.course_id
  const lectureSection = request.query.lecture_section
  const labSection = request.query.lab_section

  const isValidRequest =
    isValidSemester(semester) &&
    isValidCourseID(courseID) &&
    isValidSection(lectureSection) &&
    isValidSection(labSection)

  if (!isValidRequest) {
    return response.sendStatus(400)
  }

  console.log(
    `Request Course(semester=${semester}, courseID=${courseID}, lectureSection=${lectureSection}, labSection=${labSection})`
  )

  const url = courseURL(semester)

  http
    .post(url)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      s_course1: courseID,
      s_lec1: lectureSection,
      s_lab1: labSection,
      op: 'bycourse'
    })
    .then(result => {
      if (hasCourseID(result.text, courseID)) {
        response.send(result.text)
      } else {
        response.sendStatus(404)
      }
    })
    .catch(function (error) {
      console.error(error)
      response.sendStatus(500)
    })
}

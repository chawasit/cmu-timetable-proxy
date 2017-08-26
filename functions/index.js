'use strict'

const functions = require('firebase-functions')
const rp = require('request-promise')

var isDefined = maybeUndefined => typeof maybeUndefined !== 'undefined'

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

var Response = function (status, data) {
  this.status = status
  this.data = data
}

var Success = data => new Response('success', data)

var Error = data => new Response('fail', data)

var enrollmentURL = (studentID, semester) =>
  'https://www3.reg.cmu.ac.th/regist' +
  semester +
  '/public/result.php?id=' +
  studentID

var courseURL = semester =>
  'https://www3.reg.cmu.ac.th/regist' +
  semester +
  '/public/search.php?act=search'

exports.enrollment = functions.https.onRequest((request, response) => {
  const studentID = request.query.student_id
  const semester = request.query.semester

  const isValidRequest =
    isValidStudentID(studentID) && isValidSemester(semester)

  if (!isValidRequest) {
    response.send(Error('bad request'))
    return
  }

  console.log(
    'Request Enrollment(studentID=' + studentID + ', semester=' + semester + ')'
  )

  rp(enrollmentURL(studentID, semester))
    .then(function (htmlString) {
      if (hasStudentID(htmlString, studentID)) {
        response.send(Success(htmlString))
      } else {
        response.send(Error('not found'))
      }
    })
    .catch(function (error) {
      console.error(error)
      response.send(Error('something went wrong'))
    })
})

exports.course = functions.https.onRequest((request, response) => {
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
    response.send(Error('bad request'))
    return
  }

  console.log(
    'Request Course(semester=' +
      semester +
      ', courseID=' +
      courseID +
      ', lectureSection=' +
      lectureSection +
      ', labSection=' +
      labSection +
      ')'
  )

  const options = {
    method: 'POST',
    uri: courseURL(semester),
    formData: {
      s_course1: courseID,
      s_lec1: lectureSection,
      s_lab1: labSection,
      op: 'bycourse'
    }
  }

  rp(options)
    .then(function (htmlString) {
      if (hasCourseID(htmlString, courseID)) {
        response.send(Success(htmlString))
      } else {
        response.send(Error('not found'))
      }
    })
    .catch(function (error) {
      console.error(error)
      response.send(Error('something went wrong.'))
    })
})

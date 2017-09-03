const request = require('supertest')
const handler = require('../index')

test('enrollment', () => {
  let app = require('express')()
  app.get('/enrollment', handler.enrollment)
  return request(app)
    .get('/enrollment')
    .query({ student_id: '570610614', semester: '160' })
    .then(result => {
        expect(result.statusCode).toBe(200)
    })
})

test('course', () => {
  let app = require('express')()
  app.get('/course', handler.course)
  return request(app)
    .get('/course')
    .query({ course_id: '261304', semester: '160', lecture_section: '001', lab_section: '000' })
    .then(result => {
        console.log(result.text)
        expect(result.statusCode).toBe(200)
    })
})

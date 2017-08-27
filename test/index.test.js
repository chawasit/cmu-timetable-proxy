const request = require('supertest')
const handler = require('../index')

test('enrollment', async done => {
  let app = require('express')()
  app.get('/enrollment', handler.enrollment)
  const res = await request(app)
    .get('/enrollment')
    .query({ student_id: '570610614', semester: '160' })
  expect(res.statusCode).toBe(200)
  done()
})

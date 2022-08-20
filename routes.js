'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const User = require('./models').User;
//the two ways to do it ^  \/
const { Course } = require('./models');

// Handler function to wrap each route.
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

// USER ROUTES

// GET route that will return all properties and values for the currently authenticated User along with a 200 HTTP status code.
router.get('/users', asyncHandler(async (req, res) => {
    let users = await User.findAll();
    res.json(users);
}));

//A /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post('/users', asyncHandler(async (req, res) => {

    try {
        await User.create(req.body);
        res.location('/');
        res.status(201).end;
    } catch (err) {
        console.log('ERROR: ', err.name);

        if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
            const errors = err.errors.map(err => err.message);
            res.status(400).json({ errors });   
          } else {
            throw error;
          }
    }
}));

//COURSE ROUTES
//A /api/courses GET route that will return all courses including the User associated with each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async (req, res) => {
    let courses = await Course.findAll();
    res.json(courses);
}));

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req, res) => {
    let course = await Course.findByPk(req.params.id);
    res.json(course);
}));

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', asyncHandler(async (req, res) => {
    try{
        await Course.create(req.body);
        res.status(201)
    } catch (error) {
        console.log('ERROR: ', error.name);

        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });   
        } else {
            throw error;
        }
    }
}));

// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id', asyncHandler(async (req, res) =>  {
    let course = await Course.findByPk(req.params.id);
    if (course) {
        course = req.body

        await Course.update
    }
    //update based on req.body 
}));

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', asyncHandler(async (req, res) => {
    let course = await Course.findByPk(req.params.id);
    await course.destroy();
}));




  module.exports = router;
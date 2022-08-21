'use strict';

const express = require('express');

// Construct a router instance.
const router = express.Router();
const User = require('./models').User;
//the two ways to do it ^  \/
const { Course } = require('./models');

const {authenticateUser} = require('./auth-user');

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
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    //req.currentUser is SET to be the actual current user in the authenticateUser function
    let user = req.currentUser;
    res.status(200)
    // just being picky about what to send back
    res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress
    });
}));

//A /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post('/users', asyncHandler(async (req, res) => {

    try {
        //the request body holds the data in the post request..
        await User.create(req.body);
        res.location('/');
        res.status(201).end(); //if you don't add this .end() it will give you swirl forever
    } catch (err) {
        console.log('ERROR: ', err.name);
        // checking our various errors!
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
    let courses = await Course.findAll({
        // get all the courses and include this information and exclude that information
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
          }
        ], attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
          ]
        },
    });
    res.status(200)
    res.json({ courses });
}));

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async (req, res) => {
    let course = await Course.findByPk(req.params.id);
    //based on the selected course, we're finding the user id to then grab OTHER info we want
    let user = await User.findByPk(course.userId);
    res.status(200)
    res.json({
        title: course.title,
        descriptioin: course.description,
        estimatedTime: course.estimatedTime,
        materialsNeeded: course.materialsNeeded,
        //this is super cool and readable AND wasn't taught i just kinda figured it out.. I don't know how practical this would be considering it's an API and not an App...
        student: `${user.firstName} ${user.lastName}`
    });
}));

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post('/courses', asyncHandler(async (req, res) => {
    try{
        await Course.create(req.body);
        res.location('/');
        res.status(201).end();
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
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) =>  {
    let course = await Course.findByPk(req.params.id);
    if (course) {
        //check to see if the currentUser (as set by authenticateUser) is tryna mess with the stuff that has a matching userid to themselves
        if(req.currentUser.id === course.userId) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            res.status(403).end();
        }
    } else {
        res.status(404).end();
    }
}));

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id', asyncHandler(async (req, res) => {
    let course = await Course.findByPk(req.params.id);
    if (course) {
        if(req.currentUser.id === course.userId) {
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(403).end();
        }
    } else {
        res.status(404).end();
    }
}));




  module.exports = router;
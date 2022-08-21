'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('./models');

exports.authenticateUser = async (req, res, next) => {
    let message;
    //this is where the magic begins
    const credentials = auth(req);
    //credentials holds the key and secret (email and password)
    if (credentials){
        //find the user with those credentials!
        const user = await User.findOne({ where: { emailAddress: credentials.name }});
        if (user) {
            //now compare the passwords of the credentials and what we've got in the database
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.password);
            if (authenticated) {
                console.log(`Authentication successful for email: ${user.emailAddress}`);
                req.currentUser = user;
            } else {
                message = `Authentication failed for email: ${user.emailAddress}`;
            }
        } else {
            message = `User not found with email: ${credentials.emailAddress}`;

        }
    } else {
        message = `Auth header not found`;
    }

    if (message) {
        console.warn(message);
        res.status(401).json({
            message: 'Access Denied'
        });
    } else {
        next();
    }
};
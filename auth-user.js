'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.authenticateUser = async (req, res, next) => {
    const credentials = auth(req);

    if (credentials){
        const user = await User.findOne({ where: { username: credentials.name }});
    }

    next();
};
'use strict';

const { Model, DataTypes } = require('sequelize');


module.exports = ( sequelize ) => {
    class Course extends Model {}
    Course.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A title is required'
                },
                notEmpty: {
                    msg: 'Please enter the title'
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull:{
                    msg: 'A description is required'
                },
                notEmpty: {
                msg: "Please enter the description"
                }
            }
        },
        estimatedTime: DataTypes.STRING,
        materialsNeeded: DataTypes.STRING
    }, { sequelize } );


  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: 'student', 
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  };
  return Course;
};
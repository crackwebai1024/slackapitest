"use strict";

const AWS = require("aws-sdk");
const { v1: uuidv1 } = require("uuid");

const getInvalidRequestError = (message) => {
  const response = {
    statusCode: 403,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: "Invalid" + message,
    }),
  };
  return response;
};

const getSuccessResponse = () => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      message: "successfully saved",
    }),
  };
  return response;
};

const getInternalServerError = () => {
  const response = {
    statusCode: 500,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: "Internal Server Error",
    }),
  };
  return response;
};

module.exports.handler = async (event, context, callback) => {
  const validator = (firstName, lastName) => {
    if (!firstName) {
      let res = getInvalidRequestError("firstName");
      context.fail(JSON.stringify(res));
    }
    if (!lastName) {
      let res = getInvalidRequestError("lastName");
      context.fail(JSON.stringify(res));
    }
  };

  AWS.config.update({ region: "us-east-1" });
  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  const requestBody = JSON.parse(event.body);
  const { firstName, lastName } = requestBody;
  validator(firstName, lastName);

  let user_id = uuidv1();
  let params = {
    TableName: "logindata",
    Item: {
      user_id: { S: user_id },
      firstName: { S: firstName },
      lastName: { S: lastName },
    },
  };

  let data = [];
  try {
    data = await ddb.putItem(params).promise();
    callback(null, getSuccessResponse());
  } catch (err) {
    console.log(err);
    let res = getInternalServerError();
    context.fail(JSON.stringify(res));
  }
};

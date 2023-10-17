const fs = require('fs');
const { S3 } = require("@aws-sdk/client-s3");
const uuid = require('uuid');

const region = "eu-west-1";
// Fill in your bucket name and local file name:
const BUCKET_NAME = 'cretair-public'
const FILE_NAME_LOCAL = 'tmp/logo-Copy2.png'
const FILE_NAME_S3 = 'logo-Copy2-s3.png'
const FILE_PERMISSION = 'public-read-write'
const AWS_REGION = "eu-west-1"

// Create S3 service object
s3 = new S3({ region: 'eu-west-1', apiVersion: '2006-03-01' });

// Get file stream
const fileStream = fs.createReadStream(FILE_NAME_LOCAL);

// Upload the file to a specified bucket
const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: FILE_NAME_S3,
    Body: fileStream,
    ACL: FILE_PERMISSION
};

s3.putObject(uploadParams, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log('Successfully uploaded file.');         // successful response
});

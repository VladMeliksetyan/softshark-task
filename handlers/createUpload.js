import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB.DocumentClient();

const BUCKET = process.env.UPLOAD_BUCKET;
const TABLE_NAME = process.env.UPLOADS_TABLE;

export const handler = async (event) => {
  let contentType = "application/octet-stream";
  if (event && event.body) {
    try {
      const body = JSON.parse(event.body);
      if (body && body.contentType) {
        contentType = body.contentType;
      }
    } catch (err) {
      console.warn("Invalid JSON body, using default content type.", err);
    }
  }

  const uploadId = uuidv4();
  const key = `uploads/${uploadId}`;

  const url = s3.getSignedUrl("putObject", {
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    Expires: 300
  });

  await dynamo.put({
    TableName: TABLE_NAME,
    Item: {
      uploadId,
      status: "PENDING",
      createdAt: new Date().toISOString()
    }
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadId,
      uploadUrl: url,
      contentType
    })
  };
};

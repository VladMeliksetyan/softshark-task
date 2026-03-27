import AWS from "aws-sdk";

const s3 = new AWS.S3();
const dynamo = new AWS.DynamoDB.DocumentClient();

const BUCKET = process.env.UPLOAD_BUCKET;
const TABLE_NAME = process.env.UPLOADS_TABLE;

export const handler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    const s3Record = message.Records && message.Records[0];
    if (!s3Record) {
      continue;
    }

    const key = decodeURIComponent(s3Record.s3.object.key.replace(/\+/g, " "));
    const uploadId = key.split("/")[1];
    if (!uploadId) {
      continue;
    }

    const metadata = await s3.headObject({
      Bucket: BUCKET,
      Key: key
    }).promise();

    await dynamo.update({
      TableName: TABLE_NAME,
      Key: { uploadId },
      UpdateExpression: "SET #status = :status, fileKey = :key, fileSize = :size, contentType = :type, processedAt = :time",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": "DONE",
        ":key": key,
        ":size": metadata.ContentLength,
        ":type": metadata.ContentType,
        ":time": new Date().toISOString()
      }
    }).promise();
  }
};

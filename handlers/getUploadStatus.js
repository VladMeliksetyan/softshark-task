import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.UPLOADS_TABLE;

export const handler = async (event) => {
  const uploadId = event.pathParameters && event.pathParameters.uploadId;
  if (!uploadId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "uploadId is required" })
    };
  }

  const result = await dynamo.get({
    TableName: TABLE_NAME,
    Key: { uploadId }
  }).promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Upload not found" })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item)
  };
};

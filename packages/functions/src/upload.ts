import * as uuid from "uuid";
import { Resource } from "sst";
import { Util } from "@trias-transcription-app/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  let data = {
    title: "",
    attachment: "",
    languagecode: "",
    customvocabulary: "",
    emailto: "",
  };

  if (event.body != null) {
    data = JSON.parse(event.body);
  }

  const params = {
    TableName: Resource.Media.name,
    Item: {
      // The attributes of the item to be created
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      mediaId: uuid.v1(), // A unique uuid
      title: data.title, // Parsed from request body
      attachment: data.attachment, // Parsed from request body
      languagecode: data.languagecode, // Parsed from request body
      customvocabulary: data.customvocabulary, // Parsed from request body
      emailto: data.emailto,
      createdAt: Date.now(), // Current Unix timestamp
    },
  };

  await dynamoDb.send(new PutCommand(params));

  return JSON.stringify(params.Item);
});
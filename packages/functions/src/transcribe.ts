import { Resource } from "sst";
import { Util } from "@trias-transcription-app/core/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { StartTranscriptionJobCommand, TranscribeClient } from "@aws-sdk/client-transcribe";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const userId = event.requestContext.authorizer?.iam.cognitoIdentity.identityId;
  var paredUserId = userId;
  paredUserId = paredUserId.substring(paredUserId.indexOf(":")+1);
  console.log(userId);
  const ddbparams = {
    TableName: Resource.Media.name,
    // 'Key' defines the partition key and sort key of
    // the item to be retrieved
    Key: {
      userId: userId,
      mediaId: event?.pathParameters?.id, // The id of the note from the path
    },
  };

  const jobitem = await dynamoDb.send(new GetCommand(ddbparams));
  if (!jobitem.Item) {
    throw new Error("Item not found.");
  }

  const BucketName = Resource.Uploads.name

  const jobName = [
    paredUserId,
    jobitem.Item.mediaId
  ].join('_')

  console.log(jobName)

  const transcribeClient = new TranscribeClient({ region: "ap-northeast-1" })

  if (jobitem.Item.speakernumber>=2) {
    const params = {
      TranscriptionJobName: jobName,
      LanguageCode: jobitem.Item.languagecode,
      Media: {
          MediaFileUri: `s3://${BucketName}/public/${jobitem.Item.attachment}`,
      },
      OutputBucketName: BucketName,
      OutputKey: 'transcriptions/',
      Settings: {
        ShowSpeakerLabels: true,
        MaxSpeakerLabels: +(jobitem.Item.speakernumber), // TODO!! will need to add to dynamodb entry
      },
    }
    const result = await transcribeClient.send(
      new StartTranscriptionJobCommand(params),
    );
    // Return the retrieved item
    return JSON.stringify(result);
  } else {
    const params = {
      TranscriptionJobName: jobName,
      LanguageCode: jobitem.Item.languagecode,
      Media: {
          MediaFileUri: `s3://${BucketName}/public/${jobitem.Item.attachment}`,
      },
      OutputBucketName: BucketName,
      OutputKey: 'transcriptions/',
    }
    const result = await transcribeClient.send(
      new StartTranscriptionJobCommand(params),
    );
    // Return the retrieved item
    return JSON.stringify(result);
  }
});
export const inbucket = new sst.aws.Bucket("Uploads");

export const table = new sst.aws.Dynamo("Media", {
    fields: {
        userId: "string",
        mediaId: "string",
    },
    primaryIndex: { hashKey: "userId", rangeKey: "mediaId" },
});
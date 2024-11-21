export const inbucket = new sst.aws.Bucket("Uploads");

export const outbucket = new sst.aws.Bucket("Transcriptions");

export const reformatbucket = new sst.aws.Bucket("Reformats");

export const table = new sst.aws.Dynamo("Media", {
    fields: {
        userId: "string",
        mediaId: "string",
    },
    primaryIndex: { hashKey: "userId", rangeKey: "mediaId" },
});

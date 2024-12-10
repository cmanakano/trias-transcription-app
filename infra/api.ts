import { table, inbucket } from "./storage";

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
  transform: {
    route: {
      handler: {
        link: [table, inbucket],
      },
      args: {
        auth: { iam: true }
      },
    }
  }
});

api.route("GET /media", "packages/functions/src/list.main");
api.route("POST /media", "packages/functions/src/upload.main");
api.route("GET /media/{id}", "packages/functions/src/get.main");
api.route("POST /media/{id}", {
  handler: "packages/functions/src/transcribe.main",
  permissions: [{
    actions: ["transcribe:*"],
    resources: ["*"]
  }]
});
api.route("PUT /media/{id}", "packages/functions/src/update.main");
api.route("DELETE /media/{id}", "packages/functions/src/delete.main");
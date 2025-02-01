/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ai-chatbot",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const mongoUri = new sst.Secret("MongoUri");
    const openAiApiKey = new sst.Secret("OpenAiApiKey");
    const bucket = new sst.aws.Bucket("Images", {
      public: true,
    });

    const auth = new sst.aws.Auth("Auth", {
      authorizer: "packages/web/auth/index.handler",
    });

    new sst.aws.Nextjs("ChatbotWeb", {
      path: "packages/web",
      link: [openAiApiKey, bucket, mongoUri, auth],
    });
  },
});

import "dotenv/config";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import Fastify from "fastify";
const fastify = Fastify({ logger: true });

const S3_ENDPOINT = process.env.S3_ENDPOINT!;
const S3_BUCKET = process.env.S3_BUCKET!;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID!;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY!;
const SERVICE_KEY = process.env.SERVICE_KEY!;

const S3 = new S3Client({
  region: "auto",
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

interface UploadHeaders {
  "content-type": string;
  "service-key": string;
}

interface DeleteHeaders {
  "service-key": string;
}

fastify.put<{ Headers: UploadHeaders }>("/*", async (request, reply) => {
  const path = (request.params as { "*": string })["*"];
  const { "content-type": contentType, "service-key": serviceKey } = request.headers;

  if (serviceKey !== SERVICE_KEY) {
    reply.status(403).send({ message: "Invalid service key" });
    return;
  }

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: path,
    Body: request.body as any,
    ContentType: contentType,
  });

  await S3.send(command);
  reply.status(200).send({ message: "OK" });
});

fastify.delete<{ Headers: DeleteHeaders }>("/*", async (request, reply) => {
  const path = (request.params as { "*": string })["*"];
  const { "service-key": serviceKey } = request.headers;

  if (serviceKey !== SERVICE_KEY) {
    reply.status(403).send({ message: "Invalid service key" });
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: path,
  });

  await S3.send(command);
  reply.status(200).send({ message: "OK" });
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});

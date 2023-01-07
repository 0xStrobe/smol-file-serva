import "dotenv/config";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import http from "http";

const hostname = "0.0.0.0";
const port = 3000;

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

const server = http.createServer();

server.on("request", (request, response) => {
  const headers = request.headers;
  // const url = new URL(request.url!);
  // const pathname = url.pathname;
  const pathname = request.url!;
  console.log(pathname);

  let body = "";

  if (headers["service-key"] !== SERVICE_KEY) {
    response.statusCode = 403;
    response.end();
    return;
  }

  request.on("error", (error) => {
    console.error(error);

    response.statusCode = 500;
    response.end();
  });

  if (request.method === "PUT") {
    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", async () => {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: pathname,
        Body: body,
        ContentType: headers["content-type"] as string,
      });
      const sent = await S3.send(command);
      console.log(sent);
      response.statusCode = 200;
      response.end();
    });
  } else if (request.method === "DELETE") {
    request.on("end", async () => {
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: pathname,
      });
      const sent = await S3.send(command);
      console.log(sent);
      response.statusCode = 200;
      response.end();
    });
  } else {
    response.statusCode = 405;
    response.end();
  }
});

server.on("error", (error) => {
  console.error(error);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

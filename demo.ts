import "dotenv/config";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const S3_ENDPOINT = process.env.S3_ENDPOINT!;
const S3_BUCKET = process.env.S3_BUCKET!;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID!;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY!;

const S3 = new S3Client({
  region: "auto",
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
});

const getObjectMetadata = async (key: string) => {
  const command = new HeadObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });
  const data = await S3.send(command);
  return data;
};

const main = async () => {
  // TODO:
  const data = await getObjectMetadata("strobie.jpg");
  console.log(data);
};

main();

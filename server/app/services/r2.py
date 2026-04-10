import asyncio
import uuid
from functools import partial

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings


class R2Service:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            self._client = boto3.client(
                "s3",
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name="auto",
            )
        return self._client

    async def upload(self, contents: bytes, filename: str, user_id: str) -> str:
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        key = f"{user_id}/{uuid.uuid4()}.{ext}"
        client = self._get_client()
        size = len(contents)

        loop = asyncio.get_event_loop()

        if size > 10 * 1024 * 1024:
            # Multipart upload
            mpu = await loop.run_in_executor(
                None,
                partial(
                    client.create_multipart_upload,
                    Bucket=settings.R2_BUCKET_NAME,
                    Key=key,
                    ContentType="application/pdf",
                ),
            )
            upload_id = mpu["UploadId"]
            chunk_size = 10 * 1024 * 1024
            parts = []
            for i, start in enumerate(range(0, size, chunk_size), 1):
                chunk = contents[start : start + chunk_size]
                resp = await loop.run_in_executor(
                    None,
                    partial(
                        client.upload_part,
                        Bucket=settings.R2_BUCKET_NAME,
                        Key=key,
                        UploadId=upload_id,
                        PartNumber=i,
                        Body=chunk,
                    ),
                )
                parts.append({"PartNumber": i, "ETag": resp["ETag"]})
            await loop.run_in_executor(
                None,
                partial(
                    client.complete_multipart_upload,
                    Bucket=settings.R2_BUCKET_NAME,
                    Key=key,
                    UploadId=upload_id,
                    MultipartUpload={"Parts": parts},
                ),
            )
        else:
            import io
            await loop.run_in_executor(
                None,
                partial(
                    client.upload_fileobj,
                    io.BytesIO(contents),
                    settings.R2_BUCKET_NAME,
                    key,
                    ExtraArgs={"ContentType": "application/pdf"},
                ),
            )
        return key

    async def get_signed_url(self, key: str, expires: int = 3600) -> str:
        client = self._get_client()
        loop = asyncio.get_event_loop()
        url = await loop.run_in_executor(
            None,
            partial(
                client.generate_presigned_url,
                "get_object",
                Params={"Bucket": settings.R2_BUCKET_NAME, "Key": key},
                ExpiresIn=expires,
            ),
        )
        return url

    async def delete(self, key: str) -> None:
        client = self._get_client()
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            partial(client.delete_object, Bucket=settings.R2_BUCKET_NAME, Key=key),
        )


r2_service = R2Service()

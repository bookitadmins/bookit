import os
import io
from typing import Optional
from uuid import uuid4

from minio import Minio
from minio.error import S3Error

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minio_admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minio_secure_password")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
BUCKET_CANTEENS = os.getenv("MINIO_BUCKET_CANTEENS", "canteen-images")
BUCKET_MENU = os.getenv("MINIO_BUCKET_MENU", "menu-images")

_client: Optional[Minio] = None


def get_minio_client() -> Minio:
    global _client
    if _client is None:
        _client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE,
        )
    return _client


def ensure_buckets():
    client = get_minio_client()
    for bucket in [BUCKET_CANTEENS, BUCKET_MENU]:
        try:
            if not client.bucket_exists(bucket):
                client.make_bucket(bucket)
                # Set public read policy
                import json
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": ["*"]},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{bucket}/*"],
                        }
                    ],
                }
                client.set_bucket_policy(bucket, json.dumps(policy))
        except S3Error as e:
            print(f"MinIO bucket setup warning: {e}")


def upload_file(
    bucket: str,
    data: bytes,
    content_type: str,
    prefix: str = "",
) -> str:
    """Upload bytes to MinIO and return the public URL."""
    client = get_minio_client()
    ext = content_type.split("/")[-1]
    object_name = f"{prefix}/{uuid4()}.{ext}" if prefix else f"{uuid4()}.{ext}"
    client.put_object(
        bucket,
        object_name,
        data=io.BytesIO(data),
        length=len(data),
        content_type=content_type,
    )
    scheme = "https" if MINIO_SECURE else "http"
    return f"{scheme}://{MINIO_ENDPOINT}/{bucket}/{object_name}"

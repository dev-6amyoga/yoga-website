import sys
import gzip

import io

# import cloudflare
import json

import boto3

config = json.load(open("config.json"))


s3_client = boto3.client(
    service_name="s3",
    endpoint_url=config["r2"]["endpoint"],
    aws_access_key_id=config["r2"]["access_key_id"],
    aws_secret_access_key=config["r2"]["secret_access_key"],
    region_name="apac",
)


def upload_to_r2(filename, file_data, bucket_dir: str) -> bool:
    # if inp_file == None or bucket_dir == None:
    #     return "Invalid input. Exiting."
    print("Uploading to R2", filename)

    try:

        if file_data is None:
            return "Invalid input. Exiting."

        print("Uploading to R2")

        s3_client.upload_fileobj(io.BytesIO(file_data), bucket_dir, filename)

    except Exception as e:
        raise e

    # p = subprocess.run(["rclone", "copy", {inp_file}, f"r2:{R2_BUCKET}/{bucket_dir}"])

    # if p.returncode == 0:
    #     log(SCRIPT, "Upload successful")
    # else:
    #     log(SCRIPT, "Upload failed")

    # return p.returncode == 0


if __name__ == "__main__":
    try:
        filename = sys.argv[1]
        compressed = sys.argv[2].lower() == "true"

        print("before file read")

        file_data = sys.stdin.buffer.read()

        print("after file read")

        if compressed and file_data:
            file_data = gzip.decompress(file_data)

        upload_to_r2(filename, file_data, config["r2"]["bucket"])
    except Exception as e:
        print(e)
        raise e

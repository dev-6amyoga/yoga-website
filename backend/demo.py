import sys
import gzip
# import io
# import cloudflare
import json

import boto3
config = json.load(open("config.json"))


s3_client = boto3.client(
    service_name ="s3",
    endpoint_url = config["r2"]["endpoint"],
    aws_access_key_id = config["r2"]["secret_access_key"],
    aws_secret_access_key = config["r2"]["access_key"],
    region_name="apac",
)


def upload_file(inp_file: str, bucket_dir: str) -> bool:
    # if inp_file == None or bucket_dir == None:
    #     return "Invalid input. Exiting."
    
    if inp_file == "" or bucket_dir == "":
        return "Invalid input. Exiting."
        
    print("Uploading to R2")

    s3_client.upload_file(inp_file, bucket_dir, inp_file)


    # p = subprocess.run(["rclone", "copy", {inp_file}, f"r2:{R2_BUCKET}/{bucket_dir}"])

    # if p.returncode == 0:
    #     log(SCRIPT, "Upload successful")
    # else:
    #     log(SCRIPT, "Upload failed")

    # return p.returncode == 0



def upload_to_r2(filename, file_data):
    # Replace with your Cloudflare R2 upload logic
    print("from python", filename)
    upload_file(filename, config["r2"]["bucket"])

if __name__ == "__main__":
    filename = sys.argv[1]
    compressed = sys.argv[2].lower() == 'true'
    
    file_data = sys.stdin.buffer.read()

    if compressed:
        file_data = gzip.decompress(file_data)

    upload_to_r2(filename, file_data)

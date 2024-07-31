import sys
import gzip
# import io
# import cloudflare

def upload_to_r2(filename, file_data):
    # Replace with your Cloudflare R2 upload logic
    print("from python", filename)
    pass

if __name__ == "__main__":
    filename = sys.argv[1]
    compressed = sys.argv[2].lower() == 'true'
    
    file_data = sys.stdin.buffer.read()

    if compressed:
        file_data = gzip.decompress(file_data)

    upload_to_r2(filename, file_data)

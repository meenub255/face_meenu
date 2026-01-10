import requests
import bz2
import os

URL = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
FILE_NAME = "backend/app/shape_predictor_68_face_landmarks.dat"

def download_and_extract():
    print(f"Downloading {URL}...")
    response = requests.get(URL, stream=True)
    if response.status_code == 200:
        with open("temp_landmarks.dat.bz2", 'wb') as f:
            for chunk in response.iter_content(chunk_size=1024):
                f.write(chunk)
        
        print("Extracting...")
        with bz2.BZ2File("temp_landmarks.dat.bz2") as fr, open(FILE_NAME, "wb") as fw:
            fw.write(fr.read())
            
        os.remove("temp_landmarks.dat.bz2")
        print(f"Saved to {FILE_NAME}")
    else:
        print("Failed to download model.")

if __name__ == "__main__":
    download_and_extract()

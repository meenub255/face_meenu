import requests
import numpy as np
from PIL import Image, ImageDraw
import io

def create_dummy_image(filename="test_face.jpg"):
    # Create a dummy image using PIL
    img = Image.new('RGB', (300, 300), color = (200, 200, 200))
    d = ImageDraw.Draw(img)
    # Draw simple "face" features just so it's not empty, 
    # but MTCNN definitely won't detect this as a face.
    d.rectangle([(100, 100), (200, 200)], fill=(255, 200, 200))
    img.save(filename)
    return filename

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Create dummy image
    filename = create_dummy_image()
    
    print("Testing Registration with 3 images...")
    try:
        data = {"name": "TestUser"}
        # Send 3 identical images (simulating 3 captures)
        files = [
            ('files', ('img1.jpg', open(filename, 'rb'), 'image/jpeg')),
            ('files', ('img2.jpg', open(filename, 'rb'), 'image/jpeg')),
            ('files', ('img3.jpg', open(filename, 'rb'), 'image/jpeg'))
        ]
        
        response = requests.post(f"{base_url}/register", data=data, files=files)
        print(f"Register Status: {response.status_code}")
        print(f"Register Response: {response.json()}")
        
        # Note: We expect 400 Bad Request because MTCNN won't find a face in our dummy drawing.
        if response.status_code == 400 and "No face detected" in response.text:
            print(">> Correctly rejected image with no face.")
            
    except Exception as e:
        print(f"Connection failed: {e}")

    # 2. Test Recognition
    print("\nTesting Recognition...")
    try:
        with open(filename, "rb") as f:
            response = requests.post(f"{base_url}/recognize", files={"file": f})
        print(f"Recognize Status: {response.status_code}")
        print(f"Recognize Response: {response.json()}")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_api()

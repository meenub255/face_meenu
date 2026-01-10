from facenet_pytorch import MTCNN
from PIL import Image
import numpy as np
from typing import List, Tuple, Union

class FaceDetector:
    def __init__(self):
        # Initialize MTCNN
        # keep_all=True allows detecting multiple faces
        # device could be cuda if available, defaulting to cpu for safety
        self.mtcnn = MTCNN(keep_all=True, device='cpu', post_process=False)

    def detect_faces(self, image: Image.Image) -> List[Tuple[int, int, int, int]]:
        """
        Detects faces in a PIL Image.
        Returns a list of bounding boxes (x, y, x2, y2).
        Note: MTCNN returns [x1, y1, x2, y2], usually with floats.
        We will convert to int and return standard boxes.
        """
        if not isinstance(image, Image.Image):
             # Try to convert if it's not PIL (though we aim for PIL only)
             pass 

        boxes, _ = self.mtcnn.detect(image)
        
        results = []
        if boxes is not None:
            for box in boxes:
                results.append(tuple(map(int, box)))
        return results

    def get_cropped_face(self, image: Image.Image, bbox: Tuple[int, int, int, int]) -> Image.Image:
        """
        Crops the face from the PIL Image using bbox (x1, y1, x2, y2)
        """
        return image.crop(bbox)

    def detect_landmarks(self, image: Image.Image):
        """
        Returns landmarks (leyes, reyes, nose, mouth_l, mouth_r)
        """
        boxes, probs, landmarks = self.mtcnn.detect(image, landmarks=True)
        return landmarks


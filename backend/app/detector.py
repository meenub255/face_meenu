from facenet_pytorch import MTCNN
from PIL import Image
import numpy as np
from typing import List, Tuple, Union
from skimage import transform as trans

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
        Returns landmarks (leyes, reyes, nose, mouth_l, mouth_r) using MTCNN
        """
        boxes, probs, landmarks = self.mtcnn.detect(image, landmarks=True)
        return landmarks

    def align_face(self, image: Image.Image, landmarks: np.ndarray) -> Image.Image:
        """
        Aligns and crops face based on 68 dlib landmarks.
        landmarks: np.array of shape (68, 2)
        Returns: PIL Image of size (112, 112)
        """
        if landmarks is None or len(landmarks) < 68:
            return None

        # Standard eye positions for 112x112 alignment
        # Based on ArcFace/InsightFace defaults
        dst = np.array([
            [38.2946, 51.6963], # Left Eye
            [73.5318, 51.5014], # Right Eye
            [56.0252, 71.7366], # Nose
            [41.5493, 92.3655], # Mouth Left
            [70.7299, 92.2041]  # Mouth Right
        ], dtype=np.float32)

        # Map Dlib 68 landmarks to these 5 points
        # Left Eye: avg of (36 to 41)
        # Right Eye: avg of (42 to 47)
        # Nose Tip: 30
        # Mouth Left: 48
        # Mouth Right: 54
        
        src = np.array([
            np.mean(landmarks[36:42], axis=0),
            np.mean(landmarks[42:48], axis=0),
            landmarks[30],
            landmarks[48],
            landmarks[54]
        ], dtype=np.float32)

        tform = trans.SimilarityTransform()
        tform.estimate(src, dst)
        M = tform.params[0:2, :]
        
        # We need to apply warp to the image
        img_np = np.array(image)
        warped = trans.warp(img_np, tform.inverse, output_shape=(112, 112))
        
        # trans.warp returns floats in range [0, 1], convert back to [0, 255] uint8
        warped = (warped * 255).astype(np.uint8)
        
        return Image.fromarray(warped)


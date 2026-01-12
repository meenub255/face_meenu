import dlib
import numpy as np
from PIL import Image
import os

class AntiSpoofing:
    def __init__(self):
        # Dlib Face Detector
        self.detector = dlib.get_frontal_face_detector()
        
        # Dlib Landmark Predictor
        model_path = os.path.join(os.path.dirname(__file__), "shape_predictor_68_face_landmarks.dat")
        if not os.path.exists(model_path):
             print(f"WARNING: Dlib model not found at {model_path}")
             self.predictor = None
        else:
             self.predictor = dlib.shape_predictor(model_path)

        # EAR Thresholds
        self.EAR_THRESHOLD = 0.30 # Increased to make blink detection easier

    def calculate_ear(self, landmarks, indices):
        """
        Calculates Eye Aspect Ratio using Dlib points.
        indices: list of 6 points.
        """
        # Vertical distances
        A = np.linalg.norm(landmarks[indices[1]] - landmarks[indices[5]])
        B = np.linalg.norm(landmarks[indices[2]] - landmarks[indices[4]])
        
        # Horizontal distance
        C = np.linalg.norm(landmarks[indices[0]] - landmarks[indices[3]])
        
        if C == 0: return 0.0
        ear = (A + B) / (2.0 * C)
        return ear

    def check_eye_blink(self, image: Image.Image) -> dict:
        """
        Detects faces and blink using Dlib.
        Returns { "blink": bool, "ear": float }
        """
        if self.predictor is None:
            return { "blink": False, "ear": 0.0, "error": "Model not loaded" }

        # Convert PIL to numpy (Grayscale is fine for Dlib)
        img_np = np.array(image.convert('RGB'))
        gray = np.array(image.convert('L'))
        
        rects = self.detector(gray, 0)
        
        if len(rects) == 0:
            return { "blink": False, "ear": 0.0, "error": "No face detected" }
            
        # Get landmarks for the first face
        shape = self.predictor(gray, rects[0])
        
        # Convert shape to numpy list
        # Dlib points are 0-indexed. 
        # Left Eye: 36, 37, 38, 39, 40, 41
        # Right Eye: 42, 43, 44, 45, 46, 47
        
        def to_np(i):
            p = shape.part(i)
            return np.array([p.x, p.y])

        landmarks = [to_np(i) for i in range(68)]
        landmarks = np.array(landmarks)

        LEFT_EYE = [36, 37, 38, 39, 40, 41]
        RIGHT_EYE = [42, 43, 44, 45, 46, 47]
        
        left_ear = self.calculate_ear(landmarks, LEFT_EYE)
        right_ear = self.calculate_ear(landmarks, RIGHT_EYE)
        
        avg_ear = (left_ear + right_ear) / 2.0
        
        is_blink = avg_ear < self.EAR_THRESHOLD
        print(f"DEBUG: EAR={avg_ear:.3f}, Threshold={self.EAR_THRESHOLD}, Blink={is_blink}")
        
        return {
            "blink": bool(is_blink),
            "ear": float(avg_ear),
            "left_ear": float(left_ear),
            "right_ear": float(right_ear)
        }

    def get_landmarks(self, image: Image.Image) -> np.ndarray:
        """
        Returns 68 face landmarks as numpy array.
        """
        if self.predictor is None:
            return None
            
        gray = np.array(image.convert('L'))
        rects = self.detector(gray, 0)
        
        if len(rects) == 0:
            return None
            
        shape = self.predictor(gray, rects[0])
        
        def to_np(i):
            p = shape.part(i)
            return np.array([p.x, p.y])

        landmarks = [to_np(i) for i in range(68)]
        return np.array(landmarks)

    def check_texture_lbp(self, image: Image.Image):
         return True, 1.0, "LBP Bypassed"

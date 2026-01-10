import torch
import torchvision.transforms as transforms
import numpy as np
from PIL import Image
from typing import Union
import ssl

# Bypass SSL verification for torch.hub
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

class EdgeFaceWrapper:
    def __init__(self, device='cpu'):
        self.device = torch.device(device)
        self.model = torch.hub.load('otroshi/edgeface', 'edgeface_s_gamma_05', pretrained=True, trust_repo=True)
        self.model.to(self.device)
        self.model.eval()
        
        # Standard transformations for face recognition models (often 112x112)
        # EdgeFace expects [3, 112, 112] input, range [-1, 1] usually or [0, 1] normalized
        # Based on typical ArcFace/InsightFace pipelines:
        self.transform = transforms.Compose([
            transforms.Resize((112, 112)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
        ])

    def get_embedding(self, face_image: Union[np.ndarray, Image.Image]) -> np.ndarray:
        """
        Takes a cropped face image (PIL Image or numpy).
        Returns the 512-d embedding as a numpy array.
        """
        # Ensure PIL
        if isinstance(face_image, np.ndarray):
             img = Image.fromarray(face_image)
        elif isinstance(face_image, Image.Image):
             img = face_image
        else:
             raise ValueError("Unsupported image type")

        # Transform
        # We might need to handle RGB/L conversion if model expects it, but usually RGB is fine.
        input_tensor = self.transform(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.model(input_tensor)
            
        return embedding.cpu().numpy().flatten()

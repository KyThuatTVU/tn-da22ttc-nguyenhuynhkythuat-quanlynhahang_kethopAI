#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test script to verify face recognition models can be loaded
"""
import cv2
import os
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

YUNET_PATH = os.path.join(MODELS_DIR, 'face_detection_yunet_2023mar.onnx')
SFACE_PATH = os.path.join(MODELS_DIR, 'face_recognition_sface_2021dec.onnx')

print(f"OpenCV version: {cv2.__version__}")
print(f"YuNet path: {YUNET_PATH}")
print(f"SFace path: {SFACE_PATH}")
print(f"YuNet exists: {os.path.exists(YUNET_PATH)}")
print(f"SFace exists: {os.path.exists(SFACE_PATH)}")

try:
    print("\nLoading YuNet detector...")
    detector = cv2.FaceDetectorYN.create(
        YUNET_PATH, "", (320, 320), 0.9, 0.3, 5000
    )
    print("SUCCESS: YuNet loaded successfully!")
except Exception as e:
    print(f"ERROR: Failed to load YuNet: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

try:
    print("\nLoading SFace recognizer...")
    recognizer = cv2.FaceRecognizerSF.create(
        SFACE_PATH, ""
    )
    print("SUCCESS: SFace loaded successfully!")
except Exception as e:
    print(f"ERROR: Failed to load SFace: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\nSUCCESS: All face recognition models loaded successfully!")
print("Face recognition system is ready to use.")

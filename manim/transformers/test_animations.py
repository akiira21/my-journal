#!/usr/bin/env python3
"""
Test script for Transformer Manim animations
"""

import sys
import os

def test_imports():
    """Test if all modules can be imported without errors"""
    try:
        from transformer import TransformerArchitecture
        print("✓ TransformerArchitecture imported successfully")
        
        from transformer_detailed import DetailedTransformerFlow
        print("✓ DetailedTransformerFlow imported successfully")
        
        import manim
        print("✓ Manim imported successfully")
        
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

def print_usage():
    """Print usage instructions"""
    print("\n" + "="*60)
    print("TRANSFORMER MANIM ANIMATIONS")
    print("="*60)
    print("\nTo render the animations, use these commands:")
    print("\n1. Basic Transformer Architecture:")
    print("   manim -pql transformer.py TransformerArchitecture")
    print("\n2. Detailed Transformer Flow:")
    print("   manim -pql transformer_detailed.py DetailedTransformerFlow")
    print("\n3. High Quality Render:")
    print("   manim -pqh transformer.py TransformerArchitecture")
    print("\nFlags explanation:")
    print("  -p : Preview (automatically open the video)")
    print("  -q : Quality (l=low, m=medium, h=high)")
    print("="*60)

if __name__ == "__main__":
    print("Testing Transformer Manim Animations...")
    
    if test_imports():
        print("\n✓ All tests passed!")
        print_usage()
    else:
        print("\n✗ Tests failed!")
        sys.exit(1)

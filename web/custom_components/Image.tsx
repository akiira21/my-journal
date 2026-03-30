"use client";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, MotionConfig } from "framer-motion";
import { useId, useState } from "react";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

const LightboxImage = (props: ImageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const uniqueId = useId();

  if (!props.width) {
    props.width = 800;
  }

  if (!props.height) {
    props.height = 600;
  }

  const handleDialogClose = () => setIsDialogOpen(false);

  const handlePressEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsDialogOpen(true);
    }
  };

  return (
    <MotionConfig
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div
          style={{
            margin: "0",
            width: "100%",
            maxWidth: `min(${props.width}px, 100%)`,
            maxHeight: `min(${props.height}px, 100vh)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Dialog.Trigger asChild>
            <motion.div
              layoutId={`dialog-${uniqueId}`}
              onKeyDown={handlePressEnter}
              whileTap={{ scale: 0.95 }}
              role="button"
              tabIndex={0}
              style={{ cursor: "zoom-in", width: "100%" }}
            >
              <Image
                {...props}
                style={{
                  borderRadius: "8px",
                  width: "100%",
                  height: "auto",
                  maxWidth: `min(${props.width}px, 100%)`,
                  maxHeight: `min(${props.height}px, 100vh)`,
                  objectFit: "cover",
                }}
              />
            </motion.div>
          </Dialog.Trigger>
          <figcaption
            style={{
              lineHeight: "1.5",
              paddingTop: "10px",
            }}
            className="text-sm text-gray-500 text-center text-medium w-full"
          >
            {props.caption}
          </figcaption>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 1000,
            }}
          />
          <Dialog.Content
            asChild
            onClick={handleDialogClose}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1010,
              padding: "16px",
              cursor: "pointer", // Added cursor pointer to indicate clickable area
            }}
          >
            <motion.div>
              <motion.div
                layoutId={`dialog-${uniqueId}`}
                role="button"
                whileTap={{ scale: 0.98 }}
                style={{
                  outline: "none",
                  cursor: "default",
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent background click from triggering
                }}
              >
                <Image
                  {...props}
                  style={{
                    borderRadius: "8px",
                    width: "auto",
                    height: "auto",
                    maxWidth: "min(90vw, 1200px)",
                    maxHeight: "min(80vh, 800px)",
                    objectFit: "contain",
                  }}
                />
              </motion.div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </MotionConfig>
  );
};

export default LightboxImage;

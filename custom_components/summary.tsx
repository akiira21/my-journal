"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleSummaryProps {
  summary: string;
  content: string | React.ReactNode;
}

const CollapsibleSummary = ({ summary, content }: CollapsibleSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-2xl">
      <motion.div className="rounded-lg py-4 shadow-sm border" initial={false}>
        <div className="relative flex justify-between items-center text-sm font-medium px-4">
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-full bg-gradient-to-r from-[#4A72F4] to-transparent flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.div
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="ml-1 shadow-[0_0_15px_6px_rgba(74,114,244,0.50)]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-gray-700 ml-2">{summary}</div>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-centerhover:text-gray-700 transition-colors"
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div className="bg-[#4A72F4] text-white rounded-full w-9 h-9 flex items-center justify-center p-2 hover:bg-[#406cdb]">
              <Plus size={20} />
            </motion.div>
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 text-neutral-600 font-medium text-sm max-w-xl">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CollapsibleSummary;

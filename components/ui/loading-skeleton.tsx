"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <motion.div
      className={cn("rounded-md bg-gray-800/50", className)}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}; 
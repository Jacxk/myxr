"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ModalContent = {
  title: ReactNode | string;
  body?: ReactNode | string;
  description?: ReactNode | string;
  footer?: ReactNode | string;
  closeButton?: boolean;
  authOnly?: boolean;
};

type ModalContextProps = {
  openModal: (content: ModalContent) => void;
  updateModal: (updatedContent: Partial<ModalContent>) => void;
  closeModal: () => void;
  isOpen: boolean;
  content: ModalContent | null;
};

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ModalContent | null>(null);

  const openModal = (newContent: ModalContent) => {
    setContent(newContent);
    setIsOpen(true);
  };

  const updateModal = (updatedContent: Partial<ModalContent>) => {
    setContent((prevContent) =>
      prevContent ? { ...prevContent, ...updatedContent } : prevContent,
    );
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContent(null); // Clear content after modal closes
    }, 500); // Match the closing animation duration
  };

  const value: ModalContextProps = useMemo(
    () => ({
      openModal,
      updateModal,
      closeModal,
      isOpen,
      content,
    }),
    [isOpen, content],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

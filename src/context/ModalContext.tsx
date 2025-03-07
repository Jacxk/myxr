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
};

type ModalContextProps = {
  isOpen: boolean;
  content: ModalContent | null;
  closeButton: boolean;
  setIsOpen: (value: boolean) => void;
  setContent: (content: ModalContent) => void;
  openModal: (content?: ModalContent) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ModalContent | null>(null);
  const [contentTimeout, setContentTimeout] = useState<NodeJS.Timeout | null>(null);

  const openModal = (newContent?: ModalContent) => {
    if (!newContent && !content)
      throw new Error(
        "There's no content to display. Provide a content to openModal() or use setContent()",
      );
    if (newContent) setContent(newContent);
    setIsOpen(true);
    if (contentTimeout) {
      clearTimeout(contentTimeout);
      setContentTimeout(null);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setContentTimeout(
      setTimeout(() => {
        setContent(null);
      }, 500),
    );
  };

  const value: ModalContextProps = useMemo(
    () => ({
      isOpen,
      content,
      openModal,
      closeModal,
      setContent,
      setIsOpen,
      closeButton: true,
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

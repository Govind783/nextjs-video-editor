import { X } from "lucide-react";
import React, { createContext, useContext } from "react";

const DrawerContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
});

export const Drawer = ({ children, direction = "right", className = "", isOpen, setIsOpen }) => {
  return <DrawerContext.Provider value={{ isOpen, setIsOpen }}>{children}</DrawerContext.Provider>;
};

export const DrawerContent = ({ children, className = "" }) => {
  const { isOpen, setIsOpen } = useContext(DrawerContext);  

  return (
    <div
    className={`fixed -right-[1.85rem] top-[-21.6rem] h-screen w-[31rem] bg-black 
      transition-transform duration-300 ease-in-out 
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex w-full pt-1 justify-end">
        <X className="absolute cursor-pointer" onClick={() => setIsOpen(false)} />
      </div>
      {children}
    </div>
  );
};

export const DrawerTrigger = ({ children, asChild }) => {
  const { setIsOpen } = useContext(DrawerContext);

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => {
        setIsOpen((prev) => !prev);
        children.props.onClick?.();
      },
    });
  }

  return <button onClick={() => setIsOpen((prev) => !prev)}>{children}</button>;
};

export const DrawerHeader = ({ children, className = "" }) => {
  return <div className={`p-4 space-y-2 ${className}`}>{children}</div>;
};

export const DrawerTitle = ({ children, className = "" }) => {
  return <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;
};

export const DrawerDescription = ({ children, className = "" }) => {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
};

export const DrawerFooter = ({ children, className = "" }) => {
  return <div className={`flex flex-col gap-2 p-4 pt-0 ${className}`}>{children}</div>;
};

export const DrawerClose = ({ children, asChild }) => {
  const { setIsOpen } = useContext(DrawerContext);

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => {
        setIsOpen(false);
        children.props.onClick?.();
      },
    });
  }

  return <button onClick={() => setIsOpen(false)}>{children}</button>;
};

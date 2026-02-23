import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedActionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedAction: React.FC<ProtectedActionProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated } = useAuth();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <div onClick={handleClick}>{children}</div>;
  }

  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    const originalOnClick = child.props.onClick;

    return React.cloneElement(child, {
      ...child.props,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleClick(e);
        if (e.defaultPrevented) return;
        if (typeof originalOnClick === "function") {
          originalOnClick(e);
        }
      },
    });
  }

  return <div onClick={handleClick}>{children}</div>;
};

export default ProtectedAction;
